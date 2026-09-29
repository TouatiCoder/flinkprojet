import { useState, useEffect, useRef, useMemo } from "react";
import type {
  CreateMembrePayload,
  MembreEquipe,
  MembreVille,
  MembreRole,
  MembreActivite,
} from "../../../services/membresApi";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  X,
  ChevronDown,
  Camera,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Mail,
  MapPin,
  TrendingUp,
  Award,
  Wallet,
  Check,
  Loader2,
  User,
  Users,
  Layers,
  HelpCircle,
  GitBranch,
} from "lucide-react";

interface MembreFormInitialData {
  id?: number;
  nom_complet?: string;
  email?: string;
  telephone?: string | null;
  avatar?: string | null;
  ville_id?: number | null;
  status?: "actif" | "inactif";
  equipe_id?: number | null;
  role_id?: number | null;
  secteurs?: number[];
  methode_affectation?: string;
  capacite_max_leads?: number;
  limite_prospection?: number;
  is_managing?: boolean;
  objectifs?: {
    users_convertis?: number;
    comptes_pro?: number;
    solde_ads?: number;
  };
}

interface MembreFormPayload extends CreateMembrePayload {
  id?: number;
  methode_affectation?: string;
  limite_prospection?: number;
  is_managing?: boolean;
}

interface MembreFormDependencies {
  data?: {
    villes?: MembreVille[];
    equipes?: MembreEquipe[];
    roles?: MembreRole[];
    activites?: MembreActivite[];
  };
}

interface MembreFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: MembreFormPayload) => Promise<void> | void;
  isSubmitting: boolean;
  isLoadingData: boolean;
  initialData?: MembreFormInitialData | null;
  createDataResponse?: MembreFormDependencies;
  mode?: "add" | "edit";
  errorMessage?: string | null;
  // Emails déjà utilisés par d'autres membres (le container exclut l'email
  // du membre en cours d'édition). Sert à la validation d'unicité côté
  // front, en complément de la contrainte "unique" côté API/Laravel.
  existingEmails?: string[];
  // Appelé quand l'utilisateur supprime une photo déjà enregistrée côté API
  // (mode edit) via le bouton corbeille — le container (MembreEditData)
  // déclenche alors l'appel DELETE /membres/{id}/avatar. Une photo tout
  // juste sélectionnée localement (pas encore soumise) est simplement
  // effacée du state sans appeler ce callback.
  onRemoveAvatar?: () => void;
}

