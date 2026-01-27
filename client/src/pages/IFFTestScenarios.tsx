/**
 * Página de Testes de Cenários do Framework IFF
 * 
 * Permite criar e executar diferentes cenários de falhas e erros para validação
 * do Framework IFF conforme especificação ASME V&V.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Play, Download, BarChart3 } from "lucide-react";

interface TestScenario {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "normal" | "error" | "fault" | "attack";
  parameters: ScenarioParameter[];
}

interface ScenarioParameter {
  name: string;
  key: string;
  type: "slider" | "number" | "toggle";
  min?: number;
  max?: number;
  default: number;
  unit: string;
}

interface TestResult {
  scenario_id: string;
  scenario_type: string;
  timestamp: number;
  duration_seconds: number;
  total_samples: number;
  statistics: {
    voltage_mean: number;
    voltage_std: number;
    current_mean: number;
    current_std: number;
    power_mean: number;
    power_std: number;
    frequency_mean: number;
    frequency_std: number;
    error_rate_percent: number;
    max_error_magnitude: number;
  };
  fault_detected: boolean;
  fault_time_ms: number | null;
}

const scenarios: TestScenario[] = [
  {
    id: "normal_operation",
    name: "Operação Normal",
    description: "Sistema operando dentro dos parâmetros nominais com pequenas variações",
    icon: "✓",
    category: "normal",
    parameters: [
      {
        name: "Duração",
        key: "duration_seconds",
        type: "slider",
        min: 5,
        max: 60,
        default: 10,
        unit: "s",
      },
      {
        name: "Taxa de Amostragem",
        key: "sampling_rate_hz",
        type: "slider",
        min: 50,
        max: 1000,
        default: 100,
        unit: "Hz",
      },
    ],
  },
  {
    id: "model_error",
    name: "Erro de Estimação",
    description: "Modelo matemático impreciso do Digital Twin",
    icon: "⚠",
    category: "error",
    parameters: [
      {
        name: "Magnitude do Erro",
        key: "error_magnitude_percent",
        type: "slider",
        min: 1,
        max: 50,
        default: 15,
        unit: "%",
      },
      {
        name: "Duração",
        key: "duration_seconds",
        type: "slider",
        min: 5,
        max: 60,
        default: 10,
        unit: "s",
      },
    ],
  },
  {
    id: "sensor_degradation",
    name: "Degradação de Sensores",
    description: "Incerteza de medição aumentando ao longo do tempo",
    icon: "📉",
    category: "error",
    parameters: [
      {
        name: "Degradação Inicial",
        key: "initial_degradation_percent",
        type: "slider",
        min: 0,
        max: 10,
        default: 2,
        unit: "%",
      },
      {
        name: "Taxa de Degradação",
        key: "degradation_rate_percent_per_minute",
        type: "slider",
        min: 0.1,
        max: 2,
        default: 0.5,
        unit: "%/min",
      },
    ],
  },
  {
    id: "communication_latency",
    name: "Latência de Comunicação",
    description: "Atraso na transmissão de dados entre sistema físico e Digital Twin",
    icon: "⏱",
    category: "error",
    parameters: [
      {
        name: "Latência",
        key: "latency_ms",
        type: "slider",
        min: 10,
        max: 500,
        default: 100,
        unit: "ms",
      },
      {
        name: "Duração",
        key: "duration_seconds",
        type: "slider",
        min: 5,
        max: 60,
        default: 10,
        unit: "s",
      },
    ],
  },
  {
    id: "three_phase_fault",
    name: "Falha Trifásica",
    description: "Perda completa de tensão em todas as fases",
    icon: "⚡",
    category: "fault",
    parameters: [
      {
        name: "Tempo de Início",
        key: "fault_start_time_seconds",
        type: "slider",
        min: 1,
        max: 10,
        default: 2,
        unit: "s",
      },
      {
        name: "Duração da Falha",
        key: "fault_duration_seconds",
        type: "slider",
        min: 0.1,
        max: 2,
        default: 0.5,
        unit: "s",
      },
    ],
  },
  {
    id: "two_phase_fault",
    name: "Falha Bifásica",
    description: "Perda de tensão em duas fases",
    icon: "⚡",
    category: "fault",
    parameters: [
      {
        name: "Tempo de Início",
        key: "fault_start_time_seconds",
        type: "slider",
        min: 1,
        max: 10,
        default: 2,
        unit: "s",
      },
      {
        name: "Duração da Falha",
        key: "fault_duration_seconds",
        type: "slider",
        min: 0.1,
        max: 2,
        default: 0.5,
        unit: "s",
      },
    ],
  },
  {
    id: "cyber_attack",
    name: "Ataque Cibernético (FDI)",
    description: "Injeção de dados falsos nos sensores",
    icon: "🔓",
    category: "attack",
    parameters: [
      {
        name: "Tempo de Início",
        key: "attack_start_time_seconds",
        type: "slider",
        min: 1,
        max: 10,
        default: 2,
        unit: "s",
      },
      {
        name: "Magnitude de Injeção",
        key: "injection_magnitude_percent",
        type: "slider",
        min: 5,
        max: 100,
        default: 30,
        unit: "%",
      },
    ],
  },
];

export default function IFFTestScenarios() {
  const [selectedScenario, setSelectedScenario] = useState<TestScenario>(scenarios[0]);
  const [parameters, setParameters] = useState<Record<string, number>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // Inicializar parâmetros
  const initializeParameters = (scenario: TestScenario) => {
    const params: Record<string, number> = {};
    scenario.parameters.forEach((p) => {
      params[p.key] = p.default;
    });
    setParameters(params);
  };

  const handleScenarioChange = (scenario: TestScenario) => {
    setSelectedScenario(scenario);
    initializeParameters(scenario);
    setTestResult(null);
  };

  const handleParameterChange = (key: string, value: number) => {
    setParameters((prev) => ({ ...prev, [key]: value }));
  };

  const handleRunTest = async () => {
    setIsRunning(true);
    try {
      // Simular execução do teste
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Gerar resultado simulado
      const result: TestResult = {
        scenario_id: selectedScenario.id,
        scenario_type: selectedScenario.name,
        timestamp: Date.now(),
        duration_seconds: parameters.duration_seconds || 10,
        total_samples: (parameters.duration_seconds || 10) * (parameters.sampling_rate_hz || 100),
        statistics: {
          voltage_mean: 345.0 + Math.random() * 10,
          voltage_std: 2.5 + Math.random() * 5,
          current_mean: 422.84 + Math.random() * 50,
          current_std: 15.0 + Math.random() * 20,
          power_mean: 1196.0 + Math.random() * 100,
          power_std: 50.0 + Math.random() * 100,
          frequency_mean: 60.0 + Math.random() * 0.5,
          frequency_std: 0.1 + Math.random() * 0.2,
          error_rate_percent: selectedScenario.category === "normal" ? 0 : Math.random() * 50,
          max_error_magnitude: selectedScenario.category === "normal" ? 2 : Math.random() * 100,
        },
        fault_detected: selectedScenario.category !== "normal",
        fault_time_ms:
          selectedScenario.category !== "normal" ? (parameters.fault_start_time_seconds || 2) * 1000 : null,
      };

      setTestResult(result);
    } finally {
      setIsRunning(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "normal":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-yellow-100 text-yellow-800";
      case "fault":
        return "bg-red-100 text-red-800";
      case "attack":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Cenários de Testes IFF</h1>
          <p className="text-slate-400">
            Valide o Framework IFF com diferentes cenários de falhas e erros
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Seleção de Cenários */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700 h-full">
              <CardHeader>
                <CardTitle className="text-white">Cenários Disponíveis</CardTitle>
                <CardDescription>Selecione um cenário para testar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {scenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => handleScenarioChange(scenario)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedScenario.id === scenario.id
                        ? "bg-blue-600 text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{scenario.icon}</span>
                      <div>
                        <div className="font-semibold text-sm">{scenario.name}</div>
                        <Badge className={`text-xs mt-1 ${getCategoryColor(scenario.category)}`}>
                          {scenario.category}
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Configuração e Execução */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">{selectedScenario.name}</CardTitle>
                <CardDescription>{selectedScenario.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Parâmetros */}
                <div className="space-y-4">
                  {selectedScenario.parameters.map((param) => (
                    <div key={param.key}>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-white">{param.name}</label>
                        <span className="text-sm text-slate-400">
                          {parameters[param.key]?.toFixed(1) || param.default} {param.unit}
                        </span>
                      </div>
                      <Slider
                        value={[parameters[param.key] || param.default]}
                        onValueChange={(value) => handleParameterChange(param.key, value[0])}
                        min={param.min}
                        max={param.max}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleRunTest}
                    disabled={isRunning}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isRunning ? "Executando..." : "Executar Teste"}
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </div>

                {/* Resultado */}
                {testResult && (
                  <div className="mt-6 p-4 bg-slate-700 rounded-lg border border-slate-600">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                      <h3 className="text-white font-semibold">Resultado do Teste</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Duração:</span>
                        <span className="text-white ml-2">{testResult.duration_seconds}s</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Amostras:</span>
                        <span className="text-white ml-2">{testResult.total_samples}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Taxa de Erro:</span>
                        <span className="text-white ml-2">
                          {testResult.statistics.error_rate_percent.toFixed(2)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Falha Detectada:</span>
                        <span className={testResult.fault_detected ? "text-red-400 ml-2" : "text-green-400 ml-2"}>
                          {testResult.fault_detected ? "Sim" : "Não"}
                        </span>
                      </div>
                    </div>

                    {testResult.fault_detected && testResult.fault_time_ms !== null && (
                      <div className="mt-4 p-3 bg-red-900 border border-red-700 rounded flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-red-200 font-semibold">Falha Detectada</p>
                          <p className="text-red-300 text-sm">
                            Tempo de detecção: {(testResult.fault_time_ms / 1000).toFixed(3)}s
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Estatísticas Detalhadas */}
        {testResult && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-slate-400">Tensão Média</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {testResult.statistics.voltage_mean.toFixed(2)} kV
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Std: {testResult.statistics.voltage_std.toFixed(2)} kV
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-slate-400">Corrente Média</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {testResult.statistics.current_mean.toFixed(2)} kA
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Std: {testResult.statistics.current_std.toFixed(2)} kA
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-slate-400">Potência Média</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {testResult.statistics.power_mean.toFixed(2)} MW
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Std: {testResult.statistics.power_std.toFixed(2)} MW
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-slate-400">Frequência Média</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {testResult.statistics.frequency_mean.toFixed(3)} Hz
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Std: {testResult.statistics.frequency_std.toFixed(3)} Hz
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
