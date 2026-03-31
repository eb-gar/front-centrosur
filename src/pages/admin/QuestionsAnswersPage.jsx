import React, { useEffect, useMemo, useState } from "react";
import { Archive, MessageSquareText } from "lucide-react";
import Masonry from "react-masonry-css";
import ModeratorResponseModal from "../../components/ModeratorResponseModal";
import "../../styles/admin/AdminDashboard.css";
import "../../styles/admin/QuestionsAnswersPage.css";
import { socket } from "../../services/socket";
import { useQuestionsAndCategories } from "../../hooks/useQuestionsAndCategories";
import { useModeratorResponse } from "../../hooks/useModeratorResponse";
import { getActiveQuestions } from "../../utils/questionFilters";

export default function QuestionsAnswersPage() {
  const {
    preguntas,
    setPreguntas,
    categorias,
    errorCarga,
    loading,
    reload: fetchPreguntas,
  } = useQuestionsAndCategories({
    initialLoading: true,
    errorMessage: "Error de conexion con el servidor.",
  });

  const [archivingQuestionIds, setArchivingQuestionIds] = useState([]);
  const maxResponseLength = 400;

  const {
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
  } = useModeratorResponse({
    onQuestionUpdated: (updatedQuestion) => {
      setPreguntas((prev) =>
        prev.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q)),
      );
    },
    closeAfterDeleteDelay: 800,
  });

  useEffect(() => {
    const handleSocketConnect = () => {
      fetchPreguntas();
    };

    const handleNewQuestion = (newQ) => {
      setPreguntas((prev) => {
        const alreadyExists = prev.some((q) => q.id === newQ.id);
        return alreadyExists ? prev : [newQ, ...prev];
      });
    };

    const handleQuestionUpdated = (updatedQ) => {
      setPreguntas((prev) =>
        prev.some((q) => q.id === updatedQ.id)
          ? prev.map((q) => (q.id === updatedQ.id ? { ...q, ...updatedQ } : q))
          : [updatedQ, ...prev],
      );
    };

    const handleQuestionDeleted = ({ id }) => {
      setPreguntas((prev) => prev.filter((q) => q.id !== id));
    };

    socket.on("connect", handleSocketConnect);
    socket.on("new_question_received", handleNewQuestion);
    socket.on("question_updated", handleQuestionUpdated);
    socket.on("question_deleted", handleQuestionDeleted);

    return () => {
      socket.off("connect", handleSocketConnect);
      socket.off("new_question_received", handleNewQuestion);
      socket.off("question_updated", handleQuestionUpdated);
      socket.off("question_deleted", handleQuestionDeleted);
    };
  }, [fetchPreguntas, setPreguntas]);

  const preguntasActivas = useMemo(
    () => getActiveQuestions(preguntas),
    [preguntas],
  );

  const preguntasFiltradas = useMemo(
    () => preguntasActivas.filter((q) => q.moderatorResponse),
    [preguntasActivas],
  );

  return (
    <div className="orador-layout">
      <main className="orador-main qa-main">
        <header className="content-header">
          <h1>Preguntas y Respuestas</h1>
          <p className="panel-subtitle">
            Revisa todas las preguntas con sus respuestas. Haz clic en una
            pregunta para ver más detalles.
          </p>
        </header>

        {errorCarga && (
          <div className="api-error" role="alert">
            <span>{errorCarga}</span>
            <button onClick={fetchPreguntas}>Reintentar</button>
          </div>
        )}

        <div className="qa-cards-container">
          {loading ? (
            <div className="empty-placeholder">
              <MessageSquareText size={40} />
              <p>Cargando preguntas...</p>
            </div>
          ) : preguntasFiltradas.length === 0 ? (
            <div className="empty-placeholder">
              <MessageSquareText size={40} />
              <p>No hay resultados para mostrar</p>
            </div>
          ) : (
            <Masonry
              breakpointCols={{ default: 3, 1200: 2, 768: 1 }}
              className="questions-masonry-grid"
              columnClassName="questions-masonry-column"
            >
              {preguntasFiltradas.map((q) => {
                const resolvedCategory =
                  q.category ||
                  categorias.find((cat) => cat.id === q.categoryId);

                return (
                  <article className="q-card" key={q.id}>
                    {resolvedCategory && (
                      <div className="q-card-header">
                        <span
                          className="status-pill has-category"
                          style={{
                            backgroundColor: resolvedCategory.color + "22",
                            color: resolvedCategory.color,
                            border: `1px solid ${resolvedCategory.color}`,
                          }}
                        >
                          {resolvedCategory.name}
                        </span>
                      </div>
                    )}

                    <p className="q-text">{q.content}</p>

                    <button
                      type="button"
                      className="qa-response-block qa-response-trigger"
                      onClick={() => openResponseModal(q)}
                      aria-label="Abrir respuesta del moderador"
                    >
                      <p className="qa-response-label">
                        Respuesta del moderador
                      </p>
                      <p className="moderator-response-preview">
                        {q.moderatorResponse}
                      </p>
                    </button>

                    <div className="q-card-footer">
                      <div className="done-actions">
                        <button
                          className="btn-respond"
                          onClick={() => openResponseModal(q)}
                        >
                          Ver Respuesta Completa
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </Masonry>
          )}
        </div>

        <ModeratorResponseModal
          selectedQuestion={selectedQuestion}
          moderatorResponseText={moderatorResponseText}
          maxResponseLength={maxResponseLength}
          savingModeratorResponse={savingModeratorResponse}
          moderatorResponseError={moderatorResponseError}
          moderatorResponseSuccess={moderatorResponseSuccess}
          onChangeResponse={(value) => {
            setModeratorResponseText(value);
            if (moderatorResponseError) setModeratorResponseError("");
          }}
          onClose={closeResponseModal}
          onSave={handleSaveModeratorResponse}
          onDelete={handleDeleteModeratorResponse}
        />
      </main>
    </div>
  );
}
