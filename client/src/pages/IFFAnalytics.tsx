import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, Activity, Shield, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface IFFReport {
  timestamp: number;
  overall_iff_score: number;
  system_trustworthiness: "high" | "medium" | "low" | "critical";
  dynamic_fidelity: {
    dynamic_fidelity_index: number;
    status: "excellent" | "good" | "acceptable" | "poor" | "critical";
  };
  uncertainty_analysis: {
    overall_uncertainty_percent: number;
    confidence_level: number;
  };
  agentic_decision: {
    action: string;
  };
}

export default function IFFAnalytics() {
  const [reports, setReports] = useState<IFFReport[]>([]);
  const [trend, setTrend] = useState<{ trend: "improving" | "stable" | "degrading"; rate: number }>({
    trend: "stable",
    rate: 0,
  });
  const [scientificReport, setScientificReport] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<"1h" | "24h" | "7d" | "all">("1h");

  // Fetch reports
  const { data: historyData } = trpc.iff.getReportHistory.useQuery({ limit: 1000 });
  const { data: trendData } = trpc.iff.getIFFTrend.useQuery();
  const { data: scientificData } = trpc.iff.generateScientificReport.useQuery();

  useEffect(() => {
    if (historyData) {
      setReports(historyData as IFFReport[]);
    }
  }, [historyData]);

  useEffect(() => {
    if (trendData) {
      setTrend(trendData);
    }
  }, [trendData]);

  useEffect(() => {
    if (scientificData) {
      setScientificReport(scientificData);
    }
  }, [scientificData]);

  // Preparar dados para gráficos
  const chartData = reports
    .slice(-100)
    .map((r) => ({
      timestamp: new Date(r.timestamp).toLocaleTimeString(),
      iff_score: r.overall_iff_score,
      dfi: r.dynamic_fidelity.dynamic_fidelity_index,
      uncertainty: r.uncertainty_analysis.overall_uncertainty_percent,
      confidence: r.uncertainty_analysis.confidence_level * 100,
    }));

  // Distribuição de decisões
  const decisionDistribution = reports.reduce(
    (acc, r) => {
      const action = r.agentic_decision.action;
      acc[action] = (acc[action] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const decisionData = Object.entries(decisionDistribution).map(([name, value]) => ({
    name,
    value,
    percentage: ((value / reports.length) * 100).toFixed(1),
  }));

  // Distribuição de confiabilidade
  const trustDistribution = reports.reduce(
    (acc, r) => {
      const trust = r.system_trustworthiness;
      acc[trust] = (acc[trust] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const trustData = Object.entries(trustDistribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    percentage: ((value / reports.length) * 100).toFixed(1),
  }));

  // Heatmap de confiabilidade
  const heatmapData = reports
    .slice(-60)
    .map((r) => ({
      time: new Date(r.timestamp).toLocaleTimeString(),
      score: r.overall_iff_score,
      trust: r.system_trustworthiness,
    }));

  const getTrustColor = (trust: string) => {
    switch (trust) {
      case "high":
        return "#10b981";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#ef4444";
      case "critical":
        return "#7c3aed";
      default:
        return "#6b7280";
    }
  };

  const getTrustBadgeColor = (trust: string) => {
    switch (trust) {
      case "high":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "critical":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const avgIFFScore =
    reports.length > 0 ? (reports.reduce((sum, r) => sum + r.overall_iff_score, 0) / reports.length).toFixed(2) : "0";

  const latestReport = reports[reports.length - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Dashboard IFF Analytics</h1>
              <p className="text-slate-400">
                Análise em tempo real do Índice de Fidelidade Física para Digital Twins HVDC
              </p>
            </div>
            <div className="flex gap-2">
              {(["1h", "24h", "7d", "all"] as const).map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                  className="border-slate-600"
                >
                  {period === "1h" ? "1h" : period === "24h" ? "24h" : period === "7d" ? "7d" : "Tudo"}
                </Button>
              ))}
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Score IFF Médio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{avgIFFScore}</div>
                <p className="text-xs text-slate-500 mt-1">últimas {reports.length} avaliações</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Tendência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white capitalize">{trend.trend}</div>
                <p className="text-xs text-slate-500 mt-1">{trend.rate.toFixed(3)} pts/seg</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Confiabilidade Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latestReport && (
                  <div>
                    <Badge className={`${getTrustBadgeColor(latestReport.system_trustworthiness)} border`}>
                      {latestReport.system_trustworthiness.toUpperCase()}
                    </Badge>
                    <p className="text-xs text-slate-500 mt-1">{latestReport.overall_iff_score.toFixed(1)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Decisão Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latestReport && (
                  <div>
                    <div className="text-3xl font-bold text-white">{latestReport.agentic_decision.action}</div>
                    <p className="text-xs text-slate-500 mt-1">ação agêntica</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Gráficos Principais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Tendência de Score IFF */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Tendência de Score IFF</CardTitle>
              <CardDescription>Evolução do índice de fidelidade ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorIFF" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="timestamp" stroke="#94a3b8" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#e2e8f0" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="iff_score"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorIFF)"
                    name="IFF Score"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Fidelidade Dinâmica vs Incerteza */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Fidelidade Dinâmica vs Incerteza</CardTitle>
              <CardDescription>Relação entre DFI e nível de incerteza</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="timestamp" stroke="#94a3b8" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#e2e8f0" }}
                  />
                  <Legend wrapperStyle={{ color: "#e2e8f0" }} />
                  <Line
                    type="monotone"
                    dataKey="dfi"
                    stroke="#10b981"
                    name="Fidelidade Dinâmica (%)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="uncertainty"
                    stroke="#ef4444"
                    name="Incerteza (%)"
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Distribuições */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Distribuição de Decisões */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Distribuição de Decisões Agênticas</CardTitle>
              <CardDescription>Frequência de cada ação de decisão</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={decisionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#e2e8f0" }}
                    formatter={(value: any) => `${value} (${decisionData.find((d) => d.value === value)?.percentage}%)`}
                  />
                  <Bar dataKey="value" fill="#8b5cf6" name="Ocorrências" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribuição de Confiabilidade */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Distribuição de Confiabilidade</CardTitle>
              <CardDescription>Classificação de confiabilidade do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trustData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#e2e8f0" }}
                    formatter={(value: any) => `${value} (${trustData.find((d) => d.value === value)?.percentage}%)`}
                  />
                  <Bar dataKey="value" fill="#06b6d4" name="Ocorrências" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Heatmap de Confiabilidade */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Heatmap de Confiabilidade Temporal</CardTitle>
            <CardDescription>Visualização temporal do nível de confiabilidade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {heatmapData.map((data, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-24 text-xs text-slate-400">{data.time}</div>
                  <div className="flex-1 h-8 bg-slate-700 rounded flex items-center px-2 relative overflow-hidden">
                    <div
                      className="h-full rounded absolute left-0 top-0"
                      style={{
                        width: `${data.score}%`,
                        backgroundColor: getTrustColor(data.trust),
                        opacity: 0.7,
                      }}
                    />
                    <span className="text-xs text-white font-semibold relative z-10">{data.score.toFixed(1)}</span>
                  </div>
                  <Badge className={`${getTrustBadgeColor(data.trust)} border text-xs`}>
                    {data.trust.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Relatório Científico */}
        {scientificReport && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Relatório Científico
              </CardTitle>
              <CardDescription>Sumário para publicação acadêmica</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Framework</h3>
                  <p className="text-white font-bold mb-2">{scientificReport.framework_name}</p>
                  <div className="space-y-2 text-sm text-slate-400">
                    {Object.entries(scientificReport.dimensions).map(([key, value]: [string, any]) => (
                      <div key={key}>
                        <span className="font-semibold text-slate-300">{key}:</span> {value}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Estatísticas</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500">Avaliações Realizadas</p>
                      <p className="text-2xl font-bold text-white">{scientificReport.evaluation_count}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Score IFF Médio</p>
                      <p className="text-2xl font-bold text-white">{scientificReport.average_iff_score}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Tendência</p>
                      <p className="text-sm text-slate-300">{scientificReport.trend}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
