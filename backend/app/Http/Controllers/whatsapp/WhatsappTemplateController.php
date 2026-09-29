<?php

namespace App\Http\Controllers\whatsapp;

use App\Http\Controllers\Controller;
use App\Models\MaWhatsappTemplate;
use App\Models\MaWhatsappTemplateType;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Throwable;

class WhatsappTemplateController extends Controller
{
    private const AUDIENCES = ['prospect', 'user', 'compte_pro'];

    /** Longueur maximale alignée sur le formulaire côté front. */
    private const MESSAGE_MAX = 1024;

    // -------------------------------------------------------------------------
    // Lecture
    // -------------------------------------------------------------------------

    /**
     * Liste complète des templates.
     *
     * Comme pour /membres, aucun filtre n'est imposé ici : la page les applique
     * côté front. Les paramètres restent acceptés pour les appels ciblés
     * (ex. le sélecteur d'activité qui ne veut que les templates actifs).
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = MaWhatsappTemplate::with(['type:id,name,slug,color', 'audiences', 'auteur:id,first_name,last_name']);

            if ($request->filled('statut')) {
                $query->where('statut', $request->statut);
            }

            if ($request->filled('langue')) {
                $query->where('langue', $request->langue);
            }

            if ($request->filled('audience')) {
                $audience = $request->audience;
                $query->whereHas('audiences', fn ($q) => $q->where('audience', $audience));
            }

            $templates = $query->orderByDesc('updated_at')->get();

            return response()->json([
                'status' => 'success',
                'data'   => $templates->map(fn ($t) => $this->formater($t))->all(),
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur lors de la récupération des templates',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /** Types disponibles pour alimenter le formulaire. */
    public function getCreateData(): JsonResponse
    {
        try {
            return response()->json([
                'status' => 'success',
                'data'   => [
                    'types'     => MaWhatsappTemplateType::select('id', 'name', 'slug', 'color')
                        ->orderBy('ordre')
                        ->get(),
                    'audiences' => self::AUDIENCES,
                    'langues'   => ['fr', 'ar'],
                ],
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur lors de la récupération des données du formulaire',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Templates proposés au commercial pour une carte du pipeline.
     *
     * L'audience n'est pas demandée au front : elle se déduit de la carte.
     * Une carte convertie en établissement vise le « compte_pro », une carte
     * convertie en user vise le « user », sinon c'est encore un prospect.
     *
     * Les variables connues ({{nom}}, {{commercial}}, {{date}}) sont déjà
     * remplacées : le commercial n'a plus qu'à choisir et envoyer.
     */
    public function pourCarte(Request $request, $cardId): JsonResponse
    {
        try {
            $card = DB::table('ma_pipline_cards')
                ->select('id', 'prospect_id', 'user_id', 'etablissement_id')
                ->where('id', $cardId)
                ->first();

            if (!$card) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Carte introuvable',
                ], 404);
            }

            $audience = $this->audienceDeLaCarte($card);

            // Le prospect reste la source du nom et du téléphone même après
            // conversion : la carte garde son `prospect_id`.
            $prospect = $card->prospect_id
                ? DB::table('prospects')
                    ->select('id', 'nom', 'prenom', 'telephone', 'name_entreprise')
                    ->where('id', $card->prospect_id)
                    ->first()
                : null;

            $destinataire = $this->nomDestinataire($card, $prospect);

            $manager = $request->user();
            $commercial = trim("{$manager?->first_name} {$manager?->last_name}");

            $variables = [
                'nom'        => $destinataire['nom'],
                'commercial' => $commercial !== '' ? $commercial : null,
                'date'       => Carbon::now()->format('d/m/Y'),
            ];

            $templates = MaWhatsappTemplate::with(['type:id,name,slug,color', 'audiences'])
                ->where('statut', 'actif')
                ->whereHas('audiences', fn ($q) => $q->where('audience', $audience))
                ->orderBy('nom')
                ->get();

            return response()->json([
                'status' => 'success',
                'data'   => [
                    'audience'     => $audience,
                    'destinataire' => $destinataire,
                    'variables'    => $variables,
                    'templates'    => $templates->map(function ($template) use ($variables) {
                        $formate = $this->formater($template);
                        $formate['message_rendu'] = $template->rendre($variables);
                        return $formate;
                    })->all(),
                ],
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur lors de la récupération des templates de la carte',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // -------------------------------------------------------------------------
    // Écriture
    // -------------------------------------------------------------------------

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), $this->reglesValidation());

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur de validation',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            return DB::transaction(function () use ($request) {
                $managerId = $request->user()?->id;

                $template = MaWhatsappTemplate::create([
                    'nom'         => $request->nom,
                    'description' => $request->description,
                    'message'     => $request->message,
                    'type_id'     => $request->type_id,
                    'langue'      => $request->input('langue', 'fr'),
                    'statut'      => $request->input('statut', 'brouillon'),
                    'created_by'  => $managerId,
                    'updated_by'  => $managerId,
                ]);

                $this->remplacerAudiences($template->id, $request->input('audiences', []));

                return response()->json([
                    'status'  => 'success',
                    'message' => 'Template créé avec succès',
                    'data'    => $this->formater($template->fresh(['type', 'audiences', 'auteur'])),
                ], 201);
            });

        } catch (Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur lors de la création du template',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id): JsonResponse
    {
        $template = MaWhatsappTemplate::find($id);

        if (!$template) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Template introuvable',
            ], 404);
        }

        $validator = Validator::make($request->all(), $this->reglesValidation((int) $id));

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur de validation',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            return DB::transaction(function () use ($request, $template) {
                $template->update([
                    'nom'         => $request->nom,
                    'description' => $request->description,
                    'message'     => $request->message,
                    'type_id'     => $request->type_id,
                    'langue'      => $request->input('langue', $template->langue),
                    'statut'      => $request->input('statut', $template->statut),
                    'updated_by'  => $request->user()?->id,
                ]);

                if ($request->has('audiences')) {
                    $this->remplacerAudiences($template->id, $request->input('audiences', []));
                }

                return response()->json([
                    'status'  => 'success',
                    'message' => 'Template mis à jour avec succès',
                    'data'    => $this->formater($template->fresh(['type', 'audiences', 'auteur'])),
                ], 200);
            });

        } catch (Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur lors de la mise à jour du template',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id): JsonResponse
    {
        try {
            $template = MaWhatsappTemplate::find($id);

            if (!$template) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Template introuvable',
                ], 404);
            }

            // Les audiences partent avec, via la contrainte ON DELETE CASCADE.
            $template->delete();

            return response()->json([
                'status'  => 'success',
                'message' => 'Template supprimé avec succès',
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur lors de la suppression du template',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function reglesValidation(?int $ignoreId = null): array
    {
        $nomUnique = 'unique:ma_whatsapp_templates,nom' . ($ignoreId ? ',' . $ignoreId : '');

        return [
            // Le nom sert d'identifiant lisible : snake_case imposé, comme
            // « relance_paiement_pro ».
            'nom'         => 'required|string|max:100|regex:/^[a-z0-9_]+$/|' . $nomUnique,
            'description' => 'nullable|string|max:255',
            'message'     => 'required|string|max:' . self::MESSAGE_MAX,
            'type_id'     => 'required|integer|exists:ma_whatsapp_template_types,id',
            'langue'      => 'nullable|in:fr,ar',
            'statut'      => 'nullable|in:brouillon,actif,inactif',
            'audiences'   => 'required|array|min:1',
            'audiences.*' => 'in:' . implode(',', self::AUDIENCES),
        ];
    }

    /** Réécrit la liste des audiences d'un template. */
    private function remplacerAudiences(int $templateId, array $audiences): void
    {
        DB::table('ma_whatsapp_template_audiences')
            ->where('template_id', $templateId)
            ->delete();

        $lignes = collect($audiences)
            ->unique()
            ->filter(fn ($a) => in_array($a, self::AUDIENCES, true))
            ->map(fn ($a) => ['template_id' => $templateId, 'audience' => $a])
            ->values()
            ->all();

        if (!empty($lignes)) {
            DB::table('ma_whatsapp_template_audiences')->insert($lignes);
        }
    }

    /** Une carte convertie vise une audience plus avancée qu'un simple prospect. */
    private function audienceDeLaCarte(object $card): string
    {
        if (!empty($card->etablissement_id)) {
            return 'compte_pro';
        }

        if (!empty($card->user_id)) {
            return 'user';
        }

        return 'prospect';
    }

    /**
     * Nom et téléphone affichés au commercial. L'établissement prime lorsqu'il
     * existe : c'est l'interlocuteur réel une fois la conversion faite.
     */
    private function nomDestinataire(object $card, ?object $prospect): array
    {
        if (!empty($card->etablissement_id)) {
            $etab = DB::table('etablissements')
                ->select('nom', 'default_phone_number')
                ->where('id', $card->etablissement_id)
                ->first();

            if ($etab) {
                return [
                    'nom'       => $etab->nom,
                    'telephone' => $etab->default_phone_number,
                ];
            }
        }

        if (!$prospect) {
            return ['nom' => null, 'telephone' => null];
        }

        $nom = trim((string) $prospect->name_entreprise);

        if ($nom === '') {
            $nom = trim(trim((string) $prospect->prenom) . ' ' . trim((string) $prospect->nom));
        }

        return [
            'nom'       => $nom !== '' ? $nom : null,
            'telephone' => $prospect->telephone,
        ];
    }

    /** Forme consommée par le front (voir whatsappTypes.ts). */
    private function formater(MaWhatsappTemplate $template): array
    {
        $auteur = $template->auteur;
        $nomAuteur = $auteur ? trim("{$auteur->first_name} {$auteur->last_name}") : '';

        return [
            'id'          => $template->id,
            'nom'         => $template->nom,
            'description' => $template->description ?? '',
            'message'     => $template->message,
            'audiences'   => $template->audiences->pluck('audience')->values()->all(),
            // `type_id` sert au préremplissage du formulaire, `usage` (slug) à
            // l'affichage et au filtrage côté front.
            'type_id'     => $template->type_id,
            'usage'       => $template->type?->slug,
            'usage_label' => $template->type?->name,
            'usage_color' => $template->type?->color,
            'langue'      => $template->langue,
            'statut'      => $template->statut,
            'updated_at'  => optional($template->updated_at)->toDateString(),
            'updated_by'  => $nomAuteur !== '' ? $nomAuteur : '—',
        ];
    }
}
