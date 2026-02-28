const BarChart2Icon = ({ className }: { className?: string }) => {
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
            {/* Left Bar */}
            <line
                x1="6"
                y1="20"
                x2="6"
                y2="14"
                className="origin-bottom group-hover:animate-bar-bounce group-hover:[animation-duration:0.74s] group-hover:[animation-delay:-0.2s]"
            />
            {/* Middle Bar */}
            <line
                x1="12"
                y1="20"
                x2="12"
                y2="4"
                className="origin-bottom group-hover:animate-bar-bounce group-hover:[animation-duration:1.13s] group-hover:[animation-delay:-0.8s]"
            />
            {/* Right Bar */}
            <line
                x1="18"
                y1="20"
                x2="18"
                y2="10"
                className="origin-bottom group-hover:animate-bar-bounce group-hover:[animation-duration:0.87s] group-hover:[animation-delay:-0.5s]"
            />
        </svg>
    );
};

export default BarChart2Icon;