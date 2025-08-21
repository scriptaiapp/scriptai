

const MicIcon = ({ className }: { className: string }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* The static microphone body */}
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />

      {/* The "fill" element that animates inside the mic head on hover */}
      {/* NOTE: It uses `fill-current` to inherit the stroke color */}
      <rect
        x="9"
        y="2"
        width="6"
        height="10"
        rx="3" // Matches the curve of the mic head
        className="origin-bottom fill-current opacity-0 group-hover:animate-mic-fill"
        strokeWidth="0"
      />
    </svg>
  );
};

export default MicIcon;