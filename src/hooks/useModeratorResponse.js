import { useState } from "react";
import { patchQuestion } from "../services/questionsApi";

export function useModeratorResponse({
  onQuestionUpdated,
  saveErrorMessage = "No se pudo guardar la respuesta del moderador.",
  deleteErrorMessage = "No se pudo eliminar la respuesta del moderador.",
  closeAfterDeleteDelay = 0,
} = {}) {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [moderatorResponseText, setModeratorResponseText] = useState("");
  const [savingModeratorResponse, setSavingModeratorResponse] = useState(false);
  const [moderatorResponseError, setModeratorResponseError] = useState("");
  const [moderatorResponseSuccess, setModeratorResponseSuccess] = useState("");

  const resetResponseModalState = () => {
    setSelectedQuestion(null);
    setModeratorResponseText("");
    setModeratorResponseError("");
    setModeratorResponseSuccess("");
  };

  const openResponseModal = (question) => {
    setSelectedQuestion(question);
    setModeratorResponseText(question?.moderatorResponse || "");
    setModeratorResponseError("");
    setModeratorResponseSuccess("");
  };

  const closeResponseModal = () => {
    if (savingModeratorResponse) return;
    resetResponseModalState();
  };

  const updateQuestionInCollection = (updatedQuestion) => {
    if (typeof onQuestionUpdated === "function") {
      onQuestionUpdated(updatedQuestion);
    }
  };

  const handleSaveModeratorResponse = async () => {
    if (!selectedQuestion || savingModeratorResponse) return;

    const trimmedResponse = moderatorResponseText.trim();
    if (!trimmedResponse) {
      setModeratorResponseError(
        "Escribe una respuesta antes de guardarla para el moderador.",
      );
      return;
    }

    setSavingModeratorResponse(true);
    setModeratorResponseError("");
    setModeratorResponseSuccess("");

    try {
      const updatedQuestion = await patchQuestion(
        selectedQuestion.id,
        { moderatorResponse: trimmedResponse },
        saveErrorMessage,
      );
      updateQuestionInCollection(updatedQuestion);
      resetResponseModalState();
    } catch (error) {
      const message = error instanceof Error ? error.message : saveErrorMessage;
      setModeratorResponseError(message);
    } finally {
      setSavingModeratorResponse(false);
    }
  };

  const handleDeleteModeratorResponse = async () => {
    if (!selectedQuestion || savingModeratorResponse) return;

    if (!selectedQuestion.moderatorResponse) {
      setModeratorResponseError(
        "Esta pregunta no tiene respuesta para eliminar.",
      );
      return;
    }

    setSavingModeratorResponse(true);
    setModeratorResponseError("");
    setModeratorResponseSuccess("");

    try {
      const updatedQuestion = await patchQuestion(
        selectedQuestion.id,
        { moderatorResponse: null },
        deleteErrorMessage,
      );
      updateQuestionInCollection(updatedQuestion);

      if (closeAfterDeleteDelay > 0) {
        setModeratorResponseSuccess("Respuesta eliminada correctamente.");
        window.setTimeout(resetResponseModalState, closeAfterDeleteDelay);
      } else {
        resetResponseModalState();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : deleteErrorMessage;
      setModeratorResponseError(message);
    } finally {
      setSavingModeratorResponse(false);
    }
  };

  return {
    selectedQuestion,
    moderatorResponseText,
    setModeratorResponseText,
    savingModeratorResponse,
    moderatorResponseError,
    setModeratorResponseError,
    moderatorResponseSuccess,
    openResponseModal,
    closeResponseModal,
    handleSaveModeratorResponse,
    handleDeleteModeratorResponse,
  };
}
