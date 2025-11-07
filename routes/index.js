// routes/index.js
import express from "express";
import openaiRouter from "./openai.js";

const router = express.Router();

router.use("/openai", openaiRouter);

export default router;
