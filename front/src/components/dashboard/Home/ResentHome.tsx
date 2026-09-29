import React from "react";

const recentPurchases = [
  {
    id: 1,
    date: "27 Aug 2022 at 3.30 PM",
    name: "Hamida",
    phone: "0605606060",
    ville: "Casablanca",
    status: "Active",
  },
  {
    id: 2,
    date: "28 Aug 2022 at 10.15 AM",
    name: "Nour",
    phone: "0767676767",
    ville: "Rabat",
    status: "Active",
  },
  {
    id: 3,
    date: "29 Aug 2022 at 1.45 PM",
    name: "Yassine",
    phone: "0555555555",
    ville: "Rabat",
    status: "Active",
  },
];

const SortIcon = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block ml-1 text-gray-400"
  >
    <path
      d="M7 10L12 15L17 10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ResentHome: React.FC = () => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex justify-between items-center px-5 sm:px-6 py-5 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Recent Client
        </h3>
        <button className="text-sm font-medium text-gray-500 hover:text-gray-800 dark:hover:text-white/90 underline decoration-gray-300 dark:decoration-gray-700 underline-offset-4 transition-colors">
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm whitespace-nowrap">
          <thead className="border-b border-gray-100 dark:border-gray-800/50">
            <tr>
              <th className="px-5 sm:px-6 py-4 font-medium text-gray-500 dark:text-gray-400">
                Date <SortIcon />
              </th>
              <th className="px-5 sm:px-6 py-4 font-medium text-gray-500 dark:text-gray-400">
                User Name <SortIcon />
              </th>
              <th className="px-5 sm:px-6 py-4 font-medium text-gray-500 dark:text-gray-400">
                Télephone <SortIcon />
              </th>
              <th className="px-5 sm:px-6 py-4 font-medium text-gray-500 dark:text-gray-400">
                Ville <SortIcon />
              </th>
              <th className="px-5 sm:px-6 py-4 font-medium text-gray-500 dark:text-gray-400">
                Annonces <SortIcon />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
            {recentPurchases.map((purchase) => (
              <tr key={purchase.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="px-5 sm:px-6 py-4 font-medium text-gray-900 dark:text-white/90">
                  {purchase.date}
                </td>
                <td className="px-5 sm:px-6 py-4 text-gray-600 dark:text-gray-400">
                  {purchase.name}
                </td>
                <td className="px-5 sm:px-6 py-4 text-gray-600 dark:text-gray-400">
                  {purchase.phone}
                </td>
                <td className="px-5 sm:px-6 py-4 font-medium text-gray-900 dark:text-white/90">
                  {purchase.ville}
                </td>
                <td className="px-5 sm:px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      purchase.status === "Paid"
                        ? "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300"
                        : "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
                    }`}
                  >
                    {purchase.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResentHome;
