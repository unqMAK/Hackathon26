import { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, CheckCircle, Users, Sparkles, CreditCard } from 'lucide-react';
import { Team, User } from '@/types/team';
import { toast } from 'sonner';
import MemberIDCard from './MemberIDCard';

interface TeamIDCardProps {
    team: Team;
}

const TeamIDCard = ({ team }: TeamIDCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // Only show for approved teams
    if (team.status !== 'approved') {
        return (
            <Card className="border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20">
                <CardContent className="p-6 text-center">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 text-yellow-600 opacity-50" />
                    <h3 className="font-bold text-lg text-yellow-700 dark:text-yellow-400 mb-2">Team Pending Approval</h3>
                    <p className="text-muted-foreground">Your team ID cards will be available once your team is approved by the SPOC.</p>
                </CardContent>
            </Card>
        );
    }

    // Prepare QR code data
    const qrData = JSON.stringify({
        teamName: team.name,
        teamId: team._id,
        institute: team.instituteName,
        instituteCode: team.instituteCode,
        members: team.members.map((m: User) => ({
            name: m.name,
            email: m.email
        })),
        problemId: team.problemId?._id || team.problemId,
        approvedAt: team.updatedAt
    });

    const handleDownload = async () => {
        if (!cardRef.current) return;

        setIsDownloading(true);
        try {
            const dataUrl = await toPng(cardRef.current, {
                quality: 1.0,
                pixelRatio: 3,
                backgroundColor: '#1a1a2e'
            });

            const link = document.createElement('a');
            link.download = `${team.name.replace(/\s+/g, '_')}_ID_Card.png`;
            link.href = dataUrl;
            link.click();

            toast.success('Team ID Card downloaded successfully!');
        } catch (error) {
            console.error('Failed to download:', error);
            toast.error('Failed to download ID card. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    const isLeader = (member: User) => {
        return member._id === team.leaderId ||
            (typeof team.leaderId === 'object' && member._id === (team.leaderId as User)._id);
    };

    return (
        <div className="space-y-8">
            {/* Team ID Card Section */}
            <Card className="overflow-hidden border-2 border-green-500/30 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <h3 className="font-bold text-lg text-green-700 dark:text-green-400">Team Approved!</h3>
                        </div>
                        <Button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            {isDownloading ? 'Downloading...' : 'Download Team Card'}
                        </Button>
                    </div>

                    {/* ID Card Preview */}
                    <div className="flex justify-center">
                        <div
                            ref={cardRef}
                            className="w-[400px] bg-[#1a1a2e] rounded-2xl overflow-hidden shadow-2xl"
                            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                        >
                            {/* Card Header */}
                            <div className="bg-[#6B1C23] p-4 text-center relative overflow-hidden">
                                {/* Decorative Elements */}
                                <div className="absolute top-0 left-0 w-20 h-20 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                                <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2" />

                                {/* MIT-VPU Logo */}
                                <div className="flex justify-center mb-2">
                                    <img
                                        src="/mit-vpu-logo.png"
                                        alt="MIT Vishwaprayag University"
                                        className="h-12 object-contain"
                                    />
                                </div>

                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <Sparkles className="h-4 w-4 text-yellow-300" />
                                    <span className="text-xs font-bold text-white/90 tracking-widest uppercase">HackSphere 2025</span>
                                    <Sparkles className="h-4 w-4 text-yellow-300" />
                                </div>
                                <h1 className="text-xl font-black text-white tracking-tight">{team.name}</h1>
                                <Badge className="mt-2 bg-white/20 text-white border-white/30 backdrop-blur-sm">
                                    <CheckCircle className="h-3 w-3 mr-1" /> Verified Participant
                                </Badge>
                            </div>

                            {/* Card Body */}
                            <div className="p-5">
                                {/* Institute Info */}
                                <div className="text-center mb-4">
                                    <p className="text-xs text-gray-400 uppercase tracking-wider">Institute</p>
                                    <p className="text-sm font-semibold text-white">{team.instituteName}</p>
                                    <p className="text-xs text-cyan-400">{team.instituteCode}</p>
                                </div>

                                {/* QR Code Section */}
                                <div className="flex justify-center mb-4">
                                    <div className="bg-white p-3 rounded-xl shadow-lg">
                                        <QRCodeSVG
                                            value={qrData}
                                            size={120}
                                            level="M"
                                            includeMargin={false}
                                            bgColor="#ffffff"
                                            fgColor="#1a1a2e"
                                        />
                                    </div>
                                </div>
                                <p className="text-center text-xs text-gray-500 mb-4">Scan for team details</p>

                                {/* Team Members */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users className="h-4 w-4 text-cyan-400" />
                                        <span className="text-xs font-bold text-white uppercase tracking-wider">Team Members</span>
                                    </div>
                                    <div className="bg-[#16162a] rounded-xl p-3 space-y-2">
                                        {team.members.slice(0, 6).map((member: User, index: number) => {
                                            const memberIsLeader = isLeader(member);
                                            return (
                                                <div
                                                    key={member._id}
                                                    className={`flex items-center justify-between py-1.5 px-2 rounded-lg ${memberIsLeader ? 'bg-yellow-500/10' : ''}`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${memberIsLeader
                                                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                                                            : 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
                                                            }`}>
                                                            {index + 1}
                                                        </div>
                                                        <span className="text-sm text-white font-medium">{member.name}</span>
                                                    </div>
                                                    {memberIsLeader && (
                                                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs py-0">
                                                            Leader
                                                        </Badge>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className="bg-[#6B1C23] px-4 py-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-white/70">MIT Vishwaprayag University</p>
                                        <p className="text-xs text-white/50">Solapur, Maharashtra</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-white/70">hacksphere.mitvpu.edu.in</p>
                                        <p className="text-xs text-white/50">ID: {team._id.slice(-8).toUpperCase()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Individual Member ID Cards Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        Individual Member ID Cards
                    </CardTitle>
                    <CardDescription>
                        Download individual ID cards for each team member
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {team.members.map((member: User) => (
                            <div key={member._id} className="flex justify-center">
                                <MemberIDCard
                                    member={member}
                                    team={team}
                                    isLeader={isLeader(member)}
                                />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TeamIDCard;
