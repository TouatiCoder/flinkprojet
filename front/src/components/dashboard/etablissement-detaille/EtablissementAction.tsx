import { FaWhatsapp } from "react-icons/fa";
import { ChevronDown } from "lucide-react";

const EtablissementAction = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 mb-6 shadow-sm">
      <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white mb-4">Actions rapides</h3>
      
      <div className="flex flex-wrap gap-3">
        <button className="px-4 py-2.5 text-[13px] font-medium text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-500/30 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
          Voir fiche complète
        </button>
        
        <button className="px-4 py-2.5 text-[13px] font-medium text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Voir annonces
        </button>
        
        <button className="px-4 py-2.5 text-[13px] font-medium text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Voir paiements
        </button>
        
        <button className="px-4 py-2.5 text-[13px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/40 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors">
          Ajouter crédit Ads
        </button>
        
        <button className="px-4 py-2.5 text-[13px] font-medium text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/40 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors">
          Renouveler abonnement
        </button>

        <button className="px-6 py-2.5 text-[13px] font-medium text-red-500 dark:text-red-400 bg-red-50/50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors">
          Suspendre le compte
        </button>
        
        <button className="px-6 py-2.5 text-[13px] font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
          <FaWhatsapp className="w-4 h-4 text-green-500 dark:text-green-400" />
          Contacter
        </button>
        
        <button className="px-6 py-2.5 text-[13px] font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
          Plus d'actions
          <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default EtablissementAction;
