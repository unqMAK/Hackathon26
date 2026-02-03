import { Trophy, Award, Medal, Gift, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PrizePool = () => {
    const prizes = [
        {
            rank: 'Winner',
            amount: '₹2,00,000',
            icon: Trophy,
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-400/20',
            borderColor: 'border-yellow-400/50',
            gradient: 'from-yellow-400/20 to-orange-500/20',
            glow: 'shadow-[0_0_30px_rgba(250,204,21,0.3)]'
        },
        {
            rank: 'Runner Up',
            amount: '₹1,00,000',
            icon: Medal,
            color: 'text-gray-300',
            bgColor: 'bg-gray-300/20',
            borderColor: 'border-gray-300/50',
            gradient: 'from-gray-300/20 to-slate-400/20',
            glow: 'shadow-[0_0_30px_rgba(209,213,219,0.3)]'
        }
    ];

    const consolationPrizes = [
        {
            title: 'Consolation Prize - I',
            amount: '₹50,000',
            icon: Gift,
            color: 'text-white'
        },
        {
            title: 'Consolation Prize - II',
            amount: '₹50,000',
            icon: Gift,
            color: 'text-white'
        }
    ];

    return (
        <section className="py-24 relative overflow-hidden bg-gradient-to-br from-[#4a1f2a] via-[#3d1a24] to-[#2d1218]">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#8B2A3B] rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#E25A2C] rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0YzAtMiAyLTQgMi00cy0yIDItNCAyYy0yIDAtNCAyLTQgNHMyLTQgMi00em0wIDEwYzAtMiAyLTQgMi00cy0yIDItNCAyYy0yIDAtNCAyLTQgNHMyLTQgMi00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-20 animate-slide-up">
                    <div className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-br from-[#8B2A3B] to-[#E25A2C] mb-6 shadow-lg animate-bounce-slow">
                        <Trophy className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black mb-6 text-white tracking-tight">
                        Prize Pool
                    </h2>

                </div>

                {/* Main Prizes */}
                <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
                    {/* Winner */}
                    <div className="transform hover:-translate-y-2 transition-all duration-500 relative">
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-bounce-slow z-20">
                            <Sparkles className="h-12 w-12 text-yellow-400 fill-yellow-400" />
                        </div>
                        <PrizeCard prize={prizes[0]} delay={0} />
                    </div>

                    {/* Runner Up */}
                    <div className="transform hover:-translate-y-2 transition-all duration-500">
                        <PrizeCard prize={prizes[1]} delay={0.2} />
                    </div>
                </div>

                {/* Consolation Prizes */}
                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-6">
                        {consolationPrizes.map((prize, index) => (
                            <div
                                key={index}
                                className="group relative animate-fade-in-up"
                                style={{ animationDelay: `${0.6 + (index * 0.1)}s` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#8B2A3B] to-[#E25A2C] rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                                <Card className="relative bg-black/40 backdrop-blur-md border-white/10 hover:border-[#E25A2C]/50 transition-all duration-300">
                                    <CardContent className="flex items-center justify-between p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8B2A3B] to-[#E25A2C] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                <Award className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-white group-hover:text-[#E25A2C] transition-colors">{prize.title}</h3>
                                                <p className="text-sm text-gray-400">Special Recognition</p>
                                            </div>
                                        </div>
                                        <div className="text-2xl font-bold text-white">
                                            {prize.amount}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

const PrizeCard = ({ prize, delay }: { prize: any, delay: number }) => (
    <div
        className="relative group animate-fade-in-up"
        style={{ animationDelay: `${delay}s` }}
    >
        <div className={`absolute inset-0 bg-gradient-to-b ${prize.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
        <Card className={`relative h-full border-2 ${prize.borderColor} bg-black/40 backdrop-blur-xl hover:bg-black/60 transition-all duration-500 overflow-hidden ${prize.glow}`}>
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${prize.gradient} opacity-50`}></div>
            <CardHeader className="text-center pb-4 pt-8">
                <div className={`mx-auto w-20 h-20 rounded-full ${prize.bgColor} border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl`}>
                    <prize.icon className={`h-10 w-10 ${prize.color} drop-shadow-lg`} />
                </div>
                <CardTitle className={`text-3xl font-black ${prize.color} tracking-wide`}>
                    {prize.rank}
                </CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-8">
                <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                    {prize.amount}
                </div>
                <div className="text-sm font-medium text-gray-400 uppercase tracking-widest">Cash Prize</div>
            </CardContent>
        </Card>
    </div>
);

export default PrizePool;
