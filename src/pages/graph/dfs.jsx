import { useState, useRef, useCallback, useEffect } from "react";
import { ShadCNHeader as Header } from "../../components/Header/ShadCNNav";
import SpeedControls from "../../components/utils/SpeedControl";
import Description from "../../components/utils/Description";
import SEOData from "../../components/SEO";

// ─── Graph Definition (same layout as BFS for consistency) ────────────────────
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

// ─── DFS Step Generator (iterative, explicit stack) ────────────────────────────
// We track "tree edges" — the edge traversed to reach each node — so we can
// highlight the DFS tree separately from back/cross edges.
function computeDFSSteps(startNode) {
  const steps = [];
  const visited = new Set();
  const stack = [startNode];
  const treeEdges = new Set(); // "a-b" strings for directed tree edges
  const parent = {}; // parent[node] = node we came from

  // Initial state: start node pushed, not yet visited
  steps.push({
    current: null,
    stack: [startNode],
    visited: new Set(),
    treeEdges: new Set(),
    justPushed: startNode,
    done: false,
  });

  while (stack.length > 0) {
    const node = stack[stack.length - 1]; // peek

    if (!visited.has(node)) {
      visited.add(node);
      stack.pop(); // pop to process

      steps.push({
        current: node,
        stack: [...stack],
        visited: new Set(visited),
        treeEdges: new Set(treeEdges),
        justPushed: null,
        done: false,
      });

      // Push unvisited neighbours in REVERSE order so the first neighbour
      // sits on top of the stack (natural left-to-right DFS order)
      const neighbours = [...ADJACENCY[node]].reverse();
      for (const nb of neighbours) {
        if (!visited.has(nb)) {
          stack.push(nb);
          if (parent[nb] === undefined) {
            parent[nb] = node;
            treeEdges.add(`${node}-${nb}`);
            treeEdges.add(`${nb}-${node}`); // undirected
          }
          steps.push({
            current: node,
            stack: [...stack],
            visited: new Set(visited),
            treeEdges: new Set(treeEdges),
            justPushed: nb,
            done: false,
          });
        }
      }
    } else {
      // Already visited — pop and continue (handles duplicates on stack)
      stack.pop();
    }
  }

  steps.push({
    current: null,
    stack: [],
    visited: new Set(visited),
    treeEdges: new Set(treeEdges),
    justPushed: null,
    done: true,
  });

  return steps;
}

// ─── Colour logic ─────────────────────────────────────────────────────────────
function getNodeStyle(nodeId, step) {
  if (!step) return { fill: "#262626", stroke: "#525252", text: "#9ca3af" };

  if (step.current === nodeId)
    return { fill: "#ffffff", stroke: "#ffffff", text: "#000000" };
  if (step.justPushed === nodeId)
    return { fill: "#818cf8", stroke: "#a5b4fc", text: "#000000" };
  if (step.stack.includes(nodeId) && !step.visited.has(nodeId))
    return { fill: "#4f46e5", stroke: "#818cf8", text: "#ffffff" };
  if (step.visited.has(nodeId))
    return { fill: "#10b981", stroke: "#34d399", text: "#000000" };
  return { fill: "#262626", stroke: "#525252", text: "#9ca3af" };
}

