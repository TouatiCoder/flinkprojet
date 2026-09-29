import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Building2,
  Zap,
  Heart,
  Info,
  Bell,
  FileText,
  Tag,
} from "lucide-react";

const Field = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={
      "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 transition bg-white dark:bg-gray-800 " +
      (props.className ?? "")
    }
  />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className={
      "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 transition bg-white dark:bg-gray-800 cursor-pointer " +
      (props.className ?? "")
    }
  />
);

const SectionTitle = ({
  icon: Icon,
  label,
  color = "text-blue-500 dark:text-blue-400",
  bg = "bg-blue-50 dark:bg-blue-900/30",
}: {
  icon: React.ElementType;
  label: string;
  color?: string;
  bg?: string;
}) => (
  <div className="flex items-center gap-2 mb-3">
    <span className={`p-1.5 rounded-lg ${bg}`}>
      <Icon className={`w-3.5 h-3.5 ${color}`} />
    </span>
    <span className="text-[12px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
      {label}
    </span>
  </div>
);

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SERVICES = [
  { key: "compte_pro", label: "Compte Pro" },
  { key: "pub_ads", label: "Publicite (Ads)" },
  { key: "boost", label: "Boost d annonces" },
  { key: "catalogue", label: "Catalogue CSV" },
  { key: "videos", label: "Videos automatiques" },
  { key: "autre", label: "Autre" },
];

const FOURCHETTES = [
  "Selectionner une fourchette",
  "1-5",
  "5-20",
  "20-50",
  "50-200",
  "+200",
];

