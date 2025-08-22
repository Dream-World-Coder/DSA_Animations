import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  RotateCcw,
  Plus,
  Minus,
  Search,
} from "lucide-react";
import { ShadCNHeader as Header } from "../../components/Header/ShadCNNav";
import SpeedControls from "../../components/utils/SpeedControl";
import Description from "../../components/utils/Description";
import SEOData from "../../components/SEO";

class RBNode {
  constructor(value) {
    this.value = value;
    this.color = "RED"; // New nodes are always red
    this.left = null;
    this.right = null;
    this.parent = null;
  }
}

class RedBlackTree {
  constructor() {
    this.root = null;
  }

  insert(value, steps = []) {
    const newNode = new RBNode(value);

    if (!this.root) {
      newNode.color = "BLACK";
      this.root = newNode;
      steps.push({
        type: "insert_root",
        tree: this.serialize(),
        highlightNode: value,
        message: `Inserted ${value} as root. Root must be black.`,
      });
      return steps;
    }

    // Regular BST insertion
    let current = this.root;
    let parent = null;

    while (current) {
      parent = current;
      steps.push({
        type: "search",
        tree: this.serialize(),
        highlightNode: current.value,
        compareValue: value,
        message: `Comparing ${value} with ${current.value}`,
      });

      if (value < current.value) {
        current = current.left;
      } else if (value > current.value) {
        current = current.right;
      } else {
        steps.push({
          type: "duplicate",
          tree: this.serialize(),
          highlightNode: value,
          message: `Value ${value} already exists. No insertion needed.`,
        });
        return steps;
      }
    }

    newNode.parent = parent;
    if (value < parent.value) {
      parent.left = newNode;
    } else {
      parent.right = newNode;
    }

    steps.push({
      type: "insert_node",
      tree: this.serialize(),
      highlightNode: value,
      message: `Inserted ${value} as red node. Checking RB properties...`,
    });

    this.fixInsert(newNode, steps);
    return steps;
  }

  fixInsert(node, steps) {
    while (node !== this.root && node.parent.color === "RED") {
      if (node.parent === node.parent.parent.left) {
        const uncle = node.parent.parent.right;

        if (uncle && uncle.color === "RED") {
          // Case 1: Uncle is red
          steps.push({
            type: "recolor",
            tree: this.serialize(),
            highlightNode: node.value,
            uncleNode: uncle.value,
            parentNode: node.parent.value,
            grandparentNode: node.parent.parent.value,
            message: `Case 1: Uncle is red. Recoloring parent, uncle to black and grandparent to red.`,
          });

          node.parent.color = "BLACK";
          uncle.color = "BLACK";
          node.parent.parent.color = "RED";
          node = node.parent.parent;

          steps.push({
            type: "recolor_complete",
            tree: this.serialize(),
            highlightNode: node.value,
            message: `Recoloring complete. Moving up to check grandparent.`,
          });
        } else {
          // Case 2: Uncle is black
          if (node === node.parent.right) {
            steps.push({
              type: "rotation_prep",
              tree: this.serialize(),
              highlightNode: node.value,
              message: `Case 2: Uncle is black, node is right child. Left rotation needed.`,
            });

            node = node.parent;
            this.rotateLeft(node, steps);
          }

          steps.push({
            type: "rotation_prep2",
            tree: this.serialize(),
            highlightNode: node.value,
            message: `Case 3: Uncle is black, node is left child. Recolor and right rotation.`,
          });

          node.parent.color = "BLACK";
          node.parent.parent.color = "RED";
          this.rotateRight(node.parent.parent, steps);
        }
      } else {
        const uncle = node.parent.parent.left;

        if (uncle && uncle.color === "RED") {
          steps.push({
            type: "recolor",
            tree: this.serialize(),
            highlightNode: node.value,
            uncleNode: uncle.value,
            parentNode: node.parent.value,
            grandparentNode: node.parent.parent.value,
            message: `Case 1: Uncle is red. Recoloring parent, uncle to black and grandparent to red.`,
          });

          node.parent.color = "BLACK";
          uncle.color = "BLACK";
          node.parent.parent.color = "RED";
          node = node.parent.parent;

          steps.push({
            type: "recolor_complete",
            tree: this.serialize(),
            highlightNode: node.value,
            message: `Recoloring complete. Moving up to check grandparent.`,
          });
        } else {
          if (node === node.parent.left) {
            steps.push({
              type: "rotation_prep",
              tree: this.serialize(),
              highlightNode: node.value,
              message: `Case 2: Uncle is black, node is left child. Right rotation needed.`,
            });

            node = node.parent;
            this.rotateRight(node, steps);
          }

          steps.push({
            type: "rotation_prep2",
            tree: this.serialize(),
            highlightNode: node.value,
            message: `Case 3: Uncle is black, node is right child. Recolor and left rotation.`,
          });

          node.parent.color = "BLACK";
          node.parent.parent.color = "RED";
          this.rotateLeft(node.parent.parent, steps);
        }
      }
    }

    this.root.color = "BLACK";
    steps.push({
      type: "fix_complete",
      tree: this.serialize(),
      highlightNode: this.root.value,
      message: `Red-Black tree properties restored. Root is always black.`,
    });
  }

