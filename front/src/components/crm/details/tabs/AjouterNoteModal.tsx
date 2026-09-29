import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCreateProspectNoteMutation } from "../../../../services/ProspectApi";
import { StickyNote, X, Loader2, Bold, List } from "lucide-react";

interface AjouterNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  prospectId: number | string;
  onSuccess?: () => void;
}

export default function AjouterNoteModal({
  isOpen,
  onClose,
  prospectId,
  onSuccess,
}: AjouterNoteModalProps) {
  const [createNote, { isLoading: isCreating }] = useCreateProspectNoteMutation();
  const [editorText, setEditorText] = useState("");

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class:
          "w-full text-xs sm:text-[13px] bg-transparent outline-none border-0 min-h-[100px] max-h-[220px] overflow-y-auto text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:ring-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
      },
    },
    onUpdate: ({ editor }) => {
      setEditorText(editor.getText().trim());
    },
  });

  if (!isOpen) return null;

  const handleSaveNote = async () => {
    if (!editor || !editorText || !prospectId || isCreating) return;

    const htmlContent = editor.getHTML();
    if (!htmlContent.trim() || htmlContent === "<p></p>") return;

    try {
      await createNote({
        id: prospectId,
        note: htmlContent,
      }).unwrap();

      editor.commands.clearContent();
      setEditorText("");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'ajout de la note:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-gray-800 rounded-3xl w-full max-w-lg p-5 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
              <StickyNote className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Ajouter une note
              </h4>
              <p className="text-[11px] text-slate-400 font-medium">
                Note visible dans l'historique du prospect
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50 focus-within:border-amber-500/60 transition-all">
          <EditorContent editor={editor} />
          <div className="flex items-center gap-1 pt-2.5 mt-2.5 border-t border-slate-200/60 dark:border-gray-800 text-slate-500">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                editor?.chain().focus().toggleBold().run();
              }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${editor?.isActive("bold")
                  ? "bg-amber-100/70 dark:bg-amber-950/60 text-amber-700 font-bold"
                  : "hover:bg-slate-200/50 dark:hover:bg-slate-800"
                }`}
              title="Gras"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                editor?.chain().focus().toggleBulletList().run();
              }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${editor?.isActive("bulletList")
                  ? "bg-amber-100/70 dark:bg-amber-950/60 text-amber-700 font-bold"
                  : "hover:bg-slate-200/50 dark:hover:bg-slate-800"
                }`}
              title="Liste à puces"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSaveNote}
            disabled={!editorText || isCreating}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            {isCreating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Enregistrer la note</span>
          </button>
        </div>
      </div>
    </div>
  );
}