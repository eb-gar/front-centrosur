import { useEffect, useState } from "react";
import { Send, Info, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import "../../styles/client/question.css";
import { createQuestion } from "../../services/questionsApi";

export default function UsersQuestion() {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [feedbackClosing, setFeedbackClosing] = useState(false);
  const maxLength = 280;

  useEffect(() => {
    if (feedback.type !== "success" || !feedback.message) return;

    setFeedbackClosing(false);
    const closeTimer = window.setTimeout(() => setFeedbackClosing(true), 2200);
    const clearTimer = window.setTimeout(() => {
      setFeedback({ type: "", message: "" });
      setFeedbackClosing(false);
    }, 2600);

    return () => {
      window.clearTimeout(closeTimer);
      window.clearTimeout(clearTimer);
    };
  }, [feedback]);

  const handleSubmit = async () => {
    if (enviando) return;

    if (!texto.trim()) {
      setFeedbackClosing(false);
      setFeedback({
        type: "error",
        message: "No puedes enviar una pregunta vacia. Escribe algo primero.",
      });
      return;
    }

    setEnviando(true);
    setFeedback({ type: "", message: "" });
    try {
      await createQuestion({ content: texto.trim() });
      setFeedback({
        type: "success",
        message: "Pregunta enviada con exito.",
      });
      setTexto("");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo enviar la pregunta. Intenta de nuevo.";
      setFeedback({ type: "error", message });
      console.error(error);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mobile-page-container">
      <main className="main-content">
        <section className="intro-text">
          <h1 className="title">Participa en la Sesión</h1>
          <p className="description">
            Tu perspectiva enriquece el diálogo. <br />
            Envía tus dudas al orador.
          </p>
        </section>

        <div className="form-card">
          {feedback.message ? (
            <div
              className={`status-message ${feedback.type} ${feedbackClosing ? "is-closing" : ""}`}
              role="status"
              aria-live="polite"
            >
              {feedback.type === "success" ? (
                <CheckCircle2 size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              {feedback.message}
            </div>
          ) : null}

          <div className="input-group">
            <textarea
              placeholder="Escribe tu pregunta aquí..."
              value={texto}
              maxLength={maxLength}
              onChange={(e) => {
                setTexto(e.target.value);
                if (feedback.type === "error" && e.target.value.trim()) {
                  setFeedback({ type: "", message: "" });
                }
              }}
              disabled={enviando}
            />
            <div className="char-counter">
              {texto.length} / {maxLength}
            </div>
          </div>

          <div className="moderation-notice">
            <div className="info-icon-wrapper">
              <Info size={16} fill="#0066cc" color="white" />
            </div>
            <span>Las preguntas son revisadas por moderadores.</span>
          </div>

          <button
            className={`submit-button ${enviando ? "loading" : ""}`}
            onClick={handleSubmit}
            disabled={enviando}
          >
            {enviando ? (
              <Loader2 className="spinner" size={20} />
            ) : (
              <>
                Enviar pregunta <Send size={18} />
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
