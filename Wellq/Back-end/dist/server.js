import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { examsRouter } from './routes/exams.routes.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Database connection
connectDB();
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'WellMedical Backend API',
        stack: 'Node.js + Express + TypeScript + MongoDB',
        features: ['documents', 'split_screen_pdf', 'range_review', 'synthetic_only'],
        timestamp: new Date().toISOString(),
    });
});
// Routes
app.use('/api/exams', examsRouter);
app.listen(PORT, () => {
    console.log(`[WellMedical] Servidor backend escuchando en: http://localhost:${PORT}`);
    console.log(`[WellMedical] Health check en: http://localhost:${PORT}/api/health`);
});
