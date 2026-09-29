import React, { useCallback, useEffect, useRef, useState } from "react";
import RightModal from "../modals/RightModal";
import Button from "../ui/button/Button";
import { Publication, useUpdatePublicationMutation } from "../../services/publicationsApi";
import Switch from "../form/switch/Switch";
import Label from "../form/Label";
import Select from "../form/Select";
import { toast } from "react-toastify";
import SearchSelection from "../tagsSelection/SearchSelection";
import { getCookie } from "../../utils/cookies";
import { Tag } from "../../services/tagsApi";
import TextArea from "../form/input/TextArea";
import { ApiBaseUrlM } from "../../constants/publicConstants";

interface ModalProps {
  publication: Publication;
  refetch: () => void;
}
export interface CustomItem {
  id: number
  name: string
  isCustom: true
}

const ModalButtonUpdatePublication: React.FC<ModalProps> = ({ publication, refetch }) => {
  const [updatePublication, { isLoading: isUpdating }] = useUpdatePublicationMutation();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(publication.status.toString());
  const [isMarketplace, setIsMarketplace] = useState<boolean>(publication.is_marketplace);
  const [keywords, setKeywords] = useState<Tag[]>([]);
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);
  const [keywordSearch, setKeywordSearch] = useState("");
  const [showKeywordsList, setShowKeywordsList] = useState(false);
  const [customTags, setCustomTags] = useState<Tag[]>(publication.tags);
  const keywordSearchTimeout = useRef<any | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("Votre publication a été rejetée. Modifiez et repostez.");

  const handleSave = async () => {
    console.log(customTags)
    console.log("rejectReason : ", rejectReason);
    try {
      const response = await updatePublication({
        publicationId: publication.id.toString(),
        status: selectedStatus,
        rejectReason: selectedStatus === "3" ? rejectReason : "",
        isMarketplace: isMarketplace,
        tags: customTags,
      }).unwrap();
      refetch();
      console.log(response)
      toast.success("Publication updated with success");
    } catch (err) {
      console.error('Failed to update:', err);
      toast.error("Failed to update publication");
    }
    setIsModalOpen(false);
  };

  const options = [
    { value: "0", label: "Pending" },
    { value: "1", label: "Active" },
    { value: "2", label: "Delete" },
    { value: "3", label: "Rejecte" },
  ];

  const handleSelectChangeStatus = (value: string) => {
    setSelectedStatus(value);
  };

  const handleSwitchChangeIsMarketplace = (checked: boolean) => {
    setIsMarketplace(checked);
  };

  // Handle tags selection
  const handleTagSelect = useCallback((tags: (Tag | CustomItem)[]) => {

    const validTags = tags.filter(
      (tag): tag is Tag => "id" in tag && "name" in tag && tag.name.trim() !== "" && tag.id !== undefined,
    );
    setCustomTags(validTags);
  }, []);

  // Handle adding new tags
  const handleAddNewTag = async (tagName: string) => {

    try {
      // First check if the tag already exists in the fetched keywords
      const existingTag = customTags.find(tag =>
        tag.name.toLowerCase() === tagName.toLowerCase()
      );

      if (existingTag) {
        // If it exists, add it to the selected tags
        handleTagSelect([...customTags, existingTag]);
        return;
      }
    } catch (error) {
      console.error("Error adding new tag:", error);
      toast.error("Failed to add new tag");
    }
  };

  async function getTags(tag: string) {
    try {
      const res = await fetch(`${ApiBaseUrlM}manager/tags?search=${tag}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getCookie("TOKEN")}`
        }
      });
      return res.json();
    } catch (error) {
      console.error("Error fetching tags:", error);
      return { data: [] };
    }
  }

  // Fetch keywords
  useEffect(() => {
    const fetchKeywords = async () => {
      setIsLoadingKeywords(true);
      try {
        const result = await getTags(keywordSearch.trim());
        if (result && result.data) {
          setKeywords(result.data);
          setShowKeywordsList(result.data.length > 0);
        } else {
          console.warn("Unexpected API response format for keywords:", result);
          setKeywords([]);
          setShowKeywordsList(false);
        }
      } catch (error) {
        console.error("Error in fetchKeywords:", error);
        setKeywords([]);
        setShowKeywordsList(false);
      } finally {
        setIsLoadingKeywords(false);
      }
    };

    if (keywordSearchTimeout.current) {
      clearTimeout(keywordSearchTimeout.current);
    }

    if (keywordSearch.trim().length >= 2) { // Only search if at least 2 characters
      keywordSearchTimeout.current = setTimeout(fetchKeywords, 500);
    } else {
      setKeywords([]);
      setShowKeywordsList(false);
    }

    return () => {
      if (keywordSearchTimeout.current) {
        clearTimeout(keywordSearchTimeout.current);
      }
    };
  }, [keywordSearch]);

  return (
    <div className="p-8">
      <Button onClick={() => setIsModalOpen(true)} size="xs" className="h-8">Update</Button>

      <RightModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Update Publication"
        labelAction="Save Changes"
        type="update"
        onSave={handleSave}
        isLoading={isUpdating}
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            {publication.slug}
          </p>

          {/* Status Update */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              options={options}
              placeholder="Select Option"
              onChange={handleSelectChangeStatus}
              className="dark:bg-dark-900"
              defaultValue={selectedStatus}
            />
            {
              selectedStatus === "3" && (
                <TextArea placeholder="Reject reason" value={rejectReason} onChange={(e) => setRejectReason(e)} required={true} />
              )
            }

            {/* Marketplace Update */}
            <Switch
              label="Is Marketplace"
              checked={isMarketplace}
              onChange={handleSwitchChangeIsMarketplace}
            />

            {/* Tags Updates */}
            <div className="mb-4">
              <div className="text-[14px] font-[500] flex text-zinc-500 dark:text-zinc-400 gap-1.5">
                {"Tags"}:
              </div>
              <SearchSelection<Tag>
                data={keywords}
                keyExtractor={(tag) => tag.id}
                labelExtractor={(tag) => tag.name}
                onSelect={handleTagSelect}
                onAdd={handleAddNewTag} // Pass the handler for adding new tags
                placeholder={"Select tags"}
                maxSelections={10}
                allowCustomItems={true} // Ensure this is true to allow adding new tags
                badgeStyle={{
                  bgColor: "",
                  textColor: "",
                  hoverBgColor:
                    "bg-green-500/30 hover:bg-green-500/30 text-green-900 dark:bg-green-900/50 dark:text-green-300 border border-green-600/30 dark:border-green-600/30",
                }}
                initialState={customTags}
                isLoading={isLoadingKeywords}
                showSuggestions={showKeywordsList}
                onSearch={setKeywordSearch}
              />
            </div>
          </div>
        </div>
      </RightModal>
    </div>
  );
};

export default ModalButtonUpdatePublication;