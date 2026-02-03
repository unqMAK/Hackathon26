import { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, CheckCircle, Crown, Sparkles, User as UserIcon } from 'lucide-react';
import { Team, User } from '@/types/team';
import { toast } from 'sonner';

interface MemberIDCardProps {
    member: User;
    team: Team;
    isLeader: boolean;
}

const MemberIDCard = ({ member, team, isLeader }: MemberIDCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // Prepare QR code data for individual member
    const qrData = JSON.stringify({
        name: member.name,
        email: member.email,
        role: isLeader ? 'Team Leader' : 'Team Member',
        teamName: team.name,
        teamId: team._id,
        institute: team.instituteName,
        instituteCode: team.instituteCode,
        participantId: member._id
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
            link.download = `${member.name.replace(/\s+/g, '_')}_HackSphere_ID.png`;
            link.href = dataUrl;
            link.click();

            toast.success(`${member.name}'s ID Card downloaded!`);
        } catch (error) {
            console.error('Failed to download:', error);
            toast.error('Failed to download ID card. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    // Get initials
    const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="relative">
            {/* Download Button */}
            <Button
                onClick={handleDownload}
                disabled={isDownloading}
                size="sm"
                className="absolute -top-2 -right-2 z-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
                <Download className="h-3 w-3 mr-1" />
                {isDownloading ? '...' : 'Download'}
            </Button>

            {/* ID Card */}
            <div
                ref={cardRef}
                className="w-[280px] bg-[#1a1a2e] rounded-xl overflow-hidden shadow-2xl"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
                {/* Card Header */}
                <div className="bg-[#6B1C23] p-3 text-center relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-16 h-16 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-12 h-12 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />

                    {/* MIT-VPU Logo */}
                    <div className="flex justify-center mb-1">
                        <img
                            src="/mit-vpu-logo.png"
                            alt="MIT Vishwaprayag University"
                            className="h-8 object-contain"
                        />
                    </div>

                    <div className="flex items-center justify-center gap-1">
                        <Sparkles className="h-3 w-3 text-yellow-300" />
                        <span className="text-[10px] font-bold text-white/90 tracking-widest uppercase">HackSphere 2025</span>
                        <Sparkles className="h-3 w-3 text-yellow-300" />
                    </div>
                </div>

                {/* Avatar Section */}
                <div className="flex justify-center pt-4 relative">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-xl border-4 border-[#1a1a2e] ${isLeader
                        ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500'
                        : 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500'
                        }`}>
                        {initials}
                    </div>
                    {isLeader && (
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                            <Crown className="h-5 w-5 text-yellow-400 drop-shadow-lg" />
                        </div>
                    )}
                </div>

                {/* Card Body */}
                <div className="p-4 pt-2 text-center">
                    {/* Name */}
                    <h2 className="text-lg font-bold text-white mb-1">{member.name}</h2>

                    {/* Role Badge */}
                    <Badge className={`mb-3 ${isLeader
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }`}>
                        {isLeader ? (
                            <><Crown className="h-3 w-3 mr-1" /> Team Leader</>
                        ) : (
                            <><UserIcon className="h-3 w-3 mr-1" /> Team Member</>
                        )}
                    </Badge>

                    {/* Team Info */}
                    <div className="bg-[#16162a] rounded-lg p-3 mb-3">
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Team</p>
                        <p className="text-sm font-semibold text-white">{team.name}</p>
                    </div>

                    {/* QR Code */}
                    <div className="flex justify-center mb-2">
                        <div className="bg-white p-2 rounded-lg shadow-lg">
                            <QRCodeSVG
                                value={qrData}
                                size={80}
                                level="M"
                                includeMargin={false}
                                bgColor="#ffffff"
                                fgColor="#1a1a2e"
                            />
                        </div>
                    </div>
                    <p className="text-[10px] text-gray-500">Scan for verification</p>
                </div>

                {/* Card Footer */}
                <div className="bg-[#6B1C23] px-3 py-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-white/70">{team.instituteCode}</p>
                        </div>
                        <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-300" />
                            <span className="text-[10px] text-white/90 font-medium">Verified</span>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-white/70">ID: {member._id.slice(-6).toUpperCase()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberIDCard;
