import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import { spawn } from "child_process";
import path from "path";

/**
 * Serviço de Monitoramento em Tempo Real
 * Simula um sistema SCADA para o circuito HVDC
 */

export interface MonitoringData {
  timestamp: number;
  buses: {
    id: number;
    name: string;
    voltage_pu: number;
    voltage_kv: number;
    status: "normal" | "warning" | "alarm";
  }[];
  transformers: {
    id: number;
    name: string;
    loading_percent: number;
    power_mw: number;
    status: "normal" | "warning" | "alarm";
  }[];
  dcLink: {
    voltage_kv: number;
    current_ka: number;
    power_mw: number;
    status: "normal" | "warning" | "alarm";
  };
  converters: {
    rectifier: {
      power_mw: number;
      efficiency: number;
      status: "normal" | "warning" | "alarm";
    };
    inverter: {
      power_mw: number;
      efficiency: number;
      status: "normal" | "warning" | "alarm";
    };
  };
  system: {
    totalGeneration_mw: number;
    totalLoad_mw: number;
    losses_mw: number;
    efficiency: number;
    status: "normal" | "warning" | "alarm";
  };
  alarms: {
    id: string;
    timestamp: number;
    severity: "info" | "warning" | "critical";
    component: string;
    message: string;
  }[];
}

export class MonitoringService {
  private io: SocketIOServer | null = null;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private simulationParams = {
    acVoltage1: 345,
    acVoltage2: 230,
    dcVoltage: 422.84,
    loadPower: 1000,
  };

