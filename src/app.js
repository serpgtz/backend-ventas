const express = require('express');
const cors = require('cors');
const prospectRoutes = require('./routes/prospect.routes');
const authRoutes = require('./routes/auth.routes');
// const authMiddleware = require('./middlewares/auth.middleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.status(200).json({ message: 'API funcionando correctamente' });
});

app.use('/api/auth', authRoutes);
// Temporal para pruebas: desactivar autenticacion JWT en prospects
app.use('/api/prospects', prospectRoutes);

app.use((error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const detail = error?.original?.sqlMessage || error?.original?.message || error?.message;

  console.error('[API ERROR]', {
    statusCode,
    message: error?.message,
    detail,
    stack: error?.stack,
  });

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Error interno del servidor',
  });
});

module.exports = app;
