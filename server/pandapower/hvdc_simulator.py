#!/usr/bin/env python3
"""
HVDC Simulator using Pandapower
Simulates High Voltage Direct Current (HVDC) transmission systems
"""

import json
import sys
import pandapower as pp
import numpy as np
from typing import Dict, Any, Tuple

class HVDCSimulator:
    """HVDC Transmission System Simulator"""
    
    def __init__(self):
        self.net = None
        self.results = {}
    
    def create_network(
        self,
        ac1_voltage: float = 345.0,
        ac2_voltage: float = 230.0,
        dc_voltage: float = 422.84,
        power_mva: float = 1196.0,
        load_mw: float = 1000.0,
    ) -> None:
        """
        Create HVDC transmission network
        
        Args:
            ac1_voltage: AC voltage at station 1 (kV)
            ac2_voltage: AC voltage at station 2 (kV)
            dc_voltage: DC link voltage (kV)
            power_mva: Transmission capacity (MVA)
            load_mw: Load at receiving end (MW)
        """
        self.net = pp.create_empty_network()
        
        # Create buses
        bus_ac1 = pp.create_bus(self.net, vn_kv=ac1_voltage, name="AC Bus 1")
        bus_ac2 = pp.create_bus(self.net, vn_kv=ac2_voltage, name="AC Bus 2")
        bus_dc_rect = pp.create_bus(self.net, vn_kv=dc_voltage, name="DC Bus Rectifier")
        bus_dc_inv = pp.create_bus(self.net, vn_kv=dc_voltage, name="DC Bus Inverter")
        
        # Create external grid at AC Bus 1 (source)
        pp.create_ext_grid(
            self.net,
            bus=bus_ac1,
            vm_pu=1.0,
            name="External Grid"
        )
        
        # Create transformer 1 (AC1 to DC rectifier)
        pp.create_transformer(
            self.net,
            hv_bus=bus_ac1,
            lv_bus=bus_dc_rect,
            sn_mva=power_mva,
            vn_hv_kv=ac1_voltage,
            vn_lv_kv=dc_voltage,
            pfe_kw=100,
            i0_percent=0.5,
            name="Rectifier Transformer"
        )
        
        # Create transformer 2 (DC inverter to AC2)
        pp.create_transformer(
            self.net,
            hv_bus=bus_dc_inv,
            lv_bus=bus_ac2,
            sn_mva=power_mva,
            vn_hv_kv=dc_voltage,
            vn_lv_kv=ac2_voltage,
            pfe_kw=100,
            i0_percent=0.5,
            name="Inverter Transformer"
        )
        
        # Create DC line (simplified as resistance)
        # DC line resistance: ~0.01 ohm/km for 500kV line, assume 500km
        dc_line_r = 5.0  # ohms (simplified)
        pp.create_line(
            self.net,
            from_bus=bus_dc_rect,
            to_bus=bus_dc_inv,
            length_km=500,
            std_type="NAYY 4x50SE",
            name="HVDC Line"
        )
        
        # Create load at AC Bus 2
        pp.create_load(
            self.net,
            bus=bus_ac2,
            p_mw=load_mw,
            q_mvar=load_mw * 0.3,  # 30% reactive power
            name="Load"
        )
        
        # Store bus indices for later reference
        self.bus_ac1 = bus_ac1
        self.bus_ac2 = bus_ac2
        self.bus_dc_rect = bus_dc_rect
        self.bus_dc_inv = bus_dc_inv
        self.load_mw = load_mw
        self.power_mva = power_mva
    
    def run_simulation(self) -> Dict[str, Any]:
        """
        Run power flow simulation
        
        Returns:
            Dictionary with simulation results
        """
        if self.net is None:
            raise ValueError("Network not created. Call create_network() first.")
        
        try:
            # Run power flow
            pp.runpp(self.net, algorithm="nr", max_iteration=100)
            
            # Extract results
            results = self._extract_results()
            return results
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "results": {}
            }
    
    def _extract_results(self) -> Dict[str, Any]:
        """Extract and calculate results from simulation"""
        
        # Get bus voltages
        bus_ac1_vm = self.net.res_bus.loc[self.bus_ac1, "vm_pu"]
        bus_ac2_vm = self.net.res_bus.loc[self.bus_ac2, "vm_pu"]
        bus_dc_rect_vm = self.net.res_bus.loc[self.bus_dc_rect, "vm_pu"]
        bus_dc_inv_vm = self.net.res_bus.loc[self.bus_dc_inv, "vm_pu"]
        
        # Get transformer flows
        trafo_results = self.net.res_trafo
        rect_trafo = trafo_results.iloc[0]  # Rectifier transformer
        inv_trafo = trafo_results.iloc[1]   # Inverter transformer
        
        # Calculate power flows
        p_rect_mw = abs(rect_trafo["p_lv_mw"])  # Power into DC rectifier
        p_inv_mw = abs(inv_trafo["p_hv_mw"])    # Power from DC inverter
        
        # Calculate losses
        loss_rect = p_rect_mw - p_inv_mw  # Rectifier losses
        loss_inv = p_inv_mw - self.load_mw  # Inverter + line losses
        total_loss = loss_rect + loss_inv
        
        # Calculate efficiencies
        efficiency = (self.load_mw / p_rect_mw * 100) if p_rect_mw > 0 else 0
        rect_efficiency = ((p_rect_mw - loss_rect) / p_rect_mw * 100) if p_rect_mw > 0 else 0
        inv_efficiency = ((p_inv_mw - loss_inv) / p_inv_mw * 100) if p_inv_mw > 0 else 0
        
        # Calculate DC current (I = P / V)
        dc_voltage = self.net.bus.loc[self.bus_dc_rect, "vn_kv"]
        dc_current = (p_rect_mw * 1000) / (dc_voltage * bus_dc_rect_vm) if dc_voltage > 0 else 0
        
        return {
            "success": True,
            "error": None,
            "results": {
                "totalGeneration": float(p_rect_mw),
                "totalLoad": float(self.load_mw),
                "efficiency": float(efficiency),
                "losses": float(total_loss),
                "dcCurrent": float(dc_current),
                "rectifierEfficiency": float(rect_efficiency),
                "inverterEfficiency": float(inv_efficiency),
                "acVoltage1": float(self.net.bus.loc[self.bus_ac1, "vn_kv"] * bus_ac1_vm),
                "acVoltage2": float(self.net.bus.loc[self.bus_ac2, "vn_kv"] * bus_ac2_vm),
                "dcVoltageRectifier": float(dc_voltage * bus_dc_rect_vm),
                "dcVoltageInverter": float(dc_voltage * bus_dc_inv_vm),
                "rectifierLoss": float(loss_rect),
                "inverterLoss": float(loss_inv),
                "powerTransmitted": float(p_inv_mw),
            }
        }


def main():
    """Main entry point for command-line execution"""
    
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "Missing parameters"
        }))
        sys.exit(1)
    
    try:
        # Parse input JSON
        params = json.loads(sys.argv[1])
        
        # Create and run simulator
        simulator = HVDCSimulator()
        simulator.create_network(
            ac1_voltage=params.get("ac1_voltage", 345.0),
            ac2_voltage=params.get("ac2_voltage", 230.0),
            dc_voltage=params.get("dc_voltage", 422.84),
            power_mva=params.get("power_mva", 1196.0),
            load_mw=params.get("load_mw", 1000.0),
        )
        
        results = simulator.run_simulation()
        print(json.dumps(results))
        
    except json.JSONDecodeError as e:
        print(json.dumps({
            "success": False,
            "error": f"Invalid JSON: {str(e)}"
        }))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
        sys.exit(1)


if __name__ == "__main__":
    main()
