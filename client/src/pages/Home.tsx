import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Zap, Activity, TrendingUp, Settings, Gauge, FileText, Play } from "lucide-react";
import { Link } from "wouter";
import CircuitDiagram from "@/components/CircuitDiagram";
import SimulationControls from "@/components/SimulationControls";
import ResultsCharts from "@/components/ResultsCharts";
import { toast } from "sonner";

export default function Home() {
  const [simulationParams, setSimulationParams] = useState({
    ac1_voltage: 345.0,
    ac2_voltage: 230.0,
    dc_voltage: 422.84,
    power_mva: 1196.0,
    load_mw: 1000.0,
  });

  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const runSimulation = trpc.simulation.run.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setSimulationResult(data);
        toast.success("Simulação concluída com sucesso!");
      } else {
        toast.error(`Erro na simulação: ${data.error}`);
      }
      setIsSimulating(false);
    },
    onError: (error) => {
      toast.error(`Erro ao executar simulação: ${error.message}`);
      setIsSimulating(false);
    },
  });

  const handleRunSimulation = () => {
    setIsSimulating(true);
    runSimulation.mutate({
      ...simulationParams,
      saveResult: false, // Standalone mode
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-blue-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">HVDC Simulator</h1>
                <p className="text-sm text-slate-400">Sistema de Transmissão em Corrente Contínua de Alta Tensão</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/supervisory">
                <Button variant="default" className="gap-2">
                  <Activity className="h-4 w-4" />
                  Supervisório
                </Button>
              </Link>
              <Link href="/iff-analytics">
                <Button variant="outline" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  IFF Analytics
                </Button>
              </Link>
              <Link href="/iff-test-scenarios">
                <Button variant="outline" className="gap-2">
                  <Gauge className="h-4 w-4" />
                  Testes
                </Button>
              </Link>
                  <Link href="/trend-analysis">
              <Button variant="outline" className="gap-2">
                <Activity className="h-4 w-4" />
                Tendências
              </Button>
            </Link>
            <Link href="/research-results">
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Pesquisa
              </Button>
            </Link>
            <Link href="/event-history">
              <Button variant="outline" className="gap-2">
                <Activity className="h-4 w-4" />
                Eventos
              </Button>
            </Link>
            <Link href="/tests">
              <Button variant="outline" className="gap-2">
                <Play className="h-4 w-4" />
                Testes
              </Button>
            </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Geração Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {simulationResult?.system?.total_generation_mw?.toFixed(1) || "---"}
              </div>
              <p className="text-xs text-slate-400 mt-1">MW - Potência gerada</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Carga Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {simulationResult?.system?.total_load_mw?.toFixed(1) || "---"}
              </div>
              <p className="text-xs text-slate-400 mt-1">MW - Potência consumida</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Eficiência</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {simulationResult?.system?.efficiency?.toFixed(2) || "---"}
              </div>
              <p className="text-xs text-slate-400 mt-1">% - Rendimento do sistema</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Perdas Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {simulationResult?.system?.losses_mw?.toFixed(2) || "---"}
              </div>
              <p className="text-xs text-slate-400 mt-1">MW - Perdas no sistema</p>
            </CardContent>
          </Card>
        </div>

        {/* Botão de Simulação */}
        <div className="flex justify-center mb-8">
          <Button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
          >
            {isSimulating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Executando Simulação...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-5 w-5" />
                Executar Simulação
              </>
            )}
          </Button>
        </div>

        {/* Tabs de Visualização */}
        <Tabs defaultValue="diagram" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="diagram" className="gap-2">
              <Activity className="h-4 w-4" />
              Diagrama Unifilar
            </TabsTrigger>
            <TabsTrigger value="controls" className="gap-2">
              <Settings className="h-4 w-4" />
              Controles
            </TabsTrigger>
            <TabsTrigger value="analysis" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Análise
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diagram">
            <CircuitDiagram result={simulationResult} />
          </TabsContent>

          <TabsContent value="controls">
            <SimulationControls 
              params={simulationParams} 
              onParamsChange={setSimulationParams}
              onRunSimulation={handleRunSimulation}
              isSimulating={isSimulating}
            />
          </TabsContent>

          <TabsContent value="analysis">
            <ResultsCharts result={simulationResult} />
          </TabsContent>
        </Tabs>

        {/* Link para Dashboard Supervisório */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
                <Gauge className="h-6 w-6 text-blue-400" />
                Monitoramento em Tempo Real
              </CardTitle>
              <CardDescription className="text-slate-300">
                Acesse o dashboard supervisório para monitoramento contínuo do sistema HVDC
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/supervisory">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Activity className="mr-2 h-5 w-5" />
                  Abrir Dashboard Supervisório
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
