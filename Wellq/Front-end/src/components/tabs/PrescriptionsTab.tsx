import { useState } from 'react';
import type { Prescription } from '../../types/portal';

interface PrescriptionsTabProps {
  prescriptions: Prescription[];
}

export function PrescriptionsTab({ prescriptions }: PrescriptionsTabProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    prescriptions[0]?.id || null
  );

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleDownloadPrescription = (presc: Prescription) => {
    // Generate simple printable or download trigger
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${presc.title}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 2.5rem; color: #1e293b; max-width: 700px; margin: 0 auto; border: 2px solid #0284c7; border-radius: 8px; }
            .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; }
            .med-item { background: #f8fafc; border-left: 4px solid #0284c7; padding: 0.75rem 1rem; margin-bottom: 0.75rem; border-radius: 4px; }
            .footer { margin-top: 3rem; border-top: 1px dashed #cbd5e1; padding-top: 1rem; font-size: 0.85rem; color: #64748b; text-align: center; }
            .signature { margin-top: 2rem; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h2 style="margin:0; color:#0284c7;">WellMedical · Red de Salud</h2>
              <p style="margin:4px 0; color:#64748b;">Receta Médica Electrónica Oficial</p>
            </div>
            <div>
              <strong>Fecha: ${presc.date}</strong><br/>
              <small>Folio: RM-${presc.id.toUpperCase()}</small>
            </div>
          </div>
          <h3>${presc.title}</h3>
          <p><strong>Médico Tratante:</strong> ${presc.doctorName} · <em>${presc.specialty}</em></p>
          <hr style="border:none; border-top:1px solid #e2e8f0; margin:1rem 0;" />
          <h4>Medicamentos Prescritos (Rp.):</h4>
          ${presc.medications.map(m => `
            <div class="med-item">
              <strong style="font-size:1.05rem;">${m.name}</strong><br/>
              <span>Dosis: ${m.dosage}</span> · <span>Frecuencia: ${m.frequency}</span><br/>
              <small style="color:#64748b;">Duración del tratamiento: ${m.duration}</small>
            </div>
          `).join('')}
          <h4>Indicaciones Generales:</h4>
          <p style="background:#f1f5f9; padding:0.75rem; border-radius:4px;">${presc.indications}</p>
          <div class="signature">
            <p>_____________________________________<br/><strong>${presc.doctorName}</strong><br/><small>Firma Electrónica Avanzada</small></p>
          </div>
          <div class="footer">
            <p>Documento médico válido en farmacias conforme al D.S. N° 466 y Ley N° 20.584.</p>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="tab-container prescriptions-tab">
      <div className="tab-title-row">
        <div>
          <h3>Mis Recetas Médicas Electrónicas</h3>
          <p className="tab-subtitle">
            Visualiza las recetas extendidas por tus profesionales tratantes, consulta las dosis indicadas y descárgalas en formato PDF.
          </p>
        </div>
      </div>

      {/* Table of Prescriptions as specified by user */}
      <div className="prescriptions-table-wrapper">
        <div className="prescriptions-table-header">
          <div className="col-date">Fecha</div>
          <div className="col-title">Detalle de la Receta / Profesional</div>
          <div className="col-action">Acción</div>
        </div>

        <div className="prescriptions-table-body">
          {prescriptions.map((presc) => {
            const isExpanded = expandedId === presc.id;

            return (
              <div
                key={presc.id}
                className={`prescription-row-container ${isExpanded ? 'expanded' : ''}`}
              >
                {/* Main Row */}
                <div
                  className="prescription-row-main"
                  onClick={() => toggleExpand(presc.id)}
                >
                  {/* Left: Date */}
                  <div className="presc-col-date">
                    <span className="date-badge">📅 {presc.date}</span>
                  </div>

                  {/* Center: Title / Doctor */}
                  <div className="presc-col-title">
                    <strong className="presc-title-text">{presc.title}</strong>
                    <div className="presc-meta-sub">
                      <span>{presc.doctorName}</span> · <span>{presc.specialty}</span>
                    </div>
                  </div>

                  {/* Right: Expand Arrow */}
                  <div className="presc-col-action">
                    <button
                      className={`btn-expand-arrow ${isExpanded ? 'open' : ''}`}
                      aria-label={isExpanded ? 'Ocultar receta' : 'Ver receta completa'}
                      title="Desplegar para previsualizar y descargar"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Collapsible Preview Panel */}
                {isExpanded && (
                  <div className="prescription-expanded-preview">
                    <div className="prescription-card-sheet">
                      <div className="sheet-top">
                        <div>
                          <span className="folio-tag">FOLIO: RM-{presc.id.toUpperCase()}</span>
                          <h4 className="sheet-title">{presc.title}</h4>
                          <p className="sheet-doctor">
                            👨‍⚕️ <strong>{presc.doctorName}</strong> ({presc.specialty})
                          </p>
                        </div>
                        <button
                          className="btn-primary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadPrescription(presc);
                          }}
                          title="Descargar o Imprimir Receta"
                        >
                          ⬇ Descargar Receta PDF
                        </button>
                      </div>

                      {/* Medications List */}
                      <div className="medications-block">
                        <h5>Medicamentos Prescritos:</h5>
                        <div className="meds-grid">
                          {presc.medications.map((med, idx) => (
                            <div key={idx} className="medication-card">
                              <strong className="med-name">💊 {med.name}</strong>
                              <p className="med-dosage">
                                <strong>Dosis:</strong> {med.dosage} · <strong>Frecuencia:</strong> {med.frequency}
                              </p>
                              <small className="med-duration">
                                ⏱️ Duración: {med.duration}
                              </small>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Indications */}
                      <div className="indications-block">
                        <h5>Indicaciones Generales y Cuidados:</h5>
                        <p className="indications-text">{presc.indications}</p>
                      </div>

                      <div className="sheet-footer">
                        <span>✅ Receta firmada electrónicamente. Válida en todas las farmacias del país.</span>
                      </div>
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
