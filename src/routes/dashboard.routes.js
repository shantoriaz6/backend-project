import { Router } from "express";
import { verifyjwt } from "../middlewares/auth.middlewares.js";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";



const router = Router();
router.use(verifyjwt)


router.route("/stats/:channelId").get(getChannelStats);

router.route("/videos/:channelId").get(getChannelVideos);

export default router
