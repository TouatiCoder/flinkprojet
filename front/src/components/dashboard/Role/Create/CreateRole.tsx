import React, { useState } from 'react';
import { 
    useCreateRoleMutation, 
    useGetManagerPermissionsQuery 
} from '../../../../services/managerRolePermissionApi';

interface CreateRoleProps {
    isOpen: boolean;
    onClose: () => void;
}

interface PermissionState {
    selected: boolean;
    can_create: boolean;
    can_update: boolean;
    can_delete: boolean;
    scope: 'all' | 'team' | 'own';
}

const CreateRole: React.FC<CreateRoleProps> = ({ isOpen, onClose }) => {
    const [roleName, setRoleName] = useState("");
    const [permMatrix, setPermMatrix] = useState<Record<number, PermissionState>>({});

    const { data: permissionsData, isLoading: isLoadingPermissions } = useGetManagerPermissionsQuery(undefined, {
        skip: !isOpen,
    });
    const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();

    const permissionsList: any[] = Array.isArray(permissionsData)
        ? permissionsData
        : Array.isArray((permissionsData as any)?.data)
        ? (permissionsData as any).data
        : [];

    const handleMainCheckboxChange = (id: number) => {
        setPermMatrix((prev) => {
            const current = prev[id];
            if (current?.selected) {
                return { ...prev, [id]: { ...current, selected: false } };
            }
            return {
                ...prev,
                [id]: {
                    selected: true,
                    can_create: true,
                    can_update: true,
                    can_delete: true,
                    scope: 'all',
                },
            };
        });
    };

    const handleActionToggle = (id: number, action: 'can_create' | 'can_update' | 'can_delete') => {
        setPermMatrix((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [action]: !prev[id]?.[action],
            },
        }));
    };

    const handleScopeChange = (id: number, scope: 'all' | 'team' | 'own') => {
        setPermMatrix((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                scope,
            },
        }));
    };

    const handleCreate = async () => {
        if (!roleName.trim()) return;

        const formattedPermissions = Object.entries(permMatrix)
        .filter(([id, val]) => val.selected && !isNaN(Number(id)) && Number(id) > 0)
        .map(([id, val]) => ({
            permission_id: Number(id),
            can_create: Boolean(val.can_create),
            can_update: Boolean(val.can_update),
            can_delete: Boolean(val.can_delete),
            scope: val.scope || 'own',
        }));

            console.log("Payload Sent to Backend:", {
                name: roleName.trim(),
                permissions: formattedPermissions,
            });

        try {
            await createRole({
                name: roleName.trim(),
                permissions: formattedPermissions,
            }).unwrap();

            setRoleName("");
            setPermMatrix({});
            onClose();
        } catch (error) {
            console.error("Failed to create role:", error);
        }
    };

    return (
        <>
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/30 z-40 transition-opacity backdrop-blur-xs" 
                    onClick={onClose}
                ></div>
            )}

            <div 
                className={`fixed top-0 right-0 h-full w-80 md:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                } flex flex-col font-sans`}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Add New Role</h3>
                    <button 
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="mb-6">
                        <label htmlFor="roleName" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                            Role Name
                        </label>
                        <input 
                            type="text" 
                            id="roleName"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#6366f1] dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-[#6366f1] transition font-medium text-slate-800 dark:text-white"
                            placeholder="e.g. Administrator"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                            Permissions Setup
                        </label>

                        {isLoadingPermissions ? (
                            <div className="text-xs text-gray-400 font-medium py-2">Loading permissions...</div>
                        ) : permissionsList.length === 0 ? (
                            <div className="text-xs text-gray-400 font-medium py-2">No permissions found.</div>
                        ) : (
                            <div className="space-y-3">
                                {permissionsList.map((perm, idx) => {
                                const permId = Number(perm.id || perm.permission_id || perm.ma_permission_id || (idx + 1));
                                const currentState = permMatrix[permId] || {
                                    selected: false,
                                    can_create: false,
                                    can_update: false,
                                    can_delete: false,
                                    scope: 'all',
                                };

    const permName = perm.permission_name || perm.name || `Permission #${permId}`;
    const routeName = perm.slug || perm.manager_route?.name || "Global";

    return (
        <div key={permId} className="p-3 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/30 dark:bg-gray-800/30">
            
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                    <input 
                        type="checkbox" 
                        id={`perm-check-${permId}`}
                        checked={Boolean(currentState.selected)}
                        onChange={() => handleMainCheckboxChange(permId)}
                        className="w-4 h-4 text-[#6366f1] dark:text-indigo-500 border-gray-300 dark:border-gray-600 rounded focus:ring-[#6366f1] cursor-pointer"
                    />
                    <label htmlFor={`perm-check-${permId}`} className="text-sm font-bold text-slate-800 dark:text-gray-100 cursor-pointer select-none">
                        {permName}
                    </label>
                </div>

                <span className="bg-indigo-50 dark:bg-indigo-900/40 text-[#6366f1] dark:text-indigo-400 text-xs font-bold px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-800/50">
                    {routeName}
                </span>
            </div>

            {currentState.selected && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-3 animate-in fade-in duration-150">
                    
                    <div className="flex items-center gap-3">
                        {(['can_create', 'can_update', 'can_delete'] as const).map((action) => (
                            <label key={`${permId}-${action}`} className="flex items-center space-x-1 cursor-pointer select-none">
                                <input 
                                    type="checkbox" 
                                    checked={Boolean(currentState[action])}
                                    onChange={() => handleActionToggle(permId, action)}
                                    className="w-3.5 h-3.5 text-indigo-500 border-gray-300 rounded focus:ring-indigo-400"
                                />
                                <span className="text-xs font-medium capitalize text-gray-600 dark:text-gray-400">
                                    {action.replace('can_', '')}
                                </span>
                            </label>
                        ))}
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-100 dark:border-gray-700/60">
                        <span className="block text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider mb-1">
                            Scope
                        </span>
                        <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name={`scope-radio-${permId}`} 
                                    value="all" 
                                    checked={currentState.scope === 'all'}
                                    onChange={() => handleScopeChange(permId, 'all')}
                                    className="text-[#6366f1] w-3 h-3"
                                />
                                <span>All (Global)</span>
                            </label>

                            <label className="flex items-center space-x-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                                <input
                                    type="radio"
                                    name={`scope-radio-${permId}`}
                                    value="team"
                                    checked={currentState.scope === 'team'}
                                    onChange={() => handleScopeChange(permId, 'team')}
                                    className="text-[#6366f1] w-3 h-3"
                                />
                                <span>Team</span>
                            </label>

                            <label className="flex items-center space-x-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name={`scope-radio-${permId}`} 
                                    value="own" 
                                    checked={currentState.scope === 'own'}
                                    onChange={() => handleScopeChange(permId, 'own')}
                                    className="text-[#6366f1] w-3 h-3"
                                />
                                <span>Own Only</span>
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
})}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900">
                    <button 
                        type="button"
                        onClick={handleCreate}
                        disabled={isCreating || !roleName.trim()}
                        className="w-full bg-[#6366f1] dark:bg-indigo-600 hover:bg-[#4f46e5] dark:hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 cursor-pointer text-sm shadow-lg shadow-indigo-500/10"
                    >
                        {isCreating ? "Adding Role..." : "Add Role"}
                    </button>
                </div>
            </div>
        </>
    );
};

export default CreateRole;