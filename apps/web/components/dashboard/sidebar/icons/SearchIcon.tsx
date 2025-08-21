const SearchIcon = ({ className }: { className: string }) => {
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
            {/* The circle part (lens) */}
            <circle
                cx="11"
                cy="11"
                r="8"
                className="origin-center group-hover:animate-search-pop-lens"
            />
            {/* The handle part */}
            <path
                d="m21 21-4.3-4.3"
                className="origin-bottom-right group-hover:animate-search-pop-handle"
            />
        </svg>
    );
};

export default SearchIcon;