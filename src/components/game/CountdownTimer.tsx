import { FC, useEffect, useState, useRef } from "react";
import { Button } from "../ui/button";
import { Play, Pause, RotateCcw, Clock } from "lucide-react";

interface CountdownTimerProps {
  duration?: number;
  isRunning: boolean;
  onTimeUp: () => void;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onTick?: () => void;
  tickThreshold?: number;
  playTimerSound?: () => void;
  stopTimerSound?: () => void;
}

const CountdownTimer: FC<CountdownTimerProps> = ({
  duration = 45,
  isRunning,
  onTimeUp,
  onStart,
  onStop,
  onReset,
  onTick,
  tickThreshold = 10,
  playTimerSound,
  stopTimerSound,
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isPaused, setIsPaused] = useState(true);
  const intervalRef = useRef<number | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Create a direct reference to an audio element for better control
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    // Create the audio element once
    if (!audioRef.current) {
      audioRef.current = new Audio("/sounds/timer.wav");
      audioRef.current.volume = 0.3;
      audioRef.current.loop = true; // Make the sound loop

      // Preload the audio
      audioRef.current.load();

      // Add event listeners for audio state
      audioRef.current.addEventListener("play", () => setIsAudioPlaying(true));
      audioRef.current.addEventListener("pause", () =>
        setIsAudioPlaying(false)
      );
      audioRef.current.addEventListener("ended", () =>
        setIsAudioPlaying(false)
      );
    }

    return () => {
      // Cleanup on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener("play", () =>
          setIsAudioPlaying(true)
        );
        audioRef.current.removeEventListener("pause", () =>
          setIsAudioPlaying(false)
        );
        audioRef.current.removeEventListener("ended", () =>
          setIsAudioPlaying(false)
        );
        audioRef.current = null;
      }
    };
  }, []);

  // Start or stop timer based on isRunning prop
  useEffect(() => {
    if (isRunning) {
      startTimer();
    } else {
      pauseTimer();
    }
  }, [isRunning]);

  // Reset when duration changes
  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  const startTimer = () => {
    setIsPaused(false);
    onStart();

    // Clear existing interval if any
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set new interval
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          // Time's up, clear interval and call callback
          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
          }
          onTimeUp();
          return 0;
        }

        const newTime = prevTime - 1;

        // Call onTick when time is below threshold
        if (onTick && newTime <= tickThreshold && newTime > 0) {
          onTick();
        }

        return newTime;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    setIsPaused(true);
    onStop();

    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetTimer = () => {
    setTimeLeft(duration);
    setIsPaused(true);
    onReset();

    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Format time as MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Get color classes based on time left
  const getColorClasses = () => {
    if (timeLeft <= 10) {
      return "text-red-600 border-red-500";
    } else if (timeLeft <= 30) {
      return "text-amber-600 border-amber-500";
    } else {
      return "text-blue-600 border-blue-500";
    }
  };

  // Handle direct play of tick sound
  const playTick = () => {
    if (audioRef.current) {
      // Only restart if not already playing
      if (!isAudioPlaying) {
        const playPromise = audioRef.current.play();

        // Handle the play promise (required for modern browsers)
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log("Audio play prevented by browser:", error);
          });
        }
      }
    } else if (playTimerSound) {
      // Fallback to provided sound function if audio element not available
      playTimerSound();
    }
  };

  // Handle stopping the timer sound
  const stopTick = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    } else if (stopTimerSound) {
      // Use the provided stop function if audio element is not available
      stopTimerSound();
    }
  };

  // Start the countdown when isRunning is true
  useEffect(() => {
    // Clear existing interval if there is one
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isRunning) {
      startTimer();

      // Play sound on start - play it as a continuous sound
      playTick();
    } else {
      // Stop any playing audio when timer is paused
      stopTick();
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Stop any playing audio when effect is cleaned up
      stopTick();
    };
  }, [isRunning, onTimeUp, duration]);

  // Calculate progress percentage for the circle
  const progressPercentage = (timeLeft / duration) * 100;

  // Calculate the SVG parameters for the circular progress
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

  // Get the stroke color based on time remaining
  const getStrokeColor = () => {
    if (timeLeft < duration * 0.25) return "#ef4444"; // red-500
    if (timeLeft < duration * 0.5) return "#eab308"; // yellow-500
    return "#3b82f6"; // blue-500
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center">
      <div className="text-center mb-4">
        <div
          className={`text-5xl font-bold mb-2 ${getColorClasses()} transition-colors duration-300`}
        >
          {formatTime(timeLeft)}
        </div>
        <div className="flex items-center justify-center text-gray-600">
          <Clock className="w-4 h-4 mr-1" />
          <span className="text-sm">Time Remaining</span>
        </div>
      </div>

      <div className="flex justify-center space-x-2">
        {isPaused ? (
          <Button
            onClick={startTimer}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <Play className="w-4 h-4 mr-1" /> Start
          </Button>
        ) : (
          <Button
            onClick={pauseTimer}
            className="bg-amber-600 hover:bg-amber-700 text-white"
            size="sm"
          >
            <Pause className="w-4 h-4 mr-1" /> Pause
          </Button>
        )}
        <Button
          onClick={resetTimer}
          variant="outline"
          size="sm"
          className="text-gray-600"
        >
          <RotateCcw className="w-4 h-4 mr-1" /> Reset
        </Button>
      </div>

      <div className="relative w-56 h-56 mt-4">
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
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl font-bold text-blue-900 font-mono">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Audio indicator */}
      <div
        className={`mt-4 flex items-center gap-2 ${
          isAudioPlaying ? "text-blue-600" : "text-gray-400"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
          <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
        </svg>
        <span className="text-sm font-medium">
          {isAudioPlaying ? "Sound On" : "Sound Off"}
        </span>
      </div>
    </div>
  );
};

export default CountdownTimer;
