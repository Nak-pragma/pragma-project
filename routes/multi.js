import express from "express";
import { compareResponses } from "../services/multiService.js";
const router = express.Router();

router.post("/compare", compareResponses);
export default router;
