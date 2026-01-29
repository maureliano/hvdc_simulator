/**
 * HVDC Simulator - In-Memory Implementation
 * Simulates HVDC circuit without external dependencies
 */

import { nanoid } from 'nanoid';

export interface SimulationResult {
  id: string;
  timestamp: number;
  status: 'success' | 'error';
  convergence: boolean;
  bus_voltages: {
    bus_ac1_voltage_pu: number;
    bus_ac2_voltage_pu: number;
    bus_dc1_voltage_pu: number;
    bus_dc2_voltage_pu: number;
  };
  power_flows: {
    transformer_1_p_mw: number;
    transformer_1_q_mvar: number;
    transformer_2_p_mw: number;
    transformer_2_q_mvar: number;
  };
  losses: {
    total_loss_mw: number;
    transformer_1_loss: number;
    transformer_2_loss: number;
  };
  efficiency: {
    overall_efficiency: number;
  };
  iff_score: number;
  iff_dimensions: {
    state_fidelity: number;
    dynamics_fidelity: number;
    energy_fidelity: number;
    stability_fidelity: number;
  };
  measurement_uncertainty: number;
  communication_latency_ms: number;
  hil_sync_status: 'synchronized' | 'drifting' | 'lost';
}

export class HVDCSimulator {
  private baseVoltage = 345.0; // kV
  private basePower = 1196.0; // MVA
  private simulationTime = 0;

  /**
   * Run HVDC simulation with given parameters
   */
  runSimulation(params?: Record<string, any>): SimulationResult {
    const startTime = Date.now();
    
    // Extract parameters
    const ac1_voltage = params?.ac1_voltage || 345.0;
    const ac2_voltage = params?.ac2_voltage || 230.0;
    const dc_voltage = params?.dc_voltage || 422.84;
    const power_mva = params?.power_mva || 1196.0;
    const load_mw = params?.load_mw || 1000.0;
    const failure_mode = params?.failure_mode || 'none';
    const noise_level = params?.noise_level || 0.0;

    // Simulate power flow
    const result = this.calculatePowerFlow(
      ac1_voltage,
      ac2_voltage,
      dc_voltage,
      power_mva,
      load_mw,
      failure_mode,
      noise_level
    );

    // Calculate IFF (Physical Fidelity Index)
    const iff = this.calculateIFF(result, failure_mode, noise_level);

    // Calculate uncertainties
    const measurement_uncertainty = this.calculateMeasurementUncertainty(noise_level);
    const communication_latency_ms = this.calculateLatency();

    // HIL synchronization status
    const hil_sync_status = this.getHILSyncStatus(failure_mode);

    const executionTime = Date.now() - startTime;

    return {
      id: nanoid(),
      timestamp: Date.now(),
      status: 'success',
      convergence: true,
      bus_voltages: result.bus_voltages,
      power_flows: result.power_flows,
      losses: result.losses,
      efficiency: result.efficiency,
      iff_score: iff.overall,
      iff_dimensions: iff.dimensions,
      measurement_uncertainty,
      communication_latency_ms,
      hil_sync_status,
    };
  }

