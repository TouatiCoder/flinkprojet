import { useState, useEffect } from "react";
import { User, useGetUserEditQuery, useUpdateUserMutation } from "../../../services/usersApi";
import { Eye, X, Loader2 } from "lucide-react";
import UserPopUpVille from "./UserPopUpVille";

interface UserUpdateProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  villes?: { id: number; name: string }[];
}

export default function UserUpdate({ user, isOpen, onClose }: UserUpdateProps) {
  const [searchVille, setSearchVille] = useState("");
  const [selectedVilleLabel, setSelectedVilleLabel] = useState("");
  const [isVilleDropdownOpen, setIsVilleDropdownOpen] = useState(false);
  const [isVillePopUpOpen, setIsVillePopUpOpen] = useState(false);

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const userId = user?.id;
  const { data, isLoading } = useGetUserEditQuery(
    { id: userId!, search: searchVille },
    { skip: !isOpen || !userId }
  );

  const editData = data?.data;

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    selectedPhone: "",
    tele: "",
    ville_id: "",
    manager_users_id: "",
    password: "",
    is_verified: false,
    is_active: false,
    is_email_verified: false,
    is_telephone_verified: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateUser({
        id: user.id,
        data: {
          ...formData,
          manager_users_id: formData.manager_users_id ? Number(formData.manager_users_id) : null,
          ville_id: formData.ville_id ? Number(formData.ville_id) : null,
        },
      }).unwrap();

      onClose();
    } catch (error) {
      console.error("Erreur de mise à jour:", error);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      setSearchVille("");
      setSelectedVilleLabel(user.ville?.name || "");

      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        selectedPhone: user.tele || "",
        tele: user.tele || "",
        ville_id: user.ville?.id ? String(user.ville.id) : "",
        manager_users_id: user.manager_users_id ? String(user.manager_users_id) : "",
        password: "",
        is_verified: Boolean(user.is_verified),
        is_active: Boolean(Number(user.is_active)),
        is_email_verified: Boolean(Number(user.is_email_verified)) && Boolean(user.email),
        is_telephone_verified: Boolean(Number(user.is_telephone_verified)) && Boolean(user.tele),
      });
    }
  }, [isOpen, user?.id]);

  useEffect(() => {
    if (editData && String(editData.user?.id) === String(user?.id)) {
      const defaultPhone = editData.telephones?.[0] || user?.tele || "";

      const assignedManagerId =
        editData.managers && editData.managers.length > 0
          ? String(editData.managers[0].id)
          : editData.user?.manager_users_id
          ? String(editData.user.manager_users_id)
          : user?.manager_users_id
          ? String(user.manager_users_id)
          : "";

      const currentVilleId = editData.user?.ville_id || user?.ville?.id;
      const foundVille = editData.villes?.find((v: any) => String(v.id) === String(currentVilleId));

      if (foundVille) {
        setSelectedVilleLabel(foundVille.name);
      }

      setFormData((prev) => ({
        ...prev,
        first_name: editData.user?.first_name || prev.first_name,
        last_name: editData.user?.last_name || prev.last_name,
        email: editData.user?.email || prev.email,
        selectedPhone: prev.selectedPhone || defaultPhone,
        tele: prev.tele || defaultPhone,
        ville_id: prev.ville_id || (currentVilleId ? String(currentVilleId) : ""),
        manager_users_id: assignedManagerId || prev.manager_users_id,
        is_email_verified: prev.is_email_verified && Boolean(editData.user?.email || prev.email),
        is_telephone_verified: prev.is_telephone_verified && Boolean(prev.tele || defaultPhone),
      }));
    }
  }, [editData, user?.id]);

  if (!isOpen || !user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => {
        const nextState = { ...prev, [name]: value };

        if (name === "email" && !value.trim()) {
          nextState.is_email_verified = false;
        }
        if (name === "tele" && !value.trim()) {
          nextState.is_telephone_verified = false;
        }

        return nextState;
      });
    }
  };

  const handlePhoneSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedNum = e.target.value;
    setFormData((prev) => ({
      ...prev,
      selectedPhone: selectedNum,
      tele: selectedNum,
      is_telephone_verified: selectedNum ? prev.is_telephone_verified : false,
    }));
  };

  const handleToggle = (name: keyof typeof formData) => {
    if (name === "is_email_verified" && !formData.email.trim()) {
      return;
    }
    if (name === "is_telephone_verified" && !formData.tele.trim()) {
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const inputClass =
    "w-full text-xs font-medium border border-slate-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 bg-white dark:bg-gray-800/80 transition-all";
  const labelClass = "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

  const isEmailEmpty = !formData.email.trim();
  const isTeleEmpty = !formData.tele.trim();

  return (
    <>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          onClick={onClose}
        />

        <div className="relative w-full max-w-xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-gray-800 overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-gray-800 shrink-0 bg-slate-50/50 dark:bg-gray-900/50">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Modifier l'utilisateur
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                #{user.id} — {user.first_name} {user.last_name}
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

          {isLoading && !formData.first_name ? (
            <div className="flex items-center justify-center p-12 text-xs text-slate-400 gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Chargement des données...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Prénom</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Prénom"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Nom</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Nom"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="adresse@exemple.com"
                    />
                  </div>

                  <div className="relative">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Ville
                      </label>
                      <button
                        type="button"
                        className="p-1 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 rounded-lg transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsVillePopUpOpen(true);
                        }}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div
                      tabIndex={0}
                      onClick={() => setIsVilleDropdownOpen((prev) => !prev)}
                      className={`${inputClass} cursor-pointer flex items-center justify-between`}
                    >
                      <span className={formData.ville_id ? "text-slate-800 dark:text-slate-100" : "text-slate-400"}>
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
                            {editData?.villes?.map((ville: any) => (
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
                      {editData?.telephones && editData.telephones.length > 0 ? (
                        editData.telephones.map((phone: string, idx: number) => (
                          <option key={idx} value={phone}>
                            {phone}
                          </option>
                        ))
                      ) : (
                        <option value="">Aucun numéro</option>
                      )}
                    </select>

                    <input
                      type="text"
                      name="tele"
                      value={formData.tele}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Numéro de téléphone"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Commercial assigné</label>
                  <select
                    name="manager_users_id"
                    value={formData.manager_users_id}
                    onChange={handleChange}
                    className={`${inputClass} cursor-pointer`}
                  >
                    {/* <option value="">Sélectionner un commercial</option> */}
                    {editData?.all_managers?.map((mgr: any) => (
                      <option key={mgr.id} value={String(mgr.id)}>
                        👤 {mgr.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-gray-800 space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Statuts & Vérifications
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "is_active", label: "Actif", disabled: false },
                      { id: "is_verified", label: "Vérifié", disabled: false },
                      { 
                        id: "is_email_verified", 
                        label: "Email Vérifié", 
                        disabled: isEmailEmpty 
                      },
                      { 
                        id: "is_telephone_verified", 
                        label: "Téléphone Vérifié", 
                        disabled: isTeleEmpty 
                      },
                    ].map((toggle) => {
                      const isChecked = Boolean(formData[toggle.id as keyof typeof formData]);
                      const isDisabled = toggle.disabled;

                      return (
                        <div
                          key={toggle.id}
                          className={`flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-gray-800 transition-opacity ${
                            isDisabled ? "bg-slate-100/50 dark:bg-gray-800/20 opacity-60" : "bg-slate-50/50 dark:bg-gray-800/40"
                          }`}
                        >
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            {toggle.label}
                          </span>
                          <button
                            type="button"
                            disabled={isDisabled}
                            onClick={() => handleToggle(toggle.id as keyof typeof formData)}
                            title={
                              isDisabled
                                ? `Remplissez d'abord ${toggle.id.includes("email") ? "l'email" : "le téléphone"}`
                                : ""
                            }
                            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${
                              isDisabled
                                ? "cursor-not-allowed bg-slate-200 dark:bg-gray-700 opacity-50"
                                : isChecked
                                ? "cursor-pointer bg-blue-600"
                                : "cursor-pointer bg-slate-200 dark:bg-gray-700"
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                                isChecked ? "translate-x-4.5" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
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
                  <span>{isUpdating ? "Enregistrement..." : "Enregistrer les modifications"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <UserPopUpVille
        isOpen={isVillePopUpOpen}
        onClose={() => setIsVillePopUpOpen(false)}
        connexions={editData?.connexions}
      />
    </>
  );
}