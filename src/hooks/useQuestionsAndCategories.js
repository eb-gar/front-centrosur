import { useCallback, useEffect, useState } from "react";
import { fetchQuestions } from "../services/questionsApi";
import { fetchCategories } from "../services/categoriesApi";

export function useQuestionsAndCategories({
  initialLoading = false,
  questionFilter,
  errorMessage = "Error de conexión con el servidor.",
} = {}) {
  const [preguntas, setPreguntas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [errorCarga, setErrorCarga] = useState("");
  const [loading, setLoading] = useState(initialLoading);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setErrorCarga("");
      const [questions, categories] = await Promise.all([
        fetchQuestions(),
        fetchCategories(),
      ]);

      const safeQuestions =
        typeof questionFilter === "function"
          ? questions.filter(questionFilter)
          : questions;

      setPreguntas(safeQuestions);
      setCategorias(categories);
    } catch (error) {
      console.error("Error cargando datos:", error);
      setErrorCarga(errorMessage);
      setPreguntas([]);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  }, [errorMessage, questionFilter]);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    preguntas,
    setPreguntas,
    categorias,
    setCategorias,
    errorCarga,
    setErrorCarga,
    loading,
    reload,
  };
}
