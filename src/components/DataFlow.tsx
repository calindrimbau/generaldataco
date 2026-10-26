import { siteContent } from "@/lib/site";

import styles from "./DataFlow.module.css";

const flows = [
  {
    id: "data-flow-1",
    path: "M 70 66 C 232 66, 396 142, 622 176",
    offset: 0,
  },
  {
    id: "data-flow-2",
    path: "M 70 150 C 244 150, 418 176, 622 188",
    offset: 0.6,
  },
  {
    id: "data-flow-3",
    path: "M 70 234 C 244 234, 418 212, 622 200",
    offset: 1.2,
  },
  {
    id: "data-flow-4",
    path: "M 70 318 C 232 318, 396 238, 622 212",
    offset: 1.8,
  },
] as const;

const packetOffsets = [0, 2.6, 5.2] as const;

export function DataFlow() {
  return (
    <svg
      className={styles.diagram}
      viewBox="0 0 760 384"
      role="img"
      aria-label={siteContent.dataFlow.accessibleLabel}
      preserveAspectRatio="xMidYMid meet"
    >
      <g aria-hidden="true">
        <g className={styles.paths}>
          {flows.map((flow) => (
            <path key={flow.id} id={flow.id} d={flow.path} />
          ))}
        </g>

        <g className={styles.sources}>
          {[50, 134, 218, 302].map((y, index) => (
            <g key={y}>
              <rect x="34" y={y} width="36" height="32" rx="7" />
              <circle cx="47" cy={y + 16} r="2.5" />
              <path
                d={`M 54 ${y + 11} H 62 M 54 ${y + 16} H 62 M 54 ${y + 21} H ${58 + index}`}
              />
            </g>
          ))}
        </g>

        <g className={styles.destination}>
          <rect x="622" y="146" width="112" height="92" rx="18" />
          <text x="678" y="195" textAnchor="middle" dominantBaseline="middle">
            {siteContent.dataFlow.destinationLabel}
          </text>
        </g>

        <g className={styles.pulse}>
          <rect x="614" y="138" width="128" height="108" rx="24">
            <animate
              attributeName="opacity"
              values="0;0.38;0"
              dur="4.8s"
              repeatCount="indefinite"
            />
          </rect>
        </g>

        <g className={styles.packets}>
          {flows.flatMap((flow) =>
            packetOffsets.map((packetOffset) => (
              <circle key={`${flow.id}-${packetOffset}`} r="3.5">
                <animateMotion
                  dur="7.8s"
                  begin={`-${flow.offset + packetOffset}s`}
                  repeatCount="indefinite"
                >
                  <mpath href={`#${flow.id}`} />
                </animateMotion>
              </circle>
            )),
          )}
        </g>
      </g>
    </svg>
  );
}
