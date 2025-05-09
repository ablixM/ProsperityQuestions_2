import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  X,
} from "lucide-react";
import { questionsData } from "../data/questions";
import { useGameStore } from "../store/gameStore";
import { ResultDialog } from "../components/ui/dialog";
import useSound from "use-sound";

const QuestionPage = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const questionNumber = parseInt(questionId || "0", 10);

  // Global state from Zustand
  const { markQuestionAsCompleted, isQuestionCompleted, getCurrentPlayer } =
    useGameStore();

  const currentPlayer = getCurrentPlayer();

  // Get the question data
  const question = questionsData[questionNumber - 1] || null;

  // UI state
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(
    null
  );
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(45);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [isPreviouslyAnswered, setIsPreviouslyAnswered] = useState(false);
  const [timeIsUp, setTimeIsUp] = useState(false);

  // New state for enhanced answer handling
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [showIncorrectFeedback, setShowIncorrectFeedback] = useState(false);
  const [incorrectAnswers, setIncorrectAnswers] = useState<number[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const [playError] = useSound("/sounds/error.mp3", { volume: 0.4 });
  const [playTick] = useSound("/sounds/timer.wav", { volume: 0.4 });

  // Check if this question was previously answered
  useEffect(() => {
    if (questionNumber && isQuestionCompleted(questionNumber)) {
      setIsPreviouslyAnswered(true);
    }

    // If the question doesn't exist or there's no current player, go back to game
    if (!question || !currentPlayer) {
      navigate("/game");
    }
  }, [questionNumber, isQuestionCompleted, question, currentPlayer, navigate]);

  // Timer logic
  useEffect(() => {
    let timerId: number | undefined;

    if (timerRunning && !isAnswered && !isPreviouslyAnswered) {
      timerId = window.setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerId);
            handleTimeUp();
            return 0;
          }

          // Play tick sound for last 10 seconds
          if (prevTime <= 11 && prevTime > 1) {
            playTick();
          }

          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [timerRunning, isAnswered, isPreviouslyAnswered, playTick]);

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

    const isAnswerCorrect = answerIndex === question?.correctAnswer;
    setSelectedAnswerIndex(answerIndex);

    if (isAnswerCorrect) {
      // Correct answer handling
      setTimerRunning(false);
      setIsAnswered(true);
      setIsCorrect(true);
      setShowCorrectAnswer(true);

      // Mark question as completed
      markQuestionAsCompleted(questionNumber, answerIndex, true);

      // Show result dialog
      setShowResultDialog(true);
    } else {
      // Incorrect answer handling
      playError();

      // Add to incorrect answers list to disable and mark as red
      setIncorrectAnswers((prev) => [...prev, answerIndex]);

      setIncorrectAttempts((prev) => prev + 1);
      setShowIncorrectFeedback(true);
      setFeedbackMessage(
        `Incorrect! Try again! (${
          3 - incorrectAttempts - 1
        } attempts remaining)`
      );

      // Check if this is the third incorrect attempt
      if (incorrectAttempts >= 2) {
        setTimerRunning(false);
        setIsAnswered(true);
        setIsCorrect(false);
        setShowCorrectAnswer(true);

        // Mark question as completed after third attempt
        markQuestionAsCompleted(questionNumber, answerIndex, false);

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

    // If not already answered, mark as incorrect and complete
    if (!isAnswered && !isPreviouslyAnswered) {
      setIsAnswered(true);
      setIsCorrect(false);
      setTimerRunning(false);

      // Mark as completed with currently selected answer (or null)
      markQuestionAsCompleted(
        questionNumber,
        selectedAnswerIndex !== null ? selectedAnswerIndex : -1,
        false
      );
    }
  };

  const handleBackToGame = () => {
    navigate("/game");
  };

  const handleCloseResultDialog = () => {
    setShowResultDialog(false);
    // Return to game after answering
    handleBackToGame();
  };

  const handleCloseFeedback = () => {
    setShowIncorrectFeedback(false);
  };

  // Handle timer actions
  const handleStartTimer = () => {
    setTimerRunning(true);
  };

  const handlePauseTimer = () => {
    setTimerRunning(false);
  };

  const handleResetTimer = () => {
    setTimeLeft(45);
    setTimerRunning(false);
  };

  if (!question || !currentPlayer) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    if (timeLeft <= 10) return "text-red-600";
    if (timeLeft <= 30) return "text-amber-600";
    return "text-blue-600";
  };

  // Calculate progress percentage for the timer circle
  const progressPercentage = (timeLeft / 45) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8 relative">
      {/* Feedback Popup */}
      {showIncorrectFeedback && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-red-100 border-2 border-red-400 text-red-700 px-8 py-4 rounded-xl shadow-lg max-w-md animate-bounce pointer-events-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <XCircle className="w-6 h-6 mr-3" />
                <p className="text-lg font-medium">{feedbackMessage}</p>
              </div>
              <button
                onClick={handleCloseFeedback}
                className="ml-4 text-red-500 hover:text-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-7xl">
        {/* Top bar with navigation */}
        <div className="mb-8">
          <Button
            onClick={handleBackToGame}
            variant="ghost"
            className="text-blue-600 text-xl"
          >
            <ChevronLeft className="w-6 h-6 mr-2" />
            Back to Questions
          </Button>
        </div>

        {/* Player Info */}
        {/* <div className="mb-8">
          <PlayerCard player={currentPlayer} />
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question Card - Takes 3/4 of the space on large screens */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-xl p-10">
            {/* Question Number */}
            <div className="mb-8 flex justify-between items-center">
              <h2 className="text-4xl font-bold text-blue-900">
                Question {questionNumber}
              </h2>

              {isPreviouslyAnswered && (
                <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-xl font-medium flex items-center">
                  <CheckCircle2 className="w-6 h-6 mr-2" />
                  Previously Answered
                </div>
              )}

              {!isPreviouslyAnswered &&
                incorrectAttempts > 0 &&
                !isAnswered && (
                  <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-xl font-medium flex items-center">
                    <AlertTriangle className="w-6 h-6 mr-2" />
                    Attempts: {incorrectAttempts}/3
                  </div>
                )}
            </div>

            {/* Question Text */}
            <div className="bg-blue-50 rounded-xl p-8 mb-10">
              <h3 className="text-3xl font-medium text-blue-900 mb-2">
                Question:
              </h3>
              <p className="text-3xl text-gray-800 leading-relaxed">
                {question.question}
              </p>
            </div>

            {/* Answer Options */}
            <div className="space-y-4 mb-10">
              <h3 className="text-3xl font-medium text-blue-900 mb-6">
                Choose an answer:
              </h3>
              <div className="grid grid-cols-1 gap-6">
                {question.options.map((option, index) => {
                  // Determine styling based on selection and answer state
                  const isSelected = selectedAnswerIndex === index;
                  const isCorrectAnswer = question.correctAnswer === index;
                  const isIncorrectSelected = incorrectAnswers.includes(index);

                  let optionClass =
                    "border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50";

                  // Style for incorrect answers (already attempted)
                  if (isIncorrectSelected) {
                    optionClass =
                      "border-2 border-red-400 bg-red-50 opacity-60";
                  }
                  // Only highlight the correct answer if we should show it
                  else if (isAnswered && showCorrectAnswer) {
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
                      onClick={() => handleAnswerSelect(index)}
                      className={`p-6 rounded-xl text-left transition-all ${optionClass} ${
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
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                            isIncorrectSelected
                              ? "border-red-500 bg-red-500 text-white"
                              : isSelected
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-gray-400"
                          }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="ml-4 text-2xl font-medium">
                          {option}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status Messages - Only show for Time's up or final results, removed incorrect feedback */}
            {timeIsUp && (
              <div className="p-6 bg-red-50 text-red-600 rounded-xl text-center text-2xl font-medium mb-8">
                <div className="flex items-center justify-center">
                  <XCircle className="w-8 h-8 mr-3" />
                  Time's up! You didn't answer in time.
                </div>
              </div>
            )}

            {isAnswered && isCorrect && (
              <div className="p-6 bg-green-50 text-green-600 rounded-xl text-center text-2xl font-medium mb-8">
                <div className="flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 mr-3" />
                  Correct! Great job!
                </div>
              </div>
            )}

            {isAnswered &&
              isCorrect === false &&
              showCorrectAnswer &&
              !timeIsUp && (
                <div className="p-6 bg-red-50 text-red-600 rounded-xl text-center text-2xl font-medium mb-8">
                  <div className="flex items-center justify-center">
                    <XCircle className="w-8 h-8 mr-3" />
                    Incorrect. The correct answer is highlighted above.
                  </div>
                </div>
              )}

            {/* Admin Controls */}
            {!isPreviouslyAnswered && !isAnswered && (
              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleRevealAnswer}
                  variant="outline"
                  className="text-blue-600 border-blue-300 flex items-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  Reveal Correct Answer
                </Button>
              </div>
            )}
          </div>

          {/* Timer Card - Takes 1/4 of the space on large screens */}
          <div className="lg:col-span-1">
            {!isPreviouslyAnswered && (
              <div className="bg-white rounded-2xl shadow-xl p-8 h-full flex flex-col">
                <h3 className="text-2xl font-bold text-center text-blue-900 mb-6 flex items-center justify-center">
                  <Clock className="w-6 h-6 mr-2" />
                  Time Remaining
                </h3>

                {/* Timer Circle */}
                <div className="relative w-full aspect-square mx-auto mb-6">
                  {/* SVG for circular timer */}
                  <svg className="w-full h-full" viewBox="0 0 120 120">
                    {/* Background circle */}
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="#f1f5f9"
                      strokeWidth="12"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke={
                        timeLeft <= 10
                          ? "#ef4444"
                          : timeLeft <= 30
                          ? "#f59e0b"
                          : "#3b82f6"
                      }
                      strokeWidth="12"
                      strokeDasharray={2 * Math.PI * 54}
                      strokeDashoffset={
                        2 * Math.PI * 54 * (1 - progressPercentage / 100)
                      }
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>

                  {/* Timer text overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className={`text-5xl font-bold ${getTimerColor()}`}>
                      {formatTime(timeLeft)}
                    </p>
                  </div>
                </div>

                {/* Timer Controls */}
                <div className="flex justify-center gap-4 mt-2">
                  {!timerRunning ? (
                    <Button
                      onClick={handleStartTimer}
                      disabled={isAnswered}
                      className="bg-green-600 hover:bg-green-700 text-white text-lg px-6 py-3"
                    >
                      Start
                    </Button>
                  ) : (
                    <Button
                      onClick={handlePauseTimer}
                      disabled={isAnswered}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-lg px-6 py-3"
                    >
                      Pause
                    </Button>
                  )}
                  <Button
                    onClick={handleResetTimer}
                    disabled={isAnswered}
                    variant="outline"
                    className="text-gray-600 border-gray-300 text-lg px-6 py-3"
                  >
                    Reset
                  </Button>
                </div>

                {/* Warning message when time is running low */}
                {timeLeft <= 15 && timeLeft > 0 && timerRunning && (
                  <div className="mt-6 p-4 bg-amber-50 text-amber-700 rounded-xl text-center text-xl animate-pulse">
                    <div className="flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 mr-2" />
                      Time is running out!
                    </div>
                  </div>
                )}

                {/* Attempt Counter */}
                {incorrectAttempts > 0 && !isAnswered && (
                  <div className="mt-6 p-4 bg-blue-50 text-blue-700 rounded-xl text-center">
                    <h4 className="font-bold mb-1">Attempts</h4>
                    <div className="flex justify-center gap-2">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 rounded-full ${
                            i < incorrectAttempts ? "bg-red-500" : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isPreviouslyAnswered && (
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl shadow-lg p-8 h-full flex flex-col items-center justify-center">
                <CheckCircle2 className="w-20 h-20 text-green-500 mb-4" />
                <h3 className="text-2xl font-bold text-center text-green-700 mb-2">
                  Already Answered
                </h3>
                <p className="text-center text-green-600 text-lg">
                  You've already completed this question correctly!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Result Dialog */}
        <ResultDialog
          isOpen={showResultDialog}
          onClose={handleCloseResultDialog}
          title={isCorrect ? "Correct Answer! 🎉" : "Incorrect Answer ❌"}
          message=""
          confirmLabel="Continue to Next Question"
          variant={isCorrect ? "success" : "danger"}
        />
      </div>
    </div>
  );
};

export default QuestionPage;
