import { useEffect, useState, useRef } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/ui/pagination/Pagination";
import { useGetTagsQuery } from "../../services/tagsApi";
import TagsTable from "../../components/tables/BasicTables/TagsTable";
import Select from "../../components/form/Select";
import OrderFilter, { OrderOption } from "../../components/form/OrderFilter";
import { Loader2 } from "lucide-react";

export default function Tags() {
  const [currentPage, setCurrentPage] = useState<number>(1);  // Track current page 
  const [currentOrder, setCurrentOrder] = useState<string>("new");
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const minDisplayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: tags, isLoading: tagsIsLoading, refetch } = useGetTagsQuery(
    { page: currentPage, order: currentOrder, status: currentStatus, search: debouncedSearchTerm, exact: true },
    { refetchOnMountOrArgChange: true } // This ensures fresh data when args change
  );
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Debounce search term - wait 350ms after user stops typing
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Show loading spinner after 350ms if there's a search term
    if (searchTerm.trim() !== '') {
      debounceTimerRef.current = setTimeout(() => {
        setIsSearching(true);
        setDebouncedSearchTerm(searchTerm);
        // Reset to page 1 when search term changes
        if (searchTerm !== debouncedSearchTerm) {
          setCurrentPage(1);
        }
      }, 350);
    } else {
      // If search is cleared, immediately update
      setIsSearching(false);
      setDebouncedSearchTerm('');
      setCurrentPage(1);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm, debouncedSearchTerm]);

  // Hide spinner when API call completes, but keep it visible for at least 200ms
  useEffect(() => {
    if (!tagsIsLoading && isSearching) {
      // Clear any existing timer
      if (minDisplayTimerRef.current) {
        clearTimeout(minDisplayTimerRef.current);
      }

      // Keep spinner visible for at least 200ms after API completes
      minDisplayTimerRef.current = setTimeout(() => {
        setIsSearching(false);
      }, 200);
    }

    return () => {
      if (minDisplayTimerRef.current) {
        clearTimeout(minDisplayTimerRef.current);
      }
    };
  }, [tagsIsLoading, isSearching]);

  useEffect(() => {
    refetch();
  }, [currentPage, currentOrder, currentStatus, debouncedSearchTerm, refetch]);

  const statusOptions = [
    { value: "1", label: "Active" },
    { value: "0", label: "Inactive" },
  ];
  const OrderOptions: OrderOption[] = [
    { value: "new", label: "Newest" },
    { value: "old", label: "Oldest" },
    { value: "high-search", label: "High Search" },
    { value: "high-publications", label: "High Publications" },
  ];
  const handleOrderChange = (option: string) => {
    setCurrentOrder(option);
    setCurrentPage(1); // Reset to first page when ordering changes
  };

  const handleSelectChange = (value: string) => {
    setCurrentStatus(value);
    setCurrentPage(1); // Reset to first page when status changes
  };


  if (tagsIsLoading || !tags) return <div>Loading . . .</div>
  return (
    <>
      <PageMeta
        title="Dashboard Tags"
        description="Dashboard page tags Table"
      />
      <PageBreadcrumb pageTitle={`Tags (${tags.data.total})`} />
      <div className="flex justify-between items-center p-2 space-x-3 my-2">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <span className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2">
              <svg
                className="fill-gray-500 dark:fill-gray-400"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                  fill=""
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search for tag"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-10 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
            {(tagsIsLoading || isSearching) && searchTerm && (
              <span className="absolute -translate-y-1/2 pointer-events-none right-3 top-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-500 dark:text-gray-400" />
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5 ml-1 text-[10px] text-gray-500 font-medium">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success-500"></span>
              <span>Parent Indexed</span>
            </div>
            <div className="flex items-center gap-1.5 ml-1">
              <span className="w-2 h-2 rounded-full bg-red-600 ring-[2px] ring-inset ring-yellow-400"></span>
              <span>Parent 301 Redirect</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              <span>Parent Not Indexed</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-error-500"></span>
              <span>No Parent</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <div>
            <Select
              options={statusOptions}
              placeholder="Status"
              onChange={handleSelectChange}
              className="dark:bg-dark-900"
              defaultValue={currentStatus}
              placeholderDisabled={false}
            />
          </div>
          <OrderFilter
            onOptionChange={handleOrderChange}
            initialOption={currentOrder}
            options={OrderOptions}
          />
        </div>
      </div>
      <div className="space-y-6">
        <TagsTable tags={tags.data.data || []} refetch={refetch} />
        {tags.data.total > 0 && (
          <Pagination
            totalPages={Math.ceil(tags.data.total / tags.data.per_page)}
            currentPage={tags.data.current_page}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </>
  );
}
