const countryData = [
  { name: "Casablanca", percentage: 50 },
  { name: "Rabat", percentage: 20 },
  { name: "Oujda", percentage: 10 },
];

export default function DiffHome() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 py-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:py-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Top Villes
        </h3>
        <button className="text-sm font-medium text-gray-500 hover:text-gray-800 dark:hover:text-white/90 underline decoration-gray-300 dark:decoration-gray-700 underline-offset-4 transition-colors">
          View All
        </button>
      </div>

      <div className="space-y-5">
        {countryData.map((country, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {country.name}
              </span>
              <span className="text-sm font-bold text-[#465FFF]">
                {country.percentage}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full dark:bg-gray-800">
              <div
                className="h-3 bg-[#465FFF] rounded-full"
                style={{ width: `${country.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
