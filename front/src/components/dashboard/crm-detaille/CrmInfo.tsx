import { Prospect, ProspectStatus } from "../CRM/PipelineCommercial";
import { Phone, Mail, MapPin, Inbox } from "lucide-react";

interface CrmInfoProps {
  prospect: Prospect;
}

const getStatusBadgeStyle = (status: ProspectStatus) => {
  switch (status) {
    case "Chaud":
      return "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400";
    case "Tiède":
      return "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400";
    case "Froid":
      return "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
    case "Actif":
      return "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400";
    case "Perdu":
      return "bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400";
    default:
      return "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400";
  }
};

export default function CrmInfo({ prospect }: CrmInfoProps) {
  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center gap-4">
        <div 
          className="w-16 h-16 rounded-xl flex flex-col items-center justify-center font-bold text-center leading-tight shadow-sm text-sm"
          style={{
            background: "linear-gradient(135deg, #0e1b38 0%, #153270 100%)",
            color: "white"
          }}
        >
          {prospect.company.split(' ').slice(0, 2).map((word, i) => (
            <span key={i} className="block">{word.toUpperCase()}</span>
          ))}
        </div>
        
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-[#1e293b] dark:text-white tracking-tight">{prospect.company}</h3>
            <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-md ${getStatusBadgeStyle(prospect.status)}`}>
              {prospect.status}
            </span>
          </div>
          <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
            ID : PRO-2024-{prospect.id.replace('p-', '').padStart(5, '0')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-start">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-[#7c8fb5] dark:text-slate-400" />
            <span className="text-[13px] text-[#334155] dark:text-slate-300 font-semibold">06 61 23 45 67</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-[#7c8fb5] dark:text-slate-400" />
            <span className="text-[13px] text-[#334155] dark:text-slate-300 font-semibold">contact@{prospect.company.toLowerCase().replace(/\s+/g, '')}.ma</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-[#7c8fb5] dark:text-slate-400" />
            <span className="text-[13px] text-[#334155] dark:text-slate-300 font-semibold">{prospect.city}, Maroc</span>
          </div>
        </div>

        <div className="w-px h-full bg-slate-100 dark:bg-slate-800 self-stretch"></div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(prospect.contactName)}&background=random`} 
                alt={prospect.contactName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mb-0.5">Commercial</p>
              <p className="text-[13px] text-[#1e293b] dark:text-white font-bold">{prospect.contactName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
              <Inbox className="w-4 h-4 text-[#4f46e5] dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mb-0.5">Source</p>
              <p className="text-[13px] text-[#1e293b] dark:text-white font-bold">{prospect.source}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
