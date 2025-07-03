## Page Structure

```tsx
import { memo } from "react";
import {Select, SelectContent, ...} from "@/components/ui/select";
// or
// traditional option-select

/**
 * paths relative to: src/pages/{topic}/{algorithm}.jsx
 */
import { ShadCNHeader as Header } from "../../components/Header/ShadCNNav";
import SpeedControls from "../../components/utils/SpeedControl";
import Description from "../../components/utils/Description";
import SEOData from "../../components/SEO";

const ComponentName = memo(function ComponentName() {
  /**
   *
   * state variables as needed
   * eg. const [disks, setDisks] = useState(3);
   *
   */

  const descriptionData = {
    heading<string>, // required
    subheading<string>,
    summary<string>,
    lang<string>, //default: python
    code<string>,
  };

  const seoData = {
    title<string>, // required
    description<string>,
    canonical<string>,
    noIndex<bool>, // default: false,
    openGraph<object> : {
      title, // required
      description,
      url,
      image,
      type
    },
    twitter<object> : {
      crad,
      site,
      title,
      description,
      image
    },
    schema<object> : null ,//default,
    // else pass an object.
    // RECOMMENDED TO ADD
  };

  return (
    <>
      <SEOData data={seoData} />

      <div className="min-h-screen max-w-7xl mx-auto w-full flex flex-col items-center justify-start gap-20 py-32 px-0 bg-neutral-900">
        <Header />

        {/* animation */}
        <div className="bg-neutral-800 rounded-lg p-8 border border-neutral-800 w-full">
          {/* animation Heading */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 tracking-wide">
              eg. Tower of Hanoi
            </h1>
            <p className="text-neutral-300 text-lg">
              // steps info, omittable
              eg. Steps: {currentStep} / {totalSteps} = 2<sup>{disks}</sup> - 1
            </p>
          </div>

          {/* Controls for animation parameters */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
            {/*
              *
              * needed parameters controlbar
              *
            */}

            <SpeedControls
              animationSpeed={animationSpeed}
              setAnimationSpeed={setAnimationSpeed}
              isAnimating={isAnimating}
            />
            {/*
              *
              *
              * animationSpeed: Number (800 default)
              * isAnimating: Bool
              *
              *
              */}

            <button
              onClick={startAnimation}
              disabled={isAnimating}
              className="bg-white text-black px-6 py-2 rounded-md font-semibold hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {isAnimating ? "Solving..." : "Start"}
            </button>

            <button
              onClick={reset} // or your own logic
              disabled={isAnimating}
              className="bg-neutral-700 text-white px-6 py-2 rounded-md font-semibold hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              Reset
            </button>
          </div>

          {/* Game Board */}
          <div className="flex justify-center items-end gap-8 mb-8 bg-black p-10 rounded-lg min-h-[400px]">
            {/*
              *
              *
              * main animation board
              *
              *
              */}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-neutral-700 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-white to-neutral-300 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }} // or your own logic
            />
          </div>

          {/* Formula Explanation or other details -- omittable -- */}
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

        {/**
          *
          *
          * Brief info of the project with code
          *
          */}
        <Description dataObj={descriptionData} />
      </div>
    </>
  );
});

export default ComponentName;
```

## Workflow

- After making the component you have to update the `App.jsx` and give it an appropriate route. Lazy load the components.
- Also add the route in `assets/data/navLinks.js` [*required*] & `public/sitemap.xml`
- Although its not required, still its recommend to add a doc explaining your code. `docs/{topic}/{subtopic}`
- If needed to add images then add them in `public/images/{your-added-component-name}/*`

## SEO Data

> Add required fields when submitting a PR

```ts
const descriptionData = {
  heading<string>, // required
  subheading<string>,
  summary<string>,
  lang<string>, //default: python
  code<string>,
};

const seoData = {
  // meta tags
  title<string>, // required
  description<string>,
  canonical<string>,
  noIndex<bool>,

  // open graph
  openGraph<object> : {
    title, // required
    description,
    url,
    image // default: /images/defaults/preview.png,
    type
  },

  // schema.org json-ld
  schema<object> : null ,// REQUIRED,
  // you can add minimal details but add this field

  twitter<object> : {
    crad,
    site,
    title,
    description,
    image
  },
};
```
