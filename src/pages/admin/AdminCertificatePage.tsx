import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCertificateConfig, updateCertificateConfig } from '@/services/certificateService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const AdminCertificatePage = () => {
    const queryClient = useQueryClient();
    const { data: config, isLoading } = useQuery({
        queryKey: ['certificateConfig'],
        queryFn: getCertificateConfig
    });

    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        eventName: '',
        description: '',
        backgroundImage: '',
        signature1Label: '',
        signature1Url: '',
        signature2Label: '',
        signature2Url: '',
        isPublished: false
    });

    useEffect(() => {
        if (config) {
            setFormData({
                title: config.title,
                subtitle: config.subtitle,
                eventName: config.eventName,
                description: config.description,
                backgroundImage: config.backgroundImage || '',
                signature1Label: config.signature1?.label || '',
                signature1Url: config.signature1?.imageUrl || '',
                signature2Label: config.signature2?.label || '',
                signature2Url: config.signature2?.imageUrl || '',
                isPublished: config.isPublished
            });
        }
    }, [config]);

    const mutation = useMutation({
        mutationFn: updateCertificateConfig,
        onSuccess: () => {
            toast.success('Certificate configuration saved');
            queryClient.invalidateQueries({ queryKey: ['certificateConfig'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to save config');
        }
    });

    const handleSave = () => {
        mutation.mutate({
            title: formData.title,
            subtitle: formData.subtitle,
            eventName: formData.eventName,
            description: formData.description,
            backgroundImage: formData.backgroundImage,
            signature1: {
                label: formData.signature1Label,
                imageUrl: formData.signature1Url
            },
            signature2: {
                label: formData.signature2Label,
                imageUrl: formData.signature2Url
            },
            isPublished: formData.isPublished
        });
    };

    if (isLoading) return <DashboardLayout role="admin"><div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div></DashboardLayout>;

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">Certificate Builder</h1>
                    <Button onClick={handleSave} disabled={mutation.isPending}>
                        {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Configuration
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Configuration Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Template Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Certificate Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Subtitle</Label>
                                <Input
                                    value={formData.subtitle}
                                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Event Name</Label>
                                <Input
                                    value={formData.eventName}
                                    onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Body Text</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Background Image URL</Label>
                                <Input
                                    value={formData.backgroundImage}
                                    onChange={(e) => setFormData({ ...formData, backgroundImage: e.target.value })}
                                    placeholder="https://example.com/bg.jpg"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Signature 1 Label</Label>
                                    <Input
                                        value={formData.signature1Label}
                                        onChange={(e) => setFormData({ ...formData, signature1Label: e.target.value })}
                                    />
                                    <Label>Signature 1 URL</Label>
                                    <Input
                                        value={formData.signature1Url}
                                        onChange={(e) => setFormData({ ...formData, signature1Url: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Signature 2 Label</Label>
                                    <Input
                                        value={formData.signature2Label}
                                        onChange={(e) => setFormData({ ...formData, signature2Label: e.target.value })}
                                    />
                                    <Label>Signature 2 URL</Label>
                                    <Input
                                        value={formData.signature2Url}
                                        onChange={(e) => setFormData({ ...formData, signature2Url: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 pt-4">
                                <Switch
                                    checked={formData.isPublished}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                                />
                                <Label>Publish Template (Enable Generation)</Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Live Preview */}
                    <Card className="bg-gray-100">
                        <CardHeader>
                            <CardTitle>Live Preview (Approximate)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                className="w-full aspect-[1.414/1] bg-white relative shadow-lg flex flex-col items-center justify-center text-center p-8 border-8 border-white box-border overflow-hidden"
                                style={{
                                    backgroundImage: formData.backgroundImage ? `url(${formData.backgroundImage})` : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            >
                                <div className="absolute inset-4 border-2 border-yellow-600 pointer-events-none"></div>

                                <h1 className="text-3xl font-serif font-bold text-blue-900 uppercase mb-2 relative z-10">
                                    {formData.title || 'Certificate Title'}
                                </h1>
                                <p className="text-gray-600 italic mb-4 relative z-10">{formData.subtitle}</p>

                                <div className="text-4xl font-cursive text-yellow-600 my-4 border-b border-gray-300 px-8 pb-2 relative z-10 font-bold">
                                    Recipient Name
                                </div>

                                <p className="max-w-md text-sm text-gray-700 mb-8 relative z-10">
                                    {formData.description}
                                    <br />
                                    Presented at <span className="font-bold text-blue-900">{formData.eventName}</span>
                                </p>

                                <div className="flex justify-around w-full mt-auto relative z-10">
                                    <div className="text-center">
                                        {formData.signature1Url && <img src={formData.signature1Url} className="h-12 mx-auto mb-2" alt="Sig1" />}
                                        <div className="w-32 h-px bg-gray-800 mx-auto mb-1"></div>
                                        <div className="text-xs font-bold">{formData.signature1Label}</div>
                                    </div>
                                    <div className="text-center">
                                        {formData.signature2Url && <img src={formData.signature2Url} className="h-12 mx-auto mb-2" alt="Sig2" />}
                                        <div className="w-32 h-px bg-gray-800 mx-auto mb-1"></div>
                                        <div className="text-xs font-bold">{formData.signature2Label}</div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                * This is a simplified HTML preview. The actual PDF is generated using Puppeteer and may look slightly different.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminCertificatePage;
