import { Router } from "express";
import { 
    addvideoToPlaylist, 
    deletePlaylist, 
    getPlayListById, 
    updatePlaylist,
    getUserPlaylists, 
    removevideoFromPlaylist,
    createPlayList
 } from "../controllers/playlist.controller.js";

import { verifyjwt } from "../middlewares/auth.middlewares.js";


const router = Router();
router.use(verifyjwt);

router.route("/").post(createPlayList)


router.route("/:playlistId")
.get(getPlayListById)
.delete(deletePlaylist)
.patch(updatePlaylist);

router.route("/add/:videoId/:playlistId").patch(addvideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(removevideoFromPlaylist);
router.route("/user/:userId").get(getUserPlaylists);

export default router