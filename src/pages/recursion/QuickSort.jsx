import { useState, useEffect, useCallback, memo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShadCNHeader as Header } from "../../components/Header/ShadCNNav";
import SpeedControls from "../../components/utils/SpeedControl";

const QuickSort = memo(function QuickSort() {
  const [array, setArray] = useState([64, 34, 25, 12, 22, 11, 90]);
  const [originalArray, setOriginalArray] = useState([
    64, 34, 25, 12, 22, 11, 90,
  ]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [pivotIndex, setPivotIndex] = useState(-1);
  const [leftPointer, setLeftPointer] = useState(-1);
  const [rightPointer, setRightPointer] = useState(-1);
  const [sortedIndices, setSortedIndices] = useState(new Set());
  const [activeRange, setActiveRange] = useState({ start: -1, end: -1 });
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const [partitionSteps, setPartitionSteps] = useState([]);
  const [currentPartitionStep, setCurrentPartitionStep] = useState("");

  // arrays for testing
  const presetArrays = {
    "Random Small": [64, 34, 25, 12, 22, 11, 90],
    "Reverse Sorted": [90, 80, 70, 60, 50, 40, 30, 20, 10],
    "Already Sorted": [10, 20, 30, 40, 50, 60, 70, 80, 90],
    Duplicates: [5, 2, 8, 2, 9, 1, 5, 4],
    "Single Element": [42],
    "Two Elements": [5, 2],
    "Many Duplicates": [3, 7, 3, 1, 7, 3, 9, 1],
    "Large Random": [43, 12, 87, 23, 91, 45, 67, 34, 78, 56, 89, 21, 1, 7, 79],
  };

  // initializing sorting state
  const initializeSorting = useCallback(() => {
    setPivotIndex(-1);
    setLeftPointer(-1);
    setRightPointer(-1);
    setSortedIndices(new Set());
    setActiveRange({ start: -1, end: -1 });
    setCurrentStep(0);
    setTotalSteps(0);
    setComparisons(0);
    setSwaps(0);
    setPartitionSteps([]);
    setCurrentPartitionStep("");
    setArray([...originalArray]);
  }, [originalArray]);

  useEffect(() => {
    initializeSorting();
  }, [originalArray, initializeSorting]);

  // random array generation
  const generateRandomArray = (size = 8) => {
    const newArray = Array.from(
      { length: size },
      () => Math.floor(Math.random() * 100) + 1,
    );
    setOriginalArray(newArray);
  };

  // handling preset array selection
  const handlePresetChange = (preset) => {
    setOriginalArray([...presetArrays[preset]]);
  };

  // QuickSort implementation with animation steps
  const quickSortWithSteps = useCallback(async (arr, low, high, steps = []) => {
    if (low < high) {
      // add partition step
      steps.push({
        type: "partition_start",
        array: [...arr],
        low,
        high,
        pivot: high, // using last element as pivot
        message: `Partitioning range [${low}, ${high}] with pivot ${arr[high]}`,
      });

      const pi = await partitionWithSteps(arr, low, high, steps);

      steps.push({
        type: "partition_complete",
        array: [...arr],
        pivotIndex: pi,
        message: `Pivot ${arr[pi]} is now in correct position at index ${pi}`,
      });

      // recursively sort left and right subarrays
      await quickSortWithSteps(arr, low, pi - 1, steps);
      await quickSortWithSteps(arr, pi + 1, high, steps);
    }

    return steps;
  }, []);

  const partitionWithSteps = async (arr, low, high, steps) => {
    const pivot = arr[high];
    let i = low - 1;

    steps.push({
      type: "partition_init",
      array: [...arr],
      pivot: high,
      leftPointer: i,
      rightPointer: low,
      low,
      high,
      message: `Starting partition with pivot ${pivot} at index ${high}`,
    });

    for (let j = low; j < high; j++) {
      steps.push({
        type: "compare",
        array: [...arr],
        pivot: high,
        leftPointer: i,
        rightPointer: j,
        low,
        high,
        comparing: [j, high],
        message: `Comparing ${arr[j]} with pivot ${pivot}`,
      });

      if (arr[j] < pivot) {
        i++;
        if (i !== j) {
          // swap elements
          [arr[i], arr[j]] = [arr[j], arr[i]];
          steps.push({
            type: "swap",
            array: [...arr],
            pivot: high,
            leftPointer: i,
            rightPointer: j,
            low,
            high,
            swapped: [i, j],
            message: `Swapped ${arr[j]} and ${arr[i]} (elements smaller than pivot go left)`,
          });
        }
      }
    }

    // place pivot in correct position
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    steps.push({
      type: "pivot_placement",
      array: [...arr],
      pivotIndex: i + 1,
      low,
      high,
      swapped: [i + 1, high],
      message: `Placed pivot ${pivot} in its correct position at index ${i + 1}`,
    });

    return i + 1;
  };

  const animateStep = async (step) => {
    setArray([...step.array]);
    setCurrentPartitionStep(step.message || "");

    switch (step.type) {
      case "partition_start":
        setActiveRange({ start: step.low, end: step.high });
        setPivotIndex(step.pivot);
        setLeftPointer(-1);
        setRightPointer(-1);
        break;

      case "partition_init":
        setActiveRange({ start: step.low, end: step.high });
        setPivotIndex(step.pivot);
        setLeftPointer(step.leftPointer);
        setRightPointer(step.rightPointer);
        break;

      case "compare":
        setPivotIndex(step.pivot);
        setLeftPointer(step.leftPointer);
        setRightPointer(step.rightPointer);
        setComparisons((prev) => prev + 1);
        break;

      case "swap":
        setPivotIndex(step.pivot);
        setLeftPointer(step.leftPointer);
        setRightPointer(step.rightPointer);
        setSwaps((prev) => prev + 1);
        break;

      case "pivot_placement":
        setPivotIndex(step.pivotIndex);
        setSortedIndices((prev) => new Set([...prev, step.pivotIndex]));
        setSwaps((prev) => prev + 1);
        break;

      case "partition_complete":
        setPivotIndex(-1);
        setLeftPointer(-1);
        setRightPointer(-1);
        setActiveRange({ start: -1, end: -1 });
        break;
    }

    setCurrentStep((prev) => prev + 1);

    return new Promise((resolve) => {
      setTimeout(resolve, animationSpeed);
    });
  };

  const startSorting = async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    initializeSorting();

    await new Promise((resolve) => setTimeout(resolve, 500));

    const arrayToSort = [...originalArray];
    const steps = await quickSortWithSteps(
      arrayToSort,
      0,
      arrayToSort.length - 1,
    );

    setTotalSteps(steps.length);

    for (const step of steps) {
      await animateStep(step);
    }

    // mark all elements as sorted
    setSortedIndices(
      new Set(Array.from({ length: originalArray.length }, (_, i) => i)),
    );
    setCurrentPartitionStep("Sorting complete!");
    setIsAnimating(false);
  };

  const reset = () => {
    setIsAnimating(false);
    initializeSorting();
  };

  const getElementColor = (index) => {
    if (sortedIndices.has(index)) return "rgb(34, 197, 94)"; // green-500 (sorted)
    if (index === pivotIndex) return "rgb(147, 51, 234)"; // purple-600 (pivot)
    if (index === leftPointer && index === rightPointer)
      return "rgb(249, 115, 22)"; // orange-500 (both pointers)
    if (index === leftPointer) return "rgb(59, 130, 246)"; // blue-500 (left pointer)
    if (index === rightPointer) return "rgb(239, 68, 68)"; // red-500 (right pointer)
    if (
      activeRange.start !== -1 &&
      index >= activeRange.start &&
      index <= activeRange.end
    )
      return "rgb(115, 115, 115)"; // neutral-500 (active range)
    return "rgb(64, 64, 64)"; // neutral-700 (default)
  };

  const getElementBorder = (index) => {
    if (index === pivotIndex) return "3px solid rgb(147, 51, 234)"; // purple
    if (index === leftPointer && index === rightPointer)
      return "3px solid rgb(249, 115, 22)"; // orange
    if (index === leftPointer) return "3px solid rgb(59, 130, 246)"; // blue
    if (index === rightPointer) return "3px solid rgb(239, 68, 68)"; // red
    return "1px solid rgb(115, 115, 115)"; // neutral-500
  };

  const getBarHeight = (value) => {
    const maxValue = Math.max(...originalArray);
    return Math.max((value / maxValue) * 200, 20); // min height -> 20px
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto w-full flex flex-col items-center justify-start gap-20 py-32 px-4 bg-neutral-900">
      <Header />

      {/* Animation */}
      <div className="bg-neutral-800 rounded-lg p-8 border border-neutral-800 flex-1 w-full">
        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-wide">
            QuickSort Algorithm
          </h1>
          <p className="text-neutral-300 text-lg">
            Step: {currentStep} / {totalSteps} | Comparisons: {comparisons} |
            Swaps: {swaps}
          </p>
          {currentPartitionStep && (
            <p className="text-yellow-400 text-md font-medium mt-2">
              {currentPartitionStep}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <label className="text-white font-medium">Preset:</label>
            <select
              onChange={(e) =>
                e.target.value && handlePresetChange(e.target.value)
              }
              disabled={isAnimating}
              className="bg-neutral-800 text-white px-3 py-1 rounded-lg border border-neutral-600 focus:border-white focus:outline-none"
            >
              <option value="">Select preset...</option>
              {Object.keys(presetArrays).map((preset) => (
                <option key={preset} value={preset}>
                  {preset}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => generateRandomArray(8)}
            disabled={isAnimating}
            className="bg-neutral-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Random Array
          </button>

          <SpeedControls
            animationSpeed={animationSpeed}
            setAnimationSpeed={setAnimationSpeed}
            isAnimating={isAnimating}
          />

          <button
            onClick={startSorting}
            disabled={isAnimating}
            className="bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          >
            {isAnimating ? "Sorting..." : "Start"}
          </button>

          <button
            onClick={reset}
            disabled={isAnimating}
            className="bg-neutral-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          >
            Reset
          </button>
        </div>

        {/* Array Visualization / Game Board */}
        <div className="bg-black p-10 rounded-lg mb-8">
          {/* Bar Chart View */}
          <div
            className="flex justify-center items-end gap-2 mb-8"
            style={{ height: "250px" }}
          >
            {array.map((value, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="text-white text-xs mb-1">{index}</div>
                <div
                  className="flex items-end justify-center text-white font-bold text-sm transition-all duration-300 rounded-t-lg"
                  style={{
                    width: "40px",
                    height: `${getBarHeight(value)}px`,
                    backgroundColor: getElementColor(index),
                    border: getElementBorder(index),
                    transform:
                      index === leftPointer ||
                      index === rightPointer ||
                      index === pivotIndex
                        ? "scale(1.05)"
                        : "scale(1)",
                  }}
                >
                  <span className="mb-1">{value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Array Elements View */}
          <div className="flex justify-center items-center gap-2 flex-wrap">
            {array.map((value, index) => (
              <div
                key={index}
                className="flex flex-col items-center transition-all duration-300"
                style={{
                  transform:
                    index === leftPointer ||
                    index === rightPointer ||
                    index === pivotIndex
                      ? "scale(1.1)"
                      : "scale(1)",
                }}
              >
                <div className="text-white text-xs mb-1">{index}</div>
                <div
                  className="w-12 h-12 flex items-center justify-center rounded-lg text-white font-bold transition-all duration-300"
                  style={{
                    backgroundColor: getElementColor(index),
                    border: getElementBorder(index),
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-neutral-700 rounded-full h-2 mb-4">
          <div
            className="bg-gradient-to-r from-white to-neutral-300 h-2 rounded-full transition-all duration-300"
            style={{
              width:
                totalSteps > 0 ? `${(currentStep / totalSteps) * 100}%` : "0%",
            }}
          />
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 text-sm text-neutral-300 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-neutral-700"></div>
            <span>Unsorted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-neutral-500"></div>
            <span>Active Range</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-600 border-2 border-purple-600"></div>
            <span>Pivot</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500 border-2 border-blue-500"></div>
            <span>Left Pointer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500 border-2 border-red-500"></div>
            <span>Right Pointer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span>Sorted</span>
          </div>
        </div>

        {/* Algorithm Explanation */}
        <div className="text-center text-neutral-300 text-sm">
          <p>
            QuickSort: Divide-and-conquer algorithm that partitions around a
            pivot
          </p>
          <p className="mt-1 opacity-70">
            Average Time: O(n log n) | Worst Case: O(n²) | Space: O(log n)
          </p>
        </div>
      </div>

      {/* Description */}
      <Card className="w-full bg-neutral-800 text-white border-none shadow-none">
        <CardHeader>
          <CardTitle>QuickSort Algorithm</CardTitle>
          <CardDescription className="text-neutral-400">
            An efficient divide-and-conquer sorting algorithm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-300 leading-relaxed mb-4">
            QuickSort works by selecting a 'pivot' element and partitioning the
            array so that elements smaller than the pivot come before it, and
            elements greater come after it. This process is recursively applied
            to the sub-arrays on either side of the pivot.
          </p>
          <p className="text-neutral-300 leading-relaxed mb-4">
            The partitioning process uses two pointers: one moving from left to
            right finding elements larger than the pivot, and the algorithm
            swaps elements to maintain the partition invariant. Once
            partitioned, the pivot is in its final sorted position.
          </p>
          <p className="text-neutral-300 leading-relaxed">
            While QuickSort has O(n²) worst-case time complexity (when the pivot
            is always the smallest or largest element), its average-case
            performance of O(n log n) and good cache locality make it one of the
            fastest sorting algorithms in practice.
          </p>
        </CardContent>
        <CardFooter>
          <p className="text-neutral-400 text-sm">
            Developed by Tony Hoare in 1961, QuickSort is widely used in
            practice due to its efficiency and in-place sorting capability.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
});

export default QuickSort;
