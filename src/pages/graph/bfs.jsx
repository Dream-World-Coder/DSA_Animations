import { useState, useEffect, useRef, useCallback } from "react";
import { ShadCNHeader as Header } from "../../components/Header/ShadCNNav";
import SpeedControls from "../../components/utils/SpeedControl";
import Description from "../../components/utils/Description";
import SEOData from "../../components/SEO";

// ─── Graph Definition ──────────────────────────────────────────────────────────
// Positions are percentages of the SVG viewport (800 × 480)
const GRAPH_NODES = [
  { id: 0, x: 400, y: 60 },
  { id: 1, x: 200, y: 170 },
  { id: 2, x: 600, y: 170 },
  { id: 3, x: 90, y: 300 },
  { id: 4, x: 310, y: 300 },
  { id: 5, x: 490, y: 300 },
  { id: 6, x: 710, y: 300 },
  { id: 7, x: 190, y: 420 },
  { id: 8, x: 610, y: 420 },
];

// Undirected adjacency list
const ADJACENCY = {
  0: [1, 2],
  1: [0, 3, 4],
  2: [0, 5, 6],
  3: [1, 7],
  4: [1, 5, 7],
  5: [2, 4, 8],
  6: [2, 8],
  7: [3, 4],
  8: [5, 6],
};

const EDGES = [
  [0, 1],
  [0, 2],
  [1, 3],
  [1, 4],
  [2, 5],
  [2, 6],
  [3, 7],
  [4, 7],
  [4, 5],
  [5, 8],
  [6, 8],
];

// ─── BFS Step Generator ────────────────────────────────────────────────────────
function computeBFSSteps(startNode) {
  const steps = [];
  const visited = new Set();
  const queue = [startNode];
  visited.add(startNode);

  // Initial state
  steps.push({
    current: null,
    queue: [startNode],
    visited: new Set(visited),
    justVisited: null,
  });

  while (queue.length > 0) {
    const node = queue.shift();

    steps.push({
      current: node,
      queue: [...queue],
      visited: new Set(visited),
      justVisited: node,
    });

    for (const neighbor of ADJACENCY[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);

        steps.push({
          current: node,
          queue: [...queue],
          visited: new Set(visited),
          justVisited: null,
          enqueued: neighbor,
        });
      }
    }
  }

  // Final state
  steps.push({
    current: null,
    queue: [],
    visited: new Set(visited),
    justVisited: null,
    done: true,
  });

  return steps;
}

// ─── Node colour logic ─────────────────────────────────────────────────────────
function getNodeStyle(nodeId, step) {
  if (!step) return { fill: "#404040", stroke: "#6b7280", text: "#9ca3af" };

  if (step.current === nodeId) {
    return { fill: "#ffffff", stroke: "#ffffff", text: "#000000" };
  }
  if (step.enqueued === nodeId) {
    return { fill: "#f59e0b", stroke: "#fbbf24", text: "#000000" };
  }
  if (step.queue.includes(nodeId) && step.visited.has(nodeId)) {
    return { fill: "#d97706", stroke: "#f59e0b", text: "#000000" };
  }
  if (step.visited.has(nodeId)) {
    return { fill: "#10b981", stroke: "#34d399", text: "#000000" };
  }
  return { fill: "#262626", stroke: "#525252", text: "#9ca3af" };
}

