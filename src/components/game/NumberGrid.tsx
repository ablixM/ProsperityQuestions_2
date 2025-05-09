import { FC } from "react";

interface NumberGridProps {
  totalNumbers: number;
  onSelectNumber: (number: number) => void;
  completedNumbers: number[];
  highlightedNumbers?: number[];
  tieBreakers?: number[];
}

const NumberGrid: FC<NumberGridProps> = ({
  totalNumbers,
  onSelectNumber,
  completedNumbers,
  highlightedNumbers = [],
  tieBreakers = [],
}) => {
  // Generate numbers array from 1 to totalNumbers
  const numbers = Array.from({ length: totalNumbers }, (_, i) => i + 1);

  // Determine grid columns based on totalNumbers
  const getGridCols = () => {
    return "grid-cols-3 md:grid-cols-4 lg:grid-cols-7";
  };

  return (
    <div className={`grid ${getGridCols()} gap-6 md:gap-8 w-full mx-auto`}>
      {numbers.map((number, index) => {
        const isCompleted = completedNumbers.includes(number);
        const isHighlighted = highlightedNumbers.includes(number);
        const isTieBreaker = tieBreakers.includes(number);
        // Add a staggered animation delay based on the index
        const animationDelay = `${index * 0.1}s`;

        return (
          <button
            key={number}
            onClick={() => onSelectNumber(number)}
            disabled={isCompleted}
            style={{ animationDelay }}
            className={`
              aspect-square flex items-center justify-center text-4xl md:text-5xl font-bold rounded-xl md:rounded-2xl 
              shadow-md transition-all duration-300
              ${
                isCompleted
                  ? "bg-green-100 text-green-700 border-4 border-green-500 cursor-not-allowed opacity-80"
                  : isHighlighted && isTieBreaker
                  ? "bg-purple-100 border-4 border-purple-500 text-purple-900 hover:bg-purple-200 hover:shadow-lg animate-pulse"
                  : isHighlighted
                  ? "bg-blue-100 border-4 border-blue-500 text-blue-900 hover:bg-blue-200 hover:shadow-lg animate-pulse"
                  : isTieBreaker
                  ? "bg-gray-100 border-2 border-purple-300 text-purple-500 hover:bg-gray-200 hover:shadow-md"
                  : "bg-gray-100 border-2 border-gray-300 text-gray-500 hover:bg-gray-200 hover:shadow-md"
              }
              relative
              animate-fade-in hover:scale-105 active:scale-95
            `}
            aria-label={`Question ${number}${
              isCompleted ? " (completed)" : ""
            }${isHighlighted ? " (available)" : ""}${
              isTieBreaker ? " (tie breaker)" : ""
            }`}
          >
            {number}
            {isCompleted && (
              <span className="absolute -top-3 -right-3 bg-green-500 text-white w-10 h-10 rounded-full text-lg flex items-center justify-center animate-bounce">
                ✓
              </span>
            )}
            {!isCompleted && isHighlighted && (
              <span className="absolute -top-3 -right-3 bg-blue-500 text-white w-10 h-10 rounded-full text-lg flex items-center justify-center animate-ping-slow">
                !
              </span>
            )}
            {isTieBreaker && !isCompleted && (
              <span className="absolute -top-3 -left-3 bg-purple-500 text-white w-8 h-8 rounded-full text-xs flex items-center justify-center">
                TIE
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default NumberGrid;
