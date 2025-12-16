import {
  forwardRef,
  useEffect,
  useState,
  useRef,
  useImperativeHandle,
} from "react";
import { Button } from "../ui/button";
import { Play, Pause, RotateCcw, Clock } from "lucide-react";

export interface CountdownTimerHandle {
  pause: () => void;
  start: () => void;
  reset: () => void;
}

interface CountdownTimerProps {
  duration?: number;
  isRunning: boolean;
  onTimeUp: () => void;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onTick?: () => void;
  tickThreshold?: number;
  stopTimerSound?: () => void;
  forceStop?: boolean;
}

const CountdownTimer = forwardRef<CountdownTimerHandle, CountdownTimerProps>(
  (
    {
      duration = 300,
      isRunning,
      onTimeUp,
      onStart,
      onStop,
      onReset,
      onTick,
      tickThreshold = 10,
      stopTimerSound,
      forceStop = false,
    },
    ref
  ) => {
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isPaused, setIsPaused] = useState(true);
    const intervalRef = useRef<number | null>(null);

    // Create a direct reference to an audio element for better control
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      pause: () => {
        pauseTimer();
      },
      start: () => {
        startTimer();
      },
      reset: () => {
        resetTimer();
      },
    }));

    // Initialize audio element
    useEffect(() => {
      // Create the audio element once
      if (!audioRef.current) {
        audioRef.current = new Audio("/sounds/timer.wav");
        audioRef.current.volume = 0.3;
        audioRef.current.loop = true; // Make the sound loop

        // Preload the audio
        audioRef.current.load();
      }

      return () => {
        // Cleanup on unmount
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }, []);

    // Watch for forceStop prop changes
    useEffect(() => {
      if (forceStop && !isPaused) {
        pauseTimer();
      }
    }, [forceStop]);

    // Start or stop timer based on isRunning prop
    useEffect(() => {
      if (isRunning && !forceStop) {
        startTimer();
      } else {
        pauseTimer();
      }
    }, [isRunning, forceStop]);

    // Reset when duration changes
    useEffect(() => {
      setTimeLeft(duration);
    }, [duration]);

    const startTimer = () => {
      if (forceStop) return; // Don't start if forceStop is true

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
    // const getColorClasses = () => {
    //   if (timeLeft <= 10) {
    //     return "text-red-600 border-red-500";
    //   } else if (timeLeft <= 30) {
    //     return "text-amber-600 border-amber-500";
    //   } else {
    //     return "text-blue-600 border-blue-500";
    //   }
    // };

    // Handle stopping the timer sound
    const stopTick = () => {
      if (audioRef.current) {
        audioRef.current.pause();
      } else if (stopTimerSound) {
        // Use the provided stop function if audio element is not available
        stopTimerSound();
      }
    };

    // Start the countdown when isRunning is true and forceStop is false
    useEffect(() => {
      // Clear existing interval if there is one
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (isRunning && !forceStop) {
        startTimer();
        // Don't play sound - disabled
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
    }, [isRunning, forceStop, onTimeUp, duration]);

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
      <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 flex flex-col items-center">
        {/* <div className="text-center mb-3 md:mb-4">
        <div
          className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-2 ${getColorClasses()} transition-colors duration-300`}
        >
          {formatTime(timeLeft)}
        </div>
      </div> */}

        <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-2">
          {isPaused ? (
            <Button
              onClick={startTimer}
              className="bg-green-600 hover:bg-green-700 text-white text-sm md:text-base"
              size="sm"
              disabled={forceStop}
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
          >
            <RotateCcw className="w-3 h-3 md:w-4 md:h-4 mr-1" /> ወደመጀመሪያ መልስ
          </Button>
        </div>

        <div className="relative w-40 h-40 md:w-48 lg:w-56 h-40 md:h-48 lg:h-56 mt-3 md:mt-4">
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

        {/* Removed audio indicator */}
      </div>
    );
  }
);

CountdownTimer.displayName = "CountdownTimer";

export default CountdownTimer;
