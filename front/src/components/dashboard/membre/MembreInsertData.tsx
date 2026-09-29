import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import MembreForm from "./MembreForm";
import {
  useGetFormDependenciesQuery,
  useCreateMembreMutation,
  useGetMembresQuery,
  extractApiErrorMessage,
  type CreateMembrePayload,
  type MembreMutationResponse,
} from "../../../services/membresApi";

interface MembreInsertDataProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: (data: MembreMutationResponse) => void;
  /** Équipe présélectionnée (ajout depuis la fiche d'une équipe). */
  defaultEquipeId?: number | null;
}

export default function MembreInsertData({
  isOpen,
  onClose,
  onSubmitSuccess,
  defaultEquipeId = null,
}: MembreInsertDataProps) {
  // Mémorisé : MembreForm réinitialise le formulaire à chaque changement de
  // `initialData`, un nouvel objet à chaque rendu effacerait la saisie.
  const initialData = useMemo(
    () => (defaultEquipeId ? { equipe_id: defaultEquipeId } : null),
    [defaultEquipeId],
  );

  const { data: createDataResponse, isLoading: isLoadingData } =
    useGetFormDependenciesQuery(undefined, { skip: !isOpen });

  // Réutilise le cache RTK Query de la liste des membres (déjà chargée par la
  // page) pour construire la liste des emails déjà utilisés, sans requête
  // réseau supplémentaire. Sert uniquement à la validation front d'unicité ;
  // la contrainte définitive reste `unique:manager_users,email` côté Laravel.
  const { data: membresRes } = useGetMembresQuery(undefined, {
    skip: !isOpen,
  });

  const existingEmails = (membresRes?.data ?? [])
    .map((membre) => membre.email)
    .filter((email): email is string => Boolean(email));

  const [createMembre, { isLoading: isSubmitting }] =
    useCreateMembreMutation();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (payload: CreateMembrePayload) => {
    setErrorMessage(null);

    try {
      const res = await createMembre(payload).unwrap();

      toast.success("Membre ajouté avec succès.");

      onSubmitSuccess?.(res);
      onClose();
    } catch (err: unknown) {
      const message = extractApiErrorMessage(
        err,
        "Une erreur est survenue lors de l'ajout du membre.",
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
      isLoadingData={isLoadingData}
      createDataResponse={createDataResponse}
      mode="add"
      initialData={initialData}
      errorMessage={errorMessage}
      existingEmails={existingEmails}
    />
  );
}