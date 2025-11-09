import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  X,
  User,
} from "lucide-react";
import { additionalQuestions } from "../data/additionalQuestions";
import { useGameStore } from "../store/gameStore";
import { ResultDialog } from "../components/ui/dialog";
import useSound from "use-sound";
import CountdownTimer from "../components/game/CountdownTimer";

const QuestionPage = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const questionNumber = parseInt(questionId || "0", 10);

  // Global state from Zustand
  const {
    markQuestionAsCompleted,
    isQuestionCompleted,
    getCurrentPlayer,

    getMaxQuestionsPerPlayer,
    hasPlayerReachedMaxQuestions,
  } = useGameStore();

  const currentPlayer = getCurrentPlayer();

  // Calculate player's question limit
  const playerQuestionLimit = currentPlayer ? getMaxQuestionsPerPlayer() : 0;
  const isPlayerInTieBreaker = currentPlayer
    ? hasPlayerReachedMaxQuestions(currentPlayer.id)
    : false;

  // Get the question data
  const question = additionalQuestions[questionNumber - 1] || null;

  // UI state
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(
    null
  );
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [isPreviouslyAnswered, setIsPreviouslyAnswered] = useState(false);
  const [timeIsUp, setTimeIsUp] = useState(false);
  const [forceStopTimer, setForceStopTimer] = useState(false);

  // New state for enhanced answer handling
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [showIncorrectFeedback, setShowIncorrectFeedback] = useState(false);
  const [incorrectAnswers, setIncorrectAnswers] = useState<number[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const [playError] = useSound("/sounds/error.mp3", { volume: 0.4 });
  const [playCorrect] = useSound("/sounds/correct.mp3", { volume: 0.4 });

  // Check if this question was previously answered
  useEffect(() => {
    if (questionNumber && isQuestionCompleted(questionNumber)) {
      // Get the current player to check if they already answered this question
      // in a previous session (not the current one)
      const player = getCurrentPlayer();
      if (player && player.questionsAnswered.includes(questionNumber)) {
        // If the question is the last one they answered, it's the current question - don't mark as previously answered
        const isLastAnsweredQuestion =
          player.questionsAnswered.length > 0 &&
          player.questionsAnswered[player.questionsAnswered.length - 1] ===
            questionNumber;

        setIsPreviouslyAnswered(!isLastAnsweredQuestion);
      }
    }

    // If the question doesn't exist or there's no current player, go back to game
    if (!question || !currentPlayer) {
      navigate("/game");
    }
  }, [
    questionNumber,
    isQuestionCompleted,
    question,
    currentPlayer,
    navigate,
    getCurrentPlayer,
  ]);

  // Hide incorrect feedback after 3 seconds
  useEffect(() => {
    let feedbackTimer: number | undefined;

    if (showIncorrectFeedback) {
      feedbackTimer = window.setTimeout(() => {
        setShowIncorrectFeedback(false);
      }, 3000);
    }

    return () => {
      if (feedbackTimer) {
        clearTimeout(feedbackTimer);
      }
    };
  }, [showIncorrectFeedback]);

  const handleTimeUp = () => {
    setTimeIsUp(true);
    setTimerRunning(false);
    setForceStopTimer(true);
    setIsAnswered(true);
    setShowCorrectAnswer(true);

    // Mark the question as incorrect due to timeout
    if (question) {
      setSelectedAnswerIndex(question.correctAnswer);
      setIsCorrect(false);
      markQuestionAsCompleted(questionNumber, question.correctAnswer, false);
      playError();
      setShowResultDialog(true);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (
      isAnswered ||
      isPreviouslyAnswered ||
      incorrectAnswers.includes(answerIndex)
    )
      return;

    // Always save the selected answer for UI display
    setSelectedAnswerIndex(answerIndex);

    // Force stop the timer when an answer is clicked
    setTimerRunning(false);
    setForceStopTimer(true);
    console.log("Timer forced to stop by answer selection");

    if (answerIndex === question?.correctAnswer) {
      // Correct answer handling
      playCorrect();
      setIsAnswered(true);
      setIsCorrect(true);
      setShowCorrectAnswer(true);

      // Mark question as completed with correct answer
      markQuestionAsCompleted(questionNumber, answerIndex, true);

      // Show result dialog
      setShowResultDialog(true);
    } else {
      // Incorrect answer handling
      playError();

      // Add to incorrect answers list to disable and mark as red
      setIncorrectAnswers((prev) => [...prev, answerIndex]);

      // Mark question as incorrect on first wrong attempt
      markQuestionAsCompleted(questionNumber, answerIndex, false);

      setIncorrectAttempts((prev) => prev + 1);
      setShowIncorrectFeedback(true);
      setFeedbackMessage(`ጥያቄው በትክክል አልተመለሰም! )`);

      // Check if this is the third incorrect attempt
      if (incorrectAttempts >= 2) {
        setIsAnswered(true);
        setIsCorrect(false);
        setShowCorrectAnswer(true);

        // Show result dialog
        setShowResultDialog(true);
      } else {
        // Allow retry - don't set isAnswered to true
        // Reset selection after showing feedback
        setTimeout(() => {
          setSelectedAnswerIndex(null);
        }, 300);
      }
    }
  };

  const handleRevealAnswer = () => {
    setShowCorrectAnswer(true);
    setForceStopTimer(true);
    setTimerRunning(false);

    // If not already answered, mark as incorrect and complete
    if (!isAnswered && !isPreviouslyAnswered) {
      setIsAnswered(true);
      setIsCorrect(false);

      // Mark as completed with currently selected answer (or null)
      markQuestionAsCompleted(
        questionNumber,
        selectedAnswerIndex !== null ? selectedAnswerIndex : -1,
        false
      );
    }
  };

  const handleBackToGame = () => {
    navigate("/");
    // Scroll to top when going back to number grid
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const handleCloseResultDialog = () => {
    setShowResultDialog(false);
    // Scroll to top when going back to number grid after answering
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const handleCloseFeedback = () => {
    setShowIncorrectFeedback(false);
  };

  // Handle timer actions
  const handleStartTimer = () => {
    setForceStopTimer(false);
    setTimerRunning(true);
    console.log("Starting timer");
  };

  const handlePauseTimer = () => {
    setTimerRunning(false);
    console.log("Pausing timer");
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setForceStopTimer(false);
  };

  if (!question || !currentPlayer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8 relative">
      {/* Feedback Popup */}
      {showIncorrectFeedback && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
          <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 md:px-8 py-4 rounded-xl shadow-lg max-w-md animate-bounce pointer-events-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
                <p className="text-sm md:text-lg font-medium">
                  {feedbackMessage}
                </p>
              </div>
              <button
                title="close"
                type="button"
                onClick={handleCloseFeedback}
                className="ml-2 md:ml-4 text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-9xl">
        {/* Top bar with navigation */}
        <div className="mb-4 md:mb-8">
          <Button
            onClick={handleBackToGame}
            variant="ghost"
            className="text-blue-600 text-lg md:text-xl"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 mr-2" />
            <span className="hidden sm:inline">ወደ ተጫዋች ዝርዝር ተመለስ</span>
            <span className="sm:hidden">ተመለስ</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
          {/* Player Profile Card - Takes 2 columns on large screens */}
          {currentPlayer && !isPreviouslyAnswered && (
            <div className="lg:col-span-2 order-2 lg:order-1">
              <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 sticky top-4 md:top-8">
                <div className="flex flex-col items-center">
                  {/* Profile Image */}
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-blue-200 flex items-center justify-center bg-blue-50 mb-3 md:mb-4">
                    {currentPlayer.profileImage ? (
                      <img
                        src={currentPlayer.profileImage}
                        alt={`${currentPlayer.name}'s profile`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 md:w-16 md:h-16 text-blue-400" />
                    )}
                  </div>

                  {/* Player Name */}
                  <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-blue-900 mb-2 text-center">
                    {currentPlayer.name}
                  </h3>

                  {/* Woreda Badge */}
                  {currentPlayer.woreda && (
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 md:px-4 md:py-2 rounded-full text-sm md:text-lg font-bold mb-3 md:mb-4">
                      የህብረት ስም፡ {currentPlayer.woreda}
                    </div>
                  )}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 gap-3 md:gap-4 w-full mt-3 md:mt-4">
                    <div className="bg-blue-50 p-2 md:p-3 rounded-xl text-center">
                      <p className="text-blue-500 text-xs md:text-sm font-medium">
                        ነጥቦች
                      </p>
                      <p className="text-lg md:text-xl lg:text-2xl font-bold text-blue-800">
                        {currentPlayer.score}
                      </p>
                    </div>
                    <div className="bg-green-50 p-2 md:p-3 rounded-xl text-center">
                      <p className="text-green-500 text-xs md:text-sm font-medium">
                        ትክክል
                      </p>
                      <p className="text-lg md:text-xl lg:text-2xl font-bold text-green-800">
                        {currentPlayer.correctAnswers}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-2 md:p-3 rounded-xl text-center">
                      <p className="text-purple-500 text-xs md:text-sm font-medium">
                        ጥያቄዎች
                      </p>
                      <p className="text-lg md:text-xl lg:text-2xl font-bold text-purple-800">
                        {currentPlayer.questionsAnswered.length}/
                        {playerQuestionLimit}
                        {isPlayerInTieBreaker && " + መለይ"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Question Card - Takes 7 columns on large screens */}
          <div className="lg:col-span-7 bg-white rounded-2xl shadow-xl p-4 md:p-6 lg:p-10 order-1 lg:order-2">
            {/* Question Number */}
            <div className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-blue-900">
                ጥያቄ ቁጥር {questionNumber}
              </h2>

              {isPreviouslyAnswered && (
                <div className="bg-green-100 text-green-700 px-3 py-1 md:px-4 md:py-2 rounded-full text-sm md:text-lg lg:text-xl font-medium flex items-center">
                  <CheckCircle2 className="w-4 h-4 md:w-6 md:h-6 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">አስቀድሞ የተመለሰ</span>
                  <span className="sm:hidden">የተመለሰ</span>
                </div>
              )}

              {!isPreviouslyAnswered &&
                incorrectAttempts > 0 &&
                !isAnswered && (
                  <div className="bg-amber-100 text-amber-700 px-3 py-1 md:px-4 md:py-2 rounded-full text-sm md:text-lg lg:text-xl font-medium flex items-center">
                    <AlertTriangle className="w-4 h-4 md:w-6 md:h-6 mr-1 md:mr-2" />
                    ሙከራዎች: {incorrectAttempts}/3
                  </div>
                )}
            </div>

            {/* Question Text */}
            <div className="bg-blue-50 rounded-xl p-4 md:p-6 lg:p-8 mb-6 md:mb-10">
              <p className="text-lg md:text-xl lg:text-2xl xl:text-3xl text-gray-800 leading-relaxed">
                {question.question}
              </p>
            </div>

            {/* Answer Options */}
            <div className="space-y-3 md:space-y-4 mb-6 md:mb-10">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-medium text-blue-900 mb-4 md:mb-6">
                ምርጫ
              </h3>
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                {question.options.map((option, index) => {
                  const isSelected = selectedAnswerIndex === index;
                  const isCorrectAnswer = question.correctAnswer === index;
                  const isIncorrectSelected = incorrectAnswers.includes(index);

                  let optionClass =
                    "border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50";

                  if (isIncorrectSelected) {
                    optionClass =
                      "border-2 border-red-400 bg-red-50 opacity-60";
                  } else if (isAnswered && showCorrectAnswer) {
                    if (isSelected && isCorrect) {
                      optionClass = "border-2 border-green-500 bg-green-50";
                    } else if (isSelected && !isCorrect) {
                      optionClass = "border-2 border-red-500 bg-red-50";
                    } else if (isCorrectAnswer) {
                      optionClass = "border-2 border-green-500 bg-green-50";
                    }
                  } else if (isSelected) {
                    optionClass = "border-2 border-blue-500 bg-blue-50";
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => {
                        setForceStopTimer(true);
                        handleAnswerSelect(index);
                      }}
                      className={`p-3 md:p-4 lg:p-6 rounded-xl text-left transition-all ${optionClass} ${
                        (isAnswered && showCorrectAnswer) ||
                        isPreviouslyAnswered ||
                        isIncorrectSelected
                          ? "cursor-default"
                          : "cursor-pointer hover:shadow-lg"
                      }`}
                      disabled={
                        (isAnswered && showCorrectAnswer) ||
                        isPreviouslyAnswered ||
                        isIncorrectSelected
                      }
                    >
                      <div className="flex items-center">
                        <div
                          className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 ${
                            isIncorrectSelected
                              ? "border-red-500 bg-red-500 text-white"
                              : isSelected
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-gray-400"
                          }`}
                        >
                          <span className="text-sm md:text-base">
                            {["ሀ", "ለ", "ሐ", "መ", "ሠ"][index]}
                          </span>
                        </div>
                        <span className="ml-3 md:ml-4 text-lg md:text-xl lg:text-2xl font-medium">
                          {option}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status Messages */}
            {timeIsUp && (
              <div className="p-4 md:p-6 bg-red-50 text-red-600 rounded-xl text-center text-lg md:text-xl lg:text-2xl font-medium mb-6 md:mb-8">
                <div className="flex items-center justify-center">
                  <XCircle className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3" />
                  የጥያቄው ጊዜ ገደብ አልቋል
                </div>
              </div>
            )}

            {isAnswered && isCorrect && (
              <div className="p-4 md:p-6 bg-green-50 text-green-600 rounded-xl text-center text-lg md:text-xl lg:text-2xl font-medium mb-6 md:mb-8">
                <div className="flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3" />
                  ጥያቄው በትክክል ተመልሷል!
                </div>
              </div>
            )}

            {isAnswered &&
              isCorrect === false &&
              showCorrectAnswer &&
              !timeIsUp && (
                <div className="p-4 md:p-6 bg-red-50 text-red-600 rounded-xl text-center text-lg md:text-xl lg:text-2xl font-medium mb-6 md:mb-8">
                  <div className="flex items-center justify-center">
                    <XCircle className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3" />
                    ጥያቄው በትክክል አልተመለሰም!
                  </div>
                </div>
              )}

            {/* Admin Controls */}
            {!isPreviouslyAnswered && !isAnswered && (
              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleRevealAnswer}
                  variant="outline"
                  className="text-blue-600 border-blue-300 flex items-center gap-2 text-sm md:text-base"
                >
                  <Eye className="w-4 h-4 md:w-5 md:h-5" />
                  ትክክለኛዉን መልስ አሳይ
                </Button>
              </div>
            )}
          </div>

          {/* Timer Card - Takes 3 columns on large screens */}
          <div className="lg:col-span-3 order-3">
            {!isPreviouslyAnswered && (
              <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 lg:p-8 h-full flex flex-col">
                {/* Timer Component */}
                <CountdownTimer
                  duration={60}
                  isRunning={timerRunning}
                  forceStop={forceStopTimer}
                  onTimeUp={handleTimeUp}
                  onStart={handleStartTimer}
                  onStop={handlePauseTimer}
                  onReset={handleResetTimer}
                />

                {/* Answer Status */}
                {isAnswered && isCorrect && (
                  <div className="mt-4 md:mt-6 p-3 md:p-4 bg-green-50 text-green-700 rounded-xl text-center">
                    <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 text-green-500" />
                    <h4 className="font-bold text-base md:text-lg">
                      በትክክል ተመልሷል!
                    </h4>
                  </div>
                )}

                {isAnswered && isCorrect === false && incorrectAttempts > 0 && (
                  <div className="mt-4 md:mt-6 p-3 md:p-4 bg-red-50 text-red-700 rounded-xl text-center">
                    <XCircle className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 text-red-500" />
                    <h4 className="font-bold text-base md:text-lg">አልተመለሰም</h4>
                  </div>
                )}

                {/* Attempt Counter */}
                {incorrectAttempts > 0 && !isAnswered && (
                  <div className="mt-4 md:mt-6 p-3 md:p-4 bg-blue-50 text-blue-700 rounded-xl text-center">
                    <h4 className="font-bold mb-1 text-sm md:text-base">
                      ሙክራዎች
                    </h4>
                    <div className="flex justify-center gap-2">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${
                            i < incorrectAttempts ? "bg-red-500" : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col items-center justify-center w-full p-3 md:p-4 mt-4 md:mt-6">
                  <div className="w-32 h-32 md:w-48 md:h-48 bg-amber-200 flex items-center justify-center rounded-xl">
                    <img
                      src="/image.png"
                      alt=""
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <h2 className="text-center font-bold text-lg md:text-xl lg:text-2xl mt-3 md:mt-4 px-2">
                    በየካ ክፍለ ከተማ ብልፅግና ፓርቲ ቅርንጫፍ ጽ/ቤት የፖለቲካ አቅምና ግንባታ ዘርፍ የተዘጋጀ
                  </h2>
                </div>
              </div>
            )}

            {isPreviouslyAnswered && (
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl shadow-lg p-4 md:p-6 lg:p-8 h-full flex flex-col items-center justify-center">
                <CheckCircle2 className="w-12 h-12 md:w-16 md:w-20 text-green-500 mb-3 md:mb-4" />
                <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-center text-green-700 mb-2">
                  ጥያቄው ተመልሷል
                </h3>
                <p className="text-center text-green-600 text-sm md:text-base lg:text-lg">
                  ሁሉንም ጥያቄ መልሰዋል
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Result Dialog */}
        <ResultDialog
          isOpen={showResultDialog}
          onClose={handleCloseResultDialog}
          title={isCorrect ? "በትክክል ተመልሷል! 🎉" : "ጥያቄው አልተመለሰም! ❌"}
          message=""
          confirmLabel="ወደጥያቄ ተመለስ"
          variant={isCorrect ? "success" : "danger"}
        />
      </div>
    </div>
  );
};

export default QuestionPage;
