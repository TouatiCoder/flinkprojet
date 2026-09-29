import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import PublicationsTable from "../../components/tables/BasicTables/PublicationsTable";
import Pagination from "../../components/ui/pagination/Pagination";
import { useGetPublicationsQuery } from "../../services/publicationsApi";
import OrderFilter, { OrderOption } from "../../components/form/OrderFilter";
import Select from "../../components/form/Select";


export default function Publications() {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [currentOrder, setCurrentOrder] = useState<string>("updated");
    const [currentStatus, setCurrentStatus] = useState<string>("");
    
    const {data: publications, isLoading: publicationsIsLoading, refetch} = useGetPublicationsQuery(
        {page: currentPage, order: currentOrder, status: currentStatus},
        {refetchOnMountOrArgChange: true} // This ensures fresh data when args change
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleOrderChange = (option: string) => {
        setCurrentOrder(option);
        setCurrentPage(1); // Reset to first page when ordering changes
    };

    const handleSelectChange = (value: string) => {
        setCurrentStatus(value);
        setCurrentPage(1); // Reset to first page when status changes
    };

    // Force refetch when parameters change
    useEffect(() => {
        refetch();
    }, [currentPage, currentOrder, currentStatus, refetch]);


    const statusOptions = [
        { value: "0", label: "Inactive"},
        { value: "1", label: "Active"},
        { value: "2", label: "Deleted"},
    ];
    const OrderOptions: OrderOption[] = [
        { value: "new", label: "Newest" },
        { value: "old", label: "Oldest" },
        { value: "updated", label: "Last Updated" },
    ];

    if (publicationsIsLoading || !publications) return <div>Loading...</div>;

    return (
        <>
            <PageMeta
                title="Dashboard Publications"
                description="Dashboard page Publications Table"
            />
            <PageBreadcrumb pageTitle={`Publications (${publications.data.total})`} />
            <div className="flex justify-end p-2 space-x-3 my-2">
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
            {
                publications.data.total == 0 ? 
                <div>No Data Found</div>
                :
                <div className="space-y-6">
                    <PublicationsTable publications={publications.data.data} refetch={refetch} />
                    <Pagination 
                        totalPages={Math.ceil(publications.data.total / publications.data.per_page)}
                        currentPage={publications.data.current_page}
                        onPageChange={handlePageChange}
                    />
                </div>
            }
            
        </>
    );
}