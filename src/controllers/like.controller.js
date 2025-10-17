import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import { ApiError } from "../utils/apiError.js";
import { Like } from "../models/like.model.js";
import mongoose from "mongoose";


const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    if (!userId) {   
        throw new ApiError(400, "userId is required");
    }

    const existingLike = await Like.findOne({ likedBy: userId , video: videoId });

    if(existingLike) {
       await existingLike.deleteOne();

       return res
       .status(200)
       .json(new ApiResponse(200, null, "video unliked"))

    }

    await Like.create({ likedBy: userId , video: videoId });

   return res
   .status(200)
   .json(new ApiResponse(200, null, "video liked"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {

    const {commentId} = req.params

    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    if (!userId) {
        throw new ApiError(400, "userId is required");
    }

    const existingLike = await Like.findOne({ likedBy: userId , comment: commentId });

    if(existingLike) {
       await existingLike.deleteOne();

       return res
       .status(200)
       .json(new ApiResponse(200, null, "comment unliked"))

    }

    await Like.create({ likedBy: userId , comment: commentId });

   return res
   .status(200)
   .json(new ApiResponse(200, null, "comment liked"))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    if (!userId) {   
        throw new ApiError(400, "userId is required");
    }

    const existingLike = await Like.findOne({ likedBy: userId , tweet: tweetId });

    if(existingLike) {
       await existingLike.deleteOne();
         return res
         .status(200)
         .json(new ApiResponse(200, null, "tweet unliked"))
    }

    await Like.create({ likedBy: userId , tweet: tweetId });

   return res
   .status(200)
   .json(new ApiResponse(200, null, "tweet liked"))
})


const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    if (!userId) {
        throw new ApiError(400, "userId is required");
    }

    const likedVideos = await Like.find({ likedBy: userId, video: { $ne: null } }).populate("video", "title thumbnail");

    const videos = likedVideos.map(like => like.video);

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Liked videos retrieved successfully"));



})




export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos


}





