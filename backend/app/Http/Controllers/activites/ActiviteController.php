<?php

namespace App\Http\Controllers\activites;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Throwable;

class ActiviteController extends Controller
{
    public function getAdsHistory(Request $request): JsonResponse
    {
        try {
            $type = $request->query('type', 'user');
            $id   = $request->query('id');

            if (!$id) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Le paramètre id est requis (user_id ou etab_id)',
                ], 422);
            }

            $today = Carbon::today()->toDateString();

            $query = DB::table('publications_booster_flink as pb')
                ->join('publications_flink as p', 'p.id', '=', 'pb.publication_id')
                ->leftJoin('statistiques_flink as s', 's.publication_id', '=', 'p.id')
                ->select([
                    'pb.id',
                    'pb.publication_id',
                    'p.slug as publication_slug',
                    'pb.objectif_name',
                    'pb.montant',
                    'pb.date_debut',
                    'pb.date_fin',
                    'pb.created_at',
                    DB::raw('COALESCE(s.vues, 0) as vues'),
                    DB::raw('COALESCE(s.click_detail, 0) as clics'),
                    DB::raw("CASE WHEN DATE(pb.date_debut) <= '{$today}' AND DATE(pb.date_fin) >= '{$today}' THEN 1 ELSE 0 END as is_active")
                ]);

            if ($type === 'etablissement') {
                $query->where('p.etab_id', $id);
            } else {
                $query->where('p.user_id', $id)
                      ->whereNull('p.etab_id');
            }

            $campaigns = $query->orderBy('is_active', 'desc')
                ->orderBy('pb.date_debut', 'desc')
                ->orderBy('pb.created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($item) {
                    $vues = (int)$item->vues;
                    $clics = (int)$item->clics;
                    $ctr = $vues > 0 ? round(($clics / $vues) * 100, 2) : 0;

                    $title = !empty($item->publication_slug)
                        ? ucfirst(str_replace('-', ' ', $item->publication_slug))
                        : 'Campagne #' . $item->id;

                    return [
                        'id'             => $item->id,
                        'publication_id' => $item->publication_id,
                        'title'          => $title,
                        'objectif'       => $item->objectif_name ?? 'Trafic',
                        'montant'        => (float)($item->montant ?? 0),
                        'montant_format' => number_format((float)($item->montant ?? 0), 2, ',', ' ') . ' DH',
                        'vues'           => $vues,
                        'clics'          => $clics,
                        'ctr'            => $ctr . '%',
                        'is_active'      => (bool)$item->is_active,
                        'status_label'   => (bool)$item->is_active ? 'Active' : 'Terminée',
                        'date_debut'     => $item->date_debut,
                        'date_fin'       => $item->date_fin,
                        'periode'        => ($item->date_debut && $item->date_fin)
                            ? Carbon::parse($item->date_debut)->format('d/m/Y') . ' – ' . Carbon::parse($item->date_fin)->format('d/m/Y')
                            : '—',
                    ];
                });

            return response()->json([
                'status' => 'success',
                'data'   => $campaigns,
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur lors de la récupération de l\'historique des campagnes Ads',
                'error'   => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ], 500);
        }
    }


    public function getTransactionsHistory(Request $request): JsonResponse
    {
        try {
            $type = $request->query('type', 'user');
            $id   = $request->query('id');

            if (!$id) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Le paramètre id est requis (user_id ou etab_id)',
                ], 422);
            }

            $query = DB::table('facturation_vrb as f')
                ->leftJoin('products as p', 'p.id', '=', 'f.product_id')
                ->select([
                    'f.id',
                    'f.numero',
                    'f.billing_date',
                    'f.mode_paiement',
                    'f.amount',
                    'f.paid',
                    'f.product_id',
                    'f.created_at',
                    'p.name as product_name',
                ]);

            if ($type === 'etablissement') {
                $query->where('f.etab_id', $id);
            } else {
                $query->where('f.user_id', $id)
                      ->whereNull('f.etab_id');
            }

            $transactions = $query->orderBy('f.billing_date', 'desc')
                ->orderBy('f.created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($item) {
                    $paidStatus = (int)($item->paid ?? 0);
                    $statusLabel = 'Annulé';
                    $statusColor = 'rose';

                    if ($paidStatus === 1) {
                        $statusLabel = 'Achat Effectué';
                        $statusColor = 'amber';
                    } elseif ($paidStatus === 2) {
                        $statusLabel = 'Annulé';
                        $statusColor = 'emerald';
                    }

                    return [
                        'id'             => $item->id,
                        'numero'         => $item->numero ? '#' . $item->numero : 'FAC-' . $item->id,
                        'product_id'     => $item->product_id,
                        'product_name'   => $item->product_name ?? 'Pack Flink',
                        'amount'         => (float)($item->amount ?? 0),
                        'amount_format'  => number_format((float)($item->amount ?? 0), 2, ',', ' ') . ' DH',
                        'mode_paiement'  => $item->mode_paiement ? ucfirst($item->mode_paiement) : 'Non précisé',
                        'paid'           => $paidStatus,
                        'status_label'   => $statusLabel,
                        'status_color'   => $statusColor,
                        'billing_date'   => $item->billing_date,
                        'date_format'    => $item->billing_date 
                            ? Carbon::parse($item->billing_date)->format('d/m/Y H:i') 
                            : ($item->created_at ? Carbon::parse($item->created_at)->format('d/m/Y H:i') : '—'),
                    ];
                });

            return response()->json([
                'status' => 'success',
                'data'   => $transactions,
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur lors de la récupération de l\'historique des transactions',
                'error'   => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ], 500);
        }
    }


    public function getComptesPro(Request $request): JsonResponse
    {
        try {
            $type = $request->query('type', 'user');
            $id   = $request->query('id');

            if (!$id) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Le paramètre id est requis (user_id ou etab_id)',
                ], 422);
            }

            $query = DB::table('etablissements as e')
                ->leftJoin('activites as a', 'a.id', '=', 'e.activite_id')
                ->select([
                    'e.id',
                    'e.nom',
                    'e.logo',
                    'e.activite_id',
                    'a.name as activite_name',
                    'e.created_at',
                    'e.status',
                    'e.consommation_solde',
                ]);

            if ($type === 'etablissement') {
                $query->where('e.id', $id);
            } else {
                $query->join('user_etab_roles as uer', 'uer.etab_id', '=', 'e.id')
                      ->where('uer.user_id', $id)
                      ->distinct();
            }

            $comptes = $query->orderBy('e.created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($item) {
                    $isActive = (int)$item->status === 1;

                    return [
                        'id'                 => $item->id,
                        'nom'                => $item->nom ?? 'Établissement sans nom',
                        'logo'               => $item->logo,
                        'activite_id'        => $item->activite_id,
                        'activite_name'      => $item->activite_name ?? 'Non renseignée',
                        'status'             => $isActive,
                        'status_label'       => $isActive ? 'Actif' : 'Inactif',
                        'status_color'       => $isActive ? 'emerald' : 'rose',
                        'consommation_solde' => (float)($item->consommation_solde ?? 0),
                        'solde_format'       => number_format((float)($item->consommation_solde ?? 0), 2, ',', ' ') . ' DH',
                        'created_at'         => $item->created_at,
                        'date_creation'      => $item->created_at 
                            ? Carbon::parse($item->created_at)->format('d/m/Y') 
                            : '—',
                    ];
                });

            return response()->json([
                'status' => 'success',
                'data'   => $comptes,
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur lors de la récupération des comptes pro',
                'error'   => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ], 500);
        }
    }



    public function getSoldeAdsHistory(Request $request): JsonResponse
    {
        try {
            $type = $request->query('type', 'user');
            $id   = $request->query('id');

            if (!$id) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Le paramètre id est requis (user_id ou etab_id)',
                ], 422);
            }

            $currentSolde = 0;
            if ($type === 'etablissement') {
                $currentSolde = (float)(DB::table('etablissements')->where('id', $id)->value('consommation_solde') ?? 0);
            } else {
                $currentSolde = (float)(DB::table('users')->where('id', $id)->value('consommation_solde') ?? 0);
            }

            $query = DB::table('facturation_vrb as f')
                ->leftJoin('products as p', 'p.id', '=', 'f.product_id')
                ->select([
                    'f.id',
                    'f.numero',
                    'f.billing_date',
                    'f.mode_paiement',
                    'f.amount',
                    'f.product_id',
                    'f.created_at',
                    'p.name as product_name',
                ]);

            if ($type === 'etablissement') {
                $query->where('f.etab_id', $id);
            } else {
                $query->where('f.user_id', $id)
                      ->whereNull('f.etab_id');
            }

            $rawItems = $query->orderBy('f.billing_date', 'desc')
                ->orderBy('f.created_at', 'desc')
                ->limit(5)
                ->get();

            $runningSolde = $currentSolde;
            $soldeHistory = [];

            foreach ($rawItems as $item) {
                $isDebit = (int)$item->product_id === 5;
                $isCredit = !$isDebit;
                $amount = (float)($item->amount ?? 0);

                $soldeApresLigne = $runningSolde;

                if ($isCredit) {
                    $runningSolde -= $amount;
                } else {
                    $runningSolde += $amount;
                }

                $soldeHistory[] = [
                    'id'                 => $item->id,
                    'numero'             => $item->numero ? '#' . $item->numero : 'FAC-' . $item->id,
                    'product_id'         => $item->product_id,
                    'product_name'       => $item->product_name ?? ($isDebit ? 'Consommation Ads' : 'Recharge Solde Ads'),
                    'amount'             => $amount,
                    'amount_format'      => number_format($amount, 2, ',', ' ') . ' DH',
                    'mode_paiement'      => $item->mode_paiement ? ucfirst($item->mode_paiement) : 'Solde',
                    'debit'              => $isDebit,
                    'credit'             => $isCredit,
                    'type_mouvement'     => $isDebit ? 'Débit' : 'Crédit',
                    'consommation_solde' => (float)$soldeApresLigne,
                    'solde_apres_format' => number_format($soldeApresLigne, 2, ',', ' ') . ' DH',
                    'billing_date'       => $item->billing_date,
                    'date_format'        => $item->billing_date 
                        ? Carbon::parse($item->billing_date)->format('d/m/Y H:i') 
                        : ($item->created_at ? Carbon::parse($item->created_at)->format('d/m/Y H:i') : '—'),
                ];
            }

            return response()->json([
                'status' => 'success',
                'data'   => $soldeHistory,
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur lors de la récupération de l\'historique du solde Ads',
                'error'   => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ], 500);
        }
    }
}