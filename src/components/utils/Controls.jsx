export default function Controls() {
  return (
    <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
      <div className="flex items-center gap-2">
        <label className="text-white font-medium">People (n):</label>
        <select
          value={n}
          onChange={(e) => setN(parseInt(e.target.value))}
          disabled={isAnimating}
          className="bg-neutral-800 text-white px-3 py-1 rounded-lg border border-neutral-600 focus:border-white focus:outline-none"
        >
          {[5, 6, 7, 8, 9, 10, 12, 15, 20, 51, 100].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-white font-medium">Step (k):</label>
        <select
          value={k}
          onChange={(e) => setK(parseInt(e.target.value))}
          disabled={isAnimating}
          className="bg-neutral-800 text-white px-3 py-1 rounded-lg border border-neutral-600 focus:border-white focus:outline-none"
        >
          {[2, 3, 4, 5, 6, 7, 8, 12, 13, 15].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-white font-medium">Speed:</label>
        <select
          value={animationSpeed}
          onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
          disabled={isAnimating}
          className="bg-neutral-800 text-white px-3 py-1 rounded-lg border border-neutral-600 focus:border-white focus:outline-none"
        >
          <option value={1200}>Slow</option>
          <option value={800}>Medium</option>
          <option value={400}>Fast</option>
          <option value={200}>Very Fast</option>
          <option value={50}>Lightning</option>
        </select>
      </div>

      <button
        onClick={startAnimation}
        disabled={isAnimating}
        className="bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
      >
        {isAnimating ? "Running..." : "Start"}
      </button>

      <button
        onClick={reset}
        disabled={isAnimating}
        className="bg-neutral-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
      >
        Reset
      </button>
    </div>
  );
}
