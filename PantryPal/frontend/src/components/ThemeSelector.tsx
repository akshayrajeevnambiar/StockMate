import { useState } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../contexts/ThemeContext";

export default function ThemeSelector() {
  const { effectiveTheme, setTheme } = useTheme();
  const [isHovering, setIsHovering] = useState(false);
  const isDark = effectiveTheme === "dark";

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={handleToggle}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="relative w-16 h-8 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 dark:from-indigo-600 dark:to-purple-600 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110 hover:shadow-xl dark:hover:shadow-purple-500/30 hover:shadow-gray-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 active:scale-95 will-change-transform overflow-hidden group"
      aria-label="Toggle theme"
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

      {/* Sliding circle */}
      <div
        className={`absolute top-1 w-6 h-6 rounded-full bg-white dark:bg-gray-900 shadow-lg transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center justify-center ${
          isDark ? "left-9 rotate-[360deg]" : "left-1 rotate-0"
        } ${isHovering ? "scale-110" : "scale-100"}`}
      >
        {/* Icon inside the circle with rotation */}
        <div className="relative w-full h-full flex items-center justify-center">
          <SunIcon
            className={`absolute w-4 h-4 text-yellow-500 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isDark
                ? "opacity-0 rotate-180 scale-0"
                : "opacity-100 rotate-0 scale-100"
            }`}
          />
          <MoonIcon
            className={`absolute w-4 h-4 text-indigo-400 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isDark
                ? "opacity-100 rotate-0 scale-100"
                : "opacity-0 -rotate-180 scale-0"
            }`}
          />
        </div>
      </div>

      {/* Stars animation for dark mode */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          isDark ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute top-2 left-2 w-1 h-1 bg-white rounded-full animate-pulse" />
        <div
          className="absolute top-4 left-4 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-100"
          style={{ animationDelay: "0.2s" }}
        />
        <div
          className="absolute top-3 left-6 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-200"
          style={{ animationDelay: "0.4s" }}
        />
      </div>

      {/* Sun rays for light mode */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          !isDark ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute top-1/2 right-2 w-1.5 h-0.5 bg-yellow-400 rounded-full transform -translate-y-1/2" />
        <div className="absolute top-1/2 right-3 w-1 h-0.5 bg-yellow-300 rounded-full transform -translate-y-1/2" />
      </div>
    </button>
  );
}
