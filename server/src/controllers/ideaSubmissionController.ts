import { Request, Response } from 'express';
import IdeaSubmission from '../models/IdeaSubmission';
import Team from '../models/Team';
import Problem from '../models/Problem';
import Settings from '../models/Settings';
import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

const SUBMISSION_WINDOW_KEY = 'idea_submission_window_open';

// ==================== Google Drive Setup ====================

const FOLDER_MAP: Record<string, string> = {};

const getGDriveFolderMap = () => {
    if (Object.keys(FOLDER_MAP).length > 0) return FOLDER_MAP;
    // We'll look up the actual Problem documents to map ObjectId -> folder
    // For now, store the env-based folder IDs indexed by order (1-5)
    return {
        '1': process.env.GDRIVE_PS1_FOLDER_ID || '',
        '2': process.env.GDRIVE_PS2_FOLDER_ID || '',
        '3': process.env.GDRIVE_PS3_FOLDER_ID || '',
        '4': process.env.GDRIVE_PS4_FOLDER_ID || '',
        '5': process.env.GDRIVE_PS5_FOLDER_ID || ''
    };
};

let driveClient: any = null;

const getDriveClient = () => {
    if (driveClient) return driveClient;
    try {
        // Prefer OAuth2 with refresh token (real user — has Drive storage quota)
        const clientId = process.env.GDRIVE_CLIENT_ID;
        const clientSecret = process.env.GDRIVE_CLIENT_SECRET;
        const refreshToken = process.env.GDRIVE_REFRESH_TOKEN;

        if (clientId && clientSecret && refreshToken) {
            console.log('[GDrive] Using OAuth2 refresh token (real user auth)');
            const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
            oauth2Client.setCredentials({ refresh_token: refreshToken });
            driveClient = google.drive({ version: 'v3', auth: oauth2Client });
            console.log('[GDrive] OAuth2 client initialized successfully');
            return driveClient;
        }

        // Fallback: Service Account (WARNING: cannot upload files — no storage quota)
        const keyFilePath = path.join(__dirname, '../../', process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE || 'mithackathon26-b1992ca361fd.json');
        console.log('[GDrive] ⚠️  Falling back to Service Account (may fail on file uploads)');
        console.log('[GDrive] Key file:', keyFilePath, '| Exists:', fs.existsSync(keyFilePath));
        const auth = new google.auth.GoogleAuth({
            keyFile: keyFilePath,
            scopes: ['https://www.googleapis.com/auth/drive']
        });
        driveClient = google.drive({ version: 'v3', auth });
        console.log('[GDrive] Service Account client initialized');
        return driveClient;
    } catch (err) {
        console.error('[GDrive] Failed to initialize Google Drive client:', err);
        return null;
    }
};

