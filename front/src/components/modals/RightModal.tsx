import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface RightModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  labelAction: string;
  /** Libellé du bouton d'annulation. « Close » par défaut. */
  labelCancel?: string;
  type: string;
  closeOnOutsideClick?: boolean;
  onSave?: () => void;
  isLoading?: boolean;
  /** Classes de largeur du panneau. `w-[30%] min-w-[320px]` par défaut. */
  widthClass?: string;
}

const RightModal: React.FC<RightModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  type,
  labelAction,
  labelCancel = "Close",
  closeOnOutsideClick = true,
  onSave,
  isLoading = false,
  widthClass = "w-[30%] min-w-[320px]",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Animation duration in milliseconds
  const animationDuration = 500;

  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Delay visibility to allow render before animation starts
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, animationDuration);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    if (shouldRender) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [shouldRender]);

  if (!shouldRender) return null;

  return (
    <>
      {/* Backdrop - dark mode compatible */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 dark:bg-black/50 transition-opacity duration-[1000ms] ${isVisible ? "opacity-100" : "opacity-0"
          }`}
        onClick={closeOnOutsideClick ? onClose : undefined}
      />

      {/* Modal container */}
      <div
        className={`fixed right-0 top-20 z-50 flex h-[calc(100vh-5rem)] ${widthClass} flex-col transform ${isVisible ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-[1000ms] ease-in-out`}
      >
        {/* Modal content - dark mode styles */}
        <div className="flex h-full flex-col bg-white dark:bg-gray-800 shadow-xl dark:shadow-gray-900/50">
          {/* Header - dark mode styles */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Scrollable content area - dark mode styles */}
          <div className="flex-1 overflow-y-auto p-6 text-gray-800 dark:text-gray-200">
            {children}
          </div>

          {/* Fixed bottom buttons - dark mode styles */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="rounded px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {labelCancel}
              </button>
              <button
                onClick={onSave || onClose}
                disabled={isLoading}
                className={`rounded flex items-center justify-center gap-2 ${type == 'update' ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800' : 'bg-red-500 hover:bg-red-600 dark:bg-red-800 dark:hover:bg-red-900'} px-4 py-2 text-white ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {labelAction}
                {isLoading && <Loader2 className="w-4 h-4 animate-spin text-white" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RightModal;