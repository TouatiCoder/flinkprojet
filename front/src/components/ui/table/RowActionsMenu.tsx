import React, { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";

export interface RowAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  /** Couleur de survol, pour distinguer les actions entre elles. */
  hoverClass?: string;
}

interface RowActionsMenuProps {
  actions: RowAction[];
  /** Décrit la ligne concernée, ex. « Actions pour l'équipe demo ». */
  ariaLabel: string;
}

/**
 * Menu « Actions » d'une ligne de tableau.
 *
 * Les tableaux sont dans un conteneur `overflow-x-auto` : un menu en position
 * absolue y serait rogné. Il est donc rendu en `fixed`, positionné à partir du
 * rectangle réel du bouton, et refermé au scroll / resize puisque cette
 * position ne suit pas la page.
 *
 * Le composant stoppe la propagation du clic : il reste utilisable dans une
 * ligne elle-même cliquable sans déclencher l'action de la ligne.
 */
export default function RowActionsMenu({ actions, ariaLabel }: RowActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; right: number } | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }

      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const close = () => setIsOpen(false);

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [isOpen]);

  const toggle = (event: React.MouseEvent) => {
    // La ligne parente est cliquable : sans cela, ouvrir le menu déclencherait
    // aussi son action.
    event.stopPropagation();

    if (isOpen) {
      setIsOpen(false);
      return;
    }

    const rect = buttonRef.current?.getBoundingClientRect();

    if (rect) {
      setPosition({
        top: rect.bottom + 6,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    }

    setIsOpen(true);
  };

  const runAction = (event: React.MouseEvent, action: () => void) => {
    event.stopPropagation();
    setIsOpen(false);
    action();
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && position && (
        <div
          ref={menuRef}
          role="menu"
          style={{ top: position.top, right: position.right }}
          className="fixed z-[99999] w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-left shadow-lg dark:border-slate-800 dark:bg-[#0b1526]"
        >
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              role="menuitem"
              onClick={(event) => runAction(event, action.onClick)}
              className={`flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60 ${
                action.hoverClass ?? "hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
