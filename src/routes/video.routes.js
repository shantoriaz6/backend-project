import { Router } from "express";
import { verifyjwt } from "../middlewares/auth.middlewares.js";
import { 
    deletevideo, 
    getAllVideos, 
    getVideoById, 
    upatevideo, 
    publishAVideo, 
    togglePublishStatus } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()
router.use(verifyjwt);
router
.route("/")
.get (getAllVideos)
.post(
    upload.fields(
        [
            {
                name: "videoFile",
                maxCount: 1
            },
            {
                name: "thumbnail",
                maxCount: 1
            }

        ]
    ), publishAVideo
);

router.route("/:videoId")
 .get(getVideoById)
 .delete(deletevideo)
 .patch(upload.single("thumbnail"), upatevideo)

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);



export default router