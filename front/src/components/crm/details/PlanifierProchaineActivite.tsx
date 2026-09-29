import { useState, useMemo, useEffect } from "react";
import {
  PhoneCall,
  Mail,
  MonitorPlay,
  Video,
  BellRing,
  Calendar,
  Info,
  Loader2,
  Sun,
  Clock,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import WhatsappTemplatePicker from "../../dashboard/Whatsapp/WhatsappTemplatePicker";
import { ActivityType } from "../../../services/activiteHistoriqueApi";

interface PlanifierProchaineActiviteProps {
  cardId: number;
  activityTypes?: ActivityType[];
  isLoading?: boolean;
  currentEtapeId?: number | null;
  initialServerTime?: string;
  initialServerHour?: string;
  initialServerDate?: string;
  onSubmit: (data: { typeId: number; date: string; heure: string; note: string; etapeId?: number }) => void;
  onCancel?: () => void;
}

export interface ActivityTypeConfig {
  icon: React.ReactNode;
  selectedCard: string;
  selectedIcon: string;
  unselectedCard: string;
  unselectedIcon: string;
}

export function getActivityTypeConfig(nameOrIcon?: string | null, id?: number): ActivityTypeConfig {
  const key = (nameOrIcon || "").toLowerCase();

  if (key.includes("whatsapp") || id === 2) {
    return {
      icon: <FaWhatsapp className="w-4 h-4" />,
      selectedCard:
        "bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/25 shadow-xs",
      selectedIcon: "bg-emerald-600 text-white shadow-xs shadow-emerald-500/30",
      unselectedCard:
        "bg-white dark:bg-[#0c1527] border-slate-200/90 dark:border-gray-800 text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-800/60 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20",
      unselectedIcon:
        "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40",
    };
  }

  if (
    key.includes("phone") ||
    key.includes("appel") ||
    key.includes("call") ||
    key.includes("téléphone") ||
    key.includes("telephone") ||
    id === 1
  ) {
    return {
      icon: <PhoneCall className="w-4 h-4" />,
      selectedCard:
        "bg-blue-500/10 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/25 shadow-xs",
      selectedIcon: "bg-blue-600 text-white shadow-xs shadow-blue-500/30",
      unselectedCard:
        "bg-white dark:bg-[#0c1527] border-slate-200/90 dark:border-gray-800 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-800/60 hover:bg-blue-50/20 dark:hover:bg-blue-950/20",
      unselectedIcon:
        "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40",
    };
  }

  if (key.includes("mail") || key.includes("email") || key.includes("courrier") || id === 3) {
    return {
      icon: <Mail className="w-4 h-4" />,
      selectedCard:
        "bg-purple-500/10 dark:bg-purple-950/40 border-purple-500 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/25 shadow-xs",
      selectedIcon: "bg-purple-600 text-white shadow-xs shadow-purple-500/30",
      unselectedCard:
        "bg-white dark:bg-[#0c1527] border-slate-200/90 dark:border-gray-800 text-slate-700 dark:text-slate-300 hover:border-purple-300 dark:hover:border-purple-800/60 hover:bg-purple-50/20 dark:hover:bg-purple-950/20",
      unselectedIcon:
        "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40",
    };
  }

  if (
    key.includes("demo") ||
    key.includes("démo") ||
    key.includes("presentation") ||
    key.includes("présentation") ||
    key.includes("monitor") ||
    id === 4
  ) {
    return {
      icon: <MonitorPlay className="w-4 h-4" />,
      selectedCard:
        "bg-amber-500/10 dark:bg-amber-950/40 border-amber-500 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/25 shadow-xs",
      selectedIcon: "bg-amber-600 text-white shadow-xs shadow-amber-500/30",
      unselectedCard:
        "bg-white dark:bg-[#0c1527] border-slate-200/90 dark:border-gray-800 text-slate-700 dark:text-slate-300 hover:border-amber-300 dark:hover:border-amber-800/60 hover:bg-amber-50/20 dark:hover:bg-amber-950/20",
      unselectedIcon:
        "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40",
    };
  }

  if (
    key.includes("rdv") ||
    key.includes("visio") ||
    key.includes("video") ||
    key.includes("meeting") ||
    key.includes("reunion") ||
    key.includes("réunion") ||
    id === 5
  ) {
    return {
      icon: <Video className="w-4 h-4" />,
      selectedCard:
        "bg-cyan-500/10 dark:bg-cyan-950/40 border-cyan-500 text-cyan-700 dark:text-cyan-300 ring-2 ring-cyan-500/25 shadow-xs",
      selectedIcon: "bg-cyan-600 text-white shadow-xs shadow-cyan-500/30",
      unselectedCard:
        "bg-white dark:bg-[#0c1527] border-slate-200/90 dark:border-gray-800 text-slate-700 dark:text-slate-300 hover:border-cyan-300 dark:hover:border-cyan-800/60 hover:bg-cyan-50/20 dark:hover:bg-cyan-950/20",
      unselectedIcon:
        "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900/40",
    };
  }

  if (
    key.includes("relance") ||
    key.includes("rappel") ||
    key.includes("bell") ||
    id === 6
  ) {
    return {
      icon: <BellRing className="w-4 h-4" />,
      selectedCard:
        "bg-rose-500/10 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/25 shadow-xs",
      selectedIcon: "bg-rose-600 text-white shadow-xs shadow-rose-500/30",
      unselectedCard:
        "bg-white dark:bg-[#0c1527] border-slate-200/90 dark:border-gray-800 text-slate-700 dark:text-slate-300 hover:border-rose-300 dark:hover:border-rose-800/60 hover:bg-rose-50/20 dark:hover:bg-rose-950/20",
      unselectedIcon:
        "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40",
    };
  }

  return {
    icon: <Calendar className="w-4 h-4" />,
    selectedCard:
      "bg-indigo-500/10 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/25 shadow-xs",
    selectedIcon: "bg-indigo-600 text-white shadow-xs shadow-indigo-500/30",
    unselectedCard:
      "bg-white dark:bg-[#0c1527] border-slate-200/90 dark:border-gray-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-800/60 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20",
    unselectedIcon:
      "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40",
  };
}

const DEFAULT_TYPES: ActivityType[] = [
  { id: 1, name: "Appel", icone: null },
  { id: 2, name: "WhatsApp", icone: null },
  { id: 3, name: "Email", icone: null },
  { id: 4, name: "Démo / Présentation", icone: null },
  { id: 5, name: "RDV / Visio", icone: null },
  { id: 6, name: "Relance", icone: null },
];

const ALL_DAY_HOURS = [
  "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00",
  "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00",
  "22:30", "23:00", "23:30"
];

function formatDateYMD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDaysToYMD(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  dateObj.setDate(dateObj.getDate() + days);
  return formatDateYMD(dateObj);
}

function formatShortLabelFromYMD(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  const days = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];
  const months = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  return `${days[dateObj.getDay()]} ${dateObj.getDate()} ${months[dateObj.getMonth()]}`;
}

