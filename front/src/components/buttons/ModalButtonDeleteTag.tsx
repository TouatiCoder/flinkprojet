import React, { useState } from "react";
import RightModal from "../modals/RightModal";
import Button from "../ui/button/Button";
import { toast } from "react-toastify";
import { Tag, useDeleteTagMutation } from "../../services/tagsApi";

interface ModalProps {
  tag: Tag;
  refetch: () => void;
}

const ModalButtonDeleteTag: React.FC<ModalProps> = ({ tag, refetch }) => {
  const [deleteTag] = useDeleteTagMutation();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleDelete = async () => {
    try {
      const response = await deleteTag(tag.id.toString()).unwrap();
      refetch();
      if(response.success) {
        toast.success("Tag deleted successfully");
      }
    } catch (err) {
      console.error('Failed to delete:', err);
      toast.error("Failed to delete tag");
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-8">
      <Button 
        onClick={() => setIsModalOpen(true)} 
        size="xs" 
        className="h-8"
        variant="danger" // Assuming your Button component has a danger variant
      >
        Delete
      </Button>

      <RightModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Delete Tag"
        labelAction="Delete Tag"
        type="delete"
        onSave={handleDelete}
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete this tag?
          </p>
          
          <div className="p-4 border border-red-200 bg-red-50 rounded-md">
            <p className="font-medium text-red-800">{tag.name}</p>
            <p className="font-medium text-red-700">{tag.slug}</p>
            <p className="text-sm text-red-600">This action cannot be undone.</p>
          </div>
        </div>
      </RightModal>
    </div>
  );
};

export default ModalButtonDeleteTag;