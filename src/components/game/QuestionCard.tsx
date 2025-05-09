import { FC } from "react";
import { Question } from "../../data/questions";
import { Button } from "../ui/button";

interface QuestionCardProps {
  question: Question;
  onSelectAnswer: (answerIndex: number) => void;
  selectedAnswerIndex: number | null;
  isAnswered: boolean;
  isCorrect: boolean | null;
  onRevealAnswer: () => void;
  isPreviouslyAnswered: boolean;
  showTimeUpMessage: boolean;
}

const QuestionCard: FC<QuestionCardProps> = ({
  question,
  onSelectAnswer,
  selectedAnswerIndex,
  isAnswered,
  isCorrect,
  onRevealAnswer,
  isPreviouslyAnswered,
  showTimeUpMessage,
}) => {
  return (
    <div className="space-y-6">
      <div className="p-5 bg-blue-50 rounded-lg shadow-sm">
        <h3 className="text-xl font-medium text-blue-900 mb-1">Question:</h3>
        <p className="text-lg text-gray-800">{question.question}</p>
      </div>

      <div className="space-y-3">
        <h3 className="text-xl font-medium text-blue-900">Choose an answer:</h3>
        <div className="space-y-3">
          {question.options.map((option, index) => {
            // Determine the appropriate styles based on selection state
            const isSelected = selectedAnswerIndex === index;
            const isCorrectAnswer = question.correctAnswer === index;

            let optionClass =
              "border border-gray-300 hover:border-blue-500 hover:bg-blue-50";

            if (isAnswered) {
              if (isSelected && isCorrect) {
                optionClass = "border-2 border-green-500 bg-green-50";
              } else if (isSelected && !isCorrect) {
                optionClass = "border-2 border-red-500 bg-red-50";
              } else if (isCorrectAnswer && !isCorrect) {
                optionClass = "border-2 border-green-500 bg-green-50";
              }
            } else if (isSelected) {
              optionClass = "border-2 border-blue-500 bg-blue-50";
            }

            return (
              <button
                key={index}
                onClick={() => {
                  if (!isAnswered && !isPreviouslyAnswered) {
                    onSelectAnswer(index);
                  }
                }}
                className={`p-4 rounded-lg w-full text-left transition-all ${optionClass} ${
                  isAnswered || isPreviouslyAnswered
                    ? "cursor-default"
                    : "cursor-pointer hover:shadow-md"
                }`}
                disabled={isAnswered || isPreviouslyAnswered}
              >
                <div className="flex items-start">
                  <div
                    className={`flex-shrink-0 w-6 h-6 mt-0.5 rounded-full flex items-center justify-center border ${
                      isSelected
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-400"
                    }`}
                  >
                    {isSelected && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="ml-3 text-base">{option}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status messages */}
      {showTimeUpMessage && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md font-medium text-center">
          Time's up! You didn't answer in time.
        </div>
      )}

      {isAnswered && isCorrect && (
        <div className="p-3 bg-green-50 text-green-600 rounded-md font-medium text-center">
          Correct! Great job!
        </div>
      )}

      {isAnswered && isCorrect === false && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md font-medium text-center">
          Incorrect. The correct answer is highlighted above.
        </div>
      )}

      {isPreviouslyAnswered && (
        <div className="p-3 bg-blue-50 text-blue-600 rounded-md font-medium text-center">
          You've already answered this question correctly before.
        </div>
      )}

      {/* Reveal button */}
      {!isAnswered && !isPreviouslyAnswered && (
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            className="border-amber-500 text-amber-700 hover:bg-amber-50"
            onClick={onRevealAnswer}
          >
            Reveal Answer
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
