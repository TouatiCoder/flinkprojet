import {
  FileText,
  CheckCircle2,
  Heart,
  Users,
  Eye,
  Phone,
  MessageCircle,
  AlertTriangle,
  Activity,
  Wallet,
  Building2,
  Info,
  TrendingUp,
} from "lucide-react";
import { Etablissement } from "../../../../services/etablissementsApi";
import AccountActivitySection from "./AccountActivitySection";

interface EtablissementStatistiqueProps {
  etablissement: Etablissement;
}

export default function EtablissementStatistique({
  etablissement,
}: EtablissementStatistiqueProps) {
  const stats = {
    annonces: Number(etablissement.total_annonces) || 0,
    annoncesActives:
      Number(etablissement.total_annonces_actives) ||
      Number((etablissement as any).publications_count) ||
      0,
    favoris: Number(etablissement.total_favoris) || 0,
    followers: Number(etablissement.total_followers) || 0,
    vues: Number(etablissement.total_vues) || 0,
    clicsTelephone: Number(etablissement.total_click_tele) || 0,
    clicsWhatsapp: Number(etablissement.total_click_whatsapp) || 0,
    signalements: 5,
  };
  const ca = Number(etablissement.consommation_solde || 0);

  const soldeAds = Number((etablissement as any).consommation_solde) || 0;
  const gestionnairesCount =
    (etablissement as any).total_users_gerants ??
    (etablissement as any).total_gestionnaires ??
    (etablissement as any).gestionnaires?.length ??
    0;

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + "k";
    }
    return num.toString();
  };

  const statItems = [
    {
      label: "Publications",
      value: formatNumber(stats.annonces),
      icon: <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />,
      bg: "bg-slate-50 dark:bg-slate-800 border-slate-200/80 dark:border-slate-700",
    },
    {
      label: "Annonces",
      value: formatNumber(stats.annoncesActives),
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-800/50",
    },
    {
      label: "Favoris",
      value: formatNumber(stats.favoris),
      icon: <Heart className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
      bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200/60 dark:border-purple-800/50",
    },
    {
      label: "Followers",
      value: formatNumber(stats.followers),
      icon: <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />,
      bg: "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
    },
    {
      label: "Vues",
      value: formatNumber(stats.vues),
      icon: <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200/60 dark:border-blue-800/50",
    },
    {
      label: "Téléphone",
      value: formatNumber(stats.clicsTelephone),
      icon: <Phone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
      bg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/60 dark:border-indigo-800/50",
    },
    {
      label: "WhatsApp",
      value: formatNumber(stats.clicsWhatsapp),
      icon: <MessageCircle className="w-4 h-4 text-green-600 dark:text-green-400" />,
      bg: "bg-green-50 dark:bg-green-950/40 border-green-200/60 dark:border-green-800/50",
    },
    {
      label: "Signalements",
      value: formatNumber(stats.signalements),
      icon: <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
      bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200/60 dark:border-rose-800/50",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="border border-slate-200/80 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/50 text-[#5C24E8]">
            <Activity className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Statistiques rapides
          </h3>
        </div>

        <div className="grid grid-cols-4 gap-y-6 gap-x-3 text-center">
          {statItems.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div
                className={`w-9 h-9 flex items-center justify-center rounded-xl border mb-2 shadow-xs ${item.bg}`}
              >
                {item.icon}
              </div>
              <span className="text-base font-bold text-slate-900 dark:text-white leading-tight mb-0.5">
                {item.value}
              </span>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 capitalize">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-emerald-500/30 bg-white dark:bg-[#07131b]/60 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600/90 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 leading-tight">
                {(soldeAds || 0).toLocaleString("fr-FR")} DH
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Solde Ads
                </span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </div>
          {/* <button
            type="button"
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer"
          >
            <span>Voir le détail</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button> */}
        </div>

        <div className="p-4 rounded-2xl border border-purple-500/30 bg-white dark:bg-[#0f0b1e]/60 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#5C24E8] text-white flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {ca.toLocaleString("fr-FR")} DH
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  CA
                </span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-blue-500/30 bg-white dark:bg-[#081126]/60 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {gestionnairesCount}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Gestionnaires
                </span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <AccountActivitySection entityId={etablissement.id} type="etablissement" />
    </div>
  );
}