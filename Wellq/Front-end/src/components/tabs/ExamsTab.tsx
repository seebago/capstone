import { useState } from 'react';
import type { PortalExam } from '../../types/portal';
import { PdfViewer } from '../PdfViewer';

interface ExamsTabProps {
  exams: PortalExam[];
  onUploadClick: () => void;
  onDownloadDemoPdf: () => void;
}

export function ExamsTab({
  exams,
  onUploadClick,
  onDownloadDemoPdf,
}: ExamsTabProps) {
  const [expandedExamId, setExpandedExamId] = useState<string | null>(
    exams.find((e) => e.status === 'listo')?.id || null
  );

  const toggleExpand = (id: string, status: string) => {
    if (status !== 'listo') return;
    setExpandedExamId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="tab-container exams-tab">
      <div className="tab-title-row">
        <div>
          <h3>Mis Exámenes Médicos</h3>
          <p className="tab-subtitle">
            Consulta el estado de tus exámenes de laboratorio e imagenología. Previsualiza y descarga los resultados cuando estén listos.
          </p>
        </div>
        <div className="tab-actions-cluster">
          <button className="btn-secondary btn-sm" onClick={onDownloadDemoPdf} title="Descargar examen ficticio para pruebas">
            📥 PDF de Prueba
          </button>
          <button className="btn-primary" onClick={onUploadClick}>
            + Subir Examen
          </button>
        </div>
      </div>

      {/* Table of Exams as specified by the user */}
      <div className="exams-table-wrapper">
        <div className="exams-table-header">
          <div className="col-name">Nombre del Examen / Solicitud</div>
          <div className="col-status">Estado y Disponibilidad</div>
        </div>

        <div className="exams-table-body">
          {exams.map((exam) => {
            const isExpanded = expandedExamId === exam.id;
            const isReady = exam.status === 'listo';

            return (
              <div
                key={exam.id}
                className={`exam-row-container ${isReady ? 'is-ready' : ''} ${isExpanded ? 'expanded' : ''}`}
              >
                {/* Main Row */}
                <div
                  className={`exam-row-main ${isReady ? 'clickable' : ''}`}
                  onClick={() => toggleExpand(exam.id, exam.status)}
                >
                  {/* Left Column: Exam Name & Meta */}
                  <div className="exam-col-left">
                    <div className="exam-icon-type">
                      {isReady ? '📄' : exam.status === 'pendiente' ? '⏳' : '🩺'}
                    </div>
                    <div>
                      <strong className="exam-name-text">{exam.name}</strong>
                      <div className="exam-meta-sub">
                        <span>{exam.laboratory}</span> · <span>Solicitado: {exam.dateRequested}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Status & Estimated Wait / Arrow */}
                  <div className="exam-col-right">
                    {/* Status 1: Listo */}
                    {exam.status === 'listo' && (
                      <div className="status-cluster">
                        <span className="exam-status-badge badge-ready">
                          Listo
                        </span>
                        <button
                          className={`btn-expand-arrow ${isExpanded ? 'open' : ''}`}
                          aria-label={isExpanded ? 'Ocultar examen' : 'Previsualizar examen'}
                          title="Desplegar para previsualizar y descargar"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* Status 2: Pendiente (with estimated wait time) */}
                    {exam.status === 'pendiente' && (
                      <div className="status-cluster pending-cluster">
                        <span className="exam-status-badge badge-pending">
                          Pendiente
                        </span>
                        <span className="wait-time-tag">
                          ⏳ {exam.estimatedWaitTime || 'Disponible en aprox. 24 a 48 hrs'}
                        </span>
                      </div>
                    )}

                    {/* Status 3: No Realizado */}
                    {exam.status === 'no_realizado' && (
                      <div className="status-cluster not-done-cluster">
                        <span className="exam-status-badge badge-not-done">
                          No realizado
                        </span>
                        <span className="pending-sample-tag">
                          Pendiente de toma de muestra
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Collapsible Preview Panel (Only for 'Listo') */}
                {isReady && isExpanded && (
                  <div className="exam-expanded-preview">
                    <div className="preview-action-bar">
                      <div>
                        <strong>Previsualización del Informe Oficial</strong>
                        <p className="preview-file-meta">
                          Archivo: {exam.documentName || 'evaluacion-kinesiologica-FICTICIA.pdf'} · Formato digital firmado
                        </p>
                      </div>

                      {exam.documentData && (
                        <a
                          href={exam.documentData}
                          download={exam.documentName || 'examen-medico.pdf'}
                          className="btn-primary btn-sm"
                          title="Descargar archivo en PDF a tu dispositivo"
                        >
                          ⬇ Descargar Examen Completo
                        </a>
                      )}
                    </div>

                    {/* Embedded PDF Viewer */}
                    <div className="preview-embed-frame">
                      {exam.documentData ? (
                        <PdfViewer
                          dataUrl={exam.documentData}
                          fileName={exam.documentName}
                        />
                      ) : (
                        <div className="preview-fallback-box">
                          <p>📄 Documento digital listo para descargar.</p>
                          <a
                            href="/evaluacion-kinesiologica-FICTICIA.pdf"
                            download="evaluacion-kinesiologica-FICTICIA.pdf"
                            className="btn-secondary"
                          >
                            ⬇ Descargar Documento
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="preview-footer-note">
                      <small>
                        🔒 Documento clínico oficial emitido bajo estándares de confidencialidad y Ley 20.584.
                      </small>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
