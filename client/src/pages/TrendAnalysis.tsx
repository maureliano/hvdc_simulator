import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Cell } from "recharts";
import { ArrowLeft, TrendingUp, AlertCircle, Clock, Zap } from "lucide-react";
import { Link } from "wouter";

export function TrendAnalysis() {
  const [daysBack, setDaysBack] = useState<number>(30);

  // Fetch trend analysis data
  const { data: trendData, isLoading: trendLoading } = trpc.alarms.getTrendAnalysis.useQuery({
    daysBack,
  });

  // Fetch correlation data
  const { data: correlationData, isLoading: correlationLoading } = trpc.alarms.getCorrelationAnalysis.useQuery({
    daysBack,
  });

  // Fetch heatmap data
  const { data: heatmapData, isLoading: heatmapLoading } = trpc.alarms.getHeatmapData.useQuery({
    daysBack: daysBack > 90 ? 90 : daysBack,
  });

  // Fetch resolution stats
  const { data: resolutionStats, isLoading: statsLoading } = trpc.alarms.getResolutionStats.useQuery({
    daysBack,
  });

  // Prepare heatmap visualization data
  const heatmapMatrix = useMemo(() => {
    if (!heatmapData) return [];
    
    const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
    const matrix: any[] = [];
    
    for (let day = 0; day < 7; day++) {
      const dayData: any = { day: daysOfWeek[day] };
      for (let hour = 0; hour < 24; hour++) {
        const heatmapEntry = heatmapData.find((h: any) => h.dayOfWeek === day && h.hour === hour);
        dayData[`h${hour}`] = heatmapEntry?.count || 0;
      }
      matrix.push(dayData);
    }
    
    return matrix;
  }, [heatmapData]);

  // Get color for heatmap intensity
  const getHeatmapColor = (value: number, max: number) => {
    if (value === 0) return "#1e293b";
    const intensity = value / max;
    if (intensity > 0.7) return "#dc2626";
    if (intensity > 0.4) return "#f97316";
    return "#fbbf24";
  };

  const maxHeatmapValue = useMemo(() => {
    if (!heatmapMatrix.length) return 1;
    return Math.max(...heatmapMatrix.flatMap((row: any) => 
      Object.values(row).filter((v: any) => typeof v === "number") as number[]
    ));
  }, [heatmapMatrix]);

  const isLoading = trendLoading || correlationLoading || heatmapLoading || statsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/alarm-history">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Análise de Tendências</h1>
                <p className="text-sm text-slate-400">Identificar padrões e correlações de alarmes</p>
              </div>
            </div>
            <Select value={daysBack.toString()} onValueChange={(v) => setDaysBack(parseInt(v))}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="14">Últimos 14 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-400">Carregando dados de tendências...</p>
            </div>
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Total de Alarmes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">
                    {trendData?.byMetric.reduce((sum: number, m: any) => sum + m.count, 0) || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    Críticos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-500">
                    {trendData?.byMetric.reduce((sum: number, m: any) => sum + m.critical, 0) || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    Tempo Médio Resolução
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-500">
                    {resolutionStats?.averageResolutionTime.toFixed(0) || 0} min
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    Não Resolvidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-500">
                    {resolutionStats?.unresolvedCount || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tendência Diária */}
            <Card className="bg-slate-800/50 border-slate-700 mb-8">
              <CardHeader>
                <CardTitle>Tendência de Alarmes (Diária)</CardTitle>
                <CardDescription>Evolução do número de alarmes ao longo do período</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData?.daily || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                      labelStyle={{ color: "#e2e8f0" }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" name="Total" strokeWidth={2} />
                    <Line type="monotone" dataKey="critical" stroke="#dc2626" name="Críticos" strokeWidth={2} />
                    <Line type="monotone" dataKey="warning" stroke="#f97316" name="Avisos" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Padrão por Hora */}
            <Card className="bg-slate-800/50 border-slate-700 mb-8">
              <CardHeader>
                <CardTitle>Padrão Horário de Alarmes</CardTitle>
                <CardDescription>Distribuição de alarmes por hora do dia</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trendData?.hourly || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="hour" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                      labelStyle={{ color: "#e2e8f0" }}
                    />
                    <Legend />
                    <Bar dataKey="count" fill="#3b82f6" name="Total" />
                    <Bar dataKey="critical" fill="#dc2626" name="Críticos" />
                    <Bar dataKey="warning" fill="#f97316" name="Avisos" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Heatmap */}
            <Card className="bg-slate-800/50 border-slate-700 mb-8">
              <CardHeader>
                <CardTitle>Heatmap de Alarmes</CardTitle>
                <CardDescription>Intensidade de alarmes por dia da semana e hora</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left py-2 px-2 text-slate-400">Dia</th>
                        {Array.from({ length: 24 }).map((_, i) => (
                          <th key={i} className="text-center py-2 px-1 text-xs text-slate-400">
                            {i}h
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {heatmapMatrix.map((row: any, dayIdx: number) => (
                        <tr key={dayIdx}>
                          <td className="py-2 px-2 text-slate-300 font-medium">{row.day}</td>
                          {Array.from({ length: 24 }).map((_, hour) => {
                            const value = row[`h${hour}`] || 0;
                            const color = getHeatmapColor(value, maxHeatmapValue);
                            return (
                              <td
                                key={hour}
                                className="py-2 px-1 text-center text-xs"
                                style={{
                                  backgroundColor: color,
                                  color: value > 0 ? "#fff" : "#64748b",
                                }}
                                title={`${row.day} ${hour}h: ${value} alarmes`}
                              >
                                {value > 0 ? value : ""}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Métricas Mais Problemáticas */}
            <Card className="bg-slate-800/50 border-slate-700 mb-8">
              <CardHeader>
                <CardTitle>Métricas Mais Problemáticas</CardTitle>
                <CardDescription>Ranking de métricas com mais alarmes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={trendData?.byMetric.slice(0, 10) || []}
                    layout="vertical"
                    margin={{ left: 150 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" stroke="#94a3b8" />
                    <YAxis dataKey="metric" type="category" stroke="#94a3b8" width={140} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                      labelStyle={{ color: "#e2e8f0" }}
                    />
                    <Legend />
                    <Bar dataKey="count" fill="#3b82f6" name="Total" />
                    <Bar dataKey="critical" fill="#dc2626" name="Críticos" />
                    <Bar dataKey="warning" fill="#f97316" name="Avisos" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Correlações entre Métricas */}
            <Card className="bg-slate-800/50 border-slate-700 mb-8">
              <CardHeader>
                <CardTitle>Correlações entre Métricas</CardTitle>
                <CardDescription>Métricas que frequentemente disparam alarmes juntas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {correlationData?.correlations && correlationData.correlations.length > 0 ? (
                    correlationData.correlations.map((corr: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {corr.metric1}
                            </Badge>
                            <span className="text-slate-400">↔</span>
                            <Badge variant="outline" className="text-xs">
                              {corr.metric2}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            Co-ocorrência em {corr.coOccurrenceCount} períodos
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-400">
                            {corr.percentage.toFixed(1)}%
                          </div>
                          <p className="text-xs text-slate-400">do tempo</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-center py-4">Sem correlações significativas encontradas</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas de Resolução */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Estatísticas de Resolução</CardTitle>
                <CardDescription>Tempo médio para resolver alarmes por severidade</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <p className="text-sm text-slate-400 mb-2">Alarmes Críticos</p>
                    <div className="text-3xl font-bold text-red-500 mb-2">
                      {resolutionStats?.criticalResolutionTime.toFixed(0) || 0} min
                    </div>
                    <p className="text-xs text-slate-500">Tempo médio de resolução</p>
                  </div>
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <p className="text-sm text-slate-400 mb-2">Alarmes de Aviso</p>
                    <div className="text-3xl font-bold text-yellow-500 mb-2">
                      {resolutionStats?.warningResolutionTime.toFixed(0) || 0} min
                    </div>
                    <p className="text-xs text-slate-500">Tempo médio de resolução</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}

export default TrendAnalysis;
