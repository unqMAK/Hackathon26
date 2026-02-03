import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { generateCertificates } from '@/services/certificateService';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import DashboardLayout from '@/components/DashboardLayout';

const AdminGenerateCertificates = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>('participation');
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
    const [generationResults, setGenerationResults] = useState<any>(null);

    // Fetch Users and Teams
    const { data: users = [] } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const { data } = await api.get('/users');
            return data;
        }
    });

    const { data: teams = [] } = useQuery({
        queryKey: ['teams'],
        queryFn: async () => {
            const { data } = await api.get('/teams');
            return data;
        }
    });

    const mutation = useMutation({
        mutationFn: generateCertificates,
        onSuccess: (data) => {
            toast.success(data.message);
            setGenerationResults(data);
            setSelectedUserIds([]);
            setSelectedTeamIds([]);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Generation failed');
        }
    });

    const handleGenerate = () => {
        if (selectedUserIds.length === 0 && selectedTeamIds.length === 0) {
            toast.error('Please select at least one user or team');
            return;
        }

        mutation.mutate({
            category: selectedCategory,
            userIds: selectedUserIds,
            teamIds: selectedTeamIds
        });
    };

    const toggleUser = (id: string) => {
        setSelectedUserIds(prev =>
            prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
        );
    };

    const toggleTeam = (id: string) => {
        setSelectedTeamIds(prev =>
            prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
        );
    };

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-800">Generate Certificates</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Controls */}
                    <Card className="md:col-span-1 h-fit">
                        <CardHeader>
                            <CardTitle>Generation Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Certificate Category</Label>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="participation">Participation</SelectItem>
                                        <SelectItem value="winner">Winner</SelectItem>
                                        <SelectItem value="runner-up">Runner Up</SelectItem>
                                        <SelectItem value="jury">Jury / Judge</SelectItem>
                                        <SelectItem value="mentor">Mentor</SelectItem>
                                        <SelectItem value="spoc">SPOC</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="pt-4">
                                <Button
                                    className="w-full"
                                    onClick={handleGenerate}
                                    disabled={mutation.isPending}
                                >
                                    {mutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                                        </>
                                    ) : (
                                        'Generate Certificates'
                                    )}
                                </Button>
                            </div>

                            {generationResults && (
                                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                                    <div className="flex items-center text-green-800 font-bold mb-2">
                                        <CheckCircle className="h-5 w-5 mr-2" /> Success
                                    </div>
                                    <p className="text-sm text-green-700">
                                        {generationResults.message}
                                    </p>
                                    {generationResults.errors?.length > 0 && (
                                        <div className="mt-2 text-xs text-red-600">
                                            {generationResults.errors.length} errors occurred.
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Selection Lists */}
                    <Card className="md:col-span-2 overflow-hidden">
                        <CardHeader>
                            <CardTitle>Select Recipients</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Teams List */}
                                <div className="border rounded-md flex flex-col h-[400px] overflow-hidden">
                                    <div className="p-3 bg-gray-50 border-b font-bold shrink-0">Teams</div>
                                    <ScrollArea className="flex-1">
                                        <div className="p-3">
                                            {teams.map((team: any) => (
                                                <div key={team._id} className="flex items-center space-x-2 mb-2 p-2 hover:bg-gray-50 rounded">
                                                    <Checkbox
                                                        id={`team-${team._id}`}
                                                        checked={selectedTeamIds.includes(team._id)}
                                                        onCheckedChange={() => toggleTeam(team._id)}
                                                        className="shrink-0"
                                                    />
                                                    <label htmlFor={`team-${team._id}`} className="text-sm cursor-pointer truncate">
                                                        {team.name}
                                                    </label>
                                                </div>
                                            ))}
                                            {teams.length === 0 && <p className="text-sm text-gray-500">No teams found</p>}
                                        </div>
                                    </ScrollArea>
                                </div>

                                {/* Users List */}
                                <div className="border rounded-md flex flex-col h-[400px] overflow-hidden">
                                    <div className="p-3 bg-gray-50 border-b font-bold shrink-0">Individual Users</div>
                                    <ScrollArea className="flex-1">
                                        <div className="p-3">
                                            {users.map((user: any) => (
                                                <div key={user._id} className="flex items-center space-x-2 mb-2 p-2 hover:bg-gray-50 rounded">
                                                    <Checkbox
                                                        id={`user-${user._id}`}
                                                        checked={selectedUserIds.includes(user._id)}
                                                        onCheckedChange={() => toggleUser(user._id)}
                                                        className="shrink-0"
                                                    />
                                                    <label htmlFor={`user-${user._id}`} className="text-sm cursor-pointer truncate flex-1 min-w-0">
                                                        <span className="truncate">{user.name}</span>
                                                        <span className="text-xs text-gray-500 ml-1">({user.role})</span>
                                                    </label>
                                                </div>
                                            ))}
                                            {users.length === 0 && <p className="text-sm text-gray-500">No users found</p>}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminGenerateCertificates;
