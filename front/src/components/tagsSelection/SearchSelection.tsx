
"use client"

// import { Input } from "@/components/ui/input"
import { Input } from "../ui/input/input"
import type React from "react"
import { useState, useRef, useMemo, useEffect } from "react"
import { HiXMark } from "react-icons/hi2"
import { MdErrorOutline } from "react-icons/md"
import { Loader2 } from "lucide-react"
import { FiPlus } from "react-icons/fi"
import Badge from "../ui/badge/Badge"

// Define all entity interfaces
export interface Country {
  id: number
  slug: string
  name: string
  country_id?: never // Ensures this is not a region or city
}

export interface Region {
  id: number
  slug: string
  name: string
  ville_id?: number
  country_id: number // Reference to parent country
}

export interface City {
  id: number
  slug: string
  name: string
  country_id: number // Reference to parent country
  region_id?: number // Optional reference to parent region
}

// Union type for all location types
export type Location = Country | Region | City

export interface Category {
  id: number
  slug: string
  name: string
}

// Base interface for selectable items with optional Tag-specific properties
interface BaseSelectableItem {
  id: number
  name: string
  slug: string
  status: number
  compteur_search?: number
  compteur_publications?: number
  type?: string
  created_at?: string
  updated_at?: string
}

interface CustomItem {
  id: number
  name: string
  isCustom: true
}

interface BadgeProps {
  className?: string
  children: React.ReactNode
  bgColor: string
  textColor: string
  hoverBgColor?: string
}

// Update SearchSelectionProps to accept any of our entity types
interface SearchSelectionProps<T extends BaseSelectableItem> {
  data: T[]
  onAdd?: (name: string) => void
  allowCustomItems?: boolean
  keyExtractor: (item: T) => number
  labelExtractor: (item: T) => string
  onSelect: (items: (T | CustomItem)[]) => void
  placeholder?: string
  errorMessage?: string
  className?: string
  maxSelections: number
  initialState?: (T | CustomItem)[]
  badgeStyle?: {
    bgColor: string
    textColor: string
    hoverBgColor?: string
  }
  isLoading?: boolean
  showSuggestions?: boolean
  onSearch?: (term: string) => void
}

const defaultBadgeStyle = {
  bgColor: "bg-blue-500/10",
  textColor: "text-blue-700",
  hoverBgColor: "hover:bg-blue-500/20",
}

const Badges = ({ className, children, bgColor, textColor, hoverBgColor }: BadgeProps) => (
  <button
    className={`inline-flex items-center text-[10px] rounded-md border-0 ${bgColor} ${textColor} ${hoverBgColor} ${className}`}
  >
    {children}
  </button>
)

