import { Router } from "express";
import { 
    getSubscribedChannels, 
    getUserchannelSubscribers,
    toggleSubscription

} from "../controllers/subscription.controller.js";

import { verifyjwt } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyjwt);
// Toggle subscription to a channel
router.route("/c/:channelId").post(toggleSubscription);

// Get channels a user has subscribed to
router.route("/u/:subscriberId").get(getSubscribedChannels);

// Get subscribers of a channel
router.route("/subscribers/:channelId").get(getUserchannelSubscribers);

export default router;