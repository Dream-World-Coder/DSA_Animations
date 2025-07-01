import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShadCNHeader as Header } from "../../components/Header/ShadCNNav";

const KadanesAlgorithm = () => {
  const [array, setArray] = useState([-2, 1, -3, 4, -1, 2, 1, -5, 4]);
  const [customArray, setCustomArray] = useState(
    "[-2, 1, -3, 4, -1, 2, 1, -5, 4]",
  );
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentSum, setCurrentSum] = useState(0);
  const [maxSum, setMaxSum] = useState(0);
  const [maxStart, setMaxStart] = useState(0);
  const [maxEnd, setMaxEnd] = useState(0);
  const [currentStart, setCurrentStart] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Predefined arrays for quick testing
  const presetArrays = {
    "Classic Example": [-2, 1, -3, 4, -1, 2, 1, -5, 4],
    "All Negative": [-3, -4, -1, -2, -1, -5, -4],
    "All Positive": [1, 2, 3, 4, 5],
    "Mixed Small": [5, -3, 2, -1, 4],
    "Large Example": [-2, -5, 6, -2, -3, 1, 5, -6, 3, 2],
    "Single Element": [42],
    Alternating: [1, -1, 2, -2, 3, -3, 4],
  };

  // Initialize algorithm state
  const initializeAlgorithm = useCallback(() => {
    setCurrentIndex(-1);
    setCurrentSum(0);
    setMaxSum(Number.NEGATIVE_INFINITY);
    setMaxStart(0);
    setMaxEnd(0);
    setCurrentStart(0);
    setSteps([]);
    setCurrentStep(0);
    setIsCompleted(false);
  }, []);

  useEffect(() => {
    initializeAlgorithm();
  }, [array, initializeAlgorithm]);

  // Generate steps for the algorithm
  const generateSteps = useCallback(() => {
    const steps = [];
    let currentSum = 0;
    let maxSum = Number.NEGATIVE_INFINITY;
    let maxStart = 0;
    let maxEnd = 0;
    let currentStart = 0;

    for (let i = 0; i < array.length; i++) {
      const prevSum = currentSum;
      currentSum = Math.max(array[i], currentSum + array[i]);

      if (currentSum === array[i]) {
        currentStart = i;
      }

      if (currentSum > maxSum) {
        maxSum = currentSum;
        maxStart = currentStart;
        maxEnd = i;
      }

      steps.push({
        index: i,
        element: array[i],
        prevSum,
        currentSum,
        maxSum,
        maxStart,
        maxEnd,
        currentStart,
        decision: currentSum === array[i] ? "restart" : "continue",
      });
    }

    return steps;
  }, [array]);

  const animateStep = async (stepIndex) => {
    const step = steps[stepIndex];

    setCurrentIndex(step.index);
    setCurrentSum(step.currentSum);
    setMaxSum(step.maxSum);
    setMaxStart(step.maxStart);
    setMaxEnd(step.maxEnd);
    setCurrentStart(step.currentStart);
    setCurrentStep(stepIndex + 1);

    return new Promise((resolve) => {
      setTimeout(resolve, animationSpeed);
    });
  };

  const startAnimation = async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    initializeAlgorithm();

    const algorithmSteps = generateSteps();
    setSteps(algorithmSteps);

    await new Promise((resolve) => setTimeout(resolve, 500));

    for (let i = 0; i < algorithmSteps.length; i++) {
      await animateStep(i);
    }

    setIsCompleted(true);
    setIsAnimating(false);
  };

  const reset = () => {
    setIsAnimating(false);
    initializeAlgorithm();
  };

  const handleCustomArrayChange = (value) => {
    setCustomArray(value);
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed) && parsed.every((n) => typeof n === "number")) {
        setArray(parsed);
      }
    } catch (e) {
      console.log(e);
      // Invalid JSON, ignore
    }
  };

  const handlePresetChange = (preset) => {
    const newArray = presetArrays[preset];
    setArray(newArray);
    setCustomArray(JSON.stringify(newArray));
  };

  const getElementColor = (index) => {
    if (index === currentIndex) return "rgb(34, 197, 94)"; // green-500 (current)
    if (isCompleted && index >= maxStart && index <= maxEnd)
      return "rgb(59, 130, 246)"; // blue-500 (max subarray)
    if (index < currentIndex) return "rgb(82, 82, 91)"; // neutral-600 (processed)
    return "rgb(64, 64, 64)"; // neutral-700 (unprocessed)
  };

  const getElementBorder = (index) => {
    if (index === currentIndex) return "2px solid rgb(34, 197, 94)"; // green
    if (isCompleted && index >= maxStart && index <= maxEnd)
      return "2px solid rgb(59, 130, 246)"; // blue
    return "1px solid rgb(115, 115, 115)"; // neutral-500
  };

  const currentStepData = steps[currentStep - 1];

  return (
    <div className="min-h-screen max-w-7xl mx-auto w-full flex flex-col items-center justify-start gap-20 py-32 px-4 bg-neutral-900">
      <Header />

      {/* Animation */}
      <div className="bg-neutral-800 rounded-3xl p-8 border border-neutral-800 flex-1 w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-wide">
            Kadane's Algorithm
          </h1>
          <p className="text-neutral-300 text-lg">
            Maximum Subarray Sum: {isCompleted ? maxSum : currentSum} | Step:{" "}
            {currentStep} / {array.length}
          </p>
          {isCompleted && (
            <p className="text-blue-400 text-lg font-semibold mt-2">
              Max Subarray: indices {maxStart} to {maxEnd}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <label className="text-white font-medium">Preset:</label>
            <select
              onChange={(e) => handlePresetChange(e.target.value)}
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

          <div className="flex items-center gap-2">
            <label className="text-white font-medium">Array:</label>
            <input
              type="text"
              value={customArray}
              onChange={(e) => handleCustomArrayChange(e.target.value)}
              disabled={isAnimating}
              className="bg-neutral-800 text-white px-3 py-1 rounded-lg border border-neutral-600 focus:border-white focus:outline-none w-64"
              placeholder="[1, -3, 2, 1, -1]"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-white font-medium">Speed:</label>
            <select
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
              disabled={isAnimating}
              className="bg-neutral-800 text-white px-3 py-1 rounded-lg border border-neutral-600 focus:border-white focus:outline-none"
            >
              <option value={1500}>Slow</option>
              <option value={1000}>Medium</option>
              <option value={600}>Fast</option>
              <option value={300}>Very Fast</option>
            </select>
          </div>

          <button
            onClick={startAnimation}
            disabled={isAnimating}
            className="bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          >
            {isAnimating ? "Running..." : "Start"}
          </button>

          <button
            onClick={reset}
            disabled={isAnimating}
            className="bg-neutral-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          >
            Reset
          </button>
        </div>

        {/* Array Visualization */}
        <div className="bg-black p-10 rounded-2xl mb-8">
          <div className="flex justify-center items-center gap-2 mb-8 flex-wrap">
            {array.map((element, index) => (
              <div
                key={index}
                className="flex flex-col items-center transition-all duration-300"
                style={{
                  transform: index === currentIndex ? "scale(1.1)" : "scale(1)",
                }}
              >
                <div className="text-white text-xs mb-1">{index}</div>
                <div
                  className="w-16 h-16 flex items-center justify-center rounded-lg text-white font-bold text-lg transition-all duration-300"
                  style={{
                    backgroundColor: getElementColor(index),
                    border: getElementBorder(index),
                  }}
                >
                  {element}
                </div>
              </div>
            ))}
          </div>

          {/* Algorithm State */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-neutral-800 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Current Element</h3>
              <p className="text-2xl text-green-400 font-bold">
                {currentIndex >= 0 ? array[currentIndex] : "—"}
              </p>
            </div>

            <div className="bg-neutral-800 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Current Sum</h3>
              <p className="text-2xl text-blue-400 font-bold">{currentSum}</p>
            </div>

            <div className="bg-neutral-800 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Max Sum</h3>
              <p className="text-2xl text-purple-400 font-bold">
                {maxSum === Number.NEGATIVE_INFINITY ? "—" : maxSum}
              </p>
            </div>
          </div>

          {/* Step Details */}
          {currentStepData && (
            <div className="mt-6 bg-neutral-800 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-2">
                Step {currentStep} Details:
              </h3>
              <div className="text-neutral-300 space-y-1">
                <p>
                  Element:{" "}
                  <span className="text-green-400">
                    {currentStepData.element}
                  </span>
                </p>
                <p>
                  Previous sum:{" "}
                  <span className="text-blue-400">
                    {currentStepData.prevSum}
                  </span>
                </p>
                <p>
                  Decision:{" "}
                  <span className="text-yellow-400">
                    {currentStepData.decision === "restart"
                      ? `Start new subarray (${currentStepData.element} > ${currentStepData.prevSum} + ${currentStepData.element})`
                      : `Continue subarray (${currentStepData.prevSum} + ${currentStepData.element} = ${currentStepData.currentSum})`}
                  </span>
                </p>
                <p>
                  Current sum:{" "}
                  <span className="text-blue-400">
                    {currentStepData.currentSum}
                  </span>
                </p>
                <p>
                  Max sum so far:{" "}
                  <span className="text-purple-400">
                    {currentStepData.maxSum}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-neutral-700 rounded-full h-2 mb-4">
          <div
            className="bg-gradient-to-r from-white to-neutral-300 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / array.length) * 100}%` }}
          />
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 text-sm text-neutral-300 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-neutral-700 border border-neutral-500"></div>
            <span>Unprocessed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500 border-2 border-green-500"></div>
            <span>Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-neutral-600"></div>
            <span>Processed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500 border-2 border-blue-500"></div>
            <span>Max Subarray</span>
          </div>
        </div>

        {/* Algorithm Explanation */}
        <div className="text-center text-neutral-300 text-sm">
          <p>At each step: current_sum = max(element, current_sum + element)</p>
          <p className="mt-1 opacity-70">
            Time Complexity: O(n) | Space Complexity: O(1)
          </p>
        </div>
      </div>

      {/* Description */}
      <Card className="w-full bg-neutral-800 text-white border-none shadow-none">
        <CardHeader>
          <CardTitle>Kadane's Algorithm</CardTitle>
          <CardDescription className="text-neutral-400">
            Finding the maximum sum of a contiguous subarray
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-300 leading-relaxed mb-4">
            Kadane's algorithm is a dynamic programming approach to solve the
            maximum subarray problem in linear time. The algorithm maintains two
            variables: the maximum sum ending at the current position and the
            maximum sum seen so far.
          </p>
          <p className="text-neutral-300 leading-relaxed">
            At each step, we decide whether to extend the existing subarray or
            start a new one. If the current element is greater than the sum of
            the current element plus the previous sum, we start fresh from the
            current element. Otherwise, we extend the existing subarray.
          </p>
        </CardContent>
        <CardFooter>
          <p className="text-neutral-400 text-sm">
            Named after Jay Kadane, who popularized this elegant solution to the
            maximum subarray problem.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default KadanesAlgorithm;
