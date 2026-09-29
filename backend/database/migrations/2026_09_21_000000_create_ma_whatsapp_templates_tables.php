<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Templates de messages WhatsApp envoyés manuellement depuis le CRM.
 *
 * Trois tables :
 *  - ma_whatsapp_template_types      : liste de référence (Bienvenue, Relance…)
 *  - ma_whatsapp_templates           : le template lui-même
 *  - ma_whatsapp_template_audiences  : à qui il s'adresse (plusieurs valeurs)
 *
 * Le type est une table de référence et non un ENUM : c'est une liste
 * marketing amenée à bouger, et le projet fait déjà ainsi pour
 * `ma_pipline_etapes` et `ma_pipline_activites_types`.
 *
 * `created_by` / `updated_by` pointent vers `manager_users` sans contrainte de
 * clé étrangère : la colonne `manager_users.id` est un `int(11)` non aligné
 * avec les `bigint` créés ici, et le reste du schéma (ex. prospects.manager_users_id)
 * fonctionne déjà de cette façon.
 */
return new class extends Migration
{
    public function up(): void
    {
        // ---------------------------------------------------------------
        // Types / usages
        // ---------------------------------------------------------------
        if (!Schema::hasTable('ma_whatsapp_template_types')) {
            Schema::create('ma_whatsapp_template_types', function (Blueprint $table) {
                $table->id();
                $table->string('name', 60);
                $table->string('slug', 60)->unique();
                // Couleur du badge côté front, pour ne pas la coder en dur.
                $table->string('color', 20)->default('slate');
                $table->unsignedSmallInteger('ordre')->default(0);
                $table->timestamps();
            });

            $maintenant = now();

            DB::table('ma_whatsapp_template_types')->insert([
                ['name' => 'Bienvenue',     'slug' => 'bienvenue',     'color' => 'sky',      'ordre' => 1, 'created_at' => $maintenant, 'updated_at' => $maintenant],
                ['name' => 'Paiement',      'slug' => 'paiement',      'color' => 'rose',     'ordre' => 2, 'created_at' => $maintenant, 'updated_at' => $maintenant],
                ['name' => 'Qualification', 'slug' => 'qualification', 'color' => 'amber',    'ordre' => 3, 'created_at' => $maintenant, 'updated_at' => $maintenant],
                ['name' => 'Confirmation',  'slug' => 'confirmation',  'color' => 'emerald',  'ordre' => 4, 'created_at' => $maintenant, 'updated_at' => $maintenant],
                ['name' => 'Engagement',    'slug' => 'engagement',    'color' => 'violet',   'ordre' => 5, 'created_at' => $maintenant, 'updated_at' => $maintenant],
                ['name' => 'Conversion',    'slug' => 'conversion',    'color' => 'indigo',   'ordre' => 6, 'created_at' => $maintenant, 'updated_at' => $maintenant],
                ['name' => 'Relance',       'slug' => 'relance',       'color' => 'orange',   'ordre' => 7, 'created_at' => $maintenant, 'updated_at' => $maintenant],
                ['name' => 'Satisfaction',  'slug' => 'satisfaction',  'color' => 'teal',     'ordre' => 8, 'created_at' => $maintenant, 'updated_at' => $maintenant],
            ]);
        }

        // ---------------------------------------------------------------
        // Templates
        // ---------------------------------------------------------------
        if (!Schema::hasTable('ma_whatsapp_templates')) {
            Schema::create('ma_whatsapp_templates', function (Blueprint $table) {
                $table->id();

                // Identifiant lisible utilisé par les commerciaux (snake_case).
                $table->string('nom', 100)->unique();
                // « Titre interne » du formulaire.
                $table->string('description', 255)->nullable();
                // Corps du message, variables {{nom}}, {{montant}}… comprises.
                $table->text('message');

                $table->foreignId('type_id')
                    ->constrained('ma_whatsapp_template_types')
                    ->restrictOnDelete();

                $table->enum('langue', ['fr', 'ar'])->default('fr');
                $table->enum('statut', ['brouillon', 'actif', 'inactif'])->default('brouillon');

                $table->integer('created_by')->nullable()->index();
                $table->integer('updated_by')->nullable()->index();

                $table->timestamps();

                // Le cas d'usage principal est « templates actifs d'une langue ».
                $table->index(['statut', 'langue']);
            });
        }

        // ---------------------------------------------------------------
        // Audiences (un template peut viser plusieurs cibles)
        // ---------------------------------------------------------------
        if (!Schema::hasTable('ma_whatsapp_template_audiences')) {
            Schema::create('ma_whatsapp_template_audiences', function (Blueprint $table) {
                $table->foreignId('template_id')
                    ->constrained('ma_whatsapp_templates')
                    ->cascadeOnDelete();

                $table->enum('audience', ['prospect', 'user', 'compte_pro']);

                $table->primary(['template_id', 'audience']);
                // Filtre « Audience » de la liste : WHERE audience = 'user'.
                $table->index('audience');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('ma_whatsapp_template_audiences');
        Schema::dropIfExists('ma_whatsapp_templates');
        Schema::dropIfExists('ma_whatsapp_template_types');
    }
};
