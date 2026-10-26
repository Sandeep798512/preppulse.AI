require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect Database and Start Express Listener
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 AI Placement Prep Server running on port ${PORT}`);
    console.log(`📡 REST API endpoint available at http://localhost:${PORT}/api`);
  });
});
