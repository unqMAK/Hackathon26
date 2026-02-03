import DashboardLayout from '@/components/DashboardLayout';
import { getCurrentUser } from '@/lib/mockAuth';
import { useMyTeam, useRequestTeamApproval } from '@/hooks/useTeam';
import TeamStatus from '@/components/student/TeamStatus';
import ProblemStatus from '@/components/student/ProblemStatus';
import SubmissionStats from '@/components/student/SubmissionStats';
import DeadlineCard from '@/components/student/DeadlineCard';
import ProgressCard from '@/components/student/ProgressCard';
import RecentUpdates from '@/components/student/RecentUpdates';
import StudentResultsCard from '@/components/StudentResultsCard';
import DashboardAnnouncements from '@/components/DashboardAnnouncements';
import StudentMentorCard from '@/components/student/StudentMentorCard';
import StudentFeedbackCard from '@/components/student/StudentFeedbackCard';
import { Button } from '@/components/ui/button';
import { UserPlus, Plus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// import PendingInvites from '@/components/student/PendingInvites'; // Removed

const StudentDashboardHome = () => {
    const user = getCurrentUser();
    const { data: myTeam } = useMyTeam();
    const requestApproval = useRequestTeamApproval();
    const navigate = useNavigate();

    return (
        <DashboardLayout role="student">
            <div className="space-y-6 animate-fade-in">
                {/* Pending Invites Section Removed */}


                {/* Welcome Section */}
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Student Dashboard</h2>
                    <p className="text-muted-foreground">
                        Welcome back, {user?.name || 'Student'}!
                        {!myTeam && ' You are not in a team yet.'}
                    </p>
                    {!myTeam && (
                        <div className="flex space-x-2 mt-4">
                            <Button onClick={() => navigate('/student/team')}>
                                <UserPlus className="mr-2 h-4 w-4" /> Join Team
                            </Button>
                            <Button variant="outline" onClick={() => navigate('/student/team')}>
                                <Plus className="mr-2 h-4 w-4" /> Create Team
                            </Button>
                        </div>
                    )}
                    {myTeam && myTeam.status === 'pending' && (
                        <div className="mt-4">
                            {myTeam.requestSent ? (
                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-md text-yellow-600 dark:text-yellow-400">
                                    <p className="font-medium">Approval Request Sent</p>
                                    <p className="text-sm opacity-90">
                                        Your team is waiting for SPOC approval. Request sent on {new Date(myTeam.requestedAt!).toLocaleDateString()}.
                                    </p>
                                </div>
                            ) : (
                                (typeof myTeam.leaderId === 'object' && (myTeam.leaderId as any)._id === user?.id) || myTeam.leaderId === user?.id ? (
                                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-md">
                                        <h3 className="font-medium text-blue-600 dark:text-blue-400 mb-2">Team Action Required</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Your team is currently pending. You must request approval from your Institute SPOC to proceed.
                                        </p>
                                        <Button
                                            onClick={() => requestApproval.mutate(myTeam._id)}
                                            disabled={requestApproval.isPending}
                                            className="bg-primary text-white shadow-md hover:bg-primary/80"
                                        >
                                            {requestApproval.isPending ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Sending Request...
                                                </>
                                            ) : (
                                                'Request SPOC Approval'
                                            )}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-md text-orange-600 dark:text-orange-400">
                                        <p className="font-medium">Team Not Approved</p>
                                        <p className="text-sm opacity-90">
                                            Your team has not been approved yet. The team leader needs to request approval from the SPOC.
                                        </p>
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    {myTeam && myTeam.status === 'rejected' && (
                        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-md">
                            <h3 className="font-medium text-red-600 dark:text-red-400 mb-2">Team Rejected</h3>
                            <p className="text-sm text-foreground mb-4">
                                Your team was rejected by the SPOC.
                                {myTeam.spocNotes && (
                                    <span className="block mt-1 font-medium bg-red-100 p-2 rounded text-red-800 dark:bg-red-900/30 dark:text-red-200">
                                        Rejection Reason: {myTeam.spocNotes}
                                    </span>
                                )}
                            </p>
                            {((typeof myTeam.leaderId === 'object' && ((myTeam.leaderId as any)._id === user?.id || (myTeam.leaderId as any)._id === (user as any)?._id)) || myTeam.leaderId === user?.id || myTeam.leaderId === (user as any)?._id) && (
                                <div className="mt-4">
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Please address the issues mentioned and request approval again.
                                    </p>
                                    <Button
                                        onClick={() => requestApproval.mutate(myTeam._id)}
                                        disabled={requestApproval.isPending}
                                        variant="default"
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                        {requestApproval.isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Sending Request...
                                            </>
                                        ) : (
                                            'Re-request Approval'
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Announcements Widget */}
                <DashboardAnnouncements />

                {/* Results Card - Shows when results are published */}
                {myTeam && myTeam.status === 'approved' && (
                    <StudentResultsCard />
                )}

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <TeamStatus />
                    <ProblemStatus />
                    <SubmissionStats />
                    <DeadlineCard />
                </div>

                {/* Mentor and Feedback Section */}
                {myTeam && myTeam.status === 'approved' && (
                    <div className="grid gap-4 md:grid-cols-2">
                        <StudentMentorCard team={myTeam} />
                        <StudentFeedbackCard team={myTeam} />
                    </div>
                )}

                {/* Progress and Updates */}
                <div className="grid gap-4 md:grid-cols-2">
                    <ProgressCard />
                    <RecentUpdates />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StudentDashboardHome;
