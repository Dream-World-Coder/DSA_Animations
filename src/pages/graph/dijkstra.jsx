import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Graph definition ─────────────────────────────────────────────────────── */
const NODES = ["A", "B", "C", "D", "E", "F"];

const GRAPH = {
  A: [
    { node: "B", weight: 4 },
    { node: "C", weight: 2 },
  ],
  B: [
    { node: "A", weight: 4 },
    { node: "C", weight: 1 },
    { node: "D", weight: 5 },
  ],
  C: [
    { node: "A", weight: 2 },
    { node: "B", weight: 1 },
    { node: "D", weight: 8 },
    { node: "E", weight: 10 },
  ],
  D: [
    { node: "B", weight: 5 },
    { node: "C", weight: 8 },
    { node: "E", weight: 2 },
    { node: "F", weight: 6 },
  ],
  E: [
    { node: "C", weight: 10 },
    { node: "D", weight: 2 },
    { node: "F", weight: 3 },
  ],
  F: [
    { node: "D", weight: 6 },
    { node: "E", weight: 3 },
  ],
};

const EDGES = [
  { from: "A", to: "B", weight: 4 },
  { from: "A", to: "C", weight: 2 },
  { from: "B", to: "C", weight: 1 },
  { from: "B", to: "D", weight: 5 },
  { from: "C", to: "D", weight: 8 },
  { from: "C", to: "E", weight: 10 },
  { from: "D", to: "E", weight: 2 },
  { from: "D", to: "F", weight: 6 },
  { from: "E", to: "F", weight: 3 },
];

const NODE_POS = {
  A: { x: 90, y: 200 },
  B: { x: 260, y: 80 },
  C: { x: 260, y: 320 },
  D: { x: 430, y: 80 },
  E: { x: 430, y: 320 },
  F: { x: 580, y: 200 },
};

const START = "A";

/* ─── Step generator ────────────────────────────────────────────────────────── */
function generateSteps() {
  const steps = [];
  const dist = {};
  const prev = {};
  const visited = new Set();

  NODES.forEach((n) => {
    dist[n] = n === START ? 0 : Infinity;
    prev[n] = null;
  });

  steps.push({
    dist: { ...dist },
    prev: { ...prev },
    visited: new Set(),
    currentNode: null,
    relaxedEdges: new Set(),
    updatedNodes: new Set(),
    description: `Initialize: set dist[${START}] = 0, all others = ∞`,
    phase: "init",
  });

  while (visited.size < NODES.length) {
    let minNode = null;
    NODES.forEach((n) => {
      if (!visited.has(n) && dist[n] !== Infinity)
        if (minNode === null || dist[n] < dist[minNode]) minNode = n;
    });
    if (!minNode) break;

    steps.push({
      dist: { ...dist },
      prev: { ...prev },
      visited: new Set(visited),
      currentNode: minNode,
      relaxedEdges: new Set(),
      updatedNodes: new Set(),
      description: `Pick node ${minNode} (dist = ${dist[minNode]}) — minimum unvisited. Mark visited.`,
      phase: "select",
    });

    visited.add(minNode);

    const relaxedEdges = new Set();
    const updatedNodes = new Set();

    GRAPH[minNode].forEach(({ node: nb, weight }) => {
      if (!visited.has(nb)) {
        relaxedEdges.add([minNode, nb].sort().join("-"));
        const nd = dist[minNode] + weight;
        if (nd < dist[nb]) {
          dist[nb] = nd;
          prev[nb] = minNode;
          updatedNodes.add(nb);
        }
      }
    });

    steps.push({
      dist: { ...dist },
      prev: { ...prev },
      visited: new Set(visited),
      currentNode: minNode,
      relaxedEdges,
      updatedNodes,
      description:
        updatedNodes.size > 0
          ? `Relax edges from ${minNode} → updated: ${[...updatedNodes].map((n) => `${n}=${dist[n]}`).join(", ")}`
          : `Relax edges from ${minNode} — no improvements found.`,
      phase: "relax",
    });
  }

  /* build shortest-path edges for the final step */
  const pathEdges = new Set();
  NODES.forEach((n) => {
    if (prev[n]) pathEdges.add([prev[n], n].sort().join("-"));
  });

  steps.push({
    dist: { ...dist },
    prev: { ...prev },
    visited: new Set(visited),
    currentNode: null,
    relaxedEdges: new Set(),
    updatedNodes: new Set(),
    pathEdges,
    description: `Done! Shortest distances from ${START} to all nodes found.`,
    phase: "done",
  });

  return steps;
}

