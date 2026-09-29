import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  useGetProspectNotesQuery,
  useCreateProspectNoteMutation,
} from "../../../../services/ProspectApi";
import { ApiBaseUrl } from "../../../../constants/publicConstants";
import {
  Pin,
  MoreVertical,
  Loader2,
  Bold,
  List,
} from "lucide-react";

interface TabNotesProps {
  prospectId?: number | string;
  type?: "prospect" | "user" | "etablissement";
}

export default function TabNotes({ prospectId, type = "prospect" }: TabNotesProps) {
  const { data, isLoading, isError } = useGetProspectNotesQuery(
    { id: prospectId || "", type },
    { skip: !prospectId }
  );

  const [createNote, { isLoading: isCreating }] = useCreateProspectNoteMutation();
  const [editorText, setEditorText] = useState("");

  const notes = data?.data || [];

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class:
          "w-full text-xs sm:text-[13px] bg-transparent outline-none border-0 min-h-[75px] max-h-[220px] overflow-y-auto text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:ring-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
      },
    },
    onUpdate: ({ editor }) => {
      setEditorText(editor.getText().trim());
    },
  });

  const handleSaveNote = async () => {
    if (!editor || !editorText || !prospectId || isCreating) return;

    const htmlContent = editor.getHTML();
    if (!htmlContent.trim() || htmlContent === "<p></p>") return;

    try {
      await createNote({
        id: prospectId,
        type: type,
        note: htmlContent,
      }).unwrap();

      editor.commands.clearContent();
      setEditorText("");
    } catch (error) {
      console.error("Erreur lors de l'ajout de la note:", error);
    }
  };

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
    <div className="space-y-4 max-w-3xl">
      <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070e1b] shadow-xs focus-within:border-blue-500/60 transition-colors">
        <EditorContent editor={editor} />

        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                editor?.chain().focus().toggleBold().run();
              }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                editor?.isActive("bold")
                  ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}
              title="Gras (Ctrl+B)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                editor?.chain().focus().toggleBulletList().run();
              }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                editor?.isActive("bulletList")
                  ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}
              title="Liste à puces"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveNote}
            disabled={!editorText || isCreating}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Enregistrement...</span>
              </>
            ) : (
              <span>Enregistrer</span>
            )}
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center p-12 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Chargement des notes...</span>
        </div>
      )}

      {isError && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 text-xs font-semibold">
          Erreur lors de la récupération des notes.
        </div>
      )}

      {!isLoading && !isError && notes.length === 0 && (
        <div className="text-center py-10 text-xs text-slate-400">
          Aucune note enregistrée pour cet enregistrement.
        </div>
      )}

      {!isLoading && notes.length > 0 && (
        <div className="space-y-3.5">
          {notes.map((item: any, index: number) => {
            const isPinned = index === 0;
            const authorName = item.author?.name || "Commercial";
            const avatarSrc = getAvatarUrl(item.author?.avatar);

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isPinned
                    ? "bg-[#FEF9E7] border-[#F9E79F]/80 dark:bg-amber-950/20 dark:border-amber-900/40 text-slate-800 dark:text-amber-100"
                    : "bg-[#F0F5FF] border-[#D6E4FF]/80 dark:bg-blue-950/20 dark:border-blue-900/40 text-slate-800 dark:text-blue-100"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-[10px]">
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

                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                      <span>{formatDate(item.created_at)}</span>
                      <span className="mx-1.5 text-slate-400">par</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {authorName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400 shrink-0">
                    {isPinned && (
                      <Pin className="w-4 h-4 text-amber-700 dark:text-amber-400 fill-amber-700/20 rotate-45" />
                    )}
                    <button
                      type="button"
                      className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </div>

                <div
                  className="text-xs sm:text-[13px] leading-relaxed font-normal text-slate-800 dark:text-slate-200 pl-9 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-bold [&_p]:mb-1"
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