import { useState, useMemo } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default function EventHistory() {
  const [eventType, setEventType] = useState<"all" | "test" | "alarm">("all");
  const [severity, setSeverity] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [page, setPage] = useState(0);
  const limit = 20;

  // Fetch events
  const { data: events, isLoading: eventsLoading } = trpc.events.getAll.useQuery({
    eventType,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
    limit,
    offset: page * limit,
  });

  // Fetch statistics
  const { data: stats } = trpc.events.getStats.useQuery({
    daysBack: 30,
  });

  // Fetch timeline
  const { data: timeline } = trpc.events.getTimeline.useQuery({
    daysBack: 30,
  });

  // Filter events by severity
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    if (severity === "all") return events;
    return events.filter((e) => e.severity === severity);
  }, [events, severity]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-500/10 text-red-700 border-red-200";
      case "WARNING":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      case "INFO":
        return "bg-blue-500/10 text-blue-700 border-blue-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (type: string, severity: string) => {
    if (type === "alarm") {
      return severity === "CRITICAL" ? (
        <AlertCircle className="w-5 h-5 text-red-500" />
      ) : (
        <AlertCircle className="w-5 h-5 text-yellow-500" />
      );
    }
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Histórico de Eventos</h1>
              <p className="text-slate-400">Visualize todos os eventos e alarmes registrados no sistema</p>
            </div>
            <Link href="/">
              <Button variant="outline">← Voltar</Button>
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Testes Totais</p>
                    <p className="text-3xl font-bold text-white">{stats.totalTests}</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Alarmes Críticos</p>
                    <p className="text-3xl font-bold text-red-500">{stats.criticalAlarms}</p>
                  </div>
                  <AlertCircle className="w-10 h-10 text-red-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Alarmes Avisos</p>
                    <p className="text-3xl font-bold text-yellow-500">{stats.warningAlarms}</p>
                  </div>
                  <AlertCircle className="w-10 h-10 text-yellow-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">IFF Médio</p>
                    <p className="text-3xl font-bold text-blue-500">{(stats.averageIFFScore * 100).toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Tipo de Evento</label>
                <Select value={eventType} onValueChange={(v: any) => setEventType(v)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="test">Testes IFF</SelectItem>
                    <SelectItem value="alarm">Alarmes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Severidade</label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="CRITICAL">Crítico</SelectItem>
                    <SelectItem value="WARNING">Aviso</SelectItem>
                    <SelectItem value="INFO">Informação</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Data Inicial</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Data Final</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Eventos ({filteredEvents.length})</CardTitle>
            <CardDescription>Clique em um evento para ver detalhes</CardDescription>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Clock className="w-6 h-6 text-slate-400 animate-spin" />
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400">Nenhum evento encontrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEvents.map((event: any) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
                  >
                    <div className="mt-1">{getStatusIcon(event.type, event.severity)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold truncate">{event.title}</h3>
                        <Badge className={getSeverityColor(event.severity)}>{event.severity}</Badge>
                        {event.type === "alarm" && event.status && (
                          <Badge variant="outline" className="border-slate-500 text-slate-300">
                            {event.status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm mb-2">{event.description}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(event.timestamp), "dd/MM/yyyy HH:mm:ss")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {filteredEvents.length > 0 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-600">
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                >
                  ← Anterior
                </Button>
                <span className="text-slate-400">Página {page + 1}</span>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={filteredEvents.length < limit}
                >
                  Próxima →
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        {timeline && timeline.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700 mt-8">
            <CardHeader>
              <CardTitle className="text-white">Timeline de Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.map((day: any) => (
                  <div key={day.date} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5"></div>
                      <div className="w-0.5 h-12 bg-slate-600 my-1"></div>
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-white font-semibold">{format(new Date(day.date), "dd/MM/yyyy")}</p>
                      <div className="flex gap-2 mt-2">
                        {day.criticalCount > 0 && (
                          <Badge className="bg-red-500/10 text-red-700 border-red-200">
                            {day.criticalCount} Crítico
                          </Badge>
                        )}
                        {day.warningCount > 0 && (
                          <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-200">
                            {day.warningCount} Aviso
                          </Badge>
                        )}
                        <Badge variant="outline" className="border-slate-500 text-slate-300">
                          {day.totalCount} total
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
