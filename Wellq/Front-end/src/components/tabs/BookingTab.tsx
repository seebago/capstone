import { useState } from 'react';
import type { Appointment, PortalExam } from '../../types/portal';

interface BookingTabProps {
  onAddAppointment: (appointment: Appointment) => void;
  onAddExam: (exam: PortalExam) => void;
  onNavigateToTab: (tab: 'cita' | 'examenes') => void;
}

export function BookingTab({
  onAddAppointment,
  onAddExam,
  onNavigateToTab,
}: BookingTabProps) {
  const [bookingMode, setBookingMode] = useState<'cita' | 'examen'>('cita');

  // Appointment Form State
  const [specialty, setSpecialty] = useState('Kinesiología y Rehabilitación');
  const [doctor, setDoctor] = useState('Dra. Camila Soto');
  const [location, setLocation] = useState('Clínica Alpha - Providencia');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState('10:30');

  // Exam Booking Form State
  const [examType, setExamType] = useState('Hemograma y Perfil Bioquímico');
  const [examLocation, setExamLocation] = useState('Laboratorio Central - Clínica Alpha');
  const [examDate, setExamDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [selectedExamTime, setSelectedExamTime] = useState('08:30');

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const availableHours = ['08:30', '09:15', '10:30', '11:45', '14:00', '15:30', '16:45', '17:30'];

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const newAppt: Appointment = {
      id: 'app-' + Date.now(),
      specialty,
      doctor,
      location,
      date,
      time: selectedTime,
      status: 'confirmada',
    };
    onAddAppointment(newAppt);
    setFeedbackMessage(`✅ ¡Cita con ${doctor} agendada con éxito para el ${date} a las ${selectedTime} hrs!`);
    setTimeout(() => {
      onNavigateToTab('cita');
    }, 1800);
  };

  const handleBookExam = (e: React.FormEvent) => {
    e.preventDefault();
    const newExam: PortalExam = {
      id: 'exam-' + Date.now(),
      name: examType,
      laboratory: examLocation,
      dateRequested: examDate,
      status: 'no_realizado',
    };
    onAddExam(newExam);
    setFeedbackMessage(`✅ ¡Hora para examen "${examType}" agendada exitosamente para el ${examDate} a las ${selectedExamTime} hrs!`);
    setTimeout(() => {
      onNavigateToTab('examenes');
    }, 1800);
  };

  return (
    <div className="tab-container booking-tab">
      <div className="tab-title-row">
        <div>
          <h3>Agendamiento de Horas Médicas</h3>
          <p className="tab-subtitle">Reserva tus consultas médicas o agenda una hora para toma de exámenes y laboratorio.</p>
        </div>
      </div>

      {/* Mode Selector (Cita Médica vs Hora de Examen) */}
      <div className="booking-mode-selector">
        <button
          className={`mode-btn ${bookingMode === 'cita' ? 'active' : ''}`}
          onClick={() => setBookingMode('cita')}
        >
          🩺 Agendar Cita Médica
        </button>
        <button
          className={`mode-btn ${bookingMode === 'examen' ? 'active' : ''}`}
          onClick={() => setBookingMode('examen')}
        >
          🔬 Agendar Hora de Exámenes
        </button>
      </div>

      {feedbackMessage && (
        <div className="booking-alert-success">
          <p>{feedbackMessage}</p>
        </div>
      )}

      {/* Form: Cita Médica */}
      {bookingMode === 'cita' && (
        <form className="booking-card-form" onSubmit={handleBookAppointment}>
          <div className="form-grid">
            <div className="form-group">
              <label>Especialidad Médica:</label>
              <select
                className="input-control"
                value={specialty}
                onChange={(e) => {
                  setSpecialty(e.target.value);
                  if (e.target.value.includes('Kinesio')) setDoctor('Dra. Camila Soto');
                  else if (e.target.value.includes('General')) setDoctor('Dr. Andrés Silva');
                  else if (e.target.value.includes('Cardio')) setDoctor('Dr. Roberto Morales');
                  else setDoctor('Dra. Valentina Castro');
                }}
              >
                <option value="Kinesiología y Rehabilitación">Kinesiología y Rehabilitación</option>
                <option value="Medicina General">Medicina General</option>
                <option value="Cardiología">Cardiología</option>
                <option value="Traumatología y Ortopedia">Traumatología y Ortopedia</option>
              </select>
            </div>

            <div className="form-group">
              <label>Profesional Tratante:</label>
              <select
                className="input-control"
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
              >
                {specialty.includes('Kinesio') ? (
                  <>
                    <option value="Dra. Camila Soto">Dra. Camila Soto (Kinesióloga)</option>
                    <option value="Klgo. Rodrigo Araya">Klgo. Rodrigo Araya</option>
                  </>
                ) : specialty.includes('Cardio') ? (
                  <>
                    <option value="Dr. Roberto Morales">Dr. Roberto Morales (Cardiólogo)</option>
                  </>
                ) : (
                  <>
                    <option value="Dr. Andrés Silva">Dr. Andrés Silva (Médico General)</option>
                    <option value="Dra. Valentina Castro">Dra. Valentina Castro (Traumatóloga)</option>
                  </>
                )}
              </select>
            </div>

            <div className="form-group">
              <label>Sucursal / Centro Médico:</label>
              <select
                className="input-control"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="Clínica Alpha - Providencia">Clínica Alpha - Av. Providencia 1240</option>
                <option value="Clínica Beta - Las Condes">Clínica Beta - Av. Apoquindo 4500</option>
                <option value="Centro Médico Maipú">Centro Médico Maipú - Pajaritos 2200</option>
              </select>
            </div>

            <div className="form-group">
              <label>Fecha de la Cita:</label>
              <input
                type="date"
                className="input-control"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="hours-section">
            <label className="section-label">Horas disponibles para el {date}:</label>
            <div className="hours-grid">
              {availableHours.map((h) => (
                <button
                  type="button"
                  key={h}
                  className={`hour-chip ${selectedTime === h ? 'selected' : ''}`}
                  onClick={() => setSelectedTime(h)}
                >
                  {h} hrs
                </button>
              ))}
            </div>
          </div>

          <div className="booking-summary-box">
            <span className="summary-icon">ℹ️</span>
            <p>
              Estás reservando una cita de <strong>{specialty}</strong> con <strong>{doctor}</strong> en <strong>{location}</strong> el día <strong>{date}</strong> a las <strong>{selectedTime} hrs</strong>.
            </p>
          </div>

          <div className="form-actions-row">
            <button type="submit" className="btn-primary btn-lg">
              Confirmar Reserva de Cita Médica
            </button>
          </div>
        </form>
      )}

      {/* Form: Exámenes */}
      {bookingMode === 'examen' && (
        <form className="booking-card-form" onSubmit={handleBookExam}>
          <div className="form-grid">
            <div className="form-group">
              <label>Tipo de Examen Requerido:</label>
              <select
                className="input-control"
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
              >
                <option value="Hemograma y Perfil Bioquímico">Hemograma Completo y Perfil Bioquímico</option>
                <option value="Evaluación Kinesiológica Funcional">Evaluación Kinesiológica Funcional</option>
                <option value="Resonancia Magnética Articular">Resonancia Magnética Articular</option>
                <option value="Electrocardiograma de Reposo">Electrocardiograma de Reposo</option>
                <option value="Radiografía de Tórax">Radiografía de Tórax</option>
              </select>
            </div>

            <div className="form-group">
              <label>Laboratorio o Centro de Toma de Muestras:</label>
              <select
                className="input-control"
                value={examLocation}
                onChange={(e) => setExamLocation(e.target.value)}
              >
                <option value="Laboratorio Central - Clínica Alpha">Laboratorio Central - Clínica Alpha (Providencia)</option>
                <option value="Unidad de Imagenología - Clínica Beta">Unidad de Imagenología - Clínica Beta (Las Condes)</option>
                <option value="Toma de Muestras Maipú">Toma de Muestras Maipú</option>
              </select>
            </div>

            <div className="form-group">
              <label>Fecha sugerida para el Examen:</label>
              <input
                type="date"
                className="input-control"
                value={examDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setExamDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Horario preferido:</label>
              <select
                className="input-control"
                value={selectedExamTime}
                onChange={(e) => setSelectedExamTime(e.target.value)}
              >
                <option value="07:30">07:30 hrs (Ideal para ayuno)</option>
                <option value="08:30">08:30 hrs</option>
                <option value="09:15">09:15 hrs</option>
                <option value="10:30">10:30 hrs</option>
                <option value="11:45">11:45 hrs</option>
                <option value="15:00">15:00 hrs</option>
              </select>
            </div>
          </div>

          <div className="booking-summary-box exam-prep-box">
            <span className="summary-icon">🧪</span>
            <div>
              <strong>Indicaciones de preparación:</strong>
              <p>
                Para exámenes de sangre y perfil bioquímico se recomienda presentarse con <strong>8 a 12 horas de ayuno</strong>. Trae tu cédula de identidad y orden médica si dispones de ella.
              </p>
            </div>
          </div>

          <div className="form-actions-row">
            <button type="submit" className="btn-primary btn-lg">
              Confirmar Hora para Examen
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
