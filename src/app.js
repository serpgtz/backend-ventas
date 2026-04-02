const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const prospectRoutes = require('./routes/prospect.routes');
const notFoundMiddleware = require('./middlewares/notFound.middleware');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API funcionando correctamente',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/prospects', prospectRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
