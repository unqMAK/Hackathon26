import { Request, Response } from 'express';
import CertificateConfig from '../models/CertificateConfig';
import CertificateRecord from '../models/CertificateRecord';
import User from '../models/User';
import Team from '../models/Team';
import { generateCertificatePDF } from '../services/pdfService';
import fs from 'fs';
import path from 'path';

// Helper to ensure directory exists
const ensureDir = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// 1. Get Config
export const getCertificateConfig = async (req: Request, res: Response) => {
    try {
        let config = await CertificateConfig.findOne();
        if (!config) {
            // Create default if not exists
            config = await CertificateConfig.create({});
        }
        res.json(config);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Update Config (Admin)
export const updateCertificateConfig = async (req: Request, res: Response) => {
    try {
        const updates = req.body;
        let config = await CertificateConfig.findOne();

        if (config) {
            Object.assign(config, updates);
            config.updatedAt = new Date();
            await config.save();
        } else {
            config = await CertificateConfig.create(updates);
        }

        res.json(config);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Generate Certificates (Admin)
export const generateCertificates = async (req: Request, res: Response) => {
    try {
        const { category, userIds, teamIds } = req.body;

        const config = await CertificateConfig.findOne();
        if (!config) {
            return res.status(400).json({ message: 'Certificate configuration not found. Please configure it first.' });
        }

        let targetUserIds: string[] = [];

        // Collect user IDs
        if (userIds && userIds.length > 0) {
            targetUserIds = [...userIds];
        }

        // If team IDs provided, get members
        if (teamIds && teamIds.length > 0) {
            const teams = await Team.find({ _id: { $in: teamIds } });
            teams.forEach(team => {
                targetUserIds.push(...team.members.map(m => m.toString()));
                if (team.mentorId) {
                    // Optionally include mentor? Let's stick to members for now unless specified
                }
            });
        }

        // Remove duplicates
        targetUserIds = [...new Set(targetUserIds)];

        const results = [];
        const errors = [];

        // Ensure certificates directory exists
        const certDir = path.join(__dirname, '../../public/certificates');
        ensureDir(certDir);

        for (const userId of targetUserIds) {
            try {
                const user = await User.findById(userId);
                if (!user) continue;

                // Generate PDF
                const pdfBuffer = await generateCertificatePDF(user, config, category);

                // Save to file system (in production, upload to S3/Cloudinary)
                const fileName = `cert-${category}-${userId}-${Date.now()}.pdf`;
                const filePath = path.join(certDir, fileName);
                fs.writeFileSync(filePath, pdfBuffer);

                // Create Record
                const publicUrl = `/certificates/${fileName}`; // Assuming static serve setup

                const record = await CertificateRecord.create({
                    userId: user._id,
                    category,
                    pdfUrl: publicUrl
                });

                results.push(record);
            } catch (err: any) {
                console.error(`Failed to generate for user ${userId}:`, err);
                errors.push({ userId, error: err.message });
            }
        }

        res.json({
            message: `Generated ${results.length} certificates`,
            results,
            errors
        });

    } catch (error: any) {
        console.error('Bulk generation error:', error);
        res.status(500).json({ message: error.message });
    }
};

// 4. Get My Certificates
export const getMyCertificates = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const certificates = await CertificateRecord.find({ userId }).sort({ issuedAt: -1 });
        res.json(certificates);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// 5. Download Certificate
export const downloadCertificate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const cert = await CertificateRecord.findById(id);

        if (!cert) {
            return res.status(404).json({ message: 'Certificate not found' });
        }

        // Check ownership (unless admin)
        const requestingUserId = (req as any).user._id;
        const isAdmin = (req as any).user.role === 'admin';

        if (cert.userId.toString() !== requestingUserId.toString() && !isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Construct file path
        // Note: pdfUrl is stored as relative path like /certificates/filename.pdf
        // We need to resolve it to absolute system path
        const fileName = path.basename(cert.pdfUrl);
        const filePath = path.join(__dirname, '../../public/certificates', fileName);

        if (fs.existsSync(filePath)) {
            res.download(filePath);
        } else {
            res.status(404).json({ message: 'Certificate file not found on server' });
        }

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
