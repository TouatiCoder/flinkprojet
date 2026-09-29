import React, { useState, useEffect, useRef, useCallback } from "react";
import { Tag } from "../../services/tagsApi";
import { ApiBaseUrl } from "../../constants/publicConstants";
import { getCookie } from "../../utils/cookies";
import { Loader2, ChevronRight } from "lucide-react";
import Input from "./input/InputField";
import Label from "./Label";

interface TagSearchSelectProps {
    value?: Tag | null;
    onChange: (tag: Tag | null) => void;
    placeholder?: string;
    className?: string;
    label?: string;
    excludeTagId?: number;
}

const TagSearchSelect: React.FC<TagSearchSelectProps> = ({
    value,
    onChange,
    placeholder = "Search tags...",
    className = "",
    label,
    excludeTagId,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [tags, setTags] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inputRef = useRef<HTMLDivElement>(null);

    // Fetch tags from API
    const fetchTags = useCallback(async (search: string) => {
        if (!search.trim()) {
            setTags([]);
            setIsOpen(false);
            setError(null);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${ApiBaseUrl}tags?search=${encodeURIComponent(search)}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getCookie("TOKEN")}`,
                },
            });

            if (res.ok) {
                const result = await res.json();
                if (result.status === 500 || result.error) {
                    console.error("API Error:", result.error || result.message);
                    setError(result.error || "An unknown backend error occurred.");
                    setTags([]);
                    setIsOpen(false);
                    return;
                }
                if (result && result.data) {
                    // Filter tags: exclude the current tag if needed (backend already filters by mngr_is_index = 1)
                    const filteredTags = excludeTagId
                        ? result.data.filter((tag: Tag) => tag.id !== excludeTagId)
                        : result.data;
                    setTags(filteredTags);
                    setIsOpen(filteredTags.length > 0);
                } else {
                    setTags([]);
                    setIsOpen(false);
                }
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.error("API Error:", errorData.error || `HTTP ${res.status}`);
                setError(errorData.error || `Failed to fetch tags: HTTP ${res.status}`);
                setTags([]);
                setIsOpen(false);
            }
        } catch (error) {
            console.error("Error fetching tags:", error);
            setError("Network error or API is unreachable.");
            setTags([]);
            setIsOpen(false);
        } finally {
            setIsLoading(false);
        }
    }, [excludeTagId]);

    // Debounced search
    useEffect(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            fetchTags(searchTerm);
        }, 500);

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [searchTerm, fetchTags]);

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearchTerm(newValue);
        if (!newValue.trim()) {
            setIsOpen(false);
            setTags([]);
            setError(null);
        }
    };

    // Handle tag selection
    const handleSelectTag = (tag: Tag) => {
        onChange(tag);
        setSearchTerm(tag.name);
        setIsOpen(false);
        setTags([]);
        setError(null);
    };

    // Handle input focus
    const handleFocus = useCallback(() => {
        if (searchTerm.trim() && tags.length > 0) {
            setIsOpen(true);
        } else if (searchTerm.trim() && !isLoading) {
            fetchTags(searchTerm);
        }
    }, [searchTerm, tags.length, isLoading, fetchTags]);

    // Add focus event listener
    useEffect(() => {
        const input = inputRef.current?.querySelector('input');
        if (input) {
            input.addEventListener('focus', handleFocus);
            return () => {
                input.removeEventListener('focus', handleFocus);
            };
        }
    }, [handleFocus]);

    // Handle clear selection
    const handleClear = () => {
        onChange(null);
        setSearchTerm("");
        setIsOpen(false);
        setTags([]);
        setError(null);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                if (value) {
                    setSearchTerm(value.name);
                } else {
                    setSearchTerm("");
                }
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }
    }, [isOpen, value]);

    // Initialize search term
    useEffect(() => {
        if (value) {
            setSearchTerm(value.name);
        } else {
            setSearchTerm("");
        }
    }, [value]);

    return (
        <div className={className}>
            {label && (
                <Label htmlFor={`tag-search-input-${label}`}>{label}</Label>
            )}
            <div className="relative" ref={inputRef}>
                {/* Hidden input to prevent browser autofill */}
                <input
                    type="text"
                    autoComplete="off"
                    style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
                    tabIndex={-1}
                    readOnly
                />
                <Input
                    type="text"
                    id={`tag-search-input-${label}`}
                    name={`tag-search-${Date.now()}`}
                    value={searchTerm}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className="pr-10"
                    autoComplete="off"
                />
                {isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    </div>
                )}
                {value && !isLoading && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                )}

                {/* Dropdown - Positioned above input */}
                {isOpen && tags.length > 0 && (
                    <div
                        className="absolute bottom-full left-0 right-0 mb-1 z-[100] bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                        style={{
                            maxHeight: '300px',
                        }}
                    >
                        <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
                            {tags.map((tag) => (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => handleSelectTag(tag)}
                                    className={`w-full text-left px-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0 ${tag.parents && tag.parents.length > 0 ? 'py-[11px]' : 'py-3'
                                        }`}
                                >
                                    <div className="flex flex-col items-start w-full">
                                        {/* Parent hierarchy breadcrumb */}
                                        {tag.parents && tag.parents.length > 0 && (
                                            <div className="flex items-center gap-1 mb-1 flex-wrap">
                                                {tag.parents.map((parent, index) => {
                                                    // Color gradient: light blue → blue → purple (close to blue) → purple → pink → orange
                                                    const colorClasses = [
                                                        "bg-sky-100 text-sky-700 border border-sky-700/20 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-300/20", // sky blue (closer to blue)
                                                        "bg-blue-100 text-blue-700 border border-blue-700/20 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-300/20", // blue
                                                        "bg-indigo-100 text-indigo-700 border border-indigo-700/20 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-300/20", // purple close to blue (indigo)
                                                        "bg-purple-100 text-purple-700 border border-purple-700/20 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-300/20", // purple
                                                        "bg-pink-100 text-pink-700 border border-pink-700/20 dark:bg-pink-900/40 dark:text-pink-300 dark:border-pink-300/20", // pink
                                                        "bg-orange-100 text-orange-700 border border-orange-700/20 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-300/20", // orange (low saturation)
                                                    ];

                                                    // Use modulo to cycle through colors if more than 6 parents
                                                    const colorIndex = index % colorClasses.length;

                                                    return (
                                                        <React.Fragment key={parent.id}>
                                                            <span
                                                                className={`text-[9px] px-1 py-0.5 rounded font-medium transition-colors ${colorClasses[colorIndex]}`}
                                                            >
                                                                {parent.name}
                                                            </span>
                                                            {index < tag.parents!.length - 1 && (
                                                                <ChevronRight className="w-3 h-3 text-gray-600 dark:text-gray-400 stroke-[2.5]" />
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        {/* Tag name with status dot */}
                                        <div className="flex items-center gap-1.5">
                                            {/* Status dot */}
                                            <span
                                                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tag.status === 1
                                                    ? "bg-green-500"
                                                    : "bg-red-500"
                                                    }`}
                                                title={tag.status === 1 ? "Active" : "Inactive"}
                                            />
                                            <span className="text-[13px] font-medium text-gray-900 dark:text-white">
                                                {tag.name}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div className="absolute bottom-full left-0 right-0 mb-1 z-[100] bg-red-50 dark:bg-red-900/20 rounded-lg shadow-lg border border-red-200 dark:border-red-800 px-3 py-2">
                        <span className="text-xs text-red-600 dark:text-red-400">
                            Backend error: {error}. Please fix the backend API.
                        </span>
                    </div>
                )}

                {/* No results message */}
                {!error && isOpen && !isLoading && tags.length === 0 && searchTerm.trim() && (
                    <div className="absolute bottom-full left-0 right-0 mb-1 z-[100] bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            No tags found
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TagSearchSelect;
