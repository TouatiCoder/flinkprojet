import { Etablissement } from "../../../services/etablissementsApi";

interface EtablissementScoreProProps {
  etablissement: Etablissement;
}

export default function EtablissementScorePro({ etablissement }: EtablissementScoreProProps) {
  const score = 85;
  const completude = 90;
  const activite = 85;
  const reactivite = 70;
  const qualite = 95;

  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  console.log("etablissement", etablissement)

  return (
    <div className="border border-gray-100 dark:border-gray-800 rounded-xl px-6 py-3 shadow-sm bg-white dark:bg-gray-900">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="6"></circle>
          <circle cx="12" cy="12" r="2"></circle>
        </svg>
        <h4 className="text-[15px] font-bold text-gray-900 dark:text-white">Score Pro Flink</h4>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
          <svg className="transform -rotate-90 w-14 h-14">
            <circle
              cx="28"
              cy="28"
              r={radius}
              stroke="currentColor"
              strokeWidth="3"
              fill="transparent"
              className="text-gray-100 dark:text-gray-800"
            />
            <circle
              cx="28"
              cy="28"
              r={radius}
              stroke="currentColor"
              strokeWidth="3"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="text-emerald-500"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center mt-0.5">
            <span className="text-[16px] font-bold text-emerald-500 dark:text-emerald-400 leading-none">{score}</span>
            <span className="text-[9px] text-gray-500 dark:text-gray-400 font-medium">/100</span>
          </div>
        </div>

        <div className="w-[1px] h-10 bg-gray-100 dark:bg-gray-800 mx-3 shrink-0"></div>

        <div className="flex-1 flex justify-between items-center">
          <div className="flex flex-col items-center text-center">
            <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-medium mb-1">Complétude</span>
            <span className="text-[12px] sm:text-[13px] font-bold text-emerald-500 dark:text-emerald-400">{completude}%</span>
          </div>
          
          <div className="w-[1px] h-8 bg-gray-100 dark:bg-gray-800 shrink-0 mx-1"></div>

          <div className="flex flex-col items-center text-center">
            <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-medium mb-1">Activité</span>
            <span className="text-[12px] sm:text-[13px] font-bold text-emerald-500 dark:text-emerald-400">{activite}%</span>
          </div>
          
          <div className="w-[1px] h-8 bg-gray-100 dark:bg-gray-800 shrink-0 mx-1"></div>

          <div className="flex flex-col items-center text-center">
            <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-medium mb-1">Réactivité</span>
            <span className="text-[12px] sm:text-[13px] font-bold text-gray-800 dark:text-gray-200">{reactivite}%</span>
          </div>
          
          <div className="w-[1px] h-8 bg-gray-100 dark:bg-gray-800 shrink-0 mx-1"></div>

          <div className="flex flex-col items-center text-center">
            <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-medium mb-1">Qualité</span>
            <span className="text-[12px] sm:text-[13px] font-bold text-gray-800 dark:text-gray-200">{qualite}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
