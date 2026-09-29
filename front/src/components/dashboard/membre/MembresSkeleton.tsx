// Skeleton loaders pour la page Membres, même logique que PaymentsSkeleton
// (pulse animation + structure qui matche les vraies cards/table)

const shimmer = "animate-pulse bg-slate-200 dark:bg-slate-700 rounded";

// -----------------------------------------------------------------------
// Skeleton pour les cartes stats (MembreCards)
// -----------------------------------------------------------------------
export function MembreCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070e1b] p-4 space-y-3 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className={`h-3 w-20 ${shimmer}`} />
            <div className={`h-8 w-8 ${shimmer} rounded-lg`} />
          </div>
          <div className={`h-6 w-16 ${shimmer}`} />
          <div className={`h-2 w-24 ${shimmer}`} />
        </div>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------
// Skeleton pour le tableau (MembresTable)
// -----------------------------------------------------------------------
export function MembresTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070e1b] shadow-xs overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <div className={`h-4 w-40 ${shimmer}`} />
        <div className={`h-9 w-28 ${shimmer} rounded-xl`} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-[#091322]/40">
              {Array.from({ length: 14 }).map((_, i) => (
                <th key={i} className="py-3.5 px-4">
                  <div className={`h-3 w-16 ${shimmer}`} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr key={rowIdx}>
                {/* Utilisateur (avatar + nom + email) */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${shimmer}`} />
                    <div className="space-y-1.5">
                      <div className={`h-3 w-24 ${shimmer}`} />
                      <div className={`h-2.5 w-32 ${shimmer}`} />
                    </div>
                  </div>
                </td>
                {/* Rôle */}
                <td className="py-3.5 px-4">
                  <div className={`h-5 w-16 ${shimmer} rounded-lg`} />
                </td>
                {/* Équipe principale */}
                <td className="py-3.5 px-4">
                  <div className={`h-5 w-24 ${shimmer} rounded-lg`} />
                </td>
                {/* Responsable */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full ${shimmer}`} />
                    <div className={`h-3 w-16 ${shimmer}`} />
                  </div>
                </td>
                {/* Équipes accessibles */}
                <td className="py-3.5 px-4">
                  <div className={`h-5 w-20 ${shimmer} rounded-lg`} />
                </td>
                {/* Secteurs */}
                <td className="py-3.5 px-4">
                  <div className={`h-3 w-20 ${shimmer}`} />
                </td>
                {/* Leads actifs / Max */}
                <td className="py-3.5 px-4">
                  <div className="space-y-1.5">
                    <div className={`h-3 w-14 ${shimmer}`} />
                    <div className={`h-1.5 w-24 ${shimmer} rounded-full`} />
                  </div>
                </td>
                {/* Capacité */}
                <td className="py-3.5 px-4">
                  <div className={`h-3 w-8 ${shimmer}`} />
                </td>
                {/* Devenir User */}
                <td className="py-3.5 px-4">
                  <div className="space-y-1.5">
                    <div className={`h-3 w-20 ${shimmer}`} />
                    <div className={`h-1.5 w-24 ${shimmer} rounded-full`} />
                  </div>
                </td>
                {/* Compte Pro */}
                <td className="py-3.5 px-4">
                  <div className="space-y-1.5">
                    <div className={`h-3 w-20 ${shimmer}`} />
                    <div className={`h-1.5 w-24 ${shimmer} rounded-full`} />
                  </div>
                </td>
                {/* Solde Ads */}
                <td className="py-3.5 px-4">
                  <div className="space-y-1.5">
                    <div className={`h-3 w-20 ${shimmer}`} />
                    <div className={`h-1.5 w-24 ${shimmer} rounded-full`} />
                  </div>
                </td>
                {/* Retards */}
                <td className="py-3.5 px-4 text-center">
                  <div className={`h-3 w-4 ${shimmer} mx-auto`} />
                </td>
                {/* Statut */}
                <td className="py-3.5 px-4 text-center">
                  <div className={`h-5 w-14 ${shimmer} rounded-full mx-auto`} />
                </td>
                {/* Actions */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center justify-center gap-1.5">
                    <div className={`h-7 w-7 ${shimmer} rounded-lg`} />
                    <div className={`h-7 w-7 ${shimmer} rounded-lg`} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 dark:border-slate-800/60">
        <div className={`h-3 w-48 ${shimmer}`} />
        <div className={`h-8 w-32 ${shimmer} rounded-lg`} />
      </div>
    </div>
  );
}