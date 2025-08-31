import { config } from 'dotenv';
config();

import '@/ai/flows/predict-risk-zones.ts';
import '@/ai/flows/analyze-rock-face.ts';
import '@/ai/flows/generate-report-csv.ts';
