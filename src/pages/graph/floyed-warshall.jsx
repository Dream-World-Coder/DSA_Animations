import { useState, useRef, useCallback } from "react";
import { ShadCNHeader as Header } from "../../components/Header/ShadCNNav";
import SpeedControls from "../../components/utils/SpeedControl";
import Description from "../../components/utils/Description";
import SEOData from "../../components/SEO";

// ─── Constants ────────────────────────────────────────────────────────────────
const INF = 1e8; // sentinel for "no path"
const N = 5;

// Directed weighted edges: [from, to, weight]
const DIRECTED_EDGES = [
  [0, 1, 3],
  [0, 2, 8],
  [1, 2, 2],
  [1, 3, 5],
  [2, 4, 1],
  [3, 2, 1],
  [3, 4, 6],
  [4, 0, 4],
  [4, 3, 2],
];

// Pentagon layout, SVG viewBox 0 0 500 420
const GRAPH_NODES = [
  { id: 0, x: 250, y: 55 },
  { id: 1, x: 60, y: 200 },
  { id: 2, x: 145, y: 375 },
  { id: 3, x: 355, y: 375 },
  { id: 4, x: 440, y: 200 },
];

// ─── Step pre-computation (runs once, outside component) ──────────────────────
function buildInitialDist() {
  const dist = Array.from({ length: N }, () => Array(N).fill(INF));
  for (let i = 0; i < N; i++) dist[i][i] = 0;
  for (const [u, v, w] of DIRECTED_EDGES) dist[u][v] = w;
  return dist;
}

function computeFWSteps() {
  const steps = [];
  const dist = buildInitialDist();
  const everUpdated = new Set();

  const snap = () => dist.map((r) => [...r]);
  const disp = (v) => (v >= INF ? "∞" : v);

  steps.push({
    k: -1,
    i: -1,
    j: -1,
    matrix: snap(),
    updated: false,
    oldVal: null,
    newVal: null,
    ikVal: null,
    kjVal: null,
    phase: "init",
    everUpdated: new Set(),
    message:
      "Initial matrix — direct edge weights, 0 on diagonal, ∞ where no direct path.",
  });

  for (let k = 0; k < N; k++) {
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const ikVal = dist[i][k];
        const kjVal = dist[k][j];
        const through = ikVal >= INF || kjVal >= INF ? INF : ikVal + kjVal;
        const oldVal = dist[i][j];
        const updated = through < oldVal;

        if (updated) {
          dist[i][j] = through;
          everUpdated.add(`${i}-${j}`);
        }

        let message;
        if (i === j) {
          message = `dist[${i}][${j}] = 0  (diagonal — trivial self-path)`;
        } else if (updated) {
          message = `dist[${i}][${j}]: ${disp(oldVal)} → ${disp(through)}  via node ${k}  (${disp(ikVal)} + ${disp(kjVal)} < ${disp(oldVal)})  ✓ Updated`;
        } else {
          const why =
            through >= INF
              ? `path ${i}→${k}→${j} doesn't exist`
              : `${disp(ikVal)} + ${disp(kjVal)} = ${through} ≥ ${disp(oldVal)}`;
          message = `dist[${i}][${j}] stays ${disp(oldVal)}  —  ${why}`;
        }

        steps.push({
          k,
          i,
          j,
          matrix: snap(),
          updated,
          oldVal,
          newVal: dist[i][j],
          ikVal,
          kjVal,
          phase: "running",
          everUpdated: new Set(everUpdated),
          message,
        });
      }
    }
  }

  steps.push({
    k: -1,
    i: -1,
    j: -1,
    matrix: snap(),
    updated: false,
    oldVal: null,
    newVal: null,
    ikVal: null,
    kjVal: null,
    phase: "done",
    everUpdated: new Set(everUpdated),
    message: `All-pairs shortest paths computed — ${everUpdated.size} cells updated from the initial matrix.`,
  });

  return steps;
}

const ALL_STEPS = computeFWSteps();
const TOTAL_STEPS = ALL_STEPS.length - 1;

// ─── Style helpers ────────────────────────────────────────────────────────────
function getNodeStyle(id, step) {
  const DEFAULT = { fill: "#262626", stroke: "#525252", text: "#9ca3af" };
  if (!step || step.phase !== "running") return DEFAULT;
  if (id === step.k)
    return { fill: "#4f46e5", stroke: "#818cf8", text: "#ffffff" };
  if (id === step.i)
    return { fill: "#d97706", stroke: "#fbbf24", text: "#000000" };
  if (id === step.j)
    return { fill: "#e11d48", stroke: "#fb7185", text: "#ffffff" };
  return DEFAULT;
}

