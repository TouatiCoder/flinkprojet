interface TabItem {
    id: string;
    label: string;
    count: string | number;
    colorClass: {
        active: string;
        badge: string;
    };
}

interface UserStatusTabsProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export default function UserStatusTabs({ activeTab, setActiveTab }: UserStatusTabsProps) {

    const tabs: TabItem[] = [
        {
            id: 'all',
            label: 'Tous',
            count: '152 458',
            colorClass: { active: '', badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' }
        },
        {
            id: 'active',
            label: 'Actifs',
            count: '145 622',
            colorClass: { active: '', badge: 'bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-400' }
        },
        {
            id: 'new',
            label: 'Nouveaux (7j)',
            count: '3 882',
            colorClass: { active: '', badge: 'bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400' }
        },
        {
            id: 'inactive',
            label: 'Inactifs 30j',
            count: '18 742',
            colorClass: { active: '', badge: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' }
        },
        {
            id: 'pro',
            label: 'Avec Compte Pro',
            count: '2 450',
            colorClass: { active: '', badge: 'bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-400' }
        },
        {
            id: 'no-pro',
            label: 'Sans Compte Pro',
            count: '150 008',
            colorClass: { active: '', badge: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' }
        },
        {
            id: 'expired',
            label: 'Abonnement expiré',
            count: '320',
            colorClass: { active: '', badge: 'bg-orange-50 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400' }
        },
        {
            id: 'reported',
            label: 'Signalés',
            count: '45',
            colorClass: { active: '', badge: 'bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400' }
        },
    ];

    return (
        <div className="w-[100%] max-w-[1100px] p-[14px] overflow-x-auto bg-white dark:bg-gray-900 p-2 pb-2 mb-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm scrollbar-none">

            <div className="flex items-center gap-12 min-w-max ">
                {tabs.map((tab) => {
                    const isSelected = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${isSelected
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            <span>{tab.label}</span>
                            <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${tab.colorClass.badge
                                }`}>
                                {tab.count}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}