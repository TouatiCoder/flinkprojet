import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home, Lock } from "lucide-react";

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="h-full min-h-[calc(100vh-130px)] w-full overflow-hidden bg-[#F7F8FB] rounded-2xl border border-white dark:border-gray-800 dark:bg-gray-900 flex items-center justify-center px-4 font-sans relative">
      <div
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[300px] opacity-60 blur-[90px]"
        style={{ background: "radial-gradient(ellipse, #DCE3F5 0%, transparent 70%)" }}
      />

      <div className="relative w-full max-w-[400px]">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(30,41,59,0.08)] overflow-hidden">

          <div
            className="h-[6px] w-full"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, #1E293B 0px, #1E293B 8px, #E9A23B 8px, #E9A23B 16px)",
            }}
          />

          <div className="px-7 py-8 text-center space-y-5">

            <div className="relative flex items-center justify-center w-16 h-16 mx-auto rounded-2xl bg-slate-50 border border-slate-200">
              <ShieldAlert className="w-7 h-7 text-[#1E293B] stroke-[1.75]" />
              <div className="absolute -bottom-1.5 -right-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-[#E9A23B] border-2 border-white">
                <Lock className="w-3 h-3 text-white" strokeWidth={2.5} />
              </div>
            </div>

            <div className="space-y-2">
              <span className="inline-block text-[10px] font-semibold tracking-[0.18em] text-[#B27219] uppercase">
                Erreur 403 — Accès restreint
              </span>
              <h1 className="text-xl md:text-[22px] font-bold text-[#1E293B] tracking-tight leading-snug">
                Vous n'avez pas accès à cette page
              </h1>
              <p className="text-[13px] text-slate-500 leading-relaxed max-w-[280px] mx-auto">
                Cette zone est réservée. Contactez votre administrateur si vous pensez qu'il s'agit d'une erreur.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
              <button
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-medium text-sm hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </button>

              <Link
                to="/"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#1E293B] hover:bg-[#0F172A] text-white font-semibold text-sm transition-colors shadow-md shadow-slate-900/10 flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Page d'accueil
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-4 tracking-wide">
          Code d'erreur : 403 · Forbidden
        </p>
      </div>
    </div>
  );
}