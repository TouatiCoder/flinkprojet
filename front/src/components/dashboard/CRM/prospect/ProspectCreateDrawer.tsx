import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Briefcase,
  Target,
  Globe,
  UserCheck,
  UserPlus,
  Building2,
  Megaphone,
  Sparkles,
  ChevronDown,
  Info,
  ShieldCheck,
  Check,
  AlertCircle,
} from "lucide-react";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";
import PhoneCountryInput from "../../../common/PhoneCountryInput";

import {
  useGetProspectCreateDataQuery,
  useCreateProspectMutation,
} from "../../../../services/ProspectApi";

interface ProspectCreateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (createdProspect: any) => void;
}

export default function ProspectCreateDrawer({
  isOpen,
  onClose,
  onSuccess,
}: ProspectCreateDrawerProps) {
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

  const [createProspect, { isLoading: isSubmitting }] = useCreateProspectMutation();

  const apiData = createData?.data;
  const defaultCompteProPrice = apiData?.default_solde_compte_pro ?? 5000;

  const [formData, setFormData] = useState({
    name: "",
    telephone: "",
    email: "",
    name_entreprise: "",
    activite_id: "",
    ville_id: "",
    interets: [] as number[],
    solde_compte_pro: 1000,
    type_solde_compte_pro: "pro",
    solde_ads: 5000,
    type_solde_ads: "solde",
    prospect_source_id: "",
    manager_users_id: "",
    note: "",
  });

  useEffect(() => {
    if (isOpen && apiData) {
      const devenirUserId = apiData.prospect_interets?.[0]?.id;
      const proPrice = apiData.default_solde_compte_pro ?? 5000;

      setFormData((prev) => ({
        ...prev,
        solde_compte_pro: proPrice,
        interets:
          devenirUserId && !prev.interets.includes(devenirUserId)
            ? [devenirUserId, ...prev.interets]
            : prev.interets.length === 0 && devenirUserId
            ? [devenirUserId]
            : prev.interets,

        prospect_source_id:
          prev.prospect_source_id === "" && apiData.prospect_sources?.[0]?.id
            ? String(apiData.prospect_sources[0].id)
            : prev.prospect_source_id,

        manager_users_id:
          prev.manager_users_id === "" && apiData.managers?.[0]?.id
            ? String(apiData.managers[0].id)
            : prev.manager_users_id,
      }));
    }
  }, [isOpen, apiData]);

  useEffect(() => {
    if (!isOpen) {
      setSearchVille("");
      setSelectedVilleLabel("");
      setSelectedCountry("MA");
      setPhoneError(null);
      setEmailError(null);
      setGlobalError(null);
      setFormData({
        name: "",
        telephone: "",
        email: "",
        name_entreprise: "",
        activite_id: "",
        ville_id: "",
        interets: [],
        solde_compte_pro: defaultCompteProPrice,
        type_solde_compte_pro: "pro",
        solde_ads: 5000,
        type_solde_ads: "solde",
        prospect_source_id: "",
        manager_users_id: "",
        note: "",
      });
    }
  }, [isOpen, defaultCompteProPrice]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "email") setEmailError(null);
    setGlobalError(null);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleInteret = (id: number) => {
    const devenirUserId = apiData?.prospect_interets?.[0]?.id;
    if (id === devenirUserId) return;

    setFormData((prev) => {
      const exists = prev.interets.includes(id);
      return {
        ...prev,
        interets: exists
          ? prev.interets.filter((item) => item !== id)
          : [...prev.interets, id],
      };
    });
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

    const formattedTelephone = parsedPhone.format("E.164");

    const compteProId = apiData?.prospect_interets?.[1]?.id;
    const soldeAdsId = apiData?.prospect_interets?.[2]?.id;

    const isCompteProSelected = compteProId ? formData.interets.includes(compteProId) : false;
    const isSoldeAdsSelected = soldeAdsId ? formData.interets.includes(soldeAdsId) : false;

    try {
      const payload: any = {
        name: formData.name.trim(),
        telephone: formattedTelephone,
        email: formData.email.trim() || null,
        name_entreprise: formData.name_entreprise || undefined,
        activite_id: formData.activite_id ? Number(formData.activite_id) : null,
        ville_id: formData.ville_id ? Number(formData.ville_id) : null,
        prospect_source_id: formData.prospect_source_id ? Number(formData.prospect_source_id) : null,
        manager_users_id: formData.manager_users_id ? Number(formData.manager_users_id) : null,
        interets: formData.interets,
        note: formData.note || undefined,
      };

      if (isCompteProSelected) {
        payload.solde_compte_pro = Number(formData.solde_compte_pro);
        payload.type_solde_compte_pro = formData.type_solde_compte_pro;
      }

      if (isSoldeAdsSelected) {
        payload.solde_ads = formData.solde_ads ? Number(formData.solde_ads) : null;
        payload.type_solde_ads = formData.type_solde_ads;
      }

      if (isSoldeAdsSelected) {
        payload.solde = formData.solde_ads ? Number(formData.solde_ads) : null;
        payload.type_solde = formData.type_solde_ads;
      } else if (isCompteProSelected) {
        payload.solde = Number(formData.solde_compte_pro);
        payload.type_solde = formData.type_solde_compte_pro;
      }

      const res = await createProspect(payload).unwrap();

      const newId = res?.data?.prospect_id || res?.data?.id;

      const newProspectData = {
        id: Number(newId),
        nom: formData.name.trim(),
        prenom: "",
        name: formData.name.trim(),
        telephone: formattedTelephone,
        email: formData.email.trim() || null,
        name_entreprise: formData.name_entreprise || null,
        activite_id: formData.activite_id ? Number(formData.activite_id) : null,
        ville_id: formData.ville_id ? Number(formData.ville_id) : null,
        prospect_source_id: formData.prospect_source_id ? Number(formData.prospect_source_id) : null,
        manager_users_id: formData.manager_users_id ? Number(formData.manager_users_id) : null,
        solde: payload.solde || 0,
        type_solde: payload.type_solde || null,
        ...res?.data,
      };

      onSuccess?.(newProspectData);
      onClose();
    } catch (error: any) {
      console.error("Erreur d'ajout prospect:", error);

      if (error?.data?.field === "telephone") {
        setPhoneError(error.data.message);
      } else if (error?.data?.field === "email") {
        setEmailError(error.data.message);
      } else if (error?.data?.message) {
        setGlobalError(error.data.message);
      } else {
        setGlobalError("Une erreur est survenue lors de la création du prospect.");
      }
    }
  };

  const getInteretConfig = (interetId: number, name: string) => {
    const raw = (name || "").toLowerCase();

    if (interetId === 1 || raw.includes("user")) {
      return {
        icon: <UserPlus className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
        iconBg: "bg-purple-100/70 dark:bg-purple-900/40",
        cardBg: "bg-purple-50/40 dark:bg-purple-950/20 border-purple-200/80 dark:border-purple-900/50",
        activeBorder: "border-purple-600 bg-purple-600 text-white",
        desc: "Convertir le prospect en User Flink.",
      };
    }
    if (interetId === 2 || raw.includes("pro")) {
      return {
        icon: <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        iconBg: "bg-blue-100/70 dark:bg-blue-900/40",
        cardBg: "bg-blue-50/30 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/40",
        activeBorder: "border-blue-600 bg-blue-600 text-white",
        desc: "Activer ou vendre un Compte Pro.",
      };
    }
    if (interetId === 3 || raw.includes("ads") || raw.includes("solde")) {
      return {
        icon: <Megaphone className="w-4 h-4 text-red-500 dark:text-red-400" />,
        iconBg: "bg-red-100/70 dark:bg-red-900/40",
        cardBg: "bg-red-50/30 dark:bg-red-950/20 border-red-100 dark:border-red-900/40",
        activeBorder: "border-red-500 bg-red-500 text-white",
        desc: "Achat de Solde Ads pour Flink Ads.",
      };
    }
    return {
      icon: <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      iconBg: "bg-emerald-100/70 dark:bg-emerald-900/40",
      cardBg: "bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40",
      activeBorder: "border-emerald-600 bg-emerald-600 text-white",
      desc: "Opportunité ou service additionnel.",
    };
  };

  const visibleInterets = (apiData?.prospect_interets || []).filter(
    (interet: any) => interet.id !== 4 && !interet.name?.toLowerCase().includes("renouv")
  );

  return (
    <>
      <div
        className="fixed inset-0 bg-black/25 z-[90] transition-opacity duration-300 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <aside className="fixed inset-y-0 right-0 z-[100] w-full max-w-[880px] bg-white dark:bg-gray-900 shadow-[-10px_0_35px_rgba(0,0,0,0.1)] flex flex-col transform transition-transform duration-300 ease-in-out">
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-slate-900 dark:text-white leading-tight">
                Ajouter un prospect
              </h2>
              <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-0.5">
                Saisissez les informations du prospect pour le suivre et convertir en client.
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
          <div className="mx-7 mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center gap-2.5 text-red-600 dark:text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{globalError}</span>
          </div>
        )}

        {isDataLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-slate-500 dark:text-slate-400">Chargement des données...</p>
          </div>
        ) : (
          <form id="add-prospect-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-7 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl border border-slate-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3.5">
                <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 font-semibold text-[14px]">
                  <User className="w-4 h-4" />
                  <span>1. Informations du contact</span>
                </div>

                <div>
                  <label className="block text-[12.5px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
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
                      className="w-full pl-9 pr-3 py-2 text-[13px] rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50 text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-gray-800 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

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

                <div>
                  <label className="block text-[12.5px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="exemple@email.com"
                      className={`w-full pl-9 pr-3 py-2 text-[13px] rounded-xl border ${
                        emailError
                          ? "border-red-500 focus:border-red-500 bg-red-50/30 dark:bg-red-950/20"
                          : "border-slate-200 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50 focus:border-indigo-500"
                      } text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all`}
                    />
                  </div>
                  {emailError && (
                    <span className="inline-flex items-center gap-1 text-[11.5px] text-red-500 font-medium mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {emailError}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-slate-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3.5">
                <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 font-semibold text-[14px]">
                  <Briefcase className="w-4 h-4" />
                  <span>2. Informations professionnelles</span>
                </div>

                <div>
                  <label className="block text-[12.5px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Nom de l'entreprise
                  </label>
                  <input
                    type="text"
                    name="name_entreprise"
                    value={formData.name_entreprise}
                    onChange={handleChange}
                    placeholder="Nom de l'entreprise"
                    className="w-full px-3 py-2 text-[13px] rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50 text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-gray-800 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[12.5px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Activité <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="activite_id"
                      value={formData.activite_id}
                      onChange={handleChange}
                      className="w-full pl-3 pr-8 py-2 text-[13px] rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50 text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-gray-800 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Sélectionner une activité</option>
                      {apiData?.activites?.map((act: any) => (
                        <option key={act.id} value={act.id}>
                          {act.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-[12.5px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Ville <span className="text-red-500">*</span>
                  </label>
                  <div
                    tabIndex={0}
                    onClick={() => setIsVilleDropdownOpen((prev) => !prev)}
                    className="w-full px-3 py-2 text-[13px] rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50 cursor-pointer flex items-center justify-between"
                  >
                    <span className={formData.ville_id ? "text-slate-800 dark:text-slate-200 font-medium" : "text-slate-400"}>
                      {selectedVilleLabel || "Sélectionner la ville"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </div>

                  {isVilleDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsVilleDropdownOpen(false)}
                      />
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl shadow-lg z-20 p-2 space-y-1.5">
                        <input
                          type="text"
                          placeholder="Rechercher une ville..."
                          value={searchVille}
                          onChange={(e) => setSearchVille(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full text-xs p-2 border border-slate-200 dark:border-gray-700 rounded-lg outline-none focus:border-indigo-500 bg-slate-50 dark:bg-gray-900 text-slate-800 dark:text-slate-200"
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
                                  ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-semibold"
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
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-[13px]">
                <Target className="w-3.5 h-3.5" />
                <span>3. Intérêt du prospect</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Quel produit intéresse principalement le prospect ? (Choix multiple)
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {visibleInterets.map((interet: any, index: number) => {
                  const config = getInteretConfig(interet.id, interet.name);

                  const isDevenirUser = interet.id === 1 || interet.name?.toLowerCase().includes("user");
                  const isComptePro = interet.id === 2 || interet.name?.toLowerCase().includes("pro");
                  const isSoldeAds = interet.id === 3 || interet.name?.toLowerCase().includes("ads") || interet.name?.toLowerCase().includes("solde");

                  const isChecked = isDevenirUser || formData.interets.includes(interet.id);

                  return (
                    <div
                      key={interet.id}
                      onClick={() => handleToggleInteret(interet.id)}
                      className={`p-3.5 rounded-xl border transition-all select-none flex flex-col items-center text-center justify-between min-h-[190px] ${
                        config.cardBg
                      } ${
                        isDevenirUser
                          ? "ring-2 ring-purple-600/70 dark:ring-purple-500/70 cursor-default"
                          : isChecked
                          ? "ring-2 ring-purple-600 dark:ring-purple-500 shadow-sm cursor-pointer"
                          : "hover:border-slate-300 dark:hover:border-gray-700 cursor-pointer"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2 w-full">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config.iconBg}`}>
                          {config.icon}
                        </div>
                        <div>
                          <p className="text-[12px] font-bold leading-tight text-slate-800 dark:text-slate-100">
                            {`${index + 1}. ${interet.name}`}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                            {config.desc}
                          </p>
                        </div>
                      </div>

                      {isComptePro && (
                        <div
                          className="w-full my-2 space-y-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="relative">
                            <input
                              type="number"
                              disabled
                              value={formData.solde_compte_pro}
                              className="w-full text-center text-xs font-bold py-1.5 px-2 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-100/60 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 cursor-not-allowed outline-none"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-600/70">
                              DH
                            </span>
                          </div>
                          <input
                            type="hidden"
                            name="type_solde_compte_pro"
                            value={formData.type_solde_compte_pro}
                          />
                        </div>
                      )}

                      {isSoldeAds && (
                        <div
                          className="w-full my-2 space-y-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="relative">
                            <input
                              type="number"
                              name="solde_ads"
                              min={0}
                              step={500}
                              value={formData.solde_ads}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  solde_ads: Number(e.target.value),
                                }))
                              }
                              placeholder="Montant Ads..."
                              className="w-full text-center text-xs font-bold py-1.5 px-2 rounded-lg border border-red-200 dark:border-red-900/60 bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 focus:border-red-500 outline-none transition-all"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-500">
                              DH
                            </span>
                          </div>
                          <input
                            type="hidden"
                            name="type_solde_ads"
                            value={formData.type_solde_ads}
                          />
                        </div>
                      )}

                      <div className="mt-1.5">
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                            isDevenirUser
                              ? "bg-purple-600 border-purple-600 text-white cursor-default"
                              : isChecked
                              ? config.activeBorder
                              : "border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                          }`}
                        >
                          {(isChecked || isDevenirUser) && (
                            <Check className="w-3 h-3 stroke-[3]" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/30">
                <Info className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                <p className="text-[11px] text-purple-700 dark:text-purple-300">
                  L'opportunité sélectionnée sera créée automatiquement avec le montant et type de solde associé.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl border border-slate-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3.5">
                <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 font-semibold text-[14px]">
                  <Globe className="w-4 h-4" />
                  <span>4. Source</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                  {apiData?.prospect_sources?.map((src: any) => {
                    const isChecked = String(formData.prospect_source_id) === String(src.id);
                    return (
                      <label
                        key={src.id}
                        className="flex items-center gap-3 text-[13px] text-slate-700 dark:text-slate-300 cursor-pointer select-none hover:text-slate-900 dark:hover:text-white transition-colors p-2 rounded-xl border border-slate-100 dark:border-gray-800 bg-slate-50/40 dark:bg-gray-800/30"
                      >
                        <input
                          type="radio"
                          name="prospect_source_id"
                          value={src.id}
                          checked={isChecked}
                          onChange={handleChange}
                          className="w-4 h-4 text-purple-600 border-slate-300 focus:ring-purple-500 cursor-pointer"
                        />
                        <span>{src.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-slate-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3.5">
                <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 font-semibold text-[14px]">
                  <UserCheck className="w-4 h-4" />
                  <span>5. Commercial assigné</span>
                </div>

                <div>
                  <label className="block text-[12.5px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Commercial <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="manager_users_id"
                      value={formData.manager_users_id}
                      onChange={handleChange}
                      className="w-full pl-3.5 pr-8 py-2 text-[13px] rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50 text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-gray-800 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer font-medium"
                    >
                      {apiData?.managers?.map((mgr: any) => (
                        <option key={mgr.id} value={mgr.id}>
                          👤 {mgr.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-snug">
                    <span className="font-semibold">Assigné automatiquement</span> selon les règles d'affectation. Vous pouvez modifier si nécessaire.
                  </p>
                </div>
              </div>
            </div>
          </form>
        )}

        <div className="px-7 py-4 border-t border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 leading-tight">
                Vérification automatique
              </p>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                Le téléphone et l'e-mail seront vérifiés pour éviter les doublons.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-[13px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="add-prospect-form"
              disabled={isSubmitting || isDataLoading}
              className="px-5 py-2.5 text-[13px] font-semibold text-white bg-[#E60067] hover:bg-[#D0005C] active:bg-red-700 rounded-xl transition-all shadow-[0px_2px_8px_rgba(230,0,103,0.25)] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Enregistrement..." : "Enregistrer le prospect"}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}