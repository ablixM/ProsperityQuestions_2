import { X, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../../store/gameStore";
import { Button } from "../ui/button";

const PlayerList = () => {
  const { players, removePlayer, setCurrentPlayer } = useGameStore();
  const navigate = useNavigate();

  const handlePlayerSelect = (playerId: string) => {
    setCurrentPlayer(playerId);
    navigate("/game");
    // Scroll to top when going to game page
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const handleRemovePlayer = (e: React.MouseEvent, playerId: string) => {
    e.stopPropagation();
    removePlayer(playerId);
  };

  if (players.length === 0) {
    return (
      <div className="text-center py-8 bg-blue-50 rounded-xl border border-blue-200">
        <p className="text-xl text-blue-800">
          የተወዳዳሪ ስም አልገባም። ውድድሩን ለመጀመር ተጫዋች ይጨምሩ።
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      <div className="divide-y divide-gray-100">
        {players.map((player) => (
          <div
            key={player.id}
            onClick={() => handlePlayerSelect(player.id)}
            className="flex flex-col sm:flex-row items-center p-3 md:p-4 hover:bg-blue-50 cursor-pointer transition-colors"
          >
            {/* Player profile image */}
            <div className="flex-shrink-0 mb-3 sm:mb-0 sm:mr-4">
              <div className="w-24 h-24 md:w-32 lg:w-36 h-24 md:h-32 lg:h-36 rounded-full overflow-hidden border-2 border-blue-200 flex items-center justify-center bg-blue-50">
                {player.profileImage ? (
                  <img
                    src={player.profileImage}
                    alt={`${player.name}'s profile`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 md:w-16 lg:w-20 h-12 md:h-16 lg:h-20 text-blue-400" />
                )}
              </div>
            </div>

            {/* Player info */}
            <div className="flex-grow text-center sm:text-left mb-3 sm:mb-0">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-900">
                {player.name}
              </h3>
              <p className="text-lg md:text-xl text-gray-600">
                <span className="font-semibold">
                  {player.questionsAnswered.length}
                </span>{" "}
                ጥያቄዎች ተጠይቀዋል
              </p>
            </div>

            {/* Woreda badge and Remove Button */}
            <div className="flex items-center justify-between w-full sm:w-auto sm:flex-col sm:items-end gap-2">
              {player.woreda && (
                <div className="sm:mr-4">
                  <div className="bg-blue-100 text-blue-800 px-2 py-1 md:px-3 rounded-full text-lg md:text-xl lg:text-2xl font-bold">
                    {player.woreda}
                  </div>
                </div>
              )}

              {/* Remove Button */}
              <Button
                variant="ghost"
                onClick={(e) => handleRemovePlayer(e, player.id)}
                className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 h-auto"
                aria-label="Remove Player"
              >
                <X className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerList;
