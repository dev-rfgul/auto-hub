// right now make a route for a get req to test if the controller is working
import express from 'express';
// import { getAIResponse } from '../chatbot/aiResponseController.js';
import { getAIResponse } from '../chatbot/aiResponseController.js';
const router = express.Router();

router.get('/ai-response', getAIResponse);

export default router;