export default function PlanifierProchaineActivite({
  cardId,
  activityTypes,
  isLoading = false,
  initialServerHour,
  initialServerDate,
  onSubmit,
  onCancel,
}: PlanifierProchaineActiviteProps) {
  const parseServerHour = (hourStr?: string) => {
    if (hourStr && hourStr.includes(":")) {
      const parts = hourStr.split(":");
      return {
        h: Number(parts[0]),
        m: Number(parts[1]),
      };
    }
    const d = new Date();
    return { h: d.getHours(), m: d.getMinutes() };
  };

  const initialTime = useMemo(() => parseServerHour(initialServerHour), [initialServerHour]);

  const [currentHour, setCurrentHour] = useState<number>(initialTime.h);
  const [currentMin, setCurrentMin] = useState<number>(initialTime.m);

  const todayStr = useMemo(() => {
    return initialServerDate || formatDateYMD(new Date());
  }, [initialServerDate]);

  const tomorrowStr = useMemo(() => addDaysToYMD(todayStr, 1), [todayStr]);
  const in2DaysStr = useMemo(() => addDaysToYMD(todayStr, 2), [todayStr]);

  const [selectedType, setSelectedType] = useState<number>(1);
  const [dateMode, setDateMode] = useState<"today" | "tomorrow" | "in2days" | "custom">("today");
  const [date, setDate] = useState<string>(todayStr);

  const isToday = date === todayStr;
  const minTimeStr = `${String(currentHour).padStart(2, "0")}:${String(currentMin).padStart(2, "0")}`;

  const [heureMode, setHeureMode] = useState<"preset" | "custom">("preset");
  const [showCustomPicker, setShowCustomPicker] = useState<boolean>(false);

  const [customHour, setCustomHour] = useState<string>(() => String(initialTime.h).padStart(2, "0"));
  const [customMinute, setCustomMinute] = useState<string>(() => {
    return initialTime.m < 15 ? "15" : initialTime.m < 30 ? "30" : initialTime.m < 45 ? "45" : "00";
  });

  const [heure, setHeure] = useState<string>(() => {
    const nextM = initialTime.m < 30 ? "30" : "45";
    return `${String(initialTime.h).padStart(2, "0")}:${nextM}`;
  });

  const [note] = useState<string>("");

  useEffect(() => {
    if (!initialServerHour) return;
    const parsed = parseServerHour(initialServerHour);
    setCurrentHour(parsed.h);
    setCurrentMin(parsed.m);

    const formattedH = String(parsed.h).padStart(2, "0");
    const nextM = parsed.m < 30 ? "30" : "45";
    const newM = parsed.m < 15 ? "15" : parsed.m < 30 ? "30" : parsed.m < 45 ? "45" : "00";

    setCustomHour(formattedH);
    setCustomMinute(newM);
    setHeure(`${formattedH}:${nextM}`);

    if (initialServerDate) {
      setDate(initialServerDate);
    }
  }, [initialServerHour, initialServerDate]);

  const typesToRender = useMemo(() => {
    const rawList: ActivityType[] =
      activityTypes && activityTypes.length > 0
        ? activityTypes
        : DEFAULT_TYPES;

    return rawList.map((t) => {
      const config = getActivityTypeConfig(t.icone || t.name, t.id);
      return {
        id: t.id,
        name: t.name,
        icon: config.icon,
        styles: config,
      };
    });
  }, [activityTypes]);

  // Même règle de reconnaissance que `getActivityTypeConfig` : on se fie au
  // libellé autant qu'à l'id, la table des types pouvant être réordonnée.
  const estWhatsapp = useMemo(() => {
    const type = typesToRender.find((t) => t.id === selectedType);
    return selectedType === 2 || (type?.name ?? "").toLowerCase().includes("whatsapp");
  }, [typesToRender, selectedType]);

  useEffect(() => {
    if (activityTypes && activityTypes.length > 0) {
      if (!activityTypes.some((t) => t.id === selectedType)) {
        setSelectedType(activityTypes[0].id);
      }
    }
  }, [activityTypes, selectedType]);

  const availableHours = useMemo(() => {
    if (!isToday) {
      return ["10:00", "14:30", "16:30"];
    }

    let filtered = ALL_DAY_HOURS.filter((h) => {
      const [hh, mm] = h.split(":").map(Number);
      return hh > currentHour || (hh === currentHour && mm >= currentMin);
    });

    if (filtered.length < 3) {
      const nextSlots: string[] = [];
      let nextH = currentHour;
      let nextM = currentMin < 30 ? 30 : 0;
      if (currentMin >= 30) nextH += 1;

      for (let i = 0; i < 4; i++) {
        if (nextH >= 24) break;
        const hh = String(nextH).padStart(2, "0");
        const mm = String(nextM).padStart(2, "0");
        nextSlots.push(`${hh}:${mm}`);
        nextM += 30;
        if (nextM >= 60) {
          nextM = 0;
          nextH += 1;
        }
      }
      filtered = Array.from(new Set([...filtered, ...nextSlots]));
    }

    return filtered.slice(0, 3);
  }, [isToday, currentHour, currentMin]);

  const availableCustomHours = useMemo(() => {
    const allHours = Array.from({ length: 24 }, (_, i) => i);
    if (!isToday) {
      return allHours.map((h) => String(h).padStart(2, "0"));
    }
    return allHours
      .filter((h) => h >= currentHour)
      .map((h) => String(h).padStart(2, "0"));
  }, [isToday, currentHour]);

  const getValidMinutesForHour = (h: string) => {
    const allMinutes = [
      "00", "05", "10", "15", "20", "25",
      "30", "35", "40", "45", "50", "55"
    ];
    if (isToday && Number(h) === currentHour) {
      const filtered = allMinutes.filter((m) => Number(m) >= currentMin);
      return filtered.length > 0 ? filtered : ["59"];
    }
    return allMinutes;
  };

  const availableCustomMinutes = useMemo(() => {
    return getValidMinutesForHour(customHour);
  }, [isToday, customHour, currentHour, currentMin]);

  useEffect(() => {
    if (availableCustomHours.length > 0 && !availableCustomHours.includes(customHour)) {
      const newH = availableCustomHours[0];
      setCustomHour(newH);
      const validMins = getValidMinutesForHour(newH);
      const newM = validMins.includes(customMinute) ? customMinute : (validMins[0] || "00");
      setCustomMinute(newM);
      if (heureMode === "custom") {
        setHeure(`${newH}:${newM}`);
      }
    }
  }, [availableCustomHours, customHour, currentHour, currentMin, heureMode]);

  useEffect(() => {
    if (availableHours.length > 0 && !availableHours.includes(heure) && heureMode === "preset") {
      setHeure(availableHours[0]);
    }
  }, [availableHours, heure, heureMode]);

  useEffect(() => {
    if (isToday && heure < minTimeStr) {
      if (availableHours.length > 0) {
        setHeure(availableHours[0]);
      } else if (availableCustomHours.length > 0) {
        const firstH = availableCustomHours[0];
        const validMins = getValidMinutesForHour(firstH);
        const firstM = validMins[0] || "00";
        setCustomHour(firstH);
        setCustomMinute(firstM);
        setHeure(`${firstH}:${firstM}`);
      }
    }
  }, [isToday, heure, minTimeStr, availableHours, availableCustomHours]);

  const handleSelectDateMode = (mode: "today" | "tomorrow" | "in2days" | "custom") => {
    setDateMode(mode);
    let newDate = todayStr;
    if (mode === "today") newDate = todayStr;
    else if (mode === "tomorrow") newDate = tomorrowStr;
    else if (mode === "in2days") newDate = in2DaysStr;
    setDate(newDate);

    if (newDate === todayStr) {
      if (heure < minTimeStr) {
        const validH = String(currentHour).padStart(2, "0");
        const validM = getValidMinutesForHour(validH)[0] || "00";
        setCustomHour(validH);
        setCustomMinute(validM);
        setHeure(`${validH}:${validM}`);
      }
    }
  };

  const handleDirectTimeChange = (newVal: string) => {
    if (!newVal) return;
    let clampedVal = newVal;
    if (isToday && newVal < minTimeStr) {
      clampedVal = minTimeStr;
    }
    const [h, m] = clampedVal.split(":");
    setCustomHour(h);
    setCustomMinute(m);
    setHeure(clampedVal);
    setHeureMode("custom");
  };

  const selectedDateFullLabel = useMemo(() => {
    if (!date) return "";
    const [y, m, d] = date.split("-").map(Number);
    const parsed = new Date(y, m - 1, d);
    const fullDays = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const fullMonths = [
      "janvier", "février", "mars", "avril", "mai", "juin",
      "juillet", "août", "septembre", "octobre", "novembre", "décembre",
    ];

    let prefix = "";
    if (date === todayStr) prefix = "Aujourd'hui • ";
    else if (date === tomorrowStr) prefix = "Demain • ";
    else if (date === in2DaysStr) prefix = "Dans 2 jours • ";

    return `${prefix}${fullDays[parsed.getDay()]} ${parsed.getDate()} ${fullMonths[parsed.getMonth()]} ${parsed.getFullYear()}`;
  }, [date, todayStr, tomorrowStr, in2DaysStr]);

  const summaryText = useMemo(() => {
    let dayLabel = "le " + date;
    if (date === todayStr) dayLabel = "aujourd'hui";
    else if (date === tomorrowStr) dayLabel = "demain";
    else if (date === in2DaysStr) dayLabel = "dans 2 jours";

    return `L'activité sera planifiée pour ${dayLabel}${heure ? ` à ${heure}` : ""}.`;
  }, [date, heure, todayStr, tomorrowStr, in2DaysStr]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    onSubmit({
      typeId: selectedType,
      date,
      heure,
      note,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-slate-800 dark:text-slate-100 w-full">
      <div className="w-full">
        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">
          Type d'activité
        </p>
        <div className="grid grid-cols-2 gap-2.5 w-full">
          {typesToRender.map((type) => {
            const isSelected = selectedType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setSelectedType(type.id)}
                className={`group flex items-center gap-3 px-3.5 py-3 rounded-2xl border transition-all cursor-pointer w-full text-left ${
                  isSelected ? type.styles.selectedCard : type.styles.unselectedCard
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl shrink-0 transition-all ${
                    isSelected ? type.styles.selectedIcon : type.styles.unselectedIcon
                  }`}
                >
                  {type.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <span
                    className={`block text-xs truncate transition-colors ${
                      isSelected ? "font-bold" : "font-semibold"
                    }`}
                  >
                    {type.name}
                  </span>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-current opacity-80 mr-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/*
        Canal WhatsApp : on propose directement les templates actifs du CRM.
        L'audience (prospect / user / compte pro) est déduite de la carte côté
        backend, et les variables sont déjà remplacées.
      */}
      {estWhatsapp && cardId ? (
        <div className="w-full">
          <WhatsappTemplatePicker cardId={cardId} />
        </div>
      ) : null}

      <div className="w-full">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
          1. Sélectionnez la date
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
          <button
            type="button"
            onClick={() => handleSelectDateMode("today")}
            className={`relative flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all cursor-pointer w-full ${
              dateMode === "today"
                ? "bg-blue-600/10 dark:bg-blue-950/50 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20"
                : "bg-white dark:bg-[#0c1527] border-slate-200/90 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            {dateMode === "today" && (
              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute top-2 right-2" />
            )}
            <Sun className="w-5 h-5 mb-1 text-slate-500 dark:text-slate-400" />
            <span className="text-xs font-bold">Aujourd’hui</span>
            <span className="text-[10px] text-slate-400 mt-0.5">{formatShortLabelFromYMD(todayStr)}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectDateMode("tomorrow")}
            className={`relative flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all cursor-pointer w-full ${
              dateMode === "tomorrow"
                ? "bg-blue-600/10 dark:bg-blue-950/50 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20"
                : "bg-white dark:bg-[#0c1527] border-slate-200/90 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            {dateMode === "tomorrow" && (
              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute top-2 right-2" />
            )}
            <Calendar className="w-5 h-5 mb-1 text-slate-500 dark:text-slate-400" />
            <span className="text-xs font-bold">Demain</span>
            <span className="text-[10px] text-slate-400 mt-0.5">{formatShortLabelFromYMD(tomorrowStr)}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectDateMode("in2days")}
            className={`relative flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all cursor-pointer w-full ${
              dateMode === "in2days"
                ? "bg-blue-600/10 dark:bg-blue-950/50 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20"
                : "bg-white dark:bg-[#0c1527] border-slate-200/90 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            {dateMode === "in2days" && (
              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute top-2 right-2" />
            )}
            <Calendar className="w-5 h-5 mb-1 text-slate-500 dark:text-slate-400" />
            <span className="text-xs font-bold">2 jours</span>
            <span className="text-[10px] text-slate-400 mt-0.5">{formatShortLabelFromYMD(in2DaysStr)}</span>
          </button>

          <div
            onClick={(e) => {
              handleSelectDateMode("custom");
              const input = e.currentTarget.querySelector('input[type="date"]') as HTMLInputElement | null;
              input?.showPicker?.();
            }}
            className={`relative flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all cursor-pointer w-full ${
              dateMode === "custom"
                ? "bg-blue-600/10 dark:bg-blue-950/50 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20"
                : "bg-white dark:bg-[#0c1527] border-slate-200/90 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            {dateMode === "custom" && (
              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute top-2 right-2" />
            )}
            <Calendar className="w-5 h-5 mb-1 text-slate-500 dark:text-slate-400" />
            <span className="text-xs font-bold">Autre</span>
            <span className="text-[10px] text-slate-400 mt-0.5 truncate max-w-full px-1">
              {dateMode === "custom" && date ? date : "Choisir date"}
            </span>

            <input
              type="date"
              value={date}
              min={todayStr}
              onChange={(e) => {
                const val = e.target.value;
                setDate(val);
                setDateMode("custom");
                if (val === todayStr && heure < minTimeStr) {
                  const validH = String(currentHour).padStart(2, "0");
                  const validM = getValidMinutesForHour(validH)[0] || "00";
                  setCustomHour(validH);
                  setCustomMinute(validM);
                  setHeure(`${validH}:${validM}`);
                }
              }}
              className="sr-only"
            />
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            2. Sélectionnez l'heure
          </label>
          {selectedDateFullLabel && (
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{selectedDateFullLabel}</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-[repeat(3,1fr)_1.35fr] gap-2 w-full">
          {availableHours.map((h) => {
            const isSelected = heureMode === "preset" && heure === h && !showCustomPicker;
            return (
              <button
                key={h}
                type="button"
                onClick={() => {
                  setHeure(h);
                  setHeureMode("preset");
                  setShowCustomPicker(false);
                }}
                className={`py-2.5 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center whitespace-nowrap ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white dark:bg-[#0c1527] border-slate-200/90 dark:border-gray-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-gray-700"
                }`}
              >
                {h}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => {
              setHeureMode("custom");
              setShowCustomPicker((prev) => !prev);
            }}
            className={`py-2.5 px-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              heureMode === "custom" || showCustomPicker
                ? "bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-500/20"
                : "bg-white dark:bg-[#0c1527] border-slate-200/90 dark:border-gray-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-gray-700"
            }`}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span className="shrink-0 text-xs">
              {heureMode === "custom" && heure ? heure : "Autre"}
            </span>
            <ChevronDown
              className={`w-3 h-3 shrink-0 transition-transform ${
                showCustomPicker ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {showCustomPicker && (
          <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c1527] border border-slate-200/90 dark:border-gray-800 space-y-3 w-full animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Choisir une heure précise</span>
              </div>
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-800/40">
                Toutes les heures
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  Heure
                </label>
                <select
                  value={customHour}
                  onChange={(e) => {
                    const h = e.target.value;
                    setCustomHour(h);
                    const validMins = getValidMinutesForHour(h);
                    const m = validMins.includes(customMinute) ? customMinute : (validMins[0] || "00");
                    setCustomMinute(m);
                    setHeure(`${h}:${m}`);
                    setHeureMode("custom");
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-[#070e1b] text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                >
                  {availableCustomHours.map((h) => (
                    <option key={h} value={h} className="dark:bg-gray-900 font-medium">
                      {h} h
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  Minute
                </label>
                <select
                  value={customMinute}
                  onChange={(e) => {
                    const m = e.target.value;
                    setCustomMinute(m);
                    setHeure(`${customHour}:${m}`);
                    setHeureMode("custom");
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-[#070e1b] text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                >
                  {availableCustomMinutes.map((m) => (
                    <option key={m} value={m} className="dark:bg-gray-900 font-medium">
                      {m} min
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[10.5px] font-bold text-slate-400 mr-1">Raccourcis :</span>
              {["00", "15", "30", "45"].map((m) => {
                const isValid = !isToday || Number(customHour) > currentHour || Number(m) >= currentMin;
                if (!isValid) return null;
                const isCurrentMinSelected = customMinute === m && heureMode === "custom";
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setCustomMinute(m);
                      setHeure(`${customHour}:${m}`);
                      setHeureMode("custom");
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      isCurrentMinSelected
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white dark:bg-[#070e1b] border-slate-200 dark:border-gray-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {customHour}:{m}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-gray-800/80 text-[11px] text-slate-500 dark:text-slate-400">
              <span>Saisie libre :</span>
              <input
                type="time"
                value={heure}
                min={isToday ? minTimeStr : undefined}
                onChange={(e) => handleDirectTimeChange(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-[#070e1b] text-slate-800 dark:text-white font-bold text-xs outline-none focus:border-blue-500 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50 w-full">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
        <p className="text-[11.5px] text-blue-700 dark:text-blue-300 font-medium">
          {summaryText}
        </p>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 w-full">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || !date}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>Planifier l'activité</span>
        </button>
      </div>
    </form>
  );
}