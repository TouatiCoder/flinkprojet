<?php

namespace App\Http\Controllers\payments;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index()
    {
        $rows = DB::select("
            SELECT
                f.id,
                f.numero,
                f.amount,
                f.devise,
                f.paid,
                f.billing_date,
                f.created_at,
                p.name AS product_name,
                p.type AS product_type,
                e.nom AS etab_nom,
                u.first_name AS user_first_name,
                u.last_name AS user_last_name
            FROM facturation_vrb f
            LEFT JOIN products p ON p.id = f.product_id
            LEFT JOIN etablissements e ON e.id = f.etab_id
            LEFT JOIN users u ON u.id = f.user_id
            ORDER BY f.id DESC
        ");

        $productsList = DB::table('products')
            ->whereNotNull('name')
            ->distinct()
            ->pluck('name')
            ->toArray();

        $payments = [];
        $totalAmount = 0;
        $validatedAmount = 0;
        $pendingAmount = 0;
        $refusedAmount = 0;

        foreach ($rows as $row) {
            if (!empty($row->etab_nom)) {
                $client = $row->etab_nom;
            } else {
                $client = trim(($row->user_first_name ?? '') . ' ' . ($row->user_last_name ?? ''));
                $client = $client !== '' ? $client : 'N/A';
            }

            $accountType = $row->product_type === 'compte-pro' ? 'Compte Pro' : 'User';
            $status = (int) $row->paid;

            $amountValue = (float) $row->amount;
            $devise = $row->devise ?: 'DH';

            $createdAt = $row->created_at ? new \DateTime($row->created_at) : null;
            $orderDate = $createdAt ? $createdAt->format('d/m/Y') : '-';
            $paymentDate = $row->billing_date ? (new \DateTime($row->billing_date))->format('d/m/Y') : $orderDate;
            $paymentTime = $createdAt ? $createdAt->format('H:i') : '-';

            $payments[] = [
                'id' => (string) $row->id,
                'orderDate' => $orderDate,
                'paymentDate' => $paymentDate,
                'paymentTime' => $paymentTime,
                'reference' => 'PAY-' . $row->id,
                'client' => $client,
                'accountType' => $accountType,
                'product' => $row->product_name ?? '-',
                'amount' => $amountValue,
                'devise' => $devise,
                'status' => $status,
                'invoice' => $row->numero,
            ];

            $totalAmount += $amountValue;
            if ($row->paid == 1) $validatedAmount += $amountValue;
            elseif ($row->paid == 2) $pendingAmount += $amountValue;
            elseif ($row->paid == 0) $refusedAmount += $amountValue;
        }

        $count = count($payments);
        $pct = fn ($part) => $totalAmount > 0 ? round(($part / $totalAmount) * 100, 2) : 0;

        return response()->json([
            'data' => $payments,
            'products' => $productsList,
            'stats' => [
                'totalAmount' => $totalAmount,
                'validatedAmount' => $validatedAmount,
                'validatedPercent' => $pct($validatedAmount),
                'pendingAmount' => $pendingAmount,
                'pendingPercent' => $pct($pendingAmount),
                'refusedAmount' => $refusedAmount,
                'refusedPercent' => $pct($refusedAmount),
                'count' => $count,
            ],
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|integer|in:0,1,2',
        ]);

        $exists = DB::table('facturation_vrb')->where('id', $id)->exists();

        if (!$exists) {
            return response()->json([
                'message' => 'Paiement introuvable.',
            ], 404);
        }

        DB::table('facturation_vrb')
            ->where('id', $id)
            ->update([
                'paid' => (int) $validated['status'],
                'updated_at' => now(),
            ]);

        $row = DB::table('facturation_vrb')->where('id', $id)->first();

        return response()->json([
            'id' => (string) $row->id,
            'status' => (int) $row->paid,
            'message' => 'Statut mis à jour avec succès.',
        ]);
    }
}