import { useState } from "react";
import { Play, Download, Trash2, Plus, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TestResult {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  startTime: number;
  endTime?: number;
  duration?: number;
  acVoltage1: number;
  acVoltage2: number;
  dcVoltage: number;
  loadPower: number;
  results: {
    totalGeneration: number;
    totalLoad: number;
    efficiency: number;
    losses: number;
    dcCurrent: number;
    rectifierEfficiency: number;
    inverterEfficiency: number;
  };
  error?: string;
}

export default function Tests() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [newTestName, setNewTestName] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);

  // Mock test execution
  const runTest = async (name: string) => {
    if (!name.trim()) {
      alert("Por favor, digite um nome para o teste");
      return;
    }

    const testId = Date.now().toString();
    const newTest: TestResult = {
      id: testId,
      name,
      status: "running",
      startTime: Date.now(),
      acVoltage1: 345,
      acVoltage2: 230,
      dcVoltage: 422.84,
      loadPower: 1000,
      results: {
        totalGeneration: 0,
        totalLoad: 0,
        efficiency: 0,
        losses: 0,
        dcCurrent: 0,
        rectifierEfficiency: 0,
        inverterEfficiency: 0,
      },
    };

    setTests((prev) => [newTest, ...prev]);
    setIsRunning(true);

    // Simulate test execution
    setTimeout(() => {
      const results = {
        totalGeneration: 1050 + Math.random() * 100,
        totalLoad: 1000,
        efficiency: 96.5 + Math.random() * 2,
        losses: 35 + Math.random() * 10,
        dcCurrent: (1000 * 1000) / 422.84 + Math.random() * 50,
        rectifierEfficiency: 98.5 + Math.random() * 0.5,
        inverterEfficiency: 98.2 + Math.random() * 0.5,
      };

      setTests((prev) =>
        prev.map((t) =>
          t.id === testId
            ? {
                ...t,
                status: "completed",
                endTime: Date.now(),
                duration: Date.now() - t.startTime,
                results,
              }
            : t
        )
      );
      setIsRunning(false);
      setNewTestName("");
    }, 3000);
  };

  const deleteTest = (id: string) => {
    setTests((prev) => prev.filter((t) => t.id !== id));
    if (selectedTest?.id === id) {
      setSelectedTest(null);
    }
  };

  const exportResults = (test: TestResult) => {
    const csv = `Test Results - ${test.name}
Date,${new Date(test.startTime).toLocaleString("pt-BR")}
Duration,${test.duration ? (test.duration / 1000).toFixed(2) : "N/A"} seconds

Parameters
AC Voltage 1,${test.acVoltage1} kV
AC Voltage 2,${test.acVoltage2} kV
DC Voltage,${test.dcVoltage} kV
Load Power,${test.loadPower} MW

Results
Total Generation,${test.results.totalGeneration.toFixed(2)} MW
Total Load,${test.results.totalLoad.toFixed(2)} MW
Efficiency,${test.results.efficiency.toFixed(2)} %
Losses,${test.results.losses.toFixed(2)} MW
DC Current,${test.results.dcCurrent.toFixed(3)} kA
Rectifier Efficiency,${test.results.rectifierEfficiency.toFixed(2)} %
Inverter Efficiency,${test.results.inverterEfficiency.toFixed(2)} %`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `test-${test.id}.csv`;
    a.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "running":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "failed":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "running":
        return <Clock className="h-4 w-4 animate-spin" />;
      case "failed":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Play className="h-8 w-8 text-blue-500" />
          Testes de Simulação HVDC
        </h1>
        <p className="text-slate-400 mt-1">Execute e analise simulações do sistema</p>
      </div>

      <Tabs defaultValue="execute" className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="execute">Executar Teste</TabsTrigger>
          <TabsTrigger value="history">Histórico ({tests.length})</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
        </TabsList>

        {/* Executar Teste */}
        <TabsContent value="execute" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle>Novo Teste de Simulação</CardTitle>
              <CardDescription>Configure e execute uma nova simulação HVDC</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Nome do Teste</label>
                <Input
                  placeholder="Ex: Teste de Carga Máxima"
                  value={newTestName}
                  onChange={(e) => setNewTestName(e.target.value)}
                  disabled={isRunning}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <Alert className="bg-blue-500/10 border-blue-500/20">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-blue-300">
                  Este teste usa parâmetros padrão: AC 345/230 kV, DC 422.84 kV, Carga 1000 MW
                </AlertDescription>
              </Alert>

              <Button
                onClick={() => runTest(newTestName)}
                disabled={isRunning}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                {isRunning ? "Executando..." : "Executar Teste"}
              </Button>

              {isRunning && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 animate-spin text-blue-500" />
                    <span className="text-sm text-slate-300">Simulação em andamento...</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: "66%" }} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Testes Recentes */}
          {tests.length > 0 && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Testes Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tests.slice(0, 3).map((test) => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getStatusColor(test.status)}`}>
                          {getStatusIcon(test.status)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{test.name}</p>
                          <p className="text-xs text-slate-400">
                            {new Date(test.startTime).toLocaleTimeString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(test.status)}`}>
                        {test.status === "completed" && "Concluído"}
                        {test.status === "running" && "Executando"}
                        {test.status === "failed" && "Erro"}
                        {test.status === "pending" && "Pendente"}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Histórico */}
        <TabsContent value="history" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle>Histórico de Testes</CardTitle>
              <CardDescription>Lista de todos os testes executados</CardDescription>
            </CardHeader>
            <CardContent>
              {tests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">Nenhum teste executado ainda</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">Nome</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300">Duração</TableHead>
                        <TableHead className="text-slate-300">Data/Hora</TableHead>
                        <TableHead className="text-slate-300">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tests.map((test) => (
                        <TableRow key={test.id} className="border-slate-700 hover:bg-slate-700/30">
                          <TableCell className="text-white font-semibold">{test.name}</TableCell>
                          <TableCell>
                            <div className={`inline-flex items-center gap-2 px-2 py-1 rounded border ${getStatusColor(test.status)}`}>
                              {getStatusIcon(test.status)}
                              <span className="text-xs">
                                {test.status === "completed" && "Concluído"}
                                {test.status === "running" && "Executando"}
                                {test.status === "failed" && "Erro"}
                                {test.status === "pending" && "Pendente"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {test.duration ? `${(test.duration / 1000).toFixed(2)}s` : "-"}
                          </TableCell>
                          <TableCell className="text-slate-300 text-sm">
                            {new Date(test.startTime).toLocaleString("pt-BR")}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedTest(test)}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                Ver
                              </Button>
                              {test.status === "completed" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => exportResults(test)}
                                  className="text-green-400 hover:text-green-300"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteTest(test.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detalhes */}
        <TabsContent value="details" className="space-y-4">
          {selectedTest ? (
            <>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle>{selectedTest.name}</CardTitle>
                  <CardDescription>
                    Executado em {new Date(selectedTest.startTime).toLocaleString("pt-BR")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Parâmetros */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Parâmetros de Entrada</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                        <p className="text-slate-400 text-sm">Tensão AC 1</p>
                        <p className="text-2xl font-bold text-white">{selectedTest.acVoltage1}</p>
                        <p className="text-xs text-slate-500">kV</p>
                      </div>
                      <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                        <p className="text-slate-400 text-sm">Tensão AC 2</p>
                        <p className="text-2xl font-bold text-white">{selectedTest.acVoltage2}</p>
                        <p className="text-xs text-slate-500">kV</p>
                      </div>
                      <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                        <p className="text-slate-400 text-sm">Tensão DC</p>
                        <p className="text-2xl font-bold text-white">{selectedTest.dcVoltage.toFixed(2)}</p>
                        <p className="text-xs text-slate-500">kV</p>
                      </div>
                      <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                        <p className="text-slate-400 text-sm">Carga</p>
                        <p className="text-2xl font-bold text-white">{selectedTest.loadPower}</p>
                        <p className="text-xs text-slate-500">MW</p>
                      </div>
                    </div>
                  </div>

                  {/* Resultados */}
                  {selectedTest.status === "completed" && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Resultados da Simulação</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                          <p className="text-green-400 text-sm">Geração Total</p>
                          <p className="text-2xl font-bold text-white">
                            {selectedTest.results.totalGeneration.toFixed(1)}
                          </p>
                          <p className="text-xs text-slate-400">MW</p>
                        </div>
                        <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                          <p className="text-blue-400 text-sm">Carga Total</p>
                          <p className="text-2xl font-bold text-white">
                            {selectedTest.results.totalLoad.toFixed(1)}
                          </p>
                          <p className="text-xs text-slate-400">MW</p>
                        </div>
                        <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20">
                          <p className="text-yellow-400 text-sm">Eficiência</p>
                          <p className="text-2xl font-bold text-white">
                            {selectedTest.results.efficiency.toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-400">%</p>
                        </div>
                        <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                          <p className="text-red-400 text-sm">Perdas</p>
                          <p className="text-2xl font-bold text-white">
                            {selectedTest.results.losses.toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-400">MW</p>
                        </div>
                        <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
                          <p className="text-purple-400 text-sm">Corrente DC</p>
                          <p className="text-2xl font-bold text-white">
                            {selectedTest.results.dcCurrent.toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-400">kA</p>
                        </div>
                        <div className="bg-cyan-500/10 p-4 rounded-lg border border-cyan-500/20">
                          <p className="text-cyan-400 text-sm">Duração</p>
                          <p className="text-2xl font-bold text-white">
                            {selectedTest.duration ? (selectedTest.duration / 1000).toFixed(2) : "-"}
                          </p>
                          <p className="text-xs text-slate-400">segundos</p>
                        </div>
                      </div>

                      {/* Eficiências dos Conversores */}
                      <div className="mt-6">
                        <h4 className="text-md font-semibold text-white mb-3">Eficiência dos Conversores</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                            <p className="text-slate-400 text-sm">Retificador</p>
                            <p className="text-2xl font-bold text-white">
                              {selectedTest.results.rectifierEfficiency.toFixed(2)}
                            </p>
                            <p className="text-xs text-slate-500">%</p>
                          </div>
                          <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                            <p className="text-slate-400 text-sm">Inversor</p>
                            <p className="text-2xl font-bold text-white">
                              {selectedTest.results.inverterEfficiency.toFixed(2)}
                            </p>
                            <p className="text-xs text-slate-500">%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedTest.status === "running" && (
                    <Alert className="bg-blue-500/10 border-blue-500/20">
                      <Clock className="h-4 w-4 text-blue-500 animate-spin" />
                      <AlertDescription className="text-blue-300">
                        Teste em execução... Por favor, aguarde
                      </AlertDescription>
                    </Alert>
                  )}

                  {selectedTest.status === "failed" && (
                    <Alert className="bg-red-500/10 border-red-500/20">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <AlertDescription className="text-red-300">
                        {selectedTest.error || "Erro ao executar teste"}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {selectedTest.status === "completed" && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => exportResults(selectedTest)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Resultados (CSV)
                  </Button>
                  <Button
                    onClick={() => setSelectedTest(null)}
                    variant="outline"
                    className="flex-1 border-slate-600"
                  >
                    Fechar
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-slate-400">Selecione um teste no histórico para ver detalhes</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
