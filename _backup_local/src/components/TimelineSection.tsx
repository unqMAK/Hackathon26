import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ChevronLeft, ChevronRight, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { timelineService, TimelineEvent } from '@/services/timelineService';

const TimelineSection = () => {
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await timelineService.getEvents();
                setEvents(data);
            } catch (error) {
                console.error('Failed to fetch timeline events:', error);
            }
        };
        fetchEvents();
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 350; // Adjust based on card width
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <section className="relative py-24 overflow-hidden min-h-[700px] flex flex-col justify-center bg-gradient-to-r from-[#8B2A3B] to-[#E25A2C]">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                {/* Header */}
                <div className="flex justify-between items-end mb-16 text-white">
                    <div>
                        <div className="flex items-center gap-3 mb-3 opacity-90">
                            <Calendar className="w-8 h-8" />
                            <span className="text-2xl font-bold tracking-wide">Event Timeline</span>
                        </div>
                        <div className="h-1.5 w-32 bg-orange-400 rounded-full shadow-lg" />
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => scroll('left')}
                            className="w-12 h-12 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm transition-all hover:scale-110"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => scroll('right')}
                            className="w-12 h-12 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm transition-all hover:scale-110"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </Button>
                    </div>
                </div>

                {/* Progress Line */}
                <div className="relative mb-24 mx-4 hidden md:block">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-white/20 -translate-y-1/2 rounded-full" />
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${events.length > 0 ? (events.filter(e => e.status === 'completed').length / events.length) * 100 + (events.find(e => e.status === 'active') ? (100 / events.length / 2) : 0) : 0}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute top-1/2 left-0 h-1 bg-orange-400 -translate-y-1/2 rounded-full shadow-[0_0_15px_rgba(251,146,60,0.6)]"
                    />
                </div>

                {/* Scrollable Cards Container */}
                <div
                    ref={scrollContainerRef}
                    className="flex gap-8 overflow-x-auto pb-12 px-4 snap-x snap-mandatory hide-scrollbar"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {events.map((event, index) => (
                        <motion.div
                            key={event._id || index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="snap-center shrink-0 py-4"
                        >
                            <Card className="w-[340px] md:w-[380px] h-full bg-white border-0 shadow-2xl rounded-3xl overflow-hidden hover:translate-y-[-8px] transition-transform duration-300 group">
                                <CardHeader className="p-8 pb-4 space-y-5">
                                    {/* Date and Status */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2 text-[#8B2A3B] font-bold text-lg">
                                            <Calendar className="w-5 h-5" />
                                            <span>{event.date}</span>
                                        </div>

                                        {/* Status Badge */}
                                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 uppercase tracking-wide shadow-sm ${event.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                event.status === 'active' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-600'
                                            }`}>
                                            {event.status === 'completed' ? (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Completed
                                                </>
                                            ) : event.status === 'active' ? (
                                                <>
                                                    <Circle className="w-4 h-4 fill-current animate-pulse" />
                                                    Active
                                                </>
                                            ) : (
                                                <>
                                                    <Circle className="w-4 h-4" />
                                                    Upcoming
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Time */}
                                    <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold bg-gray-50 w-fit px-3 py-1 rounded-lg">
                                        <Clock className="w-4 h-4" />
                                        {event.time}
                                    </div>
                                </CardHeader>

                                <CardContent className="p-8 pt-2">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#8B2A3B] transition-colors">
                                        {event.title}
                                    </h3>
                                    <p className="text-gray-600 text-base leading-relaxed line-clamp-3">
                                        {event.description}
                                    </p>
                                </CardContent>

                                <CardFooter className="p-8 pt-0 mt-auto">
                                    <a href="#" className="flex items-center text-sm font-bold text-gray-500 hover:text-[#8B2A3B] transition-colors group/link w-full">
                                        View Details
                                        <div className="ml-auto w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover/link:bg-[#8B2A3B] group-hover/link:text-white transition-all duration-300">
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </a>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TimelineSection;
