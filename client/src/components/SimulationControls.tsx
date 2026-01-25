import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2, RotateCcw } from "lucide-react";

interface SimulationControlsProps {
  params: {
    ac1_voltage: number;
    ac2_voltage: number;
    dc_voltage: number;
    power_mva: number;
    load_mw: number;
  };
  onParamsChange: (params: any) => void;
  onRunSimulation: () => void;
  isSimulating: boolean;
}

export default function SimulationControls({
  params,
  onParamsChange,
  onRunSimulation,
  isSimulating,
}: SimulationControlsProps) {
  const handleReset = () => {
    onParamsChange({
      ac1_voltage: 345.0,
      ac2_voltage: 230.0,
      dc_voltage: 422.84,
      power_mva: 1196.0,
      load_mw: 1000.0,
    });
  };

  const updateParam = (key: string, value: number) => {
    onParamsChange({ ...params, [key]: value });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* AC System Parameters */}
      <Card className="bg-gradient-to-br from-card to-card/50">
        <CardHeader>
          <CardTitle className="text-primary">Parâmetros AC</CardTitle>
          <CardDescription>
            Configurações dos sistemas de corrente alternada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AC1 Voltage */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="ac1_voltage">Tensão AC 1 (kV)</Label>
              <span className="text-sm font-mono text-primary">
                {params.ac1_voltage.toFixed(1)} kV
              </span>
            </div>
            <Slider
              id="ac1_voltage"
              min={300}
              max={400}
              step={5}
              value={[params.ac1_voltage]}
              onValueChange={([value]) => updateParam("ac1_voltage", value)}
              className="w-full"
            />
            <Input
              type="number"
              value={params.ac1_voltage}
              onChange={(e) => updateParam("ac1_voltage", parseFloat(e.target.value))}
              className="font-mono"
            />
          </div>

          {/* AC2 Voltage */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="ac2_voltage">Tensão AC 2 (kV)</Label>
              <span className="text-sm font-mono text-accent">
                {params.ac2_voltage.toFixed(1)} kV
              </span>
            </div>
            <Slider
              id="ac2_voltage"
              min={200}
              max={300}
              step={5}
              value={[params.ac2_voltage]}
              onValueChange={([value]) => updateParam("ac2_voltage", value)}
              className="w-full"
            />
            <Input
              type="number"
              value={params.ac2_voltage}
              onChange={(e) => updateParam("ac2_voltage", parseFloat(e.target.value))}
              className="font-mono"
            />
          </div>
        </CardContent>
      </Card>

      {/* DC System Parameters */}
      <Card className="bg-gradient-to-br from-card to-card/50">
        <CardHeader>
          <CardTitle className="text-accent">Parâmetros DC</CardTitle>
          <CardDescription>
            Configurações do sistema de corrente contínua
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* DC Voltage */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="dc_voltage">Tensão DC (kV)</Label>
              <span className="text-sm font-mono text-primary">
                {params.dc_voltage.toFixed(2)} kV
              </span>
            </div>
            <Slider
              id="dc_voltage"
              min={350}
              max={500}
              step={1}
              value={[params.dc_voltage]}
              onValueChange={([value]) => updateParam("dc_voltage", value)}
              className="w-full"
            />
            <Input
              type="number"
              value={params.dc_voltage}
              onChange={(e) => updateParam("dc_voltage", parseFloat(e.target.value))}
              className="font-mono"
            />
          </div>

          {/* Power MVA */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="power_mva">Potência Nominal (MVA)</Label>
              <span className="text-sm font-mono text-accent">
                {params.power_mva.toFixed(0)} MVA
              </span>
            </div>
            <Slider
              id="power_mva"
              min={800}
              max={1500}
              step={10}
              value={[params.power_mva]}
              onValueChange={([value]) => updateParam("power_mva", value)}
              className="w-full"
            />
            <Input
              type="number"
              value={params.power_mva}
              onChange={(e) => updateParam("power_mva", parseFloat(e.target.value))}
              className="font-mono"
            />
          </div>
        </CardContent>
      </Card>

      {/* Load Parameters */}
      <Card className="bg-gradient-to-br from-card to-card/50 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-chart-3">Parâmetros de Carga</CardTitle>
          <CardDescription>
            Configuração da carga do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="load_mw">Carga Ativa (MW)</Label>
              <span className="text-sm font-mono text-chart-3">
                {params.load_mw.toFixed(0)} MW
              </span>
            </div>
            <Slider
              id="load_mw"
              min={500}
              max={1500}
              step={10}
              value={[params.load_mw]}
              onValueChange={([value]) => updateParam("load_mw", value)}
              className="w-full"
            />
            <Input
              type="number"
              value={params.load_mw}
              onChange={(e) => updateParam("load_mw", parseFloat(e.target.value))}
              className="font-mono"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={onRunSimulation}
              disabled={isSimulating}
              className="flex-1"
              size="lg"
            >
              {isSimulating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Simulando...
                </>
              ) : (
                "Executar Simulação"
              )}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Resetar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
