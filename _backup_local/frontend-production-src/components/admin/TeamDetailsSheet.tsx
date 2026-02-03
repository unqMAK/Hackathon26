import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Users,
    Target,
    CheckCircle,
    User as UserIcon,
    School,
    Clock,
    FileText,
    ExternalLink,
    Check,
    X,
    MessageSquare,
    ShieldAlert,
    AlertCircle,
    Copy
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTeamDetails } from "@/services/mentorService";
import { adminService } from "@/services/adminService";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Team } from "@/types/team";

interface TeamDetailsSheetProps {
    teamId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const TeamDetailsSheet = ({ teamId, open, onOpenChange }: TeamDetailsSheetProps) => {
    const queryClient = useQueryClient();
    const [rejectionReason, setRejectionReason] = useState("");
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [approvedCredentials, setApprovedCredentials] = useState<any>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['teamDetails', teamId],
        queryFn: () => getTeamDetails(teamId!),
        enabled: !!teamId && open
    });

    const approveMutation = useMutation({
        mutationFn: (id: string) => adminService.approveTeam(id),
        onSuccess: (response: any) => {
            toast.success("Team approved successfully");
            setApprovedCredentials(response.credentials);
            queryClient.invalidateQueries({ queryKey: ['teamDetails'] });
            queryClient.invalidateQueries({ queryKey: ['teams'] });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Approval failed")
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string, reason: string }) => adminService.rejectTeam(id, reason),
        onSuccess: () => {
            toast.success("Team rejected");
            queryClient.invalidateQueries({ queryKey: ['teamDetails'] });
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            onOpenChange(false);
            setShowRejectForm(false);
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Rejection failed")
    });

    const team: Team = data?.team;
    const spoc = data?.spoc;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
            case 'rejected':
                return <Badge variant="destructive"><X className="w-3 h-3 mr-1" /> Rejected</Badge>;
            default:
                return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    if (!teamId) return null;

    // CREDENTIALS VIEW
    if (approvedCredentials) {
        return (
            <Sheet open={open} onOpenChange={(val) => {
                if (!val) setApprovedCredentials(null);
                onOpenChange(val);
            }}>
                <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0">
                    <SheetHeader className="p-6 bg-green-600 text-white rounded-t-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-full">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <SheetTitle className="text-white">Approval Successful!</SheetTitle>
                                <SheetDescription className="text-green-100">
                                    All accounts have been provisioned. Please share these credentials.
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>

                    <ScrollArea className="flex-1 p-6">
                        <div className="space-y-6">
                            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-3">
                                <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-800">
                                    <strong>Important:</strong> These passwords are only shown once. Copy them now to share with the team members.
                                </p>
                            </div>

                            {/* SPOC & Mentor */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-4 border rounded-lg space-y-3 bg-slate-50">
                                    <h4 className="text-xs font-bold uppercase text-muted-foreground font-mono">Institutional Contacts</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-sm p-2 bg-white border border-slate-100 rounded">
                                            <span className="truncate mr-2">SPOC: {approvedCredentials.spoc.email}</span>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="font-mono text-[11px]">{approvedCredentials.spoc.password}</Badge>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(`${approvedCredentials.spoc.email} / ${approvedCredentials.spoc.password}`)}>
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-sm p-2 bg-white border border-slate-100 rounded">
                                            <span className="truncate mr-2">Mentor: {approvedCredentials.mentor.email}</span>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="font-mono text-[11px]">{approvedCredentials.mentor.password}</Badge>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(`${approvedCredentials.mentor.email} / ${approvedCredentials.mentor.password}`)}>
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 border rounded-lg space-y-3">
                                    <h4 className="text-xs font-bold uppercase text-muted-foreground font-mono">Student Members</h4>
                                    <div className="space-y-2">
                                        {approvedCredentials.students.map((cred: string, i: number) => {
                                            const [email, pass] = cred.split(': ');
                                            return (
                                                <div key={i} className="flex justify-between items-center text-sm p-2 bg-slate-50/50 border border-slate-100 rounded">
                                                    <span className="truncate max-w-[200px] mr-2">{email}</span>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="font-mono text-[11px] border-blue-200 text-blue-700">{pass}</Badge>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(`${email} / ${pass}`)}>
                                                            <Copy className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    <SheetFooter className="p-6 border-t bg-slate-50">
                        <Button className="w-full bg-slate-900 text-white" onClick={() => onOpenChange(false)}>
                            Done, I've Copied These
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0">
                <SheetHeader className="p-6 pb-0">
                    <SheetTitle>Team Verification Portal</SheetTitle>
                    <SheetDescription>
                        Review team details and verify the official consent letter.
                    </SheetDescription>
                </SheetHeader>

                {isLoading ? (
                    <div className="flex flex-1 justify-center items-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : team ? (
                    <>
                        <ScrollArea className="flex-1 p-6 pt-2">
                            <div className="space-y-6">
                                {/* Header Info */}
                                <div className="space-y-1 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <h3 className="text-2xl font-bold text-slate-900">{team.name}</h3>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <School className="h-4 w-4" />
                                        <span className="text-sm font-medium">{team.instituteName} ({team.instituteCode})</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-3">
                                        {getStatusBadge(team.status)}
                                        <Badge variant="outline" className="bg-white">Ref: {team._id.slice(-6).toUpperCase()}</Badge>
                                    </div>
                                </div>

                                {/* Consent Letter Review */}
                                <Card className="border-blue-200 bg-blue-50/50 shadow-none">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-800">
                                            <FileText className="h-4 w-4" /> Official Consent Letter
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between p-3 bg-white border border-blue-100 rounded-md">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-5 w-5 text-blue-500" />
                                                <span className="text-sm font-medium truncate max-w-[200px]">ConsentLetter.pdf</span>
                                            </div>
                                            <Button variant="outline" size="sm" asChild className="gap-2">
                                                <a
                                                    href={team.consentFile}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    View Letter <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </Button>
                                        </div>
                                        <p className="text-[10px] text-blue-600 mt-2 italic flex items-center gap-1">
                                            <ShieldAlert className="h-3 w-3" />
                                            Admin: Ensure name matching between letter and form.
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* People Section */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Card className="shadow-none">
                                        <CardHeader className="pb-1 p-3">
                                            <CardTitle className="text-[10px] uppercase text-muted-foreground font-bold font-mono">SPOC Details</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-3 pt-0">
                                            <p className="text-sm font-bold">{team.spocName}</p>
                                            <p className="text-[10px] text-muted-foreground">{team.spocEmail}</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="shadow-none">
                                        <CardHeader className="pb-1 p-3">
                                            <CardTitle className="text-[10px] uppercase text-muted-foreground font-bold font-mono">Mentor Details</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-3 pt-0">
                                            <p className="text-sm font-bold">{team.mentorName}</p>
                                            <p className="text-[10px] text-muted-foreground">{team.mentorEmail}</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Members */}
                                <Card className="shadow-none border-dashed">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center gap-2 text-sm font-bold">
                                            <Users className="h-4 w-4" /> Team Constitution
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <div className="space-y-2">
                                            {/* Leader */}
                                            <div className="flex items-center justify-between text-sm bg-blue-50/50 p-2 rounded border border-blue-100">
                                                <div className="flex flex-col">
                                                    <span className="font-bold flex items-center gap-1">
                                                        {(team.leaderId as any)?.name}
                                                        <Badge variant="outline" className="text-[8px] h-4 leading-none bg-blue-600 text-white border-none">LEADER</Badge>
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">{(team.leaderId as any)?.email}</span>
                                                </div>
                                            </div>
                                            {/* Members */}
                                            {team.pendingMembers?.map((member, i) => (
                                                <div key={i} className="flex items-center justify-between text-sm bg-slate-50 p-2 rounded border border-slate-100">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{member.name}</span>
                                                        <span className="text-[10px] text-muted-foreground">{member.email}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {team.rejectionReason && (
                                    <Card className="bg-red-50 border-red-100 shadow-none">
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-2 text-red-800 text-sm">
                                                <MessageSquare className="h-4 w-4 mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="font-bold">Rejection Reason</p>
                                                    <p>{team.rejectionReason}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </ScrollArea>

                        {/* Admin Actions */}
                        {team.status === 'pending' && (
                            <SheetFooter className="p-6 border-t bg-slate-50/80">
                                {!showRejectForm ? (
                                    <div className="flex flex-col w-full gap-3">
                                        <Button
                                            className="w-full bg-green-600 hover:bg-green-700 shadow-lg shadow-green-100"
                                            size="lg"
                                            onClick={() => approveMutation.mutate(team._id)}
                                            disabled={approveMutation.isPending}
                                        >
                                            {approveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                                            Approve & Create All Accounts
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full border-red-200 text-red-600 hover:bg-red-50"
                                            onClick={() => setShowRejectForm(true)}
                                        >
                                            <X className="w-4 h-4 mr-2" /> Reject Team Registration
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col w-full gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="reason">Reason for Rejection</Label>
                                            <Input
                                                id="reason"
                                                placeholder="e.g. Consent letter signature missing"
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                className="flex-1"
                                                onClick={() => setShowRejectForm(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                className="flex-1 bg-red-600 hover:bg-red-700"
                                                onClick={() => rejectMutation.mutate({ id: team._id, reason: rejectionReason })}
                                                disabled={!rejectionReason || rejectMutation.isPending}
                                            >
                                                Confirm Rejection
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </SheetFooter>
                        )}
                    </>
                ) : (
                    <div className="text-center py-8 text-muted-foreground flex flex-1 flex-col justify-center items-center gap-2">
                        <Users className="h-12 w-12 text-slate-200" />
                        Team data could not be retrieved.
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};
