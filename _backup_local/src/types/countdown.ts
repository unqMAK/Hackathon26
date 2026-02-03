export interface Countdown {
    _id: string;
    title: string;
    targetDate: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateCountdownData {
    title?: string;
    targetDate: string;
    isActive?: boolean;
}