export default function MembreForm({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  isLoadingData,
  initialData,
  createDataResponse,
  mode = "add",
  errorMessage,
  existingEmails = [],
  onRemoveAvatar,
}: MembreFormProps) {
    const villesList = useMemo(
      () => createDataResponse?.data?.villes ?? [],
      [createDataResponse?.data?.villes]
    );

    const equipesList = useMemo(
      () => createDataResponse?.data?.equipes ?? [],
      [createDataResponse?.data?.equipes]
    );

    const rolesList = useMemo(
      () => createDataResponse?.data?.roles ?? [],
      [createDataResponse?.data?.roles]
    );

    const activitesList = useMemo(
      () => createDataResponse?.data?.activites ?? [],
      [createDataResponse?.data?.activites]
    );

  const [nomComplet, setNomComplet] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [telephone, setTelephone] = useState("212");
  const [villeId, setVilleId] = useState<number | null>(null);
  const [statut, setStatut] = useState<"actif" | "inactif">("actif");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [equipeId, setEquipeId] = useState<number | null>(null);
  const [responsableName, setResponsableName] = useState<string>("");
  const [roleId, setRoleId] = useState<number | null>(null);
  const [selectedSecteurs, setSelectedSecteurs] = useState<number[]>([]);
  const [isSecteursDropdownOpen, setIsSecteursDropdownOpen] = useState(false);
  const [methodeAffectation, setMethodeAffectation] = useState("Round Robin");
  const [capaciteMaxLeads, setCapaciteMaxLeads] = useState("30");
  const [limiteProspection, setLimiteProspection] = useState("10");
  const [isManaging, setIsManaging] = useState(false);

  const [objUsers, setObjUsers] = useState("10");
  const [objComptesPro, setObjComptesPro] = useState("40");
  const [objSoldeAds, setObjSoldeAds] = useState("400000");

  // Validation front (tous les champs + unicité de l'email côté API)
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Dropdown open states (custom selects, styled like Secteur(s) d'activité)
  const [isVilleDropdownOpen, setIsVilleDropdownOpen] = useState(false);
  const [isStatutDropdownOpen, setIsStatutDropdownOpen] = useState(false);
  const [isEquipeDropdownOpen, setIsEquipeDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isMethodeDropdownOpen, setIsMethodeDropdownOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const secteursRef = useRef<HTMLDivElement>(null);
  const villeRef = useRef<HTMLDivElement>(null);
  const statutRef = useRef<HTMLDivElement>(null);
  const equipeRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const methodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setNomComplet(initialData.nom_complet || "");
      setEmail(initialData.email || "");
      setPassword("");
      const rawTel = initialData.telephone || "";
      setTelephone(rawTel.startsWith("+") ? rawTel.replace("+", "") : rawTel || "212");
      setVilleId(initialData.ville_id || null);
      setStatut(initialData.status || "actif");
      setPhotoPreview(initialData.avatar || null);
      setEquipeId(initialData.equipe_id || null);

      if (initialData.equipe_id && equipesList.length > 0) {
        const eq = equipesList.find((item: MembreEquipe) => item.id === initialData.equipe_id);
        setResponsableName(eq?.responsable_name || "Aucun responsable assigné");
      } else {
        setResponsableName("");
      }

      setRoleId(initialData.role_id || null);
      setSelectedSecteurs(initialData.secteurs || []);
      setMethodeAffectation(initialData.methode_affectation || "Round Robin");
      // `??` et non `||` : une valeur réelle à 0 doit rester 0, pas être
      // remplacée par la valeur par défaut du formulaire d'ajout.
      setCapaciteMaxLeads(String(initialData.capacite_max_leads ?? 30));
      setLimiteProspection(String(initialData.limite_prospection ?? 10));
      setIsManaging(initialData.is_managing ?? false);

      if (initialData.objectifs) {
        setObjUsers(String(initialData.objectifs.users_convertis ?? 0));
        setObjComptesPro(String(initialData.objectifs.comptes_pro ?? 0));
        setObjSoldeAds(String(initialData.objectifs.solde_ads ?? 0));
      }
    } else if (mode === "add" && isOpen) {
      setNomComplet("");
      setEmail("");
      setPassword("");
      setTelephone("212");
      setPhotoPreview(null);
      setStatut("actif");
      // Équipe préremplie quand l'ajout est lancé depuis la fiche d'une équipe.
      const equipeParDefaut = initialData?.equipe_id ?? null;
      setEquipeId(equipeParDefaut);
      if (equipeParDefaut) {
        const eq = equipesList.find((item: MembreEquipe) => item.id === equipeParDefaut);
        setResponsableName(eq?.responsable_name || "Aucun responsable assigné");
      } else {
        setResponsableName("");
      }
      setRoleId(null);
      setSelectedSecteurs([]);
      setMethodeAffectation("Round Robin");
      setCapaciteMaxLeads("30");
      setLimiteProspection("10");
      setIsManaging(false);
      setObjUsers("10");
      setObjComptesPro("40");
      setObjSoldeAds("400000");

      if (villesList.length > 0 && !villeId) setVilleId(villesList[0].id);
      // Rôle : pas de valeur par défaut, on laisse "Sélectionner un rôle"
    }
  }, [initialData, mode, isOpen, equipesList, villesList, rolesList, villeId]);

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setHasSubmitted(false);
    }
  }, [isOpen, mode, initialData?.id]);

  const handleEquipeChange = (eqId: number | null) => {
    if (!eqId) {
      setEquipeId(null);
      setResponsableName("");
      return;
    }
    setEquipeId(eqId);
    const eq = equipesList.find((item: MembreEquipe) => item.id === eqId);
    setResponsableName(eq?.responsable_name || "Aucun responsable assigné");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (secteursRef.current && !secteursRef.current.contains(e.target as Node)) {
        setIsSecteursDropdownOpen(false);
      }
      if (villeRef.current && !villeRef.current.contains(e.target as Node)) {
        setIsVilleDropdownOpen(false);
      }
      if (statutRef.current && !statutRef.current.contains(e.target as Node)) {
        setIsStatutDropdownOpen(false);
      }
      if (equipeRef.current && !equipeRef.current.contains(e.target as Node)) {
        setIsEquipeDropdownOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
      if (methodeRef.current && !methodeRef.current.contains(e.target as Node)) {
        setIsMethodeDropdownOpen(false);
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 300;
          const MAX_HEIGHT = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.8);
          setPhotoPreview(resizedDataUrl);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSecteur = (id: number) => {
    setSelectedSecteurs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Retire la photo actuelle (locale ou déjà enregistrée). Si la photo
  // affichée est celle déjà persistée côté API (mode edit, rien de
  // nouveau sélectionné), on prévient le container pour qu'il supprime
  // le fichier côté serveur immédiatement ; sinon (fichier tout juste
  // choisi, pas encore soumis) on se contente de vider l'état local.
  const handleRemovePhoto = () => {
    const isPersistedAvatar =
      mode === "edit" &&
      !!initialData?.avatar &&
      photoPreview === initialData.avatar;

    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (isPersistedAvatar) {
      onRemoveAvatar?.();
    }
  };

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Valide tous les champs du formulaire. Renvoie un objet { champ: message }.
  // L'unicité de l'email est vérifiée ici en front (via existingEmails, qui
  // reflète la liste déjà chargée par l'API) pour un feedback immédiat ; la
  // contrainte "unique" côté Laravel (manager_users.email) reste la source
  // de vérité finale et son message est affiché via errorMessage si jamais
  // deux utilisateurs soumettent le même email en même temps.
  const validate = (): Record<string, string> => {
    const next: Record<string, string> = {};

    const trimmedNom = nomComplet.trim();
    if (!trimmedNom) {
      next.nomComplet = "Le nom complet est requis.";
    } else if (trimmedNom.length < 3) {
      next.nomComplet = "3 caractères minimum.";
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      next.email = "L'email est requis.";
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      next.email = "Format d'email invalide.";
    } else if (existingEmails.some((e) => e.trim().toLowerCase() === trimmedEmail.toLowerCase())) {
      next.email = "Cet email est déjà utilisé par un autre membre.";
    }

    const phoneDigits = telephone.replace(/\D/g, "");
    if (!telephone || phoneDigits.length < 9) {
      next.telephone = "Numéro de téléphone requis et valide.";
    }

    if (mode === "add" && !password) {
      next.password = "Le mot de passe est requis.";
    } else if (password && password.length < 6) {
      next.password = "6 caractères minimum.";
    }

    if (!villeId) next.villeId = "La ville est requise.";
    if (!equipeId) next.equipeId = "L'équipe est requise.";
    if (!roleId) next.roleId = "Le rôle est requis.";
    if (selectedSecteurs.length === 0) {
      next.secteurs = "Sélectionnez au moins un secteur.";
    }

    if (capaciteMaxLeads.trim() === "" || Number(capaciteMaxLeads) <= 0 || !Number.isFinite(Number(capaciteMaxLeads))) {
      next.capaciteMaxLeads = "Nombre entier supérieur à 0 requis.";
    }
    if (limiteProspection.trim() === "" || Number(limiteProspection) < 0 || !Number.isFinite(Number(limiteProspection))) {
      next.limiteProspection = "Nombre positif requis.";
    }

    if (objUsers.trim() !== "" && (Number(objUsers) < 0 || !Number.isFinite(Number(objUsers)))) {
      next.objUsers = "Doit être un nombre positif.";
    }
    if (objComptesPro.trim() !== "" && (Number(objComptesPro) < 0 || !Number.isFinite(Number(objComptesPro)))) {
      next.objComptesPro = "Doit être un nombre positif.";
    }
    if (objSoldeAds.trim() !== "" && (Number(objSoldeAds) < 0 || !Number.isFinite(Number(objSoldeAds)))) {
      next.objSoldeAds = "Doit être un nombre positif.";
    }

    return next;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const formattedPhone = telephone ? (telephone.startsWith("+") ? telephone : `+${telephone}`) : "";

    const payload: MembreFormPayload = {
      nom_complet: nomComplet.trim(),
      email: email.trim(),
      telephone: formattedPhone,
      avatar: photoPreview || null,
      ville_id: villeId,
      status: statut,
      equipe_id: equipeId,
      role_id: roleId,
      secteurs: selectedSecteurs,
      methode_affectation: methodeAffectation,
      capacite_max_leads: Number(capaciteMaxLeads) || 0,
      limite_prospection: Number(limiteProspection) || 0,
      is_managing: isManaging,
      objectifs: {
        users_convertis: Number(objUsers) || 0,
        comptes_pro: Number(objComptesPro) || 0,
        solde_ads: Number(objSoldeAds) || 0,
      },
    };

    if (mode === "edit" && initialData?.id) {
      payload.id = initialData.id;
    }
    if (password || mode === "add") {
      payload.password = password;
    }

    onSubmit(payload);
  };

  if (!isOpen) return null;

  const selectedVilleName = villesList.find((v: MembreVille) => v.id === villeId)?.name || "";
  const selectedRoleName = rolesList.find((r: MembreRole) => r.id === roleId)?.name || "";
  const selectedEquipeName = equipesList.find((eq: MembreEquipe) => eq.id === equipeId)?.nom || "";

  const methodeOptions = ["Round Robin", "Moins chargé", "Manuel"];

  return (
    <div className="fixed inset-0 z-[999999] flex justify-end">
      <div
        className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative w-full max-w-[880px] bg-white dark:bg-[#0b132b] shadow-2xl flex flex-col justify-between z-[1000000] animate-in slide-in-from-right duration-300 h-full font-sans text-slate-700 dark:text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 sm:px-8 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#1e1b4b] dark:text-white">
              {mode === "add" ? "Ajouter un membre" : "Modifier le membre"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ajoutez un nouveau membre à votre équipe commerciale.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoadingData ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-7 h-7 animate-spin text-[#7c3aed]" />
            <span className="text-xs">Chargement des données...</span>
          </div>
        ) : (
          <form
            id="membre-modal-form"
            onSubmit={handleFormSubmit}
            className="px-5 py-6 sm:px-8 space-y-6 overflow-y-auto flex-1 text-xs"
          >
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Section 1: Informations */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-[#2563EB]/30">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1e1b4b] dark:text-white">
                    Informations
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Renseignez les informations personnelles du membre.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Avatar Uploader (circle) */}
                <div className="flex flex-col items-center justify-center gap-2 h-full min-h-[110px]">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <div className="relative">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center cursor-pointer bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700/80 hover:border-[#2563EB] hover:bg-[#2563EB]/5 transition-all group"
                    >
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="w-6 h-6 text-[#2563EB] group-hover:scale-110 transition-transform" />
                      )}
                    </div>

                    {photoPreview && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePhoto();
                        }}
                        title="Supprimer la photo"
                        className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-sm transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {photoPreview ? (
                    <span className="text-[10px] text-slate-400">
                      Cliquez sur la photo pour la changer
                    </span>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center gap-0.5 cursor-pointer"
                    >
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        Ajouter une photo
                      </span>
                      <span className="text-[9px] text-slate-400">JPG, PNG (max 2 Mo)</span>
                    </div>
                  )}
                </div>

                {/* Inputs Row 1 inside section */}
                <div className="md:col-span-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Nom complet <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex : Amine Zahraoui"
                      value={nomComplet}
                      onChange={(e) => setNomComplet(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 font-medium ${
                        hasSubmitted && errors.nomComplet
                          ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500"
                          : "border-slate-200 dark:border-slate-700/80 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                      }`}
                    />
                    {hasSubmitted && errors.nomComplet && (
                      <p className="text-[11px] font-semibold text-rose-500">{errors.nomComplet}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="exemple@flink.ma"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2.5 rounded-xl border bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 font-medium ${
                          hasSubmitted && errors.email
                            ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500"
                            : "border-slate-200 dark:border-slate-700/80 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                        }`}
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    {hasSubmitted && errors.email && (
                      <p className="text-[11px] font-semibold text-rose-500">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Téléphone <span className="text-rose-500">*</span>
                    </label>
                    <div
                      className={`react-tel-input-wrapper [&_.form-control]:w-full! [&_.form-control]:h-[38px]! [&_.form-control]:text-xs! [&_.form-control]:rounded-xl! dark:[&_.form-control]:bg-[#0f172a]! dark:[&_.form-control]:text-white! [&_.flag-dropdown]:rounded-l-xl! dark:[&_.flag-dropdown]:bg-slate-800! ${
                        hasSubmitted && errors.telephone
                          ? "[&_.form-control]:border-rose-400! [&_.flag-dropdown]:border-rose-400!"
                          : "[&_.form-control]:border-slate-200! dark:[&_.form-control]:border-slate-700! [&_.flag-dropdown]:border-slate-200! dark:[&_.flag-dropdown]:border-slate-700!"
                      }`}
                    >
                      <PhoneInput
                        country={"ma"}
                        value={telephone}
                        onChange={(phone) => setTelephone(phone)}
                        enableSearch={true}
                        searchPlaceholder="Rechercher pays..."
                      />
                    </div>
                    {hasSubmitted && errors.telephone && (
                      <p className="text-[11px] font-semibold text-rose-500">{errors.telephone}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Mot de passe <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder={mode === "edit" ? "Laisser vide pour ne pas changer" : "••••••••••••"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full pl-9 pr-9 py-2.5 rounded-xl border bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 font-medium ${
                          hasSubmitted && errors.password
                            ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500"
                            : "border-slate-200 dark:border-slate-700/80 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                        }`}
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {hasSubmitted && errors.password && (
                      <p className="text-[11px] font-semibold text-rose-500">{errors.password}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Ville & Statut */}
              <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                {/* Ville — custom dropdown */}
                <div className="space-y-1.5" ref={villeRef}>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Ville <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsVilleDropdownOpen((prev) => !prev)}
                      className={`w-full text-left pl-9 pr-8 py-2.5 rounded-xl border bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white focus:outline-none focus:ring-2 font-medium truncate cursor-pointer ${
                        hasSubmitted && errors.villeId
                          ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500"
                          : "border-slate-200 dark:border-slate-700/80 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                      }`}
                    >
                      {villeId ? (
                        <span>{selectedVilleName}</span>
                      ) : (
                        <span className="text-slate-400 font-normal">Sélectionner une ville</span>
                      )}
                    </button>
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />

                    {isVilleDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 p-2 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 shadow-xl z-20 max-h-48 overflow-y-auto space-y-1">
                        {villesList.map((v: MembreVille) => {
                          const isSelected = villeId === v.id;
                          return (
                            <div
                              key={v.id}
                              onClick={() => {
                                setVilleId(v.id);
                                setIsVilleDropdownOpen(false);
                              }}
                              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                                isSelected
                                  ? "bg-[#2563EB]/10 text-[#2563EB] font-semibold"
                                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                              }`}
                            >
                              <span className="capitalize">{v.name}</span>
                              {isSelected && <Check className="w-4 h-4 text-[#2563EB]" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {hasSubmitted && errors.villeId && (
                    <p className="text-[11px] font-semibold text-rose-500">{errors.villeId}</p>
                  )}
                </div>

                {/* Statut — custom dropdown, dot green/rouge selon la valeur */}
                <div className="space-y-1.5" ref={statutRef}>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Statut <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsStatutDropdownOpen((prev) => !prev)}
                      className="w-full text-left pl-8 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] font-medium truncate cursor-pointer"
                    >
                      {statut === "actif" ? "Actif" : "Inactif"}
                    </button>
                    <span
                      className={`w-2 h-2 rounded-full absolute left-3.5 top-1/2 -translate-y-1/2 ${
                        statut === "actif" ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                    />
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />

                    {isStatutDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 p-2 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 shadow-xl z-20 space-y-1">
                        {(["actif", "inactif"] as const).map((s) => {
                          const isSelected = statut === s;
                          return (
                            <div
                              key={s}
                              onClick={() => {
                                setStatut(s);
                                setIsStatutDropdownOpen(false);
                              }}
                              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                                isSelected
                                  ? "bg-[#2563EB]/10 text-[#2563EB] font-semibold"
                                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    s === "actif" ? "bg-emerald-500" : "bg-rose-500"
                                  }`}
                                />
                                {s === "actif" ? "Actif" : "Inactif"}
                              </span>
                              {isSelected && <Check className="w-4 h-4 text-[#2563EB]" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Section 2: Équipe & Rôle */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#7C3AED] text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-[#7C3AED]/30">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1e1b4b] dark:text-white">
                    Équipe & rôle
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Définissez l'équipe, le rôle et les paramètres d'affectation.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {/* Équipe — custom dropdown */}
                <div className="space-y-1.5" ref={equipeRef}>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Équipe <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsEquipeDropdownOpen((prev) => !prev)}
                      className={`w-full text-left pl-9 pr-8 py-2.5 rounded-xl border bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white focus:outline-none focus:ring-2 font-medium truncate cursor-pointer ${
                        hasSubmitted && errors.equipeId
                          ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500"
                          : "border-slate-200 dark:border-slate-700/80 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                      }`}
                    >
                      {equipeId ? (
                        <span>{selectedEquipeName}</span>
                      ) : (
                        <span className="text-slate-400 font-normal">Sélectionner une équipe</span>
                      )}
                    </button>
                    <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />

                    {isEquipeDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 p-2 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 shadow-xl z-20 max-h-48 overflow-y-auto space-y-1">
                        {equipesList.map((eq: MembreEquipe) => {
                          const isSelected = equipeId === eq.id;
                          return (
                            <div
                              key={eq.id}
                              onClick={() => {
                                handleEquipeChange(eq.id);
                                setIsEquipeDropdownOpen(false);
                              }}
                              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                                isSelected
                                  ? "bg-[#7C3AED]/10 text-[#7C3AED] font-semibold"
                                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                              }`}
                            >
                              <span className="capitalize">{eq.nom}</span>
                              {isSelected && <Check className="w-4 h-4 text-[#7C3AED]" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {hasSubmitted && errors.equipeId && (
                    <p className="text-[11px] font-semibold text-rose-500">{errors.equipeId}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Responsable
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={responsableName}
                      placeholder="Rempli automatiquement"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-[#0f172a]/60 text-slate-500 font-medium cursor-not-allowed"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Rôle — custom dropdown, pas de valeur par défaut */}
                <div className="space-y-1.5" ref={roleRef}>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Rôle <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsRoleDropdownOpen((prev) => !prev)}
                      className={`w-full text-left pl-9 pr-8 py-2.5 rounded-xl border bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white focus:outline-none focus:ring-2 font-medium truncate cursor-pointer ${
                        hasSubmitted && errors.roleId
                          ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500"
                          : "border-slate-200 dark:border-slate-700/80 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                      }`}
                    >
                      {roleId ? (
                        <span>{selectedRoleName}</span>
                      ) : (
                        <span className="text-slate-400 font-normal">Sélectionner un rôle</span>
                      )}
                    </button>
                    <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />

                    {isRoleDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 p-2 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 shadow-xl z-20 max-h-48 overflow-y-auto space-y-1">
                        {rolesList.map((r: MembreRole) => {
                          const isSelected = roleId === r.id;
                          return (
                            <div
                              key={r.id}
                              onClick={() => {
                                setRoleId(r.id);
                                setIsRoleDropdownOpen(false);
                              }}
                              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                                isSelected
                                  ? "bg-[#7C3AED]/10 text-[#7C3AED] font-semibold"
                                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                              }`}
                            >
                              <span className="capitalize">{r.name}</span>
                              {isSelected && <Check className="w-4 h-4 text-[#7C3AED]" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {hasSubmitted && errors.roleId && (
                    <p className="text-[11px] font-semibold text-rose-500">{errors.roleId}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {/* Secteur(s) d'activité — dropdown existant (référence de style) */}
                <div className="space-y-1.5" ref={secteursRef}>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Secteur(s) d'activité <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsSecteursDropdownOpen((prev) => !prev)}
                      className={`w-full text-left pl-9 pr-8 py-2.5 rounded-xl border bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white focus:outline-none focus:ring-2 font-medium truncate cursor-pointer ${
                        hasSubmitted && errors.secteurs
                          ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500"
                          : "border-slate-200 dark:border-slate-700/80 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                      }`}
                    >
                      {selectedSecteurs.length === 0 ? (
                        <span className="text-slate-400 font-normal">Sélectionner un ou plusieurs secteurs</span>
                      ) : (
                        <span>
                          {activitesList
                            .filter((a: MembreActivite) => selectedSecteurs.includes(a.id))
                            .map((a: MembreActivite) => a.name)
                            .join(", ")}
                        </span>
                      )}
                    </button>
                    <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />

                    {isSecteursDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 p-2 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 shadow-xl z-20 max-h-48 overflow-y-auto space-y-1">
                        {activitesList.map((sec: MembreActivite) => {
                          const isSelected = selectedSecteurs.includes(sec.id);
                          return (
                            <div
                              key={sec.id}
                              onClick={() => toggleSecteur(sec.id)}
                              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                                isSelected
                                  ? "bg-[#7C3AED]/10 text-[#7C3AED] font-semibold"
                                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                              }`}
                            >
                              <span className="capitalize">{sec.name}</span>
                              {isSelected && <Check className="w-4 h-4 text-[#7C3AED]" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {hasSubmitted && errors.secteurs && (
                    <p className="text-[11px] font-semibold text-rose-500">{errors.secteurs}</p>
                  )}
                </div>

                {/* Méthode d'affectation — custom dropdown */}
                <div className="space-y-1.5" ref={methodeRef}>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Méthode d'affectation <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsMethodeDropdownOpen((prev) => !prev)}
                      className="w-full text-left pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] font-medium truncate cursor-pointer"
                    >
                      {methodeAffectation}
                    </button>
                    <GitBranch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />

                    {isMethodeDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 p-2 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 shadow-xl z-20 space-y-1">
                        {methodeOptions.map((m) => {
                          const isSelected = methodeAffectation === m;
                          return (
                            <div
                              key={m}
                              onClick={() => {
                                setMethodeAffectation(m);
                                setIsMethodeDropdownOpen(false);
                              }}
                              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                                isSelected
                                  ? "bg-[#7C3AED]/10 text-[#7C3AED] font-semibold"
                                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                              }`}
                            >
                              <span>{m}</span>
                              {isSelected && <Check className="w-4 h-4 text-[#7C3AED]" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 truncate block">
                    Capacité max d'opportunités actives <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      value={capaciteMaxLeads}
                      onChange={(e) => setCapaciteMaxLeads(e.target.value)}
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white focus:outline-none focus:ring-2 font-medium ${
                        hasSubmitted && errors.capaciteMaxLeads
                          ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500"
                          : "border-slate-200 dark:border-slate-700/80 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                      }`}
                    />
                    <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {hasSubmitted && errors.capaciteMaxLeads && (
                    <p className="text-[11px] font-semibold text-rose-500">{errors.capaciteMaxLeads}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-1 items-center sm:grid-cols-2">
                {/* Limite de création de prospects / jour */}
                <div className="p-3.5 rounded-2xl border border-purple-200/60 dark:border-purple-800/40 bg-purple-500/5 space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>
                      Limite de création de prospects / jour <span className="text-rose-500">*</span>
                    </span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min={0}
                      value={limiteProspection}
                      onChange={(e) => setLimiteProspection(e.target.value)}
                      className={`w-full pl-9 pr-8 py-2.5 rounded-xl border bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white focus:outline-none focus:ring-2 font-medium ${
                        hasSubmitted && errors.limiteProspection
                          ? "border-rose-400 focus:ring-rose-500/20"
                          : "border-slate-200 dark:border-slate-700/80 focus:ring-[#7C3AED]/20"
                      }`}
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <HelpCircle className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {hasSubmitted && errors.limiteProspection && (
                    <p className="text-[11px] font-semibold text-rose-500">{errors.limiteProspection}</p>
                  )}
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-[#0f172a]/60">
                  <div className="space-y-0.5 pr-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">
                      Recevoir automatiquement de nouvelles opportunités
                    </span>
                    <span className="text-[10px] text-slate-400 block leading-tight">
                      Si désactivé, le membre restera actif mais ne recevra pas automatiquement de nouvelles opportunités.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsManaging(!isManaging)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isManaging ? "bg-[#7C3AED]" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isManaging ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Section 3: Objectifs individuels */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#F59E0B] text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-[#F59E0B]/30">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1e1b4b] dark:text-white">
                    Objectifs individuels
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Définissez les objectifs individuels du membre. Ces objectifs alimentent automatiquement les objectifs de son équipe.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2 lg:grid-cols-3">
                {/* Devenir User */}
                <div className="p-3.5 rounded-2xl border border-blue-200/60 dark:border-blue-800/40 bg-blue-500/5 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                        Devenir User
                      </h4>
                      <span className="text-[10px] text-slate-400">Objectif hebdomadaire</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 items-center">
                    <input
                      type="number"
                      min={0}
                      value={objUsers}
                      onChange={(e) => setObjUsers(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white focus:outline-none focus:ring-2 font-semibold ${
                        hasSubmitted && errors.objUsers
                          ? "border-rose-400 focus:ring-rose-500/20"
                          : "border-slate-200 dark:border-slate-700 focus:ring-[#2563EB]/20"
                      }`}
                    />
                    <div className="px-2.5 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-[10px] font-medium truncate text-center">
                      Users / semaine
                    </div>
                  </div>
                  {hasSubmitted && errors.objUsers && (
                    <p className="text-[11px] font-semibold text-rose-500">{errors.objUsers}</p>
                  )}
                </div>

                {/* Compte Pro */}
                <div className="p-3.5 rounded-2xl border border-purple-200/60 dark:border-purple-800/40 bg-purple-500/5 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                        Compte Pro
                      </h4>
                      <span className="text-[10px] text-slate-400">Objectif mensuel</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 items-center">
                    <input
                      type="number"
                      min={0}
                      value={objComptesPro}
                      onChange={(e) => setObjComptesPro(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white focus:outline-none focus:ring-2 font-semibold ${
                        hasSubmitted && errors.objComptesPro
                          ? "border-rose-400 focus:ring-rose-500/20"
                          : "border-slate-200 dark:border-slate-700 focus:ring-[#7C3AED]/20"
                      }`}
                    />
                    <div className="px-2.5 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-[10px] font-medium truncate text-center">
                      Comptes / mois
                    </div>
                  </div>
                  {hasSubmitted && errors.objComptesPro && (
                    <p className="text-[11px] font-semibold text-rose-500">{errors.objComptesPro}</p>
                  )}
                </div>

                {/* Solde Ads */}
                <div className="p-3.5 rounded-2xl border border-amber-200/60 dark:border-amber-800/40 bg-amber-500/5 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                        Solde Ads
                      </h4>
                      <span className="text-[10px] text-slate-400">Objectif annuel</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 items-center">
                    <input
                      type="number"
                      min={0}
                      value={objSoldeAds}
                      onChange={(e) => setObjSoldeAds(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white focus:outline-none focus:ring-2 font-semibold ${
                        hasSubmitted && errors.objSoldeAds
                          ? "border-rose-400 focus:ring-rose-500/20"
                          : "border-slate-200 dark:border-slate-700 focus:ring-[#F59E0B]/20"
                      }`}
                    />
                    <div className="px-2.5 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-[10px] font-medium truncate text-center">
                      MAD / an
                    </div>
                  </div>
                  {hasSubmitted && errors.objSoldeAds && (
                    <p className="text-[11px] font-semibold text-rose-500">{errors.objSoldeAds}</p>
                  )}
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="px-5 py-4 sm:px-8 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-end gap-3 bg-white dark:bg-[#0b132b]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            form="membre-modal-form"
            type="submit"
            disabled={isSubmitting || isLoadingData}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all shadow-sm shadow-blue-500/20 hover:shadow-blue-500/30 disabled:opacity-50 cursor-pointer"          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>
              {mode === "add"
                ? isSubmitting
                  ? "Ajout en cours..."
                  : "Ajouter le membre"
                : isSubmitting
                ? "Modification..."
                : "Enregistrer les modifications"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}