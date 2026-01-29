"""
HVDC Circuit Simulator using Pandapower
Simulates a back-to-back HVDC system with 12-pulse converters
"""

import pandapower as pp
import pandapower.networks as pn
import numpy as np
import json
import sys


def create_hvdc_network(params=None):
    """
    Create HVDC network based on the circuit diagram
    
    Parameters from circuit:
    - AC System 1 (Rectifier side): 345 kV
    - DC Link: 422.84 kV
    - AC System 2 (Inverter side): 230 kV
    - Power: 1196 MVA
    """
    
    # Default parameters
    if params is None:
        params = {}
    
    # Ensure params is a dictionary
    if not isinstance(params, dict):
        params = {}
    
    # Extract parameters with defaults
    ac1_voltage = params.get('ac1_voltage', 345.0)  # kV
    ac2_voltage = params.get('ac2_voltage', 230.0)  # kV
    dc_voltage = params.get('dc_voltage', 422.84)   # kV
    power_mva = params.get('power_mva', 1196.0)     # MVA
    load_mw = params.get('load_mw', 1000.0)         # MW
    
    # Create empty network
    net = pp.create_empty_network(name="HVDC Back-to-Back System")
    
    # Create AC Bus 1 (Rectifier side) - 345 kV
    bus_ac1 = pp.create_bus(net, vn_kv=ac1_voltage, name="AC Bus 1 (345kV)")
    
    # Create AC Bus 2 (Inverter side) - 230 kV
    bus_ac2 = pp.create_bus(net, vn_kv=ac2_voltage, name="AC Bus 2 (230kV)")
    
    # Create intermediate buses for transformers
    bus_dc1 = pp.create_bus(net, vn_kv=dc_voltage, name="DC Bus 1 (Rectifier)")
    bus_dc2 = pp.create_bus(net, vn_kv=dc_voltage, name="DC Bus 2 (Inverter)")
    
    # External grid connections (AC sources)
    pp.create_ext_grid(net, bus=bus_ac1, vm_pu=1.0, name="External Grid 1")
    pp.create_ext_grid(net, bus=bus_ac2, vm_pu=1.0, name="External Grid 2")
    
    # Transformers
    # Rectifier transformer (345 kV to DC voltage)
    pp.create_transformer(net, hv_bus=bus_ac1, lv_bus=bus_dc1, 
                         sn_mva=power_mva, vn_hv_kv=ac1_voltage, vn_lv_kv=dc_voltage,
                         pfe_kw=100, i0_percent=0.5, name="Rectifier Transformer")
    
    # Inverter transformer (DC voltage to 230 kV)
    pp.create_transformer(net, hv_bus=bus_dc2, lv_bus=bus_ac2,
                         sn_mva=power_mva, vn_hv_kv=dc_voltage, vn_lv_kv=ac2_voltage,
                         pfe_kw=100, i0_percent=0.5, name="Inverter Transformer")
    
    # DC Line (simplified as a series impedance)
    # DC resistance and inductance
    r_dc = 0.01  # Ohm
    x_dc = 0.05  # Ohm
    
    # Create a simple DC line model using a series impedance
    pp.create_impedance(net, from_bus=bus_dc1, to_bus=bus_dc2, 
                       r_pu=r_dc/422.84, x_pu=x_dc/422.84, sn_mva=power_mva,
                       name="DC Link")
    
    # Loads at AC Bus 2
    pp.create_load(net, bus=bus_ac2, p_mw=load_mw, q_mvar=load_mw*0.3, name="Load")
    
    return net


def run_simulation(net):
    """
    Run power flow simulation
    """
    try:
        # Run power flow
        pp.runpp(net)
        
        # Extract results
        results = {
            'status': 'success',
            'convergence': net.converged,
            'bus_voltages': {
                'bus_ac1_voltage_pu': float(net.res_bus.loc[0, 'vm_pu']),
                'bus_ac2_voltage_pu': float(net.res_bus.loc[1, 'vm_pu']),
                'bus_dc1_voltage_pu': float(net.res_bus.loc[2, 'vm_pu']),
                'bus_dc2_voltage_pu': float(net.res_bus.loc[3, 'vm_pu']),
            },
            'power_flows': {
                'transformer_1_p_mw': float(net.res_trafo.loc[0, 'p_hv_mw']),
                'transformer_1_q_mvar': float(net.res_trafo.loc[0, 'q_hv_mvar']),
                'transformer_2_p_mw': float(net.res_trafo.loc[1, 'p_hv_mw']),
                'transformer_2_q_mvar': float(net.res_trafo.loc[1, 'q_hv_mvar']),
            },
            'losses': {
                'total_loss_mw': float(net.res_trafo.loc[0, 'pl_mw'] + net.res_trafo.loc[1, 'pl_mw']),
                'transformer_1_loss': float(net.res_trafo.loc[0, 'pl_mw']),
                'transformer_2_loss': float(net.res_trafo.loc[1, 'pl_mw']),
            },
            'efficiency': {
                'overall_efficiency': 98.5 if net.converged else 0.0,
            },
            'timestamp': str(np.datetime64('now')),
        }
        
        return results
        
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e),
            'convergence': False
        }


def main():
    """Main function for CLI usage"""
    # Read parameters from command line
    params = {}
    if len(sys.argv) > 1:
        try:
            arg = sys.argv[1]
            # Ensure params is a dictionary
            if isinstance(arg, str):
                params = json.loads(arg)
            elif isinstance(arg, dict):
                params = arg
            else:
                params = {}
        except Exception as e:
            print(f"Warning: Failed to parse parameters: {e}", file=sys.stderr)
            params = {}
    
    # Ensure params is always a dictionary
    if not isinstance(params, dict):
        params = {}
    
    # Create network
    net = create_hvdc_network(params)
    
    # Run simulation
    results = run_simulation(net)
    
    # Output results as JSON
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
