import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { countdownService } from '@/services/countdownService';
import { Loader2 } from 'lucide-react';

interface TimeRemaining {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const HeroCountdown = () => {
    const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);

    const { data: countdown, isLoading, isError } = useQuery({
        queryKey: ['countdown'],
        queryFn: countdownService.getCountdown,
        refetchInterval: 60000,
        retry: false,
    });

    useEffect(() => {
        if (!countdown) return;

        const calculateTimeRemaining = () => {
            const now = new Date().getTime();
            const target = new Date(countdown.targetDate).getTime();
            const difference = target - now;

            if (difference <= 0) {
                setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeRemaining({ days, hours, minutes, seconds });
        };

        calculateTimeRemaining();
        const interval = setInterval(calculateTimeRemaining, 1000);

        return () => clearInterval(interval);
    }, [countdown]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-white/50" />
            </div>
        );
    }

    if (isError || !countdown || !countdown.isActive) {
        return null;
    }

    const eventStarted = timeRemaining &&
        timeRemaining.days === 0 &&
        timeRemaining.hours === 0 &&
        timeRemaining.minutes === 0 &&
        timeRemaining.seconds === 0;

    if (eventStarted) {
        return (
            <div className="w-full py-8 animate-fade-in">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                        🎉 Hackathon Has Started! 🎉
                    </h2>
                    <p className="text-lg text-white/80 mt-2">
                        The wait is over. Let the innovation begin!
                    </p>
                </div>
            </div>
        );
    }

    const timeUnits = [
        { value: timeRemaining?.days || 0, label: 'DAYS' },
        { value: timeRemaining?.hours || 0, label: 'HOURS' },
        { value: timeRemaining?.minutes || 0, label: 'MINUTES' },
        { value: timeRemaining?.seconds || 0, label: 'SECONDS' },
    ];

    return (
        <div className="w-full py-4 animate-slide-up">
            {/* Title */}
            <p className="text-center text-sm md:text-base uppercase tracking-[0.25em] text-white/90 font-semibold mb-8">
                {countdown.title || 'HACKATHON STARTS'}
            </p>

            {/* Countdown Cards Container */}
            <div className="flex justify-center items-center gap-2 sm:gap-3 md:gap-4">
                {timeUnits.map((unit, index) => (
                    <div
                        key={unit.label}
                        className="animate-float"
                        style={{
                            animationDelay: `${index * 0.1}s`,
                            animationDuration: '3s'
                        }}
                    >
                        {/* Card */}
                        <div
                            className="relative w-16 sm:w-20 md:w-24 lg:w-28 h-20 sm:h-24 md:h-28 lg:h-32 rounded-lg overflow-hidden"
                            style={{
                                background: 'linear-gradient(180deg, #3d3d3d 0%, #2a2a2a 45%, #1a1a1a 55%, #0d0d0d 100%)',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            {/* Top highlight */}
                            <div
                                className="absolute top-0 left-0 right-0 h-[1px]"
                                style={{
                                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)'
                                }}
                            />

                            {/* Center divider line (flip-clock effect) */}
                            <div
                                className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 z-10"
                                style={{
                                    background: 'linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.8) 100%)',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.5)'
                                }}
                            />

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                {/* Number */}
                                <span
                                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-none"
                                    style={{
                                        background: 'linear-gradient(180deg, #ffffff 0%, #ffd700 25%, #ff8c00 60%, #ff6600 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        filter: 'drop-shadow(0 2px 4px rgba(255, 136, 0, 0.3))'
                                    }}
                                >
                                    {String(unit.value).padStart(2, '0')}
                                </span>

                                {/* Label */}
                                <span className="text-[8px] sm:text-[10px] md:text-xs uppercase tracking-widest text-gray-400 mt-1 md:mt-2 font-medium">
                                    {unit.label}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* University text */}
            <p className="text-center text-[10px] sm:text-xs text-white/40 mt-6 tracking-[0.2em] uppercase">
                MIT Vishwaprayag University
            </p>
        </div>
    );
};

export default HeroCountdown;
