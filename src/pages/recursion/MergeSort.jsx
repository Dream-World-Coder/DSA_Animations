import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  RotateCcw,
  Shuffle,
} from "lucide-react";
import { ShadCNHeader as Header } from "../../components/Header/ShadCNNav";
import SpeedControls from "../../components/utils/SpeedControl";
import Description from "../../components/utils/Description";
import SEOData from "../../components/SEO";

export default function MergeSort() {
  const [array, setArray] = useState([38, 27, 43, 3, 9, 82, 10]);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [animationSteps, setAnimationSteps] = useState([]);
  const [showStepControls, setShowStepControls] = useState(false);
  const [divisionSteps, setDivisionSteps] = useState([]);
  const [mergeSteps, setMergeSteps] = useState([]);
  const [leftArray, setLeftArray] = useState([]);
  const [rightArray, setRightArray] = useState([]);
  const [showSubArrays, setShowSubArrays] = useState(false);
  const [highlightIndices, setHighlightIndices] = useState([]);
  const [compareIndices, setCompareIndices] = useState([]);
  const [message, setMessage] = useState("");

  const seoData = {
    title: "Merge Sort Visualization - Algorithm Visualizer",
    description:
      "Interactive visualization of merge sort algorithm showing the divide and conquer approach with step-by-step animation.",
    canonical: "/sorting/merge-sort",
    openGraph: {
      title: "Merge Sort Algorithm Visualization",
      description:
        "Learn merge sort through interactive divide and conquer animations",
      url: "/sorting/merge-sort",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: "Merge Sort Visualization",
      description: "Interactive animations for merge sort algorithm",
    },
  };

  const mergeSortSteps = (arr, start = 0, end = arr.length - 1, depth = 0) => {
    const steps = [];

    if (start >= end) return steps;

    const mid = Math.floor((start + end) / 2);

    // Division step
    steps.push({
      type: "divide",
      array: [...arr],
      leftStart: start,
      leftEnd: mid,
      rightStart: mid + 1,
      rightEnd: end,
      depth: depth,
      message: `Dividing array from index ${start} to ${end} at position ${mid}`,
    });

    // Recursively get steps for left and right halves
    const leftSteps = mergeSortSteps(arr, start, mid, depth + 1);
    const rightSteps = mergeSortSteps(arr, mid + 1, end, depth + 1);

    steps.push(...leftSteps);
    steps.push(...rightSteps);

    // Merge step
    const leftArr = arr.slice(start, mid + 1);
    const rightArr = arr.slice(mid + 1, end + 1);

    steps.push({
      type: "merge_start",
      array: [...arr],
      leftArray: [...leftArr],
      rightArray: [...rightArr],
      mergeStart: start,
      mergeEnd: end,
      depth: depth,
      message: `Merging subarrays [${leftArr.join(", ")}] and [${rightArr.join(", ")}]`,
    });

    // Detailed merge process
    let i = 0,
      j = 0,
      k = start;
    const tempArr = [...arr];

    while (i < leftArr.length && j < rightArr.length) {
      steps.push({
        type: "compare",
        array: [...tempArr],
        leftArray: [...leftArr],
        rightArray: [...rightArr],
        leftIndex: i,
        rightIndex: j,
        compareValues: [leftArr[i], rightArr[j]],
        message: `Comparing ${leftArr[i]} and ${rightArr[j]}`,
      });

      if (leftArr[i] <= rightArr[j]) {
        tempArr[k] = leftArr[i];
        steps.push({
          type: "place",
          array: [...tempArr],
          placedIndex: k,
          placedValue: leftArr[i],
          message: `Placing ${leftArr[i]} at position ${k}`,
        });
        i++;
      } else {
        tempArr[k] = rightArr[j];
        steps.push({
          type: "place",
          array: [...tempArr],
          placedIndex: k,
          placedValue: rightArr[j],
          message: `Placing ${rightArr[j]} at position ${k}`,
        });
        j++;
      }
      k++;
    }

    // Copy remaining elements from left array
    while (i < leftArr.length) {
      tempArr[k] = leftArr[i];
      steps.push({
        type: "place",
        array: [...tempArr],
        placedIndex: k,
        placedValue: leftArr[i],
        message: `Copying remaining element ${leftArr[i]} to position ${k}`,
      });
      i++;
      k++;
    }

    // Copy remaining elements from right array
    while (j < rightArr.length) {
      tempArr[k] = rightArr[j];
      steps.push({
        type: "place",
        array: [...tempArr],
        placedIndex: k,
        placedValue: rightArr[j],
        message: `Copying remaining element ${rightArr[j]} to position ${k}`,
      });
      j++;
      k++;
    }

    steps.push({
      type: "merge_complete",
      array: [...tempArr],
      mergedRange: [start, end],
      message: `Merged subarray from index ${start} to ${end}: [${tempArr.slice(start, end + 1).join(", ")}]`,
    });

    // Update the original array for this range
    for (let idx = start; idx <= end; idx++) {
      arr[idx] = tempArr[idx];
    }

    return steps;
  };

  const startAnimation = () => {
    const steps = mergeSortSteps([...array]);

    setAnimationSteps(steps);
    setTotalSteps(steps.length);
    setCurrentStep(0);
    setIsAnimating(true);
    setShowStepControls(false);

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        const step = steps[stepIndex];

        switch (step.type) {
          case "divide":
            setArray(step.array);
            setHighlightIndices(
              [...Array(step.rightEnd - step.leftStart + 1)].map(
                (_, i) => step.leftStart + i,
              ),
            );
            setCompareIndices([]);
            setLeftArray([]);
            setRightArray([]);
            setShowSubArrays(false);
            break;

          case "merge_start":
            setArray(step.array);
            setLeftArray(step.leftArray);
            setRightArray(step.rightArray);
            setShowSubArrays(true);
            setHighlightIndices([]);
            setCompareIndices([]);
            break;

          case "compare":
            setArray(step.array);
            setLeftArray(step.leftArray);
            setRightArray(step.rightArray);
            setCompareIndices(step.compareValues);
            break;

          case "place":
            setArray(step.array);
            setHighlightIndices([step.placedIndex]);
            setCompareIndices([]);
            break;

          case "merge_complete":
            setArray(step.array);
            setHighlightIndices(
              step.mergedRange.map((_, i) => step.mergedRange[0] + i),
            );
            setShowSubArrays(false);
            setLeftArray([]);
            setRightArray([]);
            setCompareIndices([]);
            break;
        }

        setMessage(step.message);
        setCurrentStep(stepIndex + 1);
        stepIndex++;
      } else {
        clearInterval(interval);
        setIsAnimating(false);
        setHighlightIndices([]);
        setCompareIndices([]);
        setShowSubArrays(false);
        setMessage("Merge sort complete! Array is now sorted.");
        setShowStepControls(true);
      }
    }, animationSpeed);
  };

  const reset = () => {
    setArray([38, 27, 43, 3, 9, 82, 10]);
    setHighlightIndices([]);
    setCompareIndices([]);
    setLeftArray([]);
    setRightArray([]);
    setShowSubArrays(false);
    setMessage("");
    setCurrentStep(0);
    setTotalSteps(0);
    setShowStepControls(false);
  };

  const shuffleArray = () => {
    if (isAnimating) return;
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    setArray(newArray);
    setMessage("Array shuffled! Ready to sort.");
  };

  const navigateStep = (direction) => {
    const newStep = currentStep + direction;
    if (newStep >= 0 && newStep < animationSteps.length) {
      setCurrentStep(newStep);
      const step = animationSteps[newStep];

      switch (step.type) {
        case "divide":
          setArray(step.array);
          setHighlightIndices(
            [...Array(step.rightEnd - step.leftStart + 1)].map(
              (_, i) => step.leftStart + i,
            ),
          );
          setCompareIndices([]);
          setLeftArray([]);
          setRightArray([]);
          setShowSubArrays(false);
          break;

        case "merge_start":
          setArray(step.array);
          setLeftArray(step.leftArray);
          setRightArray(step.rightArray);
          setShowSubArrays(true);
          setHighlightIndices([]);
          setCompareIndices([]);
          break;

        case "compare":
          setArray(step.array);
          setLeftArray(step.leftArray);
          setRightArray(step.rightArray);
          setCompareIndices(step.compareValues);
          break;

        case "place":
          setArray(step.array);
          setHighlightIndices([step.placedIndex]);
          setCompareIndices([]);
          break;

        case "merge_complete":
          setArray(step.array);
          setHighlightIndices(
            step.mergedRange.map((_, i) => step.mergedRange[0] + i),
          );
          setShowSubArrays(false);
          setLeftArray([]);
          setRightArray([]);
          setCompareIndices([]);
          break;
      }

      setMessage(step.message);
    }
  };

  const renderArray = (arr, title, isSubArray = false) => (
    <div
      className={`${isSubArray ? "bg-neutral-700" : "bg-black"} p-4 rounded-lg ${isSubArray ? "border border-neutral-600" : ""}`}
    >
      <h3 className="text-white text-sm font-semibold mb-3 text-center">
        {title}
      </h3>
      <div className="flex justify-center items-center gap-2 flex-wrap min-h-[60px]">
        {arr.map((value, index) => {
          const isHighlighted = highlightIndices.includes(index);
          const isComparing = compareIndices.includes(value);

          return (
            <div
              key={`${title}-${index}-${value}`}
              className="flex flex-col items-center gap-1"
            >
              <div
                className={`w-12 h-12 flex items-center justify-center rounded-lg font-bold text-sm transition-all duration-500 border-2 ${
                  isHighlighted
                    ? "bg-lime-400 border-lime-300 text-black scale-110 shadow-lg shadow-lime-400/50"
                    : isComparing
                      ? "bg-orange-400 border-orange-300 text-black scale-105 shadow-lg shadow-orange-400/50"
                      : isSubArray
                        ? "bg-gradient-to-br from-blue-400 to-blue-500 border-blue-300 text-white shadow-md"
                        : "bg-gradient-to-br from-white to-gray-100 border-gray-300 text-black shadow-md"
                }`}
              >
                {value}
              </div>
              <div className="text-neutral-400 text-xs">[{index}]</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const descriptionData = {
    heading: "Merge Sort Algorithm",
    subheading:
      "Divide and Conquer sorting with guaranteed O(n log n) performance",
    summary:
      "Merge sort is a stable, divide-and-conquer sorting algorithm that recursively divides the array into smaller subarrays, sorts them, and then merges them back together. It guarantees O(n log n) time complexity in all cases and is particularly efficient for large datasets.",
    lang: "javascript",
    code: `function mergeSort(arr, left = 0, right = arr.length - 1) {
  if (left >= right) return;

  // Divide
  const mid = Math.floor((left + right) / 2);
  mergeSort(arr, left, mid);
  mergeSort(arr, mid + 1, right);

  // Conquer (Merge)
  merge(arr, left, mid, right);
}

function merge(arr, left, mid, right) {
  const leftArr = arr.slice(left, mid + 1);
  const rightArr = arr.slice(mid + 1, right + 1);

  let i = 0, j = 0, k = left;

  while (i < leftArr.length && j < rightArr.length) {
    if (leftArr[i] <= rightArr[j]) {
      arr[k++] = leftArr[i++];
    } else {
      arr[k++] = rightArr[j++];
    }
  }

  // Copy remaining elements
  while (i < leftArr.length) arr[k++] = leftArr[i++];
  while (j < rightArr.length) arr[k++] = rightArr[j++];
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
              Merge Sort Visualization
            </h1>
            <p className="text-neutral-300 text-lg">
              Array Length: {array.length} | Time Complexity: O(n log n) |
              Space: O(n)
            </p>
            {message && (
              <p className="text-lime-400 text-sm mt-2 font-medium">
                {message}
              </p>
            )}
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
            <SpeedControls
              animationSpeed={animationSpeed}
              setAnimationSpeed={setAnimationSpeed}
              isAnimating={isAnimating}
            />

            <button
              onClick={startAnimation}
              disabled={isAnimating}
              className="bg-gradient-to-r from-lime-500 to-green-500 text-black px-6 py-2 rounded-md font-semibold hover:from-lime-400 hover:to-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {isAnimating ? "Sorting..." : "Start Sort"}
            </button>

            <button
              onClick={shuffleArray}
              disabled={isAnimating}
              className="bg-orange-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              <Shuffle className="w-4 h-4" />
              Shuffle
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
          <div className="space-y-6">
            {/* Main Array */}
            {renderArray(array, "Main Array")}

            {/* Sub Arrays during merge */}
            {showSubArrays && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderArray(leftArray, "Left Subarray", true)}
                {renderArray(rightArray, "Right Subarray", true)}
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
              <span className="inline-block w-3 h-3 bg-lime-400 rounded mr-2"></span>
              Currently Processing
              <span className="inline-block w-3 h-3 bg-orange-400 rounded mx-2 ml-4"></span>
              Comparing Elements
              <span className="inline-block w-3 h-3 bg-blue-400 rounded mx-2 ml-4"></span>
              Subarrays
            </p>
            <p className="mt-2 opacity-70">
              Stable sort that maintains relative order of equal elements
            </p>
          </div>
        </div>

        <Description dataObj={descriptionData} />
      </div>
    </>
  );
}