function getEdgeStyle(a, b, step) {
  if (!step) return { stroke: "#404040", width: 2.5, opacity: 1 };

  const key1 = `${a}-${b}`;
  const key2 = `${b}-${a}`;
  if (step.treeEdges.has(key1) || step.treeEdges.has(key2))
    return { stroke: "#10b981", width: 3, opacity: 1 };

  const bothVisited = step.visited.has(a) && step.visited.has(b);
  if (bothVisited) return { stroke: "#374151", width: 2, opacity: 0.6 }; // back edge — dimmed

  return { stroke: "#404040", width: 2.5, opacity: 1 };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DFS() {
  const [startNode, setStartNode] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [isAnimating, setIsAnimating] = useState(false);
  const [steps, setSteps] = useState([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [selectingStart, setSelectingStart] = useState(false);

  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!isAnimating) {
      setSteps(computeDFSSteps(startNode));
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
    setSteps(computeDFSSteps(startNode));
    setCurrentStepIdx(0);
  }, [startNode, stopAnimation]);

  const startAnimation = useCallback(() => {
    if (isAnimating) return;
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
    if (isAnimating || !selectingStart) return;
    setStartNode(nodeId);
    setSelectingStart(false);
  };

  // ── Status label ──
  let statusText = "Click Start to begin DFS";
  if (currentStep?.done)
    statusText = "DFS Complete — all reachable nodes visited";
  else if (currentStep?.current !== null && currentStep?.current !== undefined)
    statusText = `Processing node ${currentStep.current} → pushing unvisited neighbours`;
  else if (
    currentStep?.justPushed !== null &&
    currentStep?.justPushed !== undefined
  )
    statusText = `Node ${currentStep.justPushed} pushed onto stack`;

  // ─── Description & SEO ───────────────────────────────────────────────────────
  const descriptionData = {
    heading: "Depth First Search",
    subheading:
      "A graph traversal algorithm that explores as far as possible along each branch before backtracking.",
    summary: `<p>
      DFS starts at a chosen source node and dives as deep as possible down
      one path before backtracking to explore other branches. It uses a
      <strong>stack</strong> (LIFO) — either the call stack via recursion, or
      an explicit one in the iterative version shown here.
    </p>
    <ul class="list-disc list-inside mt-2 space-y-1">
      <li>Push the start node onto the stack.</li>
      <li>Pop a node, mark it visited, then push all unvisited neighbours.</li>
      <li>Repeat until the stack is empty.</li>
    </ul>
    <p class="mt-2">
      <strong>Tree edges</strong> (green) form the DFS spanning tree.
      <strong>Back edges</strong> (dimmed) connect a node to an already-visited
      ancestor, and reveal cycles in the graph.
    </p>
    <p class="mt-2">
      <strong>Time complexity:</strong> O(V + E) &nbsp;|&nbsp;
      <strong>Space complexity:</strong> O(V) for the visited set and stack.
    </p>
    <p class="mt-2">
      DFS underpins topological sort, cycle detection, strongly connected
      components (Tarjan / Kosaraju), and maze generation.
    </p>`,
    lang: "python",
    code: `# ── Recursive DFS ────────────────────────────────────────
def dfs_recursive(graph, node, visited=None):
    if visited is None:
        visited = set()
    visited.add(node)
    print(node, end=" ")
    for neighbour in graph[node]:
        if neighbour not in visited:
            dfs_recursive(graph, neighbour, visited)
    return visited

# ── Iterative DFS (explicit stack) ───────────────────────
from collections import deque

def dfs_iterative(graph, start):
    visited = set()
    stack   = [start]
    order   = []

    while stack:
        node = stack.pop()        # LIFO — deepest first
        if node in visited:
            continue
        visited.add(node)
        order.append(node)
        # push in reverse so first neighbour is processed first
        for neighbour in reversed(graph[node]):
            if neighbour not in visited:
                stack.append(neighbour)

    return order

# Example usage
graph = {
    0: [1, 2], 1: [0, 3, 4], 2: [0, 5, 6],
    3: [1, 7],  4: [1, 5, 7], 5: [2, 4, 8],
    6: [2, 8],  7: [3, 4],    8: [5, 6],
}
print(dfs_iterative(graph, 0))  # [0, 1, 3, 7, 4, 5, 2, 6, 8]`,
  };

  const seoData = {
    title: "Depth First Search (DFS) — Graph Traversal Visualization",
    description:
      "Visualize Depth First Search on an interactive graph. Watch the explicit stack drive DFS as it dives deep and backtracks, building the DFS spanning tree step by step.",
    canonical: "https://dsa-experiments.vercel.app/graphs/dfs",
    openGraph: {
      title: "Depth First Search (DFS) — Graph Traversal Visualization",
      description:
        "Visualize Depth First Search on an interactive graph. Watch the explicit stack drive DFS as it dives deep and backtracks, building the DFS spanning tree step by step.",
      url: "https://dsa-experiments.vercel.app/graphs/dfs",
      image: "/images/defaults/preview.png",
    },
    schema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Depth First Search (DFS) — Graph Traversal Visualization",
      url: "https://dsa-experiments.vercel.app/graphs/dfs",
      description:
        "Interactive visualization of the DFS graph traversal algorithm with step-by-step stack animation.",
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
            name: "DFS",
            item: "https://dsa-experiments.vercel.app/graphs/dfs",
          },
        ],
      },
    },
  };

  const legend = [
    { color: "#262626", border: "#525252", label: "Unvisited" },
    { color: "#4f46e5", border: "#818cf8", label: "On Stack" },
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
              Depth First Search
            </h1>
            <p className="text-neutral-300 text-lg">
              Step: {currentStepIdx} / {totalSteps}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
            <button
              onClick={() => {
                if (!isAnimating) setSelectingStart((v) => !v);
              }}
              disabled={isAnimating}
              className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 border ${
                selectingStart
                  ? "bg-indigo-500 text-white border-indigo-400"
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
                  const sty = getEdgeStyle(a, b, currentStep);
                  return (
                    <line
                      key={`${a}-${b}`}
                      x1={na.x}
                      y1={na.y}
                      x2={nb.x}
                      y2={nb.y}
                      stroke={sty.stroke}
                      strokeWidth={sty.width}
                      strokeOpacity={sty.opacity}
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
                      {node.id === startNode && (
                        <text
                          x={node.x}
                          y={node.y - 36}
                          textAnchor="middle"
                          fill="#818cf8"
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

            {/* Sidebar */}
            <div className="flex flex-col gap-4 w-full lg:w-52 shrink-0">
              {/* Stack — rendered top-of-stack first */}
              <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-700">
                <p className="text-neutral-400 text-xs font-semibold uppercase tracking-widest mb-3">
                  Stack (top → bottom)
                </p>
                <div className="flex flex-col gap-1.5 min-h-[60px]">
                  {currentStep?.stack?.length > 0 ? (
                    [...currentStep.stack].reverse().map((nodeId, i) => (
                      <div
                        key={`${nodeId}-${i}`}
                        className="flex items-center gap-2"
                      >
                        <span className="text-neutral-500 text-xs w-4 text-right">
                          {i === 0 ? "↑" : ""}
                        </span>
                        <div className="bg-indigo-700 text-white rounded px-3 py-0.5 text-sm font-bold font-mono w-full text-center">
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
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="w-4 h-0.5 shrink-0 opacity-60"
                      style={{ backgroundColor: "#374151" }}
                    />
                    <span className="text-neutral-300 text-xs">Back edge</span>
                  </div>
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
              Time: O(V + E) &nbsp;·&nbsp; Space: O(V) &nbsp;·&nbsp; Uses a LIFO
              stack
            </p>
          </div>
        </div>

        <Description dataObj={descriptionData} />
      </div>
    </>
  );
}
