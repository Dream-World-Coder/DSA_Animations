import React, { useState, useEffect, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShadCNHeader as Header } from "../../components/Header/ShadCNNav";
import SpeedControls from "../../components/utils/SpeedControl";
import Description from "../../components/utils/Description";
import SEOData from "../../components/SEO";

export default function SubsetGenerationVisualization() {
  const [elements, setElements] = useState(["A", "B", "C"]);
  const [currentSubset, setCurrentSubset] = useState([]);
  const [allSubsets, setAllSubsets] = useState([]);
  const [treeNodes, setTreeNodes] = useState([]);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);

  const descriptionData = {
    heading: "Subset Generation with Backtracking",
    subheading: "Recursive Decision Tree Visualization",
    summary:
      "This visualization shows how backtracking generates all possible subsets by making binary decisions (include/exclude) for each element. The tree structure demonstrates the recursive nature of the algorithm, where each node represents a decision point and leaves represent complete subsets.",
    lang: "python",
    code: `def generate_subsets(arr, index=0, current=[]):
    if index == len(arr):
        print(current)  # Found a subset
        return

    # Exclude current element (left branch)
    generate_subsets(arr, index + 1, current)

    # Include current element (right branch)
    current.append(arr[index])
    generate_subsets(arr, index + 1, current)
    current.pop()  # Backtrack

# Usage
generate_subsets(['A', 'B', 'C'])`,
  };

  // Tree node structure
  const createTreeNode = (subset, level, path, isLeaf = false) => ({
    subset: [...subset],
    level,
    path, // 'L' for left (exclude), 'R' for right (include)
    isLeaf,
    x: 0,
    y: 0,
    id: `${level}-${path}`,
  });

  const generateSubsetsWithTree = useCallback(() => {
    const nodes = [];
    const subsets = [];
    let nodeCounter = 0;

    const backtrack = (index, currentSubset, path = "") => {
      // Add current node to tree
      const node = createTreeNode(
        currentSubset,
        index,
        path,
        index === elements.length,
      );
      nodes.push({ ...node, step: nodeCounter++ });

      if (index === elements.length) {
        subsets.push([...currentSubset]);
        return;
      }

      // Left branch: exclude current element
      backtrack(index + 1, currentSubset, path + "L");

      // Right branch: include current element
      currentSubset.push(elements[index]);
      backtrack(index + 1, currentSubset, path + "R");
      currentSubset.pop(); // backtrack
    };

    backtrack(0, []);
    return { nodes, subsets };
  }, [elements]);

  const calculateNodePositions = (nodes) => {
    const levels = {};
    const margin = 60; // Margin from edges
    const nodeRadius = 20;

    // Group nodes by level
    nodes.forEach((node) => {
      if (!levels[node.level]) levels[node.level] = [];
      levels[node.level].push(node);
    });

    // Calculate total width needed
    const maxLevel = Math.max(...Object.keys(levels).map((k) => parseInt(k)));
    const maxNodesAtLevel = Math.max(
      ...Object.values(levels).map((level) => level.length),
    );

    // Dynamic SVG dimensions
    const svgWidth = Math.max(800, maxNodesAtLevel * 120 + margin * 2);
    const svgHeight = Math.max(400, (maxLevel + 1) * 100 + margin * 2);

    // Position nodes level by level
    Object.keys(levels).forEach((levelKey) => {
      const level = parseInt(levelKey);
      const levelNodes = levels[level];
      const levelY = level * 100 + margin + nodeRadius;

      // Calculate spacing for this level
      const availableWidth = svgWidth - margin * 2;
      const spacing =
        levelNodes.length > 1 ? availableWidth / (levelNodes.length - 1) : 0;
      const startX = levelNodes.length === 1 ? svgWidth / 2 : margin;

      levelNodes.forEach((node, index) => {
        if (levelNodes.length === 1) {
          node.x = svgWidth / 2;
        } else {
          node.x = startX + index * spacing;
        }
        node.y = levelY;
      });
    });

    return { nodes, svgWidth, svgHeight };
  };

  const reset = () => {
    setCurrentSubset([]);
    setAllSubsets([]);
    setTreeNodes([]);
    setCurrentNodeIndex(-1);
    setCurrentStep(0);
    setIsAnimating(false);
  };

  const startAnimation = async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setCurrentStep(0);
    setAllSubsets([]);
    setCurrentSubset([]);

    const { nodes, subsets } = generateSubsetsWithTree();
    const {
      nodes: positionedNodes,
      svgWidth,
      svgHeight,
    } = calculateNodePositions(nodes);

    setTreeNodes(positionedNodes);
    setTotalSteps(positionedNodes.length);

    // Store dimensions for SVG
    setTreeNodes((prev) =>
      prev.map((node) => ({ ...node, svgWidth, svgHeight })),
    );

    // Animate through each step
    for (let i = 0; i < positionedNodes.length; i++) {
      if (!isAnimating) break;

      setCurrentNodeIndex(i);
      setCurrentStep(i + 1);
      setCurrentSubset(positionedNodes[i].subset);

      if (positionedNodes[i].isLeaf) {
        setAllSubsets((prev) => [...prev, positionedNodes[i].subset]);
      }

      await new Promise((resolve) => setTimeout(resolve, animationSpeed));
    }

    setIsAnimating(false);
  };

  // Get SVG dimensions from first node (they all have the same dimensions)
  const svgWidth = treeNodes.length > 0 ? treeNodes[0].svgWidth || 800 : 800;
  const svgHeight = treeNodes.length > 0 ? treeNodes[0].svgHeight || 600 : 600;

  return (
    <div className="min-h-screen max-w-7xl mx-auto w-full flex flex-col items-center justify-start gap-20 py-20 md:py-32 px-4 bg-neutral-900">
      <Header />

      {/* animation */}
      <div className="bg-neutral-800 rounded-lg p-4 md:p-8 border border-neutral-800 w-full">
        {/* animation Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-wide">
            Subset Generation Tree
          </h1>
          <p className="text-neutral-300 text-lg">
            Elements: [{elements.join(", ")}] | Step: {currentStep} /{" "}
            {totalSteps} | Total Subsets: 2<sup>{elements.length}</sup> ={" "}
            {Math.pow(2, elements.length)}
          </p>
        </div>

        {/* Controls for animation parameters */}
        <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <label className="text-white text-sm">Elements:</label>
            <Select
              value={elements.length.toString()}
              onValueChange={(value) => {
                const count = parseInt(value);
                const newElements = Array.from({ length: count }, (_, i) =>
                  String.fromCharCode(65 + i),
                );
                setElements(newElements);
                reset();
              }}
              disabled={isAnimating}
            >
              <SelectTrigger className="w-16 bg-neutral-700 text-white border-neutral-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-700 border-neutral-600">
                {[2, 3, 4, 5, 6, 7].map((i) => (
                  <SelectItem
                    key={i}
                    value={i.toString()}
                    className="text-white hover:bg-neutral-600"
                  >
                    {i}
                  </SelectItem>
                ))}
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
            className="bg-white text-black px-6 py-2 rounded-md font-semibold hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          >
            {isAnimating ? "Generating..." : "Start"}
          </button>

          <button
            onClick={reset}
            disabled={isAnimating}
            className="bg-neutral-700 text-white px-6 py-2 rounded-md font-semibold hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          >
            Reset
          </button>
        </div>

        {/* Game Board */}
        <div className="flex flex-col justify-center items-center gap-8 mb-8 bg-black p-5 md:p-10 rounded-lg min-h-[400px]">
          {/* Decision Tree Visualization */}
          <div className="w-full overflow-x-auto">
            <svg
              width={svgWidth}
              height={svgHeight}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="mx-auto"
              style={{ minWidth: "600px" }}
            >
              {/* Draw connections between nodes */}
              {treeNodes.map((node, index) => {
                if (node.level === 0) return null;

                // Find parent node
                const parentPath = node.path.slice(0, -1);
                const parent = treeNodes.find(
                  (n) => n.level === node.level - 1 && n.path === parentPath,
                );

                if (!parent) return null;

                const isActive = index <= currentNodeIndex;

                return (
                  <line
                    key={`line-${node.id}`}
                    x1={parent.x}
                    y1={parent.y + 20}
                    x2={node.x}
                    y2={node.y - 20}
                    stroke={isActive ? "#10b981" : "#525252"}
                    strokeWidth={isActive ? 3 : 2}
                    className="transition-all duration-300"
                  />
                );
              })}

              {/* Draw nodes */}
              {treeNodes.map((node, index) => {
                const isActive = index === currentNodeIndex;
                const isVisited = index < currentNodeIndex;
                const isLeaf = node.isLeaf;

                return (
                  <g key={node.id}>
                    {/* Node circle */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={20}
                      fill={
                        isActive
                          ? "#10b981"
                          : isVisited
                            ? isLeaf
                              ? "#22c55e"
                              : "#6b7280"
                            : "#374151"
                      }
                      stroke={isActive ? "#065f46" : "#1f2937"}
                      strokeWidth={isActive ? 3 : 2}
                      className="transition-all duration-300"
                    />

                    {/* Node label */}
                    <text
                      x={node.x}
                      y={node.y - 30}
                      textAnchor="middle"
                      className="fill-white text-sm font-mono"
                    >
                      {node.subset.length > 0
                        ? `{${node.subset.join(",")}}`
                        : "{}"}
                    </text>

                    {/* Branch labels */}
                    {node.path && (
                      <text
                        x={node.x + (node.path.slice(-1) === "L" ? -12 : 12)}
                        y={node.y + 35}
                        textAnchor="middle"
                        className="fill-lime-400 text-sm font-bold"
                      >
                        {node.path.slice(-1) === "L" ? "0" : "1"}
                      </text>
                    )}

                    {/* Element being decided on (for internal nodes) */}
                    {!node.isLeaf && node.level < elements.length && (
                      <text
                        x={node.x}
                        y={node.y + 5}
                        textAnchor="middle"
                        className="fill-white text-xs font-bold"
                      >
                        {elements[node.level]}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Current State Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="bg-neutral-700 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">Current Subset</h3>
              <div className="bg-black rounded p-3 text-lime-400 font-mono">
                {currentSubset.length > 0
                  ? `{${currentSubset.join(", ")}}`
                  : "{}"}
              </div>
            </div>

            <div className="bg-neutral-700 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">
                Generated Subsets ({allSubsets.length})
              </h3>
              <div className="bg-black rounded p-3 max-h-32 overflow-y-auto">
                {allSubsets.map((subset, index) => (
                  <div key={index} className="text-green-400 font-mono text-sm">
                    {subset.length > 0 ? `{${subset.join(", ")}}` : "{}"}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-neutral-700 rounded-full h-2 mb-4">
          <div
            className="bg-gradient-to-r from-lime-400 to-green-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0}%`,
            }}
          />
        </div>

        {/* Formula Explanation */}
        <div className="text-center text-neutral-300 text-sm">
          <p className="mb-2">
            <span className="text-lime-400 font-bold">0</span> = Exclude element
            (Left branch) |<span className="text-lime-400 font-bold"> 1</span> =
            Include element (Right branch)
          </p>
          <div className="flex justify-center gap-4 text-xs flex-wrap">
            <span>
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
              Leaf Node (Complete Subset)
            </span>
            <span>
              <span className="inline-block w-3 h-3 bg-gray-500 rounded-full mr-1"></span>
              Internal Node
            </span>
            <span>
              <span className="inline-block w-3 h-3 bg-green-600 rounded-full mr-1"></span>
              Current Node
            </span>
          </div>
        </div>
      </div>

      <Description dataObj={descriptionData} />
    </div>
  );
}
