import { API_BASE_URL } from "../config/api";

const jsonHeaders = {
  "Content-Type": "application/json",
};

const parseErrorMessage = async (response, fallbackMessage) => {
  try {
    const errorData = await response.json();
    if (Array.isArray(errorData?.message) && errorData.message.length > 0) {
      return errorData.message[0];
    }
    if (typeof errorData?.message === "string" && errorData.message.trim()) {
      return errorData.message;
    }
  } catch {
    // Ignore parsing issues and use fallback message.
  }

  return fallbackMessage;
};

export const requestJson = async (
  path,
  options = {},
  fallbackErrorMessage = "No se pudo completar la solicitud.",
) => {
  const { body, headers, ...restOptions } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...restOptions,
    headers: body
      ? {
          ...jsonHeaders,
          ...headers,
        }
      : headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorMessage = await parseErrorMessage(
      response,
      fallbackErrorMessage,
    );
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const requestArray = async (
  path,
  fallbackErrorMessage = "No se pudo obtener la informacion.",
) => {
  const data = await requestJson(path, {}, fallbackErrorMessage);
  return Array.isArray(data) ? data : [];
};
