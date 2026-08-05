import express, { Request, Response } from 'express';
import cors from 'cors';
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());






app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});