// Get or create a team subfolder inside a PS folder
const getOrCreateTeamFolder = async (drive: any, parentFolderId: string, teamName: string): Promise<string> => {
    // Search for existing folder
    const searchRes = await drive.files.list({
        q: `'${parentFolderId}' in parents and name='${teamName.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
        supportsAllDrives: true
    });

    if (searchRes.data.files && searchRes.data.files.length > 0) {
        return searchRes.data.files[0].id;
    }

    // Create new folder
    const folderRes = await drive.files.create({
        requestBody: {
            name: teamName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentFolderId]
        },
        fields: 'id',
        supportsAllDrives: true
    });

    return folderRes.data.id;
};

// Upload file to Google Drive
const uploadToGoogleDrive = async (filePath: string, fileName: string, psFolderIndex: string, teamName: string): Promise<string | null> => {
    try {
        const drive = getDriveClient();
        if (!drive) {
            console.error('[GDrive] Google Drive client not available');
            return null;
        }

        const folderMap = getGDriveFolderMap();
        const psFolderId = folderMap[psFolderIndex];
        if (!psFolderId) {
            console.error(`[GDrive] No Google Drive folder configured for PS${psFolderIndex}`);
            return null;
        }

        console.log(`[GDrive] Uploading to PS${psFolderIndex} folder: ${psFolderId}`);
        console.log(`[GDrive] File: ${fileName}, Local path: ${filePath}`);
        console.log(`[GDrive] File exists locally: ${fs.existsSync(filePath)}`);

        // Get or create team subfolder
        const teamFolderId = await getOrCreateTeamFolder(drive, psFolderId, teamName);
        console.log(`[GDrive] Team folder ID for '${teamName}': ${teamFolderId}`);

        // Determine MIME type based on file extension
        const ext = path.extname(fileName).toLowerCase();
        const mimeType = ext === '.doc'
            ? 'application/msword'
            : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        // Upload file
        const res = await drive.files.create({
            requestBody: {
                name: fileName,
                parents: [teamFolderId]
            },
            media: {
                mimeType,
                body: fs.createReadStream(filePath)
            },
            fields: 'id, name, webViewLink',
            supportsAllDrives: true
        });

        const fileId = res.data.id;
        console.log(`[GDrive] ✅ Upload SUCCESS! File ID: ${fileId}, Name: ${res.data.name}`);
        if (res.data.webViewLink) console.log(`[GDrive] Web link: ${res.data.webViewLink}`);

        return fileId || null;
    } catch (err: any) {
        console.error('[GDrive] ❌ Upload FAILED:', err.message || err);
        if (err.response?.data) {
            console.error('[GDrive] Error details:', JSON.stringify(err.response.data, null, 2));
        }
        return null;
    }
};

// ==================== Problem Index Lookup ====================

// Map problem ObjectId to its 1-based index (PS1, PS2, etc.)
const getProblemIndex = async (problemId: string): Promise<string> => {
    const problems = await Problem.find({}).sort({ _id: 1 }).lean();
    const idx = problems.findIndex((p: any) => p._id.toString() === problemId);
    return String(idx + 1);  // 1-based
};

// ==================== Student Endpoints ====================

// POST /api/idea-submissions - Submit idea (team leader only)
export const submitIdea = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { youtubeVideoLink } = req.body;
        const file = (req as any).file;

        // Check if submission window is open
        const windowSetting = await Settings.findOne({ key: SUBMISSION_WINDOW_KEY });
        if (windowSetting && windowSetting.value === false) {
            return res.status(403).json({ message: 'Idea submission portal is currently closed by admin.' });
        }

        if (!file) {
            return res.status(400).json({ message: 'Please upload a document (.doc or .docx)' });
        }

        if (!youtubeVideoLink) {
            return res.status(400).json({ message: 'Please provide a YouTube video link' });
        }

        // Validate YouTube URL
        if (!/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/.test(youtubeVideoLink)) {
            return res.status(400).json({ message: 'Please provide a valid YouTube URL' });
        }

        // Find user's team
        const team = await Team.findOne({
            $or: [
                { leaderId: user._id },
                { members: user._id }
            ],
            status: 'approved'
        }).lean();

        if (!team) {
            return res.status(400).json({ message: 'You must be part of an approved team' });
        }

        // Only team leader can submit
        if (team.leaderId.toString() !== user._id.toString()) {
            return res.status(403).json({ message: 'Only the team leader can submit ideas' });
        }

        // Team must have selected a problem statement
        if (!team.problemId) {
            return res.status(400).json({ message: 'Your team must select a problem statement first' });
        }

        // Check if already submitted — BLOCK re-submissions
        const existing = await IdeaSubmission.findOne({ teamId: team._id });
        if (existing) {
            // Clean up the uploaded file since we're rejecting
            if (file.path && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            return res.status(400).json({ message: 'Your team has already submitted an idea. Submissions cannot be modified once submitted.' });
        }

        // New submission
        const psIndex = await getProblemIndex(team.problemId.toString());

        // Upload to Google Drive
        let driveFileId: string | null = null;
        try {
            driveFileId = await uploadToGoogleDrive(
                file.path,
                `${team.name}_${file.originalname}`,
                psIndex,
                team.name
            );
        } catch (driveErr: any) {
            console.error('[GDrive] Drive upload failed:', driveErr.message || driveErr);
        }

        const submission = await IdeaSubmission.create({
            teamId: team._id,
            problemId: team.problemId,
            youtubeVideoLink,
            documentPath: file.path,
            documentOriginalName: file.originalname,
            driveFileId: driveFileId || undefined,
            submittedBy: user._id
        });

        // Keep local file regardless — admin may need to download it
        // The local file is the source of truth for downloads

        res.status(201).json({ message: 'Idea submitted successfully!', submission });
    } catch (error: any) {
        console.error('Submit idea error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Your team has already submitted an idea. You can update it.' });
        }
        res.status(500).json({ message: 'Failed to submit idea', error: error.message });
    }
};

// GET /api/idea-submissions/my - Get own team's submission
export const getMySubmission = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;

        const team = await Team.findOne({
            $or: [
                { leaderId: user._id },
                { members: user._id }
            ]
        }).lean();

        if (!team) {
            return res.json({ submission: null });
        }

        const submission = await IdeaSubmission.findOne({ teamId: team._id })
            .populate('problemId', 'title category')
            .lean();

        if (submission) {
            // NEVER expose driveFileId or documentPath to students
            const { driveFileId, documentPath, ...safeSubmission } = submission as any;
            return res.json({ submission: safeSubmission });
        }

        res.json({ submission: null });
    } catch (error: any) {
        console.error('Get my submission error:', error);
        res.status(500).json({ message: 'Failed to fetch submission', error: error.message });
    }
};

// ==================== Admin Endpoints ====================

// GET /api/idea-submissions/admin - All submissions
export const getAllSubmissions = async (req: Request, res: Response) => {
    try {
        const submissions = await IdeaSubmission.find({})
            .populate('teamId', 'name instituteName instituteCode')
            .populate('problemId', 'title category')
            .populate('submittedBy', 'name email')
            .populate('reviewedBy', 'name')
            .sort({ createdAt: -1 })
            .lean();

        // Strip driveFileId from response (admin can see documentOriginalName but not drive internals)
        const safeSubmissions = submissions.map((s: any) => {
            const { driveFileId, documentPath, ...safe } = s;
            return { ...safe, hasDocument: !!driveFileId || !!documentPath };
        });

        res.json(safeSubmissions);
    } catch (error: any) {
        console.error('Get all submissions error:', error);
        res.status(500).json({ message: 'Failed to fetch submissions', error: error.message });
    }
};

// GET /api/idea-submissions/admin/stats - Stats
export const getSubmissionStats = async (req: Request, res: Response) => {
    try {
        const [total, pending, approved, rejected] = await Promise.all([
            IdeaSubmission.countDocuments(),
            IdeaSubmission.countDocuments({ status: 'pending' }),
            IdeaSubmission.countDocuments({ status: 'approved' }),
            IdeaSubmission.countDocuments({ status: 'rejected' })
        ]);

        // Per-problem breakdown
        const problems = await Problem.find({}).sort({ _id: 1 }).lean();
        const perProblem = await Promise.all(
            problems.map(async (p: any, idx: number) => {
                const psTotal = await IdeaSubmission.countDocuments({ problemId: p._id });
                const psApproved = await IdeaSubmission.countDocuments({ problemId: p._id, status: 'approved' });
                const psRejected = await IdeaSubmission.countDocuments({ problemId: p._id, status: 'rejected' });
                const psPending = await IdeaSubmission.countDocuments({ problemId: p._id, status: 'pending' });
                return {
                    problemId: p._id,
                    title: p.title,
                    category: p.category,
                    index: idx + 1,
                    total: psTotal,
                    approved: psApproved,
                    rejected: psRejected,
                    pending: psPending
                };
            })
        );

        res.json({ total, pending, approved, rejected, perProblem });
    } catch (error: any) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
    }
};

// PUT /api/idea-submissions/admin/:id/review - Approve/Reject
export const reviewSubmission = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, reviewNote } = req.body;
        const user = (req as any).user;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Status must be approved or rejected' });
        }

        const submission = await IdeaSubmission.findById(id);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        submission.status = status;
        submission.reviewedBy = user._id;
        submission.reviewNote = reviewNote || '';
        submission.reviewedAt = new Date();
        await submission.save();

        res.json({ message: `Submission ${status} successfully`, submission });
    } catch (error: any) {
        console.error('Review submission error:', error);
        res.status(500).json({ message: 'Failed to review submission', error: error.message });
    }
};

// GET /api/idea-submissions/admin/:id/download - Download document
export const downloadDocument = async (req: Request, res: Response) => {
    try {
        const submission = await IdeaSubmission.findById(req.params.id);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        const filePath = submission.documentPath;
        if (!filePath || !fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Document file not found on server' });
        }

        const originalName = submission.documentOriginalName || 'document.docx';
        res.setHeader('Content-Disposition', `attachment; filename="${originalName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } catch (error: any) {
        console.error('Download document error:', error);
        res.status(500).json({ message: 'Failed to download document', error: error.message });
    }
};

// DELETE /api/idea-submissions/admin/:id/allow-resubmission - Allow team to resubmit
export const allowResubmission = async (req: Request, res: Response) => {
    try {
        const submission = await IdeaSubmission.findById(req.params.id);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        const teamId = submission.teamId;

        // Delete the local file if it exists
        if (submission.documentPath && fs.existsSync(submission.documentPath)) {
            fs.unlinkSync(submission.documentPath);
        }

        // Delete the submission from DB
        await IdeaSubmission.findByIdAndDelete(req.params.id);

        console.log(`[Admin] Allowed resubmission for team ${teamId}`);
        res.json({ message: 'Submission deleted. Team can now resubmit.' });
    } catch (error: any) {
        console.error('Allow resubmission error:', error);
        res.status(500).json({ message: 'Failed to allow resubmission', error: error.message });
    }
};

// Toggle submission window (Admin only)
export const toggleSubmissionWindow = async (req: Request, res: Response) => {
    try {
        const { isOpen } = req.body;

        await Settings.findOneAndUpdate(
            { key: SUBMISSION_WINDOW_KEY },
            { key: SUBMISSION_WINDOW_KEY, value: isOpen },
            { upsert: true, new: true }
        );

        res.json({ message: `Idea submission portal ${isOpen ? 'opened' : 'closed'}`, isOpen });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get submission window status
export const getSubmissionWindowStatus = async (req: Request, res: Response) => {
    try {
        const setting = await Settings.findOne({ key: SUBMISSION_WINDOW_KEY });
        const isOpen = setting ? setting.value : true; // Default to open
        res.json({ isOpen });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
