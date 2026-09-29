import { 
  UserSquare2, 
  Newspaper, 
  Eye, 
  PhoneCall, 
  AtSign, 
  Clock 
} from "lucide-react";

export default function CrmOrigine() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 shadow-sm">
      <div className="mb-4">
        <h4 className="text-[14px] font-bold text-[#1e293b] dark:text-gray-100 inline">
          Origine Flink
        </h4>
        <span className="text-[13px] text-slate-500 dark:text-slate-400 ml-1 font-medium">
          (données utilisateur)
        </span>
      </div>

      <div className="space-y-3.5">
        <div className="flex items-center gap-3 text-[#2a3f6a] dark:text-slate-300">
          <UserSquare2 className="w-4 h-4 shrink-0 stroke-[2.5]" />
          <span className="text-[13.5px] font-semibold">Compte créé le 15/02/2024</span>
        </div>

        <div className="flex items-center gap-3 text-[#2a3f6a] dark:text-slate-300">
          <Newspaper className="w-4 h-4 shrink-0 stroke-[2.5]" />
          <span className="text-[13.5px] font-semibold">120 annonces publiées</span>
        </div>

        <div className="flex items-center gap-3 text-[#2a3f6a] dark:text-slate-300">
          <Eye className="w-4 h-4 shrink-0 stroke-[2.5]" />
          <span className="text-[13.5px] font-semibold">12 540 vues totales</span>
        </div>

        <div className="flex items-center gap-3 text-[#2a3f6a] dark:text-slate-300">
          <PhoneCall className="w-4 h-4 shrink-0 stroke-[2.5]" />
          <span className="text-[13.5px] font-semibold">230 contacts reçus</span>
        </div>

        <div className="flex items-center gap-3 text-[#2a3f6a] dark:text-slate-300">
          <AtSign className="w-4 h-4 shrink-0 stroke-[2.5]" />
          <span className="text-[13.5px] font-semibold">5 campagnes publicitaires</span>
        </div>

        <div className="flex items-center gap-3 text-[#2a3f6a] dark:text-slate-300">
          <Clock className="w-4 h-4 shrink-0 stroke-[2.5]" />
          <span className="text-[13.5px] font-semibold">Dernière activité : aujourd'hui</span>
        </div>
      </div>
    </div>
  );
}
