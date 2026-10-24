import { useState } from 'react';
import type { Appointment } from '../../types/portal';

interface AppointmentsTabProps {
  appointments: Appointment[];
  onReschedule: (id: string, newDate: string, newTime: string) => void;
  onCancel: (id: string) => void;
  onGoToBooking: () => void;
}

export function AppointmentsTab({
  appointments,
  onReschedule,
  onCancel,
  onGoToBooking,
}: AppointmentsTabProps) {
  const [reschedulingAppt, setReschedulingAppt] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('10:30');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleSaveReschedule = () => {
    if (reschedulingAppt && newDate && newTime) {
      onReschedule(reschedulingAppt.id, newDate, newTime);
      setReschedulingAppt(null);
      setNewDate('');
    }
  };

  const handleConfirmCancel = () => {
    if (cancellingId) {
      onCancel(cancellingId);
      setCancellingId(null);
    }
  };

  const activeAppointments = appointments.filter((a) => a.status !== 'cancelada');

  return (
    <div className="tab-container appointments-tab">
      <div className="tab-title-row">
        <div>
          <h3>Mis Citas Médicas Agendadas</h3>
          <p className="tab-subtitle">Revisa tus próximas consultas, reprograma la fecha o cancela si no puedes asistir.</p>
        </div>
        <button className="btn-primary" onClick={onGoToBooking}>
          + Agendar Nueva Cita
        </button>
      </div>

      {activeAppointments.length === 0 ? (
        <div className="empty-state-box">
          <div className="empty-icon">📅</div>
          <h4>No tienes citas médicas programadas</h4>
          <p>Puedes reservar una hora de consulta con nuestros especialistas en pocos clics.</p>
          <button className="btn-secondary" onClick={onGoToBooking}>
            Agendar Consulta Ahora
          </button>
        </div>
      ) : (
        <div className="appointments-list">
          {activeAppointments.map((appt) => (
            <div key={appt.id} className="appointment-card">
              <div className="appt-date-badge">
                <span className="appt-month">
                  {new Date(appt.date + 'T00:00:00').toLocaleDateString('es-CL', { month: 'short' }).toUpperCase()}
                </span>
                <span className="appt-day">
                  {new Date(appt.date + 'T00:00:00').getDate()}
                </span>
                <span className="appt-time">{appt.time} hrs</span>
              </div>

              <div className="appt-info">
                <div className="appt-header">
                  <h4 className="appt-specialty">{appt.specialty}</h4>
                  <span className={`status-pill status-${appt.status}`}>
                    {appt.status === 'confirmada' ? 'Confirmada' : 'Pendiente'}
                  </span>
                </div>
                <p className="appt-doctor">👨‍⚕️ <strong>{appt.doctor}</strong></p>
                <p className="appt-location">📍 {appt.location}</p>
              </div>

              <div className="appt-actions">
                <button
                  className="btn-action btn-reschedule"
                  onClick={() => {
                    setReschedulingAppt(appt);
                    setNewDate(appt.date);
                    setNewTime(appt.time);
                  }}
                  title="Cambiar fecha u hora de la cita"
                >
                  🔄 Reprogramar
                </button>

                <button
                  className="btn-action btn-cancel"
                  onClick={() => setCancellingId(appt.id)}
                  title="Cancelar cita agendada"
                >
                  ✕ Cancelar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingAppt && (
        <div className="modal-backdrop" onClick={() => setReschedulingAppt(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>🔄 Reprogramar Cita</h4>
              <button className="btn-close" onClick={() => setReschedulingAppt(null)}>✕</button>
            </div>
            <p className="modal-body-text">
              Modificando cita de <strong>{reschedulingAppt.specialty}</strong> con <strong>{reschedulingAppt.doctor}</strong>.
            </p>
            <div className="form-group">
              <label>Nueva Fecha:</label>
              <input
                type="date"
                className="input-control"
                value={newDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Nuevo Horario Disponible:</label>
              <select
                className="input-control"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              >
                <option value="09:00">09:00 hrs</option>
                <option value="10:30">10:30 hrs</option>
                <option value="11:45">11:45 hrs</option>
                <option value="14:15">14:15 hrs</option>
                <option value="16:00">16:00 hrs</option>
                <option value="17:30">17:30 hrs</option>
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn-text" onClick={() => setReschedulingAppt(null)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSaveReschedule}>Guardar Cambio</button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancellingId && (
        <div className="modal-backdrop" onClick={() => setCancellingId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>⚠️ ¿Cancelar esta Cita?</h4>
              <button className="btn-close" onClick={() => setCancellingId(null)}>✕</button>
            </div>
            <p className="modal-body-text">
              ¿Estás seguro de que deseas cancelar tu cita médica? Si la cancelas, deberás volver a agendar para reservar un nuevo cupo.
            </p>
            <div className="modal-footer">
              <button className="btn-text" onClick={() => setCancellingId(null)}>Volver</button>
              <button className="btn-danger" onClick={handleConfirmCancel}>Sí, Cancelar Cita</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
