import { requestArray, requestJson } from "./apiClient";

export const fetchCategories = () =>
  requestArray("/categories", "No se pudieron cargar las categorias.");

export const createCategory = (payload) =>
  requestJson(
    "/categories",
    {
      method: "POST",
      body: payload,
    },
    "No se pudo crear la categoria.",
  );

export const updateCategory = (categoryId, payload) =>
  requestJson(
    `/categories/${categoryId}`,
    {
      method: "PATCH",
      body: payload,
    },
    "No se pudo actualizar la categoria.",
  );

export const removeCategory = (categoryId) =>
  requestJson(
    `/categories/${categoryId}`,
    {
      method: "DELETE",
    },
    "No se pudo eliminar la categoria.",
  );
