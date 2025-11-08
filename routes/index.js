// routes/index.js
import express from "express";
import openaiRouter from "./openai.js";
import multiRoutes from "./multi.js";

const router = express.Router();

router.use("/openai", openaiRouter);
router.use("/multi", multiRoutes);

export default router;
