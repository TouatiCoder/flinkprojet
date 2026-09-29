import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import Badge from "../../../ui/badge/Badge";
import { ArrowUp, ArrowDown, Eye, Edit, MoreVertical } from "lucide-react";

export interface Ville {
  ville_id: number;
  name: string;
  pays: string;
  latitude: number;
  longitude: number;
  compteur_search: number;
  compteur_publications: number;
  status: boolean;
}

interface VilleTableProps {
  villeList: Ville[];
  onRowClick?: (ville: Ville) => void;
}

type SortField = keyof Ville | null;
type SortDirection = "asc" | "desc";

const VilleTable: React.FC<VilleTableProps> = ({ villeList, onRowClick }) => {
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: keyof Ville) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedVilles = [...villeList].sort((a, b) => {
    if (!sortField) return 0;

    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    if (typeof aValue === "boolean" && typeof bValue === "boolean") {
       return sortDirection === "asc" ? (aValue === bValue ? 0 : aValue ? -1 : 1) : (aValue === bValue ? 0 : aValue ? 1 : -1);
    }

    return 0;
  });

  const renderSortIcon = (field: keyof Ville) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4 ml-1 inline" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1 inline" />
    );
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <Table className="min-w-[1000px] w-full whitespace-nowrap">
        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
          <TableRow>
            <TableCell isHeader className="w-[80px] px-5 py-3 font-medium text-gray-700 text-start text-theme-xs dark:text-gray-400">
              <div className="flex items-center cursor-pointer hover:text-gray-900" onClick={() => handleSort("ville_id")}>
                ID {renderSortIcon("ville_id")}
              </div>
            </TableCell>
            <TableCell isHeader className="w-[200px] px-5 py-3 font-medium text-gray-700 text-start text-theme-xs dark:text-gray-400">
              <div className="flex items-center cursor-pointer hover:text-gray-900" onClick={() => handleSort("name")}>
                Nom {renderSortIcon("name")}
              </div>
            </TableCell>
            <TableCell isHeader className="w-[200px] px-5 py-3 font-medium text-gray-700 text-start text-theme-xs dark:text-gray-400">
              <div className="flex items-center cursor-pointer hover:text-gray-900" onClick={() => handleSort("pays")}>
                Pays {renderSortIcon("pays")}
              </div>
            </TableCell>
            <TableCell isHeader className="w-[150px] px-5 py-3 font-medium text-gray-700 text-start text-theme-xs dark:text-gray-400">
              <div className="flex items-center cursor-pointer hover:text-gray-900" onClick={() => handleSort("latitude")}>
                Latitude {renderSortIcon("latitude")}
              </div>
            </TableCell>
            <TableCell isHeader className="w-[150px] px-5 py-3 font-medium text-gray-700 text-start text-theme-xs dark:text-gray-400">
              <div className="flex items-center cursor-pointer hover:text-gray-900" onClick={() => handleSort("longitude")}>
                Longitude {renderSortIcon("longitude")}
              </div>
            </TableCell>
            <TableCell isHeader className="w-[150px] px-5 py-3 font-medium text-gray-700 text-center text-theme-xs dark:text-gray-400">
              <div className="flex items-center justify-center cursor-pointer hover:text-gray-900" onClick={() => handleSort("compteur_search")}>
                Recherches {renderSortIcon("compteur_search")}
              </div>
            </TableCell>
            <TableCell isHeader className="w-[150px] px-5 py-3 font-medium text-gray-700 text-center text-theme-xs dark:text-gray-400">
              <div className="flex items-center justify-center cursor-pointer hover:text-gray-900" onClick={() => handleSort("compteur_publications")}>
                Publications {renderSortIcon("compteur_publications")}
              </div>
            </TableCell>
            <TableCell isHeader className="w-[100px] px-5 py-3 font-medium text-gray-700 text-start text-theme-xs dark:text-gray-400">
              <div className="flex items-center cursor-pointer hover:text-gray-900" onClick={() => handleSort("status")}>
                Statut {renderSortIcon("status")}
              </div>
            </TableCell>
            <TableCell isHeader className="w-[120px] px-5 py-3 font-medium text-gray-700 text-center text-theme-xs dark:text-gray-400">
              Actions
            </TableCell>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {sortedVilles.map((ville) => (
            <TableRow
              key={ville.ville_id}
              onClick={() => onRowClick?.(ville)}
              className={onRowClick ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors" : ""}
            >
              <TableCell className="px-5 py-4 text-gray-700 text-start text-theme-sm dark:text-gray-400 font-medium whitespace-nowrap">
                #{ville.ville_id}
              </TableCell>
              <TableCell className="px-5 py-4 text-start text-gray-900 text-theme-sm dark:text-white/90 font-semibold whitespace-nowrap">
                {ville.name}
              </TableCell>
              <TableCell className="px-4 py-4 text-gray-700 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                {ville.pays}
              </TableCell>
              <TableCell className="px-4 py-4 text-gray-700 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                {ville.latitude}
              </TableCell>
              <TableCell className="px-4 py-4 text-gray-700 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                {ville.longitude}
              </TableCell>
              <TableCell className="px-4 py-4 text-gray-700 text-center text-theme-sm dark:text-gray-400">
                {ville.compteur_search}
              </TableCell>
              <TableCell className="px-4 py-4 text-gray-700 text-center text-theme-sm dark:text-gray-400">
                {ville.compteur_publications}
              </TableCell>
              <TableCell className="px-4 py-4 text-gray-700 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                <Badge
                  size="sm"
                  color={ville.status ? "success" : "error"}
                >
                  {ville.status ? "Actif" : "Inactif"}
                </Badge>
              </TableCell>
              <TableCell className="px-4 py-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <button className="p-1.5 text-blue-600 hover:text-blue-700 bg-white hover:bg-gray-50 rounded border border-gray-200 transition-colors" onClick={(e) => e.stopPropagation()}>
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-blue-600 hover:text-blue-700 bg-white hover:bg-gray-50 rounded border border-gray-200 transition-colors" onClick={(e) => e.stopPropagation()}>
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-gray-500 hover:text-gray-700 bg-white hover:bg-gray-50 rounded border border-gray-200 transition-colors" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default VilleTable;
