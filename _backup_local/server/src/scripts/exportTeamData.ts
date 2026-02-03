/**
 * Export Team Data Script - Structured Format
 * Creates a beautifully structured CSV with summary and team details
 * 
 * Usage: npx ts-node src/scripts/exportTeamData.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Import models - must import all models to register schemas
import '../models/User';
import '../models/Problem';
import '../models/Submission';
import '../models/Team';

const Team = mongoose.model('Team');
const Problem = mongoose.model('Problem');
const Submission = mongoose.model('Submission');

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hacksphere';
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

const exportTeamData = async () => {
    await connectDB();

    console.log('\n📊 Fetching team data...\n');

    // Get all approved teams with populated references
    const teams = await Team.find({ status: 'approved' })
        .populate('leaderId', 'name email phone')
        .populate('members', 'name email phone')
        .populate('problemId', 'title category')
        .sort({ approvedAt: -1 });

    console.log(`Found ${teams.length} approved teams\n`);

    // Get all problems for analytics
    const problems = await Problem.find({});

    // Get all submissions
    const submissions = await Submission.find({});
    const submissionMap = new Map<string, any[]>();
    submissions.forEach(s => {
        const key = s.teamId.toString();
        if (!submissionMap.has(key)) {
            submissionMap.set(key, []);
        }
        submissionMap.get(key)!.push(s);
    });

    // Analytics tracking
    const problemStats = new Map<string, number>();
    const stateStats = new Map<string, number>();
    const districtStats = new Map<string, number>();

    // First pass: collect stats
    for (const team of teams) {
        const problem = team.problemId as any;
        const problemTitle = problem?.title || 'Not Selected';
        problemStats.set(problemTitle, (problemStats.get(problemTitle) || 0) + 1);

        const state = (team as any).spocState || 'Unknown';
        stateStats.set(state, (stateStats.get(state) || 0) + 1);

        const district = (team as any).spocDistrict || 'Unknown';
        districtStats.set(district, (districtStats.get(district) || 0) + 1);
    }

    // Build CSV rows
    const rows: string[] = [];

    // ==================== SUMMARY SECTION ====================
    rows.push('═══════════════════════════════════════════════════════════════════════════════════════════════════');
    rows.push('HACKSPHERE TEAM DATA EXPORT');
    rows.push(`Generated: ${new Date().toLocaleString()}`);
    rows.push('═══════════════════════════════════════════════════════════════════════════════════════════════════');
    rows.push('');

    // Key Stats Row
    rows.push(`TOTAL TEAMS,${teams.length}`);
    rows.push('');

    // Problem Statement Distribution
    rows.push('─────────────────────────────────────────────────────────────────────────────────────────────────────');
    rows.push('PROBLEM STATEMENT DISTRIBUTION');
    rows.push('─────────────────────────────────────────────────────────────────────────────────────────────────────');
    rows.push('Problem Statement,Teams Count,Percentage');
    const sortedProblems = [...problemStats.entries()].sort((a, b) => b[1] - a[1]);
    sortedProblems.forEach(([problem, count]) => {
        const percentage = ((count / teams.length) * 100).toFixed(1);
        rows.push(`${escapeCSV(problem)},${count},${percentage}%`);
    });
    rows.push('');

    // State Distribution
    rows.push('─────────────────────────────────────────────────────────────────────────────────────────────────────');
    rows.push('STATE-WISE DISTRIBUTION');
    rows.push('─────────────────────────────────────────────────────────────────────────────────────────────────────');
    rows.push('State,Teams Count,Percentage');
    const sortedStates = [...stateStats.entries()].sort((a, b) => b[1] - a[1]);
    sortedStates.forEach(([state, count]) => {
        const percentage = ((count / teams.length) * 100).toFixed(1);
        rows.push(`${escapeCSV(state)},${count},${percentage}%`);
    });
    rows.push('');

    // District Distribution
    rows.push('─────────────────────────────────────────────────────────────────────────────────────────────────────');
    rows.push('DISTRICT-WISE DISTRIBUTION');
    rows.push('─────────────────────────────────────────────────────────────────────────────────────────────────────');
    rows.push('District,Teams Count,Percentage');
    const sortedDistricts = [...districtStats.entries()].sort((a, b) => b[1] - a[1]);
    sortedDistricts.forEach(([district, count]) => {
        const percentage = ((count / teams.length) * 100).toFixed(1);
        rows.push(`${escapeCSV(district)},${count},${percentage}%`);
    });
    rows.push('');
    rows.push('');

    // ==================== TEAM DETAILS SECTION ====================
    rows.push('═══════════════════════════════════════════════════════════════════════════════════════════════════');
    rows.push('TEAM DETAILS');
    rows.push('═══════════════════════════════════════════════════════════════════════════════════════════════════');
    rows.push('');
    rows.push('Column Key: Role,Name,Phone,Email,Institute,District,State');
    rows.push('');

    let teamNumber = 1;
    for (const team of teams) {
        const leader = (team as any).leaderId;
        const members = ((team as any).members as any[]) || [];
        const problem = (team as any).problemId;

        // Get team submissions
        const teamSubmissions = submissionMap.get((team as any)._id.toString()) || [];
        const latestSubmission = teamSubmissions.sort((a, b) => b.version - a.version)[0];

        // Extract links
        let githubLink = latestSubmission?.repoUrl || '';
        let otherLinks: string[] = [];
        if (latestSubmission?.files) {
            latestSubmission.files.forEach((f: any) => {
                if (f.url) otherLinks.push(f.url);
            });
        }

        // Team Header
        rows.push('───────────────────────────────────────────────────────────────────────────────────────────────────');
        rows.push(`TEAM ${teamNumber}: ${escapeCSV((team as any).name)}`);
        rows.push('───────────────────────────────────────────────────────────────────────────────────────────────────');

        // Team Info Row
        rows.push(`Institute:,${escapeCSV((team as any).instituteName)} (${escapeCSV((team as any).instituteCode)})`);
        rows.push(`Location:,${escapeCSV((team as any).spocDistrict || 'N/A')},"${escapeCSV((team as any).spocState || 'N/A')}"`);
        rows.push(`Problem:,${escapeCSV(problem?.title || 'Not Selected')}`);
        rows.push(`Mentor:,${escapeCSV((team as any).mentorName)},${escapeCSV((team as any).mentorEmail)}`);
        rows.push(`SPOC:,${escapeCSV((team as any).spocName)},${escapeCSV((team as any).spocEmail)}`);
        if (githubLink) {
            rows.push(`GitHub:,${escapeCSV(githubLink)}`);
        }
        if (otherLinks.length > 0) {
            rows.push(`Other Links:,${escapeCSV(otherLinks.join(' | '))}`);
        }
        rows.push(`Approved:,${(team as any).approvedAt?.toISOString().split('T')[0] || 'N/A'}`);
        rows.push('');

        // Members Header
        rows.push('Role,Name,Phone,Email');

        // Leader
        if (leader) {
            rows.push(`L (Leader),${escapeCSV(leader.name)},${escapeCSV(leader.phone || 'N/A')},${escapeCSV(leader.email)}`);
        }

        // Other Members (excluding leader)
        const otherMembers = members.filter(m => m._id?.toString() !== leader?._id?.toString());
        let memberNum = 1;
        for (const member of otherMembers) {
            rows.push(`M${memberNum} (Member),${escapeCSV(member.name)},${escapeCSV(member.phone || 'N/A')},${escapeCSV(member.email)}`);
            memberNum++;
        }

        // Blank rows between teams
        rows.push('');
        rows.push('');
        rows.push('');

        teamNumber++;
    }

    // Write CSV
    const csvContent = rows.join('\n');
    const outputDir = path.join(__dirname, '../../exports');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const csvFileName = `hacksphere_teams_structured_${timestamp}.csv`;
    const csvPath = path.join(outputDir, csvFileName);

    fs.writeFileSync(csvPath, '\ufeff' + csvContent, 'utf8'); // BOM for Excel
    console.log(`✅ Structured CSV exported to: ${csvPath}`);

    // Also generate a simple flat CSV for data analysis
    const flatRows: string[] = [];
    flatRows.push('Team #,Team Name,Role,Member Name,Phone,Email,Institute,Institute Code,District,State,Problem Statement,Mentor,SPOC,GitHub Link,Approved Date');

    teamNumber = 1;
    for (const team of teams) {
        const leader = (team as any).leaderId;
        const members = ((team as any).members as any[]) || [];
        const problem = (team as any).problemId;
        const teamSubmissions = submissionMap.get((team as any)._id.toString()) || [];
        const latestSubmission = teamSubmissions.sort((a, b) => b.version - a.version)[0];
        const githubLink = latestSubmission?.repoUrl || '';

        const commonFields = [
            escapeCSV((team as any).name),
            '', // Role placeholder
            '', // Name placeholder
            '', // Phone placeholder
            '', // Email placeholder
            escapeCSV((team as any).instituteName),
            escapeCSV((team as any).instituteCode),
            escapeCSV((team as any).spocDistrict || 'N/A'),
            escapeCSV((team as any).spocState || 'N/A'),
            escapeCSV(problem?.title || 'Not Selected'),
            escapeCSV((team as any).mentorName),
            escapeCSV((team as any).spocName),
            escapeCSV(githubLink),
            escapeCSV((team as any).approvedAt?.toISOString().split('T')[0] || 'N/A')
        ];

        // Leader row
        if (leader) {
            flatRows.push(`${teamNumber},${commonFields[0]},Leader,${escapeCSV(leader.name)},${escapeCSV(leader.phone || 'N/A')},${escapeCSV(leader.email)},${commonFields.slice(5).join(',')}`);
        }

        // Other members
        const otherMembers = members.filter(m => m._id?.toString() !== leader?._id?.toString());
        for (const member of otherMembers) {
            flatRows.push(`${teamNumber},${commonFields[0]},Member,${escapeCSV(member.name)},${escapeCSV(member.phone || 'N/A')},${escapeCSV(member.email)},${commonFields.slice(5).join(',')}`);
        }

        teamNumber++;
    }

    const flatCsvFileName = `hacksphere_teams_flat_${timestamp}.csv`;
    const flatCsvPath = path.join(outputDir, flatCsvFileName);
    fs.writeFileSync(flatCsvPath, '\ufeff' + flatRows.join('\n'), 'utf8');
    console.log(`✅ Flat CSV exported to: ${flatCsvPath}`);

    // Print summary to console
    console.log('\n' + '='.repeat(60));
    console.log(`� EXPORT SUMMARY`);
    console.log('='.repeat(60));
    console.log(`Total Teams: ${teams.length}`);
    console.log('\nProblem Statement Distribution:');
    sortedProblems.forEach(([problem, count]) => {
        console.log(`  • ${problem.substring(0, 50)}... : ${count} teams`);
    });
    console.log('\nState Distribution:');
    sortedStates.forEach(([state, count]) => {
        console.log(`  • ${state}: ${count} teams`);
    });
    console.log('='.repeat(60));

    await mongoose.disconnect();
    console.log('\n✅ Done! Files saved in server/exports/');
};

// Run the export
exportTeamData().catch(console.error);
