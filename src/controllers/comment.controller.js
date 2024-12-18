import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {

    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10)

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const comments = await Comment.find({ video: videoId })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .populate("owner", "username fullName avatar")

    const totalComments = await Comment.countDocuments({ video: videoId })

    if (!comments || comments.length === 0) {
        return res.status(200).json(new ApiResponse(200, { comments: [] }, "No comments found for this video"))
    }

    const paginatedResponse = {
        docs: comments,
        totalDocs: totalComments,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(totalComments / parseInt(limit, 10))
    }

    res.status(200).json(new ApiResponse(200, paginatedResponse, "Comments fetched successfully"))
})


const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params
    const { content } = req.body
    const { _id } = req.user;
    const comment = new Comment({ content, video: videoId, owner: _id })
    await comment.save()
    res.status(201).json(new ApiResponse(201, comment, `User ${_id} ${req.user.username} for video ${videoId} comments created successfully`))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params
    const { content } = req.body
    const comment = await Comment.findById(commentId)
    
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }
    comment.content = content
    await comment.save()
    res.status(200).json(new ApiResponse(200, comment, "Comment updated successfully"))

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params
    const comment = await Comment.findByIdAndDelete(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }
    res.status(200).json(new ApiResponse(200, comment, "Comment deleted successfully"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
