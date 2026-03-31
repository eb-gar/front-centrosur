import React, { useCallback, useMemo, useState } from "react";
import { ArchiveRestore, Clock, PlusCircle, Trash2 } from "lucide-react";
import Masonry from "react-masonry-css";
import AdminSidebar from "../../components/AdminSidebar";
import CategoryTabs from "../../components/CategoryTabs";
import ModeratorResponseModal from "../../components/ModeratorResponseModal";
import QuestionSummaryBadges from "../../components/QuestionSummaryBadges";
import "../../styles/admin/HistoryPage.css";
import { deleteQuestion, patchQuestion } from "../../services/questionsApi";
import { useModeratorResponse } from "../../hooks/useModeratorResponse";
import { useQuestionsAndCategories } from "../../hooks/useQuestionsAndCategories";
import {
  formatRelativeTime,
  getCategoryLabel,
  getReadableTextColor,
} from "../../utils/formatters";
import { filterQuestions, getQuestionStats } from "../../utils/questionFilters";

export default function HistoryPage() {
  const archivedQuestionFilter = useCallback(
    (question) => question.status === "READ",
    [],
  );

  const {
    preguntas,
    setPreguntas,
    categorias,
    errorCarga,
    setErrorCarga,
    reload: fetchHistory,
  } = useQuestionsAndCategories({
    questionFilter: archivedQuestionFilter,
    errorMessage: "Error de conexion con el servidor.",
  });

  const [filtroActivo, setFiltroActivo] = useState("TODO");
  const [preguntaAEliminar, setPreguntaAEliminar] = useState(null);
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

  const preguntasFiltradas = useMemo(
    () => filterQuestions(preguntas, filtroActivo),
    [preguntas, filtroActivo],
  );

  const stats = useMemo(
    () => getQuestionStats(preguntas, filtroActivo, categorias),
    [preguntas, filtroActivo, categorias],
  );

  const restaurarPregunta = async (id) => {
    await patchQuestion(
      id,
      { status: "APPROVED" },
      "No se pudo restaurar la pregunta.",
    );
    setPreguntas((prev) => prev.filter((q) => q.id !== id));
  };

  const eliminarPregunta = async (id) => {
    try {
      await deleteQuestion(id);
      setPreguntas((prev) => prev.filter((q) => q.id !== id));
    } catch (error) {
      console.error("Error eliminando pregunta:", error);
      setErrorCarga("Error de conexion con el servidor.");
    }
  };

  const confirmarEliminar = async () => {
    if (!preguntaAEliminar) return;
    await eliminarPregunta(preguntaAEliminar.id);
    setPreguntaAEliminar(null);
  };

  return (
    <div className="admin-layout">
      <AdminSidebar activeItem="historial" />

      <main className="admin-main">
        <header className="content-header">
          <h1>Historial de Preguntas Archivadas</h1>
          <p className="panel-subtitle">
            Revisa todas las preguntas archivadas de las sesiones anteriores.
          </p>
        </header>

        {errorCarga && (
          <div className="api-error" role="alert">
            <span>{errorCarga}</span>
            <button onClick={fetchHistory}>Reintentar</button>
          </div>
        )}

        <CategoryTabs
          tabs={[{ value: "TODO", label: "Todas" }]}
          categories={categorias}
          activeFilter={filtroActivo}
          onChangeFilter={setFiltroActivo}
          categoryLabel={(cat) => getCategoryLabel(cat.name)}
          activeCategoryTextColor={(cat) => getReadableTextColor(cat.color)}
          withUnclassified
          className="history-tabs-bar"
          rightContent={
            <QuestionSummaryBadges
              activeFilter={filtroActivo}
              total={stats.total}
              unclassified={stats.unclassified}
              activeCategory={stats.activeCategory}
              activeCategoryTotal={stats.activeCategoryTotal}
              categoryLabel={(category) => getCategoryLabel(category.name)}
            />
          }
        />

        <div className="history-cards-container">
          {preguntasFiltradas.length > 0 ? (
            <Masonry
              key={filtroActivo}
              breakpointCols={{ default: 3, 1200: 2, 768: 1 }}
              className="history-masonry-grid"
              columnClassName="history-masonry-column"
            >
              {preguntasFiltradas.map((q) => (
                <article key={q.id} className="history-card">
                  <div className="history-card-header">
                    <div className="history-meta">
                      <span className="anon-tag">ANONIMO</span>
                      <span className="history-time">
                        <Clock size={12} /> {formatRelativeTime(q.createdAt)}
                      </span>
                    </div>

                    {q.category ? (
                      <span
                        className="category-pill"
                        style={{
                          backgroundColor: `${q.category.color}22`,
                          color: q.category.color,
                          border: `1px solid ${q.category.color}`,
                        }}
                      >
                        {getCategoryLabel(q.category.name)}
                      </span>
                    ) : (
                      <span className="history-status-unclassified">
                        SIN CLASIFICAR
                      </span>
                    )}
                  </div>

                  <p className="history-card-text">{q.content}</p>

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

                  <div className="history-card-footer">
                    <button
                      className="btn-delete-question"
                      onClick={() => setPreguntaAEliminar(q)}
                      type="button"
                    >
                      <Trash2 size={16} /> Eliminar
                    </button>
                    <button
                      className="btn-restore-green"
                      onClick={() => restaurarPregunta(q.id)}
                      type="button"
                    >
                      <ArchiveRestore size={16} /> Restaurar
                    </button>
                  </div>
                </article>
              ))}
            </Masonry>
          ) : (
            <div className="empty-placeholder">
              <PlusCircle size={40} />
              <p>Las preguntas archivadas apareceran aqui</p>
            </div>
          )}
        </div>

        {preguntaAEliminar && (
          <div className="confirm-overlay" role="dialog" aria-modal="true">
            <div className="confirm-modal">
              <h3>Eliminar pregunta</h3>
              <p>
                Seguro que deseas eliminar este mensaje? Esta accion no se puede
                deshacer.
              </p>
              <div className="confirm-modal-actions">
                <button
                  type="button"
                  className="btn-confirm-cancel"
                  onClick={() => setPreguntaAEliminar(null)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-confirm-delete"
                  onClick={confirmarEliminar}
                >
                  Si, eliminar
                </button>
              </div>
            </div>
          </div>
        )}

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
