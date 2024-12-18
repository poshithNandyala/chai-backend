import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    
    //TODO: create playlist
    const playlist = await Playlist.create({name, description, owner: req.user._id})
    res.status(201).json(new ApiResponse(201, playlist, "Playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    const playlists = await Playlist.find({owner: userId}).lean()
    res.status(200).json(new ApiResponse(200, playlists, `User ${userId} ${req.user.username} playlists fetched successfully`))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    const playlist = await Playlist.findById(playlistId).lean()
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    res.status(200).json(new ApiResponse(200, playlist, `Playlist ${playlistId} fetched successfully`))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: add video to playlist
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    playlist.videos.push(videoId)
    await playlist.save()
    res.status(200).json(new ApiResponse(200, playlist, `Video ${videoId} added to playlist ${playlistId} successfully`))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    playlist.videos.pull(videoId)
    await playlist.save()
    res.status(200).json(new ApiResponse(200, playlist, `Video ${videoId} removed from playlist ${playlistId} successfully`))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    const playlist = await Playlist.findByIdAndDelete(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    res.status(200).json(new ApiResponse(200, playlist, `Playlist ${playlistId} deleted successfully`))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    playlist.name = name
    playlist.description = description
    await playlist.save()
    res.status(200).json(new ApiResponse(200, playlist, `Playlist ${playlistId} updated successfully`))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
