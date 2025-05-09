import { useNavigate } from "react-router-dom";
import { useGameStore } from "../../store/gameStore";
import { Button } from "../ui/button";
import { PlayCircle, XCircle, Award, Trophy } from "lucide-react";

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
        Player Rankings
      </h2>

      <div className="space-y-5">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            onClick={() => handleSelectPlayer(player.id)}
            className="flex items-center p-5 bg-white border-2 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer hover:border-blue-200"
          >
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
        ))}
      </div>
    </div>
  );
};

export default PlayerList;
