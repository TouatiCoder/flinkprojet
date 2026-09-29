import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { AlertTriangle } from "lucide-react";
import { Modal } from "../../components/ui/modal";
import WhatsappHeader from "../../components/dashboard/Whatsapp/WhatsappHeader";
import WhatsappFilter from "../../components/dashboard/Whatsapp/WhatsappFilter";
import WhatsappCards from "../../components/dashboard/Whatsapp/WhatsappCards";
import WhatsappTable, {
  type WhatsappSort,
} from "../../components/dashboard/Whatsapp/WhatsappTable";
import WhatsappTemplateForm from "../../components/dashboard/Whatsapp/WhatsappTemplateForm";
import WhatsappTemplatePreview from "../../components/dashboard/Whatsapp/WhatsappTemplatePreview";
import {
  compterTemplates,
  FILTRES_PAR_DEFAUT,
  type WhatsappFilterValues,
  type WhatsappTemplate,
  type WhatsappTemplatePayload,
} from "../../components/dashboard/Whatsapp/whatsappTypes";
import {
  useCreateWhatsappTemplateMutation,
  useDeleteWhatsappTemplateMutation,
  useGetWhatsappCreateDataQuery,
  useGetWhatsappTemplatesQuery,
  useUpdateWhatsappTemplateMutation,
} from "../../services/whatsappApi";

const PER_PAGE = 10;

/** « relance_pro » -> « relance_pro_copie », puis « _copie_2 », etc. */
function nomUnique(base: string, existants: string[]): string {
  let candidat = `${base}_copie`;
  let suffixe = 2;

  while (existants.includes(candidat)) {
    candidat = `${base}_copie_${suffixe}`;
    suffixe += 1;
  }

  return candidat;
}

/** Message d'erreur exploitable, qu'il vienne d'une 422 ou d'une 500. */
function messageErreur(err: unknown, repli: string): string {
  const data = (err as { data?: { errors?: Record<string, string[]>; message?: string } })?.data;

  if (data?.errors) {
    const premier = Object.values(data.errors)[0];
    if (Array.isArray(premier) && premier[0]) {
      return premier[0];
    }
  }

  return data?.message ?? repli;
}

