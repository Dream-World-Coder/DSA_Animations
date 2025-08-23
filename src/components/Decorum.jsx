export const WireframeLines = ({
  top = 20,
  left = 20,
  right = 20,
  bottom = 20,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 9 }}>
      {[
        // top horizontal line
        {
          style: {
            top: `${top}px`,
            left: `${left}px`,
            right: `${right}px`,
          },
          border: "border-t-1",
        },
        // bottom horizontal line
        {
          style: {
            bottom: `${bottom}px`,
            left: `${left}px`,
            right: `${right}px`,
          },
          border: "border-b-1",
        },
        // left vertical line
        {
          style: {
            top: `${top}px`,
            bottom: `${bottom}px`,
            left: `${left}px`,
          },
          border: "border-l-1",
        },
        // right vertical line
        {
          style: {
            top: `${top}px`,
            bottom: `${bottom}px`,
            right: `${right}px`,
          },
          border: "border-r-1",
        },
      ].map((i, idx) => (
        <div
          key={idx}
          className={`absolute ${i.border} border-dotted border-neutral-700`}
          style={i.style}
        />
      ))}

      {/* Corner dots */}
      {[
        {
          style: {
            top: `${top - 4}px`,
            left: `${left - 4}px`,
          },
        },
        {
          style: {
            top: `${top - 4}px`,
            right: `${right - 4}px`,
          },
        },
        {
          style: {
            bottom: `${bottom - 4}px`,
            left: `${left - 4}px`,
          },
        },
        {
          style: {
            bottom: `${bottom - 4}px`,
            right: `${right - 4}px`,
          },
        },
      ].map((i, idx) => (
        <div
          key={idx}
          className="absolute size-6 flex items-center justify-center text-neutral-700 text-lg bg-neutral-900"
          style={i.style}
        >
          +
        </div>
      ))}
    </div>
  );
};
