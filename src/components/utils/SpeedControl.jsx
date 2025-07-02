export default function SpeedControls(
  animationSpeed,
  setAnimationSpeed,
  isAnimating,
) {
  return (
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
  );
}
