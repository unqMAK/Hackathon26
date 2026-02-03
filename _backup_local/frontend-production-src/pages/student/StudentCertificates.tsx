import { useQuery } from '@tanstack/react-query';
import { getMyCertificates, downloadCertificate } from '@/services/certificateService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import DashboardLayout from '@/components/DashboardLayout';
import { getCurrentUser } from '@/lib/mockAuth';

const StudentCertificates = () => {
    const user = getCurrentUser();
    const { data: certificates = [], isLoading } = useQuery({
        queryKey: ['myCertificates'],
        queryFn: getMyCertificates
    });

    const handleDownload = async (id: string, category: string) => {
        try {
            const fileName = `Certificate-${category}.pdf`;
            await downloadCertificate(id, fileName);
        } catch (error) {
            // Error handled in service
        }
    };

    if (isLoading) return <DashboardLayout role={user?.role || 'student'}><div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div></DashboardLayout>;

    return (
        <DashboardLayout role={user?.role || 'student'}>
            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold text-gray-800">My Certificates</h1>

                {certificates.length === 0 ? (
                    <Card className="bg-gray-50 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                            <FileText className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700">No Certificates Yet</h3>
                            <p className="text-gray-500 max-w-sm mt-2">
                                Certificates will appear here once they are issued by the administrators.
                                Complete your participation to earn them!
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {certificates.map((cert: any) => (
                            <Card key={cert._id} className="hover:shadow-lg transition-shadow duration-300 overflow-hidden border-l-4 border-l-yellow-500">
                                <CardHeader className="bg-gray-50 pb-4">
                                    <div className="flex justify-between items-start">
                                        <Badge className="bg-blue-900 hover:bg-blue-800 uppercase tracking-wider">
                                            {cert.category}
                                        </Badge>
                                        <span className="text-xs text-gray-500 font-medium">
                                            {format(new Date(cert.issuedAt), 'MMM d, yyyy')}
                                        </span>
                                    </div>
                                    <CardTitle className="mt-2 text-xl text-gray-800">
                                        Certificate of {cert.category.charAt(0).toUpperCase() + cert.category.slice(1)}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="flex justify-center mb-6">
                                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                                            <FileText className="h-8 w-8" />
                                        </div>
                                    </div>
                                    <Button
                                        className="w-full bg-blue-900 hover:bg-blue-800"
                                        onClick={() => handleDownload(cert._id, cert.category)}
                                    >
                                        <Download className="mr-2 h-4 w-4" /> Download PDF
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default StudentCertificates;
