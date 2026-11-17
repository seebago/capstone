import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { createApp } from './app.js';

dotenv.config();

const app = createApp();
const PORT = process.env.PORT || 5000;

// Database connection
connectDB();

app.listen(PORT, () => {
  console.log(`[WellMedical] Servidor backend escuchando en: http://localhost:${PORT}`);
  console.log(`[WellMedical] Health check en: http://localhost:${PORT}/api/health`);
});
