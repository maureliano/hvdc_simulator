import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SimulationResults {
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
}

interface TestsChartProps {
  results: SimulationResults;
}

declare global {
  interface Window {
    Chart: any;
  }
}

export default function TestsChart({ results }: TestsChartProps) {
  const voltageChartRef = useRef<HTMLCanvasElement>(null);
  const powerChartRef = useRef<HTMLCanvasElement>(null);
  const efficiencyChartRef = useRef<HTMLCanvasElement>(null);
  const lossesChartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Load Chart.js from CDN
    if (window.Chart) {
      createCharts();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/chart.js";
      script.onload = createCharts;
      document.head.appendChild(script);
    }
  }, [results]);

  const createCharts = () => {
    const Chart = window.Chart;

    // Chart 1: Voltages
    if (voltageChartRef.current) {
      new Chart(voltageChartRef.current, {
        type: "bar",
        data: {
          labels: ["AC1", "AC2", "DC Rect", "DC Inv"],
          datasets: [
            {
              label: "Tensão (kV)",
              data: [
                results.acVoltage1,
                results.acVoltage2,
                results.dcVoltageRectifier,
                results.dcVoltageInverter,
              ],
              backgroundColor: ["#3b82f6", "#06b6d4", "#8b5cf6", "#ec4899"],
              borderColor: ["#1e40af", "#0891b2", "#6d28d9", "#be185d"],
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              labels: {
                color: "#e2e8f0",
              },
            },
          },
          scales: {
            y: {
              ticks: {
                color: "#94a3b8",
              },
              grid: {
                color: "#334155",
              },
            },
            x: {
              ticks: {
                color: "#94a3b8",
              },
              grid: {
                color: "#334155",
              },
            },
          },
        },
      });
    }

    // Chart 2: Power Flow
    if (powerChartRef.current) {
      new Chart(powerChartRef.current, {
        type: "line",
        data: {
          labels: ["Geração", "Transmissão", "Carga"],
          datasets: [
            {
              label: "Potência (MW)",
              data: [
                results.totalGeneration,
                results.powerTransmitted,
                results.totalLoad,
              ],
              borderColor: "#10b981",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: "#10b981",
              pointBorderColor: "#059669",
              pointRadius: 6,
              pointHoverRadius: 8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              labels: {
                color: "#e2e8f0",
              },
            },
          },
          scales: {
            y: {
              ticks: {
                color: "#94a3b8",
              },
              grid: {
                color: "#334155",
              },
            },
            x: {
              ticks: {
                color: "#94a3b8",
              },
              grid: {
                color: "#334155",
              },
            },
          },
        },
      });
    }

    // Chart 3: Efficiency
    if (efficiencyChartRef.current) {
      new Chart(efficiencyChartRef.current, {
        type: "doughnut",
        data: {
          labels: ["Retificador", "Inversor", "Sistema"],
          datasets: [
            {
              data: [
                results.rectifierEfficiency,
                results.inverterEfficiency,
                results.efficiency,
              ],
              backgroundColor: ["#f59e0b", "#8b5cf6", "#10b981"],
              borderColor: ["#d97706", "#6d28d9", "#059669"],
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              labels: {
                color: "#e2e8f0",
              },
            },
            tooltip: {
              callbacks: {
                label: function (context: any) {
                  return context.label + ": " + context.parsed + "%";
                },
              },
            },
          },
        },
      });
    }

    // Chart 4: Losses
    if (lossesChartRef.current) {
      new Chart(lossesChartRef.current, {
        type: "radar",
        data: {
          labels: [
            "Perdas Retificador",
            "Perdas Inversor",
            "Perdas Totais",
            "Carga",
          ],
          datasets: [
            {
              label: "MW",
              data: [
                results.rectifierLoss,
                results.inverterLoss,
                results.losses,
                results.totalLoad,
              ],
              borderColor: "#ef4444",
              backgroundColor: "rgba(239, 68, 68, 0.2)",
              borderWidth: 2,
              pointBackgroundColor: "#ef4444",
              pointBorderColor: "#dc2626",
              pointRadius: 5,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              labels: {
                color: "#e2e8f0",
              },
            },
          },
          scales: {
            r: {
              ticks: {
                color: "#94a3b8",
              },
              grid: {
                color: "#334155",
              },
            },
          },
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voltages Chart */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">Tensões do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <canvas
              ref={voltageChartRef}
              style={{ maxHeight: "300px" }}
            />
          </CardContent>
        </Card>

        {/* Power Flow Chart */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">Fluxo de Potência</CardTitle>
          </CardHeader>
          <CardContent>
            <canvas
              ref={powerChartRef}
              style={{ maxHeight: "300px" }}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Efficiency Chart */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">Eficiência (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <canvas
              ref={efficiencyChartRef}
              style={{ maxHeight: "300px" }}
            />
          </CardContent>
        </Card>

        {/* Losses Chart */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">Análise de Perdas</CardTitle>
          </CardHeader>
          <CardContent>
            <canvas
              ref={lossesChartRef}
              style={{ maxHeight: "300px" }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
