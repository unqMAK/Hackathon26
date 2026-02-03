import DashboardLayout from '@/components/DashboardLayout';
import AdminCountdown from '@/components/admin/AdminCountdown';

const AdminCountdownPage = () => {
    return (
        <DashboardLayout role="admin">
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Countdown Timer</h2>
                    <p className="text-muted-foreground">
                        Manage the homepage countdown timer.
                    </p>
                </div>

                <AdminCountdown />
            </div>
        </DashboardLayout>
    );
};

export default AdminCountdownPage;