function getEdgeStyle(u, v, step) {
  const DEFAULT = {
    stroke: "#404040",
    markerIdx: 0,
    width: 2,
    opacity: 0.6,
    dash: undefined,
  };
  if (!step || step.phase !== "running") return DEFAULT;
  if (u === step.i && v === step.k)
    return {
      stroke: "#f59e0b",
      markerIdx: 1,
      width: 2.5,
      opacity: 1,
      dash: undefined,
    };
  if (u === step.k && v === step.j)
    return {
      stroke: "#fb7185",
      markerIdx: 2,
      width: 2.5,
      opacity: 1,
      dash: undefined,
    };
  if (u === step.i && v === step.j)
    return {
      stroke: "#94a3b8",
      markerIdx: 3,
      width: 1.5,
      opacity: 0.7,
      dash: "6 3",
    };
  return DEFAULT;
}

function arrowEndpoints(n1, n2, r = 26, pad = 10) {
  const dx = n2.x - n1.x,
    dy = n2.y - n1.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len,
    uy = dy / len;
  return {
    x1: n1.x + ux * (r + 2),
    y1: n1.y + uy * (r + 2),
    x2: n2.x - ux * (r + pad),
    y2: n2.y - uy * (r + pad),
  };
}

function edgeLabelPos(n1, n2, offset = 13) {
  const mx = (n1.x + n2.x) / 2,
    my = (n1.y + n2.y) / 2;
  const dx = n2.x - n1.x,
    dy = n2.y - n1.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  return { x: mx + (-dy / len) * offset, y: my + (dx / len) * offset };
}

function getCellStyle(i, j, step) {
  const isCurrent = step?.phase === "running" && i === step.i && j === step.j;
  const isKAxis = step?.phase === "running" && (i === step.k || j === step.k);
  const wasUpdated = step?.everUpdated?.has(`${i}-${j}`);
  const isDiag = i === j;

  if (isCurrent && step.updated)
    return { bg: "#065f46", text: "#6ee7b7", bold: true };
  if (isCurrent) return { bg: "#78350f", text: "#fcd34d", bold: true };
  if (isDiag) return { bg: "#1c1c1c", text: "#4b5563", bold: false };
  if (isKAxis && wasUpdated)
    return { bg: "#1e1b4b", text: "#a5b4fc", bold: false };
  if (isKAxis) return { bg: "#1e1b4b", text: "#818cf8", bold: false };
  if (wasUpdated) return { bg: "#022c22", text: "#34d399", bold: false };
  return { bg: "#171717", text: "#6b7280", bold: false };
}

const disp = (v) => (v === null || v >= INF ? "∞" : v);

