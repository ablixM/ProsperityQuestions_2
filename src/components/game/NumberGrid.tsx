import { FC } from "react";
import { useGameStore } from "../../store/gameStore";
import { User } from "lucide-react";

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
  const currentPlayer = useGameStore((state) => state.getCurrentPlayer());

  const getMaxQuestionsPerPlayer = useGameStore(
    (state) => state.getMaxQuestionsPerPlayer
  );
  const hasPlayerReachedMaxQuestions = useGameStore(
    (state) => state.hasPlayerReachedMaxQuestions
  );

  // Generate numbers array from 1 to totalNumbers
  const numbers = Array.from({ length: totalNumbers }, (_, i) => i + 1);

  // Calculate player's question limit
  const playerQuestionLimit = currentPlayer ? getMaxQuestionsPerPlayer() : 0;
  const isPlayerInTieBreaker = currentPlayer
    ? hasPlayerReachedMaxQuestions(currentPlayer.id)
    : false;

  // Calculate rows based on columns (10 columns on lg screens)
  const cols = 10;
  const rows = Math.ceil(totalNumbers / cols);

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-2 md:gap-4 overflow-hidden">
      {/* Player Info Section - Compact, no scroll */}
      {currentPlayer && (
        <div className="flex-none lg:w-64 xl:w-72">
          <div className="bg-white rounded-xl shadow-lg p-2 md:p-4 border border-blue-100 h-full">
            <div className="flex flex-row lg:flex-col items-center gap-3 lg:gap-4 lg:space-y-2">
              {/* Profile Image - Responsive Size */}
              <div className="flex-none w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden border-2 md:border-4 border-blue-200 bg-blue-50 flex items-center justify-center">
                {currentPlayer.profileImage ? (
                  <img
                    src={currentPlayer.profileImage}
                    alt={`${currentPlayer.name}'s profile`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-blue-400" />
                )}
              </div>

              {/* Player Details */}
              <div className="flex-1 flex flex-col lg:items-center text-left lg:text-center min-w-0">
                <h2 className="text-base md:text-lg lg:text-xl font-bold text-blue-900 truncate w-full">
                  {currentPlayer.name}
                </h2>
                <div className="flex flex-wrap gap-1 md:gap-2 mt-1 justify-start lg:justify-center">
                  {currentPlayer.woreda && (
                    <div className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-semibold truncate max-w-[100px]">
                      {currentPlayer.woreda}
                    </div>
                  )}
                  <div className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                    {currentPlayer.score} ነጥቦች
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Stats - Compact Grid */}
            <div className="grid grid-cols-2 gap-2 mt-2 lg:mt-4 w-full">
              <div className="bg-blue-50 p-1.5 md:p-2 rounded-lg text-center">
                <p className="text-blue-500 text-[10px] md:text-xs font-medium uppercase">
                  ጥያቄዎች
                </p>
                <p className="text-sm md:text-base font-bold text-blue-800 truncate">
                  {currentPlayer.questionsAnswered.length}/{playerQuestionLimit}
                  {isPlayerInTieBreaker && " +"}
                </p>
              </div>
              <div className="bg-green-50 p-1.5 md:p-2 rounded-lg text-center">
                <p className="text-green-500 text-[10px] md:text-xs font-medium uppercase">
                  ትክክል
                </p>
                <p className="text-sm md:text-base font-bold text-green-800">
                  {currentPlayer.correctAnswers}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Number Grid - Flex Grow, scrollable on small screens */}
      <div className="flex-1 min-h-0 min-w-0 overflow-auto">
        <div
          className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5 sm:gap-2 md:gap-2 w-full"
          style={{
            // On small screens: use fixed row height for scrolling
            // On larger screens: use 1fr to fit screen
            gridTemplateRows: `repeat(${rows}, minmax(48px, 1fr))`,
          }}
        >
          {numbers.map((number, index) => {
            const isCompleted = completedNumbers.includes(number);
            const isHighlighted = highlightedNumbers.includes(number);
            const isTieBreaker = tieBreakers.includes(number);
            const animationDelay = `${index * 0.02}s`;

            return (
              <button
                key={number}
                onClick={() => onSelectNumber(number)}
                disabled={isCompleted}
                style={{ animationDelay }}
                className={`
                  w-full min-h-[48px] sm:min-h-[56px] md:min-h-[68px] lg:min-h-[72px] 
                  flex items-center justify-center text-base sm:text-lg md:text-xl lg:text-2xl font-bold rounded-md md:rounded-lg
                  shadow-sm transition-all duration-200
                  ${
                    isCompleted
                      ? "bg-green-100 text-green-700 border-2 border-green-500 cursor-not-allowed opacity-70"
                      : isHighlighted && isTieBreaker
                      ? "bg-purple-100 border-2 md:border-3 border-purple-500 text-purple-900 hover:bg-purple-200 hover:shadow-lg animate-pulse"
                      : isHighlighted
                      ? "bg-blue-100 border-2 md:border-3 border-blue-500 text-blue-900 hover:bg-blue-200 hover:shadow-lg animate-pulse"
                      : isTieBreaker
                      ? "bg-gray-100 border border-purple-300 text-purple-500 hover:bg-gray-200 hover:shadow-md"
                      : "bg-gray-100 border border-gray-300 text-gray-500 hover:bg-gray-200 hover:shadow-md"
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
                  <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-green-500 text-white w-4 h-4 md:w-5 md:h-5 rounded-full text-[10px] md:text-xs flex items-center justify-center shadow-sm">
                    ✓
                  </span>
                )}
                {!isCompleted && isHighlighted && (
                  <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-blue-500 text-white w-4 h-4 md:w-5 md:h-5 rounded-full text-[10px] md:text-xs flex items-center justify-center animate-ping-slow shadow-sm">
                    !
                  </span>
                )}
                {isTieBreaker && !isCompleted && (
                  <span className="absolute -top-1 -left-1 md:-top-2 md:-left-2 bg-purple-500 text-white w-4 h-4 md:w-5 md:h-5 rounded-full text-[8px] md:text-[10px] flex items-center justify-center shadow-sm">
                    TIE
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NumberGrid;
