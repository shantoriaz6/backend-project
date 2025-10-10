import { Router } from "express";
import { loginUser, 
    logoutUser, 
    registerUser,
    refreshAccessToken, 
    changeCurentPassword, 
    getCurrentUser, 
    updateAccountDetails, 
    updateUserAvatar, 
    updateUserCoverImage, 
    getUserChannelProfile,
     getWatchHistory } from "../controllers/user.controller.js";
import { upload } from"../middlewares/multer.middleware.js";
import { verifyjwt } from "../middlewares/auth.middlewares.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount:1
        }
    ]),
    registerUser)

    router.route("/login").post(loginUser)
    //secured route

    router.route("/logout").post(verifyjwt, logoutUser)

    router.route("/refresh-token").post(refreshAccessToken)

    router.route("/change-password").post(verifyjwt, changeCurentPassword)

    router.route("/current-user").get(verifyjwt, getCurrentUser)

    router.route("/update-account-details").patch(verifyjwt, updateAccountDetails)

    router.route("/avatar").patch(verifyjwt, upload.single("avatar") , updateUserAvatar)

    router.route("/cover-Image").patch(verifyjwt, upload.single("coverImage"),updateUserCoverImage)

    router.route("/c/:userName").get(verifyjwt,getUserChannelProfile)

    router.route("/history").get(verifyjwt, getWatchHistory)







export default router
