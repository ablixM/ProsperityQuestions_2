import { useState } from "react";
import { Button } from "../ui/button";
import { useGameStore } from "../../store/gameStore";

const PlayerForm = () => {
  const [playerName, setPlayerName] = useState("");
  const { addPlayer } = useGameStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      addPlayer(playerName.trim());
      setPlayerName("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto space-y-4"
    >
      <div className="flex flex-col space-y-3">
        <label
          htmlFor="playerName"
          className="text-3xl font-medium text-gray-700"
        >
          የተጫዋች ስም
        </label>
        <div className="flex space-x-4 items-center">
          <input
            type="text"
            id="playerName"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="flex-1 px-6 py-4 text-xl border-2 border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter player name"
            required
          />
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xl px-8 py-4 rounded-sm"
          >
            ተጫዋች ጨምር
          </Button>
        </div>
      </div>
    </form>
  );
};

export default PlayerForm;
