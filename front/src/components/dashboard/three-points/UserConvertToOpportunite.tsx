import React, { useState } from 'react';
import { Target, Building2, Megaphone, X, Check, Loader2, AlertCircle } from 'lucide-react';
import { User } from '../../../services/usersApi';
import { useConvertUserMutation } from '../../../services/ConvertUserAndEtab';

interface UserConvertToOpportuniteProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess?: () => void;
}

const UserConvertToOpportunite: React.FC<UserConvertToOpportuniteProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>(['solde_ads']);
  const soldeComptePro = 1000;
  const [soldeAds, setSoldeAds] = useState<number | string>(5000);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [convertUser, { isLoading }] = useConvertUserMutation();

  if (!isOpen || !user) return null;

  const handleToggleObjective = (type: 'compte_pro' | 'solde_ads') => {
    setSelectedObjectives((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const isCompteProSelected = selectedObjectives.includes('compte_pro');
  const isSoldeAdsSelected = selectedObjectives.includes('solde_ads');

  const handleSubmit = async () => {
    if (selectedObjectives.length === 0) return;
    setErrorMsg(null);

    try {
      await convertUser({
        user_id: Number(user.id),
        objectives: selectedObjectives,
        solde_compte_pro: isCompteProSelected ? soldeComptePro : null,
        solde_ads: isSoldeAdsSelected ? Number(soldeAds) : null,
      }).unwrap();

      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.data?.message || 'Une erreur est survenue lors de la conversion.');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative max-h-[92vh] flex flex-col animate-in fade-in zoom-in duration-200">
        
        <button 
          onClick={onClose}
          className="absolute top-3.5 right-3.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-1 z-10 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950/50 text-[#5C24E8] rounded-full flex items-center justify-center mb-2">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
              Créer une opportunité
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Pour : <span className="font-semibold text-slate-700 dark:text-slate-300">{user.first_name} {user.last_name}</span>
            </p>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">
              Objectif commercial (Choix multiple)
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              
              <div 
                onClick={() => handleToggleObjective('compte_pro')}
                className={`relative p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between select-none ${
                  isCompteProSelected 
                    ? 'border-[#5C24E8] bg-purple-50/20 shadow-xs' 
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="absolute top-2 right-2">
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                    isCompteProSelected
                      ? 'bg-[#5C24E8] border-[#5C24E8] text-white'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                  }`}>
                    {isCompteProSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
                
                <div className="flex flex-col items-center text-center mt-1">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center mb-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600">
                    <Building2 className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white">Compte Pro</h3>
                  <p className="text-[10px] leading-tight text-gray-400 mt-0.5">Activer un Compte Pro.</p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800 text-center">
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                    1 000 DH (Fixe)
                  </span>
                </div>
              </div>

              <div 
                onClick={() => handleToggleObjective('solde_ads')}
                className={`relative p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between select-none ${
                  isSoldeAdsSelected 
                    ? 'border-pink-300 bg-pink-50/20 shadow-xs' 
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="absolute top-2 right-2">
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                    isSoldeAdsSelected
                      ? 'bg-[#E60067] border-[#E60067] text-white'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                  }`}>
                    {isSoldeAdsSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
                
                <div className="flex flex-col items-center text-center mt-1">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center mb-1.5 bg-red-50 dark:bg-red-950/50 text-red-600">
                    <Megaphone className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white">Solde Ads</h3>
                  <p className="text-[10px] leading-tight text-gray-400 mt-0.5">Achat de Solde Ads.</p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800 text-center">
                  <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                    Montant variable
                  </span>
                </div>
              </div>

            </div>
          </div>

          {isSoldeAdsSelected && (
            <div className="p-3 bg-slate-50 dark:bg-gray-800/60 border border-slate-200/80 dark:border-gray-700 rounded-xl space-y-1.5 animate-in fade-in duration-150">
              <label className="block text-xs font-semibold text-gray-900 dark:text-gray-200">
                Montant Solde Ads (DH)
              </label>
              <div className="relative">
                <input 
                  type="number"
                  min={0}
                  step={500}
                  value={soldeAds}
                  onChange={(e) => setSoldeAds(e.target.value)}
                  placeholder="5000"
                  className="w-full pl-3 pr-14 py-2 text-xs border border-purple-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5C24E8] text-gray-900 dark:text-white font-semibold transition-all bg-white dark:bg-gray-800"
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <span className="px-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-l border-purple-200 dark:border-gray-700 rounded-r-xl font-semibold text-xs h-full flex items-center">
                    DH
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        <div className="px-5 py-3.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2.5 bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 text-xs transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button 
            type="button"
            disabled={selectedObjectives.length === 0 || isLoading}
            className="flex-1 px-4 py-2 bg-[#5C24E8] hover:bg-[#4a1dc2] text-white font-semibold rounded-xl text-xs transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
            onClick={handleSubmit}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Création en cours...</span>
              </>
            ) : (
              <span>Créer l'opportunité</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserConvertToOpportunite;