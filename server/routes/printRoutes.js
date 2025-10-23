import express from 'express';
import { createPrintJob, getPendingPrintJobs, markJobDone } from '../controllers/printController.js';

const router = express.Router();

router.post('/create', createPrintJob);
router.get('/pending', getPendingPrintJobs);
router.delete('/done/:jobId', markJobDone);

export default router;