export default function FormAjoutProspect({ isOpen, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const [services, setServices] = useState<Record<string, boolean>>({
    compte_pro: true,
  });

  const toggleService = (key: string) =>
    setServices((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/20 z-[90] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 right-0 top-[77px] z-[100] w-full max-w-[820px] bg-white dark:bg-gray-900 shadow-[-4px_0_24px_rgba(0,0,0,0.08)] flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex-none">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Ajouter un prospect</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
              <SectionTitle icon={User} label="Informations du contact" color="text-blue-500 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-900/30" />
              <Field label="Nom complet" required>
                <Input placeholder="Ex: Yassine Amrani" />
              </Field>
              <Field label="Telephone" required>
                <div className="flex gap-2">
                  <Input placeholder="6 12 34 56 78" />
                </div>
              </Field>
              <Field label="Prix">
                <div className="flex gap-2">
                  <Input placeholder="2000 MAD" />
                </div>
              </Field>
              <Field label="Email">
                <Input type="email" placeholder="exemple@email.com" />
              </Field>
              <Field label="Fonction">
                <Input placeholder="Ex: Responsable Marketing" />
              </Field>
            </div>

            <div className="col-span-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
              <SectionTitle icon={Building2} label="Informations societe" color="text-violet-500 dark:text-violet-400" bg="bg-violet-50 dark:bg-violet-900/30" />
              <Field label="Nom de la societe" required>
                <Input placeholder="Ex: Auto Atlas" />
              </Field>
              <Field label="Secteur activite" required>
                <Select>
                  <option value="">Selectionner un secteur</option>
                  <option>Auto</option>
                  <option>Immobilier</option>
                  <option>BTP</option>
                  <option>Commerce</option>
                  <option>Services</option>
                </Select>
              </Field>
              <Field label="Status" required>
                <Select>
                  <option value="">Selectionner un status</option>
                  <option>Chaud</option>
                  <option>Froid</option>
                  <option>Fieve</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </Select>
              </Field>
              <Field label="Ville / Region">
                <Select>
                  <option value="">Selectionner une ville</option>
                  <option>Casablanca</option>
                  <option>Rabat</option>
                  <option>Tanger</option>
                  <option>Marrakech</option>
                </Select>
              </Field>
              <Field label="Site web">
                <Input placeholder="www.exemple.com" />
              </Field>
            </div>

            <div className="col-span-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
              <SectionTitle icon={Zap} label="Source du prospect" color="text-amber-500 dark:text-amber-400" bg="bg-amber-50 dark:bg-amber-900/30" />
              <Field label="Source principale" required>
                <Select>
                  <option value="">Selectionner une source</option>
                  <option>Facebook Ads</option>
                  <option>Instagram Ads</option>
                  <option>WhatsApp</option>
                  <option>Reference</option>
                  <option>LinkedIn</option>
                  <option>Email</option>
                  <option>Salon Pro</option>
                </Select>
              </Field>
              {/* <Field label="Detail de la source">
                <Input placeholder="Ex: Campagne Facebook - Juin 2026" />
              </Field> */}
              {/* <Field label="Date de creation" required>
                <div className="flex gap-2">
                  <Input type="date" className="flex-1" />
                </div>
              </Field> */}
              <Field label="Commercial assigne" required>
                <Select>
                  <option>Youssef Admin</option>
                  <option>Mohammed</option>
                  <option>Sara</option>
                </Select>
              </Field>
              <Field label="Origine Flink (facultatif)">
                <Select>
                  <option value="">Selectionner une origine</option>
                  <option>Organique</option>
                  <option>Partenaire</option>
                  <option>Interne</option>
                </Select>
              </Field>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
              <SectionTitle icon={Heart} label="Interet et besoin" color="text-rose-500 dark:text-rose-400" bg="bg-rose-50 dark:bg-rose-900/30" />
              <div>
                <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Produit / Service recherche
                </p>
                <div className="space-y-1.5">
                  {SERVICES.map((s) => (
                    <label key={s.key} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!services[s.key]}
                        onChange={() => toggleService(s.key)}
                        className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
                      />
                      {s.label}
                    </label>
                  ))}
                </div>
              </div>
              <Field label="Nombre annonces prevu">
                <Select>
                  {FOURCHETTES.map((f) => (<option key={f}>{f}</option>))}
                </Select>
              </Field>
              <Field label="Budget estime">
                <Select>
                  {FOURCHETTES.map((f) => (<option key={f}>{f}</option>))}
                </Select>
              </Field>
              <Field label="Commentaire sur le besoin">
                <textarea
                  rows={3}
                  placeholder="Decrivez le besoin du prospect..."
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 transition bg-white dark:bg-gray-800 resize-none"
                />
              </Field>
            </div>

            <div className="col-span-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
              <SectionTitle icon={Info} label="Informations complementaires" color="text-cyan-500 dark:text-cyan-400" bg="bg-cyan-50 dark:bg-cyan-900/30" />
              <Field label="Taille entreprise">
                <Select>
                  <option value="">Selectionner la taille</option>
                  <option>TPE (1-9)</option>
                  <option>PME (10-249)</option>
                  <option>Grande entreprise (250+)</option>
                </Select>
              </Field>
              <Field label="Chiffre affaires (estimation)">
                <Select>
                  {FOURCHETTES.map((f) => (<option key={f}>{f}</option>))}
                </Select>
              </Field>
              <Field label="Nombre employes">
                <Select>
                  {FOURCHETTES.map((f) => (<option key={f}>{f}</option>))}
                </Select>
              </Field>
              <Field label="Experience marketplace / pub">
                <Select>
                  <option value="">Selectionner</option>
                  <option>Debutant</option>
                  <option>Intermediaire</option>
                  <option>Avance</option>
                </Select>
              </Field>
            </div>

            <div className="col-span-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
              <SectionTitle icon={FileText} label="Notes internes" color="text-indigo-500 dark:text-indigo-400" bg="bg-indigo-50 dark:bg-indigo-900/30" />
              <Field label="Note interne">
                <textarea
                  rows={4}
                  placeholder="Notes visibles uniquement par l equipe..."
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 transition bg-white dark:bg-gray-800 resize-none"
                />
              </Field>
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-white dark:bg-gray-800 space-y-2">
                <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Bell className="w-3 h-3 text-amber-400" />
                  Prochaine action
                </p>
                <Field label="Date">
                  <div className="flex gap-2">
                    <Input type="date" className="flex-1" />
                  </div>
                </Field>
                <Field label="Action prevue">
                  <Select>
                    <option>Appel telephonique</option>
                    <option>Reunion</option>
                    <option>Email de suivi</option>
                    <option>Demo</option>
                  </Select>
                </Field>
                <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer mt-1">
                  <input type="checkbox" className="w-3.5 h-3.5 accent-blue-600 cursor-pointer" />
                  Ajouter une tache de relance
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl p-4 flex items-start gap-4">
              <div className="text-center flex-none">
                <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide">Score potentiel (auto)</p>
                <p className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-1">
                  -- <span className="text-sm font-semibold">/100</span>
                </p>
              </div>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 leading-relaxed mt-1">
                Le score sera calcule automatiquement apres les premieres interactions et selon les donnees Flink disponibles.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
              <SectionTitle icon={Tag} label="Tags" color="text-green-500 dark:text-green-400" bg="bg-green-50 dark:bg-green-900/30" />
              <div className="flex flex-wrap gap-2 min-h-[36px] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800">
                <Input
                  placeholder="Ajouter un tag..."
                  className="flex-1 border-none shadow-none focus:ring-0 p-0 min-w-[100px] text-sm !bg-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex-none bg-white dark:bg-gray-900">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
          >
            Annuler
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-[#1a66ff] text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm transition-colors cursor-pointer">
            Enregistrer le prospect
          </button>
        </div>
      </aside>
    </>
  );
}