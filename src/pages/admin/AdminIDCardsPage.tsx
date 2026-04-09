import { useState, useRef, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Search, Download, CreditCard, Users, CheckCircle, Sparkles,
    Crown, Loader2, Package, Filter,
} from 'lucide-react';
import { useTeams } from '@/hooks/useMockData';
import { Team, User } from '@/types/team';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';

type FilterMode = 'qualified' | 'all' | 'disabled';

const AdminIDCardsPage = () => {
    const { data: allTeams = [], isLoading } = useTeams();
    const [filterMode, setFilterMode] = useState<FilterMode>('qualified');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTeamIds, setSelectedTeamIds] = useState<Set<string>>(new Set());
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, teamName: '' });
    const renderRef = useRef<HTMLDivElement>(null);

    // Filter teams based on mode
    const filteredTeams = allTeams
        .filter((team: Team) => {
            if (filterMode === 'qualified') return team.status === 'approved' && !team.isDisabled;
            if (filterMode === 'disabled') return team.isDisabled;
            return true; // 'all'
        })
        .filter((team: Team) =>
            team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            team.instituteName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            team.instituteCode?.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const qualifiedCount = allTeams.filter((t: Team) => t.status === 'approved' && !t.isDisabled).length;
    const disabledCount = allTeams.filter((t: Team) => t.isDisabled).length;

    // Selection handlers
    const toggleTeam = (teamId: string) => {
        setSelectedTeamIds(prev => {
            const next = new Set(prev);
            if (next.has(teamId)) next.delete(teamId);
            else next.add(teamId);
            return next;
        });
    };

    const selectAll = () => {
        setSelectedTeamIds(new Set(filteredTeams.map((t: Team) => t._id)));
    };

    const deselectAll = () => {
        setSelectedTeamIds(new Set());
    };

    const isAllSelected = filteredTeams.length > 0 && filteredTeams.every((t: Team) => selectedTeamIds.has(t._id));

    // Helper: render a hidden element to PNG
    const renderToPng = async (element: HTMLElement): Promise<string> => {
        return toPng(element, {
            quality: 1.0,
            pixelRatio: 3,
            backgroundColor: '#1a1a2e',
        });
    };

    // Generate ZIP with all selected team + member ID cards
    const handleDownloadZip = useCallback(async () => {
        if (selectedTeamIds.size === 0) {
            toast.error('Please select at least one team');
            return;
        }

        const selectedTeams = allTeams.filter((t: Team) => selectedTeamIds.has(t._id));
        setIsGenerating(true);
        setProgress({ current: 0, total: selectedTeams.length, teamName: '' });

        const zip = new JSZip();

        try {
            for (let i = 0; i < selectedTeams.length; i++) {
                const team = selectedTeams[i];
                const safeName = team.name.replace(/[^a-zA-Z0-9_\- ]/g, '').trim();
                setProgress({ current: i + 1, total: selectedTeams.length, teamName: team.name });

                const teamFolder = zip.folder(safeName);
                if (!teamFolder) continue;

                // Render team card
                const teamCardEl = document.getElementById(`team-card-${team._id}`);
                if (teamCardEl) {
                    try {
                        const teamPng = await renderToPng(teamCardEl);
                        const teamData = teamPng.split(',')[1];
                        teamFolder.file(`${safeName}_Team_Card.png`, teamData, { base64: true });
                    } catch (err) {
                        console.error(`Failed to render team card for ${team.name}:`, err);
                    }
                }

                // Render member cards
                for (const member of team.members || []) {
                    const memberEl = document.getElementById(`member-card-${team._id}-${member._id}`);
                    if (memberEl) {
                        try {
                            const memberPng = await renderToPng(memberEl);
                            const memberData = memberPng.split(',')[1];
                            const memberName = member.name.replace(/[^a-zA-Z0-9_\- ]/g, '').trim();
                            teamFolder.file(`${memberName}_ID.png`, memberData, { base64: true });
                        } catch (err) {
                            console.error(`Failed to render member card for ${member.name}:`, err);
                        }
                    }
                }

                // Small delay to prevent browser hang
                await new Promise(r => setTimeout(r, 50));
            }

            const blob = await zip.generateAsync({ type: 'blob' });
            saveAs(blob, `SAMVED_ID_Cards_${new Date().toISOString().slice(0, 10)}.zip`);
            toast.success(`Downloaded ${selectedTeams.length} team ID cards!`);
        } catch (error) {
            console.error('ZIP generation failed:', error);
            toast.error('Failed to generate ZIP. Please try again.');
        } finally {
            setIsGenerating(false);
            setProgress({ current: 0, total: 0, teamName: '' });
        }
    }, [selectedTeamIds, allTeams]);

    const isLeader = (team: Team, member: User) => {
        return member._id === team.leaderId ||
            (typeof team.leaderId === 'object' && member._id === (team.leaderId as User)._id);
    };

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <CreditCard className="h-8 w-8 text-purple-600" />
                            ID Card Manager
                        </h2>
                        <p className="text-muted-foreground">Download team and member ID cards in bulk as a ZIP file.</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-blue-50/50 border-blue-100">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Teams</p>
                                <p className="text-2xl font-bold">{allTeams.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50/50 border-green-100">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Qualified Teams</p>
                                <p className="text-2xl font-bold text-green-600">{qualifiedCount}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-50/50 border-red-100">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <Users className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Disabled Teams</p>
                                <p className="text-2xl font-bold text-red-600">{disabledCount}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-50/50 border-purple-100">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <CreditCard className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Selected</p>
                                <p className="text-2xl font-bold text-purple-600">{selectedTeamIds.size}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Controls */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filter & Select Teams
                        </CardTitle>
                        <CardDescription>Choose which teams' ID cards to download.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Filter:</span>
                                <Select value={filterMode} onValueChange={(v: FilterMode) => { setFilterMode(v); setSelectedTeamIds(new Set()); }}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="qualified">✅ Qualified Only ({qualifiedCount})</SelectItem>
                                        <SelectItem value="all">📋 All Teams ({allTeams.length})</SelectItem>
                                        <SelectItem value="disabled">🚫 Disabled Only ({disabledCount})</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or institute..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={selectAll}>
                                    Select All ({filteredTeams.length})
                                </Button>
                                <Button variant="outline" size="sm" onClick={deselectAll}>
                                    Deselect All
                                </Button>
                            </div>

                            <Button
                                onClick={handleDownloadZip}
                                disabled={isGenerating || selectedTeamIds.size === 0}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Generating... ({progress.current}/{progress.total})
                                    </>
                                ) : (
                                    <>
                                        <Package className="h-4 w-4 mr-2" />
                                        Download ZIP ({selectedTeamIds.size} teams)
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Progress bar */}
                        {isGenerating && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Rendering: {progress.teamName}</span>
                                    <span>{progress.current}/{progress.total}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2.5 rounded-full transition-all"
                                        style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Team table */}
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-10">
                                        <Checkbox
                                            checked={isAllSelected}
                                            onCheckedChange={(checked) => checked ? selectAll() : deselectAll()}
                                        />
                                    </TableHead>
                                    <TableHead>Team Name</TableHead>
                                    <TableHead>Institute</TableHead>
                                    <TableHead>Members</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10">
                                            <Loader2 className="animate-spin h-5 w-5 mx-auto mb-2" />
                                            Loading teams...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredTeams.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                            No teams found matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : filteredTeams.map((team: Team) => (
                                    <TableRow
                                        key={team._id}
                                        className={`cursor-pointer hover:bg-muted/50 ${selectedTeamIds.has(team._id) ? 'bg-purple-50' : ''}`}
                                        onClick={() => toggleTeam(team._id)}
                                    >
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                checked={selectedTeamIds.has(team._id)}
                                                onCheckedChange={() => toggleTeam(team._id)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-bold">{team.name}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{team.instituteName}</span>
                                                <span className="text-[10px] text-muted-foreground font-mono">{team.instituteCode}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{team.members?.length || 0} members</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                <Badge
                                                    variant={team.status === 'approved' ? 'default' : team.status === 'rejected' ? 'destructive' : 'secondary'}
                                                    className="capitalize"
                                                >
                                                    {team.status}
                                                </Badge>
                                                {team.isDisabled && (
                                                    <Badge variant="destructive" className="bg-red-600 text-white text-[10px]">
                                                        Disabled
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Hidden off-screen rendering area for all selected teams */}
            <div
                ref={renderRef}
                style={{
                    position: 'fixed',
                    left: '-9999px',
                    top: 0,
                    zIndex: -1,
                    opacity: 0,
                    pointerEvents: 'none',
                }}
            >
                {allTeams
                    .filter((t: Team) => selectedTeamIds.has(t._id))
                    .map((team: Team) => (
                        <div key={team._id} className="mb-8">
                            {/* Team Card */}
                            <div
                                id={`team-card-${team._id}`}
                                className="w-[400px] bg-[#1a1a2e] rounded-2xl overflow-hidden shadow-2xl"
                                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                            >
                                <div className="bg-[#6B1C23] p-4 text-center relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-20 h-20 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2" />
                                    <div className="flex justify-center mb-2">
                                        <img src="/mit-vpu-logo.png" alt="MIT Vishwaprayag University" className="h-12 object-contain" />
                                    </div>
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <Sparkles className="h-4 w-4 text-yellow-300" />
                                        <span className="text-xs font-bold text-white/90 tracking-widest uppercase">SAMVED 2026</span>
                                        <Sparkles className="h-4 w-4 text-yellow-300" />
                                    </div>
                                    <h1 className="text-xl font-black text-white tracking-tight">{team.name}</h1>
                                    <Badge className="mt-2 bg-white/20 text-white border-white/30 backdrop-blur-sm">
                                        <CheckCircle className="h-3 w-3 mr-1" /> Verified Participant
                                    </Badge>
                                </div>
                                <div className="p-5">
                                    <div className="text-center mb-4">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider">Institute</p>
                                        <p className="text-sm font-semibold text-white">{team.instituteName}</p>
                                        <p className="text-xs text-cyan-400">{team.instituteCode}</p>
                                    </div>
                                    <div className="flex justify-center mb-4">
                                        <div className="bg-white p-3 rounded-xl shadow-lg">
                                            <QRCodeSVG
                                                value={JSON.stringify({
                                                    teamName: team.name,
                                                    teamId: team._id,
                                                    institute: team.instituteName,
                                                    instituteCode: team.instituteCode,
                                                    members: (team.members || []).map((m: User) => ({ name: m.name, email: m.email })),
                                                    problemId: team.problemId?._id || team.problemId,
                                                })}
                                                size={120}
                                                level="M"
                                                includeMargin={false}
                                                bgColor="#ffffff"
                                                fgColor="#1a1a2e"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-center text-xs text-gray-500 mb-4">Scan for team details</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Users className="h-4 w-4 text-cyan-400" />
                                            <span className="text-xs font-bold text-white uppercase tracking-wider">Team Members</span>
                                        </div>
                                        <div className="bg-[#16162a] rounded-xl p-3 space-y-2">
                                            {(team.members || []).slice(0, 6).map((member: User, index: number) => {
                                                const memberIsLeader = isLeader(team, member);
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

                            {/* Member Cards */}
                            {(team.members || []).map((member: User) => {
                                const memberIsLeader = isLeader(team, member);
                                const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                                return (
                                    <div
                                        key={member._id}
                                        id={`member-card-${team._id}-${member._id}`}
                                        className="w-[280px] bg-[#1a1a2e] rounded-xl overflow-hidden shadow-2xl mt-4"
                                        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                                    >
                                        <div className="bg-[#6B1C23] p-3 text-center relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-16 h-16 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                                            <div className="absolute bottom-0 right-0 w-12 h-12 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />
                                            <div className="flex justify-center mb-1">
                                                <img src="/mit-vpu-logo.png" alt="MIT Vishwaprayag University" className="h-8 object-contain" />
                                            </div>
                                            <div className="flex items-center justify-center gap-1">
                                                <Sparkles className="h-3 w-3 text-yellow-300" />
                                                <span className="text-[10px] font-bold text-white/90 tracking-widest uppercase">SAMVED 2026</span>
                                                <Sparkles className="h-3 w-3 text-yellow-300" />
                                            </div>
                                        </div>
                                        <div className="flex justify-center pt-4 relative">
                                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-xl border-4 border-[#1a1a2e] ${memberIsLeader
                                                ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500'
                                                : 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500'
                                                }`}>
                                                {initials}
                                            </div>
                                            {memberIsLeader && (
                                                <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                                                    <Crown className="h-5 w-5 text-yellow-400 drop-shadow-lg" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 pt-2 text-center">
                                            <h2 className="text-lg font-bold text-white mb-1">{member.name}</h2>
                                            <Badge className={`mb-3 ${memberIsLeader
                                                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                                : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                                }`}>
                                                {memberIsLeader ? (
                                                    <><Crown className="h-3 w-3 mr-1" /> Team Leader</>
                                                ) : (
                                                    <><Users className="h-3 w-3 mr-1" /> Team Member</>
                                                )}
                                            </Badge>
                                            <div className="bg-[#16162a] rounded-lg p-3 mb-3">
                                                <p className="text-xs text-gray-400 uppercase tracking-wider">Team</p>
                                                <p className="text-sm font-semibold text-white">{team.name}</p>
                                            </div>
                                            <div className="flex justify-center mb-2">
                                                <div className="bg-white p-2 rounded-lg shadow-lg">
                                                    <QRCodeSVG
                                                        value={JSON.stringify({
                                                            name: member.name,
                                                            email: member.email,
                                                            role: memberIsLeader ? 'Team Leader' : 'Team Member',
                                                            teamName: team.name,
                                                            teamId: team._id,
                                                            institute: team.instituteName,
                                                            participantId: member._id,
                                                        })}
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
                                        <div className="bg-[#6B1C23] px-3 py-2">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] text-white/70">{team.instituteCode}</p>
                                                <div className="flex items-center gap-1">
                                                    <CheckCircle className="h-3 w-3 text-green-300" />
                                                    <span className="text-[10px] text-white/90 font-medium">Verified</span>
                                                </div>
                                                <p className="text-[10px] text-white/70">ID: {member._id.slice(-6).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
            </div>
        </DashboardLayout>
    );
};

export default AdminIDCardsPage;
