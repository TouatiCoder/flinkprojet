import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import { useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react"; // or your preferred icon library
import { Tag, useToggleTagFieldMutation } from "../../../services/tagsApi";
import ModalButtonUpdateTag from "../../buttons/ModalButtonUpdateTag";
import ModalButtonDeleteTag from "../../buttons/ModalButtonDeleteTag";
import Switch from "../../form/switch/Switch";

interface TagsTableProps {
  tags: Tag[];
  refetch: () => void;
}

type SortField = keyof Tag | null;
type SortDirection = "asc" | "desc";

const TagsTable: React.FC<TagsTableProps> = ({ tags, refetch }) => {
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [toggleTagField] = useToggleTagFieldMutation();
  const [localTagStates, setLocalTagStates] = useState<Record<number, { mngr_is_index: number; canonical_parent: boolean }>>({});

  const handleSort = (field: keyof Tag) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedTags = [...tags].sort((a, b) => {
    if (!sortField) return 0;

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

  const renderSortIcon = (field: keyof Tag) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3 h-3 ml-1 inline" />
    ) : (
      <ArrowDown className="w-3 h-3 ml-1 inline" />
    );
  };

  const handleToggleField = async (tag: Tag, field: 'mngr_is_index' | 'canonical_parent', value: any) => {
    // If we're toggling mngr_is_index and it's currently 2 (301), and we turn it "OFF" as a boolean switch, we set it to 0.
    // However, the switches are now more complex.

    const oldValue = getFieldValue(tag, field);
    const oldCanonicalValue = getFieldValue(tag, 'canonical_parent');

    setLocalTagStates(prev => {
      const current = prev[tag.id] || {};
      let newVal = value;
      let newCanonical = current.canonical_parent ?? oldCanonicalValue;

      if (field === 'mngr_is_index') {
        if (typeof value === 'boolean') {
          newVal = value ? 1 : 0;
        } else {
          newVal = value; // Keep 0, 1, or 2
        }

        // Disable canonical if turning on (1 or 2)
        if (newVal === 1 || newVal === 2) {
          newCanonical = false;
        }
      } else if (field === 'canonical_parent') {
        newCanonical = value;
      }

      return {
        ...prev,
        [tag.id]: {
          ...current,
          [field]: newVal,
          canonical_parent: newCanonical
        }
      };
    });

    try {
      await toggleTagField({
        tagId: tag.id.toString(),
        field: field,
        value: typeof value === 'boolean' ? (value ? '1' : '0') : value,
      }).unwrap();

      if (field === 'mngr_is_index' && (value === true || value === 1 || value === 2)) {
        await toggleTagField({
          tagId: tag.id.toString(),
          field: 'canonical_parent',
          value: '0',
        }).unwrap();
      }

      refetch();
    } catch (err) {
      console.error('Failed to toggle:', err);
      // Revert to old values on failure
      setLocalTagStates(prev => ({
        ...prev,
        [tag.id]: {
          ...prev[tag.id],
          [field]: oldValue,
          canonical_parent: oldCanonicalValue
        }
      }));
    }
  };

  const getFieldValue = (tag: Tag, field: 'mngr_is_index' | 'canonical_parent'): any => {
    const val = (localTagStates[tag.id] && localTagStates[tag.id][field] !== undefined)
      ? localTagStates[tag.id][field]
      : tag[field];

    if (val === undefined || val === null) return false;
    if (typeof val === 'boolean') return val;
    if (typeof val === 'number') return val !== 0; // Standard boolean conversion for switches
    return false;
  };

  // Dedicated helper to get raw numeric value for mngr_is_index checks (like 2 for 301)
  const getRawFieldValue = (tag: Tag, field: 'mngr_is_index' | 'canonical_parent'): any => {
    if (localTagStates[tag.id] && localTagStates[tag.id][field] !== undefined) {
      return localTagStates[tag.id][field];
    }
    return tag[field];
  };

  const isCanonicalParentDisabled = (tag: Tag): boolean => {
    const mngrIndex = getRawFieldValue(tag, 'mngr_is_index');
    return mngrIndex === 1 || mngrIndex === 2 || mngrIndex === true || mngrIndex === '1' || mngrIndex === '2';
  };


  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="w-full overflow-x-auto">
        <Table style={{ tableLayout: 'fixed', width: '100%', wordWrap: 'break-word' }}>
          <colgroup>
            <col style={{ width: '120px' }} />
            <col style={{ width: '70px' }} />
            <col style={{ width: '60px' }} />
            <col style={{ width: '80px' }} />
            <col style={{ width: '50px' }} />
            <col style={{ width: '55px' }} />
            <col style={{ width: '50px' }} />
            <col style={{ width: '60px' }} />
            <col style={{ width: '60px' }} />
            <col style={{ width: '70px' }} />
            <col style={{ width: '70px' }} />
            <col style={{ width: '60px' }} />
            <col style={{ width: '60px' }} />
          </colgroup>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-4 py-2.5 font-medium text-gray-500 text-center text-xs dark:text-gray-400"
                style={{ width: '120px', boxSizing: 'border-box' }}
              >
                <div
                  className="flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                  onClick={() => handleSort("name")}
                >
                  Name {renderSortIcon("name")}
                </div>
              </TableCell>
              <TableCell
                isHeader
                className="px-3 py-2.5 font-medium text-gray-500 text-center text-xs dark:text-gray-400"
                style={{ width: '70px', boxSizing: 'border-box' }}
              >
                301 Redirect
              </TableCell>
              <TableCell
                isHeader
                className="px-3 py-2.5 font-medium text-gray-500 text-center text-xs dark:text-gray-400"
                style={{ width: '60px', boxSizing: 'border-box' }}
              >
                Indexation
              </TableCell>
              <TableCell
                isHeader
                className="px-3 py-2.5 font-medium text-gray-500 text-center text-xs dark:text-gray-400"
                style={{ width: '80px', minWidth: '80px', maxWidth: '80px' }}
              >
                Canonical P
              </TableCell>
              <TableCell
                isHeader
                className="px-2 py-2.5 font-medium text-start text-xs dark:text-gray-400"
                style={{ width: '50px', minWidth: '50px', maxWidth: '50px' }}
              >
                <div
                  className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                  onClick={() => handleSort("master")}
                >
                  Master {renderSortIcon("master")}
                </div>
              </TableCell>
              <TableCell
                isHeader
                className="px-2 py-2.5 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                style={{ width: '55px', boxSizing: 'border-box' }}
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
                className="px-2 py-2.5 font-medium text-gray-500 text-center text-xs dark:text-gray-400"
                style={{ width: '50px', boxSizing: 'border-box' }}
              >
                <div
                  className="flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                  onClick={() => handleSort("compteur_search")}
                >
                  Search {renderSortIcon("compteur_search")}
                </div>
              </TableCell>
              <TableCell
                isHeader
                className="px-2 py-2.5 font-medium text-gray-500 text-center text-xs dark:text-gray-400"
                style={{ width: '60px', boxSizing: 'border-box' }}
              >
                <div
                  className="flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                  onClick={() => handleSort("total_pub_compteur")}
                >
                  Total Publication {renderSortIcon("total_pub_compteur")}
                </div>
              </TableCell>
              <TableCell
                isHeader
                className="px-2 py-2.5 font-medium text-gray-500 text-center text-xs dark:text-gray-400"
                style={{ width: '60px', boxSizing: 'border-box' }}
              >
                <div
                  className="flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                  onClick={() => handleSort("compteur_publications")}
                >
                  Publications {renderSortIcon("compteur_publications")}
                </div>
              </TableCell>
              <TableCell
                isHeader
                className="px-1 py-2.5 font-medium text-gray-500 text-center text-xs dark:text-gray-400"
                style={{ width: '70px', boxSizing: 'border-box' }}
              >
                <div
                  className="flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                  onClick={() => handleSort("created_at")}
                >
                  Created {renderSortIcon("created_at")}
                </div>
              </TableCell>
              <TableCell
                isHeader
                className="px-1 py-2.5 font-medium text-gray-500 text-center text-xs dark:text-gray-400"
                style={{ width: '70px', boxSizing: 'border-box' }}
              >
                <div
                  className="flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                  onClick={() => handleSort("updated_at")}
                >
                  Updated {renderSortIcon("updated_at")}
                </div>
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {sortedTags.map((tag, index) => {
              const dateCreatedAt = new Date(tag.created_at);
              const dateUpdatedAt = new Date(tag.updated_at);
              const isUpdatedSameAsCreated = dateUpdatedAt.getTime() === dateCreatedAt.getTime();

              // Format date and time separately in 24-hour format
              const formatDateTime = (date: Date) => {
                const dateStr = date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
                });
                const timeStr = date.toLocaleTimeString('en-US', {
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                });
                return { date: dateStr, time: timeStr };
              };

              const createdDateTime = formatDateTime(dateCreatedAt);
              const updatedDateTime = formatDateTime(dateUpdatedAt);
              // const lastConnexionDate = tag.latest_connexion?.date_connexion 
              //   ? new Date(tag.latest_connexion.date_connexion).toLocaleString() 
              //   : "___";

              const isEven = index % 2 === 0;

              return (
                <TableRow
                  key={tag.id}
                  className={isEven ? "bg-gray-50/50 dark:bg-white/[0.02]" : ""}
                >
                  <TableCell className="px-4 py-2 text-gray-500 text-center text-xs dark:text-gray-400" style={{ width: '120px', boxSizing: 'border-box', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                    <div className="break-words" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                      <a
                        href={`https://flink.ma/${tag.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline cursor-pointer"
                        style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                      >
                        {tag.name}
                      </a>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-2 text-gray-500 text-center text-xs dark:text-gray-400" style={{ width: '70px', boxSizing: 'border-box' }}>
                    <div className="flex justify-center">
                      <div className="scale-75 origin-center">
                        <Switch
                          label=""
                          checked={getRawFieldValue(tag, 'mngr_is_index') == 2}
                          onChange={(checked) => handleToggleField(tag, 'mngr_is_index', checked ? 2 : 1)}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-2 text-gray-500 text-center text-xs dark:text-gray-400" style={{ width: '60px', boxSizing: 'border-box' }}>
                    <div className="flex justify-center">
                      <div className="scale-75 origin-center">
                        <Switch
                          label=""
                          checked={getRawFieldValue(tag, 'mngr_is_index') == 1 || getRawFieldValue(tag, 'mngr_is_index') == 2}
                          onChange={(checked) => handleToggleField(tag, 'mngr_is_index', checked)}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-2 text-gray-500 text-center text-xs dark:text-gray-400" style={{ width: '80px', minWidth: '80px', maxWidth: '80px' }}>
                    <div className="flex justify-center">
                      <div className="scale-75 origin-center">
                        <Switch
                          label=""
                          checked={getFieldValue(tag, 'canonical_parent')}
                          onChange={(checked) => handleToggleField(tag, 'canonical_parent', checked)}
                          disabled={isCanonicalParentDisabled(tag)}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-2 text-gray-500 text-start text-xs dark:text-gray-400" style={{ width: '50px', minWidth: '50px', maxWidth: '50px' }}>
                    {tag.master !== null && tag.master !== undefined ? (
                      <div className="relative inline-block">
                        <span
                          className={`w-4 h-4 rounded-full inline-block cursor-help relative flex items-center justify-center ${tag.master_tag && tag.master_tag.mngr_is_index === 2
                            ? 'bg-red-600 ring-[3px] ring-inset ring-yellow-400' // Inset 3px yellow ring
                            : tag.master_tag && tag.master_tag.mngr_is_index === 0
                              ? 'bg-orange-500'
                              : 'bg-success-500'
                            }`}
                          title={
                            tag.master_tag && tag.master_tag.mngr_is_index === 0
                              ? `Warning: Master tag "${tag.master_tag.name}" has mngr_is_index = 0`
                              : tag.master_tag?.name || ''
                          }
                        >
                          {tag.master_tag && tag.master_tag.mngr_is_index === 0 && (
                            <span
                              className="absolute text-white font-bold text-sm leading-none"
                              style={{
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)'
                              }}
                            >
                              !
                            </span>
                          )}
                        </span>
                      </div>
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-error-500 inline-block"></span>
                    )}
                  </TableCell>
                  <TableCell className="px-2 py-2 text-gray-500 text-start text-xs dark:text-gray-400" style={{ width: '55px', boxSizing: 'border-box' }}>
                    <Badge
                      size="sm"
                      color={
                        tag.status == 1
                          ? "success"
                          : "error"
                      }
                    >
                      {tag.status == 1 ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-2 py-2 text-gray-500 text-center text-xs dark:text-gray-400" style={{ width: '50px', boxSizing: 'border-box' }}>
                    {tag.compteur_search}
                  </TableCell>
                  <TableCell className="px-2 py-2 text-gray-500 text-center text-xs dark:text-gray-400" style={{ width: '60px', boxSizing: 'border-box' }}>
                    {tag.total_pub_compteur ?? '-'}
                  </TableCell>
                  <TableCell className="px-2 py-2 text-gray-500 text-center text-xs dark:text-gray-400" style={{ width: '60px', boxSizing: 'border-box' }}>
                    {tag.compteur_publications}
                  </TableCell>
                  <TableCell className="px-1 py-2 text-gray-500 text-center text-xs dark:text-gray-400" style={{ width: '70px', boxSizing: 'border-box' }}>
                    <div className="break-words">
                      <div>{createdDateTime.date}</div>
                      <div>{createdDateTime.time}</div>
                    </div>
                  </TableCell>
                  <TableCell className="px-1 py-2 text-gray-500 text-center text-xs dark:text-gray-400" style={{ width: '70px', boxSizing: 'border-box' }}>
                    <div className="break-words">
                      {isUpdatedSameAsCreated ? (
                        <span
                          title={`Same as created at: ${createdDateTime.date} ${createdDateTime.time}`}
                          className="text-gray-400 dark:text-gray-500"
                        >
                          ---
                        </span>
                      ) : (
                        <>
                          <div>{updatedDateTime.date}</div>
                          <div>{updatedDateTime.time}</div>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-0.5 py-2 text-center" style={{ width: '60px', boxSizing: 'border-box' }}>
                    <div className="flex justify-center items-center">
                      <ModalButtonUpdateTag tag={tag} refetch={refetch} />
                    </div>
                  </TableCell>
                  <TableCell className="px-0.5 py-2 text-center" style={{ width: '60px', boxSizing: 'border-box' }}>
                    <div className="flex justify-center items-center">
                      <ModalButtonDeleteTag tag={tag} refetch={refetch} />
                    </div>
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

export default TagsTable;