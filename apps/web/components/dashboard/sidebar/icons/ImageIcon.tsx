

const ImageIcon = ({ className }: { className: string }) => {
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
            {/* The static frame of the image */}
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />

            {/* The moon, which is invisible by default and animates on hover */}
            {/* NOTE: The moon uses `fill-current` to inherit its color */}
            <circle
                cx="16"
                cy="18"
                r="2"
                className="fill-current opacity-0 group-hover:animate-moon-rise"
                strokeWidth="0"
            />

            {/* The sun, which is visible by default and animates on hover */}
            <circle
                cx="9"
                cy="9"
                r="2"
                className="group-hover:animate-sun-set"
            />

            {/* The mountains, which are always visible */}
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
    );
};

export default ImageIcon;