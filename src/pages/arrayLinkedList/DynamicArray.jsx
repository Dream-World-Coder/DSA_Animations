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

export default function DynamicArray() {
  const [array, setArray] = useState([5, 3, 8, 1, 9]);
  const [capacity, setCapacity] = useState(5);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [animationSteps, setAnimationSteps] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [highlightIndices, setHighlightIndices] = useState([]);
  const [message, setMessage] = useState("");
  const [showStepControls, setShowStepControls] = useState(false);
  const [showNewArray, setShowNewArray] = useState(false);
  const [newArray, setNewArray] = useState([]);
  const [newCapacity, setNewCapacity] = useState(0);
  const [copyingIndex, setCopyingIndex] = useState(-1);

  const seoData = {
    title: "Dynamic Array Resizing Visualization - Algorithm Visualizer",
    description:
      "Interactive visualization of dynamic array resizing operations showing how arrays double in size and copy elements when capacity is exceeded.",
    canonical: "/arrays/dynamic-array",
    openGraph: {
      title: "Dynamic Array Resizing Visualization",
      description:
        "Learn how dynamic arrays resize and copy elements through interactive animations",
      url: "/arrays/dynamic-array",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: "Dynamic Array Resizing",
      description: "Interactive animations for array resizing operations",
    },
  };

  const generateResizeSteps = (value) => {
    const steps = [];
    const currentArray = [...array];
    const currentCap = capacity;

    // Step 1: Show trying to insert when array is full
    steps.push({
      array: [...currentArray],
      capacity: currentCap,
      newArray: [],
      newCapacity: 0,
      showNewArray: false,
      highlightIndices: [],
      copyingIndex: -1,
      message: `Trying to insert ${value}. Array is full (${currentArray.length}/${currentCap})!`,
    });

    // Step 2: Create new array with double capacity
    const newCap = currentCap * 2;
    steps.push({
      array: [...currentArray],
      capacity: currentCap,
      newArray: new Array(newCap).fill(null),
      newCapacity: newCap,
      showNewArray: true,
      highlightIndices: [],
      copyingIndex: -1,
      message: `Creating new array with double capacity: ${newCap}`,
    });

    // Step 3-N: Copy each element one by one
    for (let i = 0; i < currentArray.length; i++) {
      const tempNewArray = new Array(newCap).fill(null);
      for (let j = 0; j <= i; j++) {
        tempNewArray[j] = currentArray[j];
      }

      steps.push({
        array: [...currentArray],
        capacity: currentCap,
        newArray: [...tempNewArray],
        newCapacity: newCap,
        showNewArray: true,
        highlightIndices: [i],
        copyingIndex: i,
        message: `Copying element ${currentArray[i]} to position ${i} in new array`,
      });
    }

    // Step N+1: Add new element
    const finalArray = [...currentArray, parseInt(value)];
    const tempNewArray = new Array(newCap).fill(null);
    for (let j = 0; j < finalArray.length; j++) {
      tempNewArray[j] = finalArray[j];
    }

    steps.push({
      array: [...currentArray],
      capacity: currentCap,
      newArray: [...tempNewArray],
      newCapacity: newCap,
      showNewArray: true,
      highlightIndices: [finalArray.length - 1],
      copyingIndex: finalArray.length - 1,
      message: `Inserting new element ${value} at position ${finalArray.length - 1}`,
    });

    // Step N+2: Replace old array
    steps.push({
      array: [...finalArray],
      capacity: newCap,
      newArray: [],
      newCapacity: 0,
      showNewArray: false,
      highlightIndices: [finalArray.length - 1],
      copyingIndex: -1,
      message: `Replacing old array. New capacity: ${newCap}, Size: ${finalArray.length}`,
    });

    // Final step
    steps.push({
      array: [...finalArray],
      capacity: newCap,
      newArray: [],
      newCapacity: 0,
      showNewArray: false,
      highlightIndices: [],
      copyingIndex: -1,
      message: `Dynamic array resize complete! Ready for more insertions.`,
    });

    return steps;
  };

  const startAnimation = () => {
    if (!inputValue) return;
    if (array.length < capacity) {
      // Simple insertion without resize
      const newArr = [...array, parseInt(inputValue)];
      setArray(newArr);
      setMessage(
        `Inserted ${inputValue}. No resize needed (${newArr.length}/${capacity})`,
      );
      setInputValue("");
      return;
    }

    const steps = generateResizeSteps(inputValue);

    setAnimationSteps(steps);
    setTotalSteps(steps.length);
    setCurrentStep(0);
    setIsAnimating(true);
    setShowStepControls(false);

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        const step = steps[stepIndex];
        setArray(step.array);
        setCapacity(step.capacity);
        setNewArray(step.newArray);
        setNewCapacity(step.newCapacity);
        setShowNewArray(step.showNewArray);
        setHighlightIndices(step.highlightIndices);
        setCopyingIndex(step.copyingIndex);
        setMessage(step.message);
        setCurrentStep(stepIndex + 1);
        stepIndex++;
      } else {
        clearInterval(interval);
        setIsAnimating(false);
        setHighlightIndices([]);
        setCopyingIndex(-1);
        setShowStepControls(true);
        setInputValue("");
      }
    }, animationSpeed);
  };

  const reset = () => {
    setArray([5, 3, 8, 1, 9]);
    setCapacity(5);
    setNewArray([]);
    setNewCapacity(0);
    setShowNewArray(false);
    setHighlightIndices([]);
    setCopyingIndex(-1);
    setMessage("");
    setCurrentStep(0);
    setTotalSteps(0);
    setInputValue("");
    setShowStepControls(false);
  };

  const navigateStep = (direction) => {
    const newStep = currentStep + direction;
    if (newStep >= 0 && newStep < animationSteps.length) {
      setCurrentStep(newStep);
      const step = animationSteps[newStep];
      setArray(step.array);
      setCapacity(step.capacity);
      setNewArray(step.newArray);
      setNewCapacity(step.newCapacity);
      setShowNewArray(step.showNewArray);
      setHighlightIndices(step.highlightIndices);
      setCopyingIndex(step.copyingIndex);
      setMessage(step.message);
    }
  };

  const renderArraySlots = (arr, cap, isNew = false) => {
    const slots = [];
    for (let i = 0; i < cap; i++) {
      const value = i < arr.length ? arr[i] : null;
      const isEmpty = value === null;
      const isHighlighted = highlightIndices.includes(i);
      const isCopying = copyingIndex === i;

      slots.push(
        <div
          key={`${isNew ? "new" : "old"}-${i}`}
          className="flex flex-col items-center gap-2"
        >
          <div
            className={`w-14 h-14 flex items-center justify-center rounded-xl font-bold text-lg transition-all duration-500 border-2 ${
              isEmpty
                ? "bg-neutral-700 border-neutral-600 text-neutral-500"
                : isHighlighted
                  ? "bg-lime-400 border-lime-300 text-black scale-110 shadow-lg shadow-lime-400/50"
                  : isCopying
                    ? "bg-green-500 border-green-400 text-white scale-105 shadow-lg shadow-green-500/50"
                    : "bg-gradient-to-br from-white to-gray-100 border-gray-300 text-black shadow-md"
            }`}
          >
            {!isEmpty ? value : ""}
          </div>
          <div className="text-neutral-400 text-xs">[{i}]</div>
        </div>,
      );
    }
    return slots;
  };

  const descriptionData = {
    heading: "Dynamic Array Resizing",
    subheading:
      "Visualize how dynamic arrays automatically resize when capacity is exceeded",
    summary:
      "This animation demonstrates the crucial process of dynamic array resizing. When you try to insert an element into a full array, it creates a new array with double the capacity, copies all existing elements, then adds the new element. This ensures O(1) amortized time complexity for insertions.",
    lang: "javascript",
    code: `// Dynamic Array Resize Algorithm
if (size >= capacity) {
  // 1. Create new array with double capacity
  newCapacity = capacity * 2;
  newArray = new Array(newCapacity);

  // 2. Copy all existing elements
  for (let i = 0; i < size; i++) {
    newArray[i] = oldArray[i];
  }

  // 3. Replace old array
  array = newArray;
  capacity = newCapacity;
}

// 4. Insert new element
array[size] = newElement;
size++;`,
  };

  return (
    <>
      <SEOData data={seoData} />

      <div className="min-h-screen max-w-7xl mx-auto w-full flex flex-col items-center justify-start gap-20 py-20 md:py-32 px-0 bg-neutral-900">
        <Header />

        <div className="bg-neutral-800 rounded-lg p-4 md:p-8 border border-neutral-800 w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-wide">
              Dynamic Array Resizing
            </h1>
            <p className="text-neutral-300 text-lg">
              Size: {array.length} / Capacity: {capacity} | Load Factor:{" "}
              {((array.length / capacity) * 100).toFixed(0)}%
            </p>
            {message && (
              <p className="text-lime-400 text-sm mt-2 font-medium">
                {message}
              </p>
            )}
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-white" />
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Insert value"
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
              {isAnimating ? "Inserting..." : "Insert"}
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

          {/* Array Visualization */}
          <div className="space-y-8">
            {/* Current Array */}
            <div className="bg-black p-6 rounded-lg">
              <h3 className="text-white text-lg font-semibold mb-4 text-center">
                {showNewArray ? "Current Array (Old)" : "Current Array"}
              </h3>
              <div className="flex justify-center items-center gap-2 flex-wrap min-h-[100px]">
                {renderArraySlots(array, capacity)}
              </div>
            </div>

            {/* New Array (shown during resizing) */}
            {showNewArray && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-lime-500/20 to-green-500/20 rounded-lg animate-pulse"></div>
                <div className="bg-black p-6 rounded-lg border-2 border-lime-400 relative">
                  <h3 className="text-lime-400 text-lg font-semibold mb-4 text-center">
                    New Array (Double Capacity)
                  </h3>
                  <div className="flex justify-center items-center gap-2 flex-wrap min-h-[100px]">
                    {renderArraySlots(newArray, newCapacity, true)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {totalSteps > 0 && (
            <div className="w-full bg-neutral-700 rounded-full h-2 mb-4 mt-8">
              <div
                className="bg-gradient-to-r from-lime-400 to-green-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          )}

          <div className="text-center text-neutral-300 text-sm mt-6">
            <p>
              Amortized Time Complexity: O(1) | Worst Case: O(n) when resizing
            </p>
            <p className="mt-1 opacity-70">
              Doubling strategy ensures each element is copied at most log(n)
              times
            </p>
          </div>
        </div>

        <Description dataObj={descriptionData} />
      </div>
    </>
  );
}
