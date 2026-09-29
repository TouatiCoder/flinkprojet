import React, { useState } from 'react';
import { 
    useGetPermissionsQuery, 
    useAddPermissionMutation 
} from '../../../../services/ManagerPermissions';

interface CreatePermissionsProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreatePermissions: React.FC<CreatePermissionsProps> = ({ isOpen, onClose }) => {
    const [permissionName, setPermissionName] = useState("");
    const [slugInput, setSlugInput] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const { 
        data: permissions = [], 
        isLoading: isLoadingPermissions 
    } = useGetPermissionsQuery(undefined, { skip: !isOpen });

    const [addPermission, { isLoading: isAdding }] = useAddPermissionMutation();

    const handleCreate = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setErrorMessage("");

        if (!permissionName.trim() || !slugInput.trim()) {
            setErrorMessage("Please fill all required fields.");
            return;
        }

        // T-akkad blli l-slug kay-bdā b '/'
        const formattedSlug = slugInput.trim().startsWith('/') 
            ? slugInput.trim() 
            : `/${slugInput.trim()}`;

        try {
            await addPermission({
                name: permissionName.trim(),
                slug: formattedSlug,
            }).unwrap();

            setPermissionName("");
            setSlugInput("");
            setErrorMessage("");
        } catch (error: any) {
            console.error("Failed to create permission:", error);
            setErrorMessage(error?.data?.message || "Failed to create permission.");
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
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Add New Permission</h3>
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

                {/* Form Content */}
                <form onSubmit={handleCreate} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-5 flex-1 overflow-y-auto space-y-5">
                        
                        {errorMessage && (
                            <div className="p-3 text-xs bg-red-50 text-red-600 rounded-xl font-medium border border-red-100">
                                {errorMessage}
                            </div>
                        )}

                        {/* Permission Name */}
                        <div>
                            <label htmlFor="permissionName" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                                Permission Name <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                id="permissionName"
                                required
                                value={permissionName}
                                onChange={(e) => setPermissionName(e.target.value)}
                                className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#6366f1] dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-[#6366f1] transition font-medium text-slate-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                placeholder="e.g. Gestion Utilisateurs"
                            />
                        </div>

                        {/* Slug Input */}
                        <div>
                            <label htmlFor="permissionSlug" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                                Slug / Route <span className="text-red-500">*</span>
                            </label>
                            <div className="relative flex items-center">
                                <span className="absolute left-3.5 text-gray-400 dark:text-gray-500 font-bold text-sm select-none">
                                    /
                                </span>
                                <input 
                                    type="text" 
                                    id="permissionSlug"
                                    required
                                    value={slugInput.startsWith('/') ? slugInput.substring(1) : slugInput}
                                    onChange={(e) => setSlugInput(e.target.value)}
                                    className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 rounded-xl pl-8 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-[#6366f1] dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-[#6366f1] transition font-medium text-slate-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                    placeholder="utilisateurs"
                                />
                            </div>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                                Prefix <code className="text-indigo-500 font-bold">/</code> is automatically added.
                            </p>
                        </div>

                        <hr className="border-gray-100 dark:border-gray-800 my-4" />

                        {/* Existing Permissions List */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                                Existing Permissions
                            </label>

                            {isLoadingPermissions ? (
                                <div className="text-xs text-gray-400 font-medium py-2">Loading permissions...</div>
                            ) : permissions.length === 0 ? (
                                <div className="text-xs text-gray-400 font-medium py-2">No permissions found.</div>
                            ) : (
                                <div className="space-y-2.5">
                                    {permissions.map((perm, idx) => (
                                        <div 
                                            key={perm.id || idx} 
                                            className="flex items-center justify-between p-2.5 rounded-lg border border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                                        >
                                            <span className="text-sm font-semibold text-slate-700 dark:text-gray-200">
                                                {perm.permission_name}
                                            </span>
                                            
                                            <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-400 dark:text-gray-500">
                                                <span className="bg-indigo-50 dark:bg-indigo-900/40 text-[#6366f1] dark:text-indigo-400 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-800/50 font-mono">
                                                    {perm.slug || "—"}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer / Submit Button */}
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900">
                        <button 
                            type="submit"
                            disabled={isAdding || !permissionName.trim() || !slugInput.trim()}
                            className="w-full bg-[#6366f1] dark:bg-indigo-600 hover:bg-[#4f46e5] dark:hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition duration-200 cursor-pointer shadow-lg shadow-indigo-500/10 dark:shadow-indigo-900/20 text-sm"
                        >
                            {isAdding ? "Adding..." : "Add Permission"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default CreatePermissions;