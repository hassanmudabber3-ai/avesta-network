const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const config = require('./config');
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const pointsRoutes = require('./routes/points.routes');
const miningRoutes = require('./routes/mining.routes');
const referralRoutes = require('./routes/referral.routes');
const influencerRoutes = require('./routes/influencer.routes');
const campaignRoutes = require('./routes/campaign.routes');
const taskRoutes = require('./routes/task.routes');
const { auditMiddleware } = require('./middleware/audit.middleware');
const {
  notFoundHandler,
  errorHandler
} = require('./middleware/error.middleware');

const app = express();

app.use(helmet());
app.use(cors({
  origin: config.server.corsOrigin
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(auditMiddleware);

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AVC Backend is healthy',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/mining', miningRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/influencer', influencerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/tasks', taskRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

if (require.main === module) {
  app.listen(config.server.port, () => {
    console.log(`AVC Backend running on port ${config.server.port}`);
  });
}

module.exports = app;
