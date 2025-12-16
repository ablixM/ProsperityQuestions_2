import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { useGameStore } from "../store/gameStore";
import { ConfirmationDialog } from "../components/ui/dialog";
import PlayerForm from "../components/players/PlayerForm";
import PlayerList from "../components/players/PlayerList";
import { Users, BarChart, BookOpen } from "lucide-react";
import PlayerStatusModal from "../components/PlayerStatusModal";
import { useNavigate, useLocation } from "react-router-dom";

function HomePage() {
  const {
    resetGame,
    players,
    totalQuestions,
    currentRound,
    roundOneState,
    resetRoundTwo,
  } = useGameStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [showPlayerStatus, setShowPlayerStatus] = useState(false);
  const [isResetRoundTwoDialogOpen, setIsResetRoundTwoDialogOpen] =
    useState(false);

  const handleResetConfirm = () => {
    resetGame();
    setIsResetDialogOpen(false);
    // Scroll to top when resetting game
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const handleResetRoundTwoConfirm = () => {
    resetRoundTwo();
    setIsResetRoundTwoDialogOpen(false);
  };

  const togglePlayerStatus = () => {
    setShowPlayerStatus((prev) => !prev);
  };

  const handleNavigateToQuestionReader = () => {
    navigate("/question-reader");
  };

  // Scroll to player list if coming from question page
  useEffect(() => {
    if (location.hash === "#player-list") {
      setTimeout(() => {
        const playerListSection = document.querySelector(
          ".player-list-section"
        );
        if (playerListSection) {
          playerListSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [location]);

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="absolute inset-0 bg-[url(/bg.jpg)] bg-no-repeat bg-cover bg-center blur-lg -z-10"></div>

      {/* Reset Progress Dialog */}
      <ConfirmationDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        title="ሂደትን ዳግም አስጀምር"
        message="ሁሉንም ሂደት ዳግም ማስጀመር ይፈልጋሉ? ይህ ድርጊት ሊቀለበስ አይችልም።"
        confirmLabel="ሂደትን ዳግም አስጀምር"
        cancelLabel="ይቅር"
        onConfirm={handleResetConfirm}
        variant="danger"
      />

      {/* Reset Round Two Dialog */}
      <ConfirmationDialog
        isOpen={isResetRoundTwoDialogOpen}
        onClose={() => setIsResetRoundTwoDialogOpen(false)}
        title="ዙር ሁለትን ዳግም አስጀምር"
        message="ዙር ሁለትን ዳግም ማስጀመር እና ወደ ዙር አንድ መመለስ ይፈልጋሉ? ይህ የዙር አንድ መረጃን ይጠብቃል ግን የዙር ሁለት ሂደትን ያጠፋል።"
        confirmLabel="ዙር ሁለትን ዳግም አስጀምር"
        cancelLabel="ይቅር"
        onConfirm={handleResetRoundTwoConfirm}
        variant="danger"
      />

      {/* Player Status Modal */}
      <PlayerStatusModal
        isOpen={showPlayerStatus}
        onClose={() => setShowPlayerStatus(false)}
        allPlayers={players}
        totalQuestions={totalQuestions}
      />

      {/* Header with Status Button */}
      <header className="py-3 px-4 md:py-4 md:px-8 flex justify-between items-center">
        <div className="flex items-center">
          {roundOneState && (
            <div className="bg-white/20 px-3 py-1 md:px-4 md:py-2 rounded-full mr-2 md:mr-4">
              <span className="text-white font-medium text-sm md:text-lg">
                ዙር {currentRound}
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2 md:gap-4">
          <Button
            onClick={handleNavigateToQuestionReader}
            className="bg-green-600 hover:bg-green-700 text-white text-sm md:text-xl px-3 py-3 md:px-6 md:py-6 h-auto rounded-xl"
          >
            <BookOpen className="w-4 h-4 md:w-6 md:h-6 mr-1 md:mr-2" />
            <span className="hidden sm:inline">ጥያቄዎችን ያንብቡ</span>
            <span className="sm:hidden">ጥያቄ</span>
          </Button>
          <Button
            onClick={togglePlayerStatus}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-xl px-3 py-3 md:px-6 md:py-6 h-auto rounded-xl"
          >
            <BarChart className="w-4 h-4 md:w-6 md:h-6 mr-1 md:mr-2" />
            <span className="hidden sm:inline">የተወዳዳሪ ደረጃ ተመልከት</span>
            <span className="sm:hidden">ደረጃ</span>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-grow flex items-center justify-center py-4 px-4 md:py-8 md:px-8">
        <div className="container mx-auto relative">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-lg md:text-2xl lg:text-4xl p-2 bg-blue-200/20 rounded-lg mb-4 md:mb-6">
              የአስተሳሰብና የተግባር አንድነት ለጠንካራ ፓርቲ
            </p>
            <h1 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-blue-900 mb-6 md:mb-12 z-50 leading-tight px-2">
              የአዲስ አበባ ብልፅግና ፓርቲ ቅርንጫፍ ፅ/ቤት የፖለቲካና አቅም ግንባታ ዘርፍ የተዘጋጀ የአሸናፊዎች
              አሸናፊ የጥያቄና መልስ የማጠቃለያ ውድድር
            </h1>

            {/* Player Management Section */}
            <div className="mt-8 md:mt-16 bg-white rounded-2xl shadow-xl p-4 md:p-6 lg:p-10 max-w-6xl mx-auto relative z-10 player-list-section">
              <div className="flex items-center justify-center mb-6 md:mb-10">
                <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mr-2 md:mr-3" />
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">
                  የተወዳዳሪ መቆጣጠሪያ
                </h2>
              </div>

              <div className="mb-8 md:mb-12">
                <PlayerForm />
              </div>

              <div className="mb-6 md:mb-8">
                <PlayerList />
              </div>

              {players.length > 0 && (
                <div className="text-center mt-6 md:mt-10">
                  <p className="text-lg md:text-xl text-gray-600 mb-4 md:mb-6 px-2">
                    ጨዋታውን ለመጀመር የተጫዋች ስም ይምረጡ
                  </p>
                  {roundOneState && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 mb-4 md:mb-6 mx-2">
                      <p className="text-blue-800 font-medium text-sm md:text-base">
                        እዚህ ዙር {currentRound} ነው። ተወዳዳሪዎች እና ውጤቶች ለዚህ ዙር ብቻ ናቸው።
                      </p>
                    </div>
                  )}
                </div>
              )}

              {currentRound === 2 && (
                <button
                  onClick={() => setIsResetRoundTwoDialogOpen(true)}
                  className="mt-4 mr-4 text-orange-600 hover:text-orange-800 transition-colors text-sm md:text-lg underline underline-offset-4"
                >
                  ዙር ሁለትን ያጥፉ እና እንደገና ጀምሩ
                </button>
              )}
              <button
                onClick={() => setIsResetDialogOpen(true)}
                className="mt-6 md:mt-10 text-red-600 hover:text-red-800 transition-colors text-lg md:text-xl underline underline-offset-4 block mx-auto"
              >
                ሁሉንም ሂደት ይመልሱ
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
