import { useState } from "react";
import { Button } from "../components/ui/button";
import { useGameStore } from "../store/gameStore";
import { ConfirmationDialog } from "../components/ui/dialog";
import PlayerForm from "../components/players/PlayerForm";
import PlayerList from "../components/players/PlayerList";
import { Users, BarChart } from "lucide-react";
import PlayerStatusModal from "../components/PlayerStatusModal";

function HomePage() {
  const { resetGame, players, totalQuestions } = useGameStore();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [showPlayerStatus, setShowPlayerStatus] = useState(false);

  const handleResetConfirm = () => {
    resetGame();
    setIsResetDialogOpen(false);
  };

  const togglePlayerStatus = () => {
    setShowPlayerStatus((prev) => !prev);
  };

  return (
    <div className="relative h-[50vh] flex flex-col">
      <div className="absolute inset-0 bg-[url(/bg.jpg)] bg-no-repeat bg-cover bg-center blur-lg -z-10"></div>

      {/* Reset Progress Dialog */}
      <ConfirmationDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        title="Reset Progress"
        message="Are you sure you want to reset all your progress? This action cannot be undone."
        confirmLabel="Reset Progress"
        cancelLabel="Cancel"
        onConfirm={handleResetConfirm}
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
      <header className="py-4 px-8 flex justify-end ">
        <Button
          onClick={togglePlayerStatus}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xl px-6 py-6 h-auto rounded-xl"
        >
          <BarChart className="w-6 h-6 mr-2" />
          የተወዳዳሪ ደረጃ ተመልከት
        </Button>
      </header>

      {/* Hero Section */}
      <section className="flex-grow flex items-center justify-center py-2 px-8">
        <div className="container mx-auto relative">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-4xl p-2 bg-blue-200/20 rounded-lg">
              የአስተሳሰብና የተግባር አንድነት ለጠንካራ ፓርቲ
            </p>
            <h1 className="text-6xl md:text-7xl font-bold text-blue-900 mb-12 z-50 leading-tight">
              በየካ ክፍለ ከተማ ብልፅግና ፓርቲ ቅርንጫፍ ጽ/ቤት የፖለቲካ አቅምናና ግንባታ ዘርፍ የተዘጋጀ የጥያቄና
              መልስ ውድድር መድረክ የተዘጋጁ ጥያቄዎች
            </h1>

            {/* Player Management Section */}
            <div className="mt-16 bg-white rounded-2xl shadow-xl p-10 max-w-6xl mx-auto relative z-10">
              <div className="flex items-center justify-center mb-10">
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-4xl font-bold text-gray-800">
                  የተወዳዳሪ መቆጣጠሪያ
                </h2>
              </div>

              <div className="mb-12">
                <PlayerForm />
              </div>

              <div className="mb-8">
                <PlayerList />
              </div>

              {players.length > 0 && (
                <div className="text-center mt-10">
                  <p className="text-xl text-gray-600 mb-6">
                    ጨዋታውን ለመጀመር የተጫዋች ስም ይምረጡ
                  </p>
                </div>
              )}

              <button
                onClick={() => setIsResetDialogOpen(true)}
                className="mt-10 text-red-600 hover:text-red-800 transition-colors text-xl underline underline-offset-4"
              >
                ሁሉንም ሂደት ይመልሱ
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
    </div>
  );
}

export default HomePage;
