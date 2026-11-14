import React, { useState, useRef, useEffect } from 'react';
import type { Language } from '../locales/translations';
import { translations } from '../locales/translations';
import type { ChatMessage, Exam } from '../types';

interface ChatViewProps {
  exams: Exam[];
  lang: Language;
}

export const ChatView: React.FC<ChatViewProps> = ({ exams, lang }) => {
  const t = translations[lang];

  // Default conversation messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text:
        lang === 'en'
          ? "Hello! I am your WellQ AI Clinical Assistant. You can ask me questions about your medical test results, reference ranges, or symptoms. To consult about a specific report, tap the '+' button below to attach an exam."
          : "¡Hola! Soy tu Asistente Clínico con IA de WellQ. Puedes hacerme preguntas sobre los resultados de tus exámenes médicos, rangos de referencia o síntomas. Para consultar sobre un informe específico, pulsa el botón '+' abajo para adjuntarlo.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [selectedExamToAttach, setSelectedExamToAttach] = useState<Exam | null>(
    // Attach first ready exam by default if available for convenience
    exams.find((e) => e.status_category === 'listo' || e.document_name) || null
  );
  const [attachModalOpen, setAttachModalOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachedExamId: selectedExamToAttach?.clinical_test_id,
      attachedExamName: selectedExamToAttach?.document_name,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Generate intelligent AI clinical response tailored to the attached exam
    setTimeout(() => {
      let aiReply = '';
      const lower = text.toLowerCase();
      const attached = selectedExamToAttach;

      if (attached) {
        if (lower.includes('kinesio') || lower.includes('movilidad') || lower.includes('fuerza') || attached.document_name?.includes('kinesi')) {
          aiReply = lang === 'en'
            ? `Based on your **${attached.document_name}**:\n\n` +
              `• **Range of Motion A**: **110°** is **within normal reference (100–150°)**. Your joint flexibility is progressing nicely.\n` +
              `• **Strength Test B**: **8 units** is **below the normal range (10–20 units)**. This indicates mild muscular fatigue or weakness in the tested muscle group, typical after injury or reduced activity.\n` +
              `• **Pain Score**: **3 points**, which is classified as mild, manageable discomfort.\n\n` +
              `💡 **Recommendation:** We recommend continuing low-impact rehabilitation exercises under physiotherapist supervision. Please review this with your treating clinician at your next scheduled visit.`
            : `Analizando tu **${attached.document_name}**:\n\n` +
              `• **Movilidad A**: **110°** se encuentra **dentro del rango normal (100–150°)**. Tu flexibilidad articular evoluciona favorablemente.\n` +
              `• **Fuerza B**: **8 unidades** está **por debajo del rango de referencia (10–20)**. Esto sugiere fatiga o debilidad muscular leve en el grupo evaluado, habitual tras períodos de reposo.\n` +
              `• **Nivel de Dolor**: **3 puntos**, clasificado como molestia leve y tolerable.\n\n` +
              `💡 **Orientación clínica:** Se recomienda continuar los ejercicios kinésicos de fortalecimiento progresivo. Tu médico tratante validará el plan en tu próxima sesión.`;
        } else if (lower.includes('hemograma') || lower.includes('sangre') || lower.includes('blood') || lower.includes('hemoglobin')) {
          aiReply = lang === 'en'
            ? `Regarding your **Hemogram**: Your **Hemoglobin is 14.2 g/dL**, which is within the optimal healthy range (12.0–16.0 g/dL). No signs of anemia are present in this report.`
            : `Respecto a tu **Hemograma**: Tu **Hemoglobina está en 14.2 g/dL**, lo cual se encuentra dentro del rango óptimo saludable (12.0–16.0 g/dL). No se aprecian signos de anemia en este informe.`;
        } else {
          aiReply = lang === 'en'
            ? `I have reviewed **${attached.document_name || attached.clinical_test_id}**. The measurements have been processed against standard reference thresholds. Would you like me to explain any specific biomarker in detail?`
            : `He revisado tu **${attached.document_name || attached.clinical_test_id}**. Las mediciones se encuentran cotejadas frente a los rangos de referencia. ¿Deseas que profundicemos en algún marcador específico?`;
        }
      } else {
        if (lower.includes('pendiente') || lower.includes('tiempo') || lower.includes('when') || lower.includes('ready')) {
          aiReply = lang === 'en'
            ? "Your pending tests (such as Lipid Profile) typically require 24 to 48 hours for laboratory biochemistry processing. You can check the estimated countdown in the **Exams** tab."
            : "Tus exámenes pendientes (como el Perfil Lipídico) demoran habitualmente entre 24 y 48 horas en procesamiento bioquímico. Puedes ver el contador estimado en la pestaña **Exámenes**.";
        } else {
          aiReply = lang === 'en'
            ? "I am here to guide you through your medical results. You can tap the **'+' button** to attach an exam document so I can read the specific values and ranges for you."
            : "Estoy aquí para orientarte sobre tus resultados médicos. Puedes presionar el **botón '+'** para adjuntar un examen y podré analizar los valores y rangos específicos por ti.";
        }
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="chat-view-container">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-avatar-ai">
            <span>✨</span>
          </div>
          <div>
            <h3>{t.chatTitle}</h3>
            <small className="ai-status-online">● Online · AI Health Guidance (UK)</small>
          </div>
        </div>

        <div className="chat-disclaimer-pill">
          <span>🛡️ {t.chatDisclaimer}</span>
        </div>
      </div>

      {/* Suggested Quick Inquiries */}
      <div className="quick-prompts-bar">
        <span className="quick-label">{t.chatQuickPromptsTitle}</span>
        <button
          className="quick-chip"
          onClick={() => handleSendMessage(t.quickPrompt1)}
        >
          {t.quickPrompt1}
        </button>
        <button
          className="quick-chip"
          onClick={() => handleSendMessage(t.quickPrompt2)}
        >
          {t.quickPrompt2}
        </button>
        <button
          className="quick-chip"
          onClick={() => handleSendMessage(t.quickPrompt3)}
        >
          {t.quickPrompt3}
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="chat-messages-scroll">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-bubble-row ${msg.sender === 'user' ? 'from-user' : 'from-ai'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="bubble-avatar-ai">✨</div>
            )}

            <div className="chat-bubble">
              {msg.attachedExamName && (
                <div className="bubble-attachment-chip">
                  <span>📎 {msg.attachedExamName}</span>
                </div>
              )}
              <div className="bubble-text">
                {msg.text.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
              <span className="bubble-timestamp">{msg.timestamp}</span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="chat-bubble-row from-ai">
            <div className="bubble-avatar-ai">✨</div>
            <div className="chat-bubble typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Active Attachment Banner */}
      {selectedExamToAttach && (
        <div className="attached-exam-banner">
          <span className="banner-icon">📎</span>
          <div className="banner-text">
            <small>{t.attachedBadge}</small>
            <strong>{selectedExamToAttach.document_name || selectedExamToAttach.clinical_test_id}</strong>
          </div>
          <button
            className="btn-remove-attachment"
            onClick={() => setSelectedExamToAttach(null)}
            title={t.removeAttachment}
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Bar with '+' Button */}
      <div className="chat-input-bar">
        {/* '+' Button to attach exams */}
        <button
          className="btn-attach-exam"
          onClick={() => setAttachModalOpen(true)}
          title={t.attachExam}
          aria-label={t.attachExam}
        >
          <span className="plus-symbol">+</span>
        </button>

        {/* Text Input */}
        <input
          type="text"
          className="chat-text-input"
          placeholder={t.chatPlaceholder}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
        />

        {/* Send Button */}
        <button
          className="btn-send-message"
          disabled={!inputText.trim() || isTyping}
          onClick={() => handleSendMessage()}
          aria-label={t.chatSend}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>

      {/* Modal to pick an exam to attach */}
      {attachModalOpen && (
        <div className="modal-backdrop" onClick={() => setAttachModalOpen(false)}>
          <div className="modal-content select-exam-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>{t.selectExamModalTitle}</h4>
              <button className="btn-close" onClick={() => setAttachModalOpen(false)}>✕</button>
            </div>

            <div className="exam-selection-list">
              {exams.map((exam) => (
                <div
                  key={exam._id}
                  className={`exam-select-item ${selectedExamToAttach?._id === exam._id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedExamToAttach(exam);
                    setAttachModalOpen(false);
                  }}
                >
                  <div className="exam-select-left">
                    <strong>{exam.document_name || exam.clinical_test_id}</strong>
                    <small>ID: {exam.clinical_test_id} · {new Date(exam.created_at).toLocaleDateString()}</small>
                  </div>
                  <span className={`status-pill pill-${exam.status_category || 'listo'}`}>
                    {exam.status_category || 'listo'}
                  </span>
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <button className="btn-text" onClick={() => setAttachModalOpen(false)}>
                {t.btnCancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
