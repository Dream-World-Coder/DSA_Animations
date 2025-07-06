import { useState, useEffect, useCallback, memo } from "react";
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

const TowerOfHanoi = memo(function TowerOfHanoi() {
  const [disks, setDisks] = useState(3);
  const [towers, setTowers] = useState([[], [], []]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [currentMove, setCurrentMove] = useState(null);
  const towerNames = ["Source", "Auxiliary", "Destination"];

  const descriptionData = {
    heading: `Tower of Hanoi`,
    subheading: `A classic recursive puzzle where disks must be moved between rods
    following strict rules.`,
    summary: `<p>
      The Tower of Hanoi consists of three rods and a number of disks of
      different sizes, which can slide onto any rod. The puzzle starts
      with all disks stacked in order on one rod (largest on bottom,
      smallest on top). The objective is to move the entire stack to
      another rod, obeying these rules:
    </p>
    <ul className="list-disc list-inside mt-2 space-y-1">
      <li>Only one disk can be moved at a time.</li>
      <li>
        Each move involves taking the top disk from one rod and placing it
        on another.
      </li>
      <li>No disk may be placed on top of a smaller disk.</li>
    </ul>
    <p className="mt-2">
      This implementation uses animation to show each move step-by-step as
      calculated by the recursive algorithm.
    </p>`,
    lang: "python",
    code: `
    def tower_of_hanoi(n, src, dest, aux):
      if n==1:
        print(f'moved 1 from {src} to {dest}')
        return
      tower_of_hanoi(n-1, src=src, dest=aux, aux=dest)
      print(f'moved {n} from {src} to {dest}')
      tower_of_hanoi(n-1, src=aux, dest=dest, aux=src)
    `,
  };

  const seoData = {
    title: "Tower of Hanoi - Recursive Disk Movement Visualization",
    description:
      "Visualize the classic Tower of Hanoi recursive problem with interactive animations. Understand the base case, recursive steps, and optimal solution.",
    canonical: "https://dsa-experiments.vercel.app/recursion/tower-of-hanoi",
    openGraph: {
      title: "Tower of Hanoi - Recursive Disk Movement Visualization",
      description:
        "Visualize the classic Tower of Hanoi recursive problem with interactive animations. Understand the base case, recursive steps, and optimal solution.",
      url: "https://dsa-experiments.vercel.app/recursion/tower-of-hanoi",
      image: "/images/tower-of-hanoi/prev.png",
    },
    schema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Tower of Hanoi - Recursive Disk Movement Visualization",
      url: "https://dsa-experiments.vercel.app/recursion/tower-of-hanoi",
      description:
        "Interactive visualization of the Tower of Hanoi problem using recursion.",
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
            name: "Recursion",
            item: "https://dsa-experiments.vercel.app/recursion",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Tower of Hanoi",
            item: "https://dsa-experiments.vercel.app/recursion/tower-of-hanoi",
          },
        ],
      },
    },
  };

  // initialize towers
  const initializeTowers = useCallback((numDisks) => {
    const newTowers = [[], [], []];
    for (let i = numDisks; i >= 1; i--) {
      newTowers[0].push(i);
    }
    setTowers(newTowers);
    setCurrentStep(0);
    setTotalSteps(Math.pow(2, numDisks) - 1);
    setCurrentMove(null);
  }, []);

  useEffect(() => {
    initializeTowers(disks);
  }, [disks, initializeTowers]);

  // tower of hanoi solver
  const solveTowerOfHanoi = useCallback(
    async (n, source, destination, auxiliary, moves = []) => {
      if (n === 1) {
        moves.push({ from: source, to: destination, disk: 1 });
        return moves;
      }

      await solveTowerOfHanoi(n - 1, source, auxiliary, destination, moves);
      moves.push({ from: source, to: destination, disk: n });
      await solveTowerOfHanoi(n - 1, auxiliary, destination, source, moves);

      return moves;
    },
    [],
  );

  const animateMove = async (from, to, disk) => {
    setCurrentMove({ from, to, disk });

    return new Promise((resolve) => {
      setTimeout(() => {
        setTowers((prevTowers) => {
          const newTowers = prevTowers.map((tower) => [...tower]);
          const movedDisk = newTowers[from].pop();
          newTowers[to].push(movedDisk);
          return newTowers;
        });

        setCurrentStep((prev) => prev + 1);
        setCurrentMove(null);
        resolve();
      }, animationSpeed);
    });
  };

  const startAnimation = async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    initializeTowers(disks);
    await new Promise((resolve) => setTimeout(resolve, 500)); // initial delay

    const moves = await solveTowerOfHanoi(disks, 0, 2, 1);

    for (const move of moves) {
      await animateMove(move.from, move.to, move.disk);
      await new Promise((res) => setTimeout(res, animationSpeed));
    }

    /*
    moves.forEach((move) => {
      setTimeout(async () => {
        await animateMove(move.from, move.to, move.disk);
      }, 300);
    });
    */

    setIsAnimating(false);
  };

  const reset = () => {
    setIsAnimating(false);
    initializeTowers(disks);
  };

  const getDiskColor = (size, maxSize) => {
    const intensity = Math.floor(((maxSize - size) / (maxSize - 1)) * 200 + 50);
    return `rgb(${0}, ${intensity}, ${0})`;
  };

  const getDiskWidth = (size, maxSize) => {
    // console.log(maxSize);
    return 30 + size * 25;
  };

  return (
    <>
      <SEOData data={seoData} />

      <div className="min-h-screen max-w-7xl mx-auto w-full flex flex-col items-center justify-start gap-20 py-20 md:py-32 px-0 bg-neutral-900">
        <Header />

        {/* animation */}
        <div className="bg-neutral-800 rounded-lg p-4 md:p-8 border border-neutral-800 w-full">
          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-wide">
              Tower of Hanoi
            </h1>
            <p className="text-neutral-300 text-lg">
              Steps: {currentStep} / {totalSteps} = 2<sup>{disks}</sup> - 1
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <label className="text-white font-medium">Disks:</label>
              <Select
                value={disks.toString()}
                onValueChange={(value) => setDisks(parseInt(value))}
                disabled={isAnimating}
              >
                <SelectTrigger className="bg-neutral-800 text-white px-3 py-1 rounded-md border border-neutral-600 focus:border-white focus:outline-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-600">
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                    <SelectItem
                      key={n}
                      value={n.toString()}
                      className="text-white hover:bg-neutral-700"
                    >
                      {n}
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
              {isAnimating ? "Solving..." : "Start"}
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
          <div className="flex flex-col md:flex-row justify-center items-center md:items-end gap-8 mb-8 bg-black p-5 md:p-10 rounded-lg min-h-[400px]">
            {towers.map((tower, towerIndex) => (
              <div key={towerIndex} className="flex flex-col items-center">
                {/* Tower Label */}
                <div className="text-white text-sm font-medium mb-2 opacity-70">
                  {towerNames[towerIndex]} Tower
                </div>

                {/* Tower Rod */}
                <div className="relative flex flex-col-reverse items-center">
                  <div className="bg-gradient-to-t from-white to-neutral-300 rounded-t-full shadow-lg w-2 h-48 md:h-80" />

                  {/* Base */}
                  <div
                    className="bg-gradient-to-r from-neutral-600 to-neutral-400 rounded-none shadow-lg absolute bottom-0"
                    style={{
                      width: `${getDiskWidth(disks, disks) + 40}px`,
                      height: "20px",
                    }}
                  />
                  {/* placeholder [important]  */}
                  <div
                    className="opacity-0"
                    style={{
                      width: `${getDiskWidth(disks, disks) + 40}px`,
                      height: "20px",
                    }}
                  />

                  {/* Disks */}
                  <div className="absolute bottom-5 flex flex-col-reverse items-center">
                    {tower.map((diskSize, diskIndex) => {
                      const isMoving =
                        currentMove &&
                        currentMove.from === towerIndex &&
                        diskIndex === tower.length - 1;

                      return (
                        <div
                          key={`${towerIndex}-${diskIndex}-${diskSize}`}
                          className={`rounded-lg shadow-lg border-1 border-neutral-800 transition-all duration-300
                          flex items-center justify-center ${
                            isMoving
                              ? "transform -translate-y-16 scale-110 shadow-2xl"
                              : ""
                          }`}
                          style={{
                            width: `${getDiskWidth(diskSize, disks)}px`,
                            height: "24px",
                            backgroundColor: getDiskColor(diskSize, disks),
                            // marginBottom: diskIndex === 0 ? "0px" : "2px",
                            zIndex: disks - diskSize + 10,
                          }}
                        >
                          {/* {diskIndex + 1} */}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-neutral-700 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-white to-neutral-300 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>

          {/* Formula Explanation */}
          <div className="text-center text-neutral-300 text-sm">
            <p>
              Minimum steps required: 2<sup>n</sup> - 1, where n is the number
              of disks
            </p>
            <p className="mt-1 opacity-70">
              This animation demonstrates the optimal recursive solution
            </p>
          </div>
        </div>

        <Description dataObj={descriptionData} />
      </div>
    </>
  );
});

export default TowerOfHanoi;
