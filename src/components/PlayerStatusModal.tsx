import { Button } from "./ui/button";
import { Users, X } from "lucide-react";
import { Player } from "../store/gameStore";

// Props interface for the PlayerStatusModal
export interface PlayerStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  allPlayers: Player[];
  totalQuestions: number;
}

// Component for the Player Status Modal
const PlayerStatusModal = ({
  isOpen,
  onClose,
  allPlayers,
  totalQuestions,
}: PlayerStatusModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-[85vw] h-[85vh] max-w-7xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 p-6 flex justify-between items-center">
          <h2 className="text-4xl font-bold text-white flex items-center">
            <Users className="w-10 h-10 mr-4" />
            Player Status Board
          </h2>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-white hover:bg-blue-700 hover:text-white p-3 h-auto"
          >
            <X className="w-8 h-8" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          {allPlayers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Users className="w-20 h-20 text-gray-400 mb-4" />
              <p className="text-3xl text-gray-500">
                No players in the game yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {allPlayers.map((player: Player) => (
                <div
                  key={player.id}
                  className="bg-blue-50 rounded-xl p-6 shadow-md border-2 border-blue-100"
                >
                  {/* Player info */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-blue-600 text-white text-3xl font-bold rounded-full flex items-center justify-center">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-3xl font-bold text-blue-900">
                          {player.name}
                        </h3>
                        <p className="text-xl text-blue-700">
                          Score:{" "}
                          <span className="font-bold">{player.score}</span> |
                          Correct:{" "}
                          <span className="font-bold">
                            {player.correctAnswers}
                          </span>
                          /{player.questionsAnswered.length}
                        </p>
                      </div>
                    </div>
                    <div className="bg-blue-600 text-white px-6 py-3 rounded-full text-2xl font-bold">
                      {Math.round(
                        (player.correctAnswers /
                          Math.max(1, player.questionsAnswered.length)) *
                          100
                      )}
                      %
                    </div>
                  </div>

                  {/* Question progress */}
                  <h4 className="text-2xl font-bold text-blue-800 mb-4">
                    Question Progress
                  </h4>
                  <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-15 gap-3">
                    {Array.from(
                      { length: totalQuestions },
                      (_, i) => i + 1
                    ).map((num) => {
                      const isAnswered = player.questionsAnswered.includes(num);
                      const isCorrect =
                        isAnswered &&
                        player.score >=
                          player.questionsAnswered.indexOf(num) * 10;

                      return (
                        <div
                          key={num}
                          className={`aspect-square flex items-center justify-center rounded-lg text-2xl font-bold
                            ${
                              isAnswered
                                ? isCorrect
                                  ? "bg-green-500 text-white"
                                  : "bg-red-500 text-white"
                                : "bg-gray-200 text-gray-600"
                            } 
                            ${
                              player.questionsAnswered.length > 0 &&
                              player.questionsAnswered[
                                player.questionsAnswered.length - 1
                              ] === num
                                ? "ring-4 ring-blue-500 ring-offset-2"
                                : ""
                            }`}
                        >
                          {num}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerStatusModal;
