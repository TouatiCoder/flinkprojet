import React, { useState, useEffect } from "react";
import RightModal from "../modals/RightModal";
import Button from "../ui/button/Button";
import Switch from "../form/switch/Switch";
import Label from "../form/Label";
import Select from "../form/Select";
import TagSearchSelect from "../form/TagSearchSelect";
import { toast } from "react-toastify";
import { Tag, useUpdateTagMutation } from "../../services/tagsApi";
import Input from "../form/input/InputField";


interface ModalProps {
  tag: Tag;
  refetch: () => void;
}

const ModalButtonUpdateTag: React.FC<ModalProps> = ({ tag, refetch }) => {
  const [updateTag, { isLoading: isUpdating }] = useUpdateTagMutation();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<boolean>(tag.status == 1 ? true : false);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedName, setSelectedName] = useState<string>(tag.name);
  const [selectedSlug, setSelectedSlug] = useState<string>(tag.slug);
  const [selectedMasterTag, setSelectedMasterTag] = useState<Tag | null>(null);
  const [mngrIsIndex, setMngrIsIndex] = useState<boolean>(
    tag.mngr_is_index === 1 || tag.mngr_is_index === true
  );
  const [canonicalParent, setCanonicalParent] = useState<boolean>(
    tag.canonical_parent === 1 || tag.canonical_parent === true
  );
  const [redirect301, setRedirect301] = useState<boolean>(
    tag.mngr_is_index === 2
  );

  // Initialize master tag when modal opens
  useEffect(() => {
    if (isModalOpen) {
      // Use master_tag from API response if available (most reliable)
      if (tag.master && tag.master_tag) {
        // Use the master_tag object directly from API
        setSelectedMasterTag({
          id: tag.master_tag.id,
          name: tag.master_tag.name,
          slug: tag.master_tag.slug,
          status: 0, // Default values for required fields
          compteur_search: 0,
          compteur_publications: 0,
          master: null,
          created_at: '',
          updated_at: '',
        });
      } else if (tag.master) {
        // Fallback: try to find it in parents array
        let masterTag: Tag | null = null;

        if (tag.parents && tag.parents.length > 0) {
          // Find the parent tag that matches the master ID
          masterTag = tag.parents.find(parent => parent.id === tag.master) || null;

          // If not found by ID, try the last item (immediate parent)
          if (!masterTag) {
            const immediateParent = tag.parents[tag.parents.length - 1];
            if (immediateParent && immediateParent.id === tag.master) {
              masterTag = immediateParent;
            }
          }
        }

        if (masterTag) {
          setSelectedMasterTag(masterTag);
        } else {
          setSelectedMasterTag(null);
        }
      } else {
        setSelectedMasterTag(null);
      }

      // Update toggle states when modal opens
      setMngrIsIndex(tag.mngr_is_index === 1 || tag.mngr_is_index === 2 || tag.mngr_is_index === true);
      setCanonicalParent(tag.canonical_parent === 1 || tag.canonical_parent === true);
      setRedirect301(tag.mngr_is_index === 2);
    }
  }, [isModalOpen, tag.master, tag.master_tag, tag.parents, tag.mngr_is_index, tag.canonical_parent]);

  const handleSave = async () => {
    try {
      const response = await updateTag({
        tagId: tag.id.toString(),
        name: selectedName,
        slug: selectedSlug,
        status: selectedStatus ? '1' : '0',
        master: selectedMasterTag ? selectedMasterTag.id : null,
        mngr_is_index: redirect301 ? 2 : (mngrIsIndex ? 1 : 0),
        canonical_parent: canonicalParent ? '1' : '0',
      }).unwrap();
      refetch();
      if (response.success) {
        toast.success("Tag updated with success");
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to update:', err);
      toast.error("Failed to update tag");
    }
  };

  const options = [
    { value: "carburant", label: "Carburant" },
    { value: "marque", label: "Marque" },
    { value: "nombre", label: "Nombre" },
    { value: "caracteristique", label: "Caractéristique" },
    { value: "surface", label: "Surface" },
    { value: "categorie", label: "Categorie" },
    { value: "model", label: "Model" },
    { value: "annee", label: "Année" },
    { value: "salaire", label: "Salaire" },
    { value: "carrosserie", label: "Carrosserie" },
    { value: "formation", label: "Formation" },
    { value: "transmission", label: "Transmission" },
    { value: "contrat", label: "Contrat" },
    { value: "puissance_fiscale", label: "Puissance Fiscale" },
    { value: "niveau_etude", label: "Niveau d'Etude" },
  ];

  const handleSwitchChangeStatus = (value: boolean) => {
    setSelectedStatus(value);
  };

  const handleSelectChangeType = (value: string) => {
    setSelectedType(value);
  };

  const handleMngrIsIndexChange = (value: boolean) => {
    setMngrIsIndex(value);
    // If mngr_is_index is activated, automatically disable canonical_parent
    if (value === true) {
      setCanonicalParent(false);
    }
  };

  const handleRedirect301Change = (value: boolean) => {
    setRedirect301(value);
    // If redirect_301 is activated, automatically activate mngr_is_index and disable canonical_parent
    if (value === true) {
      setMngrIsIndex(true);
      setCanonicalParent(false);
    }
  };



  return (
    <div className="p-8">
      <Button onClick={() => setIsModalOpen(true)} size="xs" className="h-8">Update</Button>

      <RightModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Update Tag"
        labelAction="Save Changes"
        type="update"
        onSave={handleSave}
        isLoading={isUpdating}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="input">Name</Label>
            <Input type="text" id="input" value={selectedName} onChange={(e) => { setSelectedName(e.target.value) }} />
          </div>
          <div>
            <Label htmlFor="input">Slug</Label>
            <Input type="text" id="input" value={selectedSlug} onChange={(e) => { setSelectedSlug(e.target.value) }} />
          </div>

          {/* Status Update */}
          <div className="space-y-2">
            <Switch
              label="Status"
              checked={selectedStatus}
              onChange={handleSwitchChangeStatus}
            />
            {/* Marketplace Update */}
            <Label>Type</Label>
            <Select
              options={options}
              placeholder="Type"
              onChange={handleSelectChangeType}
              className="dark:bg-dark-900"
              defaultValue={selectedType ? selectedType : ""}
              placeholderDisabled={false}
            />
          </div>

          {/* Master Tag (Parent) Selection */}
          <div>
            <TagSearchSelect
              value={selectedMasterTag}
              onChange={setSelectedMasterTag}
              placeholder="Search parent tag..."
              label="Master Tag (Parent)"
              excludeTagId={tag.id} // Prevent selecting itself as parent
            />
          </div>

          {/* 301 Redirect Toggle */}
          <div className="space-y-2">
            <Switch
              label="301 Permanent"
              checked={redirect301}
              onChange={handleRedirect301Change}
            />
          </div>

          {/* Manager Index Toggle */}
          <div className="space-y-2">
            <Switch
              label="Indexation"
              checked={mngrIsIndex}
              onChange={handleMngrIsIndexChange}
            />
          </div>

          {/* Canonical Parent Toggle */}
          <div className={`space-y-2 transition-opacity duration-200 ${mngrIsIndex ? 'opacity-50' : 'opacity-100'}`}>
            <Switch
              label="Canonical Parent"
              checked={canonicalParent}
              onChange={setCanonicalParent}
              disabled={mngrIsIndex}
            />
          </div>
        </div>
      </RightModal>
    </div>
  );
};

export default ModalButtonUpdateTag;