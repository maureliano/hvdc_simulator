import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Activity, AlertTriangle, Zap, TrendingUp, Power, Gauge } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MonitoringData {
  timestamp: number;
  buses: {
    id: number;
    name: string;
    voltage_pu: number;
    voltage_kv: number;
    status: "normal" | "warning" | "alarm";
  }[];
  transformers: {
    id: number;
    name: string;
    loading_percent: number;
    power_mw: number;
    status: "normal" | "warning" | "alarm";
  }[];
  dcLink: {
    voltage_kv: number;
    current_ka: number;
    power_mw: number;
    status: "normal" | "warning" | "alarm";
  };
  converters: {
    rectifier: {
      power_mw: number;
      efficiency: number;
      status: "normal" | "warning" | "alarm";
    };
    inverter: {
      power_mw: number;
      efficiency: number;
      status: "normal" | "warning" | "alarm";
    };
  };
  system: {
    totalGeneration_mw: number;
    totalLoad_mw: number;
    losses_mw: number;
    efficiency: number;
    status: "normal" | "warning" | "alarm";
  };
  alarms: {
    id: string;
    timestamp: number;
    severity: "info" | "warning" | "critical";
    component: string;
    message: string;
  }[];
}

export default function Supervisory() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [data, setData] = useState<MonitoringData | null>(null);
  const [connected, setConnected] = useState(false);
  const [params, setParams] = useState({
    acVoltage1: 345,
    acVoltage2: 230,
    dcVoltage: 422.84,
    loadPower: 1000,
  });

  useEffect(() => {
    const newSocket = io(window.location.origin, {
      path: "/socket.io/",
    });

    newSocket.on("connect", () => {
      console.log("WebSocket connected");
      setConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("WebSocket disconnected");
      setConnected(false);
    });

    newSocket.on("monitoringData", (newData: MonitoringData) => {
      setData(newData);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const updateParams = () => {
    if (socket) {
      socket.emit("updateParams", params);
    }
  };

  const getStatusColor = (status: "normal" | "warning" | "alarm") => {
    switch (status) {
      case "normal":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "alarm":
        return "bg-red-500";
    }
  };

  const getStatusBadge = (status: "normal" | "warning" | "alarm") => {
    const colors = {
      normal: "bg-green-500/10 text-green-500 border-green-500/20",
      warning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      alarm: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return (
      <Badge variant="outline" className={colors[status]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getSeverityIcon = (severity: "info" | "warning" | "critical") => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Activity className="h-12 w-12 animate-pulse text-blue-500 mx-auto" />
          <p className="text-slate-400">Conectando ao sistema de monitoramento...</p>
          <div className={`w-3 h-3 rounded-full mx-auto ${connected ? "bg-green-500" : "bg-red-500"} animate-pulse`} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Zap className="h-8 w-8 text-blue-500" />
            Dashboard Supervisório HVDC
          </h1>
          <p className="text-slate-400 mt-1">Sistema SCADA - Monitoramento em Tempo Real</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
            <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"} animate-pulse`} />
            <span className="text-sm text-slate-300">{connected ? "Conectado" : "Desconectado"}</span>
          </div>
          <div className="text-sm text-slate-400 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
            {new Date(data.timestamp).toLocaleTimeString("pt-BR")}
          </div>
        </div>
      </div>

      {/* Alarmes Ativos */}
      {data.alarms.length > 0 && (
        <div className="mb-6 space-y-2">
          {data.alarms.slice(0, 3).map((alarm) => (
            <Alert
              key={alarm.id}
              className={`${
                alarm.severity === "critical"
                  ? "bg-red-500/10 border-red-500/20"
                  : "bg-yellow-500/10 border-yellow-500/20"
              }`}
            >
              {getSeverityIcon(alarm.severity)}
              <AlertDescription className="ml-2">
                <span className="font-semibold">{alarm.component}:</span> {alarm.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Power className="h-4 w-4" />
              Geração Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{data.system.totalGeneration_mw.toFixed(1)}</div>
            <p className="text-xs text-slate-400 mt-1">MW</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Carga Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{data.system.totalLoad_mw.toFixed(1)}</div>
            <p className="text-xs text-slate-400 mt-1">MW</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Eficiência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{data.system.efficiency.toFixed(2)}</div>
            <p className="text-xs text-slate-400 mt-1">%</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Perdas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{data.system.losses_mw.toFixed(2)}</div>
            <p className="text-xs text-slate-400 mt-1">MW</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Monitoramento */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="buses">Barramentos</TabsTrigger>
          <TabsTrigger value="transformers">Transformadores</TabsTrigger>
          <TabsTrigger value="converters">Conversores</TabsTrigger>
          <TabsTrigger value="controls">Controles</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Link DC */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Link DC
                  {getStatusBadge(data.dcLink.status)}
                </CardTitle>
                <CardDescription>Transmissão em corrente contínua</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Tensão DC</span>
                  <span className="text-2xl font-bold text-white">{data.dcLink.voltage_kv.toFixed(2)} kV</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Corrente DC</span>
                  <span className="text-2xl font-bold text-white">{data.dcLink.current_ka.toFixed(3)} kA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Potência</span>
                  <span className="text-2xl font-bold text-white">{data.dcLink.power_mw.toFixed(1)} MW</span>
                </div>
              </CardContent>
            </Card>

            {/* Status do Sistema */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Status do Sistema
                  {getStatusBadge(data.system.status)}
                </CardTitle>
                <CardDescription>Indicadores gerais de operação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Eficiência</span>
                    <span className="text-white font-semibold">{data.system.efficiency.toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
                      style={{ width: `${data.system.efficiency}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-xs text-slate-400">Alarmes Ativos</p>
                    <p className="text-2xl font-bold text-white">{data.alarms.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Componentes</p>
                    <p className="text-2xl font-bold text-white">{data.buses.length + data.transformers.length + 2}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Barramentos */}
        <TabsContent value="buses" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.buses.map((bus) => (
              <Card key={bus.id} className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    {bus.name}
                    {getStatusBadge(bus.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-400">Tensão (pu)</span>
                    <span className="text-lg font-bold text-white">{bus.voltage_pu.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-400">Tensão (kV)</span>
                    <span className="text-lg font-bold text-white">{bus.voltage_kv.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(bus.status)} animate-pulse`} />
                    <span className="text-xs text-slate-400">Status: {bus.status}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Transformadores */}
        <TabsContent value="transformers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.transformers.map((trafo) => (
              <Card key={trafo.id} className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {trafo.name}
                    {getStatusBadge(trafo.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Carregamento</span>
                      <span className="text-white font-semibold">{trafo.loading_percent.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          trafo.loading_percent > 100
                            ? "bg-red-500"
                            : trafo.loading_percent > 85
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(trafo.loading_percent, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-400">Potência</span>
                    <span className="text-lg font-bold text-white">{trafo.power_mw.toFixed(1)} MW</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Conversores */}
        <TabsContent value="converters" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Retificador (12-Pulse)
                  {getStatusBadge(data.converters.rectifier.status)}
                </CardTitle>
                <CardDescription>AC → DC</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Potência</span>
                  <span className="text-2xl font-bold text-white">{data.converters.rectifier.power_mw.toFixed(1)} MW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Eficiência</span>
                  <span className="text-2xl font-bold text-white">{data.converters.rectifier.efficiency.toFixed(2)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Inversor (12-Pulse)
                  {getStatusBadge(data.converters.inverter.status)}
                </CardTitle>
                <CardDescription>DC → AC</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Potência</span>
                  <span className="text-2xl font-bold text-white">{data.converters.inverter.power_mw.toFixed(1)} MW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Eficiência</span>
                  <span className="text-2xl font-bold text-white">{data.converters.inverter.efficiency.toFixed(2)}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Controles */}
        <TabsContent value="controls" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle>Parâmetros de Simulação</CardTitle>
              <CardDescription>Ajuste os parâmetros do circuito HVDC</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm text-slate-400">Tensão AC 1 (kV)</label>
                  <span className="text-sm font-semibold text-white">{params.acVoltage1}</span>
                </div>
                <Slider
                  value={[params.acVoltage1]}
                  onValueChange={([value]) => setParams({ ...params, acVoltage1: value })}
                  min={300}
                  max={400}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm text-slate-400">Tensão AC 2 (kV)</label>
                  <span className="text-sm font-semibold text-white">{params.acVoltage2}</span>
                </div>
                <Slider
                  value={[params.acVoltage2]}
                  onValueChange={([value]) => setParams({ ...params, acVoltage2: value })}
                  min={200}
                  max={300}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm text-slate-400">Tensão DC (kV)</label>
                  <span className="text-sm font-semibold text-white">{params.dcVoltage.toFixed(2)}</span>
                </div>
                <Slider
                  value={[params.dcVoltage]}
                  onValueChange={([value]) => setParams({ ...params, dcVoltage: value })}
                  min={380}
                  max={500}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm text-slate-400">Potência de Carga (MW)</label>
                  <span className="text-sm font-semibold text-white">{params.loadPower}</span>
                </div>
                <Slider
                  value={[params.loadPower]}
                  onValueChange={([value]) => setParams({ ...params, loadPower: value })}
                  min={500}
                  max={1500}
                  step={50}
                  className="w-full"
                />
              </div>

              <Button onClick={updateParams} className="w-full bg-blue-600 hover:bg-blue-700">
                <Activity className="mr-2 h-4 w-4" />
                Aplicar Parâmetros
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
