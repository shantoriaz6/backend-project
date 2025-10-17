import { Router } from "express";

import {
     getAllTweets,
     createTweet,
     getTweetById,
     updateTweet,
     deleteTweet
} from "../controllers/tweet.controller.js";

import { verifyjwt } from "../middlewares/auth.middlewares.js";


const router = Router();
router.use(verifyjwt)

router.route("/")
.get(getAllTweets)
.post(createTweet);

router.route("/:tweetId")
.get(getTweetById)
.patch(updateTweet)
.delete(deleteTweet);

export default router;


