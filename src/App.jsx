import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Lenis from "lenis";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";

import HomePage from "./pages/home/Home";
import Footer from "./components/Footer/Footer";

// array
import KadanesAlgorithm from "./pages/array/Kadane";

// recursion
import TowerOfHanoi from "./pages/recursion/TowerOfHanoi";
import JosephusProblem from "./pages/recursion/Josephous";
import QuickSort from "./pages/recursion/QuickSort";

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

          {/* recursion */}
          <Route path="/recursion/tower-of-hanoi" element={<TowerOfHanoi />} />
          <Route
            path="/recursion/josephus-problem"
            element={<JosephusProblem />}
          />
          <Route path="/recursion/quick-sort" element={<QuickSort />} />
        </Routes>
        <Footer />
      </Router>
    </HelmetProvider>
  );
}

export default App;
