import { Input } from "../../../ui/input/input";
import Button from "../../../ui/button/Button";
import { X } from "lucide-react";

interface AddVilleProps {
  isOpen: boolean;
  onClose: () => void;
}

function AddVille({ isOpen, onClose }: AddVilleProps) {
  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      <div 
        className={`fixed top-0 right-0 h-full w-96 bg-white dark:bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/[0.05]">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Créer une Ville</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
            <Input placeholder="Ex: Casablanca" className="dark:bg-slate-800 dark:border-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom du pays
            </label>
            <select className="flex h-11 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white transition-colors cursor-pointer" defaultValue="">
              <option value="" disabled>Sélectionner un pays</option>
              <option value="maroc">Maroc</option>
              <option value="france">France</option>
              <option value="espagne">Espagne</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Latitude</label>
            <Input type="number" placeholder="Ex: 33.5731" className="dark:bg-slate-800 dark:border-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Longitude</label>
            <Input type="number" placeholder="Ex: -7.5898" className="dark:bg-slate-800 dark:border-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Compteur Search</label>
            <Input type="number" placeholder="Ex: 0" className="dark:bg-slate-800 dark:border-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Compteur Publications</label>
            <Input type="number" placeholder="Ex: 0" className="dark:bg-slate-800 dark:border-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
            <select className="flex h-11 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white transition-colors cursor-pointer" defaultValue="1">
                <option value="1">Actif</option>
                <option value="0">Inactif</option>
            </select>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-white/[0.05] flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>Annuler</Button>
          <Button variant="primary" className="flex-1">Create Ville</Button>
        </div>
      </div>
    </>
  );
}

export default AddVille;
