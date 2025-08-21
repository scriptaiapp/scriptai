import React from 'react';

const BookopenIcon = ({ className = "w-16 h-16" }: { className?: string }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`group text-gray-700 dark:text-gray-200 cursor-pointer ${className}`}
        >
            {/* --- CLOSED BOOK (Visible by default, fades out on hover) --- */}
            <g className="group-hover:opacity-0 transition-opacity duration-300">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" className="fill-white dark:fill-gray-800" />
            </g>

            {/* --- OPEN BOOK (Hidden by default, fades in and flutters on hover) --- */}
            <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:animate-book-flutter">
                {/* Left Page */}
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" className="fill-white dark:fill-gray-800" />
                {/* Right Page */}
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" className="fill-white dark:fill-gray-800" />
            </g>
        </svg>
    );
};

export default BookopenIcon;