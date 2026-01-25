import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Play } from "lucide-react";

export default function Configurations() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newConfig, setNewConfig] = useState({
    name: "",
    description: "",
    ac1Voltage: 345.0,
    ac2Voltage: 230.0,
    dcVoltage: 422.84,
    powerMva: 1196.0,
    loadMw: 1000.0,
  });

  const { data: configs, refetch } = trpc.config.list.useQuery();

  const createConfig = trpc.config.create.useMutation({
    onSuccess: () => {
      toast.success("Configuração criada com sucesso!");
      setIsCreateDialogOpen(false);
      refetch();
      setNewConfig({
        name: "",
        description: "",
        ac1Voltage: 345.0,
        ac2Voltage: 230.0,
        dcVoltage: 422.84,
        powerMva: 1196.0,
        loadMw: 1000.0,
      });
    },
    onError: (error) => {
      toast.error(`Erro ao criar configuração: ${error.message}`);
    },
  });

  const deleteConfig = trpc.config.delete.useMutation({
    onSuccess: () => {
      toast.success("Configuração excluída!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });

  const handleCreate = () => {
    if (!newConfig.name) {
      toast.error("Nome da configuração é obrigatório");
      return;
    }
    createConfig.mutate(newConfig);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Configurações Salvas</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie suas configurações de circuito HVDC
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nova Configuração
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Nova Configuração</DialogTitle>
                <DialogDescription>
                  Defina os parâmetros do circuito HVDC
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={newConfig.name}
                    onChange={(e) => setNewConfig({ ...newConfig, name: e.target.value })}
                    placeholder="Ex: Configuração Padrão 1196 MVA"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newConfig.description}
                    onChange={(e) => setNewConfig({ ...newConfig, description: e.target.value })}
                    placeholder="Descrição opcional da configuração"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ac1Voltage">Tensão AC 1 (kV)</Label>
                    <Input
                      id="ac1Voltage"
                      type="number"
                      value={newConfig.ac1Voltage}
                      onChange={(e) => setNewConfig({ ...newConfig, ac1Voltage: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ac2Voltage">Tensão AC 2 (kV)</Label>
                    <Input
                      id="ac2Voltage"
                      type="number"
                      value={newConfig.ac2Voltage}
                      onChange={(e) => setNewConfig({ ...newConfig, ac2Voltage: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dcVoltage">Tensão DC (kV)</Label>
                    <Input
                      id="dcVoltage"
                      type="number"
                      value={newConfig.dcVoltage}
                      onChange={(e) => setNewConfig({ ...newConfig, dcVoltage: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="powerMva">Potência (MVA)</Label>
                    <Input
                      id="powerMva"
                      type="number"
                      value={newConfig.powerMva}
                      onChange={(e) => setNewConfig({ ...newConfig, powerMva: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loadMw">Carga (MW)</Label>
                    <Input
                      id="loadMw"
                      type="number"
                      value={newConfig.loadMw}
                      onChange={(e) => setNewConfig({ ...newConfig, loadMw: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate}>Criar Configuração</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {configs?.map((config) => (
            <Card key={config.id} className="bg-gradient-to-br from-card to-card/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg">{config.name}</CardTitle>
                {config.description && (
                  <CardDescription className="line-clamp-2">
                    {config.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">AC 1:</span>
                    <span className="font-mono text-primary">{config.ac1Voltage} kV</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">AC 2:</span>
                    <span className="font-mono text-accent">{config.ac2Voltage} kV</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">DC:</span>
                    <span className="font-mono text-primary">{config.dcVoltage} kV</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Potência:</span>
                    <span className="font-mono">{config.powerMva} MVA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Carga:</span>
                    <span className="font-mono">{config.loadMw} MW</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" className="flex-1 gap-2">
                    <Play className="w-3 h-3" />
                    Simular
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteConfig.mutate({ id: config.id })}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {configs?.length === 0 && (
          <Card className="py-12">
            <CardContent>
              <p className="text-center text-muted-foreground">
                Nenhuma configuração salva. Crie uma nova configuração para começar.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
