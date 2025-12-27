import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import tenderRoutes from './routes/tenderRoutes.js';
import authRoutes from './routes/authRoutes.js';
import priceRoutes from './routes/priceRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';

dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tenders', tenderRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/certificates', certificateRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'LicitaBot API is running...' });
});

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
