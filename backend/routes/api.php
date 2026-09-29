<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\etablissement\EtablissementController;
use App\Http\Controllers\publication\PublicationController;
use App\Http\Controllers\auth\AuthController;
use App\Http\Controllers\tags\TagController;
use App\Http\Controllers\RolesAndPermission\ManagerRouteController;
use App\Http\Controllers\RolesAndPermission\MaPermissionController;
use App\Http\Controllers\RolesAndPermission\MaRoleController;
use App\Http\Controllers\crm\ProspectController;
use App\Http\Controllers\crm\LpFlinkController;
use App\Http\Controllers\crm\CrmPiplineController;
use App\Http\Controllers\crm\ConvertUserAndEtabController;
use App\Http\Controllers\crm\MaActiviteController;
use App\Http\Controllers\activites\ActiviteController;
use App\Http\Controllers\equipe\EquipeController;
use App\Http\Controllers\whatsapp\WhatsappTemplateController;
use App\Http\Controllers\membre\MembreController;
use App\Http\Controllers\crm\OpportuniteController;
use App\Http\Controllers\UserPermissionController;
use App\Http\Controllers\payments\PaymentController;


Route::middleware( 'auth:sanctum' )->get( '/user', function ( Request $request ) {
    return $request->user();
} );

Route::post( '/manager/login', [AuthController::class, 'login'] )->name( 'login' );
Route::post('/manager/lp/users', [LpFlinkController::class, 'storeUserLp']);

Route::middleware( ['auth:sanctum'] )->group( function () {

    Route::middleware('permission:/payments')->group(function () {
        Route::get('/manager/payments', [PaymentController::class, 'index']);
        Route::patch('manager/payments/{id}/status', [PaymentController::class, 'updateStatus']);
    });
    
    Route::middleware('permission:/prospect')->group(function () {
        Route::get('/manager/prospects/create-data', [ProspectController::class, 'getCreateData']);
        Route::post('/manager/prospects', [ProspectController::class, 'store']);
        Route::get('/manager/prospects', [ProspectController::class, 'getProspects']);
        Route::get('/manager/prospects/filter-responsables', [ProspectController::class, 'getFilterResponsables']);
        Route::get('/manager/prospects/{prospectId}/notes', [ProspectController::class, 'getNotesByProspect']);
        Route::post('/manager/prospects/{prospectId}/notes', [ProspectController::class, 'storeNote']);
        Route::put('/manager/prospects/{id}', [ProspectController::class, 'update']);
        Route::get('/manager/prospects/stats-cards', [ProspectController::class, 'getStatsCards']);
        Route::get('/manager/prospects/{id}/vue-ensemble-cards', [ProspectController::class, 'getVueEnsembleCards']);
        Route::put('/manager/prospects/{id}/etape', [ProspectController::class, 'updateProspectEtape']);
        Route::get('/manager/prospects/pipeline-etapes', [ProspectController::class, 'getPipelineEtapes']);
    });

   Route::prefix('manager/membres')->group(function () {
        Route::get('/form-dependencies', [MembreController::class, 'getFormDependencies']);
        Route::get('/', [MembreController::class, 'index']);
        Route::post('/', [MembreController::class, 'store']);
        Route::get('/{id}', [MembreController::class, 'show']);
        Route::put('/{id}', [MembreController::class, 'update']);
        Route::post('/{id}', [MembreController::class, 'update']);
        Route::delete('/{id}/avatar', [MembreController::class, 'removeAvatar']);
    });


    Route::get('/manager/pipeline', [CrmPiplineController::class, 'getPipeline']);
    Route::post('/manager/pipeline/move-card', [CrmPiplineController::class, 'moveCard']);

    Route::post('/manager/pipeline/convert-user', [ConvertUserAndEtabController::class, 'userConvert']);
    Route::post('/manager/pipeline/convert-etab', [ConvertUserAndEtabController::class, 'etabConvert']);

    Route::get('/manager/current-activite', [MaActiviteController::class, 'getCurrentActivite']);
    Route::post('/manager/store-activite', [MaActiviteController::class, 'storeActivite']);
    Route::post('/manager/planifier-prochaine-activite', [MaActiviteController::class, 'planifierProchaineActivite']);
    Route::get('/manager/historique-activites', [MaActiviteController::class, 'getHistoriqueActivites']);
    Route::post('/manager/activite/marquer-perdu', [MaActiviteController::class, 'marquerCommePerdu']);

    Route::get('/manager/activites-compte/ads', [ActiviteController::class, 'getAdsHistory']);
    Route::get('/manager/activites-compte/transactions', [ActiviteController::class, 'getTransactionsHistory']);
    Route::get('/manager/activites-compte/comptes-pro', [ActiviteController::class, 'getComptesPro']);
    Route::get('/manager/activites-compte/solde-ads', [ActiviteController::class, 'getSoldeAdsHistory']);

    Route::get('/manager/equipes', [EquipeController::class, 'getEquipes']);
    Route::post('/manager/equipes', [EquipeController::class, 'store']);
    Route::get('/manager/equipes/create-data', [EquipeController::class, 'getCreateData']);

    // Templates WhatsApp.
    // `create-data` et `carte/{id}` sont déclarés avant `{id}` : sans cela
    // Laravel les capterait comme un identifiant de template.
    Route::prefix('manager/whatsapp/templates')->group(function () {
        Route::get('/create-data', [WhatsappTemplateController::class, 'getCreateData']);
        Route::get('/carte/{cardId}', [WhatsappTemplateController::class, 'pourCarte']);
        Route::get('/', [WhatsappTemplateController::class, 'index']);
        Route::post('/', [WhatsappTemplateController::class, 'store']);
        Route::put('/{id}', [WhatsappTemplateController::class, 'update']);
        Route::delete('/{id}', [WhatsappTemplateController::class, 'destroy']);
    });

    // Members

    Route::get('/manager/opportunites/details', [OpportuniteController::class, 'getObjectifs']);
    Route::put('/manager/opportunites/toggle-objectif', [OpportuniteController::class, 'toggleObjectif']);
    Route::post('/manager/opportunites/nouvelle', [OpportuniteController::class, 'createNewOpportunite']);

    Route::get('/manager/user/profile-permissions', [UserPermissionController::class, 'getAuthUserPermissions']);

    Route::middleware('permission:/role')->group(function () {
        Route::get('/manager/roles', [MaRoleController::class, 'index']);
        Route::get('/manager/roles/{id}', [MaRoleController::class, 'show']);
        Route::post('/manager/roles', [MaRoleController::class, 'store']);
        Route::get('/manager/roles/{id}/edit', [MaRoleController::class, 'edit']);
        Route::put('/manager/roles/{id}', [MaRoleController::class, 'update']);
        Route::delete('/manager/roles/{id}', [MaRoleController::class, 'destroy']);

        Route::get('/manager-routes', [ManagerRouteController::class, 'index']);
        Route::post('/manager-routes', [ManagerRouteController::class, 'store']);

        Route::get('/ma-permissions', [MaPermissionController::class, 'index']);
        Route::post('/ma-permissions', [MaPermissionController::class, 'store']);
        Route::get('/ma-permissions/{id}/edit', [MaPermissionController::class, 'edit']);
        Route::put('/ma-permissions/{id}', [MaPermissionController::class, 'update']);
        Route::delete('/ma-permissions/{id}', [MaPermissionController::class, 'destroy']);

        Route::post('/manager/register', [AuthController::class, 'register']);
        Route::get('/manager/usersM', [AuthController::class, 'index']);
        Route::delete('/manager/users/{id}', [AuthController::class, 'destroy']);
        Route::get('/manager/users/{id}/edit', [AuthController::class, 'edit']);
        Route::put('/manager/users/{id}', [AuthController::class, 'update']);
    });

    Route::middleware('permission:/tags')->group(function () {
        Route::get('/manager/tags', [TagController::class, 'tags']);
        Route::get('/manager/get_tags', [TagController::class, 'getAllTags']);
        Route::put('/manager/update/tag', [TagController::class, 'updateTag']);
        Route::put('/manager/toggle/tag', [TagController::class, 'toggleTagField']);
        Route::delete('/manager/delete/tag/{tagId}', [TagController::class, 'deleteTag']);
    });

    Route::middleware('permission:/etablissements')->group(function () {
        Route::get('/manager/etablissements', [EtablissementController::class, 'getEtablissements']);
        Route::get('/manager/etablissementsE/{id}/edit', [EtablissementController::class, 'edit']);
        Route::put('/manager/etablissementsE/{id}', [EtablissementController::class, 'update']);
    });

    Route::middleware('permission:/publications')->group(function () {
        Route::get('/manager/publications', [PublicationController::class, 'getPublications']);
        Route::put('/manager/update/publication', [PublicationController::class, 'updatePublication']);
        Route::delete('/manager/delete/publication/{publicationId}', [PublicationController::class, 'deletePublication']);
    });

    Route::middleware('permission:/users')->group(function () {
        Route::get('/manager/users', [UsersController::class, 'getUsers']);
    });

    Route::get('/manager/me', [AuthController::class, 'userProfile']);
    Route::put('/manager/me', [AuthController::class, 'updateProfile']);
    Route::get('/manager/usersF/{id}/edit', [UsersController::class, 'edit']);
    Route::put('/manager/usersF/{id}', [UsersController::class, 'update']);

} );