function WhatsappTemplates() {
  const [filters, setFilters] = useState<WhatsappFilterValues>(FILTRES_PAR_DEFAUT);
  const [sort, setSort] = useState<WhatsappSort>({ key: "updated_at", direction: "desc" });
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Panneau de création / modification. `formTemplate === null` = création.
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formTemplate, setFormTemplate] = useState<WhatsappTemplate | null>(null);

  // Panneau d'aperçu : `isPreviewOpen` est distinct du template affiché pour
  // que le contenu reste visible pendant l'animation de fermeture.
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<WhatsappTemplate | null>(null);

  const [templateASupprimer, setTemplateASupprimer] = useState<WhatsappTemplate | null>(null);

  // ---------------------------------------------------------------------------
  // Données — tout vient de l'API, aucune liste locale.
  //
  // La liste complète est chargée en une fois : recherche, filtres, tri et
  // pagination se font côté front, comme sur les pages Membres et Équipes.
  // ---------------------------------------------------------------------------
  const { data: reponse, isLoading, isFetching } = useGetWhatsappTemplatesQuery();
  const { data: createData } = useGetWhatsappCreateDataQuery();

  const [creerTemplate, { isLoading: isCreating }] = useCreateWhatsappTemplateMutation();
  const [modifierTemplate, { isLoading: isUpdating }] = useUpdateWhatsappTemplateMutation();
  const [supprimerTemplate] = useDeleteWhatsappTemplateMutation();

  const templates = useMemo<WhatsappTemplate[]>(() => reponse?.data ?? [], [reponse]);
  const types = createData?.data?.types ?? [];

  // Les cartes comptent sur la liste complète : ce sont des totaux, pas le
  // reflet du filtre courant.
  const counts = useMemo(() => compterTemplates(templates), [templates]);

  // ---------------------------------------------------------------------------
  // Filtrage
  // ---------------------------------------------------------------------------
  const templatesFiltres = useMemo(() => {
    const recherche = filters.search.trim().toLowerCase();

    return templates.filter((template) => {
      if (
        recherche &&
        !template.nom.toLowerCase().includes(recherche) &&
        !(template.description ?? "").toLowerCase().includes(recherche)
      ) {
        return false;
      }

      if (filters.audience !== "tous" && !template.audiences.includes(filters.audience as never)) {
        return false;
      }

      if (filters.usage !== "tous" && template.usage !== filters.usage) {
        return false;
      }

      if (filters.langue !== "toutes" && template.langue !== filters.langue) {
        return false;
      }

      if (filters.statut !== "tous" && template.statut !== filters.statut) {
        return false;
      }

      return true;
    });
  }, [templates, filters]);

  // ---------------------------------------------------------------------------
  // Tri
  // ---------------------------------------------------------------------------
  const templatesTries = useMemo(() => {
    const copie = [...templatesFiltres];

    copie.sort((a, b) => {
      const comparaison =
        sort.key === "nom"
          ? a.nom.localeCompare(b.nom, "fr")
          : new Date(a.updated_at ?? 0).getTime() - new Date(b.updated_at ?? 0).getTime();

      return sort.direction === "asc" ? comparaison : -comparaison;
    });

    return copie;
  }, [templatesFiltres, sort]);

  // ---------------------------------------------------------------------------
  // Pagination
  // ---------------------------------------------------------------------------
  const lastPage = Math.max(1, Math.ceil(templatesTries.length / PER_PAGE));
  const currentPage = Math.min(page, lastPage);
  const debut = (currentPage - 1) * PER_PAGE;
  const templatesPage = templatesTries.slice(debut, debut + PER_PAGE);

  const handleFilterChange = (key: keyof WhatsappFilterValues, value: string) => {
    setFilters((precedent) => ({ ...precedent, [key]: value }));
    // Un filtre plus restrictif peut supprimer la page courante.
    setPage(1);
  };

  const handleReset = () => {
    setFilters(FILTRES_PAR_DEFAUT);
    setPage(1);
  };

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  const ouvrirCreation = () => {
    setFormTemplate(null);
    setIsFormOpen(true);
  };

  const ouvrirModification = (template: WhatsappTemplate) => {
    setIsPreviewOpen(false);
    setFormTemplate(template);
    setIsFormOpen(true);
  };

  const ouvrirApercu = (template: WhatsappTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleSubmitForm = async (payload: WhatsappTemplatePayload) => {
    try {
      if (formTemplate) {
        await modifierTemplate({ id: formTemplate.id, ...payload }).unwrap();
        toast.success(`Template « ${payload.nom} » mis à jour.`);
      } else {
        await creerTemplate(payload).unwrap();
        // Le tri par défaut est « plus récent d'abord » : page 1 pour le voir.
        setPage(1);
        toast.success(`Template « ${payload.nom} » créé.`);
      }

      setIsFormOpen(false);
      setFormTemplate(null);
    } catch (err) {
      toast.error(messageErreur(err, "Une erreur est survenue lors de l'enregistrement."));
    }
  };

  const handleDuplicate = async (template: WhatsappTemplate) => {
    if (!template.type_id) {
      toast.error("Ce template n'a pas de type : impossible de le dupliquer.");
      return;
    }

    const nom = nomUnique(
      template.nom,
      templates.map((item) => item.nom),
    );

    try {
      await creerTemplate({
        nom,
        description: template.description,
        message: template.message ?? "",
        type_id: template.type_id,
        langue: template.langue,
        // Une copie part en brouillon : elle ne doit pas être envoyable avant
        // d'avoir été relue.
        statut: "brouillon",
        audiences: template.audiences,
      }).unwrap();

      setPage(1);
      toast.success(`Copie créée : « ${nom} ».`);
    } catch (err) {
      toast.error(messageErreur(err, "Impossible de dupliquer ce template."));
    }
  };

  const confirmerSuppression = async () => {
    if (!templateASupprimer) {
      return;
    }

    try {
      await supprimerTemplate(templateASupprimer.id).unwrap();
      setSelectedIds((precedent) => precedent.filter((id) => id !== templateASupprimer.id));
      toast.success(`Template « ${templateASupprimer.nom} » supprimé.`);
    } catch (err) {
      toast.error(messageErreur(err, "Impossible de supprimer ce template."));
    } finally {
      setTemplateASupprimer(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-6">
      <WhatsappHeader onAddTemplate={ouvrirCreation} />

      <WhatsappFilter
        values={filters}
        types={types}
        onChange={handleFilterChange}
        onReset={handleReset}
      />

      <WhatsappCards counts={counts} total={templates.length} />

      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50/60 px-5 py-3 text-sm dark:border-blue-900/50 dark:bg-blue-950/20">
          <span className="font-semibold text-blue-700 dark:text-blue-300">
            {selectedIds.length} template{selectedIds.length > 1 ? "s" : ""} sélectionné
            {selectedIds.length > 1 ? "s" : ""}
          </span>
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="cursor-pointer text-xs font-semibold text-blue-600 underline underline-offset-2 dark:text-blue-400"
          >
            Tout désélectionner
          </button>
        </div>
      )}

      <WhatsappTable
        templates={templatesPage}
        isLoading={isLoading || isFetching}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        sort={sort}
        onSortChange={setSort}
        currentPage={currentPage}
        lastPage={lastPage}
        total={templatesTries.length}
        from={templatesTries.length === 0 ? 0 : debut + 1}
        to={debut + templatesPage.length}
        onPageChange={setPage}
        onPreview={ouvrirApercu}
        onEdit={ouvrirModification}
        onDuplicate={handleDuplicate}
        onDelete={setTemplateASupprimer}
      />

      <WhatsappTemplateForm
        isOpen={isFormOpen}
        initialData={formTemplate}
        isSubmitting={isCreating || isUpdating}
        onClose={() => {
          setIsFormOpen(false);
          setFormTemplate(null);
        }}
        onSubmit={handleSubmitForm}
      />

      <WhatsappTemplatePreview
        isOpen={isPreviewOpen}
        template={previewTemplate}
        onClose={() => setIsPreviewOpen(false)}
        onEdit={ouvrirModification}
      />

      {/* Confirmation de suppression */}
      <Modal
        isOpen={Boolean(templateASupprimer)}
        onClose={() => setTemplateASupprimer(null)}
        className="max-w-md m-4"
        showCloseButton={false}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/40">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Supprimer ce template ?
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                « {templateASupprimer?.nom} » sera définitivement supprimé. Cette action est
                irréversible.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setTemplateASupprimer(null)}
              className="cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={confirmerSuppression}
              className="cursor-pointer rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
            >
              Supprimer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default WhatsappTemplates;
