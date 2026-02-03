import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { api } from '@/services/api';
import axios from 'axios';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { INDIAN_STATES_AND_DISTRICTS } from '@/data/indianStates';
import {
    Loader2,
    Users,
    School,
    User,
    ClipboardCheck,
    FileUp,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Plus,
    Trash2,
    Mail,
    Phone,
    ShieldCheck,
    FileText,
    Check,
    Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import logoGif from '@/assets/mit-vpu-logo.gif';



const TeamRegistration = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);



    const [formData, setFormData] = useState({
        leaderName: '',
        leaderEmail: '',
        leaderPhone: '',
        leaderPassword: '',
        instituteCode: '',
        instituteName: '',
        teamName: '',
        teamMembers: [
            { name: '', email: '' },
            { name: '', email: '' },
            { name: '', email: '' },
            { name: '', email: '' }
        ],
        mentorName: '',
        mentorEmail: '',
        spocName: '',
        spocEmail: '',
        spocDistrict: '',
        spocState: '',
        consentFile: '',
    });

    const [isInstituteLookupLoading, setIsInstituteLookupLoading] = useState(false);
    const [existingGovernance, setExistingGovernance] = useState<{ spoc: any, mentor: any } | null>(null);



    const handleInstituteLookup = async (code: string) => {
        if (!code || code.length < 3) return;
        setIsInstituteLookupLoading(true);
        try {
            const response = await axios.get(`http://localhost:5000/api/public/institute-lookup/${code}`);
            if (response.data.spoc || response.data.mentor) {
                setExistingGovernance({
                    spoc: response.data.spoc,
                    mentor: response.data.mentor
                });

                setFormData(prev => ({
                    ...prev,
                    instituteName: response.data.spoc?.instituteName || prev.instituteName,
                    spocName: response.data.spoc?.name || prev.spocName,
                    spocEmail: response.data.spoc?.email || prev.spocEmail,
                    mentorName: response.data.mentor?.name || prev.mentorName,
                    mentorEmail: response.data.mentor?.email || prev.mentorEmail
                }));
                toast.info(`Governance partners found for ${code}. Auto-filling details.`);
            } else {
                setExistingGovernance(null);
            }
        } catch (error) {
            console.error('Lookup error:', error);
        } finally {
            setIsInstituteLookupLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleMemberChange = (index: number, field: 'name' | 'email', value: string) => {
        const newMembers = [...formData.teamMembers];
        newMembers[index][field] = value;
        setFormData(prev => ({ ...prev, teamMembers: newMembers }));
    };



    const handleFileUpload = async (file: File) => {
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size exceeds 5MB limit');
            return;
        }

        const formData = new FormData();
        formData.append('consentFile', file);

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/public/upload-consent', formData);
            handleInputChange('consentFile', response.data.fileUrl);
            toast.success('Document uploaded successfully!');
        } catch (error: any) {
            console.error('Upload Error:', error);
            toast.error(error.response?.data?.message || 'Failed to upload document');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        if (!formData.teamName || !formData.leaderEmail || !formData.consentFile) {
            toast.error('Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/teams/register', formData);
            toast.success(response.data.message);
            setStep(6); // Success step (now step 6)
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const stepVariants = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 }
    };



    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream via-skyblue to-accent/20 p-4 py-12 animate-fade-in">
            <div className="w-full max-w-2xl">
                {/* Logo and Title */}
                <div className="text-center mb-8 animate-slide-up">
                    <img src={logoGif} alt="MIT Vishwaprayag University Logo" className="h-20 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold gradient-text mb-2">MIT Vishwaprayag University Hackathon</h1>
                    <p className="text-muted-foreground">Official Team Registration Portal</p>
                </div>

                {/* Progress Indicator - Clickable Steps */}
                <div className="flex justify-between mb-8 px-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <div
                            key={s}
                            className="flex flex-col items-center gap-2 cursor-pointer"
                            onClick={() => {
                                // Only allow clicking if we've reached this step or it's a previous step
                                // Or if we are in "edit mode" (steps < 6)
                                if (step < 6) {
                                    setStep(s);
                                }
                            }}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s
                                ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg scale-110'
                                : 'bg-white/60 text-muted-foreground border hover:bg-white hover:border-primary/50'
                                }`}>
                                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                            </div>
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        variants={stepVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="shadow-2xl border-0 hover-lift animate-scale-in">
                            <CardHeader>
                                {step === 1 && (
                                    <>
                                        <CardTitle className="flex items-center gap-2 text-2xl">
                                            <User className="w-6 h-6 text-primary" />
                                            Group Leader Details
                                        </CardTitle>
                                        <CardDescription>Enter the details of the person registering the team.</CardDescription>
                                    </>
                                )}
                                {step === 2 && (
                                    <>
                                        <CardTitle className="flex items-center gap-2 text-2xl">
                                            <School className="w-6 h-6 text-primary" />
                                            Institute & Team Info
                                        </CardTitle>
                                        <CardDescription>Tell us about your organization and your team name.</CardDescription>
                                    </>
                                )}
                                {step === 3 && (
                                    <>
                                        <CardTitle className="flex items-center gap-2 text-2xl">
                                            <Users className="w-6 h-6 text-primary" />
                                            Team Members (4)
                                        </CardTitle>
                                        <CardDescription>Enter the details of your 4 team members.</CardDescription>
                                    </>
                                )}
                                {step === 4 && (
                                    <>
                                        <CardTitle className="flex items-center gap-2 text-2xl">
                                            <ShieldCheck className="w-6 h-6 text-primary" />
                                            SPOC & Mentor Details
                                        </CardTitle>
                                        <CardDescription>Nominate your institute's SPOC and Mentor.</CardDescription>
                                    </>
                                )}
                                {step === 5 && (
                                    <>
                                        <CardTitle className="flex items-center gap-2 text-2xl">
                                            <FileUp className="w-6 h-6 text-primary" />
                                            Verification & Consent
                                        </CardTitle>
                                        <CardDescription>Upload the official consent letter from your institute.</CardDescription>
                                    </>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {step === 1 && (
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="leaderName">Full Name</Label>
                                            <Input id="leaderName" placeholder="John Doe" value={formData.leaderName} onChange={(e) => handleInputChange('leaderName', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="leaderEmail">Email Address</Label>
                                            <Input id="leaderEmail" type="email" placeholder="john@example.com" value={formData.leaderEmail} onChange={(e) => handleInputChange('leaderEmail', e.target.value)} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="leaderPhone">Phone Number</Label>
                                                <Input id="leaderPhone" placeholder="+91 ..." value={formData.leaderPhone} onChange={(e) => handleInputChange('leaderPhone', e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="leaderPassword">Account Password</Label>
                                                <Input id="leaderPassword" type="password" value={formData.leaderPassword} onChange={(e) => handleInputChange('leaderPassword', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="teamName">Team Name <span className="text-red-500">*</span></Label>
                                            <Input id="teamName" placeholder="Cyber Warriors" value={formData.teamName} onChange={(e) => handleInputChange('teamName', e.target.value)} />
                                            <p className="text-xs text-muted-foreground">Must be unique across the platform.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="instituteCode">Institute Code</Label>
                                            <div className="relative">
                                                <Input
                                                    id="instituteCode"
                                                    placeholder="INST001"
                                                    value={formData.instituteCode}
                                                    onChange={(e) => handleInputChange('instituteCode', e.target.value)}
                                                    onBlur={(e) => handleInstituteLookup(e.target.value)}
                                                />
                                                {isInstituteLookupLoading && <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-3 text-blue-500" />}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="instituteName">Institute Name</Label>
                                            <Input
                                                id="instituteName"
                                                placeholder="Generic Technical University"
                                                value={formData.instituteName}
                                                onChange={(e) => handleInputChange('instituteName', e.target.value)}
                                                disabled={!!existingGovernance?.spoc}
                                            />
                                            {existingGovernance?.spoc && <p className="text-[10px] text-blue-600 font-medium italic">Name locked as per institutional records.</p>}
                                        </div>
                                    </div>
                                )}



                                {step === 3 && (
                                    <div className="space-y-4">
                                        {formData.teamMembers.map((member, index) => (
                                            <div key={index} className="p-4 border rounded-lg bg-slate-50 relative group">
                                                <div className="absolute -top-3 left-4 bg-white px-2 text-xs font-bold text-blue-600 border rounded shadow-sm">
                                                    Member {index + 1}
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 pt-2">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Name</Label>
                                                        <Input className="h-8 bg-white" value={member.name} onChange={(e) => handleMemberChange(index, 'name', e.target.value)} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Email</Label>
                                                        <Input className="h-8 bg-white" value={member.email} onChange={(e) => handleMemberChange(index, 'email', e.target.value)} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700">
                                            <ShieldCheck className="w-4 h-4" />
                                            Team size is restricted to exactly 5 members (including Leader).
                                        </div>
                                    </div>
                                )}

                                {step === 4 && (
                                    <div className="grid gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 font-bold text-slate-800 border-b pb-2">
                                                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                                Institute SPOC
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>SPOC Name</Label>
                                                    <Input
                                                        value={formData.spocName}
                                                        onChange={(e) => handleInputChange('spocName', e.target.value)}
                                                        disabled={!!existingGovernance?.spoc}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>SPOC Email</Label>
                                                    <Input
                                                        type="email"
                                                        value={formData.spocEmail}
                                                        onChange={(e) => handleInputChange('spocEmail', e.target.value)}
                                                        disabled={!!existingGovernance?.spoc}
                                                    />
                                                </div>
                                            </div>
                                            {existingGovernance?.spoc && (
                                                <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-100 rounded text-[10px] text-blue-700">
                                                    <ShieldCheck className="w-3 h-3" />
                                                    SPOC already registered for this institute. Reusing official contact.
                                                </div>
                                            )}
                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <div className="space-y-2">
                                                    <Label>State</Label>
                                                    <Select
                                                        value={formData.spocState}
                                                        onValueChange={(value) => {
                                                            handleInputChange('spocState', value);
                                                            handleInputChange('spocDistrict', ''); // Reset district when state changes
                                                        }}
                                                        disabled={!!existingGovernance?.spoc}
                                                    >
                                                        <SelectTrigger className="bg-white">
                                                            <SelectValue placeholder="Select State" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Object.keys(INDIAN_STATES_AND_DISTRICTS).sort().map((state) => (
                                                                <SelectItem key={state} value={state}>
                                                                    {state}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>District</Label>
                                                    <Select
                                                        value={formData.spocDistrict}
                                                        onValueChange={(value) => handleInputChange('spocDistrict', value)}
                                                        disabled={!formData.spocState || !!existingGovernance?.spoc}
                                                    >
                                                        <SelectTrigger className="bg-white">
                                                            <SelectValue placeholder={formData.spocState ? "Select District" : "Select State First"} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {formData.spocState && INDIAN_STATES_AND_DISTRICTS[formData.spocState]?.sort().map((district) => (
                                                                <SelectItem key={district} value={district}>
                                                                    {district}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 font-bold text-slate-800 border-b pb-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                                Institute Mentor
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Mentor Name</Label>
                                                    <Input
                                                        value={formData.mentorName}
                                                        onChange={(e) => handleInputChange('mentorName', e.target.value)}
                                                        disabled={!!existingGovernance?.mentor}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Mentor Email</Label>
                                                    <Input
                                                        type="email"
                                                        value={formData.mentorEmail}
                                                        onChange={(e) => handleInputChange('mentorEmail', e.target.value)}
                                                        disabled={!!existingGovernance?.mentor}
                                                    />
                                                </div>
                                            </div>
                                            {existingGovernance?.mentor && (
                                                <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-100 rounded text-[10px] text-green-700">
                                                    <ShieldCheck className="w-3 h-3" />
                                                    Mentor already registered for this institute. Reusing official contact.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {step === 5 && (
                                    <div className="space-y-6">
                                        <div
                                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer group relative overflow-hidden
                                                ${formData.consentFile ? 'border-green-500 bg-green-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}
                                                ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                                            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-blue-500', 'bg-blue-50'); }}
                                            onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50'); }}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                                                const file = e.dataTransfer.files[0];
                                                if (file) handleFileUpload(file);
                                            }}
                                            onClick={() => document.getElementById('fileInput')?.click()}
                                        >
                                            <input
                                                type="file"
                                                id="fileInput"
                                                className="hidden"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleFileUpload(file);
                                                }}
                                            />

                                            <AnimatePresence mode="wait">
                                                {formData.consentFile ? (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="flex flex-col items-center gap-2"
                                                    >
                                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                                                            <CheckCircle2 className="w-10 h-10" />
                                                        </div>
                                                        <p className="font-bold text-green-800">File Selected Successfully!</p>
                                                        <p className="text-xs text-green-600 font-mono italic">ConsentLetter_Verified.pdf</p>
                                                        <Button variant="ghost" size="sm" className="mt-2 text-slate-500 hover:text-red-500" onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleInputChange('consentFile', '');
                                                        }}>
                                                            Remove and try again
                                                        </Button>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="flex flex-col items-center gap-3"
                                                    >
                                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                                            <FileUp className="w-8 h-8 text-blue-500" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-lg font-bold text-slate-700">Drag & Drop Consent Letter</p>
                                                            <p className="text-sm text-slate-500">or <span className="text-blue-600 underline">browse files</span> from your computer</p>
                                                        </div>
                                                        <div className="flex gap-2 mt-2">
                                                            <Badge variant="outline" className="bg-white text-[10px]">PDF</Badge>
                                                            <Badge variant="outline" className="bg-white text-[10px]">JPG</Badge>
                                                            <Badge variant="outline" className="bg-white text-[10px]">PNG</Badge>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {loading && (
                                                <div className="absolute inset-0 bg-white/60 flex flex-col items-center justify-center gap-2">
                                                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Uploading Document...</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg space-y-2">
                                            <div className="flex items-center gap-2 text-amber-800 font-bold">
                                                <ShieldCheck className="w-4 h-4" />
                                                Mandatory Verification
                                            </div>
                                            <ul className="text-xs text-amber-700 space-y-1 list-disc pl-4 leading-relaxed">
                                                <li>Letter must be on <strong>Institutional Letterhead</strong>.</li>
                                                <li>Must be signed by the <strong>Head of Institution/Department</strong>.</li>
                                                <li>File size must be under <strong>5MB</strong>.</li>
                                                <li>Incomplete or blurred documents will cause <strong>automatic rejection</strong>.</li>
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {step === 6 && (
                                    <div className="py-8 text-center space-y-6">
                                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                            <CheckCircle2 className="w-12 h-12" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900">Registration Submitted!</h2>
                                            <p className="text-slate-600 mt-2">
                                                Your team <strong>{formData.teamName}</strong> is now pending admin verification.
                                                We have sent a confirmation email to <strong>{formData.leaderEmail}</strong>.
                                            </p>
                                        </div>
                                        <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-700 text-left">
                                            <strong>What happens next?</strong>
                                            <ol className="mt-2 space-y-1 list-decimal pl-4">
                                                <li>Admin reviews your consent letter and team details.</li>
                                                <li>Once approved, SPOC and Mentor obtain their credentials via email.</li>
                                                <li>You can then login as Group Leader to start the hackathon journey.</li>
                                            </ol>
                                        </div>
                                        <Button asChild className="w-full py-6 text-lg">
                                            <Link to="/login">Go to Login</Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>

                            {step < 6 && (
                                <CardFooter className="flex justify-between border-t pt-6 bg-slate-50/50">
                                    <Button
                                        variant="outline"
                                        onClick={() => step === 1 ? navigate('/') : prevStep()}
                                        disabled={loading}
                                        className="gap-2"
                                    >
                                        {step === 1 ? <Home className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                                        {step === 1 ? 'Home' : 'Back'}
                                    </Button>
                                    {step < 5 ? (
                                        <Button
                                            onClick={nextStep}
                                            className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:shadow-glow transition-all"
                                        >
                                            Next <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={loading}
                                            className="gap-2 bg-green-600 hover:bg-green-700 min-w-[140px]"
                                        >
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardCheck className="w-4 h-4" />}
                                            Submit Registration
                                        </Button>
                                    )}
                                </CardFooter>
                            )}
                        </Card>
                    </motion.div>
                </AnimatePresence>

                {step < 6 && (
                    <div className="mt-8 text-center text-muted-foreground text-sm">
                        Already have an approved team? <Link to="/login" className="text-secondary hover:underline font-semibold">Sign In here</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamRegistration;
