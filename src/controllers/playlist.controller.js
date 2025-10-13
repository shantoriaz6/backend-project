import { Playlist } from "../models/playlist.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";

const createPlayList = asyncHandler(async(req, res) => {
    const {name, description, videos} = req.body;

    if(!name || !description) {
        throw new ApiError(400, "name and description are required");
    }

    const playlist = await Playlist.create({
        name,
        description,
        videos: Array.isArray(videos) ? videos : [],
        owner: req.user._id

    });

    res
    .status(200)
    .json(new ApiResponse(200, playlist , "Playlist created successfully"));


})


const getUserPlaylists = asyncHandler(async(req, res) => {
   const {userId} = req.params;

    if(!userId) {   
        throw new ApiError(400, "userId is required");
    }

   const playlists = await Playlist.find({owner: userId})
    .populate("videos")
    .populate("owner", "userName avatar");

   res
   .status(200)
   .json(new ApiResponse(200, playlists, "Playlists fetched successfully"));


})


const getPlayListById = asyncHandler(async(req, res) => {
    const {playlistId} = req.params;

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

    const playlist = await Playlist.findById(playlistId)
    .populate("videos")
    .populate("owner", "userName avatar");

    if(!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully") )  





});


const addvideoToPlaylist = asyncHandler(async(req, res) => {
    const {playlistId} = req.params;
    const {videoId} = req.params;

    if((!mongoose.Types.ObjectId.isValid(playlistId)) || (!mongoose.Types.ObjectId.isValid(videoId))) {
        throw new ApiError(400, "Invalid playlist ID or video ID");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if(playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already in playlist");
    }

    playlist.videos.push(videoId);
    await playlist.save();

    const updatedPlaylist = await Playlist.findById(playlistId)
    .populate("videos")
    .populate("owner", "userName avatar");

    res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Video added to playlist successfully"));   





})

const removevideoFromPlaylist = asyncHandler(async(req, res) => {
    const {playlistId} = req.params;
    const {videoId} = req.params;

    if((!mongoose.Types.ObjectId.isValid(playlistId)) || (!mongoose.Types.ObjectId.isValid(videoId))) {
        throw new ApiError(400, "Invalid playlist ID or video ID");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

   const index = playlist.videos.indexOf(videoId);
    if (index === -1) {
    throw new ApiError(404, "Video not found in playlist");
  }

  playlist.videos.splice(index, 1);
  await playlist.save();

    const updatedPlaylist = await Playlist.findById(playlistId)
    .populate("videos")
    .populate("owner", "userName avatar");

    res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Video removed from playlist successfully"));   





})

const deletePlaylist = asyncHandler(async(req, res) => {
    const {playlistId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId);   

    if(!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    await playlist.deleteOne();

    res
    .status(200)
    .json(new ApiResponse(200, null, "Playlist deleted successfully"));


})

const updatePlaylist = asyncHandler(async(req, res) => {
    const {playlistId} = req.params;
    const {name, description} = req.body ;

    if(!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    if(!name && !description) {
        throw new ApiError(400, "name or description is required");
    }

    const playlist = await Playlist.findById(playlistId);   

    if(!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if(name) playlist.name = name;
    if(description) playlist.description = description; 

    await playlist.save();

    const updatedPlaylist = await Playlist.findById(playlistId)
    .populate("videos")
    .populate("owner", "userName avatar");

    res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"));

});

    






export {
    createPlayList,
    getUserPlaylists,
    getPlayListById,
    addvideoToPlaylist,
    removevideoFromPlaylist,
    deletePlaylist,
    updatePlaylist


};