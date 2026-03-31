import { QRCodeCanvas } from "qrcode.react";
import { Camera, Link as LinkIcon, Send } from "lucide-react";
import "../../styles/qr/qr.css";
import { APP_ROUTES } from "../../constants/appRoutes";

export default function QRPage() {
  const questionUrl = new URL(
    APP_ROUTES.USER_QUESTION,
    window.location.href,
  ).toString();

  return (
    <div className="qr-container">
      <h1 className="qr-title">
        Escanea para enviar <span>tu pregunta</span>
      </h1>

      <div className="qr-card">
        <div className="qr-inner">
          <div className="qr-box">
            <QRCodeCanvas value={questionUrl} size={300} bgColor="#ffffff" />
          </div>
        </div>

        <div className="qr-badge">
          <div className="live-dot"></div>
          EN VIVO • EVENTO 2026
        </div>
      </div>

      <div className="qr-steps">
        <div className="qr-step">
          <div className="icon-box">
            <Camera size={20} />
          </div>
          <h3>Abre tu cámara</h3>
          <p>No necesitas instalar ninguna aplicación adicional.</p>
        </div>

        <div className="qr-step">
          <div className="icon-box">
            <LinkIcon size={20} />
          </div>
          <h3>Toca el enlace</h3>
          <p>Aparecerá una notificación segura en tu pantalla.</p>
        </div>

        <div className="qr-step">
          <div className="icon-box">
            <Send size={20} />
          </div>
          <h3>Envía tu duda</h3>
          <p>El moderador revisará tu pregunta en tiempo real.</p>
        </div>
      </div>
    </div>
  );
}
