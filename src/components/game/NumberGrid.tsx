import React from "react";
import { Question } from "../../data/questions";
import { useGameStore } from "../../store/gameStore";

interface NumberGridProps {
  questions: Question[];
  onSelectNumber: (number: number) => void;
  completedNumbers: number[];
  currentRoundCompleted: number[];
  highlightedNumbers?: number[];
  tieBreakers?: number[];
}

const NumberGrid: React.FC<NumberGridProps> = ({
  questions,
  onSelectNumber,
  completedNumbers,
  currentRoundCompleted,
  highlightedNumbers = [],
  tieBreakers = [],
}) => {
  const activeQuestionType = useGameStore((state) => state.activeQuestionType);
  const setActiveQuestionType = useGameStore(
    (state) => state.setActiveQuestionType
  );

  // Get previous round completed numbers (questions from all rounds except current)
  const previousRoundCompleted = completedNumbers.filter(
    (num: number) => !currentRoundCompleted.includes(num)
  );

  // Filter out only previous round completed numbers (hide them completely)
  const availableQuestions = questions.filter(
    (q: Question) => !previousRoundCompleted.includes(q.id)
  );

  // Group questions by type
  const choiceQuestions = availableQuestions.filter(
    (q: Question) => q.type === "choice" || !q.type
  );
  const explanationQuestions = availableQuestions.filter(
    (q: Question) => q.type === "explanation"
  );

  const renderGridSection = (sectionQuestions: Question[]) => {
    if (sectionQuestions.length === 0) return null;

    // Calculate rows based on columns (12 columns on lg screens)
    const cols = 12;
    const rows = Math.ceil(sectionQuestions.length / cols);

    return (
      <div className="mb-8">
        {/* <div className="flex items-center gap-4">
          <h3 className="text-xl md:text-2xl font-bold text-blue-900 whitespace-nowrap">
            {title}
          </h3>
          <div className="h-px bg-blue-200 w-full" />
        </div> */}
        <div
          className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-1.5 sm:gap-2 md:gap-2 w-full md:p-2"
          style={{
            gridTemplateRows: `repeat(${rows}, minmax(48px, 1fr))`,
          }}
        >
          {sectionQuestions.map((question, index) => {
            const number = question.id;
            const isCompleted = currentRoundCompleted.includes(number);
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
    );
  };

  return (
    <div className="w-full h-full flex flex-col  overflow-hidden p-2">
      {/* Tab Switcher */}
      <div className="flex p-1 bg-blue-50/50 rounded-xl border border-blue-100 self-center">
        <button
          onClick={() => setActiveQuestionType("choice")}
          className={`px-6 rounded-lg text-lg font-bold transition-all ${
            activeQuestionType === "choice"
              ? "bg-white text-blue-600 shadow-md transform scale-105"
              : "text-blue-400 hover:text-blue-500 hover:bg-white/50"
          }`}
        >
          ምርጫ ጥያቄዎች
          <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
            {choiceQuestions.length}
          </span>
        </button>
        <button
          onClick={() => setActiveQuestionType("explanation")}
          className={`px-6 py-2.5 rounded-lg text-lg font-bold transition-all ${
            activeQuestionType === "explanation"
              ? "bg-white text-blue-600 shadow-md transform scale-105"
              : "text-blue-400 hover:text-blue-500 hover:bg-white/50"
          }`}
        >
          የማብራሪያ ጥያቄዎች
          <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
            {explanationQuestions.length}
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {activeQuestionType === "choice"
          ? renderGridSection(choiceQuestions)
          : renderGridSection(explanationQuestions)}
      </div>
    </div>
  );
};

export default NumberGrid;