function getEdgeStyle(a, b, step) {
  if (!step) return "#404040";
  const bothVisited = step.visited.has(a) && step.visited.has(b);
  return bothVisited ? "#10b981" : "#404040";
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function BFS() {
  const [startNode, setStartNode] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [isAnimating, setIsAnimating] = useState(false);
  const [steps, setSteps] = useState([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [selectingStart, setSelectingStart] = useState(false);

  const timeoutRef = useRef(null);

  // Pre-build steps whenever startNode changes (and not animating)
  useEffect(() => {
    if (!isAnimating) {
      const s = computeBFSSteps(startNode);
      setSteps(s);
      setCurrentStepIdx(0);
    }
  }, [startNode, isAnimating]);

  const currentStep = steps[currentStepIdx] ?? null;
  const totalSteps = steps.length > 0 ? steps.length - 1 : 1;

  const stopAnimation = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsAnimating(false);
  }, []);

  const reset = useCallback(() => {
    stopAnimation();
    const s = computeBFSSteps(startNode);
    setSteps(s);
    setCurrentStepIdx(0);
  }, [startNode, stopAnimation]);

  const startAnimation = useCallback(() => {
    if (isAnimating) return;

    // If already done, restart
    let idx = currentStepIdx;
    if (steps[idx]?.done) idx = 0;

    setIsAnimating(true);

    const animate = (i) => {
      if (i >= steps.length) {
        setIsAnimating(false);
        return;
      }
      setCurrentStepIdx(i);
      timeoutRef.current = setTimeout(() => animate(i + 1), animationSpeed);
    };

    animate(idx);
  }, [isAnimating, currentStepIdx, steps, animationSpeed]);

  const handleNodeClick = (nodeId) => {
    if (isAnimating) return;
    if (selectingStart) {
      setStartNode(nodeId);
      setSelectingStart(false);
    }
  };

  // ── status label ──
  let statusText = "Click Start to begin BFS";
  if (currentStep?.done)
    statusText = "BFS Complete — all reachable nodes visited";
  else if (currentStep?.current !== null && currentStep?.current !== undefined)
    statusText = `Processing node ${currentStep.current} → exploring neighbours`;
  else if (isAnimating) statusText = "Initialising…";

  // ── Description & SEO data ──
  const descriptionData = {
    heading: "Breadth First Search",
    subheading:
      "A graph traversal algorithm that explores all neighbours at the present depth before moving deeper.",
    summary: `<p>
      BFS starts at a chosen source node and explores the graph layer by layer.
      It uses a <strong>queue</strong> (FIFO) to track which node to visit next,
      guaranteeing that nodes are visited in non-decreasing order of their
      distance (edge count) from the source.
    </p>
    <ul class="list-disc list-inside mt-2 space-y-1">
      <li>Enqueue the start node and mark it visited.</li>
      <li>Dequeue a node, process it, then enqueue all unvisited neighbours.</li>
      <li>Repeat until the queue is empty.</li>
    </ul>
    <p class="mt-2">
      <strong>Time complexity:</strong> O(V + E) &nbsp;|&nbsp;
      <strong>Space complexity:</strong> O(V) for the visited set and queue.
    </p>
    <p class="mt-2">
      BFS is the foundation of shortest-path algorithms on unweighted graphs
      (e.g. 0-1 BFS, Dijkstra's special case) and level-order tree traversal.
    </p>`,
    lang: "python",
    code: `from collections import deque

def bfs(graph, start):
    visited = set([start])
    queue   = deque([start])
    order   = []

    while queue:
        node = queue.popleft()   # O(1) dequeue
        order.append(node)

        for neighbour in graph[node]:
            if neighbour not in visited:
                visited.add(neighbour)
                queue.append(neighbour)

    return order   # nodes in BFS visit order


# Example usage
graph = {
    0: [1, 2],
    1: [0, 3, 4],
    2: [0, 5, 6],
    3: [1, 7],
    4: [1, 5, 7],
    5: [2, 4, 8],
    6: [2, 8],
    7: [3, 4],
    8: [5, 6],
}

print(bfs(graph, 0))  # [0, 1, 2, 3, 4, 5, 6, 7, 8]`,
  };

  const seoData = {
    title: "Breadth First Search (BFS) — Graph Traversal Visualization",
    description:
      "Visualize Breadth First Search on an interactive graph. Watch the queue grow and shrink as BFS explores nodes level by level.",
    canonical: "https://dsa-experiments.vercel.app/graphs/bfs",
    openGraph: {
      title: "Breadth First Search (BFS) — Graph Traversal Visualization",
      description:
        "Visualize Breadth First Search on an interactive graph. Watch the queue grow and shrink as BFS explores nodes level by level.",
      url: "https://dsa-experiments.vercel.app/graphs/bfs",
      image: "/images/defaults/preview.png",
    },
    schema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Breadth First Search (BFS) — Graph Traversal Visualization",
      url: "https://dsa-experiments.vercel.app/graphs/bfs",
      description:
        "Interactive visualization of the BFS graph traversal algorithm with step-by-step queue animation.",
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
            name: "BFS",
            item: "https://dsa-experiments.vercel.app/graphs/bfs",
          },
        ],
      },
    },
  };

  // ── Legend entries ──
  const legend = [
    { color: "#262626", border: "#525252", label: "Unvisited" },
    { color: "#d97706", border: "#f59e0b", label: "In Queue" },
    { color: "#ffffff", border: "#ffffff", label: "Current" },
    { color: "#10b981", border: "#34d399", label: "Visited" },
  ];

  return (
    <>
      <SEOData data={seoData} />

      <div className="min-h-screen max-w-7xl mx-auto w-full flex flex-col items-center justify-start gap-20 py-20 md:py-32 px-0 bg-neutral-900">
        <Header />

        {/* ── Animation Panel ── */}
        <div className="bg-neutral-800 rounded-lg p-4 md:p-8 border border-neutral-700 w-full">
          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-wide">
              Breadth First Search
            </h1>
            <p className="text-neutral-300 text-lg">
              Step: {currentStepIdx} / {totalSteps}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
            {/* Start node picker */}
            <button
              onClick={() => {
                if (!isAnimating) setSelectingStart((v) => !v);
              }}
              disabled={isAnimating}
              className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 border ${
                selectingStart
                  ? "bg-amber-500 text-black border-amber-400"
                  : "bg-neutral-700 text-white border-neutral-600 hover:bg-neutral-600"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {selectingStart ? "Click a node…" : `Start Node: ${startNode}`}
            </button>

            <SpeedControls
              animationSpeed={animationSpeed}
              setAnimationSpeed={setAnimationSpeed}
              isAnimating={isAnimating}
            />

            <button
              onClick={startAnimation}
              disabled={isAnimating}
              className="bg-white text-black px-6 py-2 rounded-md font-semibold hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {isAnimating
                ? "Running…"
                : currentStep?.done
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
          </div>

          {/* Graph Board */}
          <div className="flex flex-col lg:flex-row justify-center items-start gap-6 mb-8 bg-black p-5 md:p-8 rounded-lg min-h-[420px]">
            {/* SVG Graph */}
            <div className="flex-1 w-full">
              <svg
                viewBox="0 0 800 480"
                className="w-full h-auto"
                style={{ maxHeight: 480 }}
              >
                {/* Edges */}
                {EDGES.map(([a, b]) => {
                  const na = GRAPH_NODES[a];
                  const nb = GRAPH_NODES[b];
                  const color = getEdgeStyle(a, b, currentStep);
                  return (
                    <line
                      key={`${a}-${b}`}
                      x1={na.x}
                      y1={na.y}
                      x2={nb.x}
                      y2={nb.y}
                      stroke={color}
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      className="transition-all duration-300"
                    />
                  );
                })}

                {/* Nodes */}
                {GRAPH_NODES.map((node) => {
                  const style = getNodeStyle(node.id, currentStep);
                  const isClickable = selectingStart && !isAnimating;
                  return (
                    <g
                      key={node.id}
                      onClick={() => handleNodeClick(node.id)}
                      className={isClickable ? "cursor-pointer" : ""}
                    >
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={26}
                        fill={style.fill}
                        stroke={style.stroke}
                        strokeWidth={isClickable ? 3 : 2}
                        className="transition-all duration-300"
                      />
                      <text
                        x={node.x}
                        y={node.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={style.text}
                        fontSize={15}
                        fontWeight="700"
                        fontFamily="monospace"
                        className="select-none transition-all duration-300"
                      >
                        {node.id}
                      </text>
                      {/* Start-node marker */}
                      {node.id === startNode && (
                        <text
                          x={node.x}
                          y={node.y - 36}
                          textAnchor="middle"
                          fill="#f59e0b"
                          fontSize={10}
                          fontFamily="monospace"
                          fontWeight="600"
                          className="select-none"
                        >
                          START
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Sidebar: Queue + Status */}
            <div className="flex flex-col gap-4 w-full lg:w-52 shrink-0">
              {/* Queue visualisation */}
              <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-700">
                <p className="text-neutral-400 text-xs font-semibold uppercase tracking-widest mb-3">
                  Queue (front → back)
                </p>
                <div className="flex flex-col gap-1.5 min-h-[60px]">
                  {currentStep?.queue?.length > 0 ? (
                    currentStep.queue.map((nodeId, i) => (
                      <div
                        key={`${nodeId}-${i}`}
                        className="flex items-center gap-2"
                      >
                        <span className="text-neutral-500 text-xs w-4 text-right">
                          {i === 0 ? "↑" : ""}
                        </span>
                        <div className="bg-amber-600 text-black rounded px-3 py-0.5 text-sm font-bold font-mono w-full text-center">
                          {nodeId}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-neutral-600 text-sm italic text-center mt-2">
                      empty
                    </p>
                  )}
                </div>
              </div>

              {/* Visited set */}
              <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-700">
                <p className="text-neutral-400 text-xs font-semibold uppercase tracking-widest mb-3">
                  Visited
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {currentStep?.visited?.size > 0 ? (
                    [...currentStep.visited]
                      .sort((a, b) => a - b)
                      .map((nodeId) => (
                        <span
                          key={nodeId}
                          className="bg-emerald-700 text-white rounded px-2 py-0.5 text-xs font-bold font-mono"
                        >
                          {nodeId}
                        </span>
                      ))
                  ) : (
                    <p className="text-neutral-600 text-sm italic">none yet</p>
                  )}
                </div>
              </div>

              {/* Legend */}
              <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-700">
                <p className="text-neutral-400 text-xs font-semibold uppercase tracking-widest mb-3">
                  Legend
                </p>
                <div className="flex flex-col gap-2">
                  {legend.map((l) => (
                    <div key={l.label} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full shrink-0 border"
                        style={{
                          backgroundColor: l.color,
                          borderColor: l.border,
                        }}
                      />
                      <span className="text-neutral-300 text-xs">
                        {l.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-neutral-700 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-white to-neutral-300 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStepIdx / totalSteps) * 100}%` }}
            />
          </div>

          {/* Status */}
          <div className="text-center text-neutral-300 text-sm">
            <p>{statusText}</p>
            <p className="mt-1 opacity-60">
              Time: O(V + E) &nbsp;·&nbsp; Space: O(V) &nbsp;·&nbsp; Uses a FIFO
              queue
            </p>
          </div>
        </div>

        <Description dataObj={descriptionData} />
      </div>
    </>
  );
}