// ─── Component ────────────────────────────────────────────────────────────────
export default function FloydWarshall() {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const timeoutRef = useRef(null);

  const step = ALL_STEPS[currentStepIdx];

  const stopAnimation = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsAnimating(false);
  }, []);

  const reset = useCallback(() => {
    stopAnimation();
    setCurrentStepIdx(0);
  }, [stopAnimation]);

  const goPrev = useCallback(() => {
    if (!isAnimating) setCurrentStepIdx((i) => Math.max(i - 1, 0));
  }, [isAnimating]);

  const goNext = useCallback(() => {
    if (!isAnimating)
      setCurrentStepIdx((i) => Math.min(i + 1, ALL_STEPS.length - 1));
  }, [isAnimating]);

  const togglePlay = useCallback(() => {
    if (isAnimating) {
      stopAnimation();
      return;
    }

    let idx = currentStepIdx;
    if (ALL_STEPS[idx]?.phase === "done") idx = 0;
    setIsAnimating(true);

    const animate = (i) => {
      if (i >= ALL_STEPS.length) {
        setIsAnimating(false);
        return;
      }
      setCurrentStepIdx(i);
      timeoutRef.current = setTimeout(() => animate(i + 1), animationSpeed);
    };
    animate(idx);
  }, [isAnimating, currentStepIdx, stopAnimation, animationSpeed]);

  // ── Render ──────────────────────────────────────────────────────────────────
  const descriptionData = {
    heading: "Floyd-Warshall Algorithm",
    subheading:
      "All-pairs shortest paths via dynamic programming — considers every node as a potential intermediate stop.",
    summary: `<p>
      Floyd-Warshall computes the shortest path between <em>every</em> pair of
      nodes in a weighted directed graph. It runs three nested loops over nodes,
      progressively refining the distance matrix by routing paths through each
      intermediate node <strong>k</strong>.
    </p>
    <ul class="list-disc list-inside mt-2 space-y-1">
      <li>Initialise <code>dist[i][j]</code> = direct edge weight, 0 on diagonal, ∞ elsewhere.</li>
      <li>For each <strong>k</strong>: if <code>dist[i][k] + dist[k][j] &lt; dist[i][j]</code>, update it.</li>
      <li>After n outer iterations, the matrix holds all-pairs shortest distances.</li>
    </ul>
    <p class="mt-2">
      <strong>Negative-cycle detection:</strong> if any <code>dist[i][i] &lt; 0</code> after completion,
      the graph contains a negative cycle.
    </p>
    <p class="mt-2">
      <strong>Time:</strong> O(V³) &nbsp;|&nbsp; <strong>Space:</strong> O(V²).
      Simpler to implement than running Dijkstra from every node,
      and handles negative edge weights (without negative cycles).
    </p>`,
    lang: "python",
    code: `INF = float('inf')

def floyd_warshall(graph, n):
    # graph[u][v] = weight of edge u→v, or INF
    dist = [row[:] for row in graph]   # deep copy

    for k in range(n):                 # intermediate node
        for i in range(n):             # source
            for j in range(n):         # destination
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]

    # Negative-cycle check
    for i in range(n):
        if dist[i][i] < 0:
            raise ValueError("Negative cycle detected")

    return dist


# This visualisation's graph (5 nodes)
INF = float('inf')
graph = [
#        0    1    2    3    4
    [    0,   3,   8, INF, INF],  # 0
    [  INF,   0,   2,   5, INF],  # 1
    [  INF, INF,   0, INF,   1],  # 2
    [  INF, INF,   1,   0,   6],  # 3
    [    4, INF, INF,   2,   0],  # 4
]

result = floyd_warshall(graph, 5)
for row in result:
    print([x if x < INF else '∞' for x in row])`,
  };

  const seoData = {
    title: "Floyd-Warshall Algorithm — All-Pairs Shortest Paths Visualization",
    description:
      "Step through the Floyd-Warshall algorithm interactively. Watch the distance matrix update as each intermediate node k relaxes paths between every pair of nodes.",
    canonical: "https://dsa-experiments.vercel.app/graphs/floyd-warshall",
    openGraph: {
      title:
        "Floyd-Warshall Algorithm — All-Pairs Shortest Paths Visualization",
      description:
        "Step through the Floyd-Warshall algorithm interactively. Watch the distance matrix update step by step.",
      url: "https://dsa-experiments.vercel.app/graphs/floyd-warshall",
      image: "/images/defaults/preview.png",
    },
    schema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Floyd-Warshall Algorithm — All-Pairs Shortest Paths Visualization",
      url: "https://dsa-experiments.vercel.app/graphs/floyd-warshall",
      description:
        "Interactive step-by-step visualization of the Floyd-Warshall all-pairs shortest path algorithm.",
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://dsa-experiments.vercel.app",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Graphs",
            item: "https://dsa-experiments.vercel.app/graphs",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Floyd-Warshall",
            item: "https://dsa-experiments.vercel.app/graphs/floyd-warshall",
          },
        ],
      },
    },
  };

  return (
    <>
      <SEOData data={seoData} />

      <div className="min-h-screen max-w-7xl mx-auto w-full flex flex-col items-center justify-start gap-20 py-20 md:py-32 px-0 bg-neutral-900">
        <Header />

        <div className="bg-neutral-800 rounded-lg p-4 md:p-8 border border-neutral-700 w-full">
          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-wide">
              Floyd-Warshall
            </h1>
            <p className="text-neutral-300 text-lg">
              Step: {currentStepIdx} / {TOTAL_STEPS}
              {step?.phase === "running" && (
                <span className="text-neutral-500 ml-3 text-base">
                  k = {step.k}, i = {step.i}, j = {step.j}
                </span>
              )}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap justify-center items-center gap-3 mb-8">
            <button
              onClick={goPrev}
              disabled={isAnimating || currentStepIdx === 0}
              className="bg-neutral-700 text-white px-5 py-2 rounded-md font-semibold hover:bg-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              ← Prev
            </button>

            <SpeedControls
              animationSpeed={animationSpeed}
              setAnimationSpeed={setAnimationSpeed}
              isAnimating={isAnimating}
            />

            <button
              onClick={togglePlay}
              className="bg-white text-black px-6 py-2 rounded-md font-semibold hover:bg-neutral-200 transition-all duration-200 shadow-lg"
            >
              {isAnimating
                ? "Pause"
                : step?.phase === "done"
                  ? "Replay"
                  : "Start"}
            </button>

            <button
              onClick={reset}
              disabled={isAnimating}
              className="bg-neutral-700 text-white px-6 py-2 rounded-md font-semibold hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              Reset
            </button>

            <button
              onClick={goNext}
              disabled={isAnimating || currentStepIdx === ALL_STEPS.length - 1}
              className="bg-neutral-700 text-white px-5 py-2 rounded-md font-semibold hover:bg-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              Next →
            </button>
          </div>

          {/* Main board */}
          <div className="flex flex-col xl:flex-row justify-center items-start gap-6 mb-6 bg-black p-5 md:p-8 rounded-lg">
            {/* ── Left: Graph SVG ── */}
            <div className="w-full xl:w-96 shrink-0">
              <p className="text-neutral-500 text-xs uppercase tracking-widest mb-3 text-center font-semibold">
                Graph (directed, weighted)
              </p>
              <svg viewBox="0 0 500 420" className="w-full h-auto">
                <defs>
                  {[
                    { id: "arr-0", color: "#525252" },
                    { id: "arr-1", color: "#f59e0b" },
                    { id: "arr-2", color: "#fb7185" },
                    { id: "arr-3", color: "#94a3b8" },
                  ].map(({ id, color }) => (
                    <marker
                      key={id}
                      id={id}
                      markerWidth="8"
                      markerHeight="6"
                      refX="7"
                      refY="3"
                      orient="auto"
                    >
                      <polygon points="0 0, 8 3, 0 6" fill={color} />
                    </marker>
                  ))}
                </defs>

                {DIRECTED_EDGES.map(([u, v, w]) => {
                  const nu = GRAPH_NODES[u];
                  const nv = GRAPH_NODES[v];
                  const ep = arrowEndpoints(nu, nv);
                  const lp = edgeLabelPos(nu, nv);
                  const sty = getEdgeStyle(u, v, step);
                  return (
                    <g key={`${u}-${v}`}>
                      <line
                        x1={ep.x1}
                        y1={ep.y1}
                        x2={ep.x2}
                        y2={ep.y2}
                        stroke={sty.stroke}
                        strokeWidth={sty.width}
                        strokeOpacity={sty.opacity}
                        strokeDasharray={sty.dash}
                        markerEnd={`url(#arr-${sty.markerIdx})`}
                        className="transition-all duration-200"
                      />
                      <text
                        x={lp.x}
                        y={lp.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={sty.stroke}
                        fontSize={11}
                        fontFamily="monospace"
                        className="select-none transition-all duration-200"
                        fillOpacity={sty.opacity}
                      >
                        {w}
                      </text>
                    </g>
                  );
                })}

                {GRAPH_NODES.map((node) => {
                  const sty = getNodeStyle(node.id, step);
                  return (
                    <g key={node.id}>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={26}
                        fill={sty.fill}
                        stroke={sty.stroke}
                        strokeWidth={2}
                        className="transition-all duration-300"
                      />
                      <text
                        x={node.x}
                        y={node.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={sty.text}
                        fontSize={15}
                        fontWeight="700"
                        fontFamily="monospace"
                        className="select-none"
                      >
                        {node.id}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Node role legend (only when running) */}
              {step?.phase === "running" && (
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-3">
                  {[
                    {
                      color: "#4f46e5",
                      label: `k = ${step.k}  (intermediate)`,
                    },
                    { color: "#d97706", label: `i = ${step.i}  (source row)` },
                    { color: "#e11d48", label: `j = ${step.j}  (dest col)` },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: l.color }}
                      />
                      <span className="text-neutral-400 text-xs font-mono">
                        {l.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Right: Distance Matrix ── */}
            <div className="flex-1 w-full">
              <p className="text-neutral-500 text-xs uppercase tracking-widest mb-3 text-center font-semibold">
                Distance Matrix
                {step?.phase === "running" ? ` — outer loop k = ${step.k}` : ""}
              </p>

              <div className="overflow-x-auto flex justify-center">
                <table className="border-collapse font-mono text-sm">
                  {/* Column headers */}
                  <thead>
                    <tr>
                      <th className="w-10 h-10 text-neutral-600 font-normal text-xs">
                        i \\ j
                      </th>
                      {Array.from({ length: N }, (_, j) => (
                        <th
                          key={j}
                          className="w-14 h-10 text-center transition-colors duration-200"
                          style={{
                            color:
                              step?.phase === "running" && j === step.k
                                ? "#818cf8"
                                : "#6b7280",
                            fontWeight:
                              step?.phase === "running" && j === step.k
                                ? "700"
                                : "400",
                          }}
                        >
                          {j}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: N }, (_, i) => (
                      <tr key={i}>
                        {/* Row header */}
                        <td
                          className="w-10 h-12 text-center transition-colors duration-200"
                          style={{
                            color:
                              step?.phase === "running" && i === step.k
                                ? "#818cf8"
                                : "#6b7280",
                            fontWeight:
                              step?.phase === "running" && i === step.k
                                ? "700"
                                : "400",
                          }}
                        >
                          {i}
                        </td>

                        {Array.from({ length: N }, (_, j) => {
                          const val = step?.matrix?.[i]?.[j] ?? INF;
                          const cs = getCellStyle(i, j, step);
                          return (
                            <td
                              key={j}
                              style={{ backgroundColor: cs.bg, color: cs.text }}
                              className={`text-center w-14 h-12 border border-neutral-800 transition-all duration-200 text-base ${cs.bold ? "font-bold" : ""}`}
                            >
                              {val >= INF ? "∞" : val}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Matrix legend */}
              <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-5">
                {[
                  { bg: "#78350f", text: "#fcd34d", label: "Evaluating" },
                  { bg: "#065f46", text: "#6ee7b7", label: "Updated ✓" },
                  { bg: "#1e1b4b", text: "#818cf8", label: "k row / col" },
                  {
                    bg: "#022c22",
                    text: "#34d399",
                    label: "Previously updated",
                  },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-2">
                    <div
                      className="w-8 h-5 rounded text-xs flex items-center justify-center font-mono shrink-0"
                      style={{ backgroundColor: l.bg, color: l.text }}
                    >
                      3
                    </div>
                    <span className="text-neutral-400 text-xs">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step info bar */}
          <div className="bg-neutral-900 rounded-lg px-5 py-4 mb-4 border border-neutral-700">
            {step?.phase === "running" && (
              <p className="text-indigo-400 text-xs uppercase tracking-widest mb-1 text-center font-semibold">
                Outer loop: k = {step.k} (node {step.k} as intermediate)
              </p>
            )}
            <p
              className={`text-sm font-mono text-center ${
                step?.updated
                  ? "text-emerald-400"
                  : step?.phase === "done"
                    ? "text-white"
                    : "text-neutral-300"
              }`}
            >
              {step?.message ?? ""}
            </p>

            {/* Formula breakdown — only when there's something non-trivial to show */}
            {step?.phase === "running" && step.i !== step.j && (
              <div className="flex justify-center items-center gap-2 mt-2 font-mono text-xs text-neutral-500 flex-wrap">
                <span>
                  dist[{step.i}][{step.k}] ={" "}
                  <span className="text-amber-400">{disp(step.ikVal)}</span>
                </span>
                <span className="text-neutral-700">+</span>
                <span>
                  dist[{step.k}][{step.j}] ={" "}
                  <span className="text-rose-400">{disp(step.kjVal)}</span>
                </span>
                <span className="text-neutral-700">=</span>
                <span
                  className={
                    step.updated
                      ? "text-emerald-400 font-bold"
                      : "text-neutral-400"
                  }
                >
                  {step.ikVal >= INF || step.kjVal >= INF
                    ? "∞"
                    : step.ikVal + step.kjVal}
                </span>
                <span className="text-neutral-700">
                  {step.updated ? "< " : "≥ "}
                </span>
                <span>
                  dist[{step.i}][{step.j}] = {disp(step.oldVal)}
                </span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-neutral-700 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-white to-neutral-300 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStepIdx / TOTAL_STEPS) * 100}%` }}
            />
          </div>

          <div className="text-center text-neutral-300 text-sm opacity-60">
            Time: O(V³) · Space: O(V²) · Handles negative edges (no negative
            cycles)
          </div>
        </div>

        <Description dataObj={descriptionData} />
      </div>
    </>
  );
}
