import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.models.js";
import { subscription } from "../models/subscription.model.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const subscriberId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  if (channelId.toString() === subscriberId.toString()) {
    throw new ApiError(400, "You cannot subscribe to yourself");
  }

  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  const existing = await subscription.findOne({ channel: channelId, subscriber: subscriberId });

  if (existing) {
    await existing.deleteOne();
    return res.status(200).json(new ApiResponse(200, null, "Unsubscribed successfully"));
  }

  await subscription.create({ channel: channelId, subscriber: subscriberId });
  return res.status(200).json(new ApiResponse(200, null, "Subscribed successfully"));
});



const getUserchannelSubscribers = asyncHandler(async(req, res) => {

    const {channelId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const subscribers = await subscription.find({channel: channelId})
    .populate("subscriber", "userName avatar");

    res.status(200)
    .json(new ApiResponse(200, subscribers.map(s => s.subscriber), "Subscribers fetched successfully"));






})


const getSubscribedChannels = asyncHandler(async(req, res) => {

    const {subscriberId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }


    const subscriptions = await subscription.find({ subscriber: subscriberId })
    .populate("channel", "userName avatar");

  const channels = subscriptions.map(sub => sub.channel);

  res
    .status(200)
    .json(new ApiResponse(200, channels, "Subscribed channels fetched successfully"));
});



export {
    toggleSubscription,
   getUserchannelSubscribers,
    getSubscribedChannels

 }