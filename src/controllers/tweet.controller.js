import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet 
    const { content } = req.body
    const { _id } = req.user;
    const tweet = new Tweet({ content, owner: _id })
    await tweet.save()
    res.status(201).json(new ApiResponse(201, tweet, `User ${_id} ${req.user.username} tweets created successfully`))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params
    const tweets = await Tweet.find({ owner: userId })
    res.status(200).json(new ApiResponse(200, tweets, `User ${userId} ${req.user.username} tweets fetched successfully`))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    const { content } = req.body
    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }
    tweet.content = content
    await tweet.save()
    res.status(200).json(new ApiResponse(200, tweet, `User ${req.user._id} ${req.user.username} tweets updated successfully`))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params
    const tweet = await Tweet.findByIdAndDelete(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }
    res.status(200).json(new ApiResponse(200, tweet, `User ${req.user._id} ${req.user.username} tweets deleted successfully`))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}