  initialize(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      path: "/socket.io/",
    });

    this.io.on("connection", (socket) => {
      console.log(`[Monitoring] Client connected: ${socket.id}`);

      // Enviar dados iniciais
      this.runSimulationAndEmit();

      // Atualizar parâmetros de simulação
      socket.on("updateParams", (params) => {
        console.log("[Monitoring] Params updated:", params);
        this.simulationParams = { ...this.simulationParams, ...params };
        this.runSimulationAndEmit();
      });

      socket.on("disconnect", () => {
        console.log(`[Monitoring] Client disconnected: ${socket.id}`);
      });
    });

    // Iniciar monitoramento contínuo (atualização a cada 2 segundos)
    this.startContinuousMonitoring();

    console.log("[Monitoring] WebSocket service initialized");
  }

  private startContinuousMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(() => {
      this.runSimulationAndEmit();
    }, 2000); // Atualizar a cada 2 segundos
  }

  private async runSimulationAndEmit() {
    try {
      const data = await this.runSimulation(this.simulationParams);
      if (this.io) {
        this.io.emit("monitoringData", data);
      }
    } catch (error) {
      console.error("[Monitoring] Simulation error:", error);
    }
  }

  private async runSimulation(params: typeof this.simulationParams): Promise<MonitoringData> {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(process.cwd(), "server", "hvdc_simulator.py");
      const pythonProcess = spawn("python3.11", [
        scriptPath,
        params.acVoltage1.toString(),
        params.acVoltage2.toString(),
        params.dcVoltage.toString(),
        params.loadPower.toString(),
      ]);

      let stdout = "";
      let stderr = "";

      pythonProcess.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`Python script failed: ${stderr}`));
          return;
        }

        try {
          const result = JSON.parse(stdout);
          const monitoringData = this.transformToMonitoringData(result, params);
          resolve(monitoringData);
        } catch (error) {
          reject(new Error(`Failed to parse simulation result: ${error}`));
        }
      });

      setTimeout(() => {
        pythonProcess.kill();
        reject(new Error("Simulation timeout"));
      }, 10000);
    });
  }

  private transformToMonitoringData(
    simulationResult: any,
    params: typeof this.simulationParams
  ): MonitoringData {
    const timestamp = Date.now();
    const alarms: MonitoringData["alarms"] = [];

    // Processar barramentos
    const buses = simulationResult.buses.map((bus: any) => {
      const voltagePu = bus.voltage_pu;
      let status: "normal" | "warning" | "alarm" = "normal";

      if (voltagePu < 0.95 || voltagePu > 1.05) {
        status = "alarm";
        alarms.push({
          id: `bus-${bus.id}-${timestamp}`,
          timestamp,
          severity: "critical",
          component: `Barramento ${bus.name}`,
          message: `Tensão fora dos limites: ${(voltagePu * 100).toFixed(1)}% (95-105% esperado)`,
        });
      } else if (voltagePu < 0.97 || voltagePu > 1.03) {
        status = "warning";
        alarms.push({
          id: `bus-${bus.id}-${timestamp}`,
          timestamp,
          severity: "warning",
          component: `Barramento ${bus.name}`,
          message: `Tensão próxima dos limites: ${(voltagePu * 100).toFixed(1)}%`,
        });
      }

      return {
        id: bus.id,
        name: bus.name,
        voltage_pu: voltagePu,
        voltage_kv: bus.voltage_kv,
        status,
      };
    });

    // Processar transformadores
    const transformers = simulationResult.transformers.map((trafo: any) => {
      const loading = trafo.loading_percent;
      let status: "normal" | "warning" | "alarm" = "normal";

      if (loading > 100) {
        status = "alarm";
        alarms.push({
          id: `trafo-${trafo.id}-${timestamp}`,
          timestamp,
          severity: "critical",
          component: `Transformador ${trafo.name}`,
          message: `Sobrecarga: ${loading.toFixed(1)}% (máx 100%)`,
        });
      } else if (loading > 85) {
        status = "warning";
        alarms.push({
          id: `trafo-${trafo.id}-${timestamp}`,
          timestamp,
          severity: "warning",
          component: `Transformador ${trafo.name}`,
          message: `Carregamento elevado: ${loading.toFixed(1)}%`,
        });
      }

      return {
        id: trafo.id,
        name: trafo.name,
        loading_percent: loading,
        power_mw: trafo.power_mw,
        status,
      };
    });

    // Link DC
    const dcLink = {
      voltage_kv: params.dcVoltage,
      current_ka: (params.loadPower / params.dcVoltage) * 1000, // Aproximação
      power_mw: params.loadPower,
      status: "normal" as const,
    };

    // Conversores
    const rectifierEfficiency = 0.985 + Math.random() * 0.01;
    const inverterEfficiency = 0.985 + Math.random() * 0.01;

    const converters = {
      rectifier: {
        power_mw: params.loadPower / rectifierEfficiency,
        efficiency: rectifierEfficiency * 100,
        status: "normal" as const,
      },
      inverter: {
        power_mw: params.loadPower,
        efficiency: inverterEfficiency * 100,
        status: "normal" as const,
      },
    };

    // Sistema geral
    const totalGeneration = simulationResult.system.total_generation_mw;
    const totalLoad = simulationResult.system.total_load_mw;
    const losses = simulationResult.system.losses_mw;
    const efficiency = simulationResult.system.efficiency;

    let systemStatus: "normal" | "warning" | "alarm" = "normal";
    if (efficiency < 95) {
      systemStatus = "alarm";
      alarms.push({
        id: `system-${timestamp}`,
        timestamp,
        severity: "critical",
        component: "Sistema",
        message: `Eficiência baixa: ${efficiency.toFixed(2)}%`,
      });
    } else if (efficiency < 98) {
      systemStatus = "warning";
    }

    return {
      timestamp,
      buses,
      transformers,
      dcLink,
      converters,
      system: {
        totalGeneration_mw: totalGeneration,
        totalLoad_mw: totalLoad,
        losses_mw: losses,
        efficiency,
        status: systemStatus,
      },
      alarms,
    };
  }

  stop() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    if (this.io) {
      this.io.close();
      this.io = null;
    }
    console.log("[Monitoring] Service stopped");
  }
}

export const monitoringService = new MonitoringService();
