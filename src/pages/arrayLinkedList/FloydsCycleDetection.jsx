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

const ListNode = ({
  node,
  x,
  y,
  isSlowPointer,
  isFastPointer,
  isInLoop,
  isHighlighted,
}) => {
  const radius = 25;

  return (
    <g>
      {/* Node circle */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={
          isHighlighted
            ? "#FDE047" // Yellow -> highlighted
            : isInLoop
              ? "#EF4444" // Red -> loop nodes
              : "#374151" // Gray -> normal nodes
        }
        stroke={
          isSlowPointer && isFastPointer
            ? "#8B5CF6" // Purple -> when both pointers are on same node
            : isSlowPointer
              ? "#10B981" // Green -> slow pointer
              : isFastPointer
                ? "#3B82F6" // Blue -> fast pointer
                : isInLoop
                  ? "#DC2626"
                  : "#6B7280"
        }
        strokeWidth="4"
        className="transition-all duration-300"
      />

      {/* Node value */}
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#FFF"
        fontSize="14"
        fontWeight="bold"
        className="pointer-events-none"
      >
        {node.value}
      </text>

      {/* Pointer labels */}
      {isSlowPointer && (
        <text
          x={x}
          y={y - 40}
          textAnchor="middle"
          fill="#10B981"
          fontSize="12"
          fontWeight="bold"
          className="pointer-events-none"
        >
          Slow
        </text>
      )}
      {isFastPointer && (
        <text
          x={x}
          y={y + (isSlowPointer ? 50 : 45)}
          textAnchor="middle"
          fill="#3B82F6"
          fontSize="12"
          fontWeight="bold"
          className="pointer-events-none"
        >
          Fast
        </text>
      )}
    </g>
  );
};

const Arrow = ({
  fromX,
  fromY,
  toX,
  toY,
  isLoopArrow = false,
  isHighlighted = false,
}) => {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const length = Math.sqrt(dx * dx + dy * dy);
  const unitX = dx / length;
  const unitY = dy / length;

  const startX = fromX + unitX * 25;
  const startY = fromY + unitY * 25;
  const endX = toX - unitX * 25;
  const endY = toY - unitY * 25;

  return (
    <g>
      <defs>
        <marker
          id={`arrowhead-${isLoopArrow ? "loop" : "normal"}`}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={
              isLoopArrow ? "#EF4444" : isHighlighted ? "#FDE047" : "#6B7280"
            }
          />
        </marker>
      </defs>

      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke={isLoopArrow ? "#EF4444" : isHighlighted ? "#FDE047" : "#6B7280"}
        strokeWidth="2"
        markerEnd={`url(#arrowhead-${isLoopArrow ? "loop" : "normal"})`}
        className="transition-all duration-300"
      />
    </g>
  );
};

const PointerStatus = ({
  slowPointer,
  fastPointer,
  phase,
  loopDetected,
  loopStartFound,
}) => (
  <div className="flex flex-col items-center gap-4 mb-6">
    <div className="flex gap-8">
      <div className="text-center">
        <div className="text-green-400 font-semibold mb-1">Slow Pointer</div>
        <div className="bg-green-600 text-white px-4 py-2 rounded-sm font-mono">
          {slowPointer ? slowPointer.value : "NULL"}
        </div>
      </div>

      <div className="text-center">
        <div className="text-blue-400 font-semibold mb-1">Fast Pointer</div>
        <div className="bg-blue-600 text-white px-4 py-2 rounded-sm font-mono">
          {fastPointer ? fastPointer.value : "NULL"}
        </div>
      </div>
    </div>

    <div className="text-center">
      <div className="text-white font-semibold mb-1">Phase</div>
      <div
        className={`px-4 py-2 rounded-sm font-semibold ${
          phase === "detection"
            ? "bg-yellow-500"
            : phase === "finding-start"
              ? "bg-purple-600"
              : "bg-neutral-600 text-neutral-100"
        }`}
      >
        {phase === "detection"
          ? "Loop Detection"
          : phase === "finding-start"
            ? "Finding Loop Start"
            : "Complete"}
      </div>
    </div>

    <div className="flex gap-4">
      <div
        className={`px-3 py-1 rounded-sm text-sm font-semibold ${
          loopDetected
            ? "bg-red-600 text-white"
            : "bg-neutral-600 text-neutral-300"
        }`}
      >
        Loop: {loopDetected ? "DETECTED" : "Not Found"}
      </div>

      {loopDetected && (
        <div
          className={`px-3 py-1 rounded-md text-sm font-semibold ${
            loopStartFound
              ? "bg-green-600 text-white"
              : "bg-neutral-600 text-neutral-300"
          }`}
        >
          Start: {loopStartFound ? "FOUND" : "Searching"}
        </div>
      )}
    </div>
  </div>
);

const FloydCycleDetection = memo(function FloydCycleDetection() {
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [isAnimating, setIsAnimating] = useState(false);
  const [listType, setListType] = useState("with-loop");

  // Animation states //
  const [nodes, setNodes] = useState([]);
  const [slowPointer, setSlowPointer] = useState(null);
  const [fastPointer, setFastPointer] = useState(null);
  const [phase, setPhase] = useState("detection");
  const [loopDetected, setLoopDetected] = useState(false);
  const [loopStartFound, setLoopStartFound] = useState(false);
  const [loopNodes, setLoopNodes] = useState(new Set());
  const [steps, setSteps] = useState([]);
  const [currentAction, setCurrentAction] = useState("");
  const [highlightedNode, setHighlightedNode] = useState(null);

  const timeoutRef = useRef(null);

  // List str //
  const listStructures = {
    "with-loop": {
      nodes: [
        { id: 1, value: "1", x: 100, y: 200, next: 2 },
        { id: 2, value: "2", x: 200, y: 200, next: 3 },
        { id: 3, value: "3", x: 300, y: 200, next: 4 },
        { id: 4, value: "4", x: 400, y: 200, next: 5 },
        { id: 5, value: "5", x: 500, y: 200, next: 6 },
        { id: 6, value: "6", x: 600, y: 200, next: 7 },
        { id: 7, value: "7", x: 700, y: 200, next: 8 },
        { id: 8, value: "8", x: 700, y: 300, next: 9 },
        { id: 9, value: "9", x: 600, y: 300, next: 10 },
        { id: 10, value: "10", x: 500, y: 300, next: 11 },
        { id: 11, value: "11", x: 400, y: 300, next: 12 },
        { id: 12, value: "12", x: 300, y: 300, next: 5 }, // loop back to 5
      ],
      loopStart: 5,
      loopNodes: new Set([5, 6, 7, 8, 9, 10, 11, 12]),
    },
    "no-loop": {
      nodes: [
        { id: 1, value: "A", x: 100, y: 200, next: 2 },
        { id: 2, value: "B", x: 200, y: 200, next: 3 },
        { id: 3, value: "C", x: 300, y: 200, next: 4 },
        { id: 4, value: "D", x: 400, y: 200, next: 5 },
        { id: 5, value: "E", x: 500, y: 200, next: 6 },
        { id: 6, value: "F", x: 600, y: 200, next: null },
      ],
      loopStart: null,
      loopNodes: new Set(),
    },
    "self-loop": {
      nodes: [
        { id: 1, value: "X", x: 150, y: 200, next: 2 },
        { id: 2, value: "Y", x: 250, y: 200, next: 3 },
        { id: 3, value: "Z", x: 350, y: 200, next: 3 }, // Self loop
      ],
      loopStart: 3,
      loopNodes: new Set([3]),
    },
  };

  const generateFloydSteps = (listNodes, loopStart, loopNodeSet) => {
    const steps = [];
    const nodeMap = new Map();
    listNodes.forEach((node) => nodeMap.set(node.id, node));

    if (listNodes.length === 0) return steps;

    // S-I: detection
    let slow = listNodes[0];
    let fast = listNodes[0];

    steps.push({
      action: "Initialize both pointers at head",
      slowPointer: slow,
      fastPointer: fast,
      phase: "detection",
      loopDetected: false,
      loopStartFound: false,
      loopNodes: new Set(),
      highlightedNode: null,
    });

    // move pointers for detection
    while (true) {
      // move slow pointer one step
      if (slow.next) {
        slow = nodeMap.get(slow.next);
      } else {
        slow = null;
      }

      // move fast pointer two steps
      if (fast.next) {
        fast = nodeMap.get(fast.next);
        if (fast && fast.next) {
          fast = nodeMap.get(fast.next);
        } else {
          fast = null;
        }
      } else {
        fast = null;
      }

      steps.push({
        action: `Move slow pointer 1 step, fast pointer 2 steps`,
        slowPointer: slow,
        fastPointer: fast,
        phase: "detection",
        loopDetected: false,
        loopStartFound: false,
        loopNodes: new Set(),
        highlightedNode: null,
      });

      // Check for fast pointer reached end -> no loop
      if (!fast || !slow) {
        steps.push({
          action: "Fast pointer reached end - No loop detected",
          slowPointer: slow,
          fastPointer: fast,
          phase: "complete",
          loopDetected: false,
          loopStartFound: false,
          loopNodes: new Set(),
          highlightedNode: null,
        });
        break;
      }

      // Check for pointers meeting -> loop +nt
      if (slow.id === fast.id) {
        steps.push({
          action: "Pointers meet - Loop detected!",
          slowPointer: slow,
          fastPointer: fast,
          phase: "detection",
          loopDetected: true,
          loopStartFound: false,
          loopNodes: loopNodeSet,
          highlightedNode: slow.id,
        });

        // S-II: finding loop start
        let finder = listNodes[0]; // reset to head

        steps.push({
          action:
            "Phase 2: Move one pointer to head, keep other at meeting point",
          slowPointer: finder,
          fastPointer: slow,
          phase: "finding-start",
          loopDetected: true,
          loopStartFound: false,
          loopNodes: loopNodeSet,
          highlightedNode: null,
        });

        // move both pointers one step at a time until they meet
        while (finder.id !== slow.id) {
          finder = nodeMap.get(finder.next);
          slow = nodeMap.get(slow.next);

          steps.push({
            action: "Move both pointers 1 step each",
            slowPointer: slow,
            fastPointer: finder,
            phase: "finding-start",
            loopDetected: true,
            loopStartFound: false,
            loopNodes: loopNodeSet,
            highlightedNode: null,
          });
        }

        steps.push({
          action: `Loop start found at node '${finder.value}'`,
          slowPointer: slow,
          fastPointer: finder,
          phase: "complete",
          loopDetected: true,
          loopStartFound: true,
          loopNodes: loopNodeSet,
          highlightedNode: finder.id,
        });

        break;
      }
    }

    return steps;
  };

  const resetAnimation = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setCurrentStep(0);
    setSlowPointer(null);
    setFastPointer(null);
    setPhase("detection");
    setLoopDetected(false);
    setLoopStartFound(false);
    setCurrentAction("");
    setHighlightedNode(null);
    setIsAnimating(false);
  };

  const startAnimation = () => {
    if (isAnimating) return;

    resetAnimation();
    const structure = listStructures[listType];
    const animationSteps = generateFloydSteps(
      structure.nodes,
      structure.loopStart,
      structure.loopNodes,
    );

    setSteps(animationSteps);
    setTotalSteps(animationSteps.length);
    setLoopNodes(structure.loopNodes);
    setIsAnimating(true);

    const animate = (stepIndex) => {
      if (stepIndex >= animationSteps.length) {
        setIsAnimating(false);
        return;
      }

      const step = animationSteps[stepIndex];
      setCurrentStep(stepIndex + 1);
      setSlowPointer(step.slowPointer);
      setFastPointer(step.fastPointer);
      setPhase(step.phase);
      setLoopDetected(step.loopDetected);
      setLoopStartFound(step.loopStartFound);
      setCurrentAction(step.action);
      setHighlightedNode(step.highlightedNode);

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
      setSlowPointer(step.slowPointer);
      setFastPointer(step.fastPointer);
      setPhase(step.phase);
      setLoopDetected(step.loopDetected);
      setLoopStartFound(step.loopStartFound);
      setCurrentAction(step.action);
      setHighlightedNode(step.highlightedNode);
    }
  };

  const stepBackward = () => {
    if (currentStep > 0 && !isAnimating) {
      const step = steps[currentStep - 2] || {
        slowPointer: null,
        fastPointer: null,
        phase: "detection",
        loopDetected: false,
        loopStartFound: false,
        action: "",
        highlightedNode: null,
      };
      setCurrentStep(currentStep - 1);
      setSlowPointer(step.slowPointer);
      setFastPointer(step.fastPointer);
      setPhase(step.phase);
      setLoopDetected(step.loopDetected);
      setLoopStartFound(step.loopStartFound);
      setCurrentAction(step.action);
      setHighlightedNode(step.highlightedNode);
    }
  };

  useEffect(() => {
    const structure = listStructures[listType];
    setNodes(structure.nodes);
    setLoopNodes(structure.loopNodes);
    resetAnimation();
  }, [listType]);

  const getNextNode = (node) => {
    return nodes.find((n) => n.id === node.next);
  };

  const descriptionData = {
    heading: "Floyd's Cycle Detection Algorithm",
    subheading:
      "Tortoise and Hare algorithm for detecting loops in linked lists",
    summary: `<p>Floyd's Cycle Detection Algorithm uses two pointers moving at different speeds to detect cycles in linked lists.</p>
              <p><strong>Phase 1:</strong> Slow pointer moves 1 step, fast pointer moves 2 steps. If they meet, a loop exists.</p>
              <p><strong>Phase 2:</strong> To find loop start, move one pointer to head and advance both pointers 1 step at a time until they meet.</p>
              <p><strong>Time Complexity:</strong> O(n) | <strong>Space Complexity:</strong> O(1)</p>`,
    lang: "python",
    code: `def detect_cycle(head):
    if not head or not head.next:
        return None

    # Phase 1: Detect if cycle exists
    slow = head
    fast = head

    while fast and fast.next:
        slow = slow.next          # Move 1 step
        fast = fast.next.next     # Move 2 steps

        if slow == fast:          # Cycle detected
            break
    else:
        return None               # No cycle found

    # Phase 2: Find the start of the cycle
    finder = head

    while finder != slow:
        finder = finder.next      # Move 1 step
        slow = slow.next          # Move 1 step

    return finder                 # Loop start node

    # Alternative: Just detect if cycle exists
    def has_cycle(head):
        slow = fast = head

        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next

            if slow == fast:
                return True

        return False

    # Mathematical proof:
    # If loop exists with length L and distance to loop start is D:
    # When pointers meet: slow traveled D+K, fast traveled D+K+nL
    # Since fast moves twice as fast: 2(D+K) = D+K+nL
    # Solving: D+K = nL, so D = nL-K
    # Moving from head D steps = moving from meeting point nL-K steps
    # Both reach loop start simultaneously.`,
  };

  const seoData = {
    title:
      "Floyd's Cycle Detection Algorithm - Tortoise and Hare Visualization",
    description:
      "Visualize Floyd’s Cycle Detection Algorithm (Tortoise and Hare approach) interactively. Understand how fast and slow pointers detect cycles in linked lists with animations.",
    canonical:
      "https://dsa-experiments.vercel.app/array-linkedlist/floyds-cycle-detection-algorithm",
    openGraph: {
      title:
        "Floyd's Cycle Detection Algorithm - Tortoise and Hare Visualization",
      description:
        "Visualize Floyd’s Cycle Detection Algorithm (Tortoise and Hare approach) interactively. Understand how fast and slow pointers detect cycles in linked lists with animations.",
      url: "https://dsa-experiments.vercel.app/array-linkedlist/floyds-cycle-detection-algorithm",
      image: "/images/floyd-cycle/prev.png",
    },
    schema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Floyd's Cycle Detection Algorithm - Tortoise and Hare Visualization",
      url: "https://dsa-experiments.vercel.app/array-linkedlist/floyds-cycle-detection-algorithm",
      description:
        "Visualize Floyd’s Cycle Detection Algorithm (Tortoise and Hare approach) interactively using animations. Perfect for understanding how cycle detection works in linked lists.",
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
            name: "Array & LinkedList",
            item: "https://dsa-experiments.vercel.app/array-linkedlist",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Floyd's Cycle Detection",
            item: "https://dsa-experiments.vercel.app/array-linkedlist/floyds-cycle-detection-algorithm",
          },
        ],
      },
    },
  };

  return (
    <>
      <SEOData data={seoData} />
      <div className="min-h-screen max-w-7xl mx-auto w-full flex flex-col items-center justify-start gap-20 py-32 px-4 bg-neutral-900">
        <Header />

        <div className="bg-neutral-800 rounded-lg p-8 border border-neutral-800 w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 tracking-wide">
              Floyd's Cycle Detection Algorithm
            </h1>
            <p className="text-neutral-300 text-lg">
              Step: {currentStep} / {totalSteps} | Tortoise and Hare Technique
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <label className="text-white text-sm">List Type:</label>
              <Select
                value={listType}
                onValueChange={setListType}
                disabled={isAnimating}
              >
                <SelectTrigger className="w-32 bg-neutral-700 border-neutral-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="with-loop">With Loop</SelectItem>
                  <SelectItem value="no-loop">No Loop</SelectItem>
                  <SelectItem value="self-loop">Self Loop</SelectItem>
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
              {isAnimating ? "Running..." : "Start Detection"}
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
            {/* pointer status */}
            <PointerStatus
              slowPointer={slowPointer}
              fastPointer={fastPointer}
              phase={phase}
              loopDetected={loopDetected}
              loopStartFound={loopStartFound}
            />

            {/* linked list visualization */}
            <div className="flex justify-center mb-6">
              <svg width="800" height="400" viewBox="0 0 800 400">
                {/* draw arrows first [background] */}
                {nodes.map((node) => {
                  const nextNode = getNextNode(node);
                  if (nextNode) {
                    return (
                      <Arrow
                        key={`arrow-${node.id}`}
                        fromX={node.x}
                        fromY={node.y}
                        toX={nextNode.x}
                        toY={nextNode.y}
                        isLoopArrow={
                          loopNodes.has(node.id) && loopNodes.has(nextNode.id)
                        }
                        isHighlighted={highlightedNode === node.id}
                      />
                    );
                  }
                  return null;
                })}

                {/* draw nodes on top */}
                {nodes.map((node) => (
                  <ListNode
                    key={node.id}
                    node={node}
                    x={node.x}
                    y={node.y}
                    isSlowPointer={slowPointer?.id === node.id}
                    isFastPointer={fastPointer?.id === node.id}
                    isInLoop={loopNodes.has(node.id)}
                    isHighlighted={highlightedNode === node.id}
                  />
                ))}
              </svg>
            </div>

            {/* current action */}
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
            <p className="mt-1 opacity-70 flex items-center justify-center gap-2">
              <p className="size-3 rounded-full bg-[#10B981]" /> Slow pointer,
              <p className="size-3 rounded-full bg-[#3B82F6]" /> Fast pointer,
              <p className="size-3 rounded-full bg-[#EF4444]" /> Loop nodes,
              <p className="size-3 rounded-full bg-[#FDE047]" /> Highlighted,
            </p>
            <p>
              <strong>Algorithm:</strong> Slow pointer (1 step) + Fast pointer
              (2 steps) = Loop detection in O(n) time, O(1) space
            </p>
          </div>
        </div>

        <Description dataObj={descriptionData} />
      </div>
    </>
  );
});

export default FloydCycleDetection;
