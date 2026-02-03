import { Request, Response } from 'express';
import TimelineEvent from '../models/TimelineEvent';

// @desc    Get all timeline events
// @route   GET /api/timeline
// @access  Public
export const getEvents = async (req: Request, res: Response) => {
    try {
        const events = await TimelineEvent.find().sort({ order: 1, createdAt: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a timeline event
// @route   POST /api/timeline
// @access  Private/Admin
export const createEvent = async (req: Request, res: Response) => {
    try {
        const { title, date, time, description, status, order } = req.body;

        const event = new TimelineEvent({
            title,
            date,
            time,
            description,
            status,
            order,
        });

        const createdEvent = await event.save();
        res.status(201).json(createdEvent);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a timeline event
// @route   PUT /api/timeline/:id
// @access  Private/Admin
export const updateEvent = async (req: Request, res: Response) => {
    try {
        const { title, date, time, description, status, order } = req.body;
        const event = await TimelineEvent.findById(req.params.id);

        if (event) {
            event.title = title || event.title;
            event.date = date || event.date;
            event.time = time || event.time;
            event.description = description || event.description;
            event.status = status || event.status;
            event.order = order !== undefined ? order : event.order;

            const updatedEvent = await event.save();
            res.json(updatedEvent);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a timeline event
// @route   DELETE /api/timeline/:id
// @access  Private/Admin
export const deleteEvent = async (req: Request, res: Response) => {
    try {
        const event = await TimelineEvent.findById(req.params.id);

        if (event) {
            await event.deleteOne();
            res.json({ message: 'Event removed' });
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