  private calculatePowerFlow(
    ac1_voltage: number,
    ac2_voltage: number,
    dc_voltage: number,
    power_mva: number,
    load_mw: number,
    failure_mode: string,
    noise_level: number
  ) {
    // Base voltage values with small variations
    let bus_ac1_voltage_pu = 1.0;
    let bus_ac2_voltage_pu = 0.98;
    let bus_dc1_voltage_pu = 1.0;
    let bus_dc2_voltage_pu = 0.99;

    // Apply failure modes
    switch (failure_mode) {
      case 'voltage_sag':
        bus_ac1_voltage_pu -= 0.15;
        bus_dc1_voltage_pu -= 0.1;
        break;
      case 'frequency_deviation':
        bus_ac1_voltage_pu -= 0.05;
        break;
      case 'converter_fault':
        bus_dc1_voltage_pu -= 0.2;
        bus_dc2_voltage_pu -= 0.15;
        break;
      case 'dc_line_fault':
        bus_dc2_voltage_pu -= 0.25;
        break;
    }

    // Add noise
    bus_ac1_voltage_pu += (Math.random() - 0.5) * noise_level;
    bus_ac2_voltage_pu += (Math.random() - 0.5) * noise_level;
    bus_dc1_voltage_pu += (Math.random() - 0.5) * noise_level;
    bus_dc2_voltage_pu += (Math.random() - 0.5) * noise_level;

    // Calculate power flows
    const transformer_1_p_mw = load_mw * 0.95 * (1 - Math.random() * 0.1);
    const transformer_1_q_mvar = transformer_1_p_mw * 0.3;
    const transformer_2_p_mw = load_mw * 0.92 * (1 - Math.random() * 0.1);
    const transformer_2_q_mvar = transformer_2_p_mw * 0.25;

    // Calculate losses
    const transformer_1_loss = transformer_1_p_mw * 0.015;
    const transformer_2_loss = transformer_2_p_mw * 0.015;
    const total_loss_mw = transformer_1_loss + transformer_2_loss;

    // Calculate efficiency
    const overall_efficiency = ((transformer_1_p_mw + transformer_2_p_mw - total_loss_mw) / 
                               (transformer_1_p_mw + transformer_2_p_mw)) * 100;

    return {
      bus_voltages: {
        bus_ac1_voltage_pu,
        bus_ac2_voltage_pu,
        bus_dc1_voltage_pu,
        bus_dc2_voltage_pu,
      },
      power_flows: {
        transformer_1_p_mw,
        transformer_1_q_mvar,
        transformer_2_p_mw,
        transformer_2_q_mvar,
      },
      losses: {
        total_loss_mw,
        transformer_1_loss,
        transformer_2_loss,
      },
      efficiency: {
        overall_efficiency,
      },
    };
  }

  private calculateIFF(
    result: any,
    failure_mode: string,
    noise_level: number
  ) {
    // IFF dimensions (0-1 scale, 1 = perfect fidelity)
    let state_fidelity = 0.95;
    let dynamics_fidelity = 0.92;
    let energy_fidelity = 0.94;
    let stability_fidelity = 0.93;

    // Degrade based on failure mode
    switch (failure_mode) {
      case 'voltage_sag':
        state_fidelity -= 0.15;
        stability_fidelity -= 0.2;
        break;
      case 'frequency_deviation':
        dynamics_fidelity -= 0.2;
        stability_fidelity -= 0.15;
        break;
      case 'converter_fault':
        state_fidelity -= 0.25;
        energy_fidelity -= 0.2;
        stability_fidelity -= 0.3;
        break;
      case 'dc_line_fault':
        energy_fidelity -= 0.3;
        stability_fidelity -= 0.25;
        break;
    }

    // Degrade based on noise
    const noise_impact = noise_level * 0.5;
    state_fidelity -= noise_impact;
    dynamics_fidelity -= noise_impact;
    energy_fidelity -= noise_impact;
    stability_fidelity -= noise_impact;

    // Clamp to [0, 1]
    state_fidelity = Math.max(0, Math.min(1, state_fidelity));
    dynamics_fidelity = Math.max(0, Math.min(1, dynamics_fidelity));
    energy_fidelity = Math.max(0, Math.min(1, energy_fidelity));
    stability_fidelity = Math.max(0, Math.min(1, stability_fidelity));

    // Calculate overall IFF
    const overall = (state_fidelity + dynamics_fidelity + energy_fidelity + stability_fidelity) / 4;

    return {
      overall,
      dimensions: {
        state_fidelity,
        dynamics_fidelity,
        energy_fidelity,
        stability_fidelity,
      },
    };
  }

  private calculateMeasurementUncertainty(noise_level: number): number {
    // Measurement uncertainty in percentage
    const base_uncertainty = 2.0; // 2% base uncertainty
    return base_uncertainty + noise_level * 100;
  }

  private calculateLatency(): number {
    // Communication latency in milliseconds
    // Simulates network delay (typically 10-100ms)
    return 20 + Math.random() * 40;
  }

  private getHILSyncStatus(failure_mode: string): 'synchronized' | 'drifting' | 'lost' {
    if (failure_mode === 'dc_line_fault') {
      return 'drifting';
    }
    if (failure_mode === 'converter_fault') {
      return 'lost';
    }
    return 'synchronized';
  }
}

// Singleton instance
let simulator: HVDCSimulator | null = null;

export function getSimulator(): HVDCSimulator {
  if (!simulator) {
    simulator = new HVDCSimulator();
  }
  return simulator;
}

export function runSimulation(params?: Record<string, any>): SimulationResult {
  return getSimulator().runSimulation(params);
}
