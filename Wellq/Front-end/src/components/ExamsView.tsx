import React, { useState } from 'react';
import type { Language } from '../locales/translations';
import { translations } from '../locales/translations';
import type { Exam } from '../types';
import { PdfViewer } from './PdfViewer';

interface ExamsViewProps {
  exams: Exam[];
  lang: Language;
  role: 'patient' | 'clinician';
  onOpenUpload: () => void;
  onDownloadDemoPdf: () => void;
  onConfirmExam: (examId: string, reason: string) => Promise<void>;
  onValidateExam: (examId: string, decision: 'validate' | 'reject' | 'error', reason: string) => Promise<void>;
  selectedExamId?: string;
  onSelectExam?: (exam: Exam) => void;
}

export const ExamsView: React.FC<ExamsViewProps> = ({
  exams,
  lang,
  role,
  onOpenUpload,
  onDownloadDemoPdf,
  onConfirmExam,
  onValidateExam,
}) => {
  const t = translations[lang];

  // Accordion state: set of expanded exam IDs
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    // Expand the first exam by default if available
    ...(exams.length > 0 ? { [exams[0]._id]: true } : {}),
  });

  // Filter state
  const [filter, setFilter] = useState<'all' | 'listo' | 'pendiente' | 'no_realizado'>('all');

  // Action form state per exam
  const [confirmChecks, setConfirmChecks] = useState<Record<string, boolean>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getStatusCategory = (exam: Exam): 'listo' | 'pendiente' | 'no_realizado' => {
    if (exam.status_category) return exam.status_category;
    if (exam.status === 'no_realizado') return 'no_realizado';
    if (exam.status === 'pendiente') return 'pendiente';
    return 'listo';
  };

  const filteredExams = exams.filter((exam) => {
    const category = getStatusCategory(exam);
    if (filter === 'all') return true;
    return category === filter;
  });

  return (
    <div className="exams-view-container">
      {/* Top Section Header & Actions */}
      <div className="exams-header-section">
        <div className="header-titles">
          <h2>{t.examsTitle}</h2>
          <p className="header-subtitle">{t.examsSubtitle}</p>
        </div>

        <div className="header-action-buttons">
          <button
            className="btn-secondary"
            onClick={onDownloadDemoPdf}
            title={t.downloadDemo}
          >
            {t.downloadDemo}
          </button>
          <button
            className="btn-primary"
            onClick={onOpenUpload}
          >
            {t.uploadButton}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="exams-filter-bar">
        <button
          className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          {t.filterAll} ({exams.length})
        </button>
        <button
          className={`filter-chip ready ${filter === 'listo' ? 'active' : ''}`}
          onClick={() => setFilter('listo')}
        >
          🟢 {t.filterReady} ({exams.filter((e) => getStatusCategory(e) === 'listo').length})
        </button>
        <button
          className={`filter-chip pending ${filter === 'pendiente' ? 'active' : ''}`}
          onClick={() => setFilter('pendiente')}
        >
          🟡 {t.filterPending} ({exams.filter((e) => getStatusCategory(e) === 'pendiente').length})
        </button>
        <button
          className={`filter-chip not-performed ${filter === 'no_realizado' ? 'active' : ''}`}
          onClick={() => setFilter('no_realizado')}
        >
          ⚪ {t.filterNotPerformed} ({exams.filter((e) => getStatusCategory(e) === 'no_realizado').length})
        </button>
      </div>

      {/* Accordion Table Container */}
      <div className="exams-table-card">
        {/* Table Header */}
        <div className="exams-table-header">
          <div className="col-date">{t.colDate}</div>
          <div className="col-name">{t.colExamName}</div>
          <div className="col-status">{t.colStatus}</div>
        </div>

        {/* Table Body / Rows */}
        {filteredExams.length === 0 ? (
          <div className="empty-exams-state">
            <p>No exams match the selected filter.</p>
          </div>
        ) : (
          <div className="exams-table-rows">
            {filteredExams.map((exam) => {
              const isExpanded = Boolean(expandedIds[exam._id]);
              const category = getStatusCategory(exam);
              const formattedDate = new Date(exam.created_at).toLocaleDateString(
                lang === 'en' ? 'en-GB' : 'es-CL',
                { day: '2-digit', month: '2-digit', year: 'numeric' }
              );

              return (
                <div
                  key={exam._id}
                  className={`exam-accordion-row ${isExpanded ? 'expanded' : ''} cat-${category}`}
                >
                  {/* Clickable Row Header (3 Columns: Date, Name, Status) */}
                  <div
                    className="row-summary"
                    onClick={() => toggleExpand(exam._id)}
                    role="button"
                    tabIndex={0}
                  >
                    {/* Column 1: Date */}
                    <div className="col-date">
                      <span className="date-badge">{formattedDate}</span>
                    </div>

                    {/* Column 2: Exam Name */}
                    <div className="col-name">
                      <strong className="exam-title-text">
                        {exam.document_name || exam.clinical_test_id}
                      </strong>
                      <small className="exam-meta-sub">
                        ID: {exam.clinical_test_id} · Rev. {exam.revision}
                      </small>
                    </div>

                    {/* Column 3: Status Badge */}
                    <div className="col-status">
                      <span className={`status-pill pill-${category}`}>
                        {category === 'listo' && `🟢 ${t.statusReady}`}
                        {category === 'pendiente' && `🟡 ${t.statusPending}`}
                        {category === 'no_realizado' && `⚪ ${t.statusNotPerformed}`}
                      </span>
                      <span className={`accordion-caret ${isExpanded ? 'open' : ''}`}>▼</span>
                    </div>
                  </div>

                  {/* Expanded Content Area */}
                  {isExpanded && (
                    <div className="row-expanded-content">
                      {/* CASE 1: NO REALIZADO */}
                      {category === 'no_realizado' && (
                        <div className="expanded-not-performed">
                          <div className="notice-banner info">
                            <span className="notice-icon">🗓️</span>
                            <div>
                              <strong>{t.notPerformedNotice}</strong>
                              <p>
                                <strong>Scheduled appointment:</strong> {exam.scheduled_date || 'Tuesday 28 October 2026, 11:00 AM'}
                              </p>
                              <p>
                                <strong>{t.locationNotice}</strong> London Central Health Hub (14 Harley Street, London W1G 9PQ).
                              </p>
                            </div>
                          </div>

                          <div className="prep-guidelines-box">
                            <h5>{t.prepNotes}</h5>
                            <ul>
                              <li>{exam.preparation_notes || 'Fasting for 8 to 12 hours is required before sample collection. Water is permitted.'}</li>
                              <li>Wear loose and comfortable clothing for ease of assessment.</li>
                              <li>Please bring your NHS card or photo ID to the reception desk.</li>
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* CASE 2: PENDIENTE (Shows estimated time remaining) */}
                      {category === 'pendiente' && (
                        <div className="expanded-pending">
                          <div className="notice-banner warning">
                            <span className="notice-icon">⏳</span>
                            <div className="pending-text-block">
                              <div className="time-remaining-row">
                                <span className="time-label">{t.estimatedTimeLabel}</span>
                                <strong className="time-value">
                                  {exam.estimated_time || '~18 hours remaining'}
                                </strong>
                              </div>
                              <p className="pending-desc">{t.labProcessing}</p>
                            </div>
                          </div>

                          {/* Progress Stages Bar */}
                          <div className="lab-progress-tracker">
                            <div className="step completed">
                              <span className="step-dot">✓</span>
                              <span className="step-label">Sample Collected</span>
                            </div>
                            <div className="step-line active"></div>
                            <div className="step current">
                              <span className="step-dot">⚙</span>
                              <span className="step-label">Lab Analysis</span>
                            </div>
                            <div className="step-line"></div>
                            <div className="step pending">
                              <span className="step-dot">○</span>
                              <span className="step-label">Validation</span>
                            </div>
                          </div>

                          <small className="pending-footer-note">
                            Estimated delivery: {new Date(Date.now() + 18 * 3600 * 1000).toLocaleString(lang === 'en' ? 'en-GB' : 'es-CL')}.
                            You will receive a notification once the report is ready.
                          </small>
                        </div>
                      )}

                      {/* CASE 3: LISTO (Document preview, ranges, download, confirmation) */}
                      {category === 'listo' && (
                        <div className="expanded-ready-details">
                          {/* Top Controls: Download Original & Identity Check */}
                          <div className="ready-top-actions">
                            <div className="identity-status-tag">
                              {exam.identity_match === 'match'
                                ? '✅ Identity Verified: Matches Patient Record'
                                : '⚠️ Manual Cross-Check Required'}
                            </div>

                            {exam.document_data && (
                              <a
                                href={exam.document_data}
                                download={exam.document_name || 'medical-exam.pdf'}
                                className="btn-download-original"
                              >
                                {t.downloadOriginal}
                              </a>
                            )}
                          </div>

                          {/* Split/Two-column content: Left Document Preview, Right Range Review */}
                          <div className="ready-split-columns">
                            {/* Left: Document Preview */}
                            <div className="preview-subcolumn">
                              <h5>{t.documentPreview}</h5>
                              <div className="preview-container-box">
                                {exam.document_data ? (
                                  exam.document_type === 'application/pdf' || exam.document_name?.endsWith('.pdf') ? (
                                    <PdfViewer
                                      dataUrl={exam.document_data}
                                      fileName={exam.document_name}
                                    />
                                  ) : (
                                    <div className="image-preview-wrapper">
                                      <img
                                        src={exam.document_data}
                                        alt={exam.document_name || 'Medical Exam'}
                                        className="preview-img"
                                      />
                                    </div>
                                  )
                                ) : (
                                  <div className="no-preview-placeholder">
                                    <p>No digital preview available for this legacy entry.</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right: Biomarkers & Range Review */}
                            <div className="ranges-subcolumn">
                              <h5>{t.biomarkersTitle}</h5>

                              <div className="clinical-notice-box">
                                <span>ℹ️</span>
                                <p>{t.clinicalDisclaimer}</p>
                              </div>

                              {/* Measurement Cards List */}
                              <div className="measurements-cards-wrapper">
                                {exam.measurements && exam.measurements.length > 0 ? (
                                  exam.measurements.map((m, idx) => (
                                    <div key={idx} className={`measurement-item-card comp-${m.comparison}`}>
                                      <div className="m-card-top">
                                        <span className="m-title">{m.name}</span>
                                        <span className={`comp-tag tag-${m.comparison}`}>
                                          {m.comparison === 'within' && `✅ ${t.comparisonWithin}`}
                                          {m.comparison === 'below' && `⚠️ ${t.comparisonBelow}`}
                                          {m.comparison === 'above' && `⚠️ ${t.comparisonAbove}`}
                                          {m.comparison === 'no_reference' && `ℹ️ ${t.comparisonNoRef}`}
                                          {m.comparison === 'unit_mismatch' && `❌ ${t.comparisonUnitMismatch}`}
                                          {m.comparison === 'invalid_reference' && `❌ ${t.comparisonInvalidRef}`}
                                        </span>
                                      </div>

                                      <div className="m-card-body">
                                        <div className="m-val-group">
                                          <span className="label">Measured value:</span>
                                          <strong className="val">{m.value} {m.unit}</strong>
                                        </div>
                                        <div className="m-val-group">
                                          <span className="label">Reference:</span>
                                          <span className="ref">{m.reference || 'None specified'}</span>
                                        </div>
                                      </div>

                                      {m.source && (
                                        <div className="m-card-source">
                                          <small>{t.sourceText}: <code>{m.source}</code></small>
                                        </div>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <div className="proposal-table-wrapper">
                                    <table className="simple-table">
                                      <thead>
                                        <tr>
                                          <th>Code</th>
                                          <th>Parameter</th>
                                          <th>Value</th>
                                          <th>Unit</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {exam.proposal.map((p) => (
                                          <tr key={p.code}>
                                            <td><code>{p.code}</code></td>
                                            <td>{p.name}</td>
                                            <td><strong>{p.value}</strong></td>
                                            <td>{p.unit}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              {/* Double Check & Validation Form */}
                              <div className="workflow-action-section">
                                {/* Patient double-check confirmation */}
                                {role === 'patient' && exam.status === 'awaiting_confirmation' && (
                                  <div className="action-card patient-action">
                                    <h6>{t.patientConfirmTitle}</h6>
                                    <label className="checkbox-control">
                                      <input
                                        type="checkbox"
                                        checked={Boolean(confirmChecks[exam._id])}
                                        onChange={(e) =>
                                          setConfirmChecks((prev) => ({
                                            ...prev,
                                            [exam._id]: e.target.checked,
                                          }))
                                        }
                                      />
                                      <span>{t.patientIdentityCheck}</span>
                                    </label>

                                    <textarea
                                      className="input-textarea"
                                      rows={2}
                                      placeholder={t.patientNotesPlaceholder}
                                      value={reasons[exam._id] || ''}
                                      onChange={(e) =>
                                        setReasons((prev) => ({
                                          ...prev,
                                          [exam._id]: e.target.value,
                                        }))
                                      }
                                    />

                                    <button
                                      className="btn-primary"
                                      disabled={!confirmChecks[exam._id]}
                                      onClick={() => onConfirmExam(exam._id, reasons[exam._id] || '')}
                                    >
                                      {t.btnConfirmPatient}
                                    </button>
                                  </div>
                                )}

                                {/* Clinician validation controls */}
                                {role === 'clinician' && exam.status === 'confirmed_by_patient' && (
                                  <div className="action-card clinician-action">
                                    <h6>{t.clinicianValidateTitle}</h6>
                                    <p className="sub-prompt">{t.clinicianPrompt}</p>

                                    <textarea
                                      className="input-textarea"
                                      rows={2}
                                      placeholder={t.clinicianNotesPlaceholder}
                                      value={reasons[exam._id] || ''}
                                      onChange={(e) =>
                                        setReasons((prev) => ({
                                          ...prev,
                                          [exam._id]: e.target.value,
                                        }))
                                      }
                                    />

                                    <div className="btn-cluster">
                                      <button
                                        className="btn-validate"
                                        onClick={() => onValidateExam(exam._id, 'validate', reasons[exam._id] || '')}
                                      >
                                        {t.btnValidate}
                                      </button>
                                      <button
                                        className="btn-warn"
                                        onClick={() => onValidateExam(exam._id, 'error', reasons[exam._id] || '')}
                                      >
                                        {t.btnMarkError}
                                      </button>
                                      <button
                                        className="btn-reject"
                                        onClick={() => onValidateExam(exam._id, 'reject', reasons[exam._id] || '')}
                                      >
                                        {t.btnReject}
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Validated Certificate Card */}
                                {exam.status === 'clinically_validated' && (
                                  <div className="certified-result-card">
                                    <span className="cert-icon">🔒</span>
                                    <div>
                                      <strong>{t.validatedBadge}</strong>
                                      <p>{t.validatedDescription}</p>
                                      {exam.validated_by && (
                                        <small>Validated by: {exam.validated_by} on {exam.validated_at ? new Date(exam.validated_at).toLocaleString() : ''}</small>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Error / Discrepancy Card */}
                                {exam.status === 'error' && (
                                  <div className="error-result-card">
                                    <span className="cert-icon">⚠️</span>
                                    <div>
                                      <strong>{t.errorBadge}</strong>
                                      <p>{exam.review_reason || 'Requires resubmission or lab clarification.'}</p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Audit trail details */}
                              {exam.audit_trail && exam.audit_trail.length > 0 && (
                                <details className="audit-accordion">
                                  <summary>{t.auditHistory} ({exam.audit_trail.length})</summary>
                                  <ol className="audit-timeline">
                                    {exam.audit_trail.map((entry, i) => (
                                      <li key={i} className="timeline-node">
                                        <div className="node-head">
                                          <strong>{entry.action.replace(/_/g, ' ').toUpperCase()}</strong>
                                          <small>{new Date(entry.timestamp).toLocaleString()}</small>
                                        </div>
                                        <span className="node-actor">{entry.role}: {entry.actor}</span>
                                        {entry.details && <p className="node-desc">{entry.details}</p>}
                                        {entry.reason && <p className="node-reason">Observation: {entry.reason}</p>}
                                      </li>
                                    ))}
                                  </ol>
                                </details>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
