type PaginationProps = {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  /**
   * Conservée pour compatibilité avec les écrans qui la passent
   * (MembresTable, EquipeDataGrid, WhatsappTable).
   *
   * Cette implémentation rend TOUJOURS « Previous » et « Next », désactivés
   * quand ils ne mènent nulle part : le comportement demandé par la prop est
   * donc déjà le comportement par défaut, et la passer ne change rien.
   */
  alwaysShowNav?: boolean;
};

const Pagination = ({
  totalPages,
  currentPage,
  onPageChange,
}: PaginationProps) => {
  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.min(
    Math.max(1, currentPage),
    safeTotalPages
  );

  const handlePageChange = (page: number) => {
    if (
      page >= 1 &&
      page <= safeTotalPages &&
      page !== safeCurrentPage
    ) {
      onPageChange(page);
    }
  };

  /**
   * Génère les pages à afficher.
   *
   * Exemple :
   * 1 2 3 4 5
   *
   * ou :
   * 1 ... 4 5 6 ... 20
   */
  const getPageNumbers = (): (number | string)[] => {
    if (safeTotalPages <= 7) {
      return Array.from(
        { length: safeTotalPages },
        (_, index) => index + 1
      );
    }

    const pages: (number | string)[] = [];

    // Première page
    pages.push(1);

    if (safeCurrentPage <= 4) {
      pages.push(2, 3, 4, 5, "...", safeTotalPages);
      return pages;
    }

    if (safeCurrentPage >= safeTotalPages - 3) {
      pages.push(
        "...",
        safeTotalPages - 4,
        safeTotalPages - 3,
        safeTotalPages - 2,
        safeTotalPages - 1,
        safeTotalPages
      );

      return pages;
    }

    // Situation centrale
    pages.push(
      "...",
      safeCurrentPage - 1,
      safeCurrentPage,
      safeCurrentPage + 1,
      "...",
      safeTotalPages
    );

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-center py-4">
      <nav
        className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-2 shadow-md"
        aria-label="Pagination"
      >
        {/* Previous */}
        <button
          type="button"
          onClick={() =>
            handlePageChange(safeCurrentPage - 1)
          }
          disabled={safeCurrentPage === 1}
          className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-l-lg shadow-sm hover:bg-indigo-100 dark:hover:bg-gray-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {/* Pages */}
        {pageNumbers.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 select-none"
              >
                ...
              </span>
            );
          }

          const isActive = page === safeCurrentPage;

          return (
            <button
              key={`page-${page}`}
              type="button"
              onClick={() =>
                  typeof page === "number" &&
                  handlePageChange(page)
                }
              aria-current={
                isActive ? "page" : undefined
              }
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                isActive
                  ? "bg-indigo-600 dark:bg-indigo-700 text-white"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-gray-600 focus:outline-none"
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Next */}
        <button
          type="button"
          onClick={() =>
            handlePageChange(safeCurrentPage + 1)
          }
          disabled={
            safeCurrentPage === safeTotalPages
          }
          className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-r-lg shadow-sm hover:bg-indigo-100 dark:hover:bg-gray-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </nav>
    </div>
  );
};

export default Pagination;