import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, TrendingUp, Activity, Shield, Gauge } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

interface IFFReport {
  timestamp: number;
  overall_iff_score: number;
  system_trustworthiness: "high" | "medium" | "low";
  agentic_decision: {
    action: "ALLOW" | "BLOCK";
  };
}

export default function IFFAnalytics() {
  const [reports, setReports] = useState<IFFReport[]>([]);

  // Fetch real data from database
  const { data: historyData, isLoading } = trpc.iff.getHistory.useQuery({ limit: 100 });

  useEffect(() => {
    // Use real data if available
    if (historyData && historyData.length > 0) {
      const mappedData = historyData.map((test: any) => ({
        timestamp: test.createdAt?.getTime?.() || Date.now(),
        overall_iff_score: test.overallIFFScore || 0.75,
        system_trustworthiness: (test.systemTrustworthiness as "high" | "medium" | "low") || "medium",
        agentic_decision: {
          action: (test.agenticDecision as "ALLOW" | "BLOCK") || "ALLOW",
        },
      }));
      setReports(mappedData);
    } else if (!isLoading) {
      // Show empty state
      setReports([]);
    }
  }, [historyData, isLoading]);

  // Prepare chart data
  const chartData = reports
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((report) => ({
      time: new Date(report.timestamp).toLocaleTimeString(),
      score: parseFloat((report.overall_iff_score * 100).toFixed(2)),
      trustworthiness: report.system_trustworthiness === "high" ? 100 : report.system_trustworthiness === "medium" ? 50 : 0,
    }));

  // Decision distribution
  const decisionCounts = {
    allow: reports.filter((r) => r.agentic_decision.action === "ALLOW").length,
    block: reports.filter((r) => r.agentic_decision.action === "BLOCK").length,
  };

  const decisionData = [
    { name: "ALLOW", value: decisionCounts.allow, fill: "#22c55e" },
    { name: "BLOCK", value: decisionCounts.block, fill: "#ef4444" },
  ];

  // Trustworthiness distribution
  const trustCounts = {
    high: reports.filter((r) => r.system_trustworthiness === "high").length,
    medium: reports.filter((r) => r.system_trustworthiness === "medium").length,
    low: reports.filter((r) => r.system_trustworthiness === "low").length,
  };

  const trustData = [
    { name: "High", value: trustCounts.high, fill: "#22c55e" },
    { name: "Medium", value: trustCounts.medium, fill: "#eab308" },
    { name: "Low", value: trustCounts.low, fill: "#ef4444" },
  ];

  // Statistics
  const avgScore = reports.length > 0 ? (reports.reduce((sum, r) => sum + r.overall_iff_score, 0) / reports.length * 100).toFixed(2) : "0";
  const highTrust = trustCounts.high;
  const blockRate = reports.length > 0 ? ((decisionCounts.block / (decisionCounts.allow + decisionCounts.block)) * 100).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">IFF Analytics Dashboard</h1>
            <p className="text-slate-400">
              {reports.length > 0 ? "Dados em tempo real do banco de dados" : "Aguardando dados de testes IFF"}
            </p>
          </div>
        </div>

        {/* Empty State */}
        {reports.length === 0 && !isLoading && (
          <Card className="bg-slate-800/50 border-slate-700 p-8">
            <div className="text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-slate-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-slate-300 mb-2">Nenhum teste IFF realizado</h3>
                <p className="text-slate-400 mb-4">Execute testes IFF na página de Testes para visualizar dados aqui</p>
                <Link href="/iff-test-scenarios">
                  <Button className="gap-2">
                    <Gauge className="h-4 w-4" />
                    Ir para Testes
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Key Metrics */}
        {reports.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Avg IFF Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-cyan-400">{avgScore}%</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    High Trustworthiness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400">{highTrust}</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Block Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-400">{blockRate}%</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Total Tests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-400">{reports.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* IFF Score Trend */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">IFF Score Trend</CardTitle>
                  <CardDescription>Score over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="time" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                      <Legend />
                      <Line type="monotone" dataKey="score" stroke="#06b6d4" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Decision Distribution */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Agentic Decisions</CardTitle>
                  <CardDescription>Distribution of ALLOW/BLOCK decisions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={decisionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                      <Bar dataKey="value" fill="#06b6d4" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Trustworthiness Distribution */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">System Trustworthiness</CardTitle>
                  <CardDescription>Distribution across levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={trustData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                      <Bar dataKey="value" fill="#06b6d4" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Test Statistics</CardTitle>
                  <CardDescription>Summary of test results</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Total Tests:</span>
                      <span className="text-white font-semibold">{reports.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Avg Score:</span>
                      <span className="text-cyan-400 font-semibold">{avgScore}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">High Trust:</span>
                      <span className="text-green-400 font-semibold">{highTrust}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Block Rate:</span>
                      <span className="text-red-400 font-semibold">{blockRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
