import { Card } from "@/components/ui/card";

interface CircuitDiagramProps {
  result: any;
}

export default function CircuitDiagram({ result }: CircuitDiagramProps) {
  const buses = result?.buses || [];
  const transformers = result?.transformers || [];
  const lines = result?.lines || [];

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox="0 0 1200 600"
        className="w-full h-auto"
        style={{ minHeight: "400px" }}
      >
        <defs>
          {/* Gradient definitions */}
          <linearGradient id="busGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.65 0.25 240)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="oklch(0.55 0.20 200)" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="oklch(0.65 0.25 240)" />
            <stop offset="100%" stopColor="oklch(0.55 0.20 200)" />
          </linearGradient>
          
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background grid */}
        <g opacity="0.1">
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={`v${i}`}
              x1={i * 100}
              y1="0"
              x2={i * 100}
              y2="600"
              stroke="currentColor"
              strokeWidth="0.5"
            />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line
              key={`h${i}`}
              x1="0"
              y1={i * 100}
              x2="1200"
              y2={i * 100}
              stroke="currentColor"
              strokeWidth="0.5"
            />
          ))}
        </g>

        {/* AC System 1 (Left) */}
        <g>
          <circle cx="100" cy="300" r="40" fill="url(#busGradient)" filter="url(#glow)" />
          <text x="100" y="305" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
            AC 1
          </text>
          <text x="100" y="360" textAnchor="middle" fill="oklch(0.65 0.25 240)" fontSize="12">
            345 kV
          </text>
          {buses[0] && (
            <text x="100" y="380" textAnchor="middle" fill="oklch(0.55 0.20 200)" fontSize="11">
              {buses[0].vm_pu.toFixed(3)} pu
            </text>
          )}
        </g>

        {/* Transformer 1 (Rectifier) */}
        <g>
          <line x1="140" y1="300" x2="240" y2="300" stroke="url(#lineGradient)" strokeWidth="3" />
          <rect x="240" y="260" width="80" height="80" fill="oklch(0.16 0.02 260)" stroke="oklch(0.65 0.25 240)" strokeWidth="2" rx="8" />
          <circle cx="260" cy="280" r="15" fill="none" stroke="oklch(0.65 0.25 240)" strokeWidth="2" />
          <circle cx="300" cy="280" r="15" fill="none" stroke="oklch(0.55 0.20 200)" strokeWidth="2" />
          <text x="280" y="325" textAnchor="middle" fill="oklch(0.65 0.25 240)" fontSize="11" fontWeight="bold">
            T1
          </text>
          <text x="280" y="360" textAnchor="middle" fill="oklch(0.98 0.01 260)" fontSize="9">
            1196 MVA
          </text>
        </g>

        {/* DC Bus 1 (Rectifier) */}
        <g>
          <rect x="350" y="280" width="60" height="40" fill="url(#busGradient)" stroke="oklch(0.65 0.25 240)" strokeWidth="2" rx="6" filter="url(#glow)" />
          <text x="380" y="305" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
            DC 1
          </text>
          <text x="380" y="340" textAnchor="middle" fill="oklch(0.65 0.25 240)" fontSize="10">
            Retificador
          </text>
          {buses[2] && (
            <text x="380" y="360" textAnchor="middle" fill="oklch(0.55 0.20 200)" fontSize="10">
              {buses[2].vm_pu.toFixed(3)} pu
            </text>
          )}
        </g>

        {/* Rectifier */}
        <g>
          <rect x="340" y="180" width="80" height="60" fill="oklch(0.16 0.02 260)" stroke="oklch(0.65 0.25 240)" strokeWidth="2" rx="8" />
          <path d="M 360 210 L 380 190 L 380 230 Z" fill="oklch(0.65 0.25 240)" />
          <path d="M 380 210 L 400 190 L 400 230 Z" fill="oklch(0.55 0.20 200)" />
          <text x="380" y="225" textAnchor="middle" fill="oklch(0.98 0.01 260)" fontSize="10">
            12-Pulse
          </text>
          <line x1="380" y1="240" x2="380" y2="280" stroke="oklch(0.65 0.25 240)" strokeWidth="2" />
        </g>

        {/* DC Link */}
        <g>
          <line x1="410" y1="300" x2="790" y2="300" stroke="url(#lineGradient)" strokeWidth="4" filter="url(#glow)" />
          <text x="600" y="290" textAnchor="middle" fill="oklch(0.65 0.25 240)" fontSize="12" fontWeight="bold">
            DC LINK
          </text>
          {lines[0] && (
            <>
              <text x="600" y="320" textAnchor="middle" fill="oklch(0.55 0.20 200)" fontSize="10">
                {lines[0].p_from_mw.toFixed(2)} MW
              </text>
              <text x="600" y="335" textAnchor="middle" fill="oklch(0.70 0.18 160)" fontSize="10">
                {lines[0].i_ka.toFixed(2)} kA
              </text>
            </>
          )}
          
          {/* DC Link components */}
          <rect x="550" y="285" width="30" height="30" fill="oklch(0.16 0.02 260)" stroke="oklch(0.65 0.25 240)" strokeWidth="1.5" rx="4" />
          <text x="565" y="303" textAnchor="middle" fill="oklch(0.65 0.25 240)" fontSize="9">
            L
          </text>
          <rect x="620" y="285" width="30" height="30" fill="oklch(0.16 0.02 260)" stroke="oklch(0.55 0.20 200)" strokeWidth="1.5" rx="4" />
          <text x="635" y="303" textAnchor="middle" fill="oklch(0.55 0.20 200)" fontSize="9">
            R
          </text>
        </g>

        {/* DC Bus 2 (Inverter) */}
        <g>
          <rect x="790" y="280" width="60" height="40" fill="url(#busGradient)" stroke="oklch(0.65 0.25 240)" strokeWidth="2" rx="6" filter="url(#glow)" />
          <text x="820" y="305" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
            DC 2
          </text>
          <text x="820" y="340" textAnchor="middle" fill="oklch(0.65 0.25 240)" fontSize="10">
            Inversor
          </text>
          {buses[3] && (
            <text x="820" y="360" textAnchor="middle" fill="oklch(0.55 0.20 200)" fontSize="10">
              {buses[3].vm_pu.toFixed(3)} pu
            </text>
          )}
        </g>

        {/* Inverter */}
        <g>
          <rect x="780" y="180" width="80" height="60" fill="oklch(0.16 0.02 260)" stroke="oklch(0.65 0.25 240)" strokeWidth="2" rx="8" />
          <path d="M 800 210 L 820 190 L 820 230 Z" fill="oklch(0.65 0.25 240)" />
          <path d="M 820 210 L 840 190 L 840 230 Z" fill="oklch(0.55 0.20 200)" />
          <text x="820" y="225" textAnchor="middle" fill="oklch(0.98 0.01 260)" fontSize="10">
            12-Pulse
          </text>
          <line x1="820" y1="240" x2="820" y2="280" stroke="oklch(0.65 0.25 240)" strokeWidth="2" />
        </g>

        {/* Transformer 2 (Inverter) */}
        <g>
          <line x1="850" y1="300" x2="880" y2="300" stroke="url(#lineGradient)" strokeWidth="3" />
          <rect x="880" y="260" width="80" height="80" fill="oklch(0.16 0.02 260)" stroke="oklch(0.65 0.25 240)" strokeWidth="2" rx="8" />
          <circle cx="900" cy="280" r="15" fill="none" stroke="oklch(0.65 0.25 240)" strokeWidth="2" />
          <circle cx="940" cy="280" r="15" fill="none" stroke="oklch(0.55 0.20 200)" strokeWidth="2" />
          <text x="920" y="325" textAnchor="middle" fill="oklch(0.65 0.25 240)" fontSize="11" fontWeight="bold">
            T2
          </text>
          <text x="920" y="360" textAnchor="middle" fill="oklch(0.98 0.01 260)" fontSize="9">
            1196 MVA
          </text>
        </g>

        {/* AC System 2 (Right) */}
        <g>
          <line x1="960" y1="300" x2="1060" y2="300" stroke="url(#lineGradient)" strokeWidth="3" />
          <circle cx="1100" cy="300" r="40" fill="url(#busGradient)" filter="url(#glow)" />
          <text x="1100" y="305" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
            AC 2
          </text>
          <text x="1100" y="360" textAnchor="middle" fill="oklch(0.65 0.25 240)" fontSize="12">
            230 kV
          </text>
          {buses[1] && (
            <text x="1100" y="380" textAnchor="middle" fill="oklch(0.55 0.20 200)" fontSize="11">
              {buses[1].vm_pu.toFixed(3)} pu
            </text>
          )}
        </g>

        {/* Filters indicators */}
        <g>
          <rect x="340" y="360" width="80" height="30" fill="oklch(0.16 0.02 260)" stroke="oklch(0.70 0.18 160)" strokeWidth="1.5" rx="4" />
          <text x="380" y="380" textAnchor="middle" fill="oklch(0.70 0.18 160)" fontSize="9">
            Filtros LF/HF
          </text>
        </g>
        <g>
          <rect x="780" y="360" width="80" height="30" fill="oklch(0.16 0.02 260)" stroke="oklch(0.70 0.18 160)" strokeWidth="1.5" rx="4" />
          <text x="820" y="380" textAnchor="middle" fill="oklch(0.70 0.18 160)" fontSize="9">
            Filtros LF/HF
          </text>
        </g>

        {/* Load indicator */}
        <g>
          <rect x="1050" y="400" width="100" height="50" fill="oklch(0.16 0.02 260)" stroke="oklch(0.75 0.20 60)" strokeWidth="2" rx="6" />
          <text x="1100" y="420" textAnchor="middle" fill="oklch(0.75 0.20 60)" fontSize="11" fontWeight="bold">
            CARGA
          </text>
          <text x="1100" y="440" textAnchor="middle" fill="oklch(0.98 0.01 260)" fontSize="10">
            1000 MW
          </text>
        </g>

        {/* Legend */}
        <g transform="translate(50, 500)">
          <text x="0" y="0" fill="oklch(0.65 0.01 260)" fontSize="11" fontWeight="bold">
            Legenda:
          </text>
          <circle cx="10" cy="25" r="6" fill="url(#busGradient)" />
          <text x="25" y="29" fill="oklch(0.98 0.01 260)" fontSize="10">
            Barramento
          </text>
          <line x1="5" y1="45" x2="35" y2="45" stroke="url(#lineGradient)" strokeWidth="3" />
          <text x="45" y="49" fill="oklch(0.98 0.01 260)" fontSize="10">
            Linha DC
          </text>
          <rect x="5" y="60" width="25" height="15" fill="oklch(0.16 0.02 260)" stroke="oklch(0.65 0.25 240)" strokeWidth="1.5" rx="3" />
          <text x="40" y="71" fill="oklch(0.98 0.01 260)" fontSize="10">
            Equipamento
          </text>
        </g>
      </svg>
    </div>
  );
}