const STEPS = generateSteps();

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
const fmt = (d) => (d === Infinity ? "∞" : d);

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function Dijkstra() {
  const [stepIdx, setStepIdx] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimSpeed] = useState(800);
  const intervalRef = useRef(null);

  const step = STEPS[stepIdx];
  const totalSteps = STEPS.length;
  const isDone = stepIdx === totalSteps - 1;
  const isFirst = stepIdx === 0;

  /* auto-play */
  useEffect(() => {
    if (isAnimating) {
      intervalRef.current = setInterval(() => {
        setStepIdx((i) => {
          if (i >= totalSteps - 1) {
            setIsAnimating(false);
            return i;
          }
          return i + 1;
        });
      }, animationSpeed);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isAnimating, animationSpeed, totalSteps]);

  const goNext = useCallback(() => {
    if (isDone || isAnimating) return;
    setStepIdx((i) => i + 1);
  }, [isDone, isAnimating]);

  const goPrev = useCallback(() => {
    if (isFirst || isAnimating) return;
    setStepIdx((i) => i - 1);
  }, [isFirst, isAnimating]);

  const reset = () => {
    setIsAnimating(false);
    setStepIdx(0);
  };

  const handlePlay = () => {
    if (isAnimating) {
      setIsAnimating(false);
      return;
    }
    if (isDone) {
      setStepIdx(0);
    }
    setIsAnimating(true);
  };

  /* ── edge / node colors ── */
  const edgeColor = (from, to) => {
    const key = [from, to].sort().join("-");
    if (step.phase === "done" && step.pathEdges?.has(key)) return "#34d399"; // emerald
    if (step.relaxedEdges?.has(key)) return "#fbbf24"; // amber
    if (step.visited?.has(from) && step.visited?.has(to)) return "#6ee7b7"; // light emerald
    return "#404040";
  };

  const edgeWidth = (from, to) => {
    const key = [from, to].sort().join("-");
    if (step.phase === "done" && step.pathEdges?.has(key)) return 3;
    if (step.relaxedEdges?.has(key)) return 2.5;
    return 1.5;
  };

  const nodeFill = (n) => {
    if (step.currentNode === n) return "#fbbf24"; // amber
    if (step.updatedNodes?.has(n)) return "#38bdf8"; // sky
    if (step.visited?.has(n)) return "#34d399"; // emerald
    return "#262626";
  };

  const nodeStroke = (n) => {
    if (step.currentNode === n) return "#f59e0b";
    if (step.updatedNodes?.has(n)) return "#0ea5e9";
    if (step.visited?.has(n)) return "#10b981";
    return "#525252";
  };

  const nodeTxt = (n) =>
    step.currentNode === n || step.updatedNodes?.has(n) || step.visited?.has(n)
      ? "#000"
      : "#fff";

  const distTxt = (n) => (step.dist[n] === Infinity ? "#737373" : "#e5e5e5");

  /* ─── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen max-w-7xl mx-auto w-full flex flex-col items-center justify-start gap-20 py-20 md:py-32 px-4 bg-neutral-900">
      {/* ── Animation card ── */}
      <div className="bg-neutral-800 rounded-lg p-4 md:p-8 border border-neutral-700 w-full">
        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-wide">
            Dijkstra's Algorithm
          </h1>
          <p className="text-neutral-300 text-lg">
            Step {stepIdx + 1} / {totalSteps}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center items-center gap-3 mb-6">
          {/* Speed */}
          <div className="flex items-center gap-2">
            <label className="text-white font-medium text-sm">Speed:</label>
            <select
              value={animationSpeed}
              onChange={(e) => setAnimSpeed(parseInt(e.target.value))}
              disabled={isAnimating}
              className="bg-neutral-700 text-white border border-neutral-600 rounded-md px-2 py-1.5 text-sm disabled:opacity-50"
            >
              <option value={2000}>Super Slow</option>
              <option value={1200}>Slow</option>
              <option value={800}>Medium</option>
              <option value={400}>Fast</option>
              <option value={200}>Very Fast</option>
              <option value={50}>Lightning</option>
            </select>
          </div>

          {/* Prev */}
          <button
            onClick={goPrev}
            disabled={isFirst || isAnimating}
            className="bg-neutral-700 text-white px-4 py-2 rounded-md font-semibold hover:bg-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          >
            ← Prev
          </button>

          {/* Play / Pause */}
          <button
            onClick={handlePlay}
            className="bg-white text-black px-6 py-2 rounded-md font-semibold hover:bg-neutral-200 transition-all duration-200 shadow-lg min-w-[96px]"
          >
            {isAnimating ? "Pause" : isDone ? "Replay" : "Play"}
          </button>

          {/* Next */}
          <button
            onClick={goNext}
            disabled={isDone || isAnimating}
            className="bg-neutral-700 text-white px-4 py-2 rounded-md font-semibold hover:bg-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          >
            Next →
          </button>

          {/* Reset */}
          <button
            onClick={reset}
            disabled={isAnimating}
            className="bg-neutral-700 text-white px-6 py-2 rounded-md font-semibold hover:bg-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          >
            Reset
          </button>
        </div>

        {/* Step description */}
        <div className="text-center mb-6">
          <span className="inline-block bg-neutral-900 text-amber-300 font-mono text-sm rounded-md px-4 py-2 max-w-2xl">
            {step.description}
          </span>
        </div>

        {/* Main board */}
        <div className="flex flex-col lg:flex-row gap-6 bg-black rounded-lg p-4 md:p-8 min-h-[400px]">
          {/* SVG Graph */}
          <div className="flex-1 flex items-center justify-center overflow-x-auto">
            <svg
              viewBox="0 0 680 410"
              className="w-full max-w-2xl"
              style={{ minWidth: 320 }}
            >
              {/* Edges */}
              {EDGES.map(({ from, to, weight }) => {
                const fp = NODE_POS[from];
                const tp = NODE_POS[to];
                const mx = (fp.x + tp.x) / 2;
                const my = (fp.y + tp.y) / 2;
                const col = edgeColor(from, to);
                const w = edgeWidth(from, to);
                return (
                  <g key={`${from}-${to}`}>
                    <line
                      x1={fp.x}
                      y1={fp.y}
                      x2={tp.x}
                      y2={tp.y}
                      stroke={col}
                      strokeWidth={w}
                      strokeLinecap="round"
                    />
                    {/* weight label badge */}
                    <rect
                      x={mx - 11}
                      y={my - 9}
                      width={22}
                      height={18}
                      rx={4}
                      fill="#111"
                      stroke={col}
                      strokeWidth={0.5}
                    />
                    <text
                      x={mx}
                      y={my + 0.5}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={col}
                      fontSize={11}
                      fontWeight={700}
                      fontFamily="ui-monospace, monospace"
                    >
                      {weight}
                    </text>
                  </g>
                );
              })}

              {/* Nodes */}
              {NODES.map((n) => {
                const { x, y } = NODE_POS[n];
                const d = step.dist[n];
                const isCur = step.currentNode === n;
                return (
                  <g key={n}>
                    {/* pulse ring for current node */}
                    {isCur && (
                      <circle
                        cx={x}
                        cy={y}
                        r={34}
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth={1.5}
                        opacity={0.4}
                        style={{ animation: "pulse 1s ease-in-out infinite" }}
                      />
                    )}
                    <circle
                      cx={x}
                      cy={y}
                      r={26}
                      fill={nodeFill(n)}
                      stroke={nodeStroke(n)}
                      strokeWidth={2}
                    />
                    {/* node label */}
                    <text
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={nodeTxt(n)}
                      fontSize={15}
                      fontWeight={700}
                      fontFamily="ui-monospace, monospace"
                    >
                      {n}
                    </text>
                    {/* distance below node */}
                    <text
                      x={x}
                      y={y + 40}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={distTxt(n)}
                      fontSize={12}
                      fontFamily="ui-monospace, monospace"
                    >
                      {fmt(d)}
                    </text>
                  </g>
                );
              })}

              {/* START label */}
              <text
                x={NODE_POS.A.x}
                y={NODE_POS.A.y - 38}
                textAnchor="middle"
                fill="#6b7280"
                fontSize={10}
                fontFamily="ui-monospace, monospace"
              >
                source
              </text>

              <style>{`@keyframes pulse{0%,100%{r:34;opacity:.4}50%{r:38;opacity:.15}}`}</style>
            </svg>
          </div>

          {/* Distance table */}
          <div className="lg:w-56 flex-shrink-0">
            <h3 className="text-neutral-400 font-mono text-xs uppercase tracking-widest mb-3 text-center">
              Distance table
            </h3>

            <table className="w-full text-sm font-mono border-collapse">
              <thead>
                <tr className="text-neutral-500 text-xs">
                  <th className="text-left pb-2 font-normal">Node</th>
                  <th className="text-center pb-2 font-normal">Dist</th>
                  <th className="text-center pb-2 font-normal">Via</th>
                  <th className="text-center pb-2 font-normal">✓</th>
                </tr>
              </thead>
              <tbody>
                {NODES.map((n) => {
                  const isCur = step.currentNode === n;
                  const isUpd = step.updatedNodes?.has(n);
                  const isVis = step.visited?.has(n);
                  const rowBg = isCur
                    ? "bg-amber-900/30"
                    : isUpd
                      ? "bg-sky-900/30"
                      : "";
                  const nameCl = isCur
                    ? "text-amber-400"
                    : isUpd
                      ? "text-sky-400"
                      : isVis
                        ? "text-emerald-400"
                        : "text-neutral-500";
                  const distCl = isCur
                    ? "text-amber-300"
                    : isUpd
                      ? "text-sky-300"
                      : "text-neutral-200";
                  return (
                    <tr
                      key={n}
                      className={`border-t border-neutral-800 ${rowBg}`}
                    >
                      <td className={`py-1.5 pl-2 font-bold ${nameCl}`}>{n}</td>
                      <td className={`py-1.5 text-center ${distCl}`}>
                        {fmt(step.dist[n])}
                      </td>
                      <td className="py-1.5 text-center text-neutral-500">
                        {step.prev[n] ?? "—"}
                      </td>
                      <td className="py-1.5 text-center text-emerald-500">
                        {isVis ? "✓" : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Legend */}
            <div className="mt-6 space-y-2 text-xs font-mono">
              {[
                { col: "bg-amber-400", label: "Current" },
                { col: "bg-sky-400", label: "Updated" },
                { col: "bg-emerald-500", label: "Visited" },
                { col: "bg-neutral-600", label: "Unvisited" },
              ].map(({ col, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${col} flex-shrink-0`}
                  />
                  <span className="text-neutral-400">{label}</span>
                </div>
              ))}
            </div>

            {/* Path summary on done */}
            {step.phase === "done" && (
              <div className="mt-6 text-xs font-mono text-neutral-400 space-y-1 border-t border-neutral-700 pt-4">
                <p className="text-emerald-400 font-semibold mb-2">
                  Shortest paths from A:
                </p>
                {NODES.filter((n) => n !== START).map((n) => {
                  const path = [];
                  let cur = n;
                  while (cur) {
                    path.unshift(cur);
                    cur = step.prev[cur];
                  }
                  return (
                    <p key={n}>
                      <span className="text-neutral-300">{path.join("→")}</span>
                      <span className="text-neutral-500">
                        {" "}
                        = {fmt(step.dist[n])}
                      </span>
                    </p>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-neutral-700 rounded-full h-2 mt-6 mb-4">
          <div
            className="bg-gradient-to-r from-white to-neutral-300 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(stepIdx / (totalSteps - 1)) * 100}%` }}
          />
        </div>

        <div className="text-center text-neutral-400 text-sm">
          <p>Time complexity: O((V + E) log V) with a priority queue</p>
          <p className="mt-1 opacity-60">
            Greedy — always selects the closest unvisited node next
          </p>
        </div>
      </div>

      {/* ── Description card ── */}
      <div className="bg-neutral-800 rounded-lg p-6 md:p-8 border border-neutral-700 w-full">
        <h2 className="text-2xl font-bold text-white mb-1">
          Dijkstra's Shortest Path
        </h2>
        <p className="text-neutral-400 mb-4">
          Find minimum-cost paths from a source node to all others in a weighted
          graph.
        </p>

        <div className="text-neutral-300 leading-relaxed">
          <p>
            Dijkstra's algorithm finds the shortest path from a source node to
            every other node in a graph with non-negative edge weights. It
            maintains a distance table and greedily processes the closest
            unvisited node at each step.
          </p>
          <ul className="list-disc list-inside mt-3 space-y-1 text-neutral-400">
            <li>Set source distance to 0; all others to ∞.</li>
            <li>
              Repeatedly pick the unvisited node with the smallest known
              distance.
            </li>
            <li>Relax (update) distances to its unvisited neighbors.</li>
            <li>Repeat until all reachable nodes are visited.</li>
          </ul>
        </div>

        <pre className="mt-6 bg-neutral-900 rounded-lg p-4 text-sm text-neutral-300 overflow-x-auto font-mono leading-relaxed">
          {`def dijkstra(graph, start):
    dist = {v: float('inf') for v in graph}
    dist[start] = 0
    visited = set()

    while len(visited) < len(graph):
        u = min(
            (v for v in graph if v not in visited),
            key=lambda v: dist[v]
        )
        if dist[u] == float('inf'):
            break
        visited.add(u)

        for neighbor, weight in graph[u]:
            new_dist = dist[u] + weight
            if new_dist < dist[neighbor]:
                dist[neighbor] = new_dist

    return dist`}
        </pre>
      </div>
    </div>
  );
}
