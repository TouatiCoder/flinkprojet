import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Building2,
  Briefcase,
  Globe,
  UserCheck,
  ChevronDown,
  AlertCircle,
  Save,
} from "lucide-react";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";
import PhoneCountryInput from "../../../common/PhoneCountryInput";

import {
  useGetProspectCreateDataQuery,
  useUpdateProspectMutation,
} from "../../../../services/ProspectApi";

interface ProspectEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  prospect: any;
  onSuccess?: () => void;
}

export default function ProspectEditModal({
  isOpen,
  onClose,
  prospect,
  onSuccess,
}: ProspectEditModalProps) {
  const [searchVille, setSearchVille] = useState("");
  const [selectedVilleLabel, setSelectedVilleLabel] = useState("");
  const [isVilleDropdownOpen, setIsVilleDropdownOpen] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState<CountryCode>("MA");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const { data: createData, isLoading: isDataLoading } = useGetProspectCreateDataQuery(
    { search_ville: searchVille || undefined },
    { skip: !isOpen }
  );

  const [updateProspect, { isLoading: isSubmitting }] = useUpdateProspectMutation();
  const apiData = createData?.data;

  const [formData, setFormData] = useState({
    name: "",
    telephone: "",
    email: "",
    ville_id: "",
    name_entreprise: "",
    activite_id: "",
    prospect_source_id: "",
    manager_users_id: "",
  });

  useEffect(() => {
    if (isOpen && prospect) {
      const fullName = `${prospect.prenom || ""} ${prospect.nom || ""}`.trim();

      setFormData({
        name: fullName,
        telephone: prospect.telephone || "",
        email: prospect.email || "",
        ville_id: prospect.ville_id ? String(prospect.ville_id) : "",
        name_entreprise: prospect.name_entreprise || "",
        activite_id: prospect.activite_id ? String(prospect.activite_id) : "",
        prospect_source_id: prospect.prospect_source_id ? String(prospect.prospect_source_id) : "",
        manager_users_id: prospect.manager_users_id ? String(prospect.manager_users_id) : "",
      });

      setSelectedVilleLabel(prospect.ville_name || prospect.ville?.name || "");
      setPhoneError(null);
      setEmailError(null);
      setGlobalError(null);
    }
  }, [isOpen, prospect]);

  if (!isOpen || !prospect) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "email") setEmailError(null);
    setGlobalError(null);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);
    setEmailError(null);
    setGlobalError(null);

    if (!formData.telephone.trim()) {
      setPhoneError("Le numéro de téléphone est obligatoire.");
      return;
    }

    const parsedPhone = parsePhoneNumberFromString(formData.telephone, selectedCountry);
    if (!parsedPhone || !parsedPhone.isValid()) {
      setPhoneError("Veuillez saisir un numéro de téléphone valide.");
      return;
    }

    const formattedTelephone = parsedPhone.formatNational();

    try {
      const payload: any = {
        id: prospect.id,
        name: formData.name.trim(),
        telephone: formattedTelephone,
        email: formData.email.trim() || null,
        ville_id: formData.ville_id ? Number(formData.ville_id) : null,
        name_entreprise: formData.name_entreprise.trim() || null,
        activite_id: formData.activite_id ? Number(formData.activite_id) : null,
        prospect_source_id: formData.prospect_source_id ? Number(formData.prospect_source_id) : null,
        manager_users_id: formData.manager_users_id ? Number(formData.manager_users_id) : null,
      };

      await updateProspect(payload).unwrap();
      onSuccess?.();
      onClose();
    } catch (error: any) {
      if (error?.data?.field === "telephone") {
        setPhoneError(error.data.message);
      } else if (error?.data?.field === "email") {
        setEmailError(error.data.message);
      } else if (error?.data?.message) {
        setGlobalError(error.data.message);
      } else {
        setGlobalError("Une erreur est survenue lors de la mise à jour.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-800 flex flex-col max-h-[90vh] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-[#5C24E8] dark:text-purple-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Modifier le prospect
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                ID #{prospect.id} • {prospect.nom} {prospect.prenom}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {globalError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center gap-2.5 text-red-600 dark:text-red-400 text-xs shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{globalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Nom complet */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Nom complet <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Prénom et Nom"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50 text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-gray-800 focus:border-[#5C24E8] outline-none transition-all"
              />
            </div>
          </div>

          {/* Téléphone réutilisable + validation par pays */}
          <PhoneCountryInput
            value={formData.telephone}
            selectedCountry={selectedCountry}
            error={phoneError}
            onChange={(val) => {
              setFormData((prev) => ({ ...prev, telephone: val }));
              if (phoneError) setPhoneError(null);
            }}
            onCountryChange={setSelectedCountry}
            onErrorChange={setPhoneError}
          />

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              E-mail <span className="text-[10px] text-slate-400 font-normal">(optionnel)</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="exemple@email.com"
                className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border ${
                  emailError
                    ? "border-red-500 bg-red-50/20"
                    : "border-slate-200 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50 focus:border-[#5C24E8]"
                } text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all`}
              />
            </div>
            {emailError && (
              <span className="inline-flex items-center gap-1 text-[11px] text-red-500 font-medium mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {emailError}
              </span>
            )}
          </div>

          {/* Informations professionnelles (Chaque champ sur une ligne) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Nom de l'entreprise
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="name_entreprise"
                value={formData.name_entreprise}
                onChange={handleChange}
                placeholder="Entreprise"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50 text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-gray-800 focus:border-[#5C24E8] outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Activité
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                name="activite_id"
                value={formData.activite_id}
                onChange={handleChange}
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50 text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-gray-800 focus:border-[#5C24E8] outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">Sélectionner une activité</option>
                {apiData?.activites?.map((act: any) => (
                  <option key={act.id} value={act.id}>
                    {act.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Ville
            </label>
            <div
              tabIndex={0}
              onClick={() => setIsVilleDropdownOpen((prev) => !prev)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50 cursor-pointer flex items-center justify-between"
            >
              <span className={formData.ville_id ? "text-slate-800 dark:text-slate-200 font-medium" : "text-slate-400"}>
                {selectedVilleLabel || "Sélectionner la ville"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {isVilleDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsVilleDropdownOpen(false)}
                />
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl shadow-lg z-30 p-2 space-y-1.5">
                  <input
                    type="text"
                    placeholder="Rechercher une ville..."
                    value={searchVille}
                    onChange={(e) => setSearchVille(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full text-xs p-2 border border-slate-200 dark:border-gray-700 rounded-lg outline-none focus:border-[#5C24E8] bg-slate-50 dark:bg-gray-900 text-slate-800 dark:text-slate-200"
                    autoFocus
                  />
                  <div className="max-h-36 overflow-y-auto space-y-1">
                    {apiData?.villes?.map((ville: any) => (
                      <div
                        key={ville.id}
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, ville_id: String(ville.id) }));
                          setSelectedVilleLabel(ville.name);
                          setIsVilleDropdownOpen(false);
                          setSearchVille("");
                        }}
                        className={`px-3 py-1.5 text-xs rounded-lg cursor-pointer transition-colors ${
                          String(formData.ville_id) === String(ville.id)
                            ? "bg-purple-50 dark:bg-purple-900/40 text-[#5C24E8] dark:text-purple-300 font-semibold"
                            : "hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {ville.name}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Source
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  name="prospect_source_id"
                  value={formData.prospect_source_id}
                  onChange={handleChange}
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50 text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-gray-800 focus:border-[#5C24E8] outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Sélectionner une source</option>
                  {apiData?.prospect_sources?.map((src: any) => (
                    <option key={src.id} value={src.id}>
                      {src.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Commercial assigné
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  name="manager_users_id"
                  value={formData.manager_users_id}
                  onChange={handleChange}
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50 text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-gray-800 focus:border-[#5C24E8] outline-none transition-all appearance-none cursor-pointer"
                >
                  {/* <option value="">Sélectionner un commercial</option> */}
                  {apiData?.managers?.map((mgr: any) => (
                    <option key={mgr.id} value={mgr.id}>
                      {mgr.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isDataLoading}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#5C24E8] hover:bg-[#4a1dc2] rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Enregistrement..." : "Enregistrer"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}