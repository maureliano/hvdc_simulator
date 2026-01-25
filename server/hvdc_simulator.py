#!/usr/bin/env python3
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
    
    # Transformer 1 (345 kV / 422.84 kV) - Rectifier side
    pp.create_transformer_from_parameters(
        net,
        hv_bus=bus_dc1,
        lv_bus=bus_ac1,
        sn_mva=power_mva,
        vn_hv_kv=dc_voltage,
        vn_lv_kv=ac1_voltage,
        vkr_percent=0.5,
        vk_percent=12.0,
        pfe_kw=1000,
        i0_percent=0.1,
        name="Transformer 1 (Rectifier)"
    )
    
    # Transformer 2 (422.84 kV / 230 kV) - Inverter side
    pp.create_transformer_from_parameters(
        net,
        hv_bus=bus_dc2,
        lv_bus=bus_ac2,
        sn_mva=power_mva,
        vn_hv_kv=dc_voltage,
        vn_lv_kv=ac2_voltage,
        vkr_percent=0.5,
        vk_percent=12.0,
        pfe_kw=1000,
        i0_percent=0.1,
        name="Transformer 2 (Inverter)"
    )
    
    # DC Link (transmission line between rectifier and inverter)
    # Using impedance parameters from circuit
    r_dc_ohm = 2.5 + 2.5  # Total resistance: 5.0 Ω
    l_dc_h = 0.5968  # Inductance
    
    # Convert to per-unit impedance for line
    z_base = (dc_voltage ** 2) / power_mva
    r_dc_pu = r_dc_ohm / z_base
    x_dc_pu = (2 * np.pi * 50 * l_dc_h) / z_base  # Assuming 50 Hz
    
    pp.create_line_from_parameters(
        net,
        from_bus=bus_dc1,
        to_bus=bus_dc2,
        length_km=1.0,
        r_ohm_per_km=r_dc_ohm,
        x_ohm_per_km=2 * np.pi * 50 * l_dc_h,
        c_nf_per_km=26.0 * 1000,  # 26 µF converted to nF
        max_i_ka=power_mva / (np.sqrt(3) * dc_voltage),
        name="DC Link"
    )
    
    # Add shunt elements for filters (Low-frequency filter - Rectifier side)
    # Capacitor: 74.28 µF, Resistance: 29.76 Ω
    pp.create_shunt(net, bus=bus_dc1, q_mvar=-10.0, p_mw=0.5, name="LF Filter Rectifier")
    
    # High-frequency filter - Rectifier side
    pp.create_shunt(net, bus=bus_dc1, q_mvar=-5.0, p_mw=0.2, name="HF Filter Rectifier")
    
    # Low-frequency filter - Inverter side
    pp.create_shunt(net, bus=bus_dc2, q_mvar=-8.0, p_mw=0.4, name="LF Filter Inverter")
    
    # High-frequency filter - Inverter side
    pp.create_shunt(net, bus=bus_dc2, q_mvar=-4.0, p_mw=0.15, name="HF Filter Inverter")
    
    # Add load on inverter side
    pp.create_load(net, bus=bus_ac2, p_mw=load_mw, q_mvar=0, name="Load")
    
    return net


def run_simulation(net):
    """Run power flow simulation and return results"""
    try:
        # Run power flow calculation
        pp.runpp(net, algorithm='nr', calculate_voltage_angles=True)
        
        # Extract results
        results = {
            'success': True,
            'buses': [],
            'lines': [],
            'transformers': [],
            'loads': [],
            'ext_grids': [],
            'shunts': [],
            'summary': {}
        }
        
        # Bus results
        for idx, row in net.res_bus.iterrows():
            bus_name = net.bus.at[idx, 'name']
            results['buses'].append({
                'id': int(idx),
                'name': bus_name,
                'vm_pu': float(row['vm_pu']),
                'va_degree': float(row['va_degree']),
                'p_mw': float(row['p_mw']),
                'q_mvar': float(row['q_mvar'])
            })
        
        # Line results
        for idx, row in net.res_line.iterrows():
            line_name = net.line.at[idx, 'name']
            results['lines'].append({
                'id': int(idx),
                'name': line_name,
                'p_from_mw': float(row['p_from_mw']),
                'q_from_mvar': float(row['q_from_mvar']),
                'p_to_mw': float(row['p_to_mw']),
                'q_to_mvar': float(row['q_to_mvar']),
                'pl_mw': float(row['pl_mw']),
                'ql_mvar': float(row['ql_mvar']),
                'i_ka': float(row['i_ka']),
                'loading_percent': float(row['loading_percent'])
            })
        
        # Transformer results
        for idx, row in net.res_trafo.iterrows():
            trafo_name = net.trafo.at[idx, 'name']
            results['transformers'].append({
                'id': int(idx),
                'name': trafo_name,
                'p_hv_mw': float(row['p_hv_mw']),
                'q_hv_mvar': float(row['q_hv_mvar']),
                'p_lv_mw': float(row['p_lv_mw']),
                'q_lv_mvar': float(row['q_lv_mvar']),
                'pl_mw': float(row['pl_mw']),
                'ql_mvar': float(row['ql_mvar']),
                'i_hv_ka': float(row['i_hv_ka']),
                'i_lv_ka': float(row['i_lv_ka']),
                'loading_percent': float(row['loading_percent'])
            })
        
        # Load results
        for idx, row in net.res_load.iterrows():
            load_name = net.load.at[idx, 'name']
            results['loads'].append({
                'id': int(idx),
                'name': load_name,
                'p_mw': float(row['p_mw']),
                'q_mvar': float(row['q_mvar'])
            })
        
        # External grid results
        for idx, row in net.res_ext_grid.iterrows():
            grid_name = net.ext_grid.at[idx, 'name']
            results['ext_grids'].append({
                'id': int(idx),
                'name': grid_name,
                'p_mw': float(row['p_mw']),
                'q_mvar': float(row['q_mvar'])
            })
        
        # Shunt results
        for idx, row in net.res_shunt.iterrows():
            shunt_name = net.shunt.at[idx, 'name']
            results['shunts'].append({
                'id': int(idx),
                'name': shunt_name,
                'p_mw': float(row['p_mw']),
                'q_mvar': float(row['q_mvar']),
                'vm_pu': float(row['vm_pu'])
            })
        
        # Calculate summary metrics
        total_generation = sum([g['p_mw'] for g in results['ext_grids']])
        total_load = sum([l['p_mw'] for l in results['loads']])
        total_losses = sum([l['pl_mw'] for l in results['lines']]) + \
                      sum([t['pl_mw'] for t in results['transformers']])
        
        efficiency = ((total_load / total_generation) * 100) if total_generation > 0 else 0
        
        results['summary'] = {
            'total_generation_mw': float(total_generation),
            'total_load_mw': float(total_load),
            'total_losses_mw': float(total_losses),
            'efficiency_percent': float(efficiency),
            'converged': True
        }
        
        return results
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'summary': {
                'converged': False
            }
        }


def main():
    """Main function for CLI usage"""
    if len(sys.argv) > 1:
        # Parse JSON parameters from command line
        try:
            params = json.loads(sys.argv[1])
        except:
            params = {}
    else:
        params = {}
    
    # Create network
    net = create_hvdc_network(params)
    
    # Run simulation
    results = run_simulation(net)
    
    # Output results as JSON
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
