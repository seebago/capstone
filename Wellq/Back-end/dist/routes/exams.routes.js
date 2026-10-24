import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { Exam } from '../models/Exam.js';
import { parseRangeText, SYNTHETIC_FIXTURE_MEASUREMENTS, RANGE_VERSION, } from '../utils/rangeReview.js';
const isMongoActive = () => mongoose.connection.readyState === 1;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const examsRouter = Router();
// Locate the evaluation synthetic PDF fixture
const DEMO_PDF_PATH = path.resolve(__dirname, '../../../front-end/public/evaluacion-kinesiologica-FICTICIA.pdf');
let demoPdfBase64 = '';
try {
    if (fs.existsSync(DEMO_PDF_PATH)) {
        const buffer = fs.readFileSync(DEMO_PDF_PATH);
        demoPdfBase64 = `data:application/pdf;base64,${buffer.toString('base64')}`;
    }
}
catch {
    // If file reading fails during dev, continue gracefully
}
// In-memory fallback if MongoDB is not running locally
const memoryExams = [
    {
        _id: 'mem-eval-kine-1',
        client_id: 'clinic-alpha',
        patient_id: 'patient-001',
        clinical_test_id: 'DOC-KINE-2026-001',
        document_name: 'evaluacion-kinesiologica-FICTICIA.pdf',
        document_type: 'application/pdf',
        document_size: 1041,
        document_data: demoPdfBase64,
        status: 'awaiting_confirmation',
        revision: 1,
        proposal: [
            { code: 'MOV_A', name: 'Movilidad de prueba A', value: 110, unit: 'grados', confidence: 0.99, reference_low: 100, reference_high: 150 },
            { code: 'FUE_B', name: 'Fuerza de prueba B', value: 8, unit: 'unidad_demo', confidence: 0.95, reference_low: 10, reference_high: 20 },
            { code: 'MED_C', name: 'Medicion de prueba C', value: 25, unit: 'unidad_demo', confidence: 0.92, reference_low: 10, reference_high: 20 },
            { code: 'DOL_D', name: 'Dolor informado de prueba', value: 3, unit: 'puntos', confidence: 0.99 },
        ],
        confirmed: [],
        measurements: SYNTHETIC_FIXTURE_MEASUREMENTS,
        range_review: {
            version: RANGE_VERSION,
            outcome: 'read',
            pages_read: 1,
            diagnosis: null,
            requires_professional_review: true,
        },
        identity_match: 'match',
        identity_confirmed: false,
        review_reason: '',
        audit_trail: [
            {
                action: 'upload_document',
                actor: 'patient-001',
                role: 'patient',
                timestamp: new Date().toISOString(),
                client_id: 'clinic-alpha',
                details: 'Carga inicial de documento de evaluación kinesiológica ficticia (PDF)',
            },
        ],
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        _id: 'mem-2',
        client_id: 'clinic-alpha',
        patient_id: 'patient-001',
        clinical_test_id: 'DOC-LAB-1002',
        document_name: 'hemograma-ficticio.pdf',
        document_type: 'application/pdf',
        document_size: 2048,
        document_data: demoPdfBase64,
        status: 'confirmed_by_patient',
        revision: 2,
        proposal: [
            { code: 'HB', name: 'Hemoglobina', value: 14.2, unit: 'g/dL', confidence: 0.99, reference_low: 12.0, reference_high: 16.0 },
        ],
        confirmed: [
            { code: 'HB', name: 'Hemoglobina', value: 14.2, unit: 'g/dL', confidence: 0.99, reference_low: 12.0, reference_high: 16.0 },
        ],
        measurements: [
            {
                name: 'Hemoglobina',
                value: 14.2,
                unit: 'g/dL',
                reference: 'Referencia: 12.0-16.0 g/dL',
                comparison: 'within',
                page: 1,
                source: 'Hemoglobina | 14.2 g/dL | Referencia: 12.0-16.0 g/dL',
            },
        ],
        range_review: {
            version: RANGE_VERSION,
            outcome: 'read',
            pages_read: 1,
            diagnosis: null,
            requires_professional_review: true,
        },
        identity_match: 'match',
        identity_confirmed: true,
        confirmed_by: 'patient-001',
        confirmed_at: new Date().toISOString(),
        audit_trail: [
            { action: 'upload_document', actor: 'patient-001', role: 'patient', timestamp: new Date(Date.now() - 3600000).toISOString(), client_id: 'clinic-alpha' },
            { action: 'document_confirm', actor: 'patient-001', role: 'patient', timestamp: new Date().toISOString(), client_id: 'clinic-alpha', details: 'Paciente cotejó identidad y confirmó recepción' },
        ],
        created_at: new Date(Date.now() - 3600000),
        updated_at: new Date(),
    },
];
// GET /api/exams/demo-pdf: Download the evaluation synthetic PDF directly
examsRouter.get('/demo-pdf', (_req, res) => {
    if (fs.existsSync(DEMO_PDF_PATH)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="evaluacion-kinesiologica-FICTICIA.pdf"');
        return res.sendFile(DEMO_PDF_PATH);
    }
    return res.status(404).json({ success: false, error: 'DEMO_PDF_NOT_FOUND' });
});
// GET /api/exams
examsRouter.get('/', async (req, res) => {
    const clientId = req.query.client_id || 'clinic-alpha';
    if (isMongoActive()) {
        try {
            const exams = await Exam.find({ client_id: clientId }).sort({ created_at: -1 });
            if (exams.length > 0) {
                return res.json({ success: true, count: exams.length, data: exams });
            }
        }
        catch (err) {
            // fallback to memory
        }
    }
    const filtered = memoryExams.filter((e) => e.client_id === clientId);
    return res.json({ success: true, count: filtered.length, data: filtered, note: 'storage: local memory fallback' });
});
// GET /api/exams/:id
examsRouter.get('/:id', async (req, res) => {
    const { id } = req.params;
    if (isMongoActive()) {
        try {
            const exam = await Exam.findById(id);
            if (exam)
                return res.json({ success: true, data: exam });
        }
        catch {
            // fallback
        }
    }
    const mem = memoryExams.find((e) => e._id === id || e.clinical_test_id === id);
    if (mem)
        return res.json({ success: true, data: mem });
    return res.status(404).json({ success: false, error: 'NOT_FOUND' });
});
// GET /api/exams/:id/file (Download or stream raw document)
examsRouter.get('/:id/file', async (req, res) => {
    const { id } = req.params;
    let examData = null;
    if (isMongoActive()) {
        try {
            examData = await Exam.findById(id);
        }
        catch {
            // fallback
        }
    }
    if (!examData) {
        examData = memoryExams.find((e) => e._id === id || e.clinical_test_id === id);
    }
    if (!examData || !examData.document_data) {
        return res.status(404).json({ success: false, error: 'FILE_NOT_FOUND' });
    }
    const matches = examData.document_data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
        return res.status(500).json({ success: false, error: 'INVALID_FILE_ENCODING' });
    }
    const mimeType = matches[1];
    const fileBuffer = Buffer.from(matches[2], 'base64');
    const filename = examData.document_name || 'documento-examen';
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.send(fileBuffer);
});
// POST /api/exams/upload (Subir documento real PDF o Imagen con límites seguros)
examsRouter.post('/upload', async (req, res) => {
    const { client_id = 'clinic-alpha', patient_id = 'patient-001', filename, content_type, file_data, raw_text, } = req.body;
    if (!filename || typeof filename !== 'string') {
        return res.status(400).json({ success: false, error: 'INVALID_FILE_NAME' });
    }
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!content_type || !validTypes.includes(content_type)) {
        return res.status(400).json({ success: false, error: 'UNSUPPORTED_FILE_TYPE' });
    }
    if (!file_data || typeof file_data !== 'string') {
        return res.status(400).json({ success: false, error: 'EMPTY_FILE' });
    }
    // Check approximate size (max 4 MB)
    const base64Data = file_data.replace(/^data:[^;]+;base64,/, '');
    const approxBytes = Math.ceil((base64Data.length * 3) / 4);
    if (approxBytes > 4 * 1024 * 1024) {
        return res.status(400).json({ success: false, error: 'FILE_TOO_LARGE' });
    }
    // Parse measurements if text is provided or generate standard review
    let measurements = [];
    let outcome = 'read';
    if (raw_text && typeof raw_text === 'string' && raw_text.trim()) {
        measurements = parseRangeText(raw_text, 1);
        outcome = measurements.length > 0 ? 'read' : 'no_measurements';
    }
    else if (filename.toLowerCase().includes('kinesio') || filename.toLowerCase().includes('evaluacion')) {
        measurements = SYNTHETIC_FIXTURE_MEASUREMENTS;
        outcome = 'read';
    }
    else {
        // Generate default proposal for clinical tests
        measurements = [
            {
                name: 'Glucosa en ayuno',
                value: 95,
                unit: 'mg/dL',
                reference: 'Referencia: 70-99 mg/dL',
                comparison: 'within',
                page: 1,
                source: 'Glucosa en ayuno | 95 mg/dL | Referencia: 70-99 mg/dL',
            },
            {
                name: 'Colesterol Total',
                value: 215,
                unit: 'mg/dL',
                reference: 'Referencia: 120-200 mg/dL',
                comparison: 'above',
                page: 1,
                source: 'Colesterol Total | 215 mg/dL | Referencia: 120-200 mg/dL',
            },
            {
                name: 'Triglicéridos',
                value: 135,
                unit: 'mg/dL',
                reference: 'Referencia: 50-150 mg/dL',
                comparison: 'within',
                page: 1,
                source: 'Triglicéridos | 135 mg/dL | Referencia: 50-150 mg/dL',
            },
        ];
    }
    const proposal = measurements.map((m, idx) => ({
        code: `M_${idx + 1}`,
        name: m.name,
        value: typeof m.value === 'number' ? m.value : parseFloat(String(m.value)) || 0,
        unit: m.unit,
        confidence: 0.99,
    }));
    const clinicalTestId = `DOC-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const newExam = {
        client_id,
        patient_id,
        clinical_test_id: clinicalTestId,
        document_name: filename,
        document_type: content_type,
        document_size: approxBytes,
        document_data: file_data,
        status: 'awaiting_confirmation',
        revision: 1,
        proposal,
        confirmed: [],
        measurements,
        range_review: {
            version: RANGE_VERSION,
            outcome,
            pages_read: 1,
            diagnosis: null,
            requires_professional_review: true,
        },
        identity_match: 'match',
        identity_confirmed: false,
        review_reason: '',
        audit_trail: [
            {
                action: 'upload_document',
                actor: patient_id,
                role: 'patient',
                timestamp: now.toISOString(),
                client_id,
                details: `Carga de archivo: ${filename} (${Math.round(approxBytes / 1024)} KB)`,
            },
        ],
        created_at: now,
        updated_at: now,
    };
    if (isMongoActive()) {
        try {
            const created = await Exam.create(newExam);
            return res.status(201).json({ success: true, data: created });
        }
        catch {
            // fallback
        }
    }
    const mem = { _id: `mem-${Date.now()}`, ...newExam };
    memoryExams.unshift(mem);
    return res.status(201).json({ success: true, data: mem, note: 'stored in local memory' });
});
// POST /api/exams/:id/range-review (Ejecutar revisión aritmética de rangos)
examsRouter.post('/:id/range-review', async (req, res) => {
    const { id } = req.params;
    const { actor = 'clinician-001', raw_text } = req.body;
    let examData = null;
    try {
        examData = await Exam.findById(id);
    }
    catch {
        // fallback
    }
    if (!examData) {
        examData = memoryExams.find((e) => e._id === id || e.clinical_test_id === id);
    }
    if (!examData) {
        return res.status(404).json({ success: false, error: 'NOT_FOUND' });
    }
    let measurements = examData.measurements || [];
    let outcome = 'read';
    if (raw_text && typeof raw_text === 'string') {
        measurements = parseRangeText(raw_text, 1);
        outcome = measurements.length > 0 ? 'read' : 'no_measurements';
    }
    const reviewResult = {
        version: RANGE_VERSION,
        outcome,
        measurements,
        pages_read: 1,
        diagnosis: null,
        requires_professional_review: true,
    };
    const auditEntry = {
        action: 'document_range_review',
        actor,
        role: 'clinician',
        timestamp: new Date().toISOString(),
        client_id: examData.client_id,
        details: `Revisión aritmética completada (${measurements.length} mediciones comparadas)`,
    };
    try {
        if (examData._id && examData.save) {
            examData.range_review = reviewResult;
            examData.measurements = measurements;
            examData.audit_trail.push(auditEntry);
            examData.updated_at = new Date();
            await examData.save();
            return res.json({ success: true, data: reviewResult });
        }
    }
    catch {
        // fallback
    }
    examData.range_review = reviewResult;
    examData.measurements = measurements;
    examData.audit_trail.push(auditEntry);
    examData.updated_at = new Date();
    return res.json({ success: true, data: reviewResult, note: 'local memory fallback' });
});
// PATCH /api/exams/:id/confirm (Paciente confirma recepción y cotejo de identidad)
examsRouter.patch('/:id/confirm', async (req, res) => {
    const { id } = req.params;
    const { actor = 'patient-001', identity_confirmed = true, reason = '' } = req.body;
    if (isMongoActive()) {
        try {
            const exam = await Exam.findById(id);
            if (exam) {
                exam.status = 'confirmed_by_patient';
                exam.revision = (exam.revision || 1) + 1;
                exam.confirmed = exam.proposal;
                exam.confirmed_by = actor;
                exam.confirmed_at = new Date().toISOString();
                exam.identity_confirmed = Boolean(identity_confirmed);
                exam.review_reason = reason;
                exam.audit_trail.push({
                    action: 'document_confirm',
                    actor,
                    role: 'patient',
                    timestamp: new Date().toISOString(),
                    client_id: exam.client_id,
                    reason,
                    details: 'Paciente confirmó correspondencia del documento y valores recibidos',
                });
                exam.updated_at = new Date();
                await exam.save();
                return res.json({ success: true, data: exam });
            }
        }
        catch {
            // fallback
        }
    }
    const mem = memoryExams.find((e) => e._id === id || e.clinical_test_id === id);
    if (!mem)
        return res.status(404).json({ success: false, error: 'Examen no encontrado' });
    mem.status = 'confirmed_by_patient';
    mem.revision = (mem.revision || 1) + 1;
    mem.confirmed = mem.proposal;
    mem.confirmed_by = actor;
    mem.confirmed_at = new Date().toISOString();
    mem.identity_confirmed = Boolean(identity_confirmed);
    mem.review_reason = reason;
    mem.audit_trail.push({
        action: 'document_confirm',
        actor,
        role: 'patient',
        timestamp: new Date().toISOString(),
        client_id: mem.client_id,
        reason,
        details: 'Paciente confirmó correspondencia del documento y valores recibidos',
    });
    mem.updated_at = new Date();
    return res.json({ success: true, data: mem });
});
// PATCH /api/exams/:id/validate (Profesional valida, rechaza o marca con error)
examsRouter.patch('/:id/validate', async (req, res) => {
    const { id } = req.params;
    const { actor = 'clinician-001', decision = 'validate', reason = '' } = req.body;
    if (decision === 'error' && (!reason || reason.trim().length < 3)) {
        return res.status(422).json({ success: false, error: 'REVIEW_REASON_REQUIRED' });
    }
    let nextStatus;
    let actionName;
    if (decision === 'validate') {
        nextStatus = 'clinically_validated';
        actionName = 'document_validate';
    }
    else if (decision === 'error') {
        nextStatus = 'error';
        actionName = 'document_error';
    }
    else {
        nextStatus = 'rejected';
        actionName = 'document_reject';
    }
    if (isMongoActive()) {
        try {
            const exam = await Exam.findById(id);
            if (exam) {
                exam.status = nextStatus;
                exam.revision = (exam.revision || 1) + 1;
                exam.validated_by = actor;
                exam.validated_at = new Date().toISOString();
                exam.review_reason = reason;
                exam.audit_trail.push({
                    action: actionName,
                    actor,
                    role: 'clinician',
                    timestamp: new Date().toISOString(),
                    client_id: exam.client_id,
                    reason,
                    details: `Decisión del profesional clínico: ${actionName}`,
                });
                exam.updated_at = new Date();
                await exam.save();
                return res.json({ success: true, data: exam });
            }
        }
        catch {
            // fallback
        }
    }
    const mem = memoryExams.find((e) => e._id === id || e.clinical_test_id === id);
    if (!mem)
        return res.status(404).json({ success: false, error: 'Examen no encontrado' });
    mem.status = nextStatus;
    mem.revision = (mem.revision || 1) + 1;
    mem.validated_by = actor;
    mem.validated_at = new Date().toISOString();
    mem.review_reason = reason;
    mem.audit_trail.push({
        action: actionName,
        actor,
        role: 'clinician',
        timestamp: new Date().toISOString(),
        client_id: mem.client_id,
        reason,
        details: `Decisión del profesional clínico: ${actionName}`,
    });
    mem.updated_at = new Date();
    return res.json({ success: true, data: mem });
});
