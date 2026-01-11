// Brand icon used in the AppBar and favicon (simple chart metaphor).
function BrandIcon(props) {
  // Allow caller to control icon size; fallback matches AppBar height
  const size = props.size || 22;

  return (
    // Inline SVG so it inherits theme color cleanly
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      {/* Chart axes */}
      <path
        d="M4 4v16h16"
        fill="none"
        stroke="#000"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Bar chart columns */}
      <rect x="7" y="13" width="3" height="5" fill="#000" rx="0.6" />
      <rect x="12" y="10" width="3" height="8" fill="#000" rx="0.6" />
      <rect x="17" y="7" width="3" height="11" fill="#000" rx="0.6" />
    </svg>
  );
}

export default BrandIcon;
