import { NavLink } from "react-router-dom";
import { ShadCNHeader as Header } from "../components/Header/ShadCNNav";
import SEOData from "../components/SEO";
import { navLinks } from "../assets/data/navLinks";

export default function TopicsPage({ topicID }) {
  const topic = navLinks.find((item) => item._id === topicID);
  const subTopics = topic?.dropdownElements || [];

  const seoData = {
    title: `${topic?.title || "DSA"} - Topic List`,
    canonical: `https://dsa-experiments.vercel.app${topic?.hrefPrefix || ""}`,
    schema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `${topic?.title || "DSA"} - Topic List`,
      url: `https://dsa-experiments.vercel.app${topic?.hrefPrefix || ""}`,
      description: `Explore all subtopics under ${topic?.title}. Click on a topic to view interactive animations and visual explanations.`,
    },
  };

  return (
    <>
      <SEOData data={seoData} />

      <div className="min-h-screen max-w-7xl mx-auto w-full flex flex-col items-center gap-20 py-32 px-4 bg-neutral-900 text-white">
        <Header />

        <div className="text-center">
          <h1 className="text-4xl font-bold mb-6">{topic?.title}</h1>
          <p className="text-neutral-400">
            Select a topic to start learning visually
          </p>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
          {subTopics.map(({ title, href }) => (
            <li key={href}>
              <NavLink
                to={`${topic.hrefPrefix}${href}`}
                className="block px-6 py-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition text-lg font-medium"
              >
                {title}
              </NavLink>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
