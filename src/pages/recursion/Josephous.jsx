import { useState, useEffect, useCallback, memo } from "react";
import { ShadCNHeader as Header } from "../../components/Header/ShadCNNav";
import Description from "../../components/utils/Description";
import SpeedControls from "../../components/utils/SpeedControl";
import SEOData from "../../components/SEO";

const JosephusProblem = memo(function JosephusProblem() {
  const [n, setN] = useState(7); // number of people
  const [k, setK] = useState(3); // step size
  const [people, setPeople] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [eliminationOrder, setEliminationOrder] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [survivor, setSurvivor] = useState(null);

  const descriptionData = {
    heading: `The Josephus Problem`,
    subheading: `A classic problem in mathematics and computer science`,
    summary: `<p className="text-neutral-300 leading-relaxed">
    The Josephus problem is a theoretical problem related to a certain
    counting-out game. People are standing in a circle waiting to be
    executed. Counting begins at a specified point in the circle and
    proceeds around the circle in a specified direction. After a specified
    number of people are skipped, the next person is executed. The
    procedure is repeated with the remaining people, starting after the
    person who was just executed, until only one person remains, and is
    freed.</p>`,
    history: `Named after Flavius Josephus, a Jewish historian who lived in the 1st century.`,
    lang: "python",
    code: `
    # recursive
    def josephus(n, k):
      if n == 1:
        return 0
      return (josephus(n - 1, k) + k) % n

    # iterative
    def josephus(n, k):
      res = 0
      for i in range(2, n + 1):
        res = (res + k) % i
      return res  # 0-based
    `,
  };
  const seoData = {
    title: descriptionData.heading,
  };

  // Initialize people
  const initializePeople = useCallback((numPeople) => {
    const newPeople = Array.from({ length: numPeople }, (_, i) => ({
      id: i + 1,
      eliminated: false,
      isActive: false,
      isTarget: false,
    }));
    setPeople(newPeople);
    setCurrentPosition(0);
    setEliminationOrder([]);
    setCurrentStep(0);
    setSurvivor(null);
  }, []);

  useEffect(() => {
    initializePeople(n);
  }, [n, initializePeople]);

  // Calculate survivor using the mathematical formula
  const calculateSurvivor = (n, k) => {
    if (n === 1) return 0;
    return (calculateSurvivor(n - 1, k) + k) % n;
  };

  const animateStep = async (targetIndex, eliminatedPerson) => {
    // Highlight the counting process
    const alivePeople = people.filter((p) => !p.eliminated);

    return new Promise((resolve) => {
      let currentIndex = currentPosition;
      let count = 0;

      const highlightInterval = setInterval(() => {
        setPeople((prevPeople) =>
          prevPeople.map((person, index) => ({
            ...person,
            isActive: index === currentIndex && !person.eliminated,
            isTarget: false,
          })),
        );

        // Find next alive person
        do {
          currentIndex = (currentIndex + 1) % people.length;
        } while (people[currentIndex].eliminated);

        count++;

        if (count >= k) {
          clearInterval(highlightInterval);

          // Mark target for elimination
          setPeople((prevPeople) =>
            prevPeople.map((person, index) => ({
              ...person,
              isActive: false,
              isTarget: index === targetIndex,
            })),
          );

          setTimeout(() => {
            // Eliminate the person
            setPeople((prevPeople) =>
              prevPeople.map((person, index) => ({
                ...person,
                eliminated: person.eliminated ? true : index === targetIndex,
                isTarget: false,
              })),
            );

            setEliminationOrder((prev) => [...prev, eliminatedPerson]);
            setCurrentStep((prev) => prev + 1);
            setCurrentPosition(currentIndex);
            resolve();
          }, animationSpeed / 2);
        }
      }, animationSpeed / k);
    });
  };

  const startAnimation = async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    initializePeople(n);
    await new Promise((resolve) => setTimeout(resolve, 500));

    let currentPeople = Array.from({ length: n }, (_, i) => i);
    let pos = 0;

    for (let round = 0; round < n - 1; round++) {
      pos = (pos + k - 1) % currentPeople.length;
      const eliminatedPerson = currentPeople[pos] + 1; // +1 for 1-based indexing

      await animateStep(currentPeople[pos], eliminatedPerson);

      currentPeople.splice(pos, 1);
      if (pos === currentPeople.length) pos = 0;

      await new Promise((resolve) => setTimeout(resolve, animationSpeed / 2));
    }

    // Show survivor
    const survivorIndex = calculateSurvivor(n, k);
    setSurvivor(survivorIndex + 1); // +1 for 1-based indexing

    setPeople((prevPeople) =>
      prevPeople.map((person, index) => ({
        ...person,
        isActive: index === survivorIndex && !person.eliminated,
      })),
    );

    setIsAnimating(false);
  };

  const reset = () => {
    setIsAnimating(false);
    initializePeople(n);
  };

  const getPersonColor = (person) => {
    if (person.eliminated) return "rgb(127, 29, 29)"; // red-900
    if (person.isTarget) return "rgb(194, 65, 12)"; // orange-700
    if (person.isActive) return "rgb(34, 197, 94)"; // green-500
    return "rgb(82, 82, 91)"; // neutral-600
  };

  const getPersonPosition = (index, total) => {
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2;
    const radius = Math.min(150, 100 + total * 3);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { x, y };
  };

  return (
    <>
      <SEOData data={seoData} />

      <div className="min-h-screen max-w-7xl mx-auto w-full flex flex-col items-center justify-start gap-20 py-32 px-4 bg-neutral-900">
        <Header />

        {/* Animation */}
        <div className="bg-neutral-800 rounded-3xl p-8 border border-neutral-800 flex-1 w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 tracking-wide">
              Josephus Problem
            </h1>
            <p className="text-neutral-300 text-lg">
              n = {n}, k = {k} | Step: {currentStep} / {n - 1}
            </p>
            {survivor && (
              <p className="text-green-400 text-lg font-semibold mt-2">
                Survivor: Person {survivor}
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <label className="text-white font-medium">People (n):</label>
              <select
                value={n}
                onChange={(e) => setN(parseInt(e.target.value))}
                disabled={isAnimating}
                className="bg-neutral-800 text-white px-3 py-1 rounded-lg border border-neutral-600 focus:border-white focus:outline-none"
              >
                {[5, 6, 7, 8, 9, 10, 12, 15, 20, 51, 100].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-white font-medium">Step (k):</label>
              <select
                value={k}
                onChange={(e) => setK(parseInt(e.target.value))}
                disabled={isAnimating}
                className="bg-neutral-800 text-white px-3 py-1 rounded-lg border border-neutral-600 focus:border-white focus:outline-none"
              >
                {[2, 3, 4, 5, 6, 7, 8, 12, 13, 15].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            <SpeedControls
              animationSpeed={animationSpeed}
              setAnimationSpeed={setAnimationSpeed}
              isAnimating={isAnimating}
            />

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

          {/* Game Board */}
          <div className="flex justify-center items-center mb-8 bg-black p-10 rounded-2xl min-h-[400px]">
            <div
              className="relative"
              style={{ width: "400px", height: "400px" }}
            >
              <svg width="400" height="400" className="absolute inset-0">
                {people.map((person, index) => {
                  const pos = getPersonPosition(index, people.length);
                  return (
                    <g key={person.id}>
                      <circle
                        cx={200 + pos.x}
                        cy={200 + pos.y}
                        r="20"
                        fill={getPersonColor(person)}
                        stroke="white"
                        strokeWidth="2"
                        className="transition-all duration-300"
                        opacity={person.eliminated ? 0.3 : 1}
                      />
                      <text
                        x={200 + pos.x}
                        y={200 + pos.y + 5}
                        textAnchor="middle"
                        className={`text-sm font-bold ${person.eliminated ? "text-neutral-300 fill-neutral-300" : "text-white fill-white"}`}
                      >
                        {person.id}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Elimination Order */}
          {eliminationOrder.length > 0 && (
            <div className="text-center mb-6">
              <h3 className="text-white text-lg font-semibold mb-2">
                Elimination Order:
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {eliminationOrder.map((personId, index) => (
                  <span
                    key={index}
                    className="bg-neutral-700 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    {personId}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="w-full bg-neutral-700 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-white to-neutral-300 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / (n - 1)) * 100}%` }}
            />
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 text-sm text-neutral-300 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-neutral-600"></div>
              <span>Alive</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span>Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-700"></div>
              <span>Target</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-900"></div>
              <span>Eliminated</span>
            </div>
          </div>

          {/* Formula */}
          <div className="text-center text-neutral-300 text-sm">
            <p>
              The Josephus problem: n people in a circle, eliminate every k-th
              person
            </p>
            <p className="mt-1 opacity-70">
              Mathematical solution: J(n,k) = (J(n-1,k) + k) % n
            </p>
          </div>
        </div>

        <Description dataObj={descriptionData} />
      </div>
    </>
  );
});

export default JosephusProblem;
