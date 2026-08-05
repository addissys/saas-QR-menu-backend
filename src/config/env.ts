import dotenv from 'dotenv';

//Load variables from the .env file into process.env
dotenv.config();

//Define the variables your application absolutely needs to run
const requiredVariables = [
  'DATABASE_URL',
  // 'JWT_SECRET', // Uncomment this when you start building the Auth module
] as const;

//Loop through and check if any are missing
for (const envVar of requiredVariables) {
  if (!process.env[envVar]) {
    throw new Error(`❌ FATAL ERROR: Missing required environment variable: ${envVar}`);
  }
}

export const config = {
  port: parseInt(process.env.PORT as string, 10) || 5000,
  databaseUrl: process.env.DATABASE_URL as string,
  nodeEnv: process.env.NODE_ENV || 'development',
  
};