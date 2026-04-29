'use strict';

require('dotenv').config();

const app = require('./src/app');
const { connectDB } = require('./src/db/mongoose');
const { seedRoles } = require('./src/services/role.service');
const config = require('./src/config');

async function bootstrap() {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Seed default roles
    await seedRoles();

    // 3. Start HTTP server
    app.listen(config.port, () => {
      console.log(`[Server] Running on port ${config.port} (${config.nodeEnv})`);
    });
  } catch (err) {
    console.error('[Startup Error]', err.message);
    process.exit(1);
  }
}

bootstrap();
