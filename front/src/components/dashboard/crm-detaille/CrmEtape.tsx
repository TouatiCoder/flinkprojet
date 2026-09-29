import { Check, ChevronDown, Star } from "lucide-react";

const steps = [
  { id: 1, label: "Nouveau", status: "completed" },
  { id: 2, label: "À contacter", status: "completed" },
  { id: 3, label: "établi", status: "completed" },
  { id: 4, label: "envoyée", status: "completed" },
  { id: 7, label: "Négociation", status: "current" },
  { id: 8, label: "restant", status: "upcoming" },
  { id: 9, label: "Paiement", status: "upcoming" },
  { id: 10, label: "Onboarding", status: "upcoming" },
];

export default function CrmEtape() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 shadow-sm">
      <h4 className="text-[15px] font-bold text-[#1e293b] dark:text-gray-100 mb-6">
        Étapes du pipeline
      </h4>

      <div className="relative flex justify-between items-start mb-8">
        <div className="absolute top-3 left-4 right-4 h-[2px] bg-gray-100 dark:bg-gray-800 -z-10"></div>
        <div className="absolute top-3 left-4 w-[55%] h-[2px] bg-emerald-500 -z-10"></div>

        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center gap-2 flex-1">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold z-10 
                ${
                  step.status === "completed"
                    ? "bg-emerald-500 text-white"
                    : step.status === "current"
                    ? "bg-orange-500 text-white"
                    : "bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                }`}
            >
              {step.status === "completed" ? (
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              ) : (
                step.id
              )}
            </div>
            {/* <span
              className={`text-[10px] text-center leading-tight whitespace-pre-line ${
                step.status === "completed" || step.status === "current"
                  ? "text-[#1e3a8a] font-semibold"
                  : "text-gray-500 font-medium"
              }`}
            >
              {step.label}
            </span> */}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-4 pt-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
          </div>
          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
            <Star className="w-3 h-3 text-white fill-current" />
          </div>
          <div className="flex items-center gap-1 cursor-pointer">
            <span className="text-[12px] font-bold text-[#1e3a8a] dark:text-blue-400">Parcours</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-between relative pl-4">
          <div className="absolute left-4 right-2 top-1/2 -translate-y-1/2 h-px bg-gray-200 dark:bg-gray-700 -z-10"></div>
          
          <div className="w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300 z-10">
            60
          </div>
          <div className="w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300 z-10">
            10
          </div>
          <div className="w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300 z-10">
            10
          </div>
          <div className="w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300 z-10">
            11
          </div>
        </div>
      </div>
    </div>
  );
}