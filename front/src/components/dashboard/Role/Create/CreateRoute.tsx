import React, { useState } from 'react';
import { useGetManagerRoutesQuery, useAddManagerRouteMutation } from '../../../../services/managerRoutesApi';

interface CreateRouteProps {
    isOpen: boolean;
    onClose: () => void;
}

interface RouteItem {
    id: number;
    name: string;
}

const CreateRoute: React.FC<CreateRouteProps> = ({ isOpen, onClose }) => {
    const [routeName, setRouteName] = useState("");

    const { data, isLoading } = useGetManagerRoutesQuery(undefined, {
        skip: !isOpen,
    });
    
    const [addManagerRoute, { isLoading: isAdding }] = useAddManagerRouteMutation();

    const routesList: RouteItem[] = Array.isArray(data as any)
    ? (data as any)
    : Array.isArray((data as any)?.data)
    ? (data as any).data
    : [];

    const handleCreate = async () => {
        if (!routeName.trim()) return;
        try {
            await addManagerRoute({ name: routeName.trim() }).unwrap();
            setRouteName("");
            onClose();
        } catch (error) {
            console.error("Failed to create route", error);
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
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Add New Route</h3>
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
                        <label htmlFor="routeName" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                            Route Name
                        </label>
                        <input
                            type="text"
                            id="routeName"
                            value={routeName}
                            onChange={(e) => setRouteName(e.target.value)}
                            className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#6366f1] dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-[#6366f1] transition font-medium text-slate-800 dark:text-white"
                            placeholder="e.g. users.index"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                            Existing Routes
                        </label>

                        {isLoading ? (
                            <div className="text-sm text-gray-500">Loading routes...</div>
                        ) : routesList.length === 0 ? (
                            <div className="text-sm text-gray-400">No routes found.</div>
                        ) : (
                            <div className="space-y-2">
                                {routesList.map((route) => (
                                    <div key={route.id} className="p-3 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/30 dark:bg-gray-800/50 flex justify-between items-center">
                                        <span className="text-sm font-bold text-slate-800 dark:text-gray-100">
                                            {route.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900">
                    <button 
                        type="button"
                        onClick={handleCreate}
                        disabled={isAdding || !routeName.trim()}
                        className="w-full bg-[#6366f1] dark:bg-indigo-600 hover:bg-[#4f46e5] dark:hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 cursor-pointer shadow-lg shadow-indigo-500/10 dark:shadow-indigo-900/20 text-sm"
                    >
                        {isAdding ? "Creating..." : "Create Route"}
                    </button>
                </div>
            </div>
        </>
    );
};

export default CreateRoute;