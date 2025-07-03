import { memo, useState, useEffect, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ShadCNHeader as Header } from "../../components/Header/ShadCNNav";
import SpeedControls from "../../components/utils/SpeedControl";
import Description from "../../components/utils/Description";
import SEOData from "../../components/SEO";

const TreeNode = ({
  node,
  x,
  y,
  isVisited,
  isCurrentlyVisiting,
  isInQueue,
  children,
}) => {
  const radius = 25;

  return (
    <g>
      {/* Connections to children */}
      {children &&
        children.map((child, index) => (
          <line
            key={`line-${node.id}-${child.id}`}
            x1={x}
            y1={y}
            x2={child.x}
            y2={child.y}
            stroke="#6B7280"
            strokeWidth="2"
            opacity={isVisited || isCurrentlyVisiting ? 1 : 0.3}
          />
        ))}

      {/* Node circle */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={
          isCurrentlyVisiting
            ? "#FDE047" // Yellow for current
            : isInQueue
              ? "#3B82F6" // Blue for in queue
              : isVisited
                ? "#10B981" // Green for visited
                : "#374151" // Gray for unvisited
        }
        stroke={
          isCurrentlyVisiting
            ? "#F59E0B"
            : isInQueue
              ? "#1D4ED8"
              : isVisited
                ? "#059669"
                : "#6B7280"
        }
        strokeWidth="3"
        className="transition-all duration-300"
      />

      {/* Node value */}
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={isCurrentlyVisiting ? "#000" : "#FFF"}
        fontSize="16"
        fontWeight="bold"
        className="pointer-events-none transition-all duration-300"
      >
        {node.value}
      </text>
    </g>
  );
};

const QueueVisualization = ({ queue, currentIndex = -1 }) => (
  <div className="flex flex-col items-center mb-6">
    <h3 className="text-white text-lg font-semibold mb-3">Queue (FIFO)</h3>
    <div className="flex items-center gap-2">
      <span className="text-neutral-400 text-sm">Front →</span>
      <div className="flex gap-1">
        {queue.length === 0 ? (
          <div className="w-12 h-12 border-2 border-dashed border-neutral-600 rounded-lg flex items-center justify-center text-neutral-500">
            Empty
          </div>
        ) : (
          queue.map((node, index) => (
            <div
              key={`queue-${node.id}-${index}`}
              className={`
                w-12 h-12 border-2 rounded-lg flex items-center justify-center font-bold text-white
                transition-all duration-300
                ${index === 0 ? "bg-yellow-500 border-yellow-400 scale-110" : "bg-blue-600 border-blue-500"}
              `}
            >
              {node.value}
            </div>
          ))
        )}
      </div>
      <span className="text-neutral-400 text-sm">← Rear</span>
    </div>
  </div>
);

const TraversalResult = ({ result, currentIndex = -1 }) => (
  <div className="flex flex-col items-center mb-6">
    <h3 className="text-white text-lg font-semibold mb-3">Traversal Result</h3>
    <div className="flex gap-2 items-center">
      {result.map((value, index) => (
        <div key={`result-${index}`} className="flex items-center">
          <div
            className={`
              w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white
              transition-all duration-300
              ${index <= currentIndex ? "bg-green-600 border-green-500" : "bg-neutral-700 border-neutral-600"}
              border-2
            `}
          >
            {value}
          </div>
          {index < result.length - 1 && (
            <span className="text-neutral-400 mx-2">→</span>
          )}
        </div>
      ))}
    </div>
  </div>
);

const LevelOrderTraversal = memo(function LevelOrderTraversal() {
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [isAnimating, setIsAnimating] = useState(false);
  const [treeType, setTreeType] = useState("balanced");

  // Animation state
  const [nodes, setNodes] = useState([]);
  const [queue, setQueue] = useState([]);
  const [visitedNodes, setVisitedNodes] = useState(new Set());
  const [currentlyVisiting, setCurrentlyVisiting] = useState(null);
  const [traversalResult, setTraversalResult] = useState([]);
  const [steps, setSteps] = useState([]);
  const [currentAction, setCurrentAction] = useState("");

  const timeoutRef = useRef(null);

  // Tree structures
  const treeStructures = {
    balanced: {
      nodes: [
        { id: 1, value: "A", x: 400, y: 80, left: 2, right: 3 },
        { id: 2, value: "B", x: 250, y: 160, left: 4, right: 5 },
        { id: 3, value: "C", x: 550, y: 160, left: 6, right: 7 },
        { id: 4, value: "D", x: 150, y: 240, left: null, right: null },
        { id: 5, value: "E", x: 350, y: 240, left: 8, right: 9 },
        { id: 6, value: "F", x: 450, y: 240, left: null, right: null },
        { id: 7, value: "G", x: 650, y: 240, left: null, right: null },
        { id: 8, value: "H", x: 300, y: 320, left: null, right: null },
        { id: 9, value: "I", x: 400, y: 320, left: null, right: null },
      ],
    },
    skewed: {
      nodes: [
        { id: 1, value: "A", x: 400, y: 80, left: 2, right: null },
        { id: 2, value: "B", x: 300, y: 160, left: 3, right: null },
        { id: 3, value: "C", x: 200, y: 240, left: 4, right: null },
        { id: 4, value: "D", x: 100, y: 320, left: null, right: null },
      ],
    },
    complete: {
      nodes: [
        { id: 1, value: "1", x: 400, y: 80, left: 2, right: 3 },
        { id: 2, value: "2", x: 250, y: 160, left: 4, right: 5 },
        { id: 3, value: "3", x: 550, y: 160, left: 6, right: 7 },
        { id: 4, value: "4", x: 150, y: 240, left: 8, right: 9 },
        { id: 5, value: "5", x: 350, y: 240, left: 10, right: 11 },
        { id: 6, value: "6", x: 450, y: 240, left: 12, right: null },
        { id: 7, value: "7", x: 650, y: 240, left: null, right: null },
        { id: 8, value: "8", x: 100, y: 320, left: null, right: null },
        { id: 9, value: "9", x: 200, y: 320, left: null, right: null },
        { id: 10, value: "10", x: 300, y: 320, left: null, right: null },
        { id: 11, value: "11", x: 400, y: 320, left: null, right: null },
        { id: 12, value: "12", x: 500, y: 320, left: null, right: null },
      ],
    },
  };

  const generateTraversalSteps = (treeNodes) => {
    const steps = [];
    const queue = [];
    const visited = new Set();
    const result = [];

    if (treeNodes.length === 0) return steps;

    // Find root node (assuming it's the first one)
    const root = treeNodes[0];
    queue.push(root);

    steps.push({
      action: `Initialize: Add root node '${root.value}' to queue`,
      queue: [...queue],
      visited: new Set(),
      currentlyVisiting: null,
      result: [],
    });

    while (queue.length > 0) {
      const currentNode = queue.shift();
      visited.add(currentNode.id);
      result.push(currentNode.value);

      steps.push({
        action: `Visit node '${currentNode.value}' (dequeue from front)`,
        queue: [...queue],
        visited: new Set(visited),
        currentlyVisiting: currentNode.id,
        result: [...result],
      });

      // Add children to queue
      const children = [];
      if (currentNode.left) {
        const leftChild = treeNodes.find((n) => n.id === currentNode.left);
        if (leftChild) {
          queue.push(leftChild);
          children.push(`'${leftChild.value}'`);
        }
      }
      if (currentNode.right) {
        const rightChild = treeNodes.find((n) => n.id === currentNode.right);
        if (rightChild) {
          queue.push(rightChild);
          children.push(`'${rightChild.value}'`);
        }
      }

      if (children.length > 0) {
        steps.push({
          action: `Add children ${children.join(", ")} to queue`,
          queue: [...queue],
          visited: new Set(visited),
          currentlyVisiting: null,
          result: [...result],
        });
      }
    }

    steps.push({
      action: `Traversal complete! Result: ${result.join(" → ")}`,
      queue: [],
      visited: new Set(visited),
      currentlyVisiting: null,
      result: [...result],
    });

    return steps;
  };

  const resetAnimation = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setCurrentStep(0);
    setQueue([]);
    setVisitedNodes(new Set());
    setCurrentlyVisiting(null);
    setTraversalResult([]);
    setCurrentAction("");
    setIsAnimating(false);
  };

  const startAnimation = () => {
    if (isAnimating) return;

    resetAnimation();
    const treeNodes = treeStructures[treeType].nodes;
    const animationSteps = generateTraversalSteps(treeNodes);

    setSteps(animationSteps);
    setTotalSteps(animationSteps.length);
    setIsAnimating(true);

    const animate = (stepIndex) => {
      if (stepIndex >= animationSteps.length) {
        setIsAnimating(false);
        return;
      }

      const step = animationSteps[stepIndex];
      setCurrentStep(stepIndex + 1);
      setQueue(step.queue);
      setVisitedNodes(step.visited);
      setCurrentlyVisiting(step.currentlyVisiting);
      setTraversalResult(step.result);
      setCurrentAction(step.action);

      timeoutRef.current = setTimeout(() => {
        animate(stepIndex + 1);
      }, animationSpeed);
    };

    animate(0);
  };

  const stepForward = () => {
    if (currentStep < totalSteps && !isAnimating) {
      const step = steps[currentStep];
      setCurrentStep(currentStep + 1);
      setQueue(step.queue);
      setVisitedNodes(step.visited);
      setCurrentlyVisiting(step.currentlyVisiting);
      setTraversalResult(step.result);
      setCurrentAction(step.action);
    }
  };

  const stepBackward = () => {
    if (currentStep > 0 && !isAnimating) {
      const step = steps[currentStep - 2] || {
        queue: [],
        visited: new Set(),
        currentlyVisiting: null,
        result: [],
        action: "",
      };
      setCurrentStep(currentStep - 1);
      setQueue(step.queue);
      setVisitedNodes(step.visited);
      setCurrentlyVisiting(step.currentlyVisiting);
      setTraversalResult(step.result);
      setCurrentAction(step.action);
    }
  };

  useEffect(() => {
    const treeNodes = treeStructures[treeType].nodes;
    setNodes(treeNodes);
    resetAnimation();
  }, [treeType]);

  const getNodeChildren = (node) => {
    const children = [];
    if (node.left) {
      const leftChild = nodes.find((n) => n.id === node.left);
      if (leftChild) children.push(leftChild);
    }
    if (node.right) {
      const rightChild = nodes.find((n) => n.id === node.right);
      if (rightChild) children.push(rightChild);
    }
    return children;
  };

  const descriptionData = {
    heading: "Level Order Traversal (BFS)",
    subheading: "Breadth-First Search traversal of binary trees using queue",
    summary: `<p>Level Order Traversal visits nodes level by level from left to right, using a queue (FIFO) data structure.</p>
              <p><strong>Algorithm:</strong> Start with root in queue, then repeatedly dequeue a node, visit it, and enqueue its children.</p>
              <p><strong>Applications:</strong> Tree printing, finding tree width, serialization, and shortest path in unweighted graphs.</p>`,
    lang: "python",
    code: `from collections import deque

def level_order_traversal(root):
    if not root:
        return []

    queue = deque([root])
    result = []

    while queue:
        # Dequeue node from front
        current = queue.popleft()

        # Visit current node
        result.append(current.val)

        # Enqueue children (left first, then right)
        if current.left:
            queue.append(current.left)
        if current.right:
            queue.append(current.right)

    return result

# Alternative: Level by level separation
def level_order_by_levels(root):
    if not root:
        return []

    queue = deque([root])
    levels = []

    while queue:
        level_size = len(queue)
        current_level = []

        for _ in range(level_size):
            node = queue.popleft()
            current_level.append(node.val)

            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)

        levels.append(current_level)

    return levels`,
  };

  const seoData = {
    title: "Level Order Traversal (BFS) - Binary Tree Visualization",
  };

  return (
    <>
      <SEOData data={seoData} />
      <div className="min-h-screen max-w-7xl mx-auto w-full flex flex-col items-center justify-start gap-20 py-32 px-4 bg-neutral-900">
        <Header />

        <div className="bg-neutral-800 rounded-lg p-8 border border-neutral-800 w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 tracking-wide">
              Level Order Traversal (BFS)
            </h1>
            <p className="text-neutral-300 text-lg">
              Step: {currentStep} / {totalSteps} | Tree:{" "}
              {treeType.charAt(0).toUpperCase() + treeType.slice(1)}
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <label className="text-white text-sm">Tree Type:</label>
              <Select
                value={treeType}
                onValueChange={setTreeType}
                disabled={isAnimating}
              >
                <SelectTrigger className="w-32 bg-neutral-700 border-neutral-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="skewed">Skewed</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <SpeedControls
              animationSpeed={animationSpeed}
              setAnimationSpeed={setAnimationSpeed}
              isAnimating={isAnimating}
            />

            <button
              onClick={startAnimation}
              disabled={isAnimating}
              className="bg-white text-black px-6 py-2 rounded-md font-semibold hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              {isAnimating ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isAnimating ? "Running..." : "Start BFS"}
            </button>

            <button
              onClick={resetAnimation}
              disabled={isAnimating}
              className="bg-neutral-700 text-white px-6 py-2 rounded-md font-semibold hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>

            <button
              onClick={stepBackward}
              disabled={isAnimating || currentStep === 0}
              className="bg-neutral-700 text-white px-3 py-2 rounded-md font-semibold hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={stepForward}
              disabled={isAnimating || currentStep === totalSteps}
              className="bg-neutral-700 text-white px-3 py-2 rounded-md font-semibold hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-black p-8 rounded-lg min-h-[600px]">
            {/* Queue and Result visualization */}
            <div className="flex justify-center gap-8 mb-8">
              <QueueVisualization queue={queue} />
              <TraversalResult
                result={traversalResult}
                currentIndex={traversalResult.length - 1}
              />
            </div>

            {/* Tree visualization */}
            <div className="flex justify-center mb-6">
              <svg width="800" height="400" viewBox="0 0 800 400">
                {nodes.map((node) => (
                  <TreeNode
                    key={node.id}
                    node={node}
                    x={node.x}
                    y={node.y}
                    isVisited={visitedNodes.has(node.id)}
                    isCurrentlyVisiting={currentlyVisiting === node.id}
                    isInQueue={queue.some((q) => q.id === node.id)}
                    children={getNodeChildren(node)}
                  />
                ))}
              </svg>
            </div>

            {/* Current action */}
            {currentAction && (
              <div className="text-center">
                <div className="bg-neutral-700 text-white px-6 py-3 rounded-lg inline-block font-semibold max-w-2xl">
                  {currentAction}
                </div>
              </div>
            )}
          </div>

          <div className="w-full bg-neutral-700 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-white to-neutral-300 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0}%`,
              }}
            />
          </div>

          <div className="text-center text-neutral-300 text-sm">
            <p>
              <strong>Time Complexity:</strong> O(n) where n is the number of
              nodes | <strong>Space Complexity:</strong> O(w) where w is maximum
              width
            </p>
            <p className="mt-1 opacity-70 flex items-center justify-center gap-2">
              <p className="size-3 rounded-full bg-[#FDE047]" /> Currently
              visiting,
              <p className="size-3 rounded-full bg-[#3B82F6]" /> In queue,
              <p className="size-3 rounded-full bg-[#10B981]" /> Visited,
              <p className="size-3 rounded-full bg-[#374151]" /> Unvisited,
            </p>
          </div>
        </div>

        <Description dataObj={descriptionData} />
      </div>
    </>
  );
});

export default LevelOrderTraversal;
