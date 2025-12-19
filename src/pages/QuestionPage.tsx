import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Eye,
  User,
  Play,
  Pause,
  RotateCcw,
  Clock,
} from "lucide-react";
import { prosperityQuestions } from "../data/prosperityQuestions";
import { useGameStore } from "../store/gameStore";
import { ResultDialog } from "../components/ui/dialog";
import useSound from "use-sound";

const QuestionPage = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const questionNumber = parseInt(questionId || "0", 10);

  // Timer interval ref - directly managed, no child component
  const intervalRef = useRef<number | null>(null);

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
  const question = prosperityQuestions[questionNumber - 1] || null;

  // UI state
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(
    null
  );
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [isPreviouslyAnswered, setIsPreviouslyAnswered] = useState(false);
  const [timeIsUp, setTimeIsUp] = useState(false);

  // New state for enhanced answer handling - Simplified for Single Attempt
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  // Inline timer state
  const TIMER_DURATION = question?.type === "explanation" ? 120 : 60;
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [timerIsPaused, setTimerIsPaused] = useState(true);
  const [timerStopped, setTimerStopped] = useState(false); // Permanently stopped

  const [playError] = useSound("/sounds/error.mp3", { volume: 0.4 });
  const [playSuccess] = useSound("/sounds/success.mp3", { volume: 0.4 });

  // Clear the interval - core function that directly clears
  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Stop timer permanently - call this when answer is selected
  const stopTimerPermanently = useCallback(() => {
    clearTimerInterval();
    setTimerIsPaused(true);
    setTimerStopped(true);
    console.log("Timer permanently stopped");
  }, [clearTimerInterval]);

  // Pause timer (can be resumed)
  const pauseTimer = useCallback(() => {
    clearTimerInterval();
    setTimerIsPaused(true);
  }, [clearTimerInterval]);

  // Start timer
  const startTimer = useCallback(() => {
    if (timerStopped) return; // Don't start if permanently stopped

    setTimerIsPaused(false);
    clearTimerInterval();

    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearTimerInterval();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  }, [timerStopped, clearTimerInterval]);

  // Reset timer
  const resetTimer = useCallback(() => {
    clearTimerInterval();
    setTimeLeft(TIMER_DURATION);
    setTimerIsPaused(true);
    setTimerStopped(false);
  }, [clearTimerInterval]);

  // Handle time up
  const handleTimeUp = useCallback(() => {
    setTimeIsUp(true);
    stopTimerPermanently();
    setIsAnswered(true);
    setShowCorrectAnswer(true);

    // Mark the question as incorrect due to timeout
    if (question) {
      setSelectedAnswerIndex(question.correctAnswer ?? -1);
      setIsCorrect(false);
      markQuestionAsCompleted(
        questionNumber,
        question.correctAnswer ?? -1,
        false
      );
      playError();
      setShowResultDialog(true);
    }
  }, [
    question,
    questionNumber,
    markQuestionAsCompleted,
    playError,
    stopTimerPermanently,
  ]);

  // Watch for timeLeft reaching 0
  useEffect(() => {
    if (timeLeft === 0 && !timerIsPaused && !timerStopped) {
      handleTimeUp();
    }
  }, [timeLeft, timerIsPaused, timerStopped, handleTimeUp]);

  // Reset question-specific state when navigating between questions
  useEffect(() => {
    setSelectedAnswerIndex(null);
    setIsAnswered(false);
    setIsCorrect(null);
    setShowResultDialog(false);
    setIsPreviouslyAnswered(false);
    setShowCorrectAnswer(false);
    setTimeIsUp(false);
    // Reset timer
    clearTimerInterval();
    setTimeLeft(TIMER_DURATION);
    setTimerIsPaused(true);
    setTimerStopped(false);
  }, [questionNumber, clearTimerInterval]);

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

  // Auto-start timer when question loads (if not previously answered)
  useEffect(() => {
    if (!question || !currentPlayer) return;

    if (!isPreviouslyAnswered && !timerStopped) {
      startTimer();
    } else {
      stopTimerPermanently();
    }
  }, [questionNumber, question, currentPlayer, isPreviouslyAnswered]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimerInterval();
    };
  }, [clearTimerInterval]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered || isPreviouslyAnswered) return;

    // IMMEDIATELY stop the timer - this is the key fix
    stopTimerPermanently();

    // Always save the selected answer for UI display
    setSelectedAnswerIndex(answerIndex);
    setIsAnswered(true);
    setShowCorrectAnswer(true);

    if (answerIndex === question?.correctAnswer) {
      // Correct answer handling
      playSuccess();
      setIsCorrect(true);
      markQuestionAsCompleted(questionNumber, answerIndex, true);
    } else {
      // Incorrect answer handling - Single Attempt Mode
      playError();
      setIsCorrect(false);
      markQuestionAsCompleted(questionNumber, answerIndex, false);
    }

    // Show result dialog immediately
    setShowResultDialog(true);
  };

  const handleRevealAnswer = () => {
    setShowCorrectAnswer(true);
    // IMMEDIATELY stop the timer
    stopTimerPermanently();

    // If not already answered, mark as completed
    if (!isAnswered && !isPreviouslyAnswered) {
      setIsAnswered(true);

      if (question?.type === "explanation") {
        // Explanation questions are marked as correct when revealed
        setIsCorrect(true);
        // Sound and pop-up are muted for explanation questions
        markQuestionAsCompleted(questionNumber, 0, true);
        setShowResultDialog(false);
      } else {
        // Choice questions are marked as incorrect when revealed
        setIsCorrect(false);
        markQuestionAsCompleted(
          questionNumber,
          selectedAnswerIndex !== null ? selectedAnswerIndex : -1,
          false
        );
      }
    }
  };

  const handleBackToGame = () => {
    navigate("/#player-list");
  };

  const handleCloseResultDialog = () => {
    setShowResultDialog(false);
    // Scroll to top when going back to number grid after answering
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  // Format time as MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Calculate progress percentage for the circle
  const progressPercentage = (timeLeft / TIMER_DURATION) * 100;

  // Calculate the SVG parameters for the circular progress
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

  // Get the stroke color based on time remaining
  const getStrokeColor = () => {
    if (timeLeft < TIMER_DURATION * 0.25) return "#ef4444"; // red-500
    if (timeLeft < TIMER_DURATION * 0.5) return "#eab308"; // yellow-500
    return "#3b82f6"; // blue-500
  };

  if (!question || !currentPlayer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8 relative">
      <div className="container mx-auto max-w-9xl">
        {/* Top bar with navigation */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
          {/* Player Profile Card - Takes 2 columns on large screens */}
          {currentPlayer && !isPreviouslyAnswered && (
            <div className="lg:col-span-2 order-2 lg:order-1">
              <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 sticky top-4 md:top-8">
                <div className="flex flex-col items-center">
                  <div className="mb-4 md:mb-8 px-6">
                    <Button
                      onClick={handleBackToGame}
                      variant="ghost"
                      className="text-blue-600 text-lg md:text-xl"
                    >
                      <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                      <span className="hidden sm:inline">
                        ወደ ተጫዋች ዝርዝር ተመለስ
                      </span>
                      <span className="sm:hidden">ተመለስ</span>
                    </Button>
                  </div>
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
                      ከፍለ ከተማ፡ {currentPlayer.woreda}
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
            </div>

            {/* Question Text */}
            <div className="bg-blue-50 rounded-xl p-4 md:p-6 lg:p-8 mb-6 md:mb-10">
              <p className="text-lg md:text-xl lg:text-2xl xl:text-3xl text-gray-800 leading-relaxed">
                {question.question}
              </p>
            </div>

            {/* Answer Content */}
            <div className="space-y-3 md:space-y-4 mb-6 md:mb-10">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-medium text-blue-900 mb-4 md:mb-6">
                {question.type === "explanation" ? "መልስ" : "ምርጫ"}
              </h3>

              {question.type === "explanation" ? (
                // Explanation Answer (Bullted List)
                <div className="bg-white border-2 border-blue-100 rounded-xl p-4 md:p-6 lg:p-8">
                  {showCorrectAnswer || isPreviouslyAnswered ? (
                    <ul className="space-y-3 md:space-y-4">
                      {question.explanationAnswer?.map((point, index) => (
                        <li key={index} className="flex items-start">
                          <div className="flex-shrink-0 w-2 h-2 md:w-3 md:h-3 rounded-full bg-blue-500 mt-2 md:mt-3 mr-3 md:mr-4" />
                          <span className="text-lg md:text-xl lg:text-2xl text-gray-800">
                            {point}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400 italic text-lg md:text-xl">
                      <Eye className="w-12 h-12 mb-4 opacity-20" />
                      መልሱን ለማየት "ትክክለኛዉን መልስ አሳይ" የሚለውን ይጫኑ
                    </div>
                  )}
                </div>
              ) : (
                // Choice Options
                <div className="grid grid-cols-1 gap-4 md:gap-6">
                  {question.options?.map((option, index) => {
                    const isSelected = selectedAnswerIndex === index;
                    const isCorrectAnswer = question.correctAnswer === index;

                    let optionClass =
                      "border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50";

                    if (isAnswered && showCorrectAnswer) {
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
                        className={`p-3 md:p-4 lg:p-6 rounded-xl text-left transition-all ${optionClass} ${
                          isAnswered || isPreviouslyAnswered
                            ? "cursor-default"
                            : "cursor-pointer hover:shadow-lg"
                        }`}
                        disabled={isAnswered || isPreviouslyAnswered}
                      >
                        <div className="flex items-center">
                          <div
                            className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 ${
                              isSelected
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
              )}
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

            {isAnswered && isCorrect && question.type !== "explanation" && (
              <div className="p-4 md:p-6 bg-green-50 text-green-600 rounded-xl text-center text-lg md:text-xl lg:text-2xl font-medium mb-6 md:mb-8">
                <div className="flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3" />
                  ጥያቄው በትክክል ተመልሷል!
                </div>
              </div>
            )}

            {isAnswered && isCorrect === false && !timeIsUp && (
              <div className="p-4 md:p-6 bg-red-50 text-red-600 rounded-xl text-center text-lg md:text-xl lg:text-2xl font-medium mb-6 md:mb-8">
                <div className="flex items-center justify-center">
                  <XCircle className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3" />
                  ጥያቄው በትክክል አልተመለሰም!
                </div>
              </div>
            )}

            {/* Reveal Answer Button */}
            {!isPreviouslyAnswered && (!isAnswered || timeIsUp) && (
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
                {/* Inline Timer Component */}
                <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 flex flex-col items-center">
                  <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-2">
                    {timerIsPaused ? (
                      <Button
                        onClick={startTimer}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm md:text-base"
                        size="sm"
                        disabled={timerStopped}
                      >
                        <Play className="w-3 h-3 md:w-4 md:h-4 mr-1" /> ጀምርር
                      </Button>
                    ) : (
                      <Button
                        onClick={pauseTimer}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-sm md:text-base"
                        size="sm"
                      >
                        <Pause className="w-3 h-3 md:w-4 md:h-4 mr-1" /> አቁም
                      </Button>
                    )}
                    <Button
                      onClick={resetTimer}
                      variant="outline"
                      size="sm"
                      className="text-gray-600 text-sm md:text-base"
                      disabled={timerStopped}
                    >
                      <RotateCcw className="w-3 h-3 md:w-4 md:h-4 mr-1" />{" "}
                      ወደመጀመሪያ መልስ
                    </Button>
                  </div>

                  <div className="relative w-40 h-40 md:w-48 lg:w-56 md:h-48 lg:h-56 mt-3 md:mt-4">
                    {/* Background circle */}
                    <svg className="w-full h-full" viewBox="0 0 170 170">
                      <circle
                        cx="85"
                        cy="85"
                        r={radius}
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="12"
                      />

                      {/* Progress circle */}
                      <circle
                        cx="85"
                        cy="85"
                        r={radius}
                        fill="none"
                        stroke={getStrokeColor()}
                        strokeWidth="12"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-linear"
                        transform="rotate(-90 85 85)"
                      />
                    </svg>

                    {/* Timer text in center */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-900 font-mono">
                        {formatTime(timeLeft)}
                      </span>
                      <div className="flex items-center justify-center text-gray-600">
                        <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                        <span className="text-xs md:text-sm">ቀሪ ሰአት</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Answer Status */}
                {isAnswered && isCorrect && question.type !== "explanation" && (
                  <div className="mt-4 md:mt-6 p-3 md:p-4 bg-green-50 text-green-700 rounded-xl text-center">
                    <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 text-green-500" />
                    <h4 className="font-bold text-base md:text-lg">
                      በትክክል ተመልሷል!
                    </h4>
                  </div>
                )}

                {isAnswered && isCorrect === false && (
                  <div className="mt-4 md:mt-6 p-3 md:p-4 bg-red-50 text-red-700 rounded-xl text-center">
                    <XCircle className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 text-red-500" />
                    <h4 className="font-bold text-base md:text-lg">አልተመለሰም</h4>
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
                    የአዲስ አበባ ብልፅግና ፓርቲ ቅርንጫፍ ፅ/ቤት የፖለቲካና አቅም ግንባታ ዘርፍ የተዘጋጀ
                  </h2>
                </div>
              </div>
            )}

            {isPreviouslyAnswered && (
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl shadow-lg p-4 md:p-6 lg:p-8 h-full flex flex-col items-center justify-center">
                <CheckCircle2 className="w-12 h-12 md:w-16 lg:w-20 text-green-500 mb-3 md:mb-4" />
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
