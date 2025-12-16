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

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 overflow-hidden">
      {/* Player Info Section - Scrollable if needed, fixing fit */}
      {currentPlayer && (
        <div className="flex-none lg:flex-1 lg:max-w-xs overflow-y-auto custom-scrollbar">
          <div className="bg-white rounded-xl shadow-lg p-2 md:p-4 border border-blue-100 h-full">
            <div className="flex flex-row lg:flex-col items-center gap-3 lg:gap-4 lg:space-y-2">
              {/* Profile Image - Responsive Size */}
              <div className="flex-none w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden border-2 md:border-4 border-blue-200 bg-blue-50 flex items-center justify-center">
                {currentPlayer.profileImage ? (
                  <img
                    src={currentPlayer.profileImage}
                    alt={`${currentPlayer.name}'s profile`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-blue-400" />
                )}
              </div>

              {/* Player Details */}
              <div className="flex-1 flex flex-col lg:items-center text-left lg:text-center min-w-0">
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-blue-900 truncate w-full">
                  {currentPlayer.name}
                </h2>
                <div className="flex flex-wrap gap-2 mt-1 justify-start lg:justify-center">
                  {currentPlayer.woreda && (
                    <div className="bg-blue-100 text-blue-800 text-xs md:text-sm px-2 py-1 rounded-full font-semibold truncate max-w-[120px]">
                      {currentPlayer.woreda}
                    </div>
                  )}
                  <div className="bg-green-100 text-green-800 text-xs md:text-sm px-2 py-1 rounded-full font-semibold whitespace-nowrap">
                    {currentPlayer.score} ነጥቦች
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Stats - Compact Grid */}
            <div className="grid grid-cols-2 gap-2 mt-2 lg:mt-6 w-full">
              <div className="bg-blue-50 p-2 rounded-lg text-center">
                <p className="text-blue-500 text-xs font-medium uppercase">
                  ጥያቄዎች
                </p>
                <p className="text-base md:text-lg font-bold text-blue-800 truncate">
                  {currentPlayer.questionsAnswered.length}/{playerQuestionLimit}
                  {isPlayerInTieBreaker && " +"}
                </p>
              </div>
              <div className="bg-green-50 p-2 rounded-lg text-center">
                <p className="text-green-500 text-xs font-medium uppercase">
                  ትክክል
                </p>
                <p className="text-base md:text-lg font-bold text-green-800">
                  {currentPlayer.correctAnswers}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Number Grid - Flex Grow & Scrollable */}
      <div className="flex-1 h-full min-h-0 overflow-y-auto custom-scrollbar p-1">
        <div
          className={`grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 md:gap-3 lg:gap-4 w-full auto-rows-min`}
        >
          {numbers.map((number, index) => {
            const isCompleted = completedNumbers.includes(number);
            const isHighlighted = highlightedNumbers.includes(number);
            const isTieBreaker = tieBreakers.includes(number);
            const animationDelay = `${index * 0.05}s`;

            return (
              <button
                key={number}
                onClick={() => onSelectNumber(number)}
                disabled={isCompleted}
                style={{ animationDelay }}
                className={`
                  aspect-square flex items-center justify-center text-xl md:text-2xl lg:text-3xl font-bold rounded-lg md:rounded-xl
                  shadow-sm md:shadow-md transition-all duration-200
                  ${
                    isCompleted
                      ? "bg-green-100 text-green-700 border-2 border-green-500 cursor-not-allowed opacity-70"
                      : isHighlighted && isTieBreaker
                      ? "bg-purple-100 border-2 md:border-4 border-purple-500 text-purple-900 hover:bg-purple-200 hover:shadow-lg animate-pulse"
                      : isHighlighted
                      ? "bg-blue-100 border-2 md:border-4 border-blue-500 text-blue-900 hover:bg-blue-200 hover:shadow-lg animate-pulse"
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
                  <span className="absolute -top-2 -right-2 md:-top-3 md:-right-3 bg-green-500 text-white w-6 h-6 md:w-8 md:h-8 rounded-full text-sm md:text-base flex items-center justify-center shadow-sm">
                    ✓
                  </span>
                )}
                {!isCompleted && isHighlighted && (
                  <span className="absolute -top-2 -right-2 md:-top-3 md:-right-3 bg-blue-500 text-white w-6 h-6 md:w-8 md:h-8 rounded-full text-sm md:text-base flex items-center justify-center animate-ping-slow shadow-sm">
                    !
                  </span>
                )}
                {isTieBreaker && !isCompleted && (
                  <span className="absolute -top-2 -left-2 md:-top-3 md:-left-3 bg-purple-500 text-white w-6 h-6 md:w-8 md:h-8 rounded-full text-[10px] md:text-xs flex items-center justify-center shadow-sm">
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
