import api from '../lib/api';

export interface TimelineEvent {
    _id: string;
    title: string;
    date: string;
    time: string;
    description: string;
    status: 'completed' | 'active' | 'upcoming';
    order: number;
}

export const timelineService = {
    getEvents: async () => {
        const response = await api.get<TimelineEvent[]>('/timeline');
        return response.data;
    },

    createEvent: async (eventData: Omit<TimelineEvent, '_id'>) => {
        const response = await api.post<TimelineEvent>('/timeline', eventData);
        return response.data;
    },

    updateEvent: async (id: string, eventData: Partial<TimelineEvent>) => {
        const response = await api.put<TimelineEvent>(`/timeline/${id}`, eventData);
        return response.data;
    },

    deleteEvent: async (id: string) => {
        const response = await api.delete(`/timeline/${id}`);
        return response.data;
    },
};
