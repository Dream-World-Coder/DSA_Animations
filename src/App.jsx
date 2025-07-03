import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Lenis from "lenis";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";

import HomePage from "./pages/home/Home";
import Footer from "./components/Footer/Footer";
import NotFoundPage from "./pages/NotFound";

// array
import KadanesAlgorithm from "./pages/array/Kadane";
import FloydCycleDetection from "./pages/array/FloydsCycleDetection";

// stackQueue
import ExpEval from "./pages/stackQueue/ExpressionEval";

// recursion
import TowerOfHanoi from "./pages/recursion/TowerOfHanoi";
import JosephusProblem from "./pages/recursion/Josephous";
import QuickSort from "./pages/recursion/QuickSort";

// tree
import LevelOrderTraversal from "./pages/trees/LevelOrderTraversal";

import "./App.css";

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
          <Route path="/recursion/tower-of-hanoi" element={<TowerOfHanoi />} />
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
        <Footer />
      </Router>
    </HelmetProvider>
  );
}

export default App;
