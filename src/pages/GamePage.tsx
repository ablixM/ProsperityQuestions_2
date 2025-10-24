import { useState, useEffect, useRef } from "react";
import NumberGrid from "../components/game/NumberGrid";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import { questionsData } from "../data/questions";
import { ChevronLeft, Users } from "lucide-react";

function GamePage() {
  const navigate = useNavigate();

  // Create refs for audio elements
  const successSoundRef = useRef<HTMLAudioElement | null>(null);
  const errorSoundRef = useRef<HTMLAudioElement | null>(null);
  const timerSoundRef = useRef<HTMLAudioElement | null>(null);

  // Global state from Zustand
  const {
    completedNumbers,
    getCurrentPlayer,
    getAvailableQuestionsForCurrentPlayer,

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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      {/* Back to Home button */}
      <Button
        onClick={handleBackToHome}
        variant="ghost"
        className="mb-8 text-blue-600 text-xl"
      >
        <ChevronLeft className="w-6 h-6 mr-2" />
        ወደ ተጫዋች ዝርዝር ተመለስ
      </Button>

      <div className=" mx-auto max-w-9xl">
        {/* Game Content */}
        <div className="mb-10">
          <div className="flex items-center justify-center mb-8">
            <Users className="w-8 h-8 text-blue-700 mr-3" />
            <h2 className="text-4xl font-bold text-center text-blue-900">
              {currentPlayer
                ? `${currentPlayer.name}, select a question`
                : "Select a question"}
            </h2>
          </div>

          <div className="relative bg-white rounded-2xl shadow-xl p-10">
            {availableQuestions.length === 0 && tieBreakers.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10 rounded-xl">
                <div className="text-center p-8">
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">
                    ሁሉም ጥያቄዎች ተመልሰዋል
                  </h3>
                  <p className="text-2xl text-gray-600 mb-6">
                    ተጫዋቹ ሁሉንም ጥያቄዎች መልሷል
                  </p>
                  <Button
                    onClick={handleBackToHome}
                    className="bg-blue-600 text-xl px-6 py-3"
                  >
                    ወደ ተጫዋች ዝርዝር ተመለስ
                  </Button>
                </div>
              </div>
            )}

            <NumberGrid
              totalNumbers={questionsData.length}
              onSelectNumber={handleNumberSelect}
              completedNumbers={completedNumbers}
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
