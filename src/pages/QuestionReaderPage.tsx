import { useState } from "react";
import { Button } from "../components/ui/button";
import { additionalQuestions } from "../data/additionalQuestions";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function QuestionReaderPage() {
  const navigate = useNavigate();
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);

  const handleNumberSelect = (number: number) => {
    setSelectedQuestion(number);
    // Scroll to question display
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 100);
  };

  const handleBackToHome = () => {
    navigate("/");
    setTimeout(() => {
      const playerListSection = document.querySelector(".player-list-section");
      if (playerListSection) {
        const elementPosition = playerListSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - 100;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }, 100);
  };

  const question = selectedQuestion
    ? additionalQuestions[selectedQuestion - 1]
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      {/* Back to Home button */}
      <Button
        onClick={handleBackToHome}
        variant="ghost"
        className="mb-4 md:mb-8 text-blue-600 text-lg md:text-xl"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 mr-2" />
        <span className="hidden sm:inline">ወደ ተጫዋች ዝርዝር ተመለስ</span>
        <span className="sm:hidden">ተመለስ</span>
      </Button>

      <div className="container mx-auto max-w-9xl">
        {/* Header */}
        <div className="mb-6 md:mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-blue-900">
            ጥያቄዎችን ያንብቡ
          </h2>
        </div>

        {/* Number Grid */}
        <div className="mb-6 md:mb-10">
          <div className="relative bg-white rounded-2xl shadow-xl p-4 md:p-6 lg:p-10">
            <div
              className={`grid grid-cols-3 md:grid-cols-6 lg:grid-cols-10 gap-3 md:gap-4 lg:gap-6 w-full mx-auto`}
            >
              {additionalQuestions.map((_, index) => {
                const number = index + 1;
                const isSelected = selectedQuestion === number;

                return (
                  <button
                    key={number}
                    onClick={() => handleNumberSelect(number)}
                    className={`aspect-square flex items-center justify-center text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold rounded-xl shadow-md transition-all duration-300 ${
                      isSelected
                        ? "bg-blue-500 text-white border-4 border-blue-600"
                        : "bg-gray-100 border-2 border-gray-300 text-gray-500 hover:bg-gray-200 hover:shadow-lg"
                    }`}
                  >
                    {number}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Question Display */}
        {question && (
          <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 lg:p-10">
            {/* Question Number */}
            <div className="mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-blue-900">
                ጥያቄ ቁጥር {selectedQuestion}
              </h2>
            </div>

            {/* Question Text */}
            <div className="bg-blue-50 rounded-xl p-4 md:p-6 lg:p-8 mb-6 md:mb-8">
              <p className="text-lg md:text-xl lg:text-2xl xl:text-3xl text-gray-800 leading-relaxed">
                {question.question}
              </p>
            </div>

            {/* Answer Options */}
            <div className="space-y-3 md:space-y-4">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-medium text-blue-900 mb-4 md:mb-6">
                ምርጫ
              </h3>
              <div className="grid grid-cols-1 gap-3 md:gap-4">
                {question.options.map((option, index) => (
                  <div
                    key={index}
                    className="p-3 md:p-4 lg:p-6 rounded-xl border-2 border-gray-300 bg-gray-50"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center border-2 border-gray-400 mr-3 md:mr-4">
                        <span className="text-sm md:text-base">
                          {["ሀ", "ለ", "ሐ", "መ", "ሠ"][index]}
                        </span>
                      </div>
                      <span className="text-lg md:text-xl lg:text-2xl font-medium">
                        {option}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestionReaderPage;
