## Page Structure

```jsx
import { memo } from "react";
import {Select, SelectContent, ...} from "@/components/ui/select";
// or
// traditional option-select

import { ShadCNHeader as Header } from "../../components/Header/ShadCNNav";
import SpeedControls from "../../components/utils/SpeedControl";
import Description from "../../components/utils/Description";
import SEOData from "../../components/SEO";

const Component = memo(function Component() {
  // state vars
  // eg. const [disks, setDisks] = useState(3);

  const descriptionData = {
    heading: `Tower of Hanoi`, // required
    subheading: `A classic recursive puzzle ...`, // omittable
    summary: `<p>The Tower of Hanoi consists of three ...</p>`, // omittable
    lang: "python", // omittable, default: python
    code: ` # code here`, // omittable
  };
  const seoData = {
    title: descriptionData.heading, // required
  };

  return (
    <>
      <SEOData data={seoData} />

      <div className="min-h-screen max-w-7xl mx-auto w-full flex flex-col items-center justify-start gap-20 py-32 px-0 bg-neutral-900">
        <Header />

        {/* animation */}
        <div className="bg-neutral-800 rounded-lg p-8 border border-neutral-800 w-full">
          {/* animation Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 tracking-wide">
              eg. Tower of Hanoi
            </h1>
            <p className="text-neutral-300 text-lg">
              eg. Steps: {currentStep} / {totalSteps} = 2<sup>{disks}</sup> - 1
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
            {/* other control params */}

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
          <div className="flex justify-center items-end gap-8 mb-8 bg-black p-10 rounded-lg min-h-[400px]">
            {/* acctual animation place */}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-neutral-700 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-white to-neutral-300 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>

          {/* Formula Explanation -- omittable -- */}
          <div className="text-center text-neutral-300 text-sm">
            {/* short Formula */}
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

export default Component;
```

After making the component you have to update the `App.jsx` and give it a route.
Also add the route in `assets/data/navLinks.js`
