import React from "react";

export default function CreateQuestionModal({
  show,
  savingQuestion,
  createQuestionError,
  newQuestionText,
  newQuestionModeratorResponse,
  showModeratorResponse,
  newQuestionCategoryId,
  maxQuestionLength,
  maxResponseLength,
  categorias,
  onClose,
  onSave,
  onQuestionTextChange,
  onModeratorResponseChange,
  onToggleModeratorResponse,
  onCategorySelect,
}) {
  if (!show) return null;

  return (
    <div className="create-question-modal-overlay" role="presentation">
      <div className="create-question-modal" role="dialog" aria-modal="true">
        <div className="create-question-modal-header">
          <h2>Añadir Nueva Pregunta</h2>
          <button
            type="button"
            className="create-question-modal-close"
            onClick={onClose}
            disabled={savingQuestion}
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>

        <div className="create-question-modal-body">
          {createQuestionError && (
            <div className="create-question-feedback error" role="alert">
              {createQuestionError}
            </div>
          )}

          <div className="create-question-input-wrap">
            <textarea
              placeholder="Escribe la pregunta aquí..."
              value={newQuestionText}
              maxLength={maxQuestionLength}
              onChange={(e) => onQuestionTextChange(e.target.value)}
              disabled={savingQuestion}
            />
            <div className="create-question-char-counter">
              {newQuestionText.length} / {maxQuestionLength}
            </div>
          </div>

          <div className="create-question-categories">
            <button
              type="button"
              className={`create-question-optional-toggle ${showModeratorResponse ? "is-open" : ""}`}
              onClick={onToggleModeratorResponse}
              disabled={savingQuestion}
            >
              {showModeratorResponse
                ? "Ocultar respuesta del moderador"
                : "Añadir respuesta del moderador (opcional)"}
            </button>

            {showModeratorResponse && (
              <div className="create-question-input-wrap create-question-optional-wrap">
                <textarea
                  placeholder="Escribe aquí la respuesta del moderador..."
                  value={newQuestionModeratorResponse}
                  maxLength={maxResponseLength}
                  onChange={(e) => onModeratorResponseChange(e.target.value)}
                  disabled={savingQuestion}
                />
                <div className="create-question-char-counter">
                  {newQuestionModeratorResponse.length} / {maxResponseLength}
                </div>
              </div>
            )}
          </div>

          <div className="create-question-categories">
            <p>Seleccionar categoría</p>
            <div className="create-question-categories-list">
              {categorias.length > 0 ? (
                categorias.map((cat) => {
                  const isActive = newQuestionCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`create-question-category-pill ${isActive ? "is-active" : ""}`}
                      onClick={() => onCategorySelect(cat.id)}
                      style={
                        isActive
                          ? {
                              backgroundColor: cat.color,
                              color: "#ffffff",
                              borderColor: cat.color,
                            }
                          : {
                              color: cat.color,
                              borderColor: `${cat.color}66`,
                              backgroundColor: `${cat.color}10`,
                            }
                      }
                      disabled={savingQuestion}
                    >
                      {cat.name}
                    </button>
                  );
                })
              ) : (
                <span className="no-categories">
                  Aún no hay categorías para seleccionar.
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="create-question-modal-footer">
          <button
            type="button"
            className="btn-create-question-cancel"
            onClick={onClose}
            disabled={savingQuestion}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn-create-question-save"
            onClick={onSave}
            disabled={savingQuestion || categorias.length === 0}
          >
            {savingQuestion ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
