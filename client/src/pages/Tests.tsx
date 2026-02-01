import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Play, Download, Trash2, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface TestResult {
  id: string;
  name: string;
  timestamp: Date;
  parameters: {
    ac1_voltage: number;
    ac2_voltage: number;
    dc_voltage: number;
    power_mva: number;
    load_mw: number;
  };
  results?: {
    totalGeneration: number;
    totalLoad: number;
    efficiency: number;
    losses: number;
    dcCurrent: number;
    rectifierEfficiency: number;
    inverterEfficiency: number;
    acVoltage1: number;
    acVoltage2: number;
    dcVoltageRectifier: number;
    dcVoltageInverter: number;
    rectifierLoss: number;
    inverterLoss: number;
    powerTransmitted: number;
  };
  status: "running" | "completed" | "failed";
  error?: string;
}

export default function Tests() {
  const [testName, setTestName] = useState("");
  const [testParams, setTestParams] = useState({
    ac1_voltage: 345.0,
    ac2_voltage: 230.0,
    dc_voltage: 422.84,
    power_mva: 1196.0,
    load_mw: 1000.0,
  });

  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);
  const [expandedTest, setExpandedTest] = useState<string | null>(null);

  // tRPC mutation for running tests
  const runTestMutation = trpc.tests.runTest.useMutation({
    onSuccess: (data) => {
      const newTest: TestResult = {
        id: `test-${Date.now()}`,
        name: testName || `Test ${testResults.length + 1}`,
        timestamp: new Date(),
        parameters: testParams,
        results: data.results,
        status: data.success ? "completed" : "failed",
        error: data.error,
      };

      setTestResults([newTest, ...testResults]);
      setSelectedTest(newTest);
      setTestName("");

      if (data.success) {
        toast.success("Simulação concluída com sucesso!");
      } else {
        toast.error(`Erro na simulação: ${data.error}`);
      }
    },
    onError: (error) => {
      toast.error(`Erro ao executar simulação: ${error.message}`);
    },
  });

  const handleRunTest = () => {
    if (!testName.trim()) {
      toast.error("Por favor, insira um nome para o teste");
      return;
    }

    runTestMutation.mutate({
      name: testName,
      ...testParams,
    });
  };

  const handleDeleteTest = (testId: string) => {
    setTestResults(testResults.filter((t) => t.id !== testId));
    if (selectedTest?.id === testId) {
      setSelectedTest(null);
    }
    toast.success("Teste deletado");
  };

  const handleExportCSV = () => {
    if (!selectedTest || !selectedTest.results) {
      toast.error("Nenhum teste selecionado");
      return;
    }

    const csv = [
      ["Parâmetro", "Valor"],
      ["Nome do Teste", selectedTest.name],
      ["Data/Hora", selectedTest.timestamp.toLocaleString("pt-BR")],
      ["", ""],
      ["PARÂMETROS DE ENTRADA", ""],
      ["Tensão AC1 (kV)", selectedTest.parameters.ac1_voltage],
      ["Tensão AC2 (kV)", selectedTest.parameters.ac2_voltage],
      ["Tensão DC (kV)", selectedTest.parameters.dc_voltage],
      ["Potência (MVA)", selectedTest.parameters.power_mva],
      ["Carga (MW)", selectedTest.parameters.load_mw],
      ["", ""],
      ["RESULTADOS", ""],
      ["Geração Total (MW)", selectedTest.results.totalGeneration.toFixed(2)],
      ["Carga Total (MW)", selectedTest.results.totalLoad.toFixed(2)],
      ["Eficiência (%)", selectedTest.results.efficiency.toFixed(2)],
      ["Perdas Totais (MW)", selectedTest.results.losses.toFixed(2)],
      ["Corrente DC (A)", selectedTest.results.dcCurrent.toFixed(2)],
      ["Eficiência Retificador (%)", selectedTest.results.rectifierEfficiency.toFixed(2)],
      ["Eficiência Inversor (%)", selectedTest.results.inverterEfficiency.toFixed(2)],
      ["Tensão AC1 (kV)", selectedTest.results.acVoltage1.toFixed(2)],
      ["Tensão AC2 (kV)", selectedTest.results.acVoltage2.toFixed(2)],
      ["Tensão DC Retificador (kV)", selectedTest.results.dcVoltageRectifier.toFixed(2)],
      ["Tensão DC Inversor (kV)", selectedTest.results.dcVoltageInverter.toFixed(2)],
      ["Perdas Retificador (MW)", selectedTest.results.rectifierLoss.toFixed(2)],
      ["Perdas Inversor (MW)", selectedTest.results.inverterLoss.toFixed(2)],
      ["Potência Transmitida (MW)", selectedTest.results.powerTransmitted.toFixed(2)],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedTest.name}-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Arquivo exportado com sucesso");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Testes de Simulação</h1>
          <p className="text-slate-400">Execute e analise simulações HVDC com Pandapower</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Test Configuration */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle>Novo Teste</CardTitle>
                <CardDescription>Configure os parâmetros da simulação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300">Nome do Teste</label>
                  <Input
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder="Ex: Teste de Carga Máxima"
                    className="bg-slate-800 border-slate-700 text-white mt-1"
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-300">
                      Tensão AC1 (kV): {testParams.ac1_voltage}
                    </label>
                    <input
                      type="range"
                      min="200"
                      max="500"
                      step="5"
                      value={testParams.ac1_voltage}
                      onChange={(e) =>
                        setTestParams({ ...testParams, ac1_voltage: parseFloat(e.target.value) })
                      }
                      className="w-full mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-300">
                      Tensão AC2 (kV): {testParams.ac2_voltage}
                    </label>
                    <input
                      type="range"
                      min="100"
                      max="400"
                      step="5"
                      value={testParams.ac2_voltage}
                      onChange={(e) =>
                        setTestParams({ ...testParams, ac2_voltage: parseFloat(e.target.value) })
                      }
                      className="w-full mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-300">
                      Tensão DC (kV): {testParams.dc_voltage}
                    </label>
                    <input
                      type="range"
                      min="300"
                      max="600"
                      step="5"
                      value={testParams.dc_voltage}
                      onChange={(e) =>
                        setTestParams({ ...testParams, dc_voltage: parseFloat(e.target.value) })
                      }
                      className="w-full mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-300">
                      Potência (MVA): {testParams.power_mva}
                    </label>
                    <input
                      type="range"
                      min="500"
                      max="2000"
                      step="50"
                      value={testParams.power_mva}
                      onChange={(e) =>
                        setTestParams({ ...testParams, power_mva: parseFloat(e.target.value) })
                      }
                      className="w-full mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-300">
                      Carga (MW): {testParams.load_mw}
                    </label>
                    <input
                      type="range"
                      min="500"
                      max="1500"
                      step="50"
                      value={testParams.load_mw}
                      onChange={(e) =>
                        setTestParams({ ...testParams, load_mw: parseFloat(e.target.value) })
                      }
                      className="w-full mt-1"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleRunTest}
                  disabled={runTestMutation.isPending || !testName.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                >
                  {runTestMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Executando...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Executar Simulação
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="history" className="w-full">
              <TabsList className="bg-slate-800 border-slate-700">
                <TabsTrigger value="history">Histórico ({testResults.length})</TabsTrigger>
                <TabsTrigger value="details" disabled={!selectedTest}>
                  Detalhes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="history" className="space-y-3">
                {testResults.length === 0 ? (
                  <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="pt-6 text-center text-slate-400">
                      Nenhum teste executado ainda. Configure os parâmetros e clique em "Executar Simulação".
                    </CardContent>
                  </Card>
                ) : (
                  testResults.map((test) => (
                    <Card
                      key={test.id}
                      className={`bg-slate-900 border-slate-800 cursor-pointer transition-colors ${
                        selectedTest?.id === test.id ? "border-blue-500" : ""
                      }`}
                      onClick={() => setSelectedTest(test)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white">{test.name}</h3>
                            <p className="text-sm text-slate-400">
                              {test.timestamp.toLocaleString("pt-BR")}
                            </p>
                            {test.status === "completed" && test.results && (
                              <p className="text-sm text-green-400 mt-1">
                                Eficiência: {test.results.efficiency.toFixed(2)}% | Perdas: {test.results.losses.toFixed(2)} MW
                              </p>
                            )}
                            {test.status === "failed" && (
                              <p className="text-sm text-red-400 mt-1">Erro: {test.error}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedTest(expandedTest === test.id ? null : test.id);
                              }}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTest(test.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </Button>
                          </div>
                        </div>

                        {expandedTest === test.id && test.results && (
                          <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-slate-400">Geração:</span>
                              <p className="font-semibold text-white">
                                {test.results.totalGeneration.toFixed(2)} MW
                              </p>
                            </div>
                            <div>
                              <span className="text-slate-400">Carga:</span>
                              <p className="font-semibold text-white">{test.results.totalLoad.toFixed(2)} MW</p>
                            </div>
                            <div>
                              <span className="text-slate-400">Corrente DC:</span>
                              <p className="font-semibold text-white">{test.results.dcCurrent.toFixed(2)} A</p>
                            </div>
                            <div>
                              <span className="text-slate-400">Tensão AC1:</span>
                              <p className="font-semibold text-white">{test.results.acVoltage1.toFixed(2)} kV</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="details">
                {selectedTest && selectedTest.results ? (
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle>{selectedTest.name}</CardTitle>
                      <CardDescription>
                        {selectedTest.timestamp.toLocaleString("pt-BR")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-white mb-3">Parâmetros de Entrada</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-slate-800 p-3 rounded">
                            <span className="text-slate-400">Tensão AC1</span>
                            <p className="font-semibold text-white">
                              {selectedTest.parameters.ac1_voltage} kV
                            </p>
                          </div>
                          <div className="bg-slate-800 p-3 rounded">
                            <span className="text-slate-400">Tensão AC2</span>
                            <p className="font-semibold text-white">
                              {selectedTest.parameters.ac2_voltage} kV
                            </p>
                          </div>
                          <div className="bg-slate-800 p-3 rounded">
                            <span className="text-slate-400">Tensão DC</span>
                            <p className="font-semibold text-white">
                              {selectedTest.parameters.dc_voltage} kV
                            </p>
                          </div>
                          <div className="bg-slate-800 p-3 rounded">
                            <span className="text-slate-400">Potência</span>
                            <p className="font-semibold text-white">
                              {selectedTest.parameters.power_mva} MVA
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-white mb-3">Resultados</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-slate-800 p-3 rounded">
                            <span className="text-slate-400">Geração Total</span>
                            <p className="font-semibold text-white">
                              {selectedTest.results.totalGeneration.toFixed(2)} MW
                            </p>
                          </div>
                          <div className="bg-slate-800 p-3 rounded">
                            <span className="text-slate-400">Carga Total</span>
                            <p className="font-semibold text-white">
                              {selectedTest.results.totalLoad.toFixed(2)} MW
                            </p>
                          </div>
                          <div className="bg-green-900/20 p-3 rounded border border-green-800">
                            <span className="text-green-400">Eficiência</span>
                            <p className="font-semibold text-green-300">
                              {selectedTest.results.efficiency.toFixed(2)}%
                            </p>
                          </div>
                          <div className="bg-red-900/20 p-3 rounded border border-red-800">
                            <span className="text-red-400">Perdas Totais</span>
                            <p className="font-semibold text-red-300">
                              {selectedTest.results.losses.toFixed(2)} MW
                            </p>
                          </div>
                          <div className="bg-slate-800 p-3 rounded">
                            <span className="text-slate-400">Corrente DC</span>
                            <p className="font-semibold text-white">
                              {selectedTest.results.dcCurrent.toFixed(2)} A
                            </p>
                          </div>
                          <div className="bg-slate-800 p-3 rounded">
                            <span className="text-slate-400">Potência Transmitida</span>
                            <p className="font-semibold text-white">
                              {selectedTest.results.powerTransmitted.toFixed(2)} MW
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-white mb-3">Eficiências</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-slate-800 p-3 rounded">
                            <span className="text-slate-400">Retificador</span>
                            <p className="font-semibold text-white">
                              {selectedTest.results.rectifierEfficiency.toFixed(2)}%
                            </p>
                          </div>
                          <div className="bg-slate-800 p-3 rounded">
                            <span className="text-slate-400">Inversor</span>
                            <p className="font-semibold text-white">
                              {selectedTest.results.inverterEfficiency.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={handleExportCSV}
                        className="w-full bg-slate-800 hover:bg-slate-700 gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Exportar como CSV
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="pt-6 text-center text-slate-400">
                      Selecione um teste para ver os detalhes
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
