import { useState } from "react";

export type OrderOption = {
  value: string;
  label: string;
};

export interface OrderFilterProps {
  onOptionChange: (option: string) => void;
  initialOption?: string; // Optional prop to set initial value
  options: OrderOption[];
}

export default function OrderFilter({ 
  onOptionChange, 
  initialOption = "updated",
  options
}: OrderFilterProps) {
  const [selectedOption, setSelectedOption] = useState<string>(initialOption);

  

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    onOptionChange(option); // Call the parent's callback function
  };

  return (
    <div className="flex justify-end">
      <div className="inline-flex rounded-md shadow-sm" role="group">
        {options.map((option, index) => (
          <button
            key={option.value}
            type="button"
            className={`px-4 py-2 text-sm font-medium ${
              selectedOption === option.value
                ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                : "bg-white text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            } ${
              index === 0
                ? "rounded-l-lg border border-gray-200 dark:border-gray-600"
                : index === options.length - 1
                ? "rounded-r-lg border-t border-b border-r border-gray-200 dark:border-gray-600"
                : "border-t border-b border-gray-200 dark:border-gray-600"
            }`}
            onClick={() => handleOptionClick(option.value as string)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}