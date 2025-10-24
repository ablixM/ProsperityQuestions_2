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

  // Determine grid columns based on totalNumbers
  const getGridCols = () => {
    return "grid-cols-3 md:grid-cols-66 lg:grid-cols-10";
  };

  // Calculate player's question limit
  const playerQuestionLimit = currentPlayer ? getMaxQuestionsPerPlayer() : 0;
  const isPlayerInTieBreaker = currentPlayer
    ? hasPlayerReachedMaxQuestions(currentPlayer.id)
    : false;

  return (
    <div className="w-full flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8">
      {/* Player Info Section */}
      {currentPlayer && (
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 lg:w-[350px] flex-shrink-0">
          <div className="flex flex-col items-center justify-center space-y-3 md:space-y-4">
            {/* Profile Image */}
            <div className="w-24 h-24 md:w-28 lg:w-32 h-24 md:h-28 lg:h-32 rounded-full overflow-hidden border-4 border-blue-200 flex items-center justify-center bg-blue-50">
              {currentPlayer.profileImage ? (
                <img
                  src={currentPlayer.profileImage}
                  alt={`${currentPlayer.name}'s profile`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 md:w-14 lg:w-16 h-12 md:h-14 lg:h-16 text-blue-400" />
              )}
            </div>

            {/* Player Details */}
            <div className="flex flex-col items-center text-center w-full">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-900 mb-2 md:mb-3">
                {currentPlayer.name}
              </h2>
              <div className="flex flex-col w-full gap-2 md:gap-3">
                {currentPlayer.woreda && (
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 md:px-4 md:py-2 rounded-full text-lg md:text-xl font-bold">
                    የህብረት ስም፡ {currentPlayer.woreda}
                  </div>
                )}
                <div className="bg-green-100 text-green-800 px-3 py-1 md:px-4 md:py-2 rounded-full text-lg md:text-xl font-bold">
                  {currentPlayer.score} ነጥቦች
                </div>
              </div>
            </div>

            {/* Progress Stats */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 w-full mt-3 md:mt-4">
              <div className="bg-blue-50 p-3 md:p-4 rounded-xl text-center">
                <p className="text-blue-500 text-sm md:text-base lg:text-lg font-medium">
                  ጥያቄዎች
                </p>
                <p className="text-lg md:text-xl lg:text-2xl font-bold text-blue-800">
                  {currentPlayer.questionsAnswered.length}/{playerQuestionLimit}
                  {isPlayerInTieBreaker && " + ታይ"}
                </p>
              </div>
              <div className="bg-green-50 p-3 md:p-4 rounded-xl text-center">
                <p className="text-green-500 text-sm md:text-base lg:text-lg font-medium">
                  ትክክል
                </p>
                <p className="text-lg md:text-xl lg:text-2xl font-bold text-green-800">
                  {currentPlayer.correctAnswers}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Number Grid */}
      <div className="flex-grow">
        <div
          className={`grid ${getGridCols()} gap-4 md:gap-6 lg:gap-8 w-full mx-auto`}
        >
          {numbers.map((number, index) => {
            const isCompleted = completedNumbers.includes(number);
            const isHighlighted = highlightedNumbers.includes(number);
            const isTieBreaker = tieBreakers.includes(number);
            const animationDelay = `${index * 0.1}s`;

            return (
              <button
                key={number}
                onClick={() => onSelectNumber(number)}
                disabled={isCompleted}
                style={{ animationDelay }}
                className={`
                  aspect-square flex items-center justify-center text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold rounded-xl md:rounded-xl
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
      </div>
    </div>
  );
};

export default NumberGrid;
