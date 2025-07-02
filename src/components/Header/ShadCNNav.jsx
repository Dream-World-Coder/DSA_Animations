import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  ChevronDown,
  Code2,
  GitBranch,
  Layers,
  Network,
  Zap,
  RotateCcw,
} from "lucide-react";
import AppLogo from "../Logo";
import { navLinks } from "../../assets/data/navLinks";

const getIcon = (title) => {
  const iconMap = {
    "Array & LinkedList": <Layers className="w-4 h-4" />,
    Recursion: <RotateCcw className="w-4 h-4" />,
    "Stack & Queue": <Code2 className="w-4 h-4" />,
    Tree: <GitBranch className="w-4 h-4" />,
    Graph: <Network className="w-4 h-4" />,
    Greedy: <Zap className="w-4 h-4" />,
    Backtracking: <RotateCcw className="w-4 h-4" />,
  };
  return iconMap[title] && null; // icon not needed
};

export function ShadCNHeader({ abs = true }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const computeHref = (baseHref, hrefPrefix) => {
    return hrefPrefix + baseHref;
  };

  const handleDropdownToggle = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  const handleMouseEnter = (index) => {
    setOpenDropdown(index);
  };

  const handleMouseLeave = () => {
    setOpenDropdown(null);
  };

  return (
    <header
      className={`${abs ? "absolute" : "fixed"} top-0 left-0 right-0 z-50 w-full bg-neutral-900 backdrop-blur-sm text-white border-b border-neutral-800`}
    >
      <div className="container flex h-16 mx-auto items-center justify-between px-6">
        <div className="flex items-center space-x-2">
          <NavLink to="/" className="flex items-center space-x-2">
            <AppLogo
              width={32}
              height={32}
              backgroundColor="#8B4513"
              letterColor="#fff"
            />
            <span className="font-bold text-lg">DSA Animations</span>
          </NavLink>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex">
          <ul className="flex space-x-1">
            {navLinks.map((link, index) => (
              <li key={index} className="relative">
                {link.dropdownElements ? (
                  <div
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      className="group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-neutral-800 hover:text-green-400 focus:bg-neutral-800 focus:outline-none bg-transparent"
                      onClick={() => handleDropdownToggle(index)}
                    >
                      <div className="flex items-center space-x-2">
                        {getIcon(link.title)}
                        <span>{link.title}</span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${openDropdown === index ? "rotate-180" : ""}`}
                        />
                      </div>
                    </button>

                    {/* Dropdown Menu */}
                    {openDropdown === index && (
                      <div
                        className="absolute border border-neutral-700 top-[90%] mt-1 w-[400px] md:w-[500px] lg:w-[600px] bg-neutral-900 shadow-lg rounded-md overflow-hidden z-[60]"
                        style={{
                          left: `${index > 2 ? (Math.floor(navLinks.length / 2) - (index + 1)) * 125 : 0}px`,
                        }}
                      >
                        <div className="grid gap-2 p-4 md:grid-cols-2">
                          {link.dropdownElements.map(
                            (dropdownItem, dropdownIndex) => (
                              <NavLink
                                key={dropdownIndex}
                                to={computeHref(
                                  dropdownItem.href,
                                  link.hrefPrefix,
                                )}
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-neutral-800 hover:scale-[1.02] focus:bg-neutral-800 group"
                                onClick={() => setOpenDropdown(null)}
                              >
                                <div className="text-sm font-medium leading-none text-neutral-50 group-hover:text-green-400 transition-colors">
                                  {dropdownItem.title}
                                </div>
                                <p className="line-clamp-2 text-sm leading-snug text-neutral-400">
                                  Learn about {dropdownItem.title.toLowerCase()}{" "}
                                  implementation and algorithms
                                </p>
                              </NavLink>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    to={link.href}
                    className="group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-neutral-800 hover:text-green-400 focus:bg-neutral-800 focus:outline-none"
                  >
                    {link.title}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            className="inline-flex items-center justify-center rounded-md p-2 text-neutral-300 hover:bg-neutral-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  mobileMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-800 bg-neutral-900 backdrop-blur-sm">
          <div className="container px-6 py-2 space-y-1">
            {navLinks.map((link, index) => (
              <div key={index}>
                {link.dropdownElements ? (
                  <details className="group">
                    <summary className="flex items-center justify-between py-3 px-3 text-sm font-medium rounded-md hover:bg-neutral-800 cursor-pointer transition-colors">
                      <div className="flex items-center space-x-2">
                        {getIcon(link.title)}
                        <span>{link.title}</span>
                      </div>
                      <ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-180" />
                    </summary>
                    <div className="ml-4 mt-2 space-y-1">
                      {link.dropdownElements.map(
                        (dropdownItem, dropdownIndex) => (
                          <NavLink
                            key={dropdownIndex}
                            to={computeHref(dropdownItem.href, link.hrefPrefix)}
                            className="block py-2 px-3 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-all duration-200"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {dropdownItem.title}
                          </NavLink>
                        ),
                      )}
                    </div>
                  </details>
                ) : (
                  <NavLink
                    to={link.href}
                    className="block py-3 px-3 text-sm font-medium rounded-md hover:bg-neutral-800 hover:text-green-400 transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.title}
                  </NavLink>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
