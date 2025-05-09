import { User, Award, ArrowRight } from "lucide-react";
import { useGameStore } from "../../store/gameStore";

const PlayerScore = () => {
  const { getCurrentPlayer } = useGameStore();
  const currentPlayer = getCurrentPlayer();

  if (!currentPlayer) {
    return null;
  }

  return (
    <div className="bg-white border rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between">
        {/* Basic player info */}
        <div className="flex items-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-blue-600" />
          </div>

          <div className="ml-5">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {currentPlayer.name}
            </div>
            <div className="text-xl text-gray-600 flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-500" />
              <span className="font-medium">{currentPlayer.score}</span>
              <span className="ml-1">points</span>
            </div>
          </div>
        </div>

        {/* Current question indicator */}
        <div className="bg-blue-50 px-5 py-3 rounded-xl flex items-center">
          <div className="mr-3">
            <div className="text-sm text-blue-500 font-medium">
              Current Question
            </div>
            <div className="text-2xl font-bold text-blue-700">
              {currentPlayer.questionsAnswered.length > 0
                ? currentPlayer.questionsAnswered[
                    currentPlayer.questionsAnswered.length - 1
                  ]
                : "Not started"}
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-blue-500" />
        </div>
      </div>
    </div>
  );
};

export default PlayerScore;
