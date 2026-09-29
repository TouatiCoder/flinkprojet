import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import { mediaBaseUrl } from "../../../constants/publicConstants";
import { Publication } from "../../../services/publicationsApi";
import { useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import ModalButtonUpdatePublication from "../../buttons/ModalButtonUpdatePublication";
import ModalButtonDeletePublication from "../../buttons/ModalButtonDeletePublication";

interface PublicationsTableProps {
  publications: Publication[];
  refetch: () => void;
}

type SortField = keyof Publication | null;
type SortDirection = "asc" | "desc";

const PublicationsTable: React.FC<PublicationsTableProps> = ({ publications, refetch }) => {
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: keyof Publication) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedPublications = [...publications].sort((a, b) => {
    if (!sortField) return 0;

    // Handle nested object sorting
    if (sortField === "user") {
      const aValue = a.user?.slug || "";
      const bValue = b.user?.slug || "";
      return sortDirection === "asc" 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }

    if (sortField === "etablissement") {
      const aValue = a.etablissement?.slug || "";
      const bValue = b.etablissement?.slug || "";
      return sortDirection === "asc" 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }

    const aValue = a[sortField];
    const bValue = b[sortField];

    // Handle null/undefined values
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    // Handle string comparison
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    // Handle number comparison
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    // Handle date comparison
    if (sortField === "created_at") {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    }

    return 0;
  });

  const renderSortIcon = (field: keyof Publication) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4 ml-1 inline" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1 inline" />
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Publication
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                <div 
                  className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                  onClick={() => handleSort("slug")}
                >
                  Slug {renderSortIcon("slug")}
                </div>
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                <div 
                  className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                  onClick={() => handleSort("tele")}
                >
                  Telephone {renderSortIcon("tele")}
                </div>
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                <div 
                  className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                  onClick={() => handleSort("tele_whatsapp")}
                >
                  WhatsApp {renderSortIcon("tele_whatsapp")}
                </div>
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                <div 
                  className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                  onClick={() => handleSort("status")}
                >
                  Status {renderSortIcon("status")}
                </div>
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                <div 
                  className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                  onClick={() => handleSort("user")}
                >
                  User {renderSortIcon("user")}
                </div>
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                <div 
                  className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                  onClick={() => handleSort("etablissement")}
                >
                  Etablissement {renderSortIcon("etablissement")}
                </div>
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                <div 
                  className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                  onClick={() => handleSort("created_at")}
                >
                  Created At {renderSortIcon("created_at")}
                </div>
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Plus
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Action
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {sortedPublications.map((publication) => {
              const dateCreatedAt = new Date(publication.created_at);
              return (
                <TableRow key={publication.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 overflow-hidden rounded-full">
                        {publication.image_default ? (
                          <img
                            width={40}
                            height={40}
                            src={mediaBaseUrl + publication.image_default}
                            alt={publication.slug}
                          />
                        ) : (
                          <img
                            width={40}
                            height={40}
                            src="/images/user/default-avatar-user.jpg"
                            alt={publication.slug}
                          />
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <a 
                      href={`https://flink.ma/publication/${publication.slug}`} 
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {publication.slug}
                    </a>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {publication.tele || "___"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {publication.tele_whatsapp || "___"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={publication.status === 1 ? "success" : publication.status === 0 ? "warning" : "error"}
                    >
                      {publication.status === 1 ? "Active" : publication.status === 0 ? "Pending" : publication.status === 2 ? "Deleted" : "Rejected"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {publication?.user?.slug || "___"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {publication?.etablissement?.slug || "___"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {dateCreatedAt.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <ModalButtonUpdatePublication publication= {publication} refetch={refetch} />
                  </TableCell>
                  <TableCell>
                    <ModalButtonDeletePublication publication= {publication} refetch={refetch} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PublicationsTable;