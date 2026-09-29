import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Eye, EyeOff, Loader2, Camera, Trash2 } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";

import RightModal from "../modals/RightModal";
import { initialesDe, resolveAvatarUrl } from "../../utils/avatar";
import {
  useGetManagerProfileQuery,
  useUpdateManagerProfileMutation,
  type UpdateProfilePayload,
} from "../../services/managerAuthApi";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Rafraîchit l'utilisateur affiché dans l'en-tête après une sauvegarde. */
  onSaved?: () => void;
}

type FieldErrors = Partial<
  Record<
    "nom_complet" | "telephone" | "current_password" | "password" | "password_confirmation",
    string
  >
>;

const inputClass = (hasError: boolean) =>
  `w-full rounded-xl border bg-white px-3 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-[#0f172a] dark:text-white ${
    hasError
      ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
      : "border-slate-200 focus:border-[#2563EB] focus:ring-[#2563EB]/20 dark:border-slate-700/80"
  }`;

export default function EditProfileModal({
  isOpen,
  onClose,
  onSaved,
}: EditProfileModalProps) {
  const { data: profileRes, isFetching } = useGetManagerProfileQuery(undefined, {
    skip: !isOpen,
    // Le panneau doit toujours afficher les valeurs réellement en base, même
    // si le profil a été modifié ailleurs depuis le chargement de la page.
    refetchOnMountOrArgChange: true,
  });

  const [updateProfile, { isLoading: isSaving }] = useUpdateManagerProfileMutation();

  const [nomComplet, setNomComplet] = useState("");

  // `avatar` est ce qui part au serveur (base64, "" pour supprimer, ou l'URL
  // inchangée). `avatarApercu` est ce qu'on affiche, toujours une URL lisible.
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarApercu, setAvatarApercu] = useState<string | null>(null);
  const fichierRef = useRef<HTMLInputElement>(null);
  const [telephone, setTelephone] = useState("212");

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [errors, setErrors] = useState<FieldErrors>({});

  // Préremplissage à l'ouverture. Les champs de mot de passe restent toujours
  // vides : on ne préremplit jamais un secret.
  useEffect(() => {
    const profile = profileRes?.data;

    if (!isOpen || !profile) {
      return;
    }

    setNomComplet(`${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim());

    const raw = profile.telephone ?? "";
    setTelephone(raw ? raw.replace(/^\+/, "") : "212");

    setAvatar(profile.avatar ?? null);
    setAvatarApercu(resolveAvatarUrl(profile.avatar));

    setCurrentPassword("");
    setPassword("");
    setPasswordConfirmation("");
    setErrors({});
  }, [isOpen, profileRes]);


  const TAILLE_MAX_AVATAR = 2 * 1024 * 1024; // 2 Mo

  const choisirFichier = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fichier = event.target.files?.[0];

    // Réinitialise l'input : sans cela, resélectionner le même fichier après
    // une erreur ne déclencherait pas de nouvel événement.
    event.target.value = "";

    if (!fichier) {
      return;
    }

    if (!fichier.type.startsWith("image/")) {
      toast.error("Veuillez choisir un fichier image.");
      return;
    }

    if (fichier.size > TAILLE_MAX_AVATAR) {
      toast.error("Image trop lourde : 2 Mo maximum.");
      return;
    }

    const lecteur = new FileReader();

    lecteur.onload = () => {
      const base64 = String(lecteur.result);
      setAvatar(base64);
      setAvatarApercu(base64);
    };

    lecteur.onerror = () => toast.error("Impossible de lire ce fichier.");

    lecteur.readAsDataURL(fichier);
  };

  /** Chaîne vide : le serveur la comprend comme « supprimer la photo ». */
  const supprimerPhoto = () => {
    setAvatar("");
    setAvatarApercu(null);
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};

    const nom = nomComplet.trim();
    if (!nom) {
      next.nom_complet = "Le nom complet est requis.";
    } else if (nom.length > 100) {
      next.nom_complet = "100 caractères maximum.";
    }

    // Le numéro doit être complet, indicatif pays compris. `PhoneInput` rend
    // la valeur sans « + » : on le rajoute pour que libphonenumber puisse
    // reconnaître l'indicatif.
    const parsed = parsePhoneNumberFromString(`+${telephone.replace(/\D/g, "")}`);
    if (!telephone || !parsed) {
      next.telephone = "Numéro invalide : l'indicatif du pays est obligatoire.";
    } else if (!parsed.isValid()) {
      next.telephone = "Numéro de téléphone invalide.";
    }

    // Les trois champs ne sont contrôlés que si l'utilisateur veut changer de
    // mot de passe ; sinon ils restent optionnels.
    const wantsPasswordChange =
      Boolean(password) || Boolean(passwordConfirmation) || Boolean(currentPassword);

    if (wantsPasswordChange) {
      if (!currentPassword) {
        next.current_password = "Le mot de passe actuel est requis.";
      }
      if (!password) {
        next.password = "Le nouveau mot de passe est requis.";
      } else if (password.length < 6) {
        next.password = "6 caractères minimum.";
      }
      if (password !== passwordConfirmation) {
        next.password_confirmation = "Les deux mots de passe ne correspondent pas.";
      }
    }

    return next;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const digits = telephone.replace(/\D/g, "");

    const payload: UpdateProfilePayload = {
      nom_complet: nomComplet.trim(),
      telephone: digits ? `+${digits}` : null,
      // Toujours transmis : le serveur distingue base64 (upload), "" (suppression)
      // et URL inchangée.
      avatar: avatar ?? "",
    };

    if (password) {
      payload.current_password = currentPassword;
      payload.password = password;
      payload.password_confirmation = passwordConfirmation;
    }

    try {
      await updateProfile(payload).unwrap();

      toast.success("Profil mis à jour avec succès.");
      onSaved?.();
      onClose();
    } catch (err: unknown) {
      // Le serveur renvoie 422 avec { errors: { champ: [message] } } : on les
      // réaffiche sous le champ concerné plutôt qu'en message global.
      const data = (err as { data?: { errors?: Record<string, string[]>; message?: string } })?.data;

      if (data?.errors) {
        const serverErrors: FieldErrors = {};
        for (const [field, messages] of Object.entries(data.errors)) {
          serverErrors[field as keyof FieldErrors] = Array.isArray(messages)
            ? messages[0]
            : String(messages);
        }
        setErrors(serverErrors);
      }

      toast.error(data?.message || "Une erreur est survenue lors de la mise à jour du profil.");
    }
  };

  return (
    <RightModal
      isOpen={isOpen}
      onClose={onClose}
      title="Modifier mon profil"
      labelAction="Enregistrer"
      type="update"
      onSave={handleSubmit}
      isLoading={isSaving}
    >
      {isFetching ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm font-semibold text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement du profil...
        </div>
      ) : (
        <div className="space-y-5 text-sm">
          {/* ---------------------------------------------------------------
              Photo de profil
          ---------------------------------------------------------------- */}
          <div className="flex items-center gap-4">
            <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-violet-50 text-lg font-bold text-[#5C24E8] dark:border-slate-700 dark:bg-violet-950/40 dark:text-violet-300">
              {avatarApercu ? (
                <img src={avatarApercu} alt="" className="h-full w-full object-cover" />
              ) : (
                initialesDe(nomComplet)
              )}
            </span>

            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fichierRef.current?.click()}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Camera className="h-3.5 w-3.5" />
                  {avatarApercu ? "Changer la photo" : "Ajouter une photo"}
                </button>

                {avatarApercu && (
                  <button
                    type="button"
                    onClick={supprimerPhoto}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:border-slate-700 dark:hover:bg-rose-950/30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Supprimer
                  </button>
                )}
              </div>

              <p className="text-[11px] text-slate-400">JPG, PNG ou WEBP — 2 Mo maximum.</p>
            </div>

            <input
              ref={fichierRef}
              type="file"
              accept="image/*"
              onChange={choisirFichier}
              className="hidden"
            />
          </div>

          {/* ---------------------------------------------------------------
              Identité
          ---------------------------------------------------------------- */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Nom complet <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={nomComplet}
              onChange={(e) => setNomComplet(e.target.value)}
              placeholder="Prénom Nom"
              className={inputClass(Boolean(errors.nom_complet))}
            />
            {errors.nom_complet && (
              <p className="text-[11px] font-semibold text-rose-500">{errors.nom_complet}</p>
            )}
          </div>

          {/* Email : affiché pour information seulement. AuthController@updateProfile
              ne l'accepte pas dans sa validation, il ne peut donc pas être modifié
              depuis ce panneau. */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input
              type="email"
              value={profileRes?.data?.email ?? ""}
              readOnly
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-500 dark:border-slate-700/80 dark:bg-slate-800/60 dark:text-slate-400"
            />
            <p className="text-[11px] text-slate-400">
              L'adresse email ne peut pas être modifiée ici.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Téléphone <span className="text-rose-500">*</span>
            </label>
            <div
              className={`react-tel-input-wrapper [&_.form-control]:w-full! [&_.form-control]:h-[42px]! [&_.form-control]:text-sm! [&_.form-control]:rounded-xl! dark:[&_.form-control]:bg-[#0f172a]! dark:[&_.form-control]:text-white! [&_.flag-dropdown]:rounded-l-xl! dark:[&_.flag-dropdown]:bg-slate-800! ${
                errors.telephone
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
            {errors.telephone ? (
              <p className="text-[11px] font-semibold text-rose-500">{errors.telephone}</p>
            ) : (
              <p className="text-[11px] text-slate-400">
                L'indicatif du pays est obligatoire.
              </p>
            )}
          </div>

          {/* ---------------------------------------------------------------
              Mot de passe — section entièrement optionnelle
          ---------------------------------------------------------------- */}
          <div className="border-t border-slate-200 pt-5 dark:border-slate-700">
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              Changer le mot de passe
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Laissez ces champs vides pour conserver votre mot de passe actuel.
            </p>

            <div className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`${inputClass(Boolean(errors.current_password))} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label={showCurrent ? "Masquer" : "Afficher"}
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.current_password && (
                  <p className="text-[11px] font-semibold text-rose-500">
                    {errors.current_password}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="6 caractères minimum"
                    autoComplete="new-password"
                    className={`${inputClass(Boolean(errors.password))} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label={showNew ? "Masquer" : "Afficher"}
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] font-semibold text-rose-500">{errors.password}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type={showNew ? "text" : "password"}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={inputClass(Boolean(errors.password_confirmation))}
                />
                {errors.password_confirmation && (
                  <p className="text-[11px] font-semibold text-rose-500">
                    {errors.password_confirmation}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </RightModal>
  );
}
