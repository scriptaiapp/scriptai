
const HomeIcon = ({ className }: { className: string }) => {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className={className} // Allows passing Tailwind size/color classes
        >
            <g
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                // These two classes are key:
                // 1. `origin-bottom`: Sets the transform origin for a natural wobble.
                // 2. `group-hover:animate-wobble`: Applies the 'wobble' animation when a parent with the 'group' class is hovered.
                className="origin-bottom group-hover:animate-wobble"
            >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </g>
        </svg>
    );
};

export default HomeIcon;