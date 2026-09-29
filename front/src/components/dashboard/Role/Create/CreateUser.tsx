import React, { useState } from 'react';
import { useRegisterManagerMutation } from '../../../../services/managerAuthApi';
import { useGetRolesQuery } from '../../../../services/managerRolePermissionApi';

interface CreateUserProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateUser: React.FC<CreateUserProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        roleId: '',
    });

    const [errorMessage, setErrorMessage] = useState('');

    const { data: rolesData, isLoading: isLoadingRoles } = useGetRolesQuery(undefined, { 
        skip: !isOpen 
    });
    const [registerManager, { isLoading: isCreating }] = useRegisterManagerMutation();

    const rolesList: any[] = Array.isArray(rolesData)
        ? rolesData
        : Array.isArray((rolesData as any)?.data)
        ? (rolesData as any).data
        : [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (!formData.roleId) {
            setErrorMessage('Please select a valid user role.');
            return;
        }

        try {
            await registerManager({
                first_name: formData.firstName.trim(),
                last_name: formData.lastName.trim(),
                username: formData.username.trim(),
                email: formData.email.trim(),
                password: formData.password,
                role_id: Number(formData.roleId),
            }).unwrap();

            setFormData({
                firstName: '',
                lastName: '',
                username: '',
                email: '',
                password: '',
                roleId: '',
            });
            onClose();
        } catch (error: any) {
            console.error("Failed to register user:", error);
            setErrorMessage(error?.data?.message || 'Failed to create user. Please check your data.');
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
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Create New User</h3>
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

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-5 flex-1 overflow-y-auto space-y-4">
                        
                        {errorMessage && (
                            <div className="p-3 text-xs bg-red-50 text-red-600 rounded-xl font-medium border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30">
                                {errorMessage}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label htmlFor="firstName" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    id="firstName"
                                    required
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-blue-500 transition font-medium text-slate-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                    placeholder="Ahmed"
                                />
                            </div>

                            <div className="flex-1">
                                <label htmlFor="lastName" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    id="lastName"
                                    required
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-blue-500 transition font-medium text-slate-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                    placeholder="Alami"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                                Username <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                id="username"
                                required
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-blue-500 transition font-medium text-slate-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                placeholder="ahmed_alami"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="email" 
                                id="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-blue-500 transition font-medium text-slate-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                placeholder="exemple@flink.ma"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="password" 
                                id="password"
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-blue-500 transition font-medium text-slate-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label htmlFor="roleId" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                                User Profile / Role <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="roleId"
                                required
                                value={formData.roleId}
                                onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                                className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-blue-500 transition font-semibold text-slate-700 dark:text-white cursor-pointer"
                            >
                                <option value="">Select a Role</option>
                                {isLoadingRoles ? (
                                    <option disabled>Loading roles...</option>
                                ) : (
                                    rolesList.map((role: any) => (
                                        <option key={role.id} value={role.id}>
                                            {role.name || role.role_name}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>

                    </div>

                    <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900">
                        <button 
                            type="submit"
                            disabled={isCreating}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 cursor-pointer shadow-lg shadow-blue-500/10 text-sm"
                        >
                            {isCreating ? "Creating User..." : "Create User"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default CreateUser;