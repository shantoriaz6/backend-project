import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

import { ApiError } from "../utils/apiError.js";

import { Video } from "../models/video.models.js";
import { subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";


const getChannelStats = asyncHandler (async (req, res) => {
    const channelId = req.params.channelId;

    if(!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const [videoStats, subscriberCount, likeCount] = await Promise.all([
        Video.aggregate([
            { $match: { channelId:new mongoose.Types.ObjectId(channelId) } },
            { $group: { 
                _id: null,
                 totalViews: { $sum: "$views" }, totalLikes: { $sum: "$likes" } } }
        ]),
       
        subscription.countDocuments({channel: channelId}),
        Like.countDocuments({owner: channelId})
    ]);

    const stats = {
        totalViews: videoStats[0]?.totalViews || 0,
        totalLikes: videoStats[0]?.totalLikes || 0,
        subscriberCount: subscriberCount || 0,
        likeCount: likeCount || 0
    };

    res.status(200).json(new ApiResponse(200, stats, "Channel statistics fetched successfully"));



   
});


const getChannelVideos =  asyncHandler (async (req, res) => {

    const channelId = req.params.channelId;
    const { page = 1, limit = 10 } = req.query;

    if(!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const videos = await Video.find({ owner: channelId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate("owner", "userName fullName avatar");

    res
    .status(200)
    .json(new ApiResponse(200, videos, "Channel videos fetched successfully"))
})


export {    
    getChannelStats,
    getChannelVideos,

    

};

