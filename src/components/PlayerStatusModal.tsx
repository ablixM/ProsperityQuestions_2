import { Button } from "./ui/button";
import { Users, X, User, RotateCcw } from "lucide-react";
import { Player } from "../store/gameStore";
import { useGameStore } from "../store/gameStore";
import { ConfirmationDialog } from "./ui/dialog";
import { useState } from "react";

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
  // State for revert confirmation dialog
  const [revertDialog, setRevertDialog] = useState<{
    isOpen: boolean;
    playerId: string;
    questionNumber: number;
  }>({ isOpen: false, playerId: "", questionNumber: 0 });

  // State for round two setup
  const [showRoundTwoSetup, setShowRoundTwoSetup] = useState(false);
  // State for round three setup
  const [showRoundThreeSetup, setShowRoundThreeSetup] = useState(false);

  // Get game store functions
  const getMaxQuestionsPerPlayer = useGameStore(
    (state) => state.getMaxQuestionsPerPlayer
  );
  const hasPlayerReachedMaxQuestions = useGameStore(
    (state) => state.hasPlayerReachedMaxQuestions
  );
  const revertQuestion = useGameStore((state) => state.revertQuestion);
  const currentRound = useGameStore((state) => state.currentRound);
  const roundOneState = useGameStore((state) => state.roundOneState);
  const startRoundTwo = useGameStore((state) => state.startRoundTwo);
  const startRoundThree = useGameStore((state) => state.startRoundThree);
  const switchToRound = useGameStore((state) => state.switchToRound);
  const roundTwoPlayers = useGameStore((state) => state.roundTwoPlayers);
  const addPlayerToRoundTwo = useGameStore(
    (state) => state.addPlayerToRoundTwo
  );
  const removePlayerFromRoundTwo = useGameStore(
    (state) => state.removePlayerFromRoundTwo
  );
  const getRoundOnePlayers = useGameStore((state) => state.getRoundOnePlayers);
  const resetRoundTwo = useGameStore((state) => state.resetRoundTwo);
  const roundTwoState = useGameStore((state) => state.roundTwoState);
  const roundThreePlayers = useGameStore((state) => state.roundThreePlayers);
  const addPlayerToRoundThree = useGameStore(
    (state) => state.addPlayerToRoundThree
  );
  const removePlayerFromRoundThree = useGameStore(
    (state) => state.removePlayerFromRoundThree
  );
  const getRoundThreePlayers = useGameStore(
    (state) => state.getRoundThreePlayers
  );
  const resetRoundThree = useGameStore((state) => state.resetRoundThree);

  // Handle revert confirmation
  const handleRevertConfirm = () => {
    revertQuestion(revertDialog.playerId, revertDialog.questionNumber);
    setRevertDialog({ isOpen: false, playerId: "", questionNumber: 0 });
  };

  // Handle revert button click
  const handleRevertClick = (playerId: string, questionNumber: number) => {
    setRevertDialog({ isOpen: true, playerId, questionNumber });
  };

  if (!isOpen) return null;

  // Sort players by score (highest to lowest)
  const sortedPlayers = [...allPlayers].sort((a, b) => b.score - a.score);
  const maxQuestionsPerPlayer = getMaxQuestionsPerPlayer();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full h-full max-w-7xl max-h-[95vh] md:w-[90vw] md:h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 p-3 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white flex items-center">
              <Users className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 mr-2 md:mr-3 lg:mr-4" />
              <span className="hidden sm:inline">የተወዳዳሪ ደረጃ</span>
              <span className="sm:hidden">ደረጃ</span>
            </h2>
            <div className="ml-2 md:ml-4 bg-white/20 px-2 py-1 md:px-3 rounded-full">
              <span className="text-white font-medium text-sm md:text-base">
                ዙር {currentRound}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {roundOneState && (
              <div className="flex gap-1 md:gap-2">
                <Button
                  onClick={() => switchToRound(1)}
                  variant={currentRound === 1 ? "secondary" : "outline"}
                  className={`text-xs md:text-sm px-2 py-1 md:px-3 ${
                    currentRound === 1
                      ? "bg-white text-blue-600"
                      : "text-white border-white hover:bg-white hover:text-blue-600"
                  }`}
                >
                  ዙር 1
                </Button>
                <Button
                  onClick={() => switchToRound(2)}
                  variant={currentRound === 2 ? "secondary" : "outline"}
                  className={`text-xs md:text-sm px-2 py-1 md:px-3 ${
                    currentRound === 2
                      ? "bg-white text-blue-600"
                      : "text-white border-white hover:bg-white hover:text-blue-600"
                  }`}
                >
                  ዙር 2
                </Button>
                {roundTwoState && (
                  <Button
                    onClick={() => switchToRound(3)}
                    variant={currentRound === 3 ? "secondary" : "outline"}
                    className={`text-xs md:text-sm px-2 py-1 md:px-3 ${
                      currentRound === 3
                        ? "bg-white text-blue-600"
                        : "text-white border-white hover:bg-white hover:text-blue-600"
                    }`}
                  >
                    ዙር 3
                  </Button>
                )}
              </div>
            )}
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-white hover:bg-blue-700 hover:text-white p-2 md:p-3 h-auto"
            >
              <X className="w-6 h-6 md:w-8 md:h-8" />
            </Button>
          </div>
        </div>

        {/* Revert Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={revertDialog.isOpen}
          onClose={() =>
            setRevertDialog({ isOpen: false, playerId: "", questionNumber: 0 })
          }
          title="ጥያቄ ውጤት ወደነበረበት መልስ"
          message={`ለጥያቄ ${revertDialog.questionNumber} የተሰጠውን መልስ ማስወገድ ይፈልጋሉ? ይህ ጥያቄውን ከተጫዋቹ የተመለሱ ጥያቄዎች ውስጥ ያስወግዳል እና ነጥቡን በዚሁ መሰረት ያስተካክላል።`}
          confirmLabel="አስወግድ"
          cancelLabel="ይቅር"
          onConfirm={handleRevertConfirm}
          variant="danger"
        />

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {sortedPlayers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Users className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 text-gray-400 mb-3 md:mb-4" />
              <p className="text-xl md:text-2xl lg:text-3xl text-gray-500 text-center">
                ተወዳዳሪዎች አልገቡም
              </p>
            </div>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {/* Round Two Setup Section - Only show in Round 1 */}
              {currentRound === 1 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 md:p-6">
                  {!showRoundTwoSetup ? (
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-blue-900 mb-4">
                        ዙር ሁለት ፍጠር
                      </h3>
                      <p className="text-gray-600 mb-6">
                        ለዙር ሁለት አዲስ ጨዋታ ከተወዳዳሪዎች አንዳንድ ተወዳዳሪዎች ጋር መጀመር ይችላሉ።
                      </p>
                      <Button
                        onClick={() => setShowRoundTwoSetup(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        ዙር ሁለት ፍጠር
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold text-blue-900">
                          ለዙር ሁለት ተወዳዳሪዎችን ይምረጡ
                        </h3>
                        <Button
                          onClick={() => setShowRoundTwoSetup(false)}
                          variant="outline"
                          size="sm"
                        >
                          ይቅር
                        </Button>
                      </div>
                      <p className="text-gray-600 mb-4">
                        ለዙር ሁለት የሚሳተፉ ተወዳዳሪዎችን ይምረጡ። ይህ ዙር ለዙር ሁለት የሚሆኑ ተወዳዳሪዎች
                        ብቻ ናቸው።
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {sortedPlayers.map((player) => {
                          const isSelected = roundTwoPlayers.includes(
                            player.id
                          );
                          return (
                            <div
                              key={player.id}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                isSelected
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 hover:border-blue-300"
                              }`}
                              onClick={() =>
                                isSelected
                                  ? removePlayerFromRoundTwo(player.id)
                                  : addPlayerToRoundTwo(player.id)
                              }
                            >
                              <div className="flex items-center">
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-200 flex items-center justify-center bg-blue-50 mr-3">
                                  {player.profileImage ? (
                                    <img
                                      src={player.profileImage}
                                      alt={`${player.name}'s profile`}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <User className="w-6 h-6 text-blue-400" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {player.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    ነጥቦች: {player.score}
                                  </p>
                                </div>
                                {isSelected && (
                                  <div className="ml-auto text-blue-500">
                                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                      <span className="text-white text-sm">
                                        ✓
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {roundTwoPlayers.length > 0 && (
                        <div className="flex justify-end">
                          <Button
                            onClick={() => startRoundTwo(roundTwoPlayers)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            ዙር ሁለት ጀምር ({roundTwoPlayers.length} ተወዳሪዎች)
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Round Two Player Management - Show in Round 2 */}
              {currentRound === 2 && roundOneState && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-green-900">
                      ዙር ሁለት ተወዳዳሪዎችን አስተካክል
                    </h3>
                    <Button
                      onClick={() => setShowRoundTwoSetup(!showRoundTwoSetup)}
                      variant="outline"
                      size="sm"
                      className="border-green-300 text-green-700 hover:bg-green-100"
                    >
                      {showRoundTwoSetup ? "ይቅር" : "አስተካክል"}
                    </Button>
                  </div>

                  {showRoundTwoSetup && (
                    <>
                      <p className="text-gray-600 mb-4">
                        ለዙር ሁለት ተወዳዳሪዎችን ያክሉ ወይም ያስወግዱ። ለውጦች በተግባር ላይ የሚሆኑበት ጊዜ
                        ዙር ሁለትን እንደገና ስብሰብ ነው።
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {getRoundOnePlayers().map((player) => {
                          const isSelected = roundTwoPlayers.includes(
                            player.id
                          );
                          return (
                            <div
                              key={player.id}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                isSelected
                                  ? "border-green-500 bg-green-50"
                                  : "border-gray-200 hover:border-green-300"
                              }`}
                              onClick={() =>
                                isSelected
                                  ? removePlayerFromRoundTwo(player.id)
                                  : addPlayerToRoundTwo(player.id)
                              }
                            >
                              <div className="flex items-center">
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-green-200 flex items-center justify-center bg-green-50 mr-3">
                                  {player.profileImage ? (
                                    <img
                                      src={player.profileImage}
                                      alt={`${player.name}'s profile`}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <User className="w-6 h-6 text-green-400" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {player.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    ነጥቦች: {player.score}
                                  </p>
                                </div>
                                {isSelected && (
                                  <div className="ml-auto text-green-500">
                                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                      <span className="text-white text-sm">
                                        ✓
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              resetRoundTwo();
                              setShowRoundTwoSetup(false);
                            }}
                            variant="outline"
                            className="border-red-300 text-red-700 hover:bg-red-100"
                          >
                            ዙር ሁለትን ያጥፉ
                          </Button>
                          <p className="text-sm text-gray-600 self-center">
                            ተወዳዳሪዎች ተመርጠዋል፡ {roundTwoPlayers.length}
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            // Restart round two with updated players
                            startRoundTwo(roundTwoPlayers);
                            setShowRoundTwoSetup(false);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          disabled={roundTwoPlayers.length === 0}
                        >
                          ዙር ሁለትን እንደገና ጀምር
                        </Button>
                      </div>
                    </>
                  )}

                  {!showRoundTwoSetup && (
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">
                        ዙር ሁለት ተወዳዳሪዎች፡ {roundTwoPlayers.length} ተወዳዳሪዎች
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {roundOneState.players
                          .filter((player) =>
                            roundTwoPlayers.includes(player.id)
                          )
                          .map((player) => (
                            <span
                              key={player.id}
                              className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                            >
                              {player.name}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Round Three Setup Section - Only show in Round 2 */}
              {currentRound === 2 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 md:p-6 mt-4">
                  {!showRoundThreeSetup ? (
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-blue-900 mb-4">
                        ዙር ሶስት ፍጠር
                      </h3>
                      <p className="text-gray-600 mb-6">
                        ለዙር ሶስት ከዙር ሁለት ተወዳዳሪዎች አንዳንዶቹን ይምረጡ።
                      </p>
                      <Button
                        onClick={() => setShowRoundThreeSetup(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        ዙር ሶስት ፍጠር
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold text-blue-900">
                          ለዙር ሶስት ተወዳዳሪዎችን ይምረጡ
                        </h3>
                        <Button
                          onClick={() => setShowRoundThreeSetup(false)}
                          variant="outline"
                          size="sm"
                        >
                          ይቅር
                        </Button>
                      </div>
                      <p className="text-gray-600 mb-4">
                        ከዙር ሁለት የተመረጡ ተወዳዳሪዎች ውስጥ ለዙር ሶስት የሚሳተፉን ይምረጡ።
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {(roundTwoState?.players || []).map((player) => {
                          const isSelected = roundThreePlayers.includes(
                            player.id
                          );
                          return (
                            <div
                              key={player.id}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                isSelected
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 hover:border-blue-300"
                              }`}
                              onClick={() =>
                                isSelected
                                  ? removePlayerFromRoundThree(player.id)
                                  : addPlayerToRoundThree(player.id)
                              }
                            >
                              <div className="flex items-center">
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-200 flex items-center justify-center bg-blue-50 mr-3">
                                  {player.profileImage ? (
                                    <img
                                      src={player.profileImage}
                                      alt={`${player.name}'s profile`}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <User className="w-6 h-6 text-blue-400" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {player.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    ነጥቦች: {player.score}
                                  </p>
                                </div>
                                {isSelected && (
                                  <div className="ml-auto text-blue-500">
                                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                      <span className="text-white text-sm">
                                        ✓
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {roundThreePlayers.length > 0 && (
                        <div className="flex justify-end">
                          <Button
                            onClick={() => startRoundThree(roundThreePlayers)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            ዙር ሶስት ጀምር ({roundThreePlayers.length} ተወዳሪዎች)
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Round Three Player Management - Show in Round 3 */}
              {currentRound === 3 && roundTwoState && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-purple-900">
                      ዙር ሶስት ተወዳዳሪዎችን አስተካክል
                    </h3>
                    <Button
                      onClick={() =>
                        setShowRoundThreeSetup(!showRoundThreeSetup)
                      }
                      variant="outline"
                      size="sm"
                      className="border-purple-300 text-purple-700 hover:bg-purple-100"
                    >
                      {showRoundThreeSetup ? "ይቅር" : "አስተካክል"}
                    </Button>
                  </div>

                  {showRoundThreeSetup && (
                    <>
                      <p className="text-gray-600 mb-4">
                        ለዙር ሶስት ተወዳዳሪዎችን ያክሉ ወይም ያስወግዱ። ለውጦች በተግባር ላይ የሚሆኑበት ጊዜ
                        ዙር ሶስትን እንደገና ስብሰብ ነው።
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {getRoundThreePlayers().map((player) => {
                          const isSelected = roundThreePlayers.includes(
                            player.id
                          );
                          return (
                            <div
                              key={player.id}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                isSelected
                                  ? "border-purple-500 bg-purple-50"
                                  : "border-gray-200 hover:border-purple-300"
                              }`}
                              onClick={() =>
                                isSelected
                                  ? removePlayerFromRoundThree(player.id)
                                  : addPlayerToRoundThree(player.id)
                              }
                            >
                              <div className="flex items-center">
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-200 flex items-center justify-center bg-purple-50 mr-3">
                                  {player.profileImage ? (
                                    <img
                                      src={player.profileImage}
                                      alt={`${player.name}'s profile`}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <User className="w-6 h-6 text-purple-400" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {player.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    ነጥቦች: {player.score}
                                  </p>
                                </div>
                                {isSelected && (
                                  <div className="ml-auto text-purple-500">
                                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                                      <span className="text-white text-sm">
                                        ✓
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              resetRoundThree();
                              setShowRoundThreeSetup(false);
                            }}
                            variant="outline"
                            className="border-red-300 text-red-700 hover:bg-red-100"
                          >
                            ዙር ሶስትን ያጥፉ
                          </Button>
                          <p className="text-sm text-gray-600 self-center">
                            ተወዳዳሪዎች ተመርጠዋል፡ {roundThreePlayers.length}
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            // Restart round three with updated players
                            startRoundThree(roundThreePlayers);
                            setShowRoundThreeSetup(false);
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                          disabled={roundThreePlayers.length === 0}
                        >
                          ዙር ሶስትን እንደገና ጀምር
                        </Button>
                      </div>
                    </>
                  )}

                  {!showRoundThreeSetup && (
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">
                        ዙር ሶስት ተወዳዳሪዎች፡ {roundThreePlayers.length} ተወዳዳሪዎች
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {(roundTwoState?.players || [])
                          .filter((player) =>
                            roundThreePlayers.includes(player.id)
                          )
                          .map((player) => (
                            <span
                              key={player.id}
                              className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                            >
                              {player.name}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="grid gap-4 md:gap-6 lg:gap-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {sortedPlayers.map((player) => {
                  const playerQuestionLimit = maxQuestionsPerPlayer;
                  const isPlayerInTieBreaker = hasPlayerReachedMaxQuestions(
                    player.id
                  );
                  const answeredPercentage =
                    playerQuestionLimit > 0
                      ? Math.round(
                          (player.questionsAnswered.length /
                            playerQuestionLimit) *
                            100
                        )
                      : 0;
                  const incorrectCount =
                    player.incorrectAnswers !== undefined
                      ? player.incorrectAnswers
                      : Math.max(
                          player.questionsAnswered.length -
                            player.correctAnswers,
                          0
                        );

                  return (
                    <div
                      key={player.id}
                      className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 md:p-5 flex flex-col gap-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-4 border-blue-200 flex items-center justify-center bg-blue-50">
                            {player.profileImage ? (
                              <img
                                src={player.profileImage}
                                alt={`${player.name}'s profile`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-8 h-8 md:w-10 md:h-10 text-blue-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg md:text-xl font-bold text-blue-900">
                              {player.name}
                            </h3>
                            {player.woreda && (
                              <span className="mt-1 inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs md:text-sm font-semibold">
                                ከፍለ ከተማ፡ {player.woreda}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs uppercase tracking-wide text-gray-500">
                            ነጥብ
                          </span>
                          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            {player.score}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-blue-50 rounded-xl p-3 text-center">
                          <p className="text-xs md:text-sm text-blue-500 font-medium">
                            ጥያቄዎች
                          </p>
                          <p className="text-lg md:text-xl font-bold text-blue-800">
                            {player.questionsAnswered.length}/
                            {playerQuestionLimit || 0}
                            {isPlayerInTieBreaker ? " + ታይ" : ""}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-3 text-center">
                          <p className="text-xs md:text-sm text-green-500 font-medium">
                            ትክክል
                          </p>
                          <p className="text-lg md:text-xl font-bold text-green-800">
                            {player.correctAnswers}
                          </p>
                        </div>
                        <div className="bg-red-50 rounded-xl p-3 text-center">
                          <p className="text-xs md:text-sm text-red-500 font-medium">
                            ስህተት
                          </p>
                          <p className="text-lg md:text-xl font-bold text-red-800">
                            {incorrectCount}
                          </p>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs md:text-sm text-gray-500">
                            እድገት
                          </span>
                          <span className="text-xs md:text-sm font-medium text-blue-700">
                            {answeredPercentage}%
                          </span>
                        </div>
                        <progress
                          className="w-full h-2 rounded-full overflow-hidden bg-gray-200 [accent-color:#2563EB]"
                          value={player.questionsAnswered.length}
                          max={Math.max(playerQuestionLimit, 1)}
                        />
                      </div>

                      <div>
                        <p className="text-xs md:text-sm text-gray-500 mb-2">
                          የተጠየቁ ጥያቄዎች
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {player.questionsAnswered.map((questionId, index) => {
                            const isCorrect = index < player.correctAnswers;
                            return (
                              <div key={questionId} className="relative group">
                                <div
                                  className={`px-2 py-1 rounded-full text-xs md:text-sm font-medium ${
                                    isCorrect
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  Q{questionId}
                                </div>
                                <button
                                  onClick={() =>
                                    handleRevertClick(player.id, questionId)
                                  }
                                  className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-[10px]"
                                  title={`ለጥያቄ ${questionId} መልስን አስወግድ`}
                                >
                                  <RotateCcw className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerStatusModal;
