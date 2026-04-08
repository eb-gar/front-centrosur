import React, { useEffect, useMemo, useState } from "react";
import { Archive, RefreshCcw, Clock, CircleEllipsis } from "lucide-react";
import Masonry from "react-masonry-css";
import "../../styles/admin/AdminDashboard.css";
import AdminSidebar from "../../components/AdminSidebar";
import CreateQuestionModal from "../../components/CreateQuestionModal";
import CategoryTabs from "../../components/CategoryTabs";
import ModeratorResponseModal from "../../components/ModeratorResponseModal";
import QuestionSummaryBadges from "../../components/QuestionSummaryBadges";
import { socket } from "../../services/socket";
import { createQuestion, patchQuestion } from "../../services/questionsApi";
import { useQuestionsAndCategories } from "../../hooks/useQuestionsAndCategories";
import { useModeratorResponse } from "../../hooks/useModeratorResponse";
import {
  getActiveQuestions,
  filterQuestions,
  getQuestionStats,
} from "../../utils/questionFilters";
import {
  formatRelativeTime,
  getCategoryLabel,
  getReadableTextColor,
} from "../../utils/formatters";

export default function AdminDashboard() {
  const {
    preguntas,
    setPreguntas,
    categorias,
    errorCarga,
    reload: fetchData,
  } = useQuestionsAndCategories({
    errorMessage: "Error de conexión con el servidor.",
  });

  const [animatingQuestionId, setAnimatingQuestionId] = useState(null);
  const [archivingQuestionIds, setArchivingQuestionIds] = useState([]);
  const [openRecategoryQuestionId, setOpenRecategoryQuestionId] =
    useState(null);
  const [filtroActivo, setFiltroActivo] = useState("DIRECTO");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showModeratorResponseInput, setShowModeratorResponseInput] =
    useState(false);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionModeratorResponse, setNewQuestionModeratorResponse] =
    useState("");
  const [newQuestionCategoryId, setNewQuestionCategoryId] = useState("");
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [createQuestionError, setCreateQuestionError] = useState("");
  const maxQuestionLength = 300;
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
  });

  useEffect(() => {
    const handleNewQuestion = (newQ) => {
      setPreguntas((prev) => [newQ, ...prev]);
    };

    const handleQuestionUpdated = (updatedQ) => {
      setPreguntas((prev) =>
        prev.map((q) => (q.id === updatedQ.id ? { ...q, ...updatedQ } : q)),
      );
    };

    socket.on("new_question_received", handleNewQuestion);
    socket.on("question_updated", handleQuestionUpdated);

    return () => {
      socket.off("new_question_received", handleNewQuestion);
      socket.off("question_updated", handleQuestionUpdated);
    };
  }, [setPreguntas]);

  const handleCategorize = async (questionId, categoryId) => {
    setAnimatingQuestionId(questionId);

    setPreguntas((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              categoryId,
              category: categorias.find((c) => c.id === categoryId),
            }
          : q,
      ),
    );

    try {
      await patchQuestion(
        questionId,
        { categoryId, status: "APPROVED" },
        "No se pudo actualizar la categoria.",
      );
    } catch (error) {
      console.error("Error actualizando categoria:", error);
    }

    window.setTimeout(() => {
      setAnimatingQuestionId((prev) => (prev === questionId ? null : prev));
    }, 600);

    setOpenRecategoryQuestionId((prev) => (prev === questionId ? null : prev));
  };

  const handleArchiveQuestion = (id) => {
    if (archivingQuestionIds.includes(id)) return;

    setArchivingQuestionIds((prev) => [...prev, id]);

    window.setTimeout(() => {
      setPreguntas((prev) => prev.filter((q) => q.id !== id));
      setArchivingQuestionIds((prev) =>
        prev.filter((questionId) => questionId !== id),
      );
    }, 420);

    patchQuestion(
      id,
      { status: "READ" },
      "No se pudo archivar la pregunta.",
    ).catch((error) => {
      console.error("Error archivando pregunta:", error);
    });
  };

  const openCreateQuestionModal = () => {
    setShowCreateModal(true);
    setShowModeratorResponseInput(false);
    setCreateQuestionError("");
  };

  const resetCreateModalState = () => {
    setCreateQuestionError("");
    setNewQuestionText("");
    setNewQuestionModeratorResponse("");
    setShowModeratorResponseInput(false);
    setNewQuestionCategoryId("");
  };

  const closeCreateQuestionModal = () => {
    if (savingQuestion) return;
    setShowCreateModal(false);
    resetCreateModalState();
  };

  const handleCreateQuestion = async () => {
    if (savingQuestion) return;

    const content = newQuestionText.trim();
    const moderatorResponse = newQuestionModeratorResponse.trim();
    if (!content) {
      setCreateQuestionError("Escribe una pregunta antes de guardar.");
      return;
    }

    if (content.length < 5) {
      setCreateQuestionError("La pregunta debe tener al menos 5 caracteres.");
      return;
    }

    if (!newQuestionCategoryId) {
      setCreateQuestionError("Selecciona una categoría para continuar.");
      return;
    }

    const selectedCategory = categorias.find(
      (c) => c.id === newQuestionCategoryId,
    );
    if (!selectedCategory) {
      setCreateQuestionError("La categoría seleccionada no es válida.");
      return;
    }

    setSavingQuestion(true);
    setCreateQuestionError("");

    try {
      const createdQuestion = await createQuestion({
        content,
        createdByModerator: true,
      });

      const updatedQuestion = await patchQuestion(
        createdQuestion.id,
        {
          categoryId: newQuestionCategoryId,
          status: "APPROVED",
          ...(moderatorResponse ? { moderatorResponse } : {}),
        },
        "La pregunta fue creada, pero no se pudo asignar categoria.",
      );

      setPreguntas((prev) => {
        const existingIndex = prev.findIndex(
          (q) => q.id === updatedQuestion.id,
        );
        if (existingIndex === -1) {
          return [updatedQuestion, ...prev];
        }

        return prev.map((q) =>
          q.id === updatedQuestion.id ? { ...q, ...updatedQuestion } : q,
        );
      });

      setShowCreateModal(false);
      resetCreateModalState();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo guardar la pregunta.";
      setCreateQuestionError(message);
    } finally {
      setSavingQuestion(false);
    }
  };

  const preguntasActivas = useMemo(
    () => getActiveQuestions(preguntas),
    [preguntas],
  );

  const preguntasFiltradas = useMemo(
    () =>
      filterQuestions(preguntas, filtroActivo, {
        includeLive: true,
        animatingQuestionId,
      }),
    [preguntas, filtroActivo, animatingQuestionId],
  );

  const stats = useMemo(
    () => getQuestionStats(preguntasActivas, filtroActivo, categorias),
    [preguntasActivas, filtroActivo, categorias],
  );

  return (
    <div className="admin-layout">
      <AdminSidebar activeItem="panel" />

      <main className="admin-main">
        <header className="content-header">
          <h1>Panel de Preguntas</h1>
          <p className="panel-subtitle">
            Gestiona las intervenciones de la audiencia en tiempo real.
            Clasifica las nuevas entradas para el orador.
          </p>
        </header>

        {errorCarga && (
          <div className="api-error" role="alert">
            <span>{errorCarga}</span>
            <button onClick={fetchData}>Reintentar</button>
          </div>
        )}

        <CategoryTabs
          tabs={[
            {
              value: "DIRECTO",
              label: (
                <span className="tab-live-label">
                  <span className="tab-live-dot" aria-hidden="true" />
                  En Directo
                </span>
              ),
            },
            { value: "TODO", label: "Todos" },
          ]}
          categories={categorias}
          activeFilter={filtroActivo}
          onChangeFilter={setFiltroActivo}
          categoryLabel={(cat) => getCategoryLabel(cat.name)}
          activeCategoryTextColor={(cat) => getReadableTextColor(cat.color)}
          withUnclassified
          rightContent={
            <QuestionSummaryBadges
              activeFilter={filtroActivo}
              total={stats.total}
              unclassified={stats.unclassified}
              live={stats.live}
              activeCategory={stats.activeCategory}
              activeCategoryTotal={stats.activeCategoryTotal}
              categoryLabel={(category) => getCategoryLabel(category.name)}
            />
          }
        />

        <div className="dashboard-cards-container">
          {preguntasFiltradas.length > 0 ? (
            <Masonry
              key={filtroActivo}
              breakpointCols={{ default: 3, 1200: 2, 768: 1 }}
              className="questions-masonry-grid"
              columnClassName="questions-masonry-column"
            >
              {preguntasFiltradas.map((q) => {
                const isTodos = filtroActivo === "TODO";
                const isDirecto = filtroActivo === "DIRECTO";
                const isSinClasificar = filtroActivo === "SIN_CLASIFICAR";
                const isRecategorizeOpen = openRecategoryQuestionId === q.id;

                return (
                  <div
                    key={q.id}
                    className={`q-card ${isTodos || isDirecto || isSinClasificar ? "q-card-todos" : ""} ${
                      !q.categoryId && (isTodos || isDirecto || isSinClasificar)
                        ? "q-card-unclassified"
                        : ""
                    } ${animatingQuestionId === q.id ? "q-card-categorized" : ""} ${
                      archivingQuestionIds.includes(q.id)
                        ? "q-card-archiving"
                        : ""
                    }`}
                  >
                    <div className="q-card-header">
                      <div className="q-meta">
                        <span className="anon-tag">ANÓNIMO</span>
                        <span className="time-tag">
                          <Clock size={12} /> {formatRelativeTime(q.createdAt)}
                        </span>
                        {q.createdByModerator && (
                          <span
                            className="origin-tag moderator-origin-tag"
                            title="Esta pregunta fue creada desde el panel del moderador"
                          >
                            CREADA POR MODERADOR
                          </span>
                        )}
                      </div>

                      {isTodos ? (
                        <span
                          className={`status-pill ${
                            q.category ? "has-category" : "no-category"
                          }`}
                          style={
                            q.category
                              ? {
                                  backgroundColor: q.category.color + "22",
                                  color: q.category.color,
                                  border: `1px solid ${q.category.color}`,
                                }
                              : {}
                          }
                        >
                          {q.category
                            ? getCategoryLabel(q.category.name)
                            : "SIN CLASIFICAR"}
                        </span>
                      ) : (
                        q.category && (
                          <span
                            className="category-pill"
                            style={{
                              backgroundColor: q.category.color + "22",
                              color: q.category.color,
                              border: `1px solid ${q.category.color}`,
                            }}
                          >
                            {getCategoryLabel(q.category.name)}
                          </span>
                        )
                      )}
                    </div>

                    <p className="q-text">{q.content}</p>
                    {q.moderatorResponse && (
                      <button
                        type="button"
                        className="moderator-response-preview"
                        onClick={() => openResponseModal(q)}
                        aria-label="Abrir respuesta del moderador"
                      >
                        <strong>Respuesta moderador:</strong>{" "}
                        {q.moderatorResponse}
                      </button>
                    )}

                    <div
                      className={`q-card-footer ${
                        !q.categoryId ? "q-card-footer-assign" : ""
                      } ${isRecategorizeOpen ? "q-card-footer-recategorize" : ""}`}
                    >
                      {!q.categoryId && (
                        <div className="assign-actions-bottom">
                          {categorias.length > 0 ? (
                            categorias.map((cat) => (
                              <button
                                key={cat.id}
                                onClick={() => handleCategorize(q.id, cat.id)}
                                className="btn-category-select"
                                style={{
                                  "--cat-color": cat.color,
                                  borderColor: cat.color,
                                }}
                              >
                                {getCategoryLabel(cat.name)}
                              </button>
                            ))
                          ) : (
                            <span className="no-categories">
                              Aún no hay categorías
                            </span>
                          )}
                        </div>
                      )}

                      {q.categoryId && (
                        <div className="recategorize-section">
                          <button
                            className={`btn-recategorize-toggle ${isRecategorizeOpen ? "is-open" : ""}`}
                            onClick={() =>
                              setOpenRecategoryQuestionId((prev) =>
                                prev === q.id ? null : q.id,
                              )
                            }
                          >
                            <RefreshCcw size={14} className="recat-icon" />{" "}
                            Cambiar categoría
                          </button>

                          {isRecategorizeOpen && (
                            <div className="recategorize-options">
                              {categorias.map((cat) => (
                                <button
                                  key={cat.id}
                                  onClick={() => handleCategorize(q.id, cat.id)}
                                  className="btn-category-select"
                                  style={{
                                    "--cat-color": cat.color,
                                    borderColor: cat.color,
                                  }}
                                >
                                  {getCategoryLabel(cat.name)}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="done-actions">
                        <button
                          className="btn-respond"
                          onClick={() => openResponseModal(q)}
                        >
                          Responder
                        </button>
                        <button
                          className="btn-archive"
                          onClick={() => handleArchiveQuestion(q.id)}
                          disabled={archivingQuestionIds.includes(q.id)}
                        >
                          <Archive size={16} /> Archivar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </Masonry>
          ) : (
            <div className="empty-placeholder">
              <CircleEllipsis size={40} />
              <p>Las nuevas preguntas apareceran aqui</p>
            </div>
          )}
        </div>

        <button
          type="button"
          className="floating-create-question-btn"
          onClick={openCreateQuestionModal}
          aria-label="Agregar nueva pregunta"
        >
          + Nueva pregunta
        </button>

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

        <CreateQuestionModal
          show={showCreateModal}
          savingQuestion={savingQuestion}
          createQuestionError={createQuestionError}
          newQuestionText={newQuestionText}
          newQuestionModeratorResponse={newQuestionModeratorResponse}
          showModeratorResponse={showModeratorResponseInput}
          newQuestionCategoryId={newQuestionCategoryId}
          maxQuestionLength={maxQuestionLength}
          maxResponseLength={maxResponseLength}
          categorias={categorias}
          onClose={closeCreateQuestionModal}
          onSave={handleCreateQuestion}
          onToggleModeratorResponse={() =>
            setShowModeratorResponseInput((prev) => !prev)
          }
          onQuestionTextChange={(value) => {
            setNewQuestionText(value);
            if (createQuestionError) setCreateQuestionError("");
          }}
          onModeratorResponseChange={(value) => {
            setNewQuestionModeratorResponse(value);
            if (value.trim() && !showModeratorResponseInput) {
              setShowModeratorResponseInput(true);
            }
            if (createQuestionError) setCreateQuestionError("");
          }}
          onCategorySelect={setNewQuestionCategoryId}
        />
      </main>
    </div>
  );
}
