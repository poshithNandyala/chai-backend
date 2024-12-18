import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    //TODO: get all videos based on query, sort, pagination
    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', userId } = req.query
    const filter = query ? { title: { $regex: query, $options: 'i' } } : {}
    if (userId) {
        filter.user = userId
    }
    const sort = { [sortBy]: sortType === 'asc' ? 1 : -1 }
    const skip = (page - 1) * limit

    const videos = await Video.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))

    const total = await Video.countDocuments(filter)
    let data = {
        videos,
        total,
        page,
        limit
    }
    res.status(200).json(new ApiResponse(200, data, "Success"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    const { title = Date.now(), description = "This is a description" } = req.body
    const videoFile = req.files?.videoFile[0]?.path
    const thumbnail = req.files?.thumbnail[0]?.path
    const { _id } = req.user
    const video = await uploadOnCloudinary(videoFile)
    const thumbnailUrl = await uploadOnCloudinary(thumbnail)
    if (!video || !thumbnailUrl) {
        throw new ApiError(400, "Failed to upload video or thumbnail")
    }
    const newVideo = await Video.create({
        title,
        description,
        duration: video.duration,
        videoFile: video.url,
        thumbnail: thumbnailUrl.url,
        owner: _id
    })

    res.status(201).json(new ApiResponse(201, newVideo, "Video published successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    res.status(200).json(new ApiResponse(200, video, "Success"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    const { title, description } = req.body
    console.log(title, description)
    const thumbnailpath = req.file?.path;
    const oldthumbnail = video.thumbnail;
    if (thumbnailpath) {
        const thumbnail = await uploadOnCloudinary(thumbnailpath)
        if (!thumbnail) {
            throw new ApiError(400, "Failed to upload thumbnail")
        }
        video.thumbnail = thumbnail.url;
        await deleteFromCloudinary(oldthumbnail);
    }

    if (title) {
        video.title = title
    }
    if (description) {
        video.description = description
    }
    await video.save()
    let data = {
        video,
        oldthumbnail,
    }
    res.status(200).json(new ApiResponse(200, data, "Video updated successfully"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    let deletedvideo = await Video.findByIdAndDelete(videoId)
    let deletedvideoFile = await deleteFromCloudinary(video.videoFile)
    let deletedthumbnail = await deleteFromCloudinary(video.thumbnail)
    let data = {
        deletedvideo,
        deletedvideoFile,
        deletedthumbnail
    }
    res.status(200).json(new ApiResponse(200, data, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    video.isPublished = !video.isPublished
    await video.save()
    res.status(200).json(new ApiResponse(200, video, "Status updated successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
