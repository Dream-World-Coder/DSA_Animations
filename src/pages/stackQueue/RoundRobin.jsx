import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  RotateCcw,
  Plus,
  Clock,
} from "lucide-react";
import { ShadCNHeader as Header } from "../../components/Header/ShadCNNav";
import SpeedControls from "../../components/utils/SpeedControl";
import Description from "../../components/utils/Description";
import SEOData from "../../components/SEO";

export default function RoundRobin() {
  const [processes, setProcesses] = useState([
    {
      id: "P1",
      burstTime: 10,
      remainingTime: 10,
      arrivalTime: 0,
      waitingTime: 0,
      turnaroundTime: 0,
      completionTime: 0,
    },
    {
      id: "P2",
      burstTime: 5,
      remainingTime: 5,
      arrivalTime: 1,
      waitingTime: 0,
      turnaroundTime: 0,
      completionTime: 0,
    },
    {
      id: "P3",
      burstTime: 8,
      remainingTime: 8,
      arrivalTime: 2,
      waitingTime: 0,
      turnaroundTime: 0,
      completionTime: 0,
    },
    {
      id: "P4",
      burstTime: 3,
      remainingTime: 3,
      arrivalTime: 3,
      waitingTime: 0,
      turnaroundTime: 0,
      completionTime: 0,
    },
  ]);
  const [timeQuantum, setTimeQuantum] = useState(4);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [animationSteps, setAnimationSteps] = useState([]);
  const [showStepControls, setShowStepControls] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [readyQueue, setReadyQueue] = useState([]);
  const [currentProcess, setCurrentProcess] = useState(null);
  const [ganttChart, setGanttChart] = useState([]);
  const [completedProcesses, setCompletedProcesses] = useState([]);
  const [message, setMessage] = useState("");
  const [timeSliceUsed, setTimeSliceUsed] = useState(0);

  const seoData = {
    title: "Round Robin CPU Scheduling - Algorithm Visualizer",
    description:
      "Interactive visualization of Round Robin CPU scheduling algorithm with time quantum and process management.",
    canonical: "/scheduling/round-robin",
    openGraph: {
      title: "Round Robin Scheduling Visualization",
      description:
        "Learn CPU scheduling with Round Robin algorithm through interactive animations",
      url: "/scheduling/round-robin",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: "Round Robin Scheduling",
      description: "Interactive Round Robin CPU scheduling visualization",
    },
  };

  const generateRoundRobinSteps = () => {
    const steps = [];
    let time = 0;
    let processesState = processes.map((p) => ({
      ...p,
      remainingTime: p.burstTime,
    }));
    let queue = [];
    let completed = [];
    let gantt = [];
    let arrivedProcesses = new Set();

    steps.push({
      time: 0,
      queue: [],
      currentProcess: null,
      processesState: [...processesState],
      ganttChart: [],
      completedProcesses: [],
      timeSliceUsed: 0,
      message:
        "Round Robin scheduling started with time quantum = " + timeQuantum,
    });

    while (completed.length < processes.length) {
      // Add newly arrived processes to queue
      processesState.forEach((process) => {
        if (
          process.arrivalTime <= time &&
          !arrivedProcesses.has(process.id) &&
          process.remainingTime > 0
        ) {
          queue.push(process.id);
          arrivedProcesses.add(process.id);
          steps.push({
            time: time,
            queue: [...queue],
            currentProcess: null,
            processesState: [...processesState],
            ganttChart: [...gantt],
            completedProcesses: [...completed],
            timeSliceUsed: 0,
            message: `Process ${process.id} arrived and added to ready queue`,
          });
        }
      });

      if (queue.length === 0) {
        time++;
        steps.push({
          time: time,
          queue: [],
          currentProcess: null,
          processesState: [...processesState],
          ganttChart: [...gantt],
          completedProcesses: [...completed],
          timeSliceUsed: 0,
          message: `CPU idle at time ${time} - waiting for processes`,
        });
        continue;
      }

      // Get next process from queue
      const currentProcessId = queue.shift();
      const currentProc = processesState.find((p) => p.id === currentProcessId);

      steps.push({
        time: time,
        queue: [...queue],
        currentProcess: currentProcessId,
        processesState: [...processesState],
        ganttChart: [...gantt],
        completedProcesses: [...completed],
        timeSliceUsed: 0,
        message: `Process ${currentProcessId} selected from ready queue (Remaining: ${currentProc.remainingTime})`,
      });

      // Execute for time quantum or until completion
      const executeTime = Math.min(timeQuantum, currentProc.remainingTime);

      for (let slice = 1; slice <= executeTime; slice++) {
        time++;
        currentProc.remainingTime--;

        // Add newly arrived processes during execution
        processesState.forEach((process) => {
          if (
            process.arrivalTime <= time &&
            !arrivedProcesses.has(process.id) &&
            process.remainingTime > 0 &&
            process.id !== currentProcessId
          ) {
            queue.push(process.id);
            arrivedProcesses.add(process.id);
          }
        });

        steps.push({
          time: time,
          queue: [...queue],
          currentProcess: currentProcessId,
          processesState: [...processesState],
          ganttChart: [...gantt],
          completedProcesses: [...completed],
          timeSliceUsed: slice,
          message: `Process ${currentProcessId} executing... Time slice used: ${slice}/${executeTime}`,
        });
      }

      // Update Gantt chart
      gantt.push({
        processId: currentProcessId,
        startTime: time - executeTime,
        endTime: time,
        color: getProcessColor(currentProcessId),
      });

      if (currentProc.remainingTime === 0) {
        // Process completed
        currentProc.completionTime = time;
        currentProc.turnaroundTime =
          currentProc.completionTime - currentProc.arrivalTime;
        currentProc.waitingTime =
          currentProc.turnaroundTime - currentProc.burstTime;
        completed.push(currentProc);

        steps.push({
          time: time,
          queue: [...queue],
          currentProcess: null,
          processesState: [...processesState],
          ganttChart: [...gantt],
          completedProcesses: [...completed],
          timeSliceUsed: 0,
          message: `Process ${currentProcessId} completed! TAT: ${currentProc.turnaroundTime}, WT: ${currentProc.waitingTime}`,
        });
      } else {
        // Process preempted, add back to queue
        queue.push(currentProcessId);
        steps.push({
          time: time,
          queue: [...queue],
          currentProcess: null,
          processesState: [...processesState],
          ganttChart: [...gantt],
          completedProcesses: [...completed],
          timeSliceUsed: 0,
          message: `Process ${currentProcessId} preempted (time quantum expired), added back to queue`,
        });
      }
    }

    const avgWaitingTime =
      completed.reduce((sum, p) => sum + p.waitingTime, 0) / completed.length;
    const avgTurnaroundTime =
      completed.reduce((sum, p) => sum + p.turnaroundTime, 0) /
      completed.length;

    steps.push({
      time: time,
      queue: [],
      currentProcess: null,
      processesState: [...processesState],
      ganttChart: [...gantt],
      completedProcesses: [...completed],
      timeSliceUsed: 0,
      message: `All processes completed! Avg WT: ${avgWaitingTime.toFixed(2)}, Avg TAT: ${avgTurnaroundTime.toFixed(2)}`,
    });

    return steps;
  };

  const getProcessColor = (processId) => {
    const colors = {
      P1: "bg-red-500",
      P2: "bg-blue-500",
      P3: "bg-green-500",
      P4: "bg-yellow-500",
      P5: "bg-purple-500",
      P6: "bg-pink-500",
      P7: "bg-indigo-500",
      P8: "bg-orange-500",
    };
    return colors[processId] || "bg-gray-500";
  };

  const startAnimation = () => {
    const steps = generateRoundRobinSteps();

    setAnimationSteps(steps);
    setTotalSteps(steps.length);
    setCurrentStep(0);
    setIsAnimating(true);
    setShowStepControls(false);

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        const step = steps[stepIndex];

        setCurrentTime(step.time);
        setReadyQueue(step.queue);
        setCurrentProcess(step.currentProcess);
        setProcesses(step.processesState);
        setGanttChart(step.ganttChart);
        setCompletedProcesses(step.completedProcesses);
        setTimeSliceUsed(step.timeSliceUsed);
        setMessage(step.message);
        setCurrentStep(stepIndex + 1);

        stepIndex++;
      } else {
        clearInterval(interval);
        setIsAnimating(false);
        setShowStepControls(true);
      }
    }, animationSpeed);
  };

  const reset = () => {
    setProcesses([
      {
        id: "P1",
        burstTime: 10,
        remainingTime: 10,
        arrivalTime: 0,
        waitingTime: 0,
        turnaroundTime: 0,
        completionTime: 0,
      },
      {
        id: "P2",
        burstTime: 5,
        remainingTime: 5,
        arrivalTime: 1,
        waitingTime: 0,
        turnaroundTime: 0,
        completionTime: 0,
      },
      {
        id: "P3",
        burstTime: 8,
        remainingTime: 8,
        arrivalTime: 2,
        waitingTime: 0,
        turnaroundTime: 0,
        completionTime: 0,
      },
      {
        id: "P4",
        burstTime: 3,
        remainingTime: 3,
        arrivalTime: 3,
        waitingTime: 0,
        turnaroundTime: 0,
        completionTime: 0,
      },
    ]);
    setCurrentTime(0);
    setReadyQueue([]);
    setCurrentProcess(null);
    setGanttChart([]);
    setCompletedProcesses([]);
    setTimeSliceUsed(0);
    setMessage("");
    setCurrentStep(0);
    setTotalSteps(0);
    setShowStepControls(false);
  };

  const addProcess = () => {
    if (isAnimating) return;
    const newId = `P${processes.length + 1}`;
    const newProcess = {
      id: newId,
      burstTime: Math.floor(Math.random() * 10) + 3,
      remainingTime: 0,
      arrivalTime: Math.floor(Math.random() * 5),
      waitingTime: 0,
      turnaroundTime: 0,
      completionTime: 0,
    };
    newProcess.remainingTime = newProcess.burstTime;
    setProcesses([...processes, newProcess]);
    setMessage(
      `Added ${newId} with burst time ${newProcess.burstTime} and arrival time ${newProcess.arrivalTime}`,
    );
  };

  const navigateStep = (direction) => {
    const newStep = currentStep + direction;
    if (newStep >= 0 && newStep < animationSteps.length) {
      setCurrentStep(newStep);
      const step = animationSteps[newStep];

      setCurrentTime(step.time);
      setReadyQueue(step.queue);
      setCurrentProcess(step.currentProcess);
      setProcesses(step.processesState);
      setGanttChart(step.ganttChart);
      setCompletedProcesses(step.completedProcesses);
      setTimeSliceUsed(step.timeSliceUsed);
      setMessage(step.message);
    }
  };

  const descriptionData = {
    heading: "Round Robin CPU Scheduling",
    subheading:
      "Preemptive scheduling with fixed time quantum for fair CPU allocation",
    summary:
      "Round Robin is a preemptive CPU scheduling algorithm where each process gets a fixed time slice (quantum). When a process's time quantum expires, it's moved to the back of the ready queue. This ensures fair CPU allocation and prevents starvation, making it ideal for time-sharing systems.",
    lang: "javascript",
    code: `function roundRobin(processes, timeQuantum) {
  let queue = [];
  let time = 0;
  let completed = [];

  while (completed.length < processes.length) {
    // Add arrived processes to queue
    processes.forEach(p => {
      if (p.arrivalTime <= time && p.remainingTime > 0) {
        queue.push(p);
      }
    });

    if (queue.length === 0) {
      time++; // CPU idle
      continue;
    }

    // Execute current process
    let current = queue.shift();
    let executeTime = Math.min(timeQuantum, current.remainingTime);

    current.remainingTime -= executeTime;
    time += executeTime;

    if (current.remainingTime === 0) {
      current.completionTime = time;
      current.turnaroundTime = time - current.arrivalTime;
      current.waitingTime = current.turnaroundTime - current.burstTime;
      completed.push(current);
    } else {
      queue.push(current); // Preempt and add back
    }
  }

  return completed;
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
              Round Robin CPU Scheduling
            </h1>
            <p className="text-neutral-300 text-lg">
              Current Time: {currentTime} | Time Quantum: {timeQuantum} |
              Processes: {processes.length}
            </p>
            {message && (
              <p className="text-lime-400 text-sm mt-2 font-medium">
                {message}
              </p>
            )}
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white" />
              <label className="text-white text-sm">Time Quantum:</label>
              <input
                type="number"
                value={timeQuantum}
                onChange={(e) =>
                  setTimeQuantum(Math.max(1, parseInt(e.target.value) || 1))
                }
                disabled={isAnimating}
                className="bg-neutral-700 text-white px-3 py-1 rounded-md w-16 border border-neutral-600 focus:border-lime-400 focus:outline-none"
                min="1"
              />
            </div>

            <SpeedControls
              animationSpeed={animationSpeed}
              setAnimationSpeed={setAnimationSpeed}
              isAnimating={isAnimating}
            />

            <button
              onClick={startAnimation}
              disabled={isAnimating || processes.length === 0}
              className="bg-gradient-to-r from-lime-500 to-green-500 text-black px-6 py-2 rounded-md font-semibold hover:from-lime-400 hover:to-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {isAnimating ? "Running..." : "Start Scheduling"}
            </button>

            <button
              onClick={addProcess}
              disabled={isAnimating}
              className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Process
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

          {/* Visualization */}
          <div className="space-y-6">
            {/* Current Process & Ready Queue */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CPU */}
              <div className="bg-black p-6 rounded-lg border-2 border-lime-400">
                <h3 className="text-lime-400 text-lg font-semibold mb-4 text-center">
                  CPU
                </h3>
                <div className="flex justify-center items-center min-h-[80px]">
                  {currentProcess ? (
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-lg ${getProcessColor(currentProcess)} shadow-lg`}
                      >
                        {currentProcess}
                      </div>
                      <div className="text-lime-400 text-sm">
                        {timeSliceUsed}/
                        {Math.min(
                          timeQuantum,
                          processes.find((p) => p.id === currentProcess)
                            ?.remainingTime || 0,
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-neutral-400 text-lg">Idle</div>
                  )}
                </div>
              </div>

              {/* Ready Queue */}
              <div className="bg-black p-6 rounded-lg border border-neutral-600">
                <h3 className="text-white text-lg font-semibold mb-4 text-center">
                  Ready Queue
                </h3>
                <div className="flex justify-center items-center gap-2 min-h-[80px] flex-wrap">
                  {readyQueue.map((processId, index) => (
                    <div
                      key={`queue-${processId}-${index}`}
                      className="flex flex-col items-center gap-1"
                    >
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm ${getProcessColor(processId)} shadow-md`}
                      >
                        {processId}
                      </div>
                      <div className="text-neutral-400 text-xs">{index}</div>
                    </div>
                  ))}
                  {readyQueue.length === 0 && (
                    <div className="text-neutral-400">Empty</div>
                  )}
                </div>
              </div>
            </div>

            {/* Process Table */}
            <div className="bg-black p-6 rounded-lg">
              <h3 className="text-white text-lg font-semibold mb-4 text-center">
                Process Information
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-600">
                      <th className="text-white py-2 px-3 text-left">
                        Process
                      </th>
                      <th className="text-white py-2 px-3 text-center">
                        Arrival
                      </th>
                      <th className="text-white py-2 px-3 text-center">
                        Burst
                      </th>
                      <th className="text-white py-2 px-3 text-center">
                        Remaining
                      </th>
                      <th className="text-white py-2 px-3 text-center">
                        Completion
                      </th>
                      <th className="text-white py-2 px-3 text-center">TAT</th>
                      <th className="text-white py-2 px-3 text-center">WT</th>
                      <th className="text-white py-2 px-3 text-center">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {processes.map((process) => (
                      <tr
                        key={process.id}
                        className="border-b border-neutral-700"
                      >
                        <td className="py-2 px-3">
                          <div
                            className={`w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm ${getProcessColor(process.id)}`}
                          >
                            {process.id}
                          </div>
                        </td>
                        <td className="text-neutral-300 py-2 px-3 text-center">
                          {process.arrivalTime}
                        </td>
                        <td className="text-neutral-300 py-2 px-3 text-center">
                          {process.burstTime}
                        </td>
                        <td className="text-neutral-300 py-2 px-3 text-center">
                          {process.remainingTime}
                        </td>
                        <td className="text-neutral-300 py-2 px-3 text-center">
                          {process.completionTime || "-"}
                        </td>
                        <td className="text-neutral-300 py-2 px-3 text-center">
                          {process.turnaroundTime || "-"}
                        </td>
                        <td className="text-neutral-300 py-2 px-3 text-center">
                          {process.waitingTime || "-"}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              process.remainingTime === 0
                                ? "bg-green-600 text-white"
                                : process.id === currentProcess
                                  ? "bg-lime-600 text-black"
                                  : readyQueue.includes(process.id)
                                    ? "bg-blue-600 text-white"
                                    : "bg-neutral-600 text-white"
                            }`}
                          >
                            {process.remainingTime === 0
                              ? "Done"
                              : process.id === currentProcess
                                ? "Running"
                                : readyQueue.includes(process.id)
                                  ? "Ready"
                                  : "Waiting"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Gantt Chart */}
            {ganttChart.length > 0 && (
              <div className="bg-black p-6 rounded-lg">
                <h3 className="text-white text-lg font-semibold mb-4 text-center">
                  Gantt Chart
                </h3>
                <div className="flex items-center justify-start gap-1 overflow-x-auto pb-2">
                  {ganttChart.map((segment, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center gap-1 min-w-max"
                    >
                      <div
                        className={`${segment.color} text-white px-3 py-2 rounded text-sm font-semibold min-w-[60px] text-center`}
                      >
                        {segment.processId}
                      </div>
                      <div className="text-neutral-400 text-xs">
                        {segment.startTime}-{segment.endTime}
                      </div>
                    </div>
                  ))}
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
              Preemptive scheduling with time quantum = {timeQuantum} | Fair CPU
              allocation
            </p>
            <p className="mt-1 opacity-70">
              Prevents starvation and provides good response time for
              interactive systems
            </p>
          </div>
        </div>

        <Description dataObj={descriptionData} />
      </div>
    </>
  );
}
