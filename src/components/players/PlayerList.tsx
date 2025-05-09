import { useNavigate } from "react-router-dom";
import { useGameStore } from "../../store/gameStore";
import { Button } from "../ui/button";
import {
  PlayCircle,
  XCircle,
  Award,
  Trophy,
  CheckCircle,
  X,
} from "lucide-react";

const PlayerList = () => {
  const navigate = useNavigate();
  const { players, removePlayer, setCurrentPlayer } = useGameStore();

  // Sort players by score (highest first)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  const handleSelectPlayer = (playerId: string) => {
    setCurrentPlayer(playerId);
    navigate("/game");
  };

  const handleRemovePlayer = (e: React.MouseEvent, playerId: string) => {
    e.stopPropagation();
    removePlayer(playerId);
  };

  if (players.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-xl">
        <p className="text-xl text-gray-600">
          የተጫዋች ስም አልገባም። ጨዋታዉን ለመጀመር ትጫዋች ይጨምሩ።
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800 flex items-center">
        <Trophy className="w-8 h-8 mr-3 text-yellow-500" />
        የተጫዋች ደረጃ
      </h2>

      <div className="space-y-5">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            onClick={() => handleSelectPlayer(player.id)}
            className="flex flex-col p-5 bg-white border-2 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer hover:border-blue-200"
          >
            {/* Top row with ranking, name, and actions */}
            <div className="flex items-center">
              {/* Ranking number */}
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xl font-bold">
                {index + 1}
              </div>

              {/* Player info */}
              <div className="ml-6 flex-grow">
                <div className="flex items-center">
                  <h3 className="text-2xl font-bold text-gray-800 mr-3">
                    {player.name}
                  </h3>

                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {player.questionsAnswered.length > 0
                      ? `Question ${
                          player.questionsAnswered[
                            player.questionsAnswered.length - 1
                          ]
                        }`
                      : "Not started"}
                  </div>
                </div>
              </div>

              {/* Score and actions */}
              <div className="flex items-center">
                <div className="flex items-center mr-6 px-4 py-2 bg-blue-600 text-white rounded-full">
                  <Award className="w-5 h-5 mr-2" />
                  <span className="text-xl font-bold">{player.score}</span>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSelectPlayer(player.id)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 w-12 h-12"
                    aria-label="Select Player"
                  >
                    <PlayCircle className="h-8 w-8" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleRemovePlayer(e, player.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 w-12 h-12"
                    aria-label="Remove Player"
                  >
                    <XCircle className="h-8 w-8" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Question status section */}
            {player.questionsAnswered.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  {/* Correct answers */}
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                      <h4 className="font-bold text-green-800">
                        Correct ({player.correctAnswers})
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {player.questionsAnswered.map((num, index) => {
                        // Find the correct answers - the first N questions where N is correctAnswers
                        const isCorrect = index < player.correctAnswers;
                        if (isCorrect) {
                          return (
                            <span
                              key={`correct-${num}`}
                              className="inline-flex items-center justify-center bg-green-200 text-green-800 rounded-full w-8 h-8 text-sm font-bold"
                            >
                              {num}
                            </span>
                          );
                        }
                        return null;
                      })}
                      {player.correctAnswers === 0 && (
                        <span className="text-sm text-green-700">
                          No correct answers yet
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Incorrect answers */}
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <X className="w-5 h-5 mr-2 text-red-600" />
                      <h4 className="font-bold text-red-800">
                        Incorrect ({player.incorrectAnswers})
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {player.questionsAnswered.map((num, index) => {
                        // Find the incorrect answers - the questions after the correctAnswers count
                        const isCorrect = index < player.correctAnswers;
                        if (!isCorrect) {
                          return (
                            <span
                              key={`incorrect-${num}`}
                              className="inline-flex items-center justify-center bg-red-200 text-red-800 rounded-full w-8 h-8 text-sm font-bold"
                            >
                              {num}
                            </span>
                          );
                        }
                        return null;
                      })}
                      {player.incorrectAnswers === 0 && (
                        <span className="text-sm text-red-700">
                          No incorrect answers yet
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerList;
