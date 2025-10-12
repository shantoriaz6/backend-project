import { asyncHandler } from "../utils/asyncHandler";
import { Video } from "../models/video.models";
import { ApiError } from "../utils/apiError.js";
import { isValidObjectId } from "mongoose";
import { ApiResponse } from "../utils/apiResponse";
import { uploadOnCloudinary } from "../utils/coudinary";


const getAllVideos = asyncHandler(async (req, res ) => {
    const {page= 1, limit = 10, query, sortBy = "createdAt", sortType = "asc", userId} = req.query;

    if(userId && isValidObjectId(userId)){
        throw new ApiError(400, "Invalid userId")
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit); 
    if( isNaN(pageNum) || isNaN(limitNum)) {
        throw new ApiError(400, "Page and limit must be numbers")   

    }

    const filter = {};
    if(query) filter.title = { $regex: query, $options: "i"};

    if(userId) filter.owner = userId;

    const sortOptions =  {};

    sortOptions[sortBy] = sortType === "asc" ? 1 : -1 ;

    const videos = await Video.find(filter) 
    .sort(sortOptions)
    .skip ((pageNum-1) * limitNum)
    .limit(limitNum)
    .populate("owner", "userName avatar");

    if(!videos || videos.length === 0) {
        throw new ApiError (404, "No videos found");
    }

    res.status(200)
    .json(new ApiResponse( 200, videos, "videos fetched successfully" ));




});

const publishAVideo = asyncHandler(async (req,res) => {
    const {title, description} = req.body
    const videoFile = req.file ;

    if(!title || !description || !videoFile) {
        throw new ApiError(400, "Title, description and video file are required");
    }

    const cloudinaryResponse = await uploadOnCloudinary (videoFile.path, {
        resource_type: "video",
        folder: "videos"
    })

    const video = await Video.create({

        title,
        description,
        videoUrl: cloudinaryResponse.secure_url,
        publicId: cloudinaryResponse.public_id,
        duration: cloudinaryResponse.duration,
        thumbnail: cloudinaryResponse.thumbnail_url,
        owner: req.user._id,
        isPublished: true,
        

    })

    res.status(200)
    .json(new ApiResponse(200, video, "Video published successfully"))



})


const getVideoById = asyncHandler(async(req, res) => {
    
})




export {
    getAllVideos,
    publishAVideo,


}