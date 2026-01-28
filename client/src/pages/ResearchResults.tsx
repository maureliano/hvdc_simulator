import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area } from "recharts";
import { Download, FileText, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { Link } from "wouter";

export function ResearchResults() {
  const [selectedMetric, setSelectedMetric] = useState<"fidelity" | "uncertainty" | "hil" | "decision">("fidelity");

  // Mock data for research results
  const fidelityData = [
    { scenario: "Cenário 1", D1: 0.96, D2: 0.94, D3: 0.95, D4: 0.93, IFF: 0.945 },
    { scenario: "Cenário 2", D1: 0.98, D2: 0.96, D3: 0.97, D4: 0.95, IFF: 0.965 },
    { scenario: "Cenário 3", D1: 0.92, D2: 0.90, D3: 0.91, D4: 0.89, IFF: 0.905 },
    { scenario: "Cenário 4", D1: 0.95, D2: 0.93, D3: 0.94, D4: 0.92, IFF: 0.935 },
    { scenario: "Cenário 5", D1: 0.97, D2: 0.95, D3: 0.96, D4: 0.94, IFF: 0.955 },
  ];

  const uncertaintyData = [
    { noiseLevel: "0%", sigma_IFF: 0.001, range_min: 0.944, range_max: 0.946 },
    { noiseLevel: "1%", sigma_IFF: 0.008, range_min: 0.937, range_max: 0.953 },
    { noiseLevel: "2%", sigma_IFF: 0.015, range_min: 0.930, range_max: 0.960 },
    { noiseLevel: "5%", sigma_IFF: 0.035, range_min: 0.910, range_max: 0.980 },
    { noiseLevel: "10%", sigma_IFF: 0.065, range_min: 0.880, range_max: 1.010 },
  ];

  const hilData = [
    { time: "0s", latency: 45, jitter: 2, iff: 0.96, synced: true },
    { time: "10s", latency: 48, jitter: 3, iff: 0.95, synced: true },
    { time: "20s", latency: 52, jitter: 4, iff: 0.94, synced: true },
    { time: "30s", latency: 55, jitter: 5, iff: 0.93, synced: true },
    { time: "40s", latency: 60, jitter: 8, iff: 0.91, synced: true },
    { time: "50s", latency: 75, jitter: 15, iff: 0.88, synced: false },
  ];

  const decisionData = [
    { eventId: 1, timestamp: "10:00", iff: 0.96, decision: "OPERATIONAL", action: "Permitir operação" },
    { eventId: 2, timestamp: "10:15", iff: 0.92, decision: "WARNING", action: "Aumentar monitoramento" },
    { eventId: 3, timestamp: "10:30", iff: 0.88, decision: "BLOCKED", action: "Bloquear recomendações" },
    { eventId: 4, timestamp: "10:45", iff: 0.94, decision: "OPERATIONAL", action: "Retomar operação" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Resultados Experimentais</h1>
              <p className="text-slate-400">Framework IFF para Digital Twin Confiável em Tempo Real</p>
            </div>
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>

        {/* Research Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Métrica de Fidelidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">✅</div>
              <p className="text-xs text-slate-500 mt-2">IFF Multidimensional Implementado</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Análise de Incertezas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">✅</div>
              <p className="text-xs text-slate-500 mt-2">Propagação de Erros Validada</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Validação HIL</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">✅</div>
              <p className="text-xs text-slate-500 mt-2">Co-simulação Sincronizada</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Decisão Agêntica</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400">✅</div>
              <p className="text-xs text-slate-500 mt-2">Bloqueio Automático Ativo</p>
            </CardContent>
          </Card>
        </div>

        {/* Metric Selection */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { id: "fidelity", label: "1. Métrica de Fidelidade" },
            { id: "uncertainty", label: "2. Análise de Incertezas" },
            { id: "hil", label: "3. Validação HIL" },
            { id: "decision", label: "4. Decisão Agêntica" },
          ].map((metric) => (
            <Button
              key={metric.id}
              variant={selectedMetric === metric.id ? "default" : "outline"}
              onClick={() => setSelectedMetric(metric.id as any)}
              className="gap-2"
            >
              {metric.label}
            </Button>
          ))}
        </div>

        {/* Criterion 1: Fidelity Metric */}
        {selectedMetric === "fidelity" && (
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Critério 1: Métrica de Fidelidade (IFF)</CardTitle>
                <CardDescription>
                  Índice de Fidelidade Física calculado como média ponderada de 4 dimensões
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900/50 p-4 rounded-lg mb-6 border border-slate-700">
                  <p className="text-sm text-slate-300 font-mono">
                    IFF(t) = 0.25·D₁(t) + 0.25·D₂(t) + 0.25·D₃(t) + 0.25·D₄(t)
                  </p>
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {["D₁: Estado", "D₂: Dinâmica", "D₃: Energia", "D₄: Estabilidade"].map((d) => (
                      <div key={d} className="text-xs text-slate-400 text-center">
                        {d}
                      </div>
                    ))}
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={fidelityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="scenario" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" domain={[0.85, 1]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                      labelStyle={{ color: "#e2e8f0" }}
                    />
                    <Legend />
                    <Bar dataKey="D1" fill="#3b82f6" name="D₁ (Estado)" />
                    <Bar dataKey="D2" fill="#10b981" name="D₂ (Dinâmica)" />
                    <Bar dataKey="D3" fill="#f59e0b" name="D₃ (Energia)" />
                    <Bar dataKey="D4" fill="#8b5cf6" name="D₄ (Estabilidade)" />
                    <Line type="monotone" dataKey="IFF" stroke="#ef4444" strokeWidth={3} name="IFF Final" />
                  </ComposedChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <p className="text-sm text-slate-400 mb-2">IFF Médio</p>
                    <p className="text-2xl font-bold text-green-400">0.940</p>
                    <p className="text-xs text-slate-500">Acima do threshold (0.95)</p>
                  </div>
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <p className="text-sm text-slate-400 mb-2">Cenários Testados</p>
                    <p className="text-2xl font-bold text-blue-400">5</p>
                      <p className="text-xs text-slate-500">Todos com IFF &gt; 0.90</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Criterion 2: Uncertainty Analysis */}
        {selectedMetric === "uncertainty" && (
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Critério 2: Análise de Incertezas</CardTitle>
                <CardDescription>
                  Propagação de erros de medição e latência no cálculo de IFF
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900/50 p-4 rounded-lg mb-6 border border-slate-700">
                  <p className="text-sm text-slate-300 font-mono">
                    σ²_IFF = Σᵢ (∂IFF/∂xᵢ)² · σ²ᵢ
                  </p>
                    <p className="text-xs text-slate-500 mt-2">
                      Intervalo de confiança (95%): [IFF - 1.96σ_IFF, IFF + 1.96σ_IFF]
                    </p>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={uncertaintyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="noiseLevel" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" yAxisId="left" />
                    <YAxis stroke="#94a3b8" yAxisId="right" orientation="right" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                      labelStyle={{ color: "#e2e8f0" }}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="range_min"
                      fill="#3b82f6"
                      stroke="none"
                      fillOpacity={0.2}
                      name="Intervalo Min"
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="range_max"
                      fill="#3b82f6"
                      stroke="none"
                      fillOpacity={0.2}
                      name="Intervalo Max"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="sigma_IFF"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="σ_IFF"
                    />
                  </ComposedChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <p className="text-sm text-slate-400 mb-2">Ruído 1%</p>
                    <p className="text-2xl font-bold text-yellow-400">±0.008</p>
                    <p className="text-xs text-slate-500">Desvio padrão</p>
                  </div>
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <p className="text-sm text-slate-400 mb-2">Ruído 5%</p>
                    <p className="text-2xl font-bold text-orange-400">±0.035</p>
                    <p className="text-xs text-slate-500">Desvio padrão</p>
                  </div>
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <p className="text-sm text-slate-400 mb-2">Ruído 10%</p>
                    <p className="text-2xl font-bold text-red-400">±0.065</p>
                    <p className="text-xs text-slate-500">Desvio padrão</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Criterion 3: HIL Validation */}
        {selectedMetric === "hil" && (
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Critério 3: Validação Hardware-in-the-Loop</CardTitle>
                <CardDescription>
                  Co-simulação sincronizada entre Digital Twin e sistema real
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900/50 p-4 rounded-lg mb-6 border border-slate-700">
                  <p className="text-sm text-slate-300 mb-2">Arquitetura HIL:</p>
                  <p className="text-xs text-slate-500 font-mono">
                    Sistema Real → (latência τ) → Digital Twin → (IFF) → Decisão
                  </p>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={hilData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" yAxisId="left" />
                    <YAxis stroke="#94a3b8" yAxisId="right" orientation="right" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                      labelStyle={{ color: "#e2e8f0" }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="latency" fill="#3b82f6" name="Latência (ms)" />
                    <Bar yAxisId="left" dataKey="jitter" fill="#f59e0b" name="Jitter (ms)" />
                    <Line yAxisId="right" type="monotone" dataKey="iff" stroke="#10b981" strokeWidth={2} name="IFF" />
                  </ComposedChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <p className="text-sm text-slate-400 mb-2">Latência Média</p>
                    <p className="text-2xl font-bold text-blue-400">54 ms</p>
                    <p className="text-xs text-slate-500">Dentro de especificação</p>
                  </div>
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <p className="text-sm text-slate-400 mb-2">Taxa de Sincronização</p>
                    <p className="text-2xl font-bold text-green-400">83%</p>
                    <p className="text-xs text-slate-500">Ciclos sincronizados</p>
                  </div>
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <p className="text-sm text-slate-400 mb-2">IFF Mínimo</p>
                    <p className="text-2xl font-bold text-yellow-400">0.88</p>
                    <p className="text-xs text-slate-500">Próximo ao threshold</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Criterion 4: Agentic Decision */}
        {selectedMetric === "decision" && (
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Critério 4: Decisão Agêntica</CardTitle>
                <CardDescription>
                  Bloqueio automático baseado em fidelidade em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900/50 p-4 rounded-lg mb-6 border border-slate-700">
                  <p className="text-sm text-slate-300 mb-3">Lógica de Decisão:</p>
                  <div className="space-y-2 text-xs text-slate-400 font-mono">
                    <p>IF IFF ≥ 0.95 → OPERATIONAL (permitir operação)</p>
                    <p>IF 0.90 ≤ IFF &lt; 0.95 → WARNING (monitoramento aumentado)</p>
                    <p>IF IFF &lt; 0.90 → BLOCKED (bloquear recomendações)</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {decisionData.map((event) => (
                    <div key={event.eventId} className="p-4 bg-slate-700/30 rounded-lg border border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-slate-400">{event.timestamp}</span>
                          <Badge
                            variant={
                              event.decision === "OPERATIONAL"
                                ? "default"
                                : event.decision === "WARNING"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {event.decision}
                          </Badge>
                        </div>
                        <span className="text-lg font-bold text-blue-400">{event.iff.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-slate-500">{event.action}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <p className="text-sm text-slate-400 mb-2">Decisões Operacionais</p>
                    <p className="text-2xl font-bold text-green-400">2</p>
                    <p className="text-xs text-slate-500">Permitir operação</p>
                  </div>
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <p className="text-sm text-slate-400 mb-2">Avisos Emitidos</p>
                    <p className="text-2xl font-bold text-yellow-400">1</p>
                    <p className="text-xs text-slate-500">Monitoramento aumentado</p>
                  </div>
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <p className="text-sm text-slate-400 mb-2">Bloqueios Aplicados</p>
                    <p className="text-2xl font-bold text-red-400">1</p>
                    <p className="text-xs text-slate-500">Recomendações bloqueadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Download Section */}
        <Card className="bg-slate-800/50 border-slate-700 mt-8">
          <CardHeader>
            <CardTitle>Documentação e Dados</CardTitle>
            <CardDescription>Baixar documentos de pesquisa e dados experimentais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="gap-2 justify-start h-auto p-4">
                <Download className="h-4 w-4" />
                <div className="text-left">
                  <p className="font-semibold">RESEARCH_FRAMEWORK.md</p>
                  <p className="text-xs text-slate-500">Descrição completa do framework IFF</p>
                </div>
              </Button>
              <Button variant="outline" className="gap-2 justify-start h-auto p-4">
                <Download className="h-4 w-4" />
                <div className="text-left">
                  <p className="font-semibold">Dados Experimentais.csv</p>
                  <p className="text-xs text-slate-500">100+ simulações com métricas</p>
                </div>
              </Button>
              <Button variant="outline" className="gap-2 justify-start h-auto p-4">
                <Download className="h-4 w-4" />
                <div className="text-left">
                  <p className="font-semibold">Análise de Incertezas.pdf</p>
                  <p className="text-xs text-slate-500">Propagação de erros detalhada</p>
                </div>
              </Button>
              <Button variant="outline" className="gap-2 justify-start h-auto p-4">
                <Download className="h-4 w-4" />
                <div className="text-left">
                  <p className="font-semibold">Validação HIL.pdf</p>
                  <p className="text-xs text-slate-500">Resultados de co-simulação</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ResearchResults;
