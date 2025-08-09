import { config } from 'dotenv';
config();

import '@/ai/flows/generate-rescue-routes.ts';
import '@/ai/flows/predict-victim-probability.ts';
