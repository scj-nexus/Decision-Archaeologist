interface EvidenceGraphProps {
  hotspots: Array<{
    source: string;
    target: string;
    weight: number;
  }>;
  affectedAreas: string[];
}

function normalizeArea(value: string) {
  return value.replace(/^src\//, "").split("/")[0] ?? value;
}

export function EvidenceGraph({ hotspots, affectedAreas }: EvidenceGraphProps) {
  const focalAreas = affectedAreas.map(normalizeArea);
  const selectedEdges = hotspots.filter(
    (edge) => focalAreas.includes(edge.source) || focalAreas.includes(edge.target),
  );
  const nodeNames = [...new Set([...focalAreas, ...selectedEdges.flatMap((edge) => [edge.source, edge.target])])]
    .filter(Boolean)
    .slice(0, 6);
  const radius = 122;
  const center = 150;
  const nodes = nodeNames.map((name, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(nodeNames.length, 1) - Math.PI / 2;

    return {
      name,
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
    };
  });

  return (
    <div className="space-y-4">
      <svg viewBox="0 0 300 300" className="h-[20rem] w-full rounded-[1.5rem] bg-[rgba(31,20,14,0.95)] p-3">
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="75%">
            <stop offset="0%" stopColor="rgba(214,145,87,0.45)" />
            <stop offset="100%" stopColor="rgba(214,145,87,0)" />
          </radialGradient>
        </defs>
        <circle cx="150" cy="150" r="128" fill="url(#glow)" />
        {selectedEdges.map((edge) => {
          const source = nodes.find((node) => node.name === edge.source);
          const target = nodes.find((node) => node.name === edge.target);

          if (!source || !target) {
            return null;
          }

          return (
            <line
              key={`${edge.source}-${edge.target}`}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke="rgba(244, 210, 178, 0.55)"
              strokeWidth={1 + edge.weight * 0.7}
              strokeLinecap="round"
            />
          );
        })}
        {nodes.map((node) => {
          const isFocal = focalAreas.includes(node.name);

          return (
            <g key={node.name}>
              <circle
                cx={node.x}
                cy={node.y}
                r={isFocal ? 22 : 16}
                fill={isFocal ? "#d69157" : "#f1ddc2"}
                opacity={isFocal ? 1 : 0.85}
              />
              <text
                x={node.x}
                y={node.y + 4}
                textAnchor="middle"
                fontSize="9"
                fontFamily="var(--font-mono)"
                fill={isFocal ? "#1c120d" : "#2f221b"}
              >
                {node.name.slice(0, 10)}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="text-sm leading-7 text-[rgba(248,236,215,0.75)]">
        Node size highlights the selected decision surface. Thick seams indicate subsystems that repeatedly changed together.
      </p>
    </div>
  );
}
