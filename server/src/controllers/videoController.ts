import { Request, Response } from 'express';
import Video from '../models/Video';

// Public: Get all active videos
export const getPublicVideos = async (req: Request, res: Response) => {
    try {
        const videos = await Video.find({ isActive: true }).sort({ order: 1 }).lean();
        res.json({ videos });
    } catch (error) {
        console.error('Error fetching public videos:', error);
        res.status(500).json({ message: 'Failed to fetch videos' });
    }
};

// Admin: Get all videos
export const getAllVideosAdmin = async (req: Request, res: Response) => {
    try {
        const videos = await Video.find().sort({ order: 1 }).lean();
        res.json({ videos });
    } catch (error) {
        console.error('Error fetching admin videos:', error);
        res.status(500).json({ message: 'Failed to fetch videos' });
    }
};

// Admin: Create a video
export const createVideo = async (req: Request, res: Response) => {
    try {
        const { youtubeLink, title, representativeName, representativeDesignation, problemStatements, isActive } = req.body;

        if (!youtubeLink || !title) {
            return res.status(400).json({ message: 'YouTube link and title are required' });
        }

        // Auto-assign order
        const maxOrder = await Video.findOne().sort({ order: -1 }).select('order').lean();
        const order = (maxOrder?.order || 0) + 1;

        const video = await Video.create({
            youtubeLink,
            title,
            representativeName: representativeName || '',
            representativeDesignation: representativeDesignation || '',
            problemStatements: problemStatements || [],
            isActive: isActive !== undefined ? isActive : true,
            order
        });

        res.status(201).json({ message: 'Video created successfully', video });
    } catch (error) {
        console.error('Error creating video:', error);
        res.status(500).json({ message: 'Failed to create video' });
    }
};

// Admin: Update a video
export const updateVideo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const video = await Video.findByIdAndUpdate(id, updateData, { new: true });
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        res.json({ message: 'Video updated successfully', video });
    } catch (error) {
        console.error('Error updating video:', error);
        res.status(500).json({ message: 'Failed to update video' });
    }
};

// Admin: Delete a video
export const deleteVideo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const video = await Video.findByIdAndDelete(id);
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }
        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ message: 'Failed to delete video' });
    }
};
