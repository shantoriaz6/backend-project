import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/apiResponse.js";  
import { Types } from "mongoose";



const getVideoComments =asyncHandler( async (req, res) => {
    const videoId = req.params.videoId;

    const {page = 1, limit = 10} = req.query;

     if (!mongoose.Types.ObjectId.isValid(videoId)){

        throw new Error("Invalid video ID");

    }

    const comments = await Comment.aggregate([
        { $match: { video: new Types.ObjectId(videoId) } },

        {$lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "allcomments"
        }},

        { $unwind: "$allcomments" },

        { $project: {   
            content: 1,
            createdAt: 1,
            updatedAt: 1,
            "allcomments._id": 1,
            "allcomments.userName": 1,
            "allcomments.fullName": 1,
            "allcomments.avatar": 1,
        }},
    ])


    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));


    res.status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"));
})

const addComment = asyncHandler( async(req,res) => {
    const videoId = req.params.videoId;
    const { content } = req.body;
    const userId = req.user._id;


if(!mongoose.Types.ObjectId.isValid(videoId)){
    throw new ApiError(400, "Invalid video ID");
}

const comment = await Comment.create({
    content,
    video: videoId,

    owner: userId,
});

res
.status(201)
.json(new ApiResponse(201, comment, "Comment added successfully"));
})


const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const comment = await Comment.findOneAndUpdate(
        { _id: commentId, owner: userId },
        { $set: { content } },
        { new: true }
    );

    if (!comment) {
        throw new ApiError(404, "Comment not found or you're not authorized to update it");
    }

    res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment updated successfully"));
})


const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID");}


    const comment = await Comment.findOneAndDelete(
        { _id: commentId, owner: userId })

        if (!comment) {
            throw new ApiError(404, "Comment not found or you're not authorized to delete it");
        }

        res
        .status(200)
        .json(new ApiResponse(200, null, "Comment deleted successfully"));
        
    })





export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};