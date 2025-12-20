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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
      {players.map((player) => (
        <div
          key={player.id}
          onClick={() => handlePlayerSelect(player.id)}
          className="relative bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-5 flex flex-col items-center text-center hover:shadow-xl hover:border-blue-200 transition-all duration-200 cursor-pointer"
        >
          {/* Remove Button */}
          <Button
            variant="ghost"
            onClick={(e) => handleRemovePlayer(e, player.id)}
            className="absolute top-2 right-2 text-red-600 hover:text-red-800 hover:bg-red-50 p-2 h-auto"
            aria-label="Remove Player"
          >
            <X className="h-5 w-5 md:h-6 md:w-6" />
          </Button>

          {/* Player profile image */}
          <div className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden border-4 border-blue-200 flex items-center justify-center bg-blue-50 mb-3 md:mb-4">
            {player.profileImage ? (
              <img
                src={player.profileImage}
                alt={`${player.name}'s profile`}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 md:w-12 md:h-12 text-blue-400" />
            )}
          </div>

          {/* Player info */}
          <h3 className="text-xl md:text-2xl font-bold text-blue-900 mb-1">
            {player.name}
          </h3>
          <p className="text-base md:text-lg text-gray-600">
            <span className="font-semibold">
              {player.questionsAnswered.length}
            </span>{" "}
            ጥያቄዎች ተጠይቀዋል
          </p>

          {/* Woreda badge */}
          {player.woreda && (
            <div className="mt-3">
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-base md:text-lg font-semibold">
                {player.woreda}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PlayerList;
