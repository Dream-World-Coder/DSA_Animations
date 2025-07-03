import { useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Lenis from "lenis";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";
import Footer from "./components/Footer/Footer";
import "./App.css";

const HomePage = lazy(() => import("./pages/home/Home"));
const NotFoundPage = lazy(() => import("./pages/NotFound"));

// array
const KadanesAlgorithm = lazy(() => import("./pages/array/Kadane"));
const FloydCycleDetection = lazy(
  () => import("./pages/array/FloydsCycleDetection"),
);

// stackQueue
const ExpEval = lazy(() => import("./pages/stackQueue/ExpressionEval"));

// recursion
const TowerOfHanoi = lazy(() => import("./pages/recursion/TowerOfHanoi"));
const JosephusProblem = lazy(() => import("./pages/recursion/Josephous"));
const QuickSort = lazy(() => import("./pages/recursion/QuickSort"));

// tree
const LevelOrderTraversal = lazy(
  () => import("./pages/tree/LevelOrderTraversal"),
);

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <HelmetProvider>
      <Router>
        <Analytics />
        <Suspense
          fallback={
            <div className="flex justify-center items-center mt-10 bg-neutral-900 text-white text-xl">
              Loading...
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<HomePage />} />

            {/* array */}
            <Route
              path="/array-linkedlist/kadane-algo"
              element={<KadanesAlgorithm />}
            />
            <Route
              path="/array-linkedlist/floyds-cycle-detection-algorithm"
              element={<FloydCycleDetection />}
            />

            {/* stack queue */}
            <Route
              path="/stack-queue/expression-evaluation"
              element={<ExpEval />}
            />

            {/* recursion */}
            <Route
              path="/recursion/tower-of-hanoi"
              element={<TowerOfHanoi />}
            />
            <Route
              path="/recursion/josephus-problem"
              element={<JosephusProblem />}
            />
            <Route path="/recursion/quick-sort" element={<QuickSort />} />

            {/* trees */}
            <Route
              path="/tree/level-order-traversal"
              element={<LevelOrderTraversal />}
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        <Footer />
      </Router>
    </HelmetProvider>
  );
}

export default App;
