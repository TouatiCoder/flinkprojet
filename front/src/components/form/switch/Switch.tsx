import React from "react";

interface SwitchProps {
  label: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  color?: "blue" | "gray"; // Added prop to toggle color theme
}

const Switch: React.FC<SwitchProps> = ({
  label,
  checked = false,
  disabled = false,
  onChange,
  color = "blue", // Default to blue color
}) => {
  const handleToggle = () => {
    if (disabled) return;
    if (onChange) {
      onChange(!checked);
    }
  };

  const switchColors =
    color === "blue"
      ? {
        background: checked
          ? "bg-brand-500 "
          : "bg-gray-200 dark:bg-white/10", // Blue version
        knob: checked
          ? "translate-x-full bg-white"
          : "translate-x-0 bg-white",
      }
      : {
        background: checked
          ? "bg-gray-800 dark:bg-white/10"
          : "bg-gray-200 dark:bg-white/10", // Gray version
        knob: checked
          ? "translate-x-full bg-white"
          : "translate-x-0 bg-white",
      };

  return (
    <label
      className={`flex select-none items-center gap-3 text-sm font-medium transition-opacity duration-200 ${disabled
        ? "text-gray-400 opacity-40 cursor-not-allowed"
        : "text-gray-700 dark:text-gray-400 cursor-pointer opacity-100"
        }`}
      onClick={handleToggle} // Toggle when the label itself is clicked
    >
      <div className={`relative transition-opacity duration-200 ${disabled ? "opacity-40" : "opacity-100"}`}>
        <div
          className={`block transition duration-150 ease-linear h-6 w-11 rounded-full ${disabled
            ? "bg-gray-100 pointer-events-none dark:bg-gray-800"
            : switchColors.background
            }`}
        ></div>
        <div
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full shadow-theme-sm duration-150 ease-linear transform ${switchColors.knob}`}
        ></div>
      </div>
      {label}
    </label>
  );
};

export default Switch;
