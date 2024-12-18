import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    const { _id } = req.user

    const existingSubscription = await Subscription.findOne({
        channel: channelId,
        subscriber: _id
    })

    if (existingSubscription) {
        await Subscription.findByIdAndDelete(existingSubscription._id)
        return res.status(200).json(
            new ApiResponse(200, null, `Unsubscribed from channel ${channelId} successfully`)
        )
    }

    const subscription = await Subscription.create({
        channel: channelId,
        subscriber: _id
    })

    return res.status(201).json(
        new ApiResponse(201, subscription, `Subscribed to channel ${channelId} successfully`)
    )
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const { page = 1, limit = 10 } = req.query
    const options = {
        sort: { _id: -1 },
        populate: ["subscriber"],
        lean: true,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }

    // if (!isValidObjectId(channelId)) {
    //     throw new ApiError(400, "Invalid channel ID")
    // }
    const channel = await User.findById(channelId)
    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }
    const subscribers = await Subscription.paginate({ channel: channelId }, options)

    return res.status(200).json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    const { page = 1, limit = 10 } = req.query
    const options = {
        sort: { _id: -1 },
        populate: ["channel"],
        lean: true,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }

    // if (!isValidObjectId(subscriberId)) {
    //     throw new ApiError(400, "Invalid subscriber ID")
    // }
    const subscriber = await User.findById(subscriberId)
    if (!subscriber) {
        throw new ApiError(404, "Subscriber not found")
    }
    const subscribedChannels = await Subscription.paginate({ subscriber: subscriberId }, options)

    return res.status(200).json(new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}