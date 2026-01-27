import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Clock, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AlarmEvent {
  id: number;
  metricName: string;
  metricValue: number;
  threshold: number;
  severity: "WARNING" | "CRITICAL";
  status: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
  message: string;
  createdAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}

interface AlarmThreshold {
  id: number;
  metricName: string;
  criticalThreshold: number;
  warningThreshold: number;
  enabled: boolean;
  description?: string;
}

export function AlarmPanel() {
  const [activeAlarms, setActiveAlarms] = useState<AlarmEvent[]>([]);
  const [thresholds, setThresholds] = useState<AlarmThreshold[]>([]);
  const [showThresholdForm, setShowThresholdForm] = useState(false);
  const [newThreshold, setNewThreshold] = useState({
    metricName: "overallIFFScore",
    criticalThreshold: 50,
    warningThreshold: 70,
    description: "",
  });

  // Queries
  const { data: alarmsData, refetch: refetchAlarms } = trpc.alarms.getActiveAlarms.useQuery(
    { limit: 100 },
    { refetchInterval: 5000 } // Atualizar a cada 5 segundos
  );

  const { data: thresholdsData, refetch: refetchThresholds } = trpc.alarms.getThresholds.useQuery(
    {},
    { refetchInterval: 10000 }
  );

  const { data: statsData } = trpc.alarms.getStatistics.useQuery(
    {},
    { refetchInterval: 10000 }
  );

  // Mutations
  const createThresholdMutation = trpc.alarms.createThreshold.useMutation({
    onSuccess: () => {
      refetchThresholds();
      setNewThreshold({
        metricName: "overallIFFScore",
        criticalThreshold: 50,
        warningThreshold: 70,
        description: "",
      });
      setShowThresholdForm(false);
    },
  });

  const acknowledgeMutation = trpc.alarms.acknowledge.useMutation({
    onSuccess: () => {
      refetchAlarms();
    },
  });

  const resolveMutation = trpc.alarms.resolve.useMutation({
    onSuccess: () => {
      refetchAlarms();
    },
  });

  const deleteThresholdMutation = trpc.alarms.deleteThreshold.useMutation({
    onSuccess: () => {
      refetchThresholds();
    },
  });

  // Update state when data changes
  useEffect(() => {
    if (alarmsData) {
      setActiveAlarms(alarmsData);
    }
  }, [alarmsData]);

  useEffect(() => {
    if (thresholdsData) {
      setThresholds(thresholdsData);
    }
  }, [thresholdsData]);

  const handleCreateThreshold = async () => {
    await createThresholdMutation.mutateAsync({
      metricName: newThreshold.metricName,
      criticalThreshold: newThreshold.criticalThreshold,
      warningThreshold: newThreshold.warningThreshold,
      description: newThreshold.description || undefined,
    });
  };

  const handleAcknowledge = async (alarmId: number) => {
    await acknowledgeMutation.mutateAsync({
      id: alarmId,
      acknowledgedBy: "System",
    });
  };

  const handleResolve = async (alarmId: number) => {
    await resolveMutation.mutateAsync({
      id: alarmId,
      resolvedBy: "System",
      resolutionNotes: "Resolved by user",
    });
  };

  const handleDeleteThreshold = async (thresholdId: number) => {
    await deleteThresholdMutation.mutateAsync({ id: thresholdId });
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas de Alarmes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-700 p-4">
          <div className="text-sm text-slate-400">Total Ativos</div>
          <div className="text-3xl font-bold text-blue-400">{statsData?.totalActive || 0}</div>
        </Card>
        <Card className="bg-slate-900 border-red-700 p-4">
          <div className="text-sm text-slate-400">Críticos</div>
          <div className="text-3xl font-bold text-red-500">{statsData?.criticalCount || 0}</div>
        </Card>
        <Card className="bg-slate-900 border-yellow-700 p-4">
          <div className="text-sm text-slate-400">Avisos</div>
          <div className="text-3xl font-bold text-yellow-500">{statsData?.warningCount || 0}</div>
        </Card>
        <Card className="bg-slate-900 border-slate-700 p-4">
          <div className="text-sm text-slate-400">Histórico</div>
          <div className="text-3xl font-bold text-slate-400">{statsData?.totalHistorical || 0}</div>
        </Card>
      </div>

      {/* Alarmes Ativos */}
      <Card className="bg-slate-900 border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          Alarmes Ativos
        </h3>

        {activeAlarms.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
            <p>Nenhum alarme ativo</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeAlarms.map((alarm) => (
              <div
                key={alarm.id}
                className={`p-4 rounded-lg border-l-4 ${
                  alarm.severity === "CRITICAL"
                    ? "bg-red-950 border-red-500"
                    : "bg-yellow-950 border-yellow-500"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          alarm.severity === "CRITICAL"
                            ? "bg-red-600 text-white"
                            : "bg-yellow-600 text-white"
                        }`}
                      >
                        {alarm.severity}
                      </span>
                      <span className="text-sm text-slate-300">{alarm.metricName}</span>
                    </div>
                    <p className="text-sm text-slate-200 mb-2">{alarm.message}</p>
                    <div className="text-xs text-slate-400">
                      <div>Valor: {alarm.metricValue.toFixed(2)}</div>
                      <div>Threshold: {alarm.threshold.toFixed(2)}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(alarm.createdAt).toLocaleString("pt-BR")}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {alarm.status === "ACTIVE" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAcknowledge(alarm.id)}
                          className="text-xs"
                        >
                          Reconhecer
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleResolve(alarm.id)}
                          className="text-xs"
                        >
                          Resolver
                        </Button>
                      </>
                    )}
                    {alarm.status === "ACKNOWLEDGED" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleResolve(alarm.id)}
                        className="text-xs"
                      >
                        Resolver
                      </Button>
                    )}
                    {alarm.status === "RESOLVED" && (
                      <span className="text-xs text-green-400 font-semibold">Resolvido</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Configuração de Thresholds */}
      <Card className="bg-slate-900 border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Thresholds de Alarme</h3>
          <Button
            size="sm"
            onClick={() => setShowThresholdForm(!showThresholdForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {showThresholdForm ? "Cancelar" : "Novo Threshold"}
          </Button>
        </div>

        {showThresholdForm && (
          <div className="mb-6 p-4 bg-slate-800 rounded-lg space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Métrica</label>
              <select
                value={newThreshold.metricName}
                onChange={(e) => setNewThreshold({ ...newThreshold, metricName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
              >
                <option value="overallIFFScore">Overall IFF Score</option>
                <option value="dynamicFidelityIndex">Dynamic Fidelity Index</option>
                <option value="confidenceLevel">Confidence Level</option>
                <option value="overallUncertaintyPercent">Overall Uncertainty %</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Threshold Crítico</label>
                <input
                  type="number"
                  value={newThreshold.criticalThreshold}
                  onChange={(e) =>
                    setNewThreshold({
                      ...newThreshold,
                      criticalThreshold: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Threshold Aviso</label>
                <input
                  type="number"
                  value={newThreshold.warningThreshold}
                  onChange={(e) =>
                    setNewThreshold({
                      ...newThreshold,
                      warningThreshold: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Descrição (opcional)</label>
              <input
                type="text"
                value={newThreshold.description}
                onChange={(e) => setNewThreshold({ ...newThreshold, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                placeholder="Ex: Monitorar score IFF durante testes"
              />
            </div>

            <Button
              onClick={handleCreateThreshold}
              disabled={createThresholdMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {createThresholdMutation.isPending ? "Criando..." : "Criar Threshold"}
            </Button>
          </div>
        )}

        {thresholds.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p>Nenhum threshold configurado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {thresholds.map((threshold) => (
              <div key={threshold.id} className="p-4 bg-slate-800 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-2">{threshold.metricName}</h4>
                    {threshold.description && (
                      <p className="text-sm text-slate-400 mb-2">{threshold.description}</p>
                    )}
                    <div className="text-sm text-slate-300 space-y-1">
                      <div>
                        <span className="text-red-400">Crítico:</span> &lt;{" "}
                        {threshold.criticalThreshold.toFixed(2)}
                      </div>
                      <div>
                        <span className="text-yellow-400">Aviso:</span> &lt;{" "}
                        {threshold.warningThreshold.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteThreshold(threshold.id)}
                    disabled={deleteThresholdMutation.isPending}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
