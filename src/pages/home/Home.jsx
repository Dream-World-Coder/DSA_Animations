import { useState, useEffect, memo } from "react";
import { NavLink } from "react-router-dom";
import {
  ChevronRight,
  Code,
  Play,
  Mail,
  Github,
  Linkedin,
  ExternalLink,
} from "lucide-react";
import { ShadCNHeader as Header } from "../../components/Header/ShadCNNav";
import { navLinks } from "../../assets/data/navLinks";
import SEOData from "../../components/SEO";
// import { WireframeLines } from "../../components/Decorum";

const HomePage = memo(function HomePage() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const seoData = {
    title: "DSA Animations",
    description: `An interactive web platform for visualizing Data Structures and Algorithms through animations. Built to make learning DSA concepts intuitive and engaging.`,
    canonical: "https://dsa-experiments.vercel.app",
    openGraph: {
      title: "DSA Animations",
      description: `An interactive web platform for visualizing Data Structures and Algorithms through animations. Built to make learning DSA concepts intuitive and engaging.`,
      url: "https://dsa-experiments.vercel.app",
      image: "/images/defaults/preview.png",
    },
    schema: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "DSA Animations",
      url: "https://dsa-experiments.vercel.app",
      description:
        "An interactive web platform for visualizing Data Structures and Algorithms through animations.",
      publisher: {
        "@type": "Organization",
        name: "DSA Animations",
        url: "https://dsa-experiments.vercel.app",
        logo: {
          "@type": "ImageObject",
          url: "https://dsa-experiments.vercel.app/favicon.svg",
        },
      },
    },
  };

  return (
    <>
      <SEOData data={seoData} />

      <div className="min-h-screen bg-neutral-900 text-white">
        {/* <WireframeLines top={40} left={40} right={40} bottom={40} /> */}

        <Header abs={false} />

        {/* Hero Section */}
        <section className="pt-24 pb-16 px-6">
          <div className="container mx-auto max-w-4xl">
            <div
              className={`text-center transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <div className="inline-flex items-center gap-2 bg-neutral-800 px-4 py-2 rounded-full text-sm text-neutral-300 mb-8">
                <Code size={16} />
                Interactive Learning Platform
              </div>

              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent leading-tight">
                Visualize Algorithms,
                <br />
                <span className="text-green-400">Build Intuition</span>
              </h1>

              <p className="text-lg text-neutral-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                If you love to visualize algorithms and learn intuitively then
                you are in the right place. This platform features animations of
                beautiful algorithms related to Data Structures and Algorithms.
                I hope these help you grasp things better!
                <br />
                Of course, the world of algorithms is vast and fascinating — far
                beyond what one person can animate alone. So if you're
                enthusiastic, consider contributing and help make this an even
                better resource for everyone.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    const explore = document.getElementById("explore");
                    if (explore) {
                      explore.scrollIntoView({
                        behavior: "smooth",
                      });
                    }
                  }}
                  className="group bg-green-500 hover:bg-green-600 text-black font-semibold px-8 py-4 cursor-pointer
                rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25"
                >
                  <span className="flex items-center gap-2">
                    Start Exploring
                    <ChevronRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </span>
                </button>

                <a
                  href="https://github.com/Dream-World-Coder/DSA_Animations/blob/main/README.md"
                  className="border border-neutral-700 hover:border-neutral-600 text-white font-semibold
                px-8 py-4 rounded-lg transition-all duration-300 hover:bg-neutral-800"
                >
                  Contribute
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Cards */}
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-7xl">
            <div id="explore" className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Topics Covered</h2>
              <p className="text-neutral-400">
                Explore interactive animations by topic and algorithm
              </p>
            </div>

            <div className="space-y-8">
              {navLinks.map((category, categoryIndex) => (
                <div key={category.title} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white">
                      {category.title}
                    </h3>
                    <NavLink
                      to={category.hrefPrefix}
                      className="text-green-400 hover:text-green-300 text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      View All
                      <ChevronRight size={16} />
                    </NavLink>
                  </div>

                  <div className="relative">
                    <div className="flex overflow-x-auto scrollbar-hide gap-4 pb-2">
                      {category.dropdownElements.map((algo, algoIndex) => (
                        <NavLink
                          key={algo.title}
                          to={`${category.hrefPrefix}${algo.href}`}
                          className="group relative flex-shrink-0 w-64 bg-neutral-800 rounded-xl p-5 border border-neutral-700 hover:border-green-500/50 transition-all duration-300 cursor-pointer hover:scale-100"
                          onMouseEnter={() =>
                            setHoveredCard(`${categoryIndex}-${algoIndex}`)
                          }
                          onMouseLeave={() => setHoveredCard(null)}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                          <div className="relative z-10">
                            <h4 className="text-lg font-semibold mb-2 text-white group-hover:text-green-400 transition-colors">
                              {algo.title}
                            </h4>

                            <div className="text-sm text-neutral-400 mb-4">
                              Interactive visualization of{" "}
                              {algo.title.toLowerCase()}
                            </div>

                            <div className="flex items-center text-green-400 text-sm font-medium group-hover:gap-2 transition-all">
                              <Play size={14} />
                              <span>Animate</span>
                              <ChevronRight
                                size={14}
                                className="group-hover:translate-x-1 transition-transform"
                              />
                            </div>
                          </div>
                        </NavLink>
                      ))}
                    </div>

                    {/* Scroll indicators */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 w-8 h-full bg-gradient-to-r from-neutral-900 to-transparent pointer-events-none opacity-50" />
                    <div className="absolute top-1/2 -translate-y-1/2 right-0 w-8 h-full bg-gradient-to-l from-neutral-900 to-transparent pointer-events-none opacity-50" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-16 px-6 bg-neutral-800/50">
          <div className="container mx-auto max-w-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">About This Project</h2>
                <p className="text-neutral-300 mb-6 leading-relaxed">
                  This platform was created to make learning Data Structures and
                  Algorithms more intuitive and engaging. Through interactive
                  visualizations, complex algorithmic concepts become accessible
                  and easy to understand.
                </p>
                <p className="text-neutral-300 mb-8 leading-relaxed">
                  Each animation is carefully crafted to show the step-by-step
                  execution of algorithms, helping you build a deeper
                  understanding of how they work under the hood.
                </p>

                <div className="flex flex-wrap gap-3">
                  {[
                    "React",
                    "JavaScript",
                    "Tailwind CSS",
                    "Data Visualization",
                  ].map((tech) => (
                    <span
                      key={tech}
                      className="bg-neutral-700 text-neutral-300 px-3 py-1 rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                  </div>
                  <div className="font-mono text-sm space-y-2">
                    <div className="text-purple-400">
                      function <span className="text-white">quickSort</span>
                      <span className="text-yellow-400">(arr)</span>
                      {"{"}
                    </div>
                    <div className="text-neutral-400 pl-4">
                      {/* // Animation happens here */}
                    </div>
                    <div className="text-blue-400 pl-4">
                      if (arr.length &lt;= 1) return arr;
                    </div>
                    <div className="text-green-400 pl-4">
                      const pivot = arr[0];
                    </div>
                    <div className="text-neutral-400 pl-4">
                      // ... algorithm steps
                    </div>
                    <div className="text-purple-400">{"}"}</div>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-500/10 rounded-full animate-pulse" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-500/10 rounded-full animate-pulse delay-1000" />
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
            <p className="text-neutral-400 mb-8 max-w-2xl mx-auto">
              Have questions, suggestions, or want to contribute? I'd love to
              hear from you. Let's connect and make learning algorithms even
              better together.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <a
                href="mailto:blog.opencanvas@gmail.com"
                className="group flex items-center gap-3 bg-neutral-800 hover:bg-neutral-700 px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105"
              >
                <Mail size={20} className="text-green-400" />
                <span>Send Email</span>
                <ExternalLink
                  size={16}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </a>

              <a
                href="https://github.com/dream-world-coder"
                className="group flex items-center gap-3 bg-neutral-800 hover:bg-neutral-700 px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105"
              >
                <Github size={20} className="text-green-400" />
                <span>GitHub</span>
                <ExternalLink
                  size={16}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </a>

              <a
                href="https://linkedin.com/in/subhajitgorai"
                className="group flex items-center gap-3 bg-neutral-800 hover:bg-neutral-700 px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105"
              >
                <Linkedin size={20} className="text-green-400" />
                <span>LinkedIn</span>
                <ExternalLink
                  size={16}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-neutral-800 py-8 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-neutral-400">
                  © 2025 DSA Animations. Made with ❤️ for learners.
                </p>
              </div>

              {/* <div className="flex gap-6">
              <a
                href="#"
                className="text-neutral-400 hover:text-white transition-colors text-sm"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-neutral-400 hover:text-white transition-colors text-sm"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-neutral-400 hover:text-white transition-colors text-sm"
              >
                Support
              </a>
            </div> */}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
});

export default HomePage;
