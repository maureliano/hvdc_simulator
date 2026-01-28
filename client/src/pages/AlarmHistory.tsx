import { useState, useMemo } from "react";
import { Calendar, Filter, AlertCircle, CheckCircle, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const SEVERITY_COLORS = {
  WARNING: "#f59e0b",
  CRITICAL: "#ef4444",
};

const STATUS_COLORS = {
  ACTIVE: "#ef4444",
  ACKNOWLEDGED: "#f59e0b",
  RESOLVED: "#10b981",
};

interface AlarmEvent {
  id: number;
  metricName: string;
  metricValue: number;
  threshold: number;
  severity: "WARNING" | "CRITICAL";
  status: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
  message: string;
  createdAt: Date;
  acknowledgedAt: Date | null;
  resolvedAt: Date | null;
  userId: number | null;
  testResultId: number | null;
  thresholdId: number | null;
  acknowledgedBy: string | null;
  resolvedBy: string | null;
  resolutionNotes: string | null;
  updatedAt: Date;
}

export function AlarmHistory() {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    severity: "",
    metricName: "",
    status: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch available metrics
  const { data: metrics = [] } = trpc.alarms.getMetrics.useQuery({});

  // Fetch filtered alarm history
  const { data: historyData, isLoading } = trpc.alarms.getHistoryWithFilters.useQuery(
    {
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
      severity: filters.severity as "WARNING" | "CRITICAL" | undefined,
      metricName: filters.metricName || undefined,
      status: filters.status as "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED" | undefined,
      limit: 1000,
      offset: 0,
    },
    { refetchInterval: 10000 }
  );

  const alarmEvents = historyData?.events || [];
  const total = historyData?.total || 0;

  // Calculate statistics
  const stats = useMemo(() => {
    const criticalCount = alarmEvents.filter((a: any) => a.severity === "CRITICAL").length;
    const warningCount = alarmEvents.filter((a: any) => a.severity === "WARNING").length;
    const resolvedCount = alarmEvents.filter((a: any) => a.status === "RESOLVED").length;
    const activeCount = alarmEvents.filter((a: any) => a.status === "ACTIVE").length;

    // Timeline data for chart
    const timelineData: Record<string, number> = {};
    alarmEvents.forEach((alarm: any) => {
      const date = new Date(alarm.createdAt).toLocaleDateString();
      timelineData[date] = (timelineData[date] || 0) + 1;
    });

    const timelineChartData = Object.entries(timelineData)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Last 7 days

    // Severity distribution
    const severityData = [
      { name: "Critical", value: criticalCount, fill: SEVERITY_COLORS.CRITICAL },
      { name: "Warning", value: warningCount, fill: SEVERITY_COLORS.WARNING },
    ];

    // Status distribution
    const statusData = [
      { name: "Active", value: activeCount, fill: STATUS_COLORS.ACTIVE },
      { name: "Acknowledged", value: alarmEvents.filter((a: any) => a.status === "ACKNOWLEDGED").length, fill: STATUS_COLORS.ACKNOWLEDGED },
      { name: "Resolved", value: resolvedCount, fill: STATUS_COLORS.RESOLVED },
    ];

    // Metric distribution
    const metricData: Record<string, number> = {};
    alarmEvents.forEach((alarm: any) => {
      metricData[alarm.metricName] = (metricData[alarm.metricName] || 0) + 1;
    });

    const metricChartData = Object.entries(metricData)
      .map(([metric, count]) => ({ metric, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      criticalCount,
      warningCount,
      resolvedCount,
      activeCount,
      timelineChartData,
      severityData,
      statusData,
      metricChartData,
    };
  }, [alarmEvents]);

  // Pagination
  const paginatedEvents = alarmEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(alarmEvents.length / itemsPerPage);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleReset = () => {
    setFilters({
      startDate: "",
      endDate: "",
      severity: "",
      metricName: "",
      status: "",
    });
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Histórico de Alarmes</h1>
          <p className="text-muted-foreground mt-2">
            Visualize e analise todos os alarmes IFF disparados no sistema
          </p>
        </div>
        <Link href="/trend-analysis">
          <Button variant="outline" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Tendências
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Alarmes Críticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.criticalCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Requerem atenção imediata</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avisos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{stats.warningCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Monitorar proximamente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.activeCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando ação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resolvidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.resolvedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Problema solucionado</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tendência de Alarmes (7 dias)</CardTitle>
            <CardDescription>Quantidade de alarmes por dia</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.timelineChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Severidade</CardTitle>
            <CardDescription>Total de alarmes por nível</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.severityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
            <CardDescription>Estado atual dos alarmes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {stats.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Métricas com Mais Alarmes</CardTitle>
            <CardDescription>Top 5 métricas problemáticas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.metricChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="metric" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Inicial</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data Final</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Severidade</label>
              <Select value={filters.severity} onValueChange={(value) => handleFilterChange("severity", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="WARNING">Aviso</SelectItem>
                  <SelectItem value="CRITICAL">Crítico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Métrica</label>
              <Select value={filters.metricName} onValueChange={(value) => handleFilterChange("metricName", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {metrics.map((metric: any) => (
                    <SelectItem key={metric} value={metric}>
                      {metric}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="ACTIVE">Ativo</SelectItem>
                  <SelectItem value="ACKNOWLEDGED">Reconhecido</SelectItem>
                  <SelectItem value="RESOLVED">Resolvido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleReset} variant="outline" className="w-full">
            Limpar Filtros
          </Button>
        </CardContent>
      </Card>

      {/* Alarm Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Eventos de Alarme ({alarmEvents.length} total)
          </CardTitle>
          <CardDescription>
            Mostrando {paginatedEvents.length} de {alarmEvents.length} alarmes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Carregando alarmes...</div>
            </div>
          ) : alarmEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground">Nenhum alarme encontrado com os filtros selecionados</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Data/Hora</th>
                      <th className="text-left py-3 px-4 font-medium">Métrica</th>
                      <th className="text-left py-3 px-4 font-medium">Valor</th>
                      <th className="text-left py-3 px-4 font-medium">Severidade</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Mensagem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEvents.map((alarm: any) => (
                      <tr key={alarm.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          {new Date(alarm.createdAt).toLocaleString("pt-BR")}
                        </td>
                        <td className="py-3 px-4 font-medium">{alarm.metricName}</td>
                        <td className="py-3 px-4">
                          {alarm.metricValue.toFixed(2)} / {alarm.threshold.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            style={{
                              backgroundColor: SEVERITY_COLORS[alarm.severity as keyof typeof SEVERITY_COLORS],
                              color: "white",
                            }}
                          >
                            {alarm.severity === "CRITICAL" ? "Crítico" : "Aviso"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            style={{
                              backgroundColor: STATUS_COLORS[alarm.status as keyof typeof STATUS_COLORS],
                              color: "white",
                            }}
                          >
                            {alarm.status === "ACTIVE"
                              ? "Ativo"
                              : alarm.status === "ACKNOWLEDGED"
                              ? "Reconhecido"
                              : "Resolvido"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground max-w-xs truncate">
                          {alarm.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
