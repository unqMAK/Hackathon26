import { Request, Response } from 'express';
import Settings from '../models/Settings';

const PUBLISH_RESULTS_KEY = 'publish_results';

// GET /api/settings/results - Public endpoint to check if results are published
export const getResultsPublishStatus = async (req: Request, res: Response) => {
    try {
        const setting = await Settings.findOne({ key: PUBLISH_RESULTS_KEY });

        return res.json({
            published: setting?.value?.published || false,
            publishedAt: setting?.value?.publishedAt || null,
            message: setting?.value?.message || 'Results are not yet published.'
        });
    } catch (error: any) {
        console.error('Get results publish status error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// PUT /api/settings/results - Admin only to toggle results visibility
export const updateResultsPublishStatus = async (req: Request, res: Response) => {
    try {
        const { published, message } = req.body;

        if (typeof published !== 'boolean') {
            return res.status(400).json({ message: 'published field must be a boolean' });
        }

        const setting = await Settings.findOneAndUpdate(
            { key: PUBLISH_RESULTS_KEY },
            {
                key: PUBLISH_RESULTS_KEY,
                value: {
                    published,
                    publishedAt: published ? new Date() : null,
                    message: message || (published ? 'Results are now available!' : 'Results are not yet published.')
                }
            },
            { upsert: true, new: true }
        );

        return res.json({
            published: setting.value.published,
            publishedAt: setting.value.publishedAt,
            message: setting.value.message
        });
    } catch (error: any) {
        console.error('Update results publish status error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};
