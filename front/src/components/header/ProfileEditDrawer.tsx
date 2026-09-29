import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  X,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Info,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ApiBaseUrl } from "../../constants/publicConstants";
import { getCookie } from "../../utils/cookies";

interface ProfileEditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Structure d'une erreur de validation Laravel.
 */
interface ApiValidationError {
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Panneau latéral d'édition du profil connecté.
 *
 * L'email n'est pas modifiable : il sert d'identifiant du compte.
 * Le mot de passe n'est changé que si l'utilisateur en saisit un nouveau,
 * et seulement après vérification du mot de passe actuel.
 */
export default function ProfileEditDrawer({
  isOpen,
  onClose,
}: ProfileEditDrawerProps) {
  const { user, refreshUser } = useAuth();

  const [nomComplet, setNomComplet] = useState("");
  const [telephone, setTelephone] = useState("212");

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Réinitialise le formulaire depuis le profil chargé à chaque ouverture.
  useEffect(() => {
    if (!isOpen || !user) {
      return;
    }

    const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`
      .toString()
      .trim();

    setNomComplet(fullName || String(user.username ?? ""));

    const rawTel = String(user.telephone ?? "");

    setTelephone(
      rawTel.startsWith("+") ? rawTel.slice(1) : rawTel || "212",
    );

    setCurrentPassword("");
    setPassword("");
    setPasswordConfirmation("");
    setErrors({});
  }, [isOpen, user]);

  if (!isOpen) {
    return null;
  }

  const validate = (): Record<string, string> => {
    const next: Record<string, string> = {};

    const trimmedNom = nomComplet.trim();

    if (!trimmedNom) {
      next.nomComplet = "Le nom complet est requis.";
    } else if (trimmedNom.length < 3) {
      next.nomComplet = "3 caractères minimum.";
    }

    const digits = telephone.replace(/\D/g, "");

    if (digits && digits.length < 9) {
      next.telephone = "Numéro de téléphone incomplet.";
    }

    // Le bloc mot de passe n'est validé que s'il est réellement utilisé.
    if (password || passwordConfirmation || currentPassword) {
      if (!currentPassword) {
        next.currentPassword = "Saisissez votre mot de passe actuel.";
      }

      if (!password) {
        next.password = "Saisissez le nouveau mot de passe.";
      } else if (password.length < 6) {
        next.password = "6 caractères minimum.";
      }

      if (password !== passwordConfirmation) {
        next.passwordConfirmation =
          "La confirmation ne correspond pas.";
      }
    }

    return next;
  };

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    const validationErrors = validate();

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    const payload: Record<string, string> = {
      nom_complet: nomComplet.trim(),
      telephone: telephone ? `+${telephone.replace(/^\+/, "")}` : "",
    };

    if (password) {
      payload.current_password = currentPassword;
      payload.password = password;
      payload.password_confirmation = passwordConfirmation;
    }

    try {
      const baseOrigin = ApiBaseUrl.replace(/\/+$/, "");

      await axios.put(`${baseOrigin}/me`, payload, {
        headers: {
          Authorization: `Bearer ${getCookie("TOKEN")}`,
        },
      });

      await refreshUser();

      toast.success("Profil mis à jour avec succès.");

      onClose();
    } catch (error: unknown) {
      const data = axios.isAxiosError<ApiValidationError>(error)
        ? error.response?.data
        : undefined;

      if (data?.errors) {
        // Remonte les messages Laravel sur les champs correspondants.
        const mapped: Record<string, string> = {};

        const keyMap: Record<string, string> = {
          nom_complet: "nomComplet",
          telephone: "telephone",
          current_password: "currentPassword",
          password: "password",
        };

        Object.entries(data.errors).forEach(([key, messages]) => {
          mapped[keyMap[key] ?? key] = messages[0];
        });

        setErrors(mapped);
      }

      toast.error(
        data?.message ??
          "Une erreur est survenue lors de la mise à jour du profil.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full pl-9 pr-3.5 py-2.5 rounded-xl border bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white focus:outline-none focus:ring-2 font-medium text-sm ${
      hasError
        ? "border-rose-400 focus:ring-rose-500/20"
        : "border-slate-200 dark:border-slate-700/80 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
    }`;

  return (
    <div className="fixed inset-0 z-[999999] flex justify-end">
      {/* Fond cliquable */}
      <div
        className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-[1000000] flex h-full w-full max-w-[520px] flex-col justify-between bg-white shadow-2xl dark:bg-[#0b132b]">
        {/* ---------------------------------------------------------------
            En-tête
        ---------------------------------------------------------------- */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-8 dark:border-slate-800/80">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#1e1b4b] dark:text-white">
              Modifier mon profil
            </h2>

            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Mettez à jour votre nom, votre téléphone et votre mot de passe.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ---------------------------------------------------------------
            Formulaire
        ---------------------------------------------------------------- */}
        <form
          id="profile-edit-form"
          onSubmit={handleSubmit}
          className="flex-1 space-y-6 overflow-y-auto px-5 py-6 sm:px-8"
        >
          {/* Identité */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#7C3AED] text-xs font-bold text-white shadow-sm shadow-[#7C3AED]/30">
                1
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#1e1b4b] dark:text-white">
                  Informations personnelles
                </h3>

                <p className="text-[11px] text-slate-400">
                  Votre nom tel qu'il apparaît dans l'application.
                </p>
              </div>
            </div>

            {/* Nom complet */}
            <div className="space-y-1.5">
              <label
                htmlFor="profile-nom"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Nom complet <span className="text-rose-500">*</span>
              </label>

              <div className="relative">
                <input
                  id="profile-nom"
                  type="text"
                  value={nomComplet}
                  onChange={(event) =>
                    setNomComplet(event.target.value)
                  }
                  placeholder="Prénom Nom"
                  className={inputClass(Boolean(errors.nomComplet))}
                />

                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>

              {errors.nomComplet && (
                <p className="text-[11px] font-semibold text-rose-500">
                  {errors.nomComplet}
                </p>
              )}
            </div>

            {/* Email — lecture seule */}
            <div className="space-y-1.5">
              <label
                htmlFor="profile-email"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Adresse e-mail
              </label>

              <div className="relative">
                <input
                  id="profile-email"
                  type="email"
                  value={String(user?.email ?? "")}
                  readOnly
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3.5 text-sm font-medium text-slate-500 dark:border-slate-700/80 dark:bg-[#0f172a]/60"
                />

                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>

              <p className="flex items-start gap-1.5 text-[11px] text-slate-400">
                <Info className="mt-px h-3 w-3 shrink-0" />
                L'adresse e-mail identifie votre compte et ne peut pas être
                modifiée ici.
              </p>
            </div>

            {/* Téléphone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Téléphone
              </label>

              {/* Même habillage que le champ téléphone du formulaire Membre :
                  l'indicatif pays reste sélectionnable et est conservé dans la
                  valeur enregistrée. */}
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
                  inputProps={{ id: "profile-telephone" }}
                />
              </div>

              {errors.telephone && (
                <p className="text-[11px] font-semibold text-rose-500">
                  {errors.telephone}
                </p>
              )}
            </div>
          </div>

          {/* Mot de passe */}
          <div className="space-y-4 border-t border-slate-100 pt-6 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#7C3AED] text-xs font-bold text-white shadow-sm shadow-[#7C3AED]/30">
                2
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#1e1b4b] dark:text-white">
                  Mot de passe
                </h3>

                <p className="text-[11px] text-slate-400">
                  Laissez ces champs vides pour conserver le mot de passe
                  actuel.
                </p>
              </div>
            </div>

            {/* Mot de passe actuel */}
            <div className="space-y-1.5">
              <label
                htmlFor="profile-current-password"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Mot de passe actuel
              </label>

              <div className="relative">
                <input
                  id="profile-current-password"
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(event) =>
                    setCurrentPassword(event.target.value)
                  }
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`${inputClass(
                    Boolean(errors.currentPassword),
                  )} pr-10`}
                />

                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <button
                  type="button"
                  onClick={() => setShowCurrent((value) => !value)}
                  aria-label={
                    showCurrent
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showCurrent ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {errors.currentPassword && (
                <p className="text-[11px] font-semibold text-rose-500">
                  {errors.currentPassword}
                </p>
              )}
            </div>

            {/* Nouveau mot de passe */}
            <div className="space-y-1.5">
              <label
                htmlFor="profile-new-password"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Nouveau mot de passe
              </label>

              <div className="relative">
                <input
                  id="profile-new-password"
                  type={showNew ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  placeholder="6 caractères minimum"
                  className={`${inputClass(
                    Boolean(errors.password),
                  )} pr-10`}
                />

                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <button
                  type="button"
                  onClick={() => setShowNew((value) => !value)}
                  aria-label={
                    showNew
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showNew ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="text-[11px] font-semibold text-rose-500">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirmation */}
            <div className="space-y-1.5">
              <label
                htmlFor="profile-confirm-password"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Confirmer le nouveau mot de passe
              </label>

              <div className="relative">
                <input
                  id="profile-confirm-password"
                  type={showNew ? "text" : "password"}
                  value={passwordConfirmation}
                  onChange={(event) =>
                    setPasswordConfirmation(event.target.value)
                  }
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={inputClass(
                    Boolean(errors.passwordConfirmation),
                  )}
                />

                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>

              {errors.passwordConfirmation && (
                <p className="text-[11px] font-semibold text-rose-500">
                  {errors.passwordConfirmation}
                </p>
              )}
            </div>
          </div>
        </form>

        {/* ---------------------------------------------------------------
            Pied de panneau
        ---------------------------------------------------------------- */}
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:px-8 dark:border-slate-800/80 dark:bg-[#0b132b]">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Annuler
          </button>

          <button
            type="submit"
            form="profile-edit-form"
            disabled={isSubmitting}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm shadow-violet-500/20 transition-all hover:bg-violet-700 hover:shadow-violet-500/30 active:bg-violet-800 disabled:opacity-50"
          >
            {isSubmitting && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            )}

            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
