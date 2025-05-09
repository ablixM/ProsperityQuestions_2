import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";

function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-blue-600 text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="w-10 h-10">
            <img src="/image.png" alt="" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="font-medium hover:text-blue-200 transition-colors"
            >
              Home
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            className="md:hidden text-white hover:bg-blue-700"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-4 border-t border-blue-500 mt-4">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className="font-medium hover:text-blue-200 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default LandingHeader;
