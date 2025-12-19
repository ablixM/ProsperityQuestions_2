import { useState, useEffect, useRef } from "react";
import NumberGrid from "../components/game/NumberGrid";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import { prosperityQuestions } from "../data/prosperityQuestions";
import { ChevronLeft } from "lucide-react";

function GamePage() {
  const navigate = useNavigate();

  // Create refs for audio elements
  const successSoundRef = useRef<HTMLAudioElement | null>(null);
  const errorSoundRef = useRef<HTMLAudioElement | null>(null);
  const timerSoundRef = useRef<HTMLAudioElement | null>(null);

  // Global state from Zustand
  const {
    getCurrentPlayer,
    getAvailableQuestionsForCurrentPlayer,
    getAllCompletedNumbers,
    getCurrentRoundCompletedNumbers,
    tieBreakers,
  } = useGameStore();

  const currentPlayer = getCurrentPlayer();
  const availableQuestions = getAvailableQuestionsForCurrentPlayer();

  // Local UI state
  const [soundsLoaded, setSoundsLoaded] = useState(false);

  // Check if there's a current player selected, if not redirect to home
  useEffect(() => {
    if (!currentPlayer) {
      navigate("/");
    }
  }, [currentPlayer, navigate]);

  // Track loaded sounds
  const [successSoundLoaded, setSuccessSoundLoaded] = useState(false);
  const [errorSoundLoaded, setErrorSoundLoaded] = useState(false);
  const [timerSoundLoaded, setTimerSoundLoaded] = useState(false);

  // Initialize audio elements on component mount
  useEffect(() => {
    // Create audio elements
    successSoundRef.current = new Audio("/sounds/success.mp3");
    errorSoundRef.current = new Audio("/sounds/error.mp3");
    timerSoundRef.current = new Audio("/sounds/timer.wav");

    // Set volume
    if (successSoundRef.current) successSoundRef.current.volume = 0.5;
    if (errorSoundRef.current) errorSoundRef.current.volume = 0.5;
    if (timerSoundRef.current) timerSoundRef.current.volume = 0.3;

    // Set up load event listeners
    if (successSoundRef.current) {
      successSoundRef.current.addEventListener("canplaythrough", () =>
        setSuccessSoundLoaded(true)
      );
      successSoundRef.current.load();
    }

    if (errorSoundRef.current) {
      errorSoundRef.current.addEventListener("canplaythrough", () =>
        setErrorSoundLoaded(true)
      );
      errorSoundRef.current.load();
    }

    if (timerSoundRef.current) {
      timerSoundRef.current.addEventListener("canplaythrough", () =>
        setTimerSoundLoaded(true)
      );
      timerSoundRef.current.load();
    }

    // Cleanup function
    return () => {
      if (successSoundRef.current) {
        successSoundRef.current.pause();
        successSoundRef.current.removeEventListener("canplaythrough", () =>
          setSuccessSoundLoaded(true)
        );
      }

      if (errorSoundRef.current) {
        errorSoundRef.current.pause();
        errorSoundRef.current.removeEventListener("canplaythrough", () =>
          setErrorSoundLoaded(true)
        );
      }

      if (timerSoundRef.current) {
        timerSoundRef.current.pause();
        timerSoundRef.current.removeEventListener("canplaythrough", () =>
          setTimerSoundLoaded(true)
        );
      }
    };
  }, []);

  // Check when all sounds are loaded
  useEffect(() => {
    if (successSoundLoaded && errorSoundLoaded && timerSoundLoaded) {
      setSoundsLoaded(true);
    }
  }, [successSoundLoaded, errorSoundLoaded, timerSoundLoaded]);

  // Set a fallback timeout to ensure the app is usable even if sounds fail to load
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSoundsLoaded(true);
      console.log("Fallback: assuming sounds are loaded after timeout");
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, []);

  // Function to handle number selection
  const handleNumberSelect = (number: number) => {
    // Navigate to the question page for the selected number
    navigate(`/question/${number}`);
    // Scroll to bottom when going to question page
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 100);
  };

  const handleBackToHome = () => {
    navigate("/");
    // Scroll to player list section with some offset
    setTimeout(() => {
      const playerListSection = document.querySelector(".player-list-section");
      if (playerListSection) {
        const elementPosition = playerListSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - 100; // Scroll a bit further up

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }, 100);
  };

  // If sounds aren't loaded yet, show a loading indicator
  if (!soundsLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-3xl font-medium text-blue-900">
            ጥያቄዎችን በማዘጋጀት ላይ.....
          </p>
        </div>
      </div>
    );
  }

  if (!currentPlayer) {
    return null;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-b from-blue-50 to-white p-2 md:p-4 flex flex-col">
      {/* Back to Home button */}
      <div className="flex-none mb-2 md:mb-4">
        <Button
          onClick={handleBackToHome}
          variant="ghost"
          className="text-blue-600 text-base md:text-lg"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 mr-1" />
          <span className="hidden sm:inline">ወደ ተጫዋች ዝርዝር ተመለስ</span>
          <span className="sm:hidden">ተመለስ</span>
        </Button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col w-full">
        {/* Header - Compact */}

        {/* Game Content - Flex Grow */}
        <div className="flex-1 min-h-0 relative bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
          {availableQuestions.length === 0 && tieBreakers.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-20 rounded-xl">
              <div className="text-center p-4 md:p-8">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
                  ሁሉም ጥያቄዎች ተመልሰዋል
                </h3>
                <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-4 md:mb-6">
                  ተጫዋቹ ሁሉንም ጥያቄዎች መልሷል
                </p>
                <Button
                  onClick={handleBackToHome}
                  className="bg-blue-600 text-lg md:text-xl px-4 py-2 md:px-6 md:py-3"
                >
                  ወደ ተጫዋች ዝርዝር ተመለስ
                </Button>
              </div>
            </div>
          )}

          <div className="w-full h-full p-2 md:p-4 lg:p-6 overflow-hidden">
            <NumberGrid
              questions={prosperityQuestions}
              onSelectNumber={handleNumberSelect}
              completedNumbers={getAllCompletedNumbers()}
              currentRoundCompleted={getCurrentRoundCompletedNumbers()}
              highlightedNumbers={availableQuestions}
              tieBreakers={tieBreakers}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default GamePage;
