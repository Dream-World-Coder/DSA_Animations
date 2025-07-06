export default function Footer() {
  return (
    <footer className="text-neutral-500 px-4 py-6 text-sm sm:text-base max-w-6xl mx-auto">
      <p className="leading-relaxed break-words">
        Logo icon by{" "}
        <a
          href="https://vectordoodle.gumroad.com/l/FOCLd?ref=svgrepo.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-neutral-300"
        >
          Vectordoodle
        </a>{" "}
        in CC Attribution License via{" "}
        <a
          href="https://www.svgrepo.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-neutral-300"
        >
          SVG Repo
        </a>
        , licensed under{" "}
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-neutral-300"
        >
          CC BY 4.0
        </a>
        .
      </p>
    </footer>
  );
}
