export const WireframeLines = ({
  top = 20,
  left = 20,
  right = 20,
  bottom = 20,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 9 }}>
      {/* Dot pattern background */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(100,100,100,0.5) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Top horizontal line */}
      <div
        className="absolute border-t-2 border-dotted border-neutral-800"
        style={{
          top: `${top}px`,
          left: `${left}px`,
          right: `${right}px`,
        }}
      />

      {/* Bottom horizontal line */}
      <div
        className="absolute border-t-2 border-dotted border-neutral-800"
        style={{
          bottom: `${bottom}px`,
          left: `${left}px`,
          right: `${right}px`,
        }}
      />

      {/* Left vertical line */}
      <div
        className="absolute border-l-2 border-dotted border-neutral-800"
        style={{
          top: `${top}px`,
          bottom: `${bottom}px`,
          left: `${left}px`,
        }}
      />

      {/* Right vertical line */}
      <div
        className="absolute border-r-2 border-dotted border-neutral-800"
        style={{
          top: `${top}px`,
          bottom: `${bottom}px`,
          right: `${right}px`,
        }}
      />

      {/* Corner dots */}
      <div
        className="absolute size-6 flex items-center justify-center text-neutral-700 text-lg bg-neutral-900"
        style={{
          top: `${top - 4}px`,
          left: `${left - 4}px`,
        }}
      >
        +
      </div>
      <div
        className="absolute size-6 flex items-center justify-center text-neutral-700 text-lg bg-neutral-900"
        style={{
          top: `${top - 4}px`,
          right: `${right - 4}px`,
        }}
      >
        +
      </div>
      <div
        className="absolute size-6 flex items-center justify-center text-neutral-700 text-lg bg-neutral-900"
        style={{
          bottom: `${bottom - 4}px`,
          left: `${left - 4}px`,
        }}
      >
        +
      </div>
      <div
        className="absolute size-6 flex items-center justify-center text-neutral-700 text-lg bg-neutral-900"
        style={{
          bottom: `${bottom - 4}px`,
          right: `${right - 4}px`,
        }}
      >
        +
      </div>
    </div>
  );
};
