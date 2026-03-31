import React from "react";

export default function ModeratorResponseModal({
  selectedQuestion,
  moderatorResponseText,
  maxResponseLength,
  savingModeratorResponse,
  moderatorResponseError,
  moderatorResponseSuccess,
  onChangeResponse,
  onClose,
  onSave,
  onDelete,
}) {
  if (!selectedQuestion) return null;

  return (
    <div className="create-question-modal-overlay" role="presentation">
      <div className="create-question-modal" role="dialog" aria-modal="true">
        <div className="create-question-modal-header">
          <h2>Responder Pregunta</h2>
          <button
            type="button"
            className="create-question-modal-close"
            onClick={onClose}
            disabled={savingModeratorResponse}
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>

        <div className="create-question-modal-body">
          <p className="question-modal-original">
            <strong>Pregunta:</strong> {selectedQuestion.content}
          </p>

          <div className="create-question-input-wrap">
            <div className="response-display-text">
              {selectedQuestion?.moderatorResponse || "Sin respuesta"}
            </div>
          </div>
        </div>

        <div className="create-question-modal-footer">
          <button
            type="button"
            className="btn-create-question-cancel"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
