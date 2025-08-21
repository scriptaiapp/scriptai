
const SparklesIcon = ({ className }: { className: string }) => {
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
            {/* Main Star: This will pulse on hover */}
            <path
                d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"
                className="origin-center group-hover:animate-pulse-sparkle"
            />

            {/* Top-left sparkle: Fades in and out */}
            <path
                d="M5 3v4"
                className="group-hover:animate-fade-twinkle"
            />
            <path
                d="M3 5h4"
                className="group-hover:animate-fade-twinkle"
            />

            {/* Bottom-right sparkle: Fades in and out with a delay */}
            <path
                d="M19 17v4"
                className="group-hover:animate-fade-twinkle [animation-delay:-0.75s]"
            />
            <path
                d="M17 19h4"
                className="group-hover:animate-fade-twinkle [animation-delay:-0.75s]"
            />
        </svg>
    );
};

export default SparklesIcon;