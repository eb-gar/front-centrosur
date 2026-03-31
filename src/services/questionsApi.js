import { requestArray, requestJson } from "./apiClient";

export const fetchQuestions = () =>
  requestArray("/questions", "No se pudo obtener el listado de preguntas.");

export const createQuestion = (payload) =>
  requestJson(
    "/questions",
    {
      method: "POST",
      body: payload,
    },
    "No se pudo guardar la pregunta.",
  );

export const patchQuestion = (questionId, payload, errorMessage) =>
  requestJson(
    `/questions/${questionId}`,
    {
      method: "PATCH",
      body: payload,
    },
    errorMessage || "No se pudo actualizar la pregunta.",
  );

export const deleteQuestion = (questionId) =>
  requestJson(
    `/questions/${questionId}`,
    {
      method: "DELETE",
    },
    "No se pudo eliminar la pregunta.",
  );
