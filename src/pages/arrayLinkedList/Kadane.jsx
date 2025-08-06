import { useState, useEffect, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ShadCNHeader as Header } from "../../components/Header/ShadCNNav";
import SpeedControls from "../../components/utils/SpeedControl";
import Description from "../../components/utils/Description";
import SEOData from "../../components/SEO";

function KadanesAlgorithm() {
  const generateRandomArray = () => {
    const length = Math.floor(Math.random() * 3) + 8; // Length between 8 and 10
    const arr = Array.from({ length }, () => {
      const val = Math.floor(Math.random() * 21) - 10; // Values between -10 and +10
      return val === 0 ? 1 : val; // Replace 0 if you want to avoid it
    });
    return arr;
  };

  const testArrays = [
    { name: "Example 1", array: [-2, 1, -3, 4, -1, 2, 1, -5, 4] },
    { name: "Example 2", array: [5, -3, 2, -1, 6, -2, 1] },
    { name: "All Negative", array: [-5, -2, -8, -1, -4] },
    { name: "Mixed", array: [1, -3, 2, 1, -1, 3, -2, 4] },
    { name: "Simple", array: [2, -1, 3, -2, 5] },
    { name: "Random", array: generateRandomArray() },
  ];

  // state variables
  const [selectedArray, setSelectedArray] = useState(testArrays[0]);
  const [currentArray, setCurrentArray] = useState(testArrays[0].array);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentSum, setCurrentSum] = useState(0);
  const [maxSum, setMaxSum] = useState(Number.NEGATIVE_INFINITY);
  const [maxStart, setMaxStart] = useState(0);
  const [maxEnd, setMaxEnd] = useState(0);
  const [currentStart, setCurrentStart] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [isComplete, setIsComplete] = useState(false);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [navigationMode, setNavigationMode] = useState(false);

  // initialize algorithm
  const initializeAlgorithm = useCallback(() => {
    setCurrentIndex(-1);
    setCurrentSum(0);
    setMaxSum(Number.NEGATIVE_INFINITY);
    setMaxStart(0);
    setMaxEnd(0);
    setCurrentStart(0);
    setIsComplete(false);
    setCurrentStep(0);
    setNavigationMode(false);

    // generating steps
    const algorithmSteps = [];
    let tempCurrentSum = 0;
    let tempMaxSum = Number.NEGATIVE_INFINITY;
    let tempMaxStart = 0;
    let tempMaxEnd = 0;
    let tempCurrentStart = 0;

    for (let i = 0; i < currentArray.length; i++) {
      const element = currentArray[i];

      // current sum becomes negative -> start new subarray
      if (tempCurrentSum < 0) {
        tempCurrentSum = element;
        tempCurrentStart = i;
      } else {
        tempCurrentSum += element;
      }

      // if current sum is greater -> update maximum
      if (tempCurrentSum > tempMaxSum) {
        tempMaxSum = tempCurrentSum;
        tempMaxStart = tempCurrentStart;
        tempMaxEnd = i;
      }

      algorithmSteps.push({
        index: i,
        element: element,
        currentSum: tempCurrentSum,
        maxSum: tempMaxSum,
        maxStart: tempMaxStart,
        maxEnd: tempMaxEnd,
        currentStart: tempCurrentStart,
        action:
          tempCurrentSum === element && i !== tempCurrentStart
            ? "restart"
            : "add",
      });
    }

    setSteps(algorithmSteps);
  }, [currentArray]);

  // Navigate to specific step
  const goToStep = useCallback(
    (stepIndex) => {
      if (stepIndex < 0 || stepIndex >= steps.length) return;

      const step = steps[stepIndex];
      setCurrentIndex(step.index);
      setCurrentSum(step.currentSum);
      setMaxSum(step.maxSum);
      setMaxStart(step.maxStart);
      setMaxEnd(step.maxEnd);
      setCurrentStart(step.currentStart);
      setCurrentStep(stepIndex + 1);
    },
    [steps],
  );

  // Navigate to previous step
  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      goToStep(currentStep - 2);
    }
  }, [currentStep, goToStep]);

  // Navigate to next step
  const goToNextStep = useCallback(() => {
    if (currentStep < steps.length) {
      goToStep(currentStep);
    }
  }, [currentStep, steps.length, goToStep]);

  // Start animation
  const startAnimation = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    setNavigationMode(false);
    setCurrentIndex(-1);
    setCurrentSum(0);
    setMaxSum(Number.NEGATIVE_INFINITY);
    setMaxStart(0);
    setMaxEnd(0);
    setCurrentStart(0);
    setIsComplete(false);
    setCurrentStep(0);

    let stepIndex = 0;
    const animate = () => {
      if (stepIndex >= steps.length) {
        setIsComplete(true);
        setIsAnimating(false);
        setNavigationMode(true);
        return;
      }

      const step = steps[stepIndex];
      setCurrentIndex(step.index);
      setCurrentSum(step.currentSum);
      setMaxSum(step.maxSum);
      setMaxStart(step.maxStart);
      setMaxEnd(step.maxEnd);
      setCurrentStart(step.currentStart);
      setCurrentStep(stepIndex + 1);

      stepIndex++;
      setTimeout(animate, animationSpeed);
    };

    setTimeout(animate, animationSpeed);
  }, [isAnimating, steps, animationSpeed]);

  // reset animation
  const reset = useCallback(() => {
    setIsAnimating(false);
    setNavigationMode(false);
    initializeAlgorithm();
  }, [initializeAlgorithm]);

  // array selection handling
  const handleArrayChange = (value) => {
    const selected = testArrays.find((arr) => arr.name === value);
    setSelectedArray(selected);
    setCurrentArray(selected.array);
    setIsAnimating(false);
    setNavigationMode(false);
  };

  useEffect(() => {
    initializeAlgorithm();
  }, [initializeAlgorithm]);

  // element styling
  const getElementStyle = (index) => {
    let baseStyle =
      "flex items-center justify-center w-16 h-16 rounded-lg text-white font-bold text-lg transition-all duration-500 transform ";

    if (index === currentIndex) {
      baseStyle +=
        "bg-yellow-500 scale-110 shadow-lg border-2 border-yellow-300 ";
    } else if (
      index >= maxStart &&
      index <= maxEnd &&
      maxSum > Number.NEGATIVE_INFINITY
    ) {
      baseStyle += "bg-green-600 scale-105 shadow-md ";
    } else if (
      index >= currentStart &&
      index <= currentIndex &&
      currentSum > 0
    ) {
      baseStyle += "bg-blue-600 ";
    } else if (currentArray[index] >= 0) {
      baseStyle += "bg-neutral-600 ";
    } else {
      baseStyle += "bg-rose-800 ";
    }

    return baseStyle;
  };

  const descriptionData = {
    heading: "Kadane's Algorithm",
    subheading: "Maximum Subarray Sum",
    summary:
      "Kadane's algorithm efficiently finds the maximum sum of a contiguous subarray in O(n) time complexity using dynamic programming principles. The algorithm maintains two variables: the maximum sum ending at the current position and the overall maximum sum found so far.",
    lang: "python",
    code: `def kadanes_algorithm(arr):
    current_sum = 0
    max_sum = float('-inf')
    start = 0
    end = 0
    temp_start = 0

    for i in range(len(arr)):
        current_sum += arr[i]

        if current_sum > max_sum:
            max_sum = current_sum
            start = temp_start
            end = i

        if current_sum < 0:
            current_sum = 0
            temp_start = i + 1

    return max_sum, start, end`,
  };

  const seoData = {
    title: "Kadane's Algorithm Animation - Maximum Subarray Sum",
    description:
      "Interactive visualization of Kadane's algorithm for finding maximum subarray sum with step-by-step animation and detailed explanations.",
    canonical: "/algorithms/kadanes-algorithm",
    noIndex: false,
    openGraph: {
      title: "Kadane's Algorithm Animation",
      description: "Learn Kadane's algorithm through interactive visualization",
      url: "/algorithms/kadanes-algorithm",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: "Kadane's Algorithm Animation",
      description:
        "Interactive visualization of maximum subarray sum algorithm",
    },
    schema: {
      "@context": "https://schema.org",
      "@type": "Article",
      name: "Kadane's Algorithm Animation",
      description:
        "Interactive visualization of Kadane's algorithm for finding maximum subarray sum",
    },
  };

  return (
    <>
      <SEOData data={seoData} />

      <div className="min-h-screen max-w-7xl mx-auto w-full flex flex-col items-center justify-start gap-20 py-32 px-0 bg-neutral-900">
        <Header />

        {/* Animation */}
        <div className="bg-neutral-800 rounded-lg p-8 border border-neutral-800 w-full">
          {/* Animation Heading */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 tracking-wide">
              Kadane's Algorithm
            </h1>
            <p className="text-neutral-300 text-lg">
              Step: {currentStep} / {steps.length} | Maximum Sum:{" "}
              {maxSum === Number.NEGATIVE_INFINITY ? "Not found" : maxSum}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <label className="text-white text-sm font-medium">Array:</label>
              <Select
                value={selectedArray.name}
                onValueChange={handleArrayChange}
              >
                <SelectTrigger className="w-40 bg-neutral-700 border-neutral-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-700 border-neutral-600">
                  {testArrays.map((arr) => (
                    <SelectItem
                      key={arr.name}
                      value={arr.name}
                      className="text-white hover:bg-neutral-600"
                    >
                      {arr.name}
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
              className="bg-white text-black px-6 py-2 rounded-sm font-semibold hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {isAnimating ? "Running..." : "Start"}
            </button>

            <button
              onClick={reset}
              disabled={isAnimating}
              className="bg-neutral-700 text-white px-6 py-2 rounded-sm font-semibold hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              Reset
            </button>
          </div>

          {/* steps */}
          {navigationMode && (
            <div className="flex justify-center items-center gap-4 mb-8">
              <button
                onClick={goToPreviousStep}
                disabled={currentStep <= 1}
                className="flex items-center gap-2 bg-neutral-700 text-white px-4 py-2 rounded-sm font-semibold hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="text-white text-sm bg-neutral-700 px-4 py-2 rounded-sm">
                Step {currentStep} of {steps.length}
              </div>

              <button
                onClick={goToNextStep}
                disabled={currentStep >= steps.length}
                className="flex items-center gap-2 bg-neutral-700 text-white px-4 py-2 rounded-sm font-semibold hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* Array Visualization */}
          <div className="flex justify-center items-center gap-3 mb-8 bg-black p-10 rounded-lg min-h-[200px] flex-wrap">
            {currentArray.map((element, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className={getElementStyle(index)}>{element}</div>
                <div className="text-neutral-400 text-sm">{index}</div>
              </div>
            ))}
          </div>

          {/* Algorithm State */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 text-white">
            <div className="bg-neutral-700 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Current Index</h3>
              <p className="text-2xl font-bold">
                {currentIndex === -1 ? "Start" : currentIndex}
              </p>
            </div>
            <div className="bg-neutral-700 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Current Sum</h3>
              <p className="text-2xl font-bold">{currentSum}</p>
            </div>
            <div className="bg-neutral-700 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Maximum Sum</h3>
              <p className="text-2xl font-bold">
                {maxSum === Number.NEGATIVE_INFINITY ? "N/A" : maxSum}
              </p>
            </div>
            <div className="bg-neutral-700 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Max Subarray</h3>
              <p className="text-lg font-bold">
                {maxSum === Number.NEGATIVE_INFINITY
                  ? "N/A"
                  : `[${maxStart}, ${maxEnd}]`}
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="size-3 bg-yellow-500 rounded-full"></div>
              <span className="text-neutral-300 text-sm">Current Element</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 bg-blue-600 rounded-full"></div>
              <span className="text-neutral-300 text-sm">Current Subarray</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 bg-green-600 rounded-full"></div>
              <span className="text-neutral-300 text-sm">Maximum Subarray</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 bg-rose-800 rounded-full"></div>
              <span className="text-neutral-300 text-sm">Negative Numbers</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-neutral-700 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-white to-neutral-300 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${steps.length > 0 ? (currentStep / steps.length) * 100 : 0}%`,
              }}
            />
          </div>

          {/* Algorithm Info */}
          <div className="text-center text-neutral-300 text-sm">
            <p className="mb-2">
              <strong>Time Complexity:</strong> O(n) |{" "}
              <strong>Space Complexity:</strong> O(1)
            </p>
            <p className="opacity-70">
              Kadane's algorithm uses dynamic programming to find the maximum
              sum contiguous subarray efficiently
            </p>
          </div>

          {/* Current Step Info */}
          {currentIndex >= 0 && (
            <div className="mt-6 bg-neutral-700 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-2">
                Current Step Analysis:
              </h3>
              <div className="text-neutral-300 text-sm space-y-1">
                <p>
                  • Processing element:
                  <span className="">{currentArray[currentIndex]}</span> at
                  index {currentIndex}
                </p>
                <p>
                  • Current subarray sum: <span className="">{currentSum}</span>
                </p>
                <p>
                  • Maximum sum so far: <span className="">{maxSum}</span>
                </p>
                {currentSum < 0 && currentIndex < currentArray.length - 1 && (
                  <p className="">
                    • Current sum is negative, will restart from next element
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <Description dataObj={descriptionData} />
      </div>
    </>
  );
}

export default KadanesAlgorithm;