const SearchSelection = <T extends BaseSelectableItem>({
  data,
  onAdd,
  allowCustomItems = true,
  keyExtractor,
  labelExtractor,
  onSelect,
  placeholder = "Search...",
  errorMessage,
  maxSelections,
  initialState,
  badgeStyle,
  isLoading,
  showSuggestions,
  onSearch,
  className,
}: SearchSelectionProps<T>) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItems, setSelectedItems] = useState<(T | CustomItem)[]>(initialState || [])
  const [searchSuggestionsModel, setSearchSuggestionsModel] = useState(false)
  const [isInputVisible, setIsInputVisible] = useState(true)
  const refSearchSuggestions = useRef<HTMLDivElement>(null)
  const [customItemCounter, setCustomItemCounter] = useState(0)

  // Validate props
  useEffect(() => {
    if (allowCustomItems && !onAdd) {
      console.error("onAdd function is required when allowCustomItems is true")
    }
  }, [allowCustomItems, onAdd])

  // Initialize with initialState if provided
  useEffect(() => {
    if (initialState && initialState.length > 0) {
      setSelectedItems(initialState)
      setIsInputVisible(false) // Hide input field when initial data exists
    }
  }, [initialState])

  const handleAddCustomItem = (name: string) => {
    // Early return if conditions are not met
    if (!onAdd || selectedItems.length >= maxSelections) return
    const trimmedName = name.trim()
    if (trimmedName === "") return
    const isDuplicate = selectedItems.some((item) => getItemLabel(item).toLowerCase() === trimmedName.toLowerCase())
    if (!isDuplicate) {
      const customItem: CustomItem = {
        id: Date.now() + customItemCounter,
        name: trimmedName,
        isCustom: true,
      }
      setCustomItemCounter((prev) => prev + 1)
      const updatedItems = [...selectedItems, customItem]
      setSelectedItems(updatedItems)
      onAdd(trimmedName)
      onSelect(updatedItems)
    }
    setSearchTerm("")
    setSearchSuggestionsModel(false)
    setIsInputVisible(false)
  }

  // Memoize filtered data to prevent unnecessary recalculations
  const filteredData = useMemo(() => {
    if (!Array.isArray(data) || !Array.isArray(selectedItems)) return []
    const unselectedData = data.filter(
      (item) =>
        !selectedItems.some((selected) =>
          "isCustom" in selected ? false : keyExtractor(selected as T) === keyExtractor(item),
        ),
    )
    if (!searchTerm.length) return unselectedData.slice(0, 5)
    const normalizedSearchTerm = searchTerm.toLowerCase().trim()
    const exactMatches: T[] = []
    const startsWithResults: T[] = []
    const containsResults: T[] = []
    unselectedData.forEach((item) => {
      const label = labelExtractor(item).toLowerCase()
      if (label === normalizedSearchTerm) {
        exactMatches.push(item)
      } else if (label.startsWith(normalizedSearchTerm)) {
        startsWithResults.push(item)
      } else if (label.includes(normalizedSearchTerm)) {
        containsResults.push(item)
      }
    })
    const sortByLabel = (a: T, b: T) => labelExtractor(a).toLowerCase().localeCompare(labelExtractor(b).toLowerCase())
    exactMatches.sort(sortByLabel)
    startsWithResults.sort(sortByLabel)
    containsResults.sort(sortByLabel)
    return [...exactMatches, ...startsWithResults, ...containsResults].slice(0, 4)
  }, [searchTerm, data, selectedItems, keyExtractor, labelExtractor])

  const handleSelect = (item: T) => {
    if (selectedItems.length < maxSelections) {
      const isDuplicate = selectedItems.some((selected) =>
        "isCustom" in selected
          ? false
          : keyExtractor(selected as T) === keyExtractor(item) ||
            labelExtractor(selected as T).toLowerCase() === labelExtractor(item).toLowerCase(),
      )
      if (!isDuplicate) {
        const updatedItems = [...selectedItems, item]
        setSelectedItems(updatedItems)
        setSearchTerm("")
        onSelect(updatedItems)
        setIsInputVisible(false) // Always hide input after selection
      }
    }
    setSearchSuggestionsModel(false)
  }

  const handleRemoveItem = (itemToRemove: T | CustomItem) => {
    // First check if the removed item is a country by checking its slug pattern
    const isRemovedCountry =
      !("isCustom" in itemToRemove) && (itemToRemove as unknown as { slug?: string }).slug?.includes("country-")

    // Get the country ID if it's a country
    const countryId = isRemovedCountry ? (itemToRemove as { id: number }).id : null

    // First filter out the item itself
    let updatedItems = selectedItems.filter((item) => {
      if ("isCustom" in itemToRemove && "isCustom" in item) {
        return (item as CustomItem).id !== (itemToRemove as CustomItem).id
      }
      if (!("isCustom" in itemToRemove) && !("isCustom" in item)) {
        return (
          keyExtractor(item as T) !== keyExtractor(itemToRemove as T) &&
          labelExtractor(item as T).toLowerCase() !== labelExtractor(itemToRemove as T).toLowerCase()
        )
      }
      return true
    })

    // If we're removing a country, also filter out any cities or regions from that country
    if (isRemovedCountry && countryId) {
      console.log("Removing country with ID:", countryId)

      updatedItems = updatedItems.filter((item) => {
        // Skip custom items
        if ("isCustom" in item) return true

        // Check if this item has a country_id property and if it matches the removed country
        const itemAsLocation = item as unknown as { country_id?: number }
        const itemCountryId = itemAsLocation.country_id
        if (itemCountryId !== undefined && itemCountryId === countryId) {
          console.log("Removing dependent item:", (item as { name: string }).name)
          return false // Remove this item
        }

        return true
      })
    }

    setSelectedItems(updatedItems)
    onSelect(updatedItems)

    // Show input when all badges are removed
    if (updatedItems.length === 0) {
      setIsInputVisible(true)
    }
  }

  const getItemLabel = (item: T | CustomItem): string => {
    if ("isCustom" in item) {
      return item.name
    }
    return labelExtractor(item as T)
  }

  const getBadgeStyle = useMemo(() => {
    if (!badgeStyle) {
      return defaultBadgeStyle
    }
    return {
      bgColor: badgeStyle.bgColor || defaultBadgeStyle.bgColor,
      textColor: badgeStyle.textColor || defaultBadgeStyle.textColor,
      hoverBgColor: badgeStyle.hoverBgColor || defaultBadgeStyle.hoverBgColor,
    }
  }, [badgeStyle])

  const inputRef = useRef<HTMLInputElement>(null)

  const handleAddClick = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setIsInputVisible(true)
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 50)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (refSearchSuggestions.current && !refSearchSuggestions.current.contains(event.target as Node)) {
        setSearchSuggestionsModel(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="flex-1 flex flex-col gap-1 relative w-full" ref={refSearchSuggestions}>
      <div className={`flex flex-wrap items-center gap-2 ${selectedItems.length > 0 ? "mt-3" : ""}`}>
        <div className="flex flex-wrap items-start gap-2">
          {Array.isArray(selectedItems) &&
            selectedItems.map((item, index) => (
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveItem(item)
                }}
                key={index}
              >
                <Badges
                  key={index}
                  bgColor={getBadgeStyle.bgColor}
                  textColor={getBadgeStyle.textColor}
                  hoverBgColor={getBadgeStyle.hoverBgColor}
                  className="text-sm font-medium px-3 py-1.5 rounded-md shadow-sm"
                >
                  {getItemLabel(item)}
                  <span className="ml-1 transition-colors">
                    <HiXMark className="size-3.5" />
                  </span>
                </Badges>
              </div>
            ))}
          {selectedItems.length < maxSelections && !isInputVisible && (
            <button
              onClick={handleAddClick}
              className="p-2 rounded-md hover:bg-primary/10 transition-colors bg-white border border-zinc-200 shadow-sm dark:hover:bg-foreground/15 dark:bg-foreground/10 dark:border-transparent"
            >
              <FiPlus className="w-4 h-4 text-primary" />
            </button>
          )}
        </div>
      </div>
      {selectedItems.length < maxSelections && isInputVisible && (
        <div className="flex items-center justify-center mt-2">
          <div className="flex-1 w-80 relative">
            <Input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchSuggestionsModel(true)
                setSearchTerm(e.target.value)
                if (onSearch) {
                  onSearch(e.target.value)
                }
              }}
              placeholder={placeholder}
              maxLength={50}
              className={` w-full h-11 text-sm ${className && className != "" ? className : "border-zinc-200 dark:border-zinc-800 "} bg-white dark:bg-zinc-900  px-4 rounded-md shadow-sm placeholder-zinc-400 dark:placeholder-zinc-500 dark:text-white focus-visible:ring-primary/50`}
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            )}
            {showSuggestions && searchSuggestionsModel && (
              <div className="absolute left-0 right-0 top-full mt-1 w-full bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 max-h-[160px] z-[700] overflow-y-auto">
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <button
                      key={keyExtractor(item)}
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 text-left transition-all"
                    >
                      <div className="flex flex-col items-start flex-1">
                        <span className="text-sm inline-block dark:text-zinc-100 text-nowrap truncate w-fit max-w-[250px] font-medium">
                          {labelExtractor(item)}
                        </span>
                        
                        <div className="flex space-x-4 gap-3">
                          {item.type && (
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">#{item.type}</span>
                          )}
                          {item.compteur_search !== undefined && (
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                              #{item.compteur_search}
                            </span>
                          )}
                          { 
                            <Badge
                              size="xs"
                              color={item.status === 0 ? "error" : "success"}
                            >
                              {item.status === 0 ? "NaN" : "active"}
                            </Badge>
                          }
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400 text-center">
                    Aucun résultat trouvé
                  </div>
                )}
                {allowCustomItems &&
                  onAdd &&
                  searchTerm.length >= 2 &&
                  searchTerm.length <= 30 &&
                  (filteredData.length === 0 ||
                    filteredData.every((item) => item.name.toLowerCase() !== searchTerm.toLowerCase())) && (
                    <button
                      onClick={() => handleAddCustomItem(searchTerm)}
                      className="w-full flex items-center justify-center gap-2 border-t border-zinc-200 dark:border-zinc-800 px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-all text-primary"
                    >
                      + Ajouter &quot;{searchTerm}&quot;
                    </button>
                  )}
              </div>
            )}
          </div>
          <button
            onClick={handleAddClick}
            className="size-11 rounded-md flex items-center justify-center ms-2 bg-white border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-transparent transition-colors shadow-sm"
          >
            <FiPlus className="w-4.5 h-4.5 text-primary" />
          </button>
        </div>
      )}
      {errorMessage && (
        <span className="text-red-600 text-xs flex items-center gap-1 mt-1">
          <MdErrorOutline className="text-xs" />
          {errorMessage}*
        </span>
      )}
    </div>
  )
}

export default SearchSelection

