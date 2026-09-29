import React from "react";
import {
  PhoneCall,
  Mail,
  MonitorPlay,
  Video,
  BellRing,
  Calendar,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export interface ActivityIconMeta {
  id: number;
  label: string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
  badgeBg: string;
}

export function getActivityIconMeta(typeIdOrNameOrIcon?: string | number | null): ActivityIconMeta {
  const raw = String(typeIdOrNameOrIcon || "").toLowerCase().trim();

  if (raw === "1" || raw.includes("appel") || raw.includes("phone") || raw.includes("tel") || raw.includes("call")) {
    return {
      id: 1,
      label: "Appel",
      icon: <PhoneCall className="w-4 h-4" />,
      colorClass: "text-blue-600 dark:text-blue-400",
      bgClass: "bg-blue-50 dark:bg-blue-950/50 border-blue-100 dark:border-blue-900/40",
      badgeBg: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500",
    };
  }

  if (raw === "2" || raw.includes("whatsapp") || raw.includes("wa") || raw.includes("chat") || raw.includes("message")) {
    return {
      id: 2,
      label: "WhatsApp",
      icon: <FaWhatsapp className="w-4 h-4" />,
      colorClass: "text-emerald-600 dark:text-emerald-400",
      bgClass: "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100 dark:border-emerald-900/40",
      badgeBg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500",
    };
  }

  if (raw === "3" || raw.includes("email") || raw.includes("mail") || raw.includes("courrier")) {
    return {
      id: 3,
      label: "Email",
      icon: <Mail className="w-4 h-4" />,
      colorClass: "text-purple-600 dark:text-purple-400",
      bgClass: "bg-purple-50 dark:bg-purple-950/50 border-purple-100 dark:border-purple-900/40",
      badgeBg: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500",
    };
  }

  if (raw === "4" || raw.includes("monitor") || raw.includes("demo") || raw.includes("démo") || raw.includes("presentation") || raw.includes("présentation")) {
    return {
      id: 4,
      label: "Démo",
      icon: <MonitorPlay className="w-4 h-4" />,
      colorClass: "text-amber-600 dark:text-amber-400",
      bgClass: "bg-amber-50 dark:bg-amber-950/50 border-amber-100 dark:border-amber-900/40",
      badgeBg: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500",
    };
  }

  if (raw === "5" || raw.includes("rdv") || raw.includes("visio") || raw.includes("meeting") || raw.includes("video") || raw.includes("reunion") || raw.includes("réunion")) {
    return {
      id: 5,
      label: "RDV / Visio",
      icon: <Video className="w-4 h-4" />,
      colorClass: "text-cyan-600 dark:text-cyan-400",
      bgClass: "bg-cyan-50 dark:bg-cyan-950/50 border-cyan-100 dark:border-cyan-900/40",
      badgeBg: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500",
    };
  }

  if (raw === "6" || raw.includes("relance") || raw.includes("rappel") || raw.includes("bell")) {
    return {
      id: 6,
      label: "Relance",
      icon: <BellRing className="w-4 h-4" />,
      colorClass: "text-rose-600 dark:text-rose-400",
      bgClass: "bg-rose-50 dark:bg-rose-950/50 border-rose-100 dark:border-rose-900/40",
      badgeBg: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500",
    };
  }

  return {
    id: 1,
    label: "Activité",
    icon: <Calendar className="w-4 h-4" />,
    colorClass: "text-slate-600 dark:text-slate-400",
    bgClass: "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700",
    badgeBg: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500",
  };
}