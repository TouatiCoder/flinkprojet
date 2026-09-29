

import { useState } from 'react';
import CreateRole from './Create/CreateRole';
import CreateRoute from './Create/CreateRoute';
import CreatePermissions from './Create/CreatePermissions';
import CreateUser from './Create/CreateUser';

function RoleHeader() {
    const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
    const [isCreateRouteOpen, setIsCreateRouteOpen] = useState(false);
    const [isCreatePermissionsOpen, setIsCreatePermissionsOpen] = useState(false);
    const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);

    return (
        <>
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 py-2 px-2 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-xl md:text-2xl font-bold text-[#0f172a] dark:text-white tracking-tight">
                    Gestion des profiles
                </h2>

                <div className="flex space-x-4">

                    {/* <button className="flex items-center space-x-1.5 text-[#6366f1] dark:text-indigo-400 hover:text-[#4f46e5] dark:hover:text-indigo-300 font-semibold text-sm transition cursor-pointer"
                        onClick={() => setIsCreateRouteOpen(true)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        <span>Route</span>
                    </button> */}

                    <button className="flex items-center space-x-1.5 text-[#6366f1] dark:text-indigo-400 hover:text-[#4f46e5] dark:hover:text-indigo-300 font-semibold text-sm transition cursor-pointer"
                        onClick={() => setIsCreatePermissionsOpen(true)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        <span>Permissions</span>
                    </button>

                    <button 
                        onClick={() => setIsCreateRoleOpen(true)}
                        className="flex items-center space-x-1.5 text-[#6366f1] dark:text-indigo-400 hover:text-[#4f46e5] dark:hover:text-indigo-300 font-semibold text-sm transition cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        <span>Role</span>
                    </button>

                    <button 
                        onClick={() => setIsCreateUserOpen(true)}
                        className="flex items-center space-x-1.5 text-[#6366f1] dark:text-indigo-400 hover:text-[#4f46e5] dark:hover:text-indigo-300 font-semibold text-sm transition cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        <span>Utilisateur</span>
                    </button>
                </div>
            </div>

            <CreateRole 
                isOpen={isCreateRoleOpen} 
                onClose={() => setIsCreateRoleOpen(false)} 
            />

            <CreateRoute 
                isOpen={isCreateRouteOpen} 
                onClose={() => setIsCreateRouteOpen(false)} 
            />

            <CreatePermissions
                isOpen={isCreatePermissionsOpen}
                onClose={() => setIsCreatePermissionsOpen(false)}
            />

            <CreateUser
                isOpen={isCreateUserOpen}
                onClose={() => setIsCreateUserOpen(false)}
            />
        </>
    )
}

export default RoleHeader