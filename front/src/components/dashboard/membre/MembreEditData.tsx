import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import MembreForm from "./MembreForm";
import {
  useGetFormDependenciesQuery,
  useUpdateMembreMutation,
  useGetMembresQuery,
  useGetMembreByIdQuery,
  useRemoveAvatarMembreMutation,
  extractApiErrorMessage,
  type CreateMembrePayload,
  type MembreMutationResponse,
} from "../../../services/membresApi";

interface MembreEditDataProps {
  isOpen: boolean;
  onClose: () => void;
  id: number | null;
  onSubmitSuccess?: (data: MembreMutationResponse) => void;
}

export default function MembreEditData({
  isOpen,
  onClose,
  id,
  onSubmitSuccess,
}: MembreEditDataProps) {
  const {
    data: createDataResponse,
    isLoading: isLoadingDependencies,
  } = useGetFormDependenciesQuery(undefined, {
    skip: !isOpen,
  });

  const { data: membresRes } = useGetMembresQuery(undefined, {
    skip: !isOpen,
  });

  const existingEmails = (membresRes?.data ?? [])
    .filter((m) => m.id !== id)
    .map((m) => m.email)
    .filter((email): email is string => Boolean(email));

  const {
    data: membreDetailRes,
    isFetching: isLoadingMembre,
  } = useGetMembreByIdQuery(id as number, {
    skip: !isOpen || !id,
    // Le détail doit être frais à chaque ouverture. Sans cette option, RTK
    // Query ressert son cache (60 s) sans rappeler GET /membres/{id} : toute
    // modification faite ailleurs (autre onglet, autre utilisateur, SQL
    // direct) reste invisible tant que le cache n'a pas expiré.
    refetchOnMountOrArgChange: true,
  });

  const [updateMembre, { isLoading: isSubmitting }] =
    useUpdateMembreMutation();

  const [removeAvatarMembre] =
    useRemoveAvatarMembreMutation();

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
    }
  }, [isOpen, id]);

  const initialData = useMemo(() => {
    const detail = membreDetailRes?.data;

    if (!detail) {
      return null;
    }

    return {
      id: detail.id,
      nom_complet: detail.nom_complet,
      email: detail.email,
      telephone: detail.telephone,
      avatar: detail.avatar,
      ville_id: detail.ville_id,
      equipe_id: detail.equipe_id,
      role_id: detail.role_id,
      status: detail.is_active,
      secteurs: detail.secteurs,
      capacite_max_leads: detail.capacite_max_leads,
      // Colonne `manager_users.nb_prospect_par_jour`.
      limite_prospection: detail.limite_prospection,
      methode_affectation: detail.methode_affectation ?? undefined,
      is_managing: detail.is_managing,
      objectifs: detail.objectifs,
    };
  }, [membreDetailRes]);

  const handleRemoveAvatar = async () => {
    if (!id) {
      return;
    }

    try {
      await removeAvatarMembre(id).unwrap();

      toast.success("Photo supprimée avec succès.");
    } catch (err: unknown) {
      toast.error(
        extractApiErrorMessage(
          err,
          "Une erreur est survenue lors de la suppression de la photo.",
        ),
      );
    }
  };

  const handleSubmit = async (
    payload: Partial<CreateMembrePayload>
  ) => {
    if (!id) {
      return;
    }

    setErrorMessage(null);

    try {
      const res = await updateMembre({
        id,
        ...payload,
      }).unwrap();

      toast.success("Membre modifié avec succès.");

      onSubmitSuccess?.(res);

      onClose();
    } catch (err: unknown) {
      const message = extractApiErrorMessage(
        err,
        "Une erreur est survenue lors de la modification du membre.",
      );

      setErrorMessage(message);

      toast.error(message);
    }
  };

  return (
    <MembreForm
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      isLoadingData={
        isLoadingDependencies || isLoadingMembre
      }
      initialData={initialData}
      createDataResponse={createDataResponse}
      mode="edit"
      errorMessage={errorMessage}
      existingEmails={existingEmails}
      onRemoveAvatar={handleRemoveAvatar}
    />
  );
}