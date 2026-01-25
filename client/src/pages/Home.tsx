import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Zap, Activity, TrendingUp, Settings } from "lucide-react";
import CircuitDiagram from "@/components/CircuitDiagram";
import SimulationControls from "@/components/SimulationControls";
import ResultsCharts from "@/components/ResultsCharts";
import { toast } from "sonner";

export default function Home() {
  const [simulationParams, setSimulationParams] = useState({
    ac1_voltage: 345.0,
    ac2_voltage: 230.0,
    dc_voltage: 422.84,
    power_mva: 1196.0,
    load_mw: 1000.0,
  });

  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const runSimulation = trpc.simulation.run.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setSimulationResult(data);
        toast.success("Simulação concluída com sucesso!");
      } else {
        toast.error(`Erro na simulação: ${data.error}`);
      }
      setIsSimulating(false);
    },
    onError: (error) => {
      toast.error(`Erro ao executar simulação: ${error.message}`);
      setIsSimulating(false);
    },
  });

  const handleRunSimulation = () => {
    setIsSimulating(true);
    runSimulation.mutate({
      ...simulationParams,
      saveResult: true,
    });
  };

  // Run initial simulation on mount
  useEffect(() => {
    handleRunSimulation();
  }, []);

  const summary = simulationResult?.summary;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  HVDC Simulator
                </h1>
                <p className="text-sm text-muted-foreground">
                  Sistema de Transmissão em Corrente Contínua de Alta Tensão
                </p>
              </div>
            </div>
            <Button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="gap-2"
            >
              {isSimulating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Simulando...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  Executar Simulação
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Geração Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {summary?.total_generation_mw?.toFixed(2) || "---"} MW
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Potência gerada
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-accent/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Carga Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                {summary?.total_load_mw?.toFixed(2) || "---"} MW
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Potência consumida
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-chart-3/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Eficiência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-3">
                {summary?.efficiency_percent?.toFixed(2) || "---"}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Rendimento do sistema
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-chart-4/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Perdas Totais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-4">
                {summary?.total_losses_mw?.toFixed(2) || "---"} MW
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Perdas no sistema
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="diagram" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="diagram" className="gap-2">
              <Activity className="w-4 h-4" />
              Diagrama Unifilar
            </TabsTrigger>
            <TabsTrigger value="controls" className="gap-2">
              <Settings className="w-4 h-4" />
              Controles
            </TabsTrigger>
            <TabsTrigger value="analysis" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Análise
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diagram" className="space-y-6">
            <Card className="bg-gradient-to-br from-card via-card to-card/80">
              <CardHeader>
                <CardTitle>Diagrama Unifilar do Sistema HVDC</CardTitle>
                <CardDescription>
                  Sistema back-to-back com conversores de 12 pulsos, 1196 MVA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CircuitDiagram result={simulationResult} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="controls" className="space-y-6">
            <SimulationControls
              params={simulationParams}
              onParamsChange={setSimulationParams}
              onRunSimulation={handleRunSimulation}
              isSimulating={isSimulating}
            />
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <ResultsCharts result={simulationResult} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
