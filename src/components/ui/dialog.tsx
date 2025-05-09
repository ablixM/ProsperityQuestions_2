import { FC } from "react";
import { Button } from "./button";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  variant?: "success" | "danger" | "warning" | "info";
}

export const ConfirmationDialog: FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  variant = "warning",
}) => {
  if (!isOpen) return null;

  // Determine colors based on variant
  const getVariantClasses = () => {
    switch (variant) {
      case "success":
        return "bg-green-50 border-green-200";
      case "danger":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-amber-50 border-amber-200";
      case "info":
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const getButtonVariantClasses = () => {
    switch (variant) {
      case "success":
        return "bg-green-600 hover:bg-green-700";
      case "danger":
        return "bg-red-600 hover:bg-red-700";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700";
      case "info":
      default:
        return "bg-blue-600 hover:bg-blue-700";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <div
          className={`relative rounded-lg border ${getVariantClasses()} p-6 shadow-xl transition-all w-full max-w-md`}
        >
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="text-gray-700 hover:bg-gray-100"
              >
                {cancelLabel}
              </Button>
              {onConfirm && (
                <Button
                  onClick={onConfirm}
                  className={`text-white ${getButtonVariantClasses()}`}
                >
                  {confirmLabel}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ResultDialog: FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  confirmLabel = "Continue",
  variant = "success",
}) => {
  if (!isOpen) return null;

  // Determine colors based on variant
  const getVariantClasses = () => {
    switch (variant) {
      case "success":
        return "bg-green-50 border-green-200";
      case "danger":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-amber-50 border-amber-200";
      case "info":
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const getButtonVariantClasses = () => {
    switch (variant) {
      case "success":
        return "bg-green-600 hover:bg-green-700";
      case "danger":
        return "bg-red-600 hover:bg-red-700";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700";
      case "info":
      default:
        return "bg-blue-600 hover:bg-blue-700";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-8">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <div
          className={`relative rounded-xl border-4 ${getVariantClasses()} p-10 shadow-2xl transition-all w-full max-w-2xl`}
        >
          <div className="text-center">
            <h3 className="text-4xl font-bold text-gray-900 mb-6">{title}</h3>
            <p className="text-2xl text-gray-700 mb-10">{message}</p>
            <div className="flex justify-center">
              <Button
                onClick={onClose}
                className={`text-white text-xl py-6 px-10 rounded-xl ${getButtonVariantClasses()}`}
                size="lg"
              >
                {confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
