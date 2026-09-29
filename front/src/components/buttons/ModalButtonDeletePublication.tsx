import React, { useState } from "react";
import RightModal from "../modals/RightModal";
import Button from "../ui/button/Button";
import { Publication, useDeletePublicationMutation } from "../../services/publicationsApi";
import { toast } from "react-toastify";
// import { toast } from "react-toastify";

interface ModalProps {
  publication: Publication;
  refetch: () => void;
}

const ModalButtonDeletePublication: React.FC<ModalProps> = ({ publication, refetch }) => {
  const [deletePublication] = useDeletePublicationMutation();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleDelete = async () => {
    try {
      const response = await deletePublication(publication.id.toString()).unwrap();
      refetch();
      toast.success("Publication deleted successfully");
      console.log(response)
    } catch (err) {
      console.error('Failed to delete:', err);
      toast.error("Failed to delete publication");
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
        title="Delete Publication"
        labelAction="Delete Publication"
        type="delete"
        onSave={handleDelete}
        // saveButtonVariant="danger" // Assuming your RightModal supports this prop
        // saveButtonText="Confirm Delete"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete this publication?
          </p>
          
          <div className="p-4 border border-red-200 bg-red-50 rounded-md">
            <p className="font-medium text-red-800">{publication.slug}</p>
            <p className="text-sm text-red-600">This action cannot be undone.</p>
          </div>
        </div>
      </RightModal>
    </div>
  );
};

export default ModalButtonDeletePublication;