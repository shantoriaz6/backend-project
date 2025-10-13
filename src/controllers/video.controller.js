import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/apiError.js";
import { isValidObjectId } from "mongoose";
import { ApiResponse } from "../utils/apiResponse.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/coudinary.js";


const getAllVideos = asyncHandler(async (req, res ) => {
    const {page= 1, limit = 10, query, sortBy = "createdAt", sortType = "asc", userId} = req.query;

    if(userId && !isValidObjectId(userId)){
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
    const videoFile = req.files?.videoFile?.[0];
  const thumbnail = req.files?.thumbnail?.[0];

   // console.log("BODY:", req.body);
//console.log("FILE:", req.file);


    if(!title || !description || !videoFile ||!thumbnail) {
        throw new ApiError(400, "Title, description and video file are required");
    }

    const videoUpload = await uploadOnCloudinary (videoFile.path, {
        resource_type: "video",
        folder: "videos"
    })

   const thumbnailUpload = thumbnail
  ? await uploadOnCloudinary(thumbnail.path, {
      resource_type: "image",
      folder: "thumbnails"
    })
  : null;

const thumbnailUrl = thumbnailUpload?.secure_url || videoUpload?.thumbnail_url;

if (!thumbnailUrl) {
  throw new ApiError(400, "Thumbnail is required and could not be generated");
}

    const video = await Video.create({

        title,
        description,
        videoFile: videoUpload.secure_url,
        publicId: videoUpload.public_id,
        duration: videoUpload.duration,
        thumbnail: thumbnailUrl,
        owner: req.user._id,
        isPublished: true,
        

    })

    res.status(200)
    .json(new ApiResponse(200, video, "Video published successfully"))



})


const getVideoById = asyncHandler(async(req, res) => {
    const {videoId} = req.params;

    if(!videoId) {
        throw new ApiError(400, "videoId is required");
    }

    const video = await Video.findById(videoId).populate("owner", "userName avatar")

    if(!video) {
        throw new ApiError(404, "Video not found");
    }

    res.status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"))
});


const upatevideo = asyncHandler(async(req, res) => {
    const {videoId} = req.params;
    const {title, description, thumbnail} = req.body || {};
    if(!videoId) {
        throw new ApiError(400, "viedoId is required");
    }

    const video = await Video.findById(videoId);

    if(!video) {
        throw new ApiError(404, "Video not found");
    }

    if(title) video.title = title;
    if(description) video.description = description;
    if(thumbnail) video.thumbnail = thumbnail;

    await video.save();

    res
    .status(200)
    .json (new ApiResponse (200, video, "video updated successfully"));

})

const deletevideo = asyncHandler(async(req, res) => {
    const {videoId} = req.params;
   
    if(!videoId) {
        throw new ApiError(400, "viedoId is required");
    }

    const video = await Video.findById(videoId);

    if(!video) {
        throw new ApiError(404, "Video not found");
    }

   if(video.publicId) {
     await deleteFromCloudinary(video.publicId, "video")

   }
    res
    .status(200)
    .json (new ApiResponse (200, video, "video deleted successfully"));

})

const togglePublishStatus = asyncHandler(async(req, res) => {
    const {videoId} = req.params;
   
    if(!videoId) {
        throw new ApiError(400, "videoId is required");
    }

    const video = await Video.findById(videoId);

    if(!video) {
        throw new ApiError(404, "Video not found");
    }

    video.isPublished = !video.isPublished;
    await video.save();

    res
    .status(200)
    .json (new ApiResponse (200, video, `video ${video.isPublished? "published" : "unpublished"} successfully   `));

})


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    upatevideo,
    deletevideo,
    togglePublishStatus


}