import { useState, useEffect } from 'react';
import { Megaphone, AlertTriangle, Info, Bell } from 'lucide-react';
import api from '@/lib/api';

interface Announcement {
    _id: string;
    title: string;
    message: string;
    link?: string;
    type: 'info' | 'warning' | 'urgent' | 'general';
    createdAt: string;
}

const AnnouncementTicker = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const response = await api.get('/announcements/public');
                setAnnouncements(response.data);
            } catch (error) {
                console.error('Error fetching announcements:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnnouncements();
        // Refresh every 5 minutes
        const interval = setInterval(fetchAnnouncements, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (isLoading || announcements.length === 0) {
        return null;
    }

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'urgent':
                return {
                    bg: 'bg-red-600',
                    text: 'text-white',
                    icon: AlertTriangle
                };
            case 'warning':
                return {
                    bg: 'bg-amber-500',
                    text: 'text-white',
                    icon: AlertTriangle
                };
            case 'info':
                return {
                    bg: 'bg-blue-600',
                    text: 'text-white',
                    icon: Info
                };
            default:
                return {
                    bg: 'bg-gradient-to-r from-[#8B2A3B] to-[#E25A2C]',
                    text: 'text-white',
                    icon: Megaphone
                };
        }
    };

    // Create duplicated content for seamless infinite scroll
    const tickerContent = [...announcements, ...announcements];

    return (
        <div className="relative overflow-hidden bg-gradient-to-r from-[#8B2A3B] via-[#a53549] to-[#E25A2C] text-white py-2.5 shadow-lg">
            {/* Left fade gradient */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#8B2A3B] to-transparent z-10" />
            {/* Right fade gradient */}
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#E25A2C] to-transparent z-10" />

            {/* Announcement label */}
            <div className="absolute left-0 top-0 bottom-0 flex items-center px-4 bg-white/10 backdrop-blur-sm z-20">
                <Bell className="h-4 w-4 mr-2 animate-pulse" />
                <span className="font-bold text-sm uppercase tracking-wider">Updates</span>
            </div>

            {/* Scrolling content */}
            <div className="flex animate-ticker whitespace-nowrap pl-32">
                {tickerContent.map((announcement, index) => {
                    const typeStyle = getTypeStyles(announcement.type);
                    const Icon = typeStyle.icon;

                    const content = (
                        <>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/20 mr-2">
                                <Icon className="h-3.5 w-3.5 mr-1" />
                                <span className="text-xs font-medium uppercase">{announcement.type}</span>
                            </span>
                            <span className="font-semibold mr-2">{announcement.title}:</span>
                            <span className="opacity-90">{announcement.message}</span>
                            <span className="mx-8 text-white/40">•</span>
                        </>
                    );

                    return announcement.link ? (
                        <a
                            key={`${announcement._id}-${index}`}
                            href={announcement.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center mx-8 hover:opacity-80 transition-opacity cursor-pointer"
                        >
                            {content}
                        </a>
                    ) : (
                        <div
                            key={`${announcement._id}-${index}`}
                            className="inline-flex items-center mx-8"
                        >
                            {content}
                        </div>
                    );
                })}
            </div>

            {/* CSS Animation */}
            <style>{`
                @keyframes ticker {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
                .animate-ticker {
                    animation: ticker 30s linear infinite;
                }
                .animate-ticker:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
};

export default AnnouncementTicker;