  rotateLeft(node, steps) {
    const rightChild = node.right;
    node.right = rightChild.left;

    if (rightChild.left) {
      rightChild.left.parent = node;
    }

    rightChild.parent = node.parent;

    if (!node.parent) {
      this.root = rightChild;
    } else if (node === node.parent.left) {
      node.parent.left = rightChild;
    } else {
      node.parent.right = rightChild;
    }

    rightChild.left = node;
    node.parent = rightChild;

    steps.push({
      type: "rotate_left",
      tree: this.serialize(),
      rotatedNode: rightChild.value,
      message: `Left rotation complete around node ${rightChild.value}.`,
    });
  }

  rotateRight(node, steps) {
    const leftChild = node.left;
    node.left = leftChild.right;

    if (leftChild.right) {
      leftChild.right.parent = node;
    }

    leftChild.parent = node.parent;

    if (!node.parent) {
      this.root = leftChild;
    } else if (node === node.parent.right) {
      node.parent.right = leftChild;
    } else {
      node.parent.left = leftChild;
    }

    leftChild.right = node;
    node.parent = leftChild;

    steps.push({
      type: "rotate_right",
      tree: this.serialize(),
      rotatedNode: leftChild.value,
      message: `Right rotation complete around node ${leftChild.value}.`,
    });
  }

  serialize() {
    const serializeNode = (node) => {
      if (!node) return null;
      return {
        value: node.value,
        color: node.color,
        left: serializeNode(node.left),
        right: serializeNode(node.right),
      };
    };
    return serializeNode(this.root);
  }

  search(value, steps = []) {
    let current = this.root;

    steps.push({
      type: "search_start",
      tree: this.serialize(),
      searchValue: value,
      message: `Searching for ${value} in Red-Black tree...`,
    });

    while (current) {
      steps.push({
        type: "search_compare",
        tree: this.serialize(),
        highlightNode: current.value,
        compareValue: value,
        message: `Comparing ${value} with ${current.value}`,
      });

      if (value === current.value) {
        steps.push({
          type: "search_found",
          tree: this.serialize(),
          highlightNode: current.value,
          message: `Found ${value}!`,
        });
        return steps;
      } else if (value < current.value) {
        current = current.left;
      } else {
        current = current.right;
      }
    }

    steps.push({
      type: "search_not_found",
      tree: this.serialize(),
      searchValue: value,
      message: `${value} not found in the tree.`,
    });

    return steps;
  }
}

