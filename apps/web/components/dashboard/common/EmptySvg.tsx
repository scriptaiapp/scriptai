export const EmptySvg = ({ className }: { className: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 150"
        aria-hidden="true"
        className={className}
    >
        {/* Define filters for drop shadows. 
      This is the standard SVG way to create depth.
    */}
        <defs>
            <filter
                id="paper-shadow"
                x="-20%" y="-20%" width="140%" height="140%"
            >
                <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.08" />
            </filter>
            <filter
                id="button-shadow"
                x="-20%" y="-20%" width="140%" height="140%"
            >
                <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.15" />
            </filter>
        </defs>

        {/* Group for the paper element */}
        <g filter="url(#paper-shadow)">
            {/* IMPROVEMENT: Replaced paths with a <rect> for cleaner code 
        and added rounded corners (rx="6").
        Colors now use theme-aware Tailwind classes.
      */}
            <rect
                x="35"
                y="25"
                width="95"
                height="100"
                rx="6"
                className="fill-white dark:fill-slate-800"
            />
            {/* The text lines */}
            <path
                d="M50 45h60v4H50z M50 58h60v4H50z M50 71h40v4H50z"
                className="fill-slate-200 dark:fill-slate-700"
            />
        </g>

        {/* Group for the floating action button */}
        <g filter="url(#button-shadow)">
            <circle
                cx="135"
                cy="105"
                r="22"
                className="fill-purple-600"
            />
            <path
                d="M133 99h4v12h-4z M127 103h16v4h-16z"
                className="fill-white"
            />
        </g>
    </svg>
);