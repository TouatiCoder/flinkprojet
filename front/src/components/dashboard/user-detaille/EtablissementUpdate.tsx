import React, { useState, useEffect } from "react";
import {
  Etablissement,
  useGetEtablissementEditQuery,
  useUpdateEtablissementMutation,
} from "../../../services/etablissementsApi";
import { X, Loader2 } from "lucide-react";

interface EtablissementUpdateProps {
  etablissement: Etablissement | null;
  isOpen: boolean;
  onClose: () => void;
  villes?: { id: number; name: string }[];
}

export default function EtablissementUpdate({
  etablissement,
  isOpen,
  onClose,
}: EtablissementUpdateProps) {
  const etabId = etablissement?.id;

  const [searchVille, setSearchVille] = useState("");
  const [selectedVilleLabel, setSelectedVilleLabel] = useState("");
  const [isVilleDropdownOpen, setIsVilleDropdownOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [updateEtablissement, { isLoading: isUpdating }] = useUpdateEtablissementMutation();

  const { data, isLoading } = useGetEtablissementEditQuery(
    { id: etabId!, search: searchVille },
    { skip: !isOpen || !etabId }
  );

  const editData = data?.data;

  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    selectedPhone: "",
    default_phone_number: "",
    ville_id: "",
    status: true,
    is_verified: false,
  });

  useEffect(() => {
    if (isOpen && etablissement) {
      setSearchVille("");
      setErrorMessage(null);
      setSelectedVilleLabel(etablissement.ville || "");

      const initialPhone = (etablissement as any).default_phone_number || "";

      setFormData({
        nom: etablissement.nom || "",
        email: etablissement.email || "",
        selectedPhone: initialPhone,
        default_phone_number: initialPhone,
        ville_id: (etablissement as any).ville_id ? String((etablissement as any).ville_id) : "",
        status: Number(etablissement.status) === 1,
        is_verified: Boolean(etablissement.is_verified),
      });
    }
  }, [isOpen, etablissement?.id]);

  useEffect(() => {
    if (editData && String(editData.etablissement?.id) === String(etablissement?.id)) {
      const defaultPhone = editData.etablissement?.default_phone_number || "";

      const currentVilleId = editData.etablissement?.ville_id;
      const foundVille = editData.villes?.find(
        (v) => String(v.id) === String(currentVilleId)
      );

      if (foundVille) {
        setSelectedVilleLabel(foundVille.name);
      }

      setFormData((prev) => ({
        ...prev,
        nom: editData.etablissement?.nom ?? prev.nom,
        email: editData.etablissement?.email ?? prev.email,
        default_phone_number: defaultPhone || prev.default_phone_number,
        selectedPhone: defaultPhone || prev.selectedPhone,
        ville_id: prev.ville_id || (currentVilleId ? String(currentVilleId) : ""),
        status: editData.etablissement?.status ?? prev.status,
        is_verified: editData.etablissement?.is_verified ?? prev.is_verified,
      }));
    }
  }, [editData, etablissement?.id]);

  if (!isOpen || !etablissement) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!etabId) return;

    setErrorMessage(null);

    try {
      await updateEtablissement({
        id: etabId,
        data: {
          nom: formData.nom,
          email: formData.email,
          default_phone_number: formData.default_phone_number,
          ville_id: formData.ville_id ? Number(formData.ville_id) : (null as any),
          status: formData.status,
          is_verified: formData.is_verified,
        },
      }).unwrap();

      onClose();
    } catch (error: any) {
      console.error("Erreur de mise à jour:", error);
      setErrorMessage(error?.data?.message || "Une erreur est survenue lors de la mise à jour");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedNum = e.target.value;
    setFormData((prev) => ({
      ...prev,
      selectedPhone: selectedNum,
      default_phone_number: selectedNum,
    }));
  };

  const handleToggle = (name: "status" | "is_verified") => {
    setFormData((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const inputClass =
    "w-full text-xs font-medium border border-slate-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 bg-white dark:bg-gray-800/80 transition-all";
  const labelClass = "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-gray-800 overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-gray-800 shrink-0 bg-slate-50/50 dark:bg-gray-900/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Modifier l'établissement
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              #{etablissement.id} — {etablissement.nom}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isLoading && !formData.nom ? (
          <div className="flex items-center justify-center p-12 text-xs text-slate-400 gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Chargement des données...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 text-xs rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className={labelClass}>Nom de la Société</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Nom de l'établissement"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="contact@exemple.com"
                />
              </div>

              <div>
                <label className={labelClass}>Téléphone</label>
                <div className="flex gap-2">
                  <select
                    name="selectedPhone"
                    value={formData.selectedPhone}
                    onChange={handlePhoneSelect}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="">Sélectionner</option>
                    {editData?.telephones && editData.telephones.length > 0 ? (
                      editData.telephones.map((phone, idx) => (
                        <option key={idx} value={phone}>
                          {phone}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        Aucun numéro lié
                      </option>
                    )}
                  </select>

                  <input
                    type="text"
                    name="default_phone_number"
                    value={formData.default_phone_number}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Numéro par défaut"
                  />
                </div>
              </div>

              <div className="relative">
                <label className={labelClass}>Ville</label>
                <div
                  tabIndex={0}
                  onClick={() => setIsVilleDropdownOpen((prev) => !prev)}
                  className={`${inputClass} cursor-pointer flex items-center justify-between`}
                >
                  <span
                    className={
                      formData.ville_id
                        ? "text-slate-800 dark:text-slate-100"
                        : "text-slate-400"
                    }
                  >
                    {selectedVilleLabel || "Sélectionner une ville"}
                  </span>
                  <span className="text-[10px] text-slate-400">▼</span>
                </div>

                {isVilleDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsVilleDropdownOpen(false)}
                    />

                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl shadow-xl z-30 p-2 space-y-2">
                      <input
                        type="text"
                        placeholder="Rechercher une ville..."
                        value={searchVille}
                        onChange={(e) => setSearchVille(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full text-xs p-2 border border-slate-200 dark:border-gray-700 rounded-lg outline-none focus:border-blue-500 bg-slate-50 dark:bg-gray-900 text-slate-800 dark:text-slate-200"
                        autoFocus
                      />

                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {editData?.villes?.map((ville) => (
                          <div
                            key={ville.id}
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                ville_id: String(ville.id),
                              }));
                              setSelectedVilleLabel(ville.name);
                              setIsVilleDropdownOpen(false);
                              setSearchVille("");
                            }}
                            className={`px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors ${
                              String(formData.ville_id) === String(ville.id)
                                ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-semibold"
                                : "hover:bg-slate-100 dark:hover:bg-gray-700/60 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {ville.name}
                          </div>
                        ))}

                        {(!editData?.villes || editData.villes.length === 0) && (
                          <div className="p-2 text-center text-xs text-slate-400 italic">
                            Aucune ville trouvée
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-gray-800 space-y-3">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Statuts
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/40">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Actif
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggle("status")}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out ${
                        formData.status ? "bg-blue-600" : "bg-slate-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                          formData.status ? "translate-x-4.5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/40">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Vérifié
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggle("is_verified")}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out ${
                        formData.is_verified ? "bg-blue-600" : "bg-slate-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                          formData.is_verified ? "translate-x-4.5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isUpdating}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isUpdating ? "Enregistrement en cours..." : "Enregistrer les modifications"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}