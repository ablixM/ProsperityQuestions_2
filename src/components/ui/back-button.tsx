import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./button";

interface BackButtonProps {
  label?: string;
  className?: string;
}

const BackButton: FC<BackButtonProps> = ({
  label = "Go Back",
  className = "",
}) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Navigate to the previous page in history
  };

  return (
    <Button
      variant="outline"
      className={`border-2 shadow-none  border-transparent  text-gray-700  hover:text-gray-900 transition-all ${className}`}
      onClick={handleGoBack}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 mr-2"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
          clipRule="evenodd"
        />
      </svg>
      {label}
    </Button>
  );
};

export default BackButton;
