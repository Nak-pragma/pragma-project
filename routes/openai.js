// routes/openai.js
import express from "express";
import { handleOpenAIChat } from "../services/openaiService.js";

const router = express.Router();

router.post("/chat", handleOpenAIChat);

export default router;
