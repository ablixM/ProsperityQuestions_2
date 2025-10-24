import { useState, useRef, ChangeEvent } from "react";
import { Button } from "../ui/button";
import { useGameStore } from "../../store/gameStore";
import { User, Upload } from "lucide-react";

const PlayerForm = () => {
  const [playerName, setPlayerName] = useState("");
  const [woreda, setWoreda] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addPlayer } = useGameStore();

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      alert("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      setProfileImage(base64String);
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleWoredaChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWoreda(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      addPlayer(playerName.trim(), profileImage, woreda);
      setPlayerName("");
      setWoreda("");
      setProfileImage("");
      setImagePreview("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full mx-auto space-y-4 md:space-y-6"
    >
      <div className="flex flex-col md:flex-row w-full items-center justify-center gap-4 md:gap-6">
        <div className="md:col-span-3 flex justify-center md:ml-10">
          <div className="flex flex-col items-center">
            <label className="block text-sm md:text-lg font-medium text-gray-700 mb-2 md:mb-3">
              ፎቶ
            </label>
            <div
              className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-300 mb-2 flex items-center justify-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
              )}
            </div>
            <input
              title="upload file"
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs md:text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <Upload className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              ፎቶ ይጫኑ
            </button>
          </div>
        </div>

        {/* Player Name and Woreda */}
        <div className="flex flex-col md:flex-row w-full items-center justify-center gap-4 md:gap-6">
          {/* Player Name */}
          <div className="w-full md:w-auto">
            <label
              htmlFor="playerName"
              className="block text-sm md:text-lg font-medium text-gray-700 mb-1 md:mb-2"
            >
              የተወዳዳሪ ስም
            </label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-lg border-2 border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="የተወዳዳሪ ስም ይሙሉ"
              required
            />
          </div>

          {/* Woreda */}
          <div className="w-full md:w-auto">
            <label
              htmlFor="woreda"
              className="block text-sm md:text-lg font-medium text-gray-700 mb-1 md:mb-2"
            >
              የህብረት ስም
            </label>
            <input
              type="text"
              id="woreda"
              value={woreda}
              onChange={handleWoredaChange}
              className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-lg border-2 border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="የህብረት ስም"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 w-full md:w-auto">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg md:text-xl px-6 py-3 md:px-8 md:py-4 h-auto mt-4 md:mt-6 rounded-xl w-full md:w-auto"
            >
              ተወዳዳሪ ጨምር
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlayerForm;
