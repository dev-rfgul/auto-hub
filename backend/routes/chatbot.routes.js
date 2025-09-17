// right now make a route for a get req to test if the controller is working
import express from 'express';
import { getAIResponseHandler } from '../chatbot/aiResponseController.js';
const router = express.Router();

router.post('/ai-response', getAIResponseHandler); // use GET for prompt in query

export default router;