import { useState } from "react";
import { StickyNote, Pin, Loader2, Bold, List } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  useGetProspectNotesQuery,
  useCreateProspectNoteMutation,
} from "../../../../services/ProspectApi";
import { ApiBaseUrl } from "../../../../constants/publicConstants";

interface SectionNotesProps {
  entity: any;
  type?: "user" | "prospect" | "etablissement";
}

export default function SectionNotes({
  entity,
  type = "prospect",
}: SectionNotesProps) {
  const isEtab = type === "etablissement";
  const isProspect = type === "prospect";

  const { data: notesData, isLoading: isNotesLoading } = useGetProspectNotesQuery(
    { id: entity?.id || "", type },
    { skip: !entity?.id }
  );

  const [createNote, { isLoading: isCreating }] = useCreateProspectNoteMutation();
  const [editorText, setEditorText] = useState("");

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class:
          "w-full text-xs sm:text-[13px] bg-transparent outline-none border-0 min-h-[26px] max-h-[160px] overflow-y-auto text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:ring-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 caret-amber-600 dark:caret-amber-400 [&_p]:m-0 [&_p]:leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      setEditorText(editor.getText().trim());
    },
  });

  const handleSaveNote = async () => {
    if (!editor || !editorText || !entity?.id || isCreating) return;

    const htmlContent = editor.getHTML();
    if (!htmlContent.trim() || htmlContent === "<p></p>") return;

    try {
      await createNote({
        id: entity.id,
        type: type,
        note: htmlContent,
      }).unwrap();

      editor.commands.clearContent();
      setEditorText("");
    } catch (error) {
      console.error("Erreur lors de l'ajout de la note:", error);
    }
  };

  const allNotes = (notesData?.data || []).slice(0, 5);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getAvatarUrl = (avatar?: string | null) => {
    if (!avatar) return null;
    if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
      return avatar;
    }
    try {
      const backendOrigin = new URL(ApiBaseUrl).origin;
      const cleanPath = avatar.startsWith("/") ? avatar : `/${avatar}`;
      return `${backendOrigin}${cleanPath}`;
    } catch {
      const cleanBase = ApiBaseUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");
      const cleanPath = avatar.startsWith("/") ? avatar : `/${avatar}`;
      return `${cleanBase}${cleanPath}`;
    }
  };

  return (
    <div className="border border-slate-200/80 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
      <div className="space-y-3 pb-5 border-b border-slate-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
            <StickyNote className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Ajouter une note
            </h4>
            <p className="text-[11px] text-slate-400 font-medium">
              Note visible dans l'historique{" "}
              {isProspect
                ? "du prospect"
                : isEtab
                ? "de l'établissement"
                : "de l'utilisateur"}
            </p>
          </div>
        </div>

        <div
          onClick={() => editor?.commands.focus()}
          className="rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus-within:border-amber-500/60 focus-within:ring-2 focus-within:ring-amber-500/10 transition-all overflow-hidden cursor-text shadow-xs"
        >
          <div className="flex items-center gap-1 px-2.5 py-1.5 border-b border-slate-100 dark:border-gray-800 bg-slate-50/70 dark:bg-gray-800/40 text-slate-500">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                editor?.chain().focus().toggleBold().run();
              }}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                editor?.isActive("bold")
                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold"
                  : "hover:bg-slate-200/60 dark:hover:bg-gray-700"
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
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                editor?.isActive("bulletList")
                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold"
                  : "hover:bg-slate-200/60 dark:hover:bg-gray-700"
              }`}
              title="Liste à puces"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-2.5">
            <EditorContent editor={editor} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-1">
          {editorText && (
            <button
              type="button"
              onClick={() => {
                editor?.commands.clearContent();
                setEditorText("");
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Annuler
            </button>
          )}
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

      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-gray-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
            <StickyNote className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Notes récentes {allNotes.length > 0 && `(${allNotes.length})`}
          </h3>
        </div>
      </div>

      {isNotesLoading ? (
        <div className="flex items-center gap-2 text-slate-400 py-3 text-xs">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Chargement des notes...</span>
        </div>
      ) : allNotes.length === 0 ? (
        <p className="text-xs text-slate-400 italic">
          Aucune note ajoutée pour le moment.
        </p>
      ) : (
        <div className="space-y-3">
          {allNotes.map((item: any, index: number) => {
            const isPinned = index === 0;
            const authorName = item.author?.name || "Commercial";
            const avatarSrc = getAvatarUrl(item.author?.avatar);

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isPinned
                    ? "bg-[#FEF9E7] border-[#F9E79F]/80 dark:bg-amber-950/20 dark:border-amber-900/40 text-slate-800 dark:text-amber-100"
                    : "bg-[#F0F5FF] border-[#D6E4FF]/80 dark:bg-blue-950/20 dark:border-blue-900/40 text-slate-800 dark:text-blue-100"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-[9px]">
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          alt={authorName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        authorName.slice(0, 2).toUpperCase()
                      )}
                    </div>

                    <div className="text-[11.5px] text-slate-500 dark:text-slate-400 font-medium truncate">
                      <span>{formatDate(item.created_at)}</span>
                      <span className="mx-1 text-slate-400">par</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {authorName}
                      </span>
                    </div>
                  </div>

                  {isPinned && (
                    <Pin className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 fill-amber-700/20 rotate-45 shrink-0" />
                  )}
                </div>

                <div
                  className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 pl-8 font-normal [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-bold [&_p]:mb-1"
                  dangerouslySetInnerHTML={{ __html: item.note }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}