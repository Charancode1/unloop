import React from "react";

interface UnloopLogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
}

export function UnloopLogo({
  size = 24,
  className = "",
  showWordmark = false,
}: UnloopLogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        {/* The unloop broken cycle arc */}
        <path
          d="M 36 34 C 33 39 28 42 22 42 C 12 42 4 34 4 24 C 4 14 12 6 22 6 C 29 6 35 10 38 16"
          stroke="#10B981"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Forward breakout arrow */}
        <path
          d="M 22 24 L 42 8"
          stroke="#34D399"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M 30 8 H 42 V 20"
          stroke="#34D399"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {showWordmark && (
        <span className="text-xl font-bold tracking-tight text-white leading-none">
          Unloop
        </span>
      )}
    </div>
  );
}
