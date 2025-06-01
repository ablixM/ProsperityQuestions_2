import { Button } from "./ui/button";
import { Trophy, Users, X, User } from "lucide-react";
import { Player } from "../store/gameStore";
import { useGameStore } from "../store/gameStore";

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
}: PlayerStatusModalProps) => {
  if (!isOpen) return null;

  // Get game store functions
  const getMaxQuestionsPerPlayer = useGameStore(
    (state) => state.getMaxQuestionsPerPlayer
  );
  const hasPlayerReachedMaxQuestions = useGameStore(
    (state) => state.hasPlayerReachedMaxQuestions
  );

  // Sort players by score (highest to lowest)
  const sortedPlayers = [...allPlayers].sort((a, b) => b.score - a.score);

  // Calculate ranks with ties
  const playerRanks = sortedPlayers.reduce((acc, player, index) => {
    if (index === 0) {
      acc[player.id] = 1;
    } else {
      const prevPlayer = sortedPlayers[index - 1];
      acc[player.id] =
        player.score === prevPlayer.score ? acc[prevPlayer.id] : index + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Medal colors for top 3 ranks
  const medalColors: Record<number, string> = {
    1: "bg-amber-400", // Gold
    2: "bg-gray-300", // Silver
    3: "bg-amber-700", // Bronze
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-[90vw] h-[90vh] max-w-7xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 p-6 flex justify-between items-center">
          <h2 className="text-4xl font-bold text-white flex items-center">
            <Users className="w-10 h-10 mr-4" />
            የተወዳዳሪ ደረጃ
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
          {sortedPlayers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Users className="w-20 h-20 text-gray-400 mb-4" />
              <p className="text-3xl text-gray-500">ተወዳዳሪዎች አልገቡም</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedPlayers.map((player) => {
                const rank = playerRanks[player.id];
                const isTopThree = rank <= 3;
                const playerQuestionLimit = getMaxQuestionsPerPlayer();
                const isPlayerInTieBreaker = hasPlayerReachedMaxQuestions(
                  player.id
                );

                // Calculate percentage of answered questions based on player's limit
                const answeredPercentage = Math.round(
                  (player.questionsAnswered.length / playerQuestionLimit) * 100
                );

                return (
                  <div
                    key={player.id}
                    className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-6 p-6">
                      {/* Rank and Profile Image - Column 1 */}
                      <div className="md:col-span-1 flex flex-col items-center justify-center">
                        {/* Rank */}
                        <div className="mb-4">
                          {isTopThree ? (
                            <div
                              className={`w-20 h-20 ${medalColors[rank]} rounded-full flex items-center justify-center`}
                            >
                              <Trophy className="w-10 h-10 text-white" />
                              <span className="text-white text-3xl font-bold ml-1">
                                {rank}
                              </span>
                            </div>
                          ) : (
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-3xl font-bold text-blue-600">
                                {rank}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Profile Image */}
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-200 flex items-center justify-center bg-blue-50">
                          {player.profileImage ? (
                            <img
                              src={player.profileImage}
                              alt={`${player.name}'s profile`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-16 h-16 text-blue-400" />
                          )}
                        </div>

                        {/* Woreda Badge */}
                        {player.woreda && (
                          <div className="mt-3 bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-bold text-lg">
                            ወረዳ {player.woreda}
                          </div>
                        )}
                      </div>

                      {/* Player info and stats - Column 2-5 */}
                      <div className="md:col-span-4 flex flex-col justify-center">
                        <h3 className="text-3xl font-bold text-blue-900 mb-4">
                          {player.name}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="bg-blue-50 p-4 rounded-xl text-center">
                            <p className="text-blue-500 text-lg font-medium">
                              ጥያቄዎች
                            </p>
                            <p className="text-3xl font-bold text-blue-800">
                              {player.questionsAnswered.length}/
                              {playerQuestionLimit}
                              {isPlayerInTieBreaker}
                            </p>
                          </div>

                          <div className="bg-green-50 p-4 rounded-xl text-center">
                            <p className="text-green-500 text-lg font-medium">
                              በትክክል የተመለሱ
                            </p>
                            <p className="text-3xl font-bold text-green-800">
                              {player.correctAnswers}
                            </p>
                          </div>

                          <div className="bg-red-50 p-4 rounded-xl text-center">
                            <p className="text-red-500 text-lg font-medium">
                              በትክክል ያልተመለሱ
                            </p>
                            <p className="text-3xl font-bold text-red-800">
                              {player.questionsAnswered.length -
                                player.correctAnswers}
                            </p>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-2">
                          <div className="flex justify-between mb-2">
                            <span className="text-lg text-gray-600">
                              Progress
                            </span>
                            <span className="text-lg font-medium text-blue-700">
                              {answeredPercentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                              className="bg-blue-600 h-4 rounded-full"
                              style={{ width: `${answeredPercentage}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Accuracy */}
                        <div className="mt-4">
                          <p className="text-lg text-gray-600">
                            Accuracy:
                            <span className="ml-2 text-xl font-bold text-yellow-600">
                              {player.questionsAnswered.length > 0
                                ? Math.round(
                                    (player.correctAnswers /
                                      player.questionsAnswered.length) *
                                      100
                                  )
                                : 0}
                              %
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Score - Column 6 */}
                      <div className="md:col-span-1 flex items-center justify-center">
                        <div className="bg-blue-600 text-white px-6 py-8 rounded-xl text-center">
                          <p className="text-xl text-blue-100 mb-1">ነጥብ</p>
                          <p className="text-5xl font-bold">{player.score}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerStatusModal;
