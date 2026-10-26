const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { seedQuestionBank } = require('../utils/seedQuestions');
const { seedCodingProblemBank } = require('../utils/seedCodingProblems');
const { seedCompaniesAndJobs } = require('../utils/seedCompaniesAndJobs');

let mongod = null;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      console.log('⚡ MONGODB_URI not specified. Starting embedded MongoMemoryServer for instant execution...');
      mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
    }

    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      // Auto seed 250+ Question Bank, Coding Problems, Companies and Jobs if empty
      await seedQuestionBank();
      await seedCodingProblemBank();
      await seedCompaniesAndJobs();
    } catch (primaryErr) {
      if (!mongod) {
        console.warn(`⚠️ Primary MongoDB connection failed (${primaryErr.message}). Launching embedded MongoMemoryServer fallback...`);
        mongod = await MongoMemoryServer.create();
        mongoUri = mongod.getUri();
        const conn = await mongoose.connect(mongoUri);
        console.log(`✅ MongoDB Connected (Fallback Memory DB): ${conn.connection.host}`);
        await seedQuestionBank();
        await seedCodingProblemBank();
        await seedCompaniesAndJobs();
      } else {
        throw primaryErr;
      }
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
