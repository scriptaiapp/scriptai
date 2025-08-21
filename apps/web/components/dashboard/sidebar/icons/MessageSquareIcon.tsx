

const MessageSquareIcon = ({ className }: { className: string }) => {
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
            {/* The main message bubble, which will vibrate */}
            <g className="origin-center group-hover:animate-message-vibrate">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </g>

            {/* The reply arrow that appears inside */}
            <path
                d="m8 12 3-3 3 3"
                className="opacity-0 group-hover:animate-reply-arrow"
            />
            <path
                d="M11 14v-5"
                className="opacity-0 group-hover:animate-reply-arrow [animation-delay:0.1s]"
            />
        </svg>
    );
};

export default MessageSquareIcon;