import { useState, useEffect, useRef } from "react";
import { X, ChevronDown, Plus, Info, Check, Loader2 } from "lucide-react";
import {
  useGetEquipeCreateDataQuery,
  useCreateEquipeMutation,
  EquipeUserDataItem,
} from "../../../services/equipeApi";

interface EquipeInsertDataProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: (newEquipe: any) => void;
}

export default function EquipeInsertData({
  isOpen,
  onClose,
  onSubmitSuccess,
}: EquipeInsertDataProps) {
  const { data: createDataResponse, isLoading: isLoadingData } = useGetEquipeCreateDataQuery(
    undefined,
    { skip: !isOpen }
  );
  const [createEquipe, { isLoading: isSubmitting }] = useCreateEquipeMutation();

  const activitesList = createDataResponse?.data?.activites || [];
  const usersList = createDataResponse?.data?.users || [];

  const [nom, setNom] = useState("");
  const [responsableId, setResponsableId] = useState<number | null>(null);
  const [selectedSecteurs, setSelectedSecteurs] = useState<number[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<EquipeUserDataItem[]>([]);
  const [capaciteLeads, setCapaciteLeads] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isSecteursDropdownOpen, setIsSecteursDropdownOpen] = useState(false);
  const [isMembersDropdownOpen, setIsMembersDropdownOpen] = useState(false);

  const secteursRef = useRef<HTMLDivElement>(null);
  const membersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (secteursRef.current && !secteursRef.current.contains(e.target as Node)) {
        setIsSecteursDropdownOpen(false);
      }
      if (membersRef.current && !membersRef.current.contains(e.target as Node)) {
        setIsMembersDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const toggleSecteur = (id: number) => {
    setSelectedSecteurs((prev) =>
      prev.includes(id) ? prev.filter((secId) => secId !== id) : [...prev, id]
    );
  };

  const toggleMember = (user: EquipeUserDataItem) => {
    setSelectedMembers((prev) =>
      prev.some((m) => m.id === user.id)
        ? prev.filter((m) => m.id !== user.id)
        : [...prev, user]
    );
  };

  const removeMember = (id: number) => {
    setSelectedMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const payload = {
      nom: nom.trim(),
      responsable_id: responsableId || null,
      secteurs: selectedSecteurs,
      membres: selectedMembers.map((m) => m.id),
      capacite_leads: capaciteLeads ? Number(capaciteLeads) : null,
      color: "#2563eb",
    };

    try {
      const res = await createEquipe(payload).unwrap();
      onSubmitSuccess?.(res);
      onClose();
      setNom("");
      setResponsableId(null);
      setSelectedSecteurs([]);
      setSelectedMembers([]);
      setCapaciteLeads("");
    } catch (err: any) {
      setErrorMessage(
        err?.data?.message || "Une erreur est survenue lors de la création de l'équipe."
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white dark:bg-[#070e1b] border-l border-slate-200 dark:border-slate-800/80 shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300 h-full">
        <div className="flex items-center justify-between px-7 py-6 border-b border-slate-100 dark:border-slate-800/60">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Ajouter une équipe
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoadingData ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
            <span className="text-xs">Chargement des données...</span>
          </div>
        ) : (
          <form
            id="equipe-insert-form"
            onSubmit={handleSubmit}
            className="px-7 py-6 space-y-6 overflow-y-auto flex-1 text-xs"
          >
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Nom de l'équipe <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex : Équipe Automobile"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#091322] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Responsable de l'équipe
                </label>
                <div className="relative">
                  <select
                    value={responsableId ?? ""}
                    onChange={(e) =>
                      setResponsableId(e.target.value ? Number(e.target.value) : null)
                    }
                    className="w-full appearance-none px-4 py-3 pr-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#091322] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium cursor-pointer"
                  >
                    <option value="">Sélectionner un responsable</option>
                    {usersList.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2" ref={secteursRef}>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Secteur(s) d'activité
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsSecteursDropdownOpen((prev) => !prev)}
                    className="w-full text-left px-4 py-3 pr-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#091322] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium truncate cursor-pointer"
                  >
                    {selectedSecteurs.length === 0 ? (
                      <span className="text-slate-400 dark:text-slate-500">
                        Sélectionner un ou plusieurs secteurs
                      </span>
                    ) : (
                      <span>
                        {activitesList
                          .filter((a) => selectedSecteurs.includes(a.id))
                          .map((a) => a.name)
                          .join(", ")}
                      </span>
                    )}
                  </button>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

                  {isSecteursDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 p-2 rounded-xl bg-white dark:bg-[#091322] border border-slate-200 dark:border-slate-800 shadow-xl z-20 max-h-48 overflow-y-auto space-y-1">
                      {activitesList.map((sec) => {
                        const isSelected = selectedSecteurs.includes(sec.id);
                        return (
                          <div
                            key={sec.id}
                            onClick={() => toggleSecteur(sec.id)}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 font-semibold"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium"
                            }`}
                          >
                            <span className="capitalize">{sec.name}</span>
                            {isSelected && <Check className="w-4 h-4 text-blue-500" />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3" ref={membersRef}>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Membres de l'équipe
              </label>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMembersDropdownOpen((prev) => !prev)}
                  className="w-full text-left px-4 py-3 pr-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#091322] text-slate-400 dark:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium cursor-pointer"
                >
                  Rechercher et ajouter des membres
                </button>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

                {isMembersDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 p-2 rounded-xl bg-white dark:bg-[#091322] border border-slate-200 dark:border-slate-800 shadow-xl z-20 max-h-48 overflow-y-auto space-y-1">
                    {usersList
                      .filter((u) => u.id !== responsableId)
                      .map((u) => {
                        const isSelected = selectedMembers.some((item) => item.id === u.id);
                        return (
                          <div
                            key={u.id}
                            onClick={() => toggleMember(u)}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px] text-slate-700 dark:text-slate-300">
                                {u.name.slice(0, 2).toUpperCase()}
                              </div>
                              <span className="font-medium">{u.name}</span>
                              <span className="text-[10px] text-slate-400">({u.role})</span>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-blue-500" />}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2.5 flex-wrap pt-1">
                {selectedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="relative group w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300"
                    title={`${member.name} (${member.role})`}
                  >
                    <span>{member.name.slice(0, 2).toUpperCase()}</span>
                    <button
                      type="button"
                      onClick={() => removeMember(member.id)}
                      className="absolute top-1 right-1 w-4 h-4 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-rose-600 transition-colors cursor-pointer"
                      title={`Retirer ${member.name}`}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setIsMembersDropdownOpen((prev) => !prev)}
                  className="w-12 h-12 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 text-slate-400 hover:text-blue-500 flex items-center justify-center transition-colors cursor-pointer"
                  title="Ajouter un membre"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Capacité max de leads (optionnel)
                </label>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <input
                type="number"
                placeholder="Ex : 120"
                value={capaciteLeads}
                onChange={(e) => setCapaciteLeads(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#091322] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              />
            </div>
          </form>
        )}

        <div className="px-7 py-5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            form="equipe-insert-form"
            type="submit"
            disabled={isSubmitting || isLoadingData}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isSubmitting ? "Création..." : "Créer l'équipe"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}