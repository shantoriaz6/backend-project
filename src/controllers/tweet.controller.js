import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

import { User } from "../models/user.models.js";

import { Tweet } from "../models/tweet.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const userId = req.user._id;

    if(!content?.trim()) {
        throw new ApiError(400, "Tweet content cannot be empty");
    }

    const tweet = await Tweet.create({
        content,
        owner: userId,
    });

    res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet created successfully"));
})


const getAllTweets = asyncHandler(async (req, res) => {
   const {page = 1, limit = 10} = req.query;

    const tweets = await Tweet.find()
    .populate("owner", "userName fullName avatar")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));


    res.status(200)
    .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
})

const getTweetById = asyncHandler(async (req, res) => {
    const tweetId = req.params.tweetId;

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const tweet = await Tweet.findById(tweetId)
    .populate("owner", "userName fullName avatar");

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    res.status(200)
    .json(new ApiResponse(200, tweet, "Tweet fetched successfully"));

})

const updateTweet = asyncHandler(async (req, res) => {
    const tweetId = req.params.tweetId;
    const { content } = req.body;
    const userId = req.user._id; 

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const tweet = await Tweet.findOneAndUpdate(
        { _id: tweetId, owner: userId },
        {$set: {content: content?.trim()}},
        {new: true}
    );

    if (!tweet) {
        throw new ApiError(404, "Tweet not found ");
    }

    res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"));

})

const deleteTweet = asyncHandler(async (req, res) => {
    const tweetId = req.params.tweetId;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    const tweet = await Tweet.findOneAndDelete(
        { _id: tweetId,
         owner: userId }
    );

    if (!tweet) {
        throw new ApiError(404, "Tweet not found or you're not authorized to delete it");}

    res
    .status(200)
    .json(new ApiResponse(200, null, "Tweet deleted successfully"));
    
    })




export {
     createTweet,
      getAllTweets,
      getTweetById,
      updateTweet,
      deleteTweet,
    };