import React, { useState } from 'react';
import type { Language } from '../locales/translations';
import { translations } from '../locales/translations';
import type { Exam, Measurement } from '../types';
import { PdfViewer } from './PdfViewer';

interface ClinicianViewProps {
  exams: Exam[];
  lang: Language;
  onRefresh: () => Promise<void>;
  onDownloadDemoPdf: () => void;
  onValidateExam: (
    examId: string,
    decision: 'validate' | 'reject' | 'error',
    reason: string
  ) => Promise<void>;
}

export const ClinicianView: React.FC<ClinicianViewProps> = ({
  exams,
  lang,
  onRefresh,
  onDownloadDemoPdf,
  onValidateExam,
}) => {
  const t = translations[lang];

  // Selected exam for full Range Review & Clinical Validation modal
  const [reviewingExam, setReviewingExam] = useState<Exam | null>(null);

  // Accordion state for audit history dropdowns per exam
  const [expandedAuditIds, setExpandedAuditIds] = useState<Record<string, boolean>>({});

  // Search and filter state for "Historial de exámenes"
  const [searchQuery, setSearchQuery] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'pending' | 'confirmed' | 'validated'>('all');

  // Review modal state
  const [reviewReason, setReviewReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Toggle audit history expansion
  const toggleAudit = (examId: string) => {
    setExpandedAuditIds((prev) => ({
      ...prev,
      [examId]: !prev[examId],
    }));
  };

  // Open review modal
  const handleOpenReview = (exam: Exam) => {
    setReviewingExam(exam);
    setReviewReason(exam.review_reason || '');
    setActionFeedback(null);
  };

  // Close review modal
  const handleCloseReview = () => {
    setReviewingExam(null);
    setReviewReason('');
    setActionFeedback(null);
  };

  // Execute validation action
  const handleAction = async (decision: 'validate' | 'reject' | 'error') => {
    if (!reviewingExam) return;

    if (decision === 'error' && (!reviewReason || reviewReason.trim().length < 3)) {
      setActionFeedback(
        lang === 'en'
          ? '⚠️ Clinical observation (min 3 chars) is required when marking an error.'
          : '⚠️ Se requiere una observación clínica (mínimo 3 caracteres) para marcar un error.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onValidateExam(reviewingExam._id, decision, reviewReason);
      setActionFeedback(
        decision === 'validate'
          ? (lang === 'en' ? '✅ Exam validated clinically.' : '✅ Examen validado clínicamente.')
          : decision === 'error'
          ? (lang === 'en' ? '⚠️ Exam marked with error.' : '⚠️ Examen marcado con error.')
          : (lang === 'en' ? '❌ Exam rejected.' : '❌ Examen rechazado.')
      );
      setTimeout(() => {
        handleCloseReview();
      }, 1200);
    } catch {
      setActionFeedback(lang === 'en' ? 'Action failed.' : 'Error al procesar acción.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper: Status label & badge
  const getClinicianStatusBadge = (exam: Exam) => {
    if (exam.status === 'clinically_validated') {
      return <span className="status-badge-validated">{t.statusValidated}</span>;
    }
    if (exam.status === 'error') {
      return <span className="status-badge-error">{t.errorBadge}</span>;
    }
    if (exam.status === 'rejected') {
      return <span className="status-badge-rejected">{lang === 'en' ? 'Rejected' : 'Rechazado'}</span>;
    }
    if (exam.status === 'confirmed_by_patient') {
      return <span className="status-badge-confirmed">{t.statusConfirmed}</span>;
    }
    return <span className="status-badge-awaiting">{t.statusAwaiting}</span>;
  };

  // KPI calculations
  const totalVisible = exams.length;
  const countAwaiting = exams.filter(
    (e) => e.status === 'awaiting_confirmation' || e.status === 'pendiente' || e.status === 'no_realizado'
  ).length;
  const countConfirmed = exams.filter((e) => e.status === 'confirmed_by_patient').length;
  const countValidated = exams.filter((e) => e.status === 'clinically_validated').length;

  // Search and filter for History section
  const filteredHistory = exams.filter((exam) => {
    // Search query match
    const nameMatch =
      (exam.document_name || exam.clinical_test_id || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    if (!nameMatch) return false;

    // Filter pill match
    if (historyFilter === 'pending') {
      return exam.status === 'awaiting_confirmation' || exam.status === 'pendiente';
    }
    if (historyFilter === 'confirmed') {
      return exam.status === 'confirmed_by_patient';
    }
    if (historyFilter === 'validated') {
      return exam.status === 'clinically_validated';
    }
    return true;
  });

  return (
    <div className="clinician-view-container">
      {/* Clinician Header Section (Image 2) */}
      <div className="clinician-header-section">
        <div className="clinician-breadcrumb">{t.clinicianEyebrow}</div>
        <h1 className="clinician-title">{t.clinicianExamsTitle}</h1>
        <p className="clinician-subtitle">{t.clinicianExamsSubtitle}</p>

        <div className="clinician-status-row">
          <span className="badge-connected">
            <span className="badge-connected-dot"></span>
            {t.connectedDatabase}
          </span>
          <button className="btn-refresh" onClick={() => onRefresh()}>
            {t.refresh}
          </button>
        </div>
      </div>

      {/* Main Card: Archivos de examen (Images 2 & 3) */}
      <section className="clinician-card exam-files-card">
        <h2 className="clinician-card-title">{t.examFilesSection}</h2>
        <p className="clinician-card-desc">{t.examFilesDescription}</p>

        <div className="exam-files-actions">
          <button
            className="btn-download-test-file"
            onClick={onDownloadDemoPdf}
          >
            {t.downloadDemo}
          </button>
        </div>

        {/* List of Patient Exam Documents */}
        <div className="exam-files-list">
          {exams.map((exam) => {
            const isExpanded = !!expandedAuditIds[exam._id];
            const docName = exam.document_name || exam.clinical_test_id || 'documento-examen.pdf';
            const formattedDate = new Date(exam.created_at).toLocaleString(
              lang === 'en' ? 'en-GB' : 'es-CL',
              {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              }
            );
            const fileSize = exam.document_size
              ? `${Math.max(1, Math.round(exam.document_size / 1024))} KB`
              : '2 KB';

            return (
              <div key={exam._id} className="clinician-doc-card">
                <div className="doc-card-top">
                  <h3 className="doc-card-filename">{docName}</h3>
                  <div className="doc-card-badge">{getClinicianStatusBadge(exam)}</div>
                </div>

                <div className="doc-card-meta">
                  <span>{formattedDate} · {fileSize}</span>
                </div>

                <div className="doc-card-action-buttons">
                  <button
                    className="btn-card-download"
                    onClick={() => {
                      if (exam.document_data) {
                        const win = window.open();
                        win?.document.write(
                          `<iframe src="${exam.document_data}" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;" allowfullscreen></iframe>`
                        );
                      } else {
                        onDownloadDemoPdf();
                      }
                    }}
                  >
                    {t.btnDownloadFile}
                  </button>

                  <button
                    className="btn-card-review"
                    onClick={() => handleOpenReview(exam)}
                  >
                    {t.btnReviewExam}
                  </button>
                </div>

                {exam.status === 'clinically_validated' && (
                  <p className="doc-card-review-notice">{t.reviewFinishedNotice}</p>
                )}

                {/* Expandable Review History / Audit Trail */}
                <div className="audit-accordion-wrapper">
                  <button
                    className="btn-audit-toggle"
                    onClick={() => toggleAudit(exam._id)}
                    aria-expanded={isExpanded}
                  >
                    <span className="audit-toggle-icon">{isExpanded ? '▼' : '▶'}</span>
                    <span className="audit-toggle-text">{t.reviewHistorySummary}</span>
                  </button>

                  {isExpanded && (
                    <div className="audit-timeline-content">
                      <div className="audit-timeline-step">
                        <div className="step-point"></div>
                        <div className="step-body">
                          <strong className="step-title">{t.auditFileReceived}</strong>
                          <span className="step-meta">
                            {formattedDate} · {exam.patient_id || 'user_patient_alpha'}
                          </span>
                        </div>
                      </div>

                      <div className="audit-timeline-step">
                        <div className="step-point"></div>
                        <div className="step-body">
                          <strong className="step-title">{t.auditAutoRanges}</strong>
                          <span className="step-meta">
                            {formattedDate} · user_clinician_alpha
                          </span>
                        </div>
                      </div>

                      {(exam.status === 'confirmed_by_patient' || exam.status === 'clinically_validated') && (
                        <div className="audit-timeline-step">
                          <div className="step-point"></div>
                          <div className="step-body">
                            <strong className="step-title">{t.auditReceiptConfirmed}</strong>
                            <span className="step-meta">
                              {exam.confirmed_at || formattedDate} · {exam.confirmed_by || 'user_clinician_alpha'}
                            </span>
                          </div>
                        </div>
                      )}

                      {exam.status === 'clinically_validated' && (
                        <div className="audit-timeline-step">
                          <div className="step-point validated"></div>
                          <div className="step-body">
                            <strong className="step-title">{t.auditDocValidated}</strong>
                            <span className="step-meta">
                              {exam.validated_at || formattedDate} · {exam.validated_by || 'user_clinician_alpha'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* KPI Cards Grid (Image 4) */}
      <section className="clinician-kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">{t.statVisibleExams}</span>
          <span className="kpi-value">{totalVisible}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">{t.statAwaitingPatient}</span>
          <span className="kpi-value highlight-zero">{countAwaiting}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">{t.statConfirmedByPatient}</span>
          <span className="kpi-value highlight-zero">{countConfirmed}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">{t.statClinicallyValidated}</span>
          <span className="kpi-value highlight-cyan">{countValidated}</span>
        </div>
      </section>

      {/* Section: Historial de exámenes (Images 4 & 5) */}
      <section className="clinician-card exam-history-card">
        <h2 className="clinician-card-title">{t.examHistorySectionTitle}</h2>
        <p className="clinician-card-desc">{t.savedInDb}</p>

        <div className="history-search-block">
          <label className="search-label" htmlFor="clinician-search-exams">
            {t.searchExamsLabel}
          </label>
          <input
            id="clinician-search-exams"
            type="text"
            className="search-input"
            placeholder={t.searchExamsPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Chips */}
        <div className="history-filter-chips">
          <button
            className={`filter-chip ${historyFilter === 'all' ? 'active' : ''}`}
            onClick={() => setHistoryFilter('all')}
          >
            {t.filterAll} ({exams.length})
          </button>
          <button
            className={`filter-chip ${historyFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setHistoryFilter('pending')}
          >
            {t.filterPending} ({countAwaiting})
          </button>
          <button
            className={`filter-chip ${historyFilter === 'confirmed' ? 'active' : ''}`}
            onClick={() => setHistoryFilter('confirmed')}
          >
            {t.statConfirmedByPatient} ({countConfirmed})
          </button>
          <button
            className={`filter-chip ${historyFilter === 'validated' ? 'active' : ''}`}
            onClick={() => setHistoryFilter('validated')}
          >
            {t.statClinicallyValidated} ({countValidated})
          </button>
        </div>

        {/* Results List */}
        <div className="history-results-list">
          {filteredHistory.length === 0 ? (
            <p className="no-results-hint">{t.selectExamPrompt}</p>
          ) : (
            filteredHistory.map((item) => (
              <div key={item._id} className="history-row-item">
                <div className="history-row-info">
                  <strong>{item.document_name || item.clinical_test_id}</strong>
                  <span className="history-row-sub">
                    {new Date(item.created_at).toLocaleDateString()} · Paciente: {item.patient_id}
                  </span>
                </div>
                <div className="history-row-status">
                  {getClinicianStatusBadge(item)}
                  <button
                    className="btn-history-review"
                    onClick={() => handleOpenReview(item)}
                  >
                    {t.btnReviewExam}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Range Review & Validation Split-Screen Modal */}
      {reviewingExam && (
        <div className="modal-backdrop review-modal-backdrop" onClick={handleCloseReview}>
          <div
            className="modal-content review-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <div>
                <h4>{t.modalReviewTitle}</h4>
                <span className="review-modal-filename">
                  {reviewingExam.document_name || reviewingExam.clinical_test_id}
                </span>
              </div>
              <button className="btn-close" onClick={handleCloseReview} aria-label="Close">
                ✕
              </button>
            </div>

            {/* Split Screen Body */}
            <div className="review-modal-split-body">
              {/* Left Column: Original Document Viewer */}
              <div className="review-pdf-column">
                <div className="column-header">
                  <h5>{t.documentPreview}</h5>
                </div>
                <PdfViewer
                  dataUrl={reviewingExam.document_data || '/evaluacion-kinesiologica-FICTICIA.pdf'}
                  fileName={reviewingExam.document_name}
                />
              </div>

              {/* Right Column: Values & Clinical Decision */}
              <div className="review-actions-column">
                <div className="column-header">
                  <h5>{t.biomarkersTitle}</h5>
                </div>

                {/* Measurements Table */}
                <div className="measurements-table-wrapper">
                  <table className="measurements-table">
                    <thead>
                      <tr>
                        <th>Parámetro</th>
                        <th>Valor</th>
                        <th>Referencia</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reviewingExam.measurements && reviewingExam.measurements.length > 0
                        ? reviewingExam.measurements
                        : reviewingExam.proposal.map((p) => ({
                            name: p.name,
                            value: p.value,
                            unit: p.unit,
                            reference: p.reference_low ? `${p.reference_low} - ${p.reference_high} ${p.unit}` : null,
                            comparison: 'within' as const,
                            page: 1,
                            source: `${p.name}: ${p.value} ${p.unit}`,
                          }))
                      ).map((m: Measurement, idx: number) => {
                        let compBadge = <span className="comp-badge within">{t.comparisonWithin}</span>;
                        if (m.comparison === 'below') {
                          compBadge = <span className="comp-badge below">{t.comparisonBelow}</span>;
                        } else if (m.comparison === 'above') {
                          compBadge = <span className="comp-badge above">{t.comparisonAbove}</span>;
                        } else if (m.comparison === 'unit_mismatch') {
                          compBadge = <span className="comp-badge mismatch">{t.comparisonUnitMismatch}</span>;
                        }

                        return (
                          <tr key={idx}>
                            <td>
                              <strong>{m.name}</strong>
                              {m.source && <small className="source-note">{m.source}</small>}
                            </td>
                            <td>
                              <span className="value-chip">
                                {m.value} {m.unit}
                              </span>
                            </td>
                            <td>{m.reference || '—'}</td>
                            <td>{compBadge}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Patient Identity Check Status */}
                <div className="identity-check-status-box">
                  <span className="check-icon">
                    {reviewingExam.identity_confirmed ? '✅' : 'ℹ️'}
                  </span>
                  <span>
                    {reviewingExam.identity_confirmed
                      ? 'Cotejo de identidad confirmado por el paciente.'
                      : 'Pendiente de cotejo de identidad por el paciente.'}
                  </span>
                </div>

                {/* Clinician Decision Section */}
                <div className="clinician-decision-box">
                  <label className="decision-label" htmlFor="clinician-notes">
                    {t.clinicianPrompt}
                  </label>
                  <textarea
                    id="clinician-notes"
                    className="decision-notes-textarea"
                    rows={3}
                    placeholder={t.clinicianNotesPlaceholder}
                    value={reviewReason}
                    onChange={(e) => setReviewReason(e.target.value)}
                  />

                  {actionFeedback && (
                    <div className="decision-feedback-banner">{actionFeedback}</div>
                  )}

                  <div className="decision-action-buttons">
                    <button
                      className="btn-action-validate"
                      onClick={() => handleAction('validate')}
                      disabled={isSubmitting}
                    >
                      {t.btnValidate}
                    </button>
                    <button
                      className="btn-action-error"
                      onClick={() => handleAction('error')}
                      disabled={isSubmitting}
                    >
                      {t.btnMarkError}
                    </button>
                    <button
                      className="btn-action-reject"
                      onClick={() => handleAction('reject')}
                      disabled={isSubmitting}
                    >
                      {t.btnReject}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
