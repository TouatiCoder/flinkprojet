<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Deux paramètres d'affectation du formulaire « Membres » étaient envoyés par
 * le front mais n'avaient aucune colonne de destination : ils étaient perdus
 * silencieusement à chaque enregistrement.
 *
 *  - methode_affectation   : « Round Robin » | « Moins chargé » | « Manuel »
 *  - recevoir_opportunites : le membre entre-t-il dans la distribution ?
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('manager_users', function (Blueprint $table) {
            if (!Schema::hasColumn('manager_users', 'methode_affectation')) {
                $table->string('methode_affectation', 30)
                    ->nullable()
                    ->after('capacite_max_leads');
            }

            if (!Schema::hasColumn('manager_users', 'recevoir_opportunites')) {
                $table->boolean('recevoir_opportunites')
                    ->default(1)
                    ->after('methode_affectation');
            }
        });
    }

    public function down(): void
    {
        Schema::table('manager_users', function (Blueprint $table) {
            if (Schema::hasColumn('manager_users', 'recevoir_opportunites')) {
                $table->dropColumn('recevoir_opportunites');
            }

            if (Schema::hasColumn('manager_users', 'methode_affectation')) {
                $table->dropColumn('methode_affectation');
            }
        });
    }
};
