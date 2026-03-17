/**
 * Export Shortlisted (Enabled) Teams Data - Phase 2 Reviewer Report
 * 
 * Exports ONLY enabled teams (isDisabled !== true) with:
 *   - Team name, institute, members
 *   - Problem statement details
 *   - YouTube video link from their IdeaSubmission
 *   - Submission status & document info
 * 
 * Generates two files:
 *   1. A flat CSV for reviewers (easy to share alongside Drive folders)
 *   2. A structured report CSV with summary stats
 * 
 * Usage: npx ts-node src/scripts/exportShortlistedTeams.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Import models to register schemas
import '../models/User';
import '../models/Problem';
import '../models/Team';
import '../models/IdeaSubmission';

const Team = mongoose.model('Team');
const Problem = mongoose.model('Problem');
const IdeaSubmission = mongoose.model('IdeaSubmission');

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/hacksphere';
        await mongoose.connect(mongoUri);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const escapeCSV = (value: string | undefined | null): string => {
    if (!value) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

const exportShortlistedTeams = async () => {
    await connectDB();

    console.log('\n📊 Fetching shortlisted (enabled) teams...\n');

    // Get all approved & ENABLED teams (isDisabled is false or not set)
    const teams = await Team.find({
        status: 'approved',
        $or: [{ isDisabled: false }, { isDisabled: { $exists: false } }]
    })
        .populate('leaderId', 'name email phone')
        .populate('members', 'name email phone')
        .populate('problemId', 'title category type')
        .sort({ name: 1 });

    console.log(`Found ${teams.length} shortlisted (enabled) teams\n`);

    // Get all idea submissions for these teams
    const teamIds = teams.map((t: any) => t._id);
    const submissions = await IdeaSubmission.find({ teamId: { $in: teamIds } });
    const submissionMap = new Map<string, any>();
    submissions.forEach((s: any) => {
        submissionMap.set(s.teamId.toString(), s);
    });

    console.log(`Found ${submissions.length} idea submissions from these teams\n`);

    // ==================== FLAT CSV FOR REVIEWERS ====================
    const flatRows: string[] = [];
    flatRows.push([
        'Sr. No.',
        'Team Name',
        'Institute Name',
        'Institute Code',
        'District',
        'State',
        'Problem Statement',
        'Problem Category',
        'YouTube Video Link',
        'Submission Status',
        'Document Name',
        'Submitted On',
        'Leader Name',
        'Leader Email',
        'Leader Phone',
        'Member 2 Name',
        'Member 2 Email',
        'Member 3 Name',
        'Member 3 Email',
        'Member 4 Name',
        'Member 4 Email',
        'Member 5 Name',
        'Member 5 Email',
        'Mentor Name',
        'Mentor Email',
        'SPOC Name',
        'SPOC Email'
    ].join(','));

    let srNo = 1;
    // Track problem-wise stats
    const problemStats = new Map<string, { total: number; submitted: number; teamNames: string[] }>();

    for (const team of teams) {
        const t = team as any;
        const leader = t.leaderId;
        const problem = t.problemId;
        const submission = submissionMap.get(t._id.toString());

        const problemTitle = problem?.title || 'Not Selected';
        if (!problemStats.has(problemTitle)) {
            problemStats.set(problemTitle, { total: 0, submitted: 0, teamNames: [] });
        }
        const stat = problemStats.get(problemTitle)!;
        stat.total++;
        stat.teamNames.push(t.name);
        if (submission) stat.submitted++;

        // Members (excluding leader)
        const otherMembers = (t.members as any[] || []).filter(
            (m: any) => m._id?.toString() !== leader?._id?.toString()
        );

        const row = [
            srNo,
            escapeCSV(t.name),
            escapeCSV(t.instituteName),
            escapeCSV(t.instituteCode),
            escapeCSV(t.spocDistrict || 'N/A'),
            escapeCSV(t.spocState || 'N/A'),
            escapeCSV(problemTitle),
            escapeCSV(problem?.category || ''),
            escapeCSV(submission?.youtubeVideoLink || 'NOT SUBMITTED'),
            escapeCSV(submission?.status || 'NOT SUBMITTED'),
            escapeCSV(submission?.documentOriginalName || ''),
            submission?.createdAt ? new Date(submission.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '',
            escapeCSV(leader?.name || 'N/A'),
            escapeCSV(leader?.email || 'N/A'),
            escapeCSV(leader?.phone || 'N/A'),
            escapeCSV(otherMembers[0]?.name || ''),
            escapeCSV(otherMembers[0]?.email || ''),
            escapeCSV(otherMembers[1]?.name || ''),
            escapeCSV(otherMembers[1]?.email || ''),
            escapeCSV(otherMembers[2]?.name || ''),
            escapeCSV(otherMembers[2]?.email || ''),
            escapeCSV(otherMembers[3]?.name || ''),
            escapeCSV(otherMembers[3]?.email || ''),
            escapeCSV(t.mentorName),
            escapeCSV(t.mentorEmail),
            escapeCSV(t.spocName),
            escapeCSV(t.spocEmail)
        ];

        flatRows.push(row.join(','));
        srNo++;
    }

    // ==================== STRUCTURED REPORT CSV ====================
    const reportRows: string[] = [];
    reportRows.push('═══════════════════════════════════════════════════════════════════════════════');
    reportRows.push('HACKSPHERE PHASE 2 — SHORTLISTED TEAMS REPORT');
    reportRows.push(`Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
    reportRows.push('═══════════════════════════════════════════════════════════════════════════════');
    reportRows.push('');
    reportRows.push(`TOTAL SHORTLISTED TEAMS,${teams.length}`);
    reportRows.push(`TEAMS WITH SUBMISSIONS,${submissions.length}`);
    reportRows.push(`TEAMS WITHOUT SUBMISSIONS,${teams.length - submissions.length}`);
    reportRows.push('');

    // Problem Statement Breakdown
    reportRows.push('───────────────────────────────────────────────────────────────────────────────');
    reportRows.push('PROBLEM STATEMENT BREAKDOWN');
    reportRows.push('───────────────────────────────────────────────────────────────────────────────');
    reportRows.push('Problem Statement,Shortlisted Teams,Submitted,Pending');

    const sortedProblems = [...problemStats.entries()].sort((a, b) => b[1].total - a[1].total);
    sortedProblems.forEach(([problem, stat]) => {
        reportRows.push(`${escapeCSV(problem)},${stat.total},${stat.submitted},${stat.total - stat.submitted}`);
    });
    reportRows.push('');
    reportRows.push('');

    // Per-Problem Team Lists with YouTube Links
    reportRows.push('═══════════════════════════════════════════════════════════════════════════════');
    reportRows.push('REVIEW SHEET — TEAMS GROUPED BY PROBLEM STATEMENT');
    reportRows.push('═══════════════════════════════════════════════════════════════════════════════');
    reportRows.push('');

    for (const [problemTitle, stat] of sortedProblems) {
        reportRows.push('───────────────────────────────────────────────────────────────────────────────');
        reportRows.push(`PROBLEM: ${escapeCSV(problemTitle)}`);
        reportRows.push(`Teams: ${stat.total} | Submitted: ${stat.submitted}`);
        reportRows.push('───────────────────────────────────────────────────────────────────────────────');
        reportRows.push('Team Name,Institute,YouTube Link,Submission Status,Document');

        for (const team of teams) {
            const t = team as any;
            const problem = t.problemId;
            const pTitle = problem?.title || 'Not Selected';

            if (pTitle !== problemTitle) continue;

            const submission = submissionMap.get(t._id.toString());
            reportRows.push([
                escapeCSV(t.name),
                escapeCSV(t.instituteName),
                escapeCSV(submission?.youtubeVideoLink || 'NOT YET SUBMITTED'),
                escapeCSV(submission?.status || 'NOT SUBMITTED'),
                escapeCSV(submission?.documentOriginalName || '')
            ].join(','));
        }
        reportRows.push('');
    }

    // ==================== WRITE FILES ====================
    const outputDir = path.join(__dirname, '../../exports');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    // Write flat CSV
    const flatFileName = `shortlisted_teams_flat_${timestamp}.csv`;
    const flatPath = path.join(outputDir, flatFileName);
    fs.writeFileSync(flatPath, '\ufeff' + flatRows.join('\n'), 'utf8');
    console.log(`✅ Flat CSV (for reviewers):     ${flatPath}`);

    // Write structured report
    const reportFileName = `shortlisted_teams_report_${timestamp}.csv`;
    const reportPath = path.join(outputDir, reportFileName);
    fs.writeFileSync(reportPath, '\ufeff' + reportRows.join('\n'), 'utf8');
    console.log(`✅ Structured report CSV:        ${reportPath}`);

    // ==================== CONSOLE SUMMARY ====================
    console.log('\n' + '='.repeat(60));
    console.log('📋 EXPORT SUMMARY');
    console.log('='.repeat(60));
    console.log(`  Shortlisted Teams:    ${teams.length}`);
    console.log(`  With Submissions:     ${submissions.length}`);
    console.log(`  Pending Submission:   ${teams.length - submissions.length}`);
    console.log('');
    console.log('  Problem Statement Breakdown:');
    sortedProblems.forEach(([problem, stat]) => {
        console.log(`    • ${problem.substring(0, 50).padEnd(50)} : ${stat.total} teams (${stat.submitted} submitted)`);
    });
    console.log('='.repeat(60));

    // List teams that haven't submitted yet
    const teamsWithoutSubmission = teams.filter((t: any) => !submissionMap.has(t._id.toString()));
    if (teamsWithoutSubmission.length > 0) {
        console.log('\n⚠️  Teams that have NOT submitted yet:');
        teamsWithoutSubmission.forEach((t: any, i: number) => {
            console.log(`    ${i + 1}. ${t.name} (${t.instituteName})`);
        });
    }

    await mongoose.disconnect();
    console.log('\n✅ Done! Files saved in server/exports/');
};

// Run
exportShortlistedTeams().catch(console.error);