export default function RedBlackTreeAnimation() {
  const [tree] = useState(new RedBlackTree());
  const [treeData, setTreeData] = useState(null);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [animationSteps, setAnimationSteps] = useState([]);
  const [showStepControls, setShowStepControls] = useState(false);
  const [operation, setOperation] = useState("insert");
  const [inputValue, setInputValue] = useState("");
  const [highlightNode, setHighlightNode] = useState(null);
  const [message, setMessage] = useState("");
  const [specialNodes, setSpecialNodes] = useState({});

  const seoData = {
    title: "Red-Black Tree Visualization - Algorithm Visualizer",
    description:
      "Interactive visualization of Red-Black Tree operations including insertion, search, and self-balancing rotations.",
    canonical: "/trees/red-black-tree",
    openGraph: {
      title: "Red-Black Tree Algorithm Visualization",
      description:
        "Learn Red-Black Trees through interactive self-balancing animations",
      url: "/trees/red-black-tree",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: "Red-Black Tree Visualization",
      description: "Interactive Red-Black Tree data structure visualization",
    },
  };

  const startAnimation = () => {
    if (!inputValue) return;

    const value = parseInt(inputValue);
    let steps = [];

    if (operation === "insert") {
      steps = tree.insert(value);
    } else if (operation === "search") {
      steps = tree.search(value);
    }

    setAnimationSteps(steps);
    setTotalSteps(steps.length);
    setCurrentStep(0);
    setIsAnimating(true);
    setShowStepControls(false);

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        const step = steps[stepIndex];

        setTreeData(step.tree);
        setHighlightNode(step.highlightNode || null);
        setMessage(step.message);

        // Set special nodes for different highlighting
        const special = {};
        if (step.uncleNode) special[step.uncleNode] = "uncle";
        if (step.parentNode) special[step.parentNode] = "parent";
        if (step.grandparentNode) special[step.grandparentNode] = "grandparent";
        if (step.rotatedNode) special[step.rotatedNode] = "rotated";
        setSpecialNodes(special);

        setCurrentStep(stepIndex + 1);
        stepIndex++;
      } else {
        clearInterval(interval);
        setIsAnimating(false);
        setHighlightNode(null);
        setSpecialNodes({});
        setShowStepControls(true);
        setInputValue("");
      }
    }, animationSpeed);
  };

  const reset = () => {
    // Create new tree
    const newTree = new RedBlackTree();
    setTreeData(null);
    setHighlightNode(null);
    setSpecialNodes({});
    setMessage("Red-Black Tree initialized. Ready for operations.");
    setCurrentStep(0);
    setTotalSteps(0);
    setShowStepControls(false);
    setInputValue("");

    // Clear the tree object
    tree.root = null;
  };

  const navigateStep = (direction) => {
    const newStep = currentStep + direction;
    if (newStep >= 0 && newStep < animationSteps.length) {
      setCurrentStep(newStep);
      const step = animationSteps[newStep];

      setTreeData(step.tree);
      setHighlightNode(step.highlightNode || null);
      setMessage(step.message);

      const special = {};
      if (step.uncleNode) special[step.uncleNode] = "uncle";
      if (step.parentNode) special[step.parentNode] = "parent";
      if (step.grandparentNode) special[step.grandparentNode] = "grandparent";
      if (step.rotatedNode) special[step.rotatedNode] = "rotated";
      setSpecialNodes(special);
    }
  };

  const renderTree = (node, x = 400, y = 60, level = 0) => {
    if (!node) return null;

    const horizontalSpacing = Math.max(180 / (level + 1), 60);
    const verticalSpacing = 80;

    const leftX = x - horizontalSpacing;
    const rightX = x + horizontalSpacing;
    const childY = y + verticalSpacing;

    const isHighlighted = highlightNode === node.value;
    const specialType = specialNodes[node.value];

    return (
      <g key={`node-${node.value}-${x}-${y}`}>
        {/* Edges */}
        {node.left && (
          <line
            x1={x}
            y1={y + 20}
            x2={leftX}
            y2={childY - 20}
            stroke="#6b7280"
            strokeWidth="2"
          />
        )}
        {node.right && (
          <line
            x1={x}
            y1={y + 20}
            x2={rightX}
            y2={childY - 20}
            stroke="#6b7280"
            strokeWidth="2"
          />
        )}

        {/* Node */}
        <circle
          cx={x}
          cy={y}
          r="20"
          fill={
            isHighlighted
              ? "#84cc16"
              : specialType === "uncle"
                ? "#f97316"
                : specialType === "parent"
                  ? "#3b82f6"
                  : specialType === "grandparent"
                    ? "#8b5cf6"
                    : specialType === "rotated"
                      ? "#06b6d4"
                      : node.color === "RED"
                        ? "#ef4444"
                        : "#1f2937"
          }
          stroke={
            isHighlighted
              ? "#65a30d"
              : node.color === "RED"
                ? "#dc2626"
                : "#374151"
          }
          strokeWidth="3"
          className="transition-all duration-500"
        />

        <text
          x={x}
          y={y + 5}
          textAnchor="middle"
          className="text-white font-bold text-sm"
          fill="white"
        >
          {node.value}
        </text>

        {/* Color indicator */}
        <text
          x={x}
          y={y - 35}
          textAnchor="middle"
          className="text-xs font-semibold"
          fill={node.color === "RED" ? "#ef4444" : "#1f2937"}
        >
          {node.color}
        </text>

        {/* Recursively render children */}
        {node.left && renderTree(node.left, leftX, childY, level + 1)}
        {node.right && renderTree(node.right, rightX, childY, level + 1)}
      </g>
    );
  };

  const descriptionData = {
    heading: "Red-Black Tree",
    subheading:
      "Self-balancing binary search tree with guaranteed O(log n) operations",
    summary:
      "A Red-Black Tree is a self-balancing binary search tree where each node has a color (red or black). It maintains balance through five properties: (1) Every node is either red or black, (2) Root is black, (3) All leaves (NIL) are black, (4) Red nodes have black children, (5) All paths from root to leaves have the same number of black nodes.",
    lang: "javascript",
    code: `class RBNode {
  constructor(value) {
    this.value = value;
    this.color = 'RED'; // New nodes start red
    this.left = null;
    this.right = null;
    this.parent = null;
  }
}

class RedBlackTree {
  insert(value) {
    // 1. Standard BST insertion
    let newNode = new RBNode(value);
    this.bstInsert(newNode);

    // 2. Fix RB properties
    this.fixInsert(newNode);
  }

  fixInsert(node) {
    while (node !== root && node.parent.color === 'RED') {
      if (node.parent === node.parent.parent.left) {
        let uncle = node.parent.parent.right;

        if (uncle && uncle.color === 'RED') {
          // Case 1: Uncle is red - recolor
          node.parent.color = 'BLACK';
          uncle.color = 'BLACK';
          node.parent.parent.color = 'RED';
          node = node.parent.parent;
        } else {
          // Case 2 & 3: Uncle is black - rotate
          if (node === node.parent.right) {
            node = node.parent;
            this.rotateLeft(node);
          }
          node.parent.color = 'BLACK';
          node.parent.parent.color = 'RED';
          this.rotateRight(node.parent.parent);
        }
      }
      // Mirror cases for right side...
    }
    root.color = 'BLACK'; // Root always black
  }
}`,
  };

  return (
    <>
      <SEOData data={seoData} />

      <div className="min-h-screen max-w-7xl mx-auto w-full flex flex-col items-center justify-start gap-20 py-20 md:py-32 px-0 bg-neutral-900">
        <Header />

        <div className="bg-neutral-800 rounded-lg p-4 md:p-8 border border-neutral-800 w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-wide">
              Red-Black Tree Visualization
            </h1>
            <p className="text-neutral-300 text-lg">
              Self-balancing BST | Height: O(log n) | Operations: O(log n)
            </p>
            {message && (
              <p className="text-lime-400 text-sm mt-2 font-medium">
                {message}
              </p>
            )}
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <label className="text-white text-sm">Operation:</label>
              <select
                value={operation}
                onChange={(e) => setOperation(e.target.value)}
                disabled={isAnimating}
                className="bg-neutral-700 text-white px-3 py-2 rounded-md border border-neutral-600"
              >
                <option value="insert">Insert</option>
                <option value="search">Search</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              {operation === "insert" ? (
                <Plus className="w-4 h-4 text-white" />
              ) : operation === "search" ? (
                <Search className="w-4 h-4 text-white" />
              ) : (
                <Minus className="w-4 h-4 text-white" />
              )}
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Value to ${operation}`}
                disabled={isAnimating}
                className="bg-neutral-700 text-white px-3 py-2 rounded-md w-32 border border-neutral-600 focus:border-lime-400 focus:outline-none"
              />
            </div>

            <SpeedControls
              animationSpeed={animationSpeed}
              setAnimationSpeed={setAnimationSpeed}
              isAnimating={isAnimating}
            />

            <button
              onClick={startAnimation}
              disabled={isAnimating || !inputValue}
              className="bg-gradient-to-r from-lime-500 to-green-500 text-black px-6 py-2 rounded-md font-semibold hover:from-lime-400 hover:to-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {isAnimating
                ? "Running..."
                : `${operation === "insert" ? "Insert" : "Search"}`}
            </button>

            <button
              onClick={reset}
              disabled={isAnimating}
              className="bg-neutral-700 text-white px-6 py-2 rounded-md font-semibold hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg flex items-center gap-2 border border-neutral-600"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>

          {/* Step Navigation Controls */}
          {showStepControls && animationSteps.length > 0 && (
            <div className="flex justify-center items-center gap-4 mb-8">
              <button
                onClick={() => navigateStep(-1)}
                disabled={currentStep === 0}
                className="bg-gradient-to-r from-lime-600 to-green-600 text-white px-4 py-2 rounded-md font-semibold hover:from-lime-500 hover:to-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <div className="bg-neutral-700 px-4 py-2 rounded-md border border-neutral-600">
                <span className="text-white font-semibold">
                  Step {currentStep} / {animationSteps.length}
                </span>
              </div>

              <button
                onClick={() => navigateStep(1)}
                disabled={currentStep >= animationSteps.length}
                className="bg-gradient-to-r from-lime-600 to-green-600 text-white px-4 py-2 rounded-md font-semibold hover:from-lime-500 hover:to-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Tree Visualization */}
          <div className="bg-black rounded-lg p-8 border border-neutral-600 mb-8">
            <div className="flex justify-center items-center min-h-[400px]">
              {treeData ? (
                <svg
                  width="800"
                  height="400"
                  viewBox="0 0 800 400"
                  className="overflow-visible"
                >
                  {renderTree(treeData)}
                </svg>
              ) : (
                <div className="text-neutral-400 text-lg">
                  Red-Black Tree is empty. Insert some values to see the
                  structure.
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-black rounded-lg p-6 border border-neutral-600 mb-8">
            <h3 className="text-white text-lg font-semibold mb-4 text-center">
              Color Legend
            </h3>
            <div className="flex flex-wrap justify-center items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-red-600"></div>
                <span className="text-white text-sm">Red Node</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-800 rounded-full border-2 border-gray-700"></div>
                <span className="text-white text-sm">Black Node</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-lime-500 rounded-full border-2 border-lime-600"></div>
                <span className="text-white text-sm">Current/Found</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-orange-600"></div>
                <span className="text-white text-sm">Uncle</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-blue-600"></div>
                <span className="text-white text-sm">Parent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 rounded-full border-2 border-purple-600"></div>
                <span className="text-white text-sm">Grandparent</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {totalSteps > 0 && (
            <div className="w-full bg-neutral-700 rounded-full h-2 mb-4">
              <div
                className="bg-gradient-to-r from-lime-400 to-green-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          )}

          {/* Properties */}
          <div className="text-center text-neutral-300 text-sm">
            <div className="mb-2">
              <strong>Red-Black Tree Properties:</strong>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs opacity-80">
              <p>• Every node is either red or black</p>
              <p>• Root is always black</p>
              <p>• All leaves (NIL) are black</p>
              <p>• Red nodes have black children only</p>
              <p>• All root-to-leaf paths have same black height</p>
              <p>• Guarantees O(log n) height</p>
            </div>
          </div>
        </div>

        <Description dataObj={descriptionData} />
      </div>
    </>
  );
}
