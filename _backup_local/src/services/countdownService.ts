import { api } from './api';
import { Countdown, UpdateCountdownData } from '../types/countdown';

export const countdownService = {
    // Get countdown configuration
    getCountdown: async (): Promise<Countdown> => {
        const response = await api.get<Countdown>('/countdown');
        return response.data;
    },

    // Update or create countdown configuration (Admin only)
    updateCountdown: async (data: UpdateCountdownData): Promise<Countdown> => {
        const response = await api.put<Countdown>('/countdown', data);
        return response.data;
    },

    // Disable countdown (Admin only)
    disableCountdown: async (): Promise<{ message: string; countdown: Countdown }> => {
        const response = await api.put<{ message: string; countdown: Countdown }>('/countdown/disable');
        return response.data;
    }
};
