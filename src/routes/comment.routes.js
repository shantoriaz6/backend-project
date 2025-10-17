import { Router } from "express";

import {
     addComment, 
     getVideoComments,
     deleteComment,
     updateComment
     } from "../controllers/comment.controller.js";

import { verifyjwt } from "../middlewares/auth.middlewares.js";



const router = Router();
router.use(verifyjwt);

router.route("/:videoId")
.get(getVideoComments)
.post(addComment)

router.route("/:commentId")
.delete(deleteComment)
.patch(updateComment);

export default router;