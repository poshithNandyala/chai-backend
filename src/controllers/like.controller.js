import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    const { _id } = req.user
    const like = new Like({ video: videoId, owner: _id })
    await like.save()
    res.status(201).json(new ApiResponse(201, like, `User ${_id} ${req.user.username} for video ${videoId} likes created successfully`))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }
    const { _id } = req.user
    const like = new Like({ comment: commentId, owner: _id })
    await like.save()
    res.status(201).json(new ApiResponse(201, like, `User ${_id} ${req.user.username} for comment ${commentId} likes created successfully`))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }
    const { _id } = req.user
    const like = new Like({ tweet: tweetId, owner: _id })
    await like.save()
    res.status(201).json(new ApiResponse(201, like, `User ${_id} ${req.user.username} for tweet ${tweetId} likes created successfully`))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const likes = await Like.find({ likedBy: _id, video: { $exists: true, $ne: null } })
        .populate({
            path: "video",
            select: "title description videoFile thumbnail duration views"
        })
        .populate({
            path: "likedBy",
            select: "username fullName avatar"
        })
        .lean()
    
    if (!likes?.length) {
        return res.status(200).json(new ApiResponse(200, [], "No liked videos found"))
    }

    const filteredLikes = likes.filter(like => like.video !== null)
    
    if (!filteredLikes.length) {
        return res.status(200).json(new ApiResponse(200, [], "No liked videos found"))
    }

    res.status(200).json(new ApiResponse(200, filteredLikes, "Liked videos fetched successfully"))
})
export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}