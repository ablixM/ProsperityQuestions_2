import { Award } from "lucide-react";
import { Player } from "../../store/gameStore";

interface PlayerCardProps {
  player: Player;
}

const PlayerCard = ({ player }: PlayerCardProps) => {
  return (
    <div className="bg-white border-2 rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between">
        {/* Player name and score */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">
            {player.name}
          </h3>
          <div className="flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-500" />
            <span className="text-xl font-medium text-blue-600">
              {player.score} ነጥቦች
            </span>
          </div>
        </div>

        {/* Current question indicator */}
        <div className="bg-blue-50 px-4 py-3 rounded-xl text-center">
          <div className="text-sm text-blue-500 font-medium">ጥያቄ</div>
          <div className="text-2xl font-bold text-blue-700">
            {player.questionsAnswered.length > 0
              ? player.questionsAnswered[player.questionsAnswered.length - 1]
              : "Not started"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
