import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface ResultsChartsProps {
  result: any;
}

export default function ResultsCharts({ result }: ResultsChartsProps) {
  if (!result || !result.success) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">
            Execute uma simulação para visualizar os resultados
          </p>
        </CardContent>
      </Card>
    );
  }

  const buses = result.buses || [];
  const transformers = result.transformers || [];
  const lines = result.lines || [];

  // Bus voltage data
  const busVoltageData = buses.map((bus: any) => ({
    name: bus.name.split(" ")[0] + " " + bus.name.split(" ")[1],
    voltage: bus.vm_pu,
    angle: bus.va_degree,
  }));

  // Power flow data
  const powerFlowData = [
    {
      name: "Geração",
      value: result.summary.total_generation_mw,
      color: "oklch(0.65 0.25 240)",
    },
    {
      name: "Carga",
      value: result.summary.total_load_mw,
      color: "oklch(0.55 0.20 200)",
    },
    {
      name: "Perdas",
      value: result.summary.total_losses_mw,
      color: "oklch(0.75 0.20 60)",
    },
  ];

  // Transformer loading data
  const transformerData = transformers.map((t: any) => ({
    name: t.name,
    loading: t.loading_percent,
    p_hv: Math.abs(t.p_hv_mw),
    p_lv: Math.abs(t.p_lv_mw),
    losses: t.pl_mw,
  }));

  // Line data
  const lineData = lines.map((l: any) => ({
    name: l.name,
    current: l.i_ka,
    loading: l.loading_percent,
    losses: l.pl_mw,
  }));

  const COLORS = [
    "oklch(0.65 0.25 240)",
    "oklch(0.55 0.20 200)",
    "oklch(0.70 0.18 160)",
    "oklch(0.75 0.20 60)",
    "oklch(0.60 0.22 340)",
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bus Voltages */}
      <Card className="bg-gradient-to-br from-card to-card/50">
        <CardHeader>
          <CardTitle className="text-primary">Tensões nos Barramentos</CardTitle>
          <CardDescription>Perfil de tensão em p.u.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={busVoltageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.03 260)" />
              <XAxis dataKey="name" stroke="oklch(0.65 0.01 260)" />
              <YAxis stroke="oklch(0.65 0.01 260)" domain={[0.95, 1.15]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.16 0.02 260)",
                  border: "1px solid oklch(0.25 0.03 260)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="voltage" fill="oklch(0.65 0.25 240)" name="Tensão (p.u.)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Power Distribution */}
      <Card className="bg-gradient-to-br from-card to-card/50">
        <CardHeader>
          <CardTitle className="text-accent">Distribuição de Potência</CardTitle>
          <CardDescription>Balanço energético do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={powerFlowData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value.toFixed(1)} MW`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {powerFlowData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.16 0.02 260)",
                  border: "1px solid oklch(0.25 0.03 260)",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Transformer Loading */}
      <Card className="bg-gradient-to-br from-card to-card/50">
        <CardHeader>
          <CardTitle className="text-chart-3">Carregamento dos Transformadores</CardTitle>
          <CardDescription>Percentual de carga e perdas</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={transformerData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.03 260)" />
              <XAxis dataKey="name" stroke="oklch(0.65 0.01 260)" />
              <YAxis stroke="oklch(0.65 0.01 260)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.16 0.02 260)",
                  border: "1px solid oklch(0.25 0.03 260)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="loading" fill="oklch(0.70 0.18 160)" name="Carregamento (%)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="losses" fill="oklch(0.75 0.20 60)" name="Perdas (MW)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Line Current and Loading */}
      <Card className="bg-gradient-to-br from-card to-card/50">
        <CardHeader>
          <CardTitle className="text-chart-4">Link DC - Corrente e Carregamento</CardTitle>
          <CardDescription>Parâmetros da linha de transmissão</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.03 260)" />
              <XAxis dataKey="name" stroke="oklch(0.65 0.01 260)" />
              <YAxis stroke="oklch(0.65 0.01 260)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.16 0.02 260)",
                  border: "1px solid oklch(0.25 0.03 260)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="current" stroke="oklch(0.65 0.25 240)" name="Corrente (kA)" strokeWidth={3} />
              <Line type="monotone" dataKey="loading" stroke="oklch(0.55 0.20 200)" name="Carregamento (%)" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Results Table */}
      <Card className="bg-gradient-to-br from-card to-card/50 lg:col-span-2">
        <CardHeader>
          <CardTitle>Resultados Detalhados</CardTitle>
          <CardDescription>Parâmetros completos da simulação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Buses Table */}
            <div>
              <h3 className="text-sm font-semibold text-primary mb-3">Barramentos</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr className="text-left">
                      <th className="pb-2 text-muted-foreground">Nome</th>
                      <th className="pb-2 text-muted-foreground">Tensão (p.u.)</th>
                      <th className="pb-2 text-muted-foreground">Ângulo (°)</th>
                      <th className="pb-2 text-muted-foreground">P (MW)</th>
                      <th className="pb-2 text-muted-foreground">Q (MVAr)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {buses.map((bus: any, idx: number) => (
                      <tr key={idx} className="hover:bg-muted/20">
                        <td className="py-2 font-medium">{bus.name}</td>
                        <td className="py-2 font-mono text-primary">{bus.vm_pu.toFixed(4)}</td>
                        <td className="py-2 font-mono text-accent">{bus.va_degree.toFixed(2)}</td>
                        <td className="py-2 font-mono">{bus.p_mw.toFixed(2)}</td>
                        <td className="py-2 font-mono">{bus.q_mvar.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Transformers Table */}
            <div>
              <h3 className="text-sm font-semibold text-primary mb-3">Transformadores</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr className="text-left">
                      <th className="pb-2 text-muted-foreground">Nome</th>
                      <th className="pb-2 text-muted-foreground">P HV (MW)</th>
                      <th className="pb-2 text-muted-foreground">P LV (MW)</th>
                      <th className="pb-2 text-muted-foreground">Perdas (MW)</th>
                      <th className="pb-2 text-muted-foreground">Carregamento (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {transformers.map((t: any, idx: number) => (
                      <tr key={idx} className="hover:bg-muted/20">
                        <td className="py-2 font-medium">{t.name}</td>
                        <td className="py-2 font-mono">{t.p_hv_mw.toFixed(2)}</td>
                        <td className="py-2 font-mono">{t.p_lv_mw.toFixed(2)}</td>
                        <td className="py-2 font-mono text-chart-4">{t.pl_mw.toFixed(2)}</td>
                        <td className="py-2 font-mono text-chart-3">{t.loading_percent.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
