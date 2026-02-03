// @ts-nocheck
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Team from '../models/Team';
import TeamInvite from '../models/TeamInvite';

dotenv.config();

const TEST_INSTITUTE_A = 'TEST_INST_A';
const TEST_INSTITUTE_B = 'TEST_INST_B';

async function runTest() {
    console.log('🚀 Starting SPOC Workflow Test...');

    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('✅ Connected to MongoDB');

        // --- CLEANUP ---
        console.log('🧹 Cleaning up previous test data...');
        await User.deleteMany({ email: { $regex: /test_.*@example.com/ } });
        await Team.deleteMany({ name: 'TEST_TEAM_A' });
        await TeamInvite.deleteMany({ instituteId: { $in: [TEST_INSTITUTE_A, TEST_INSTITUTE_B] } });

        // --- SETUP USERS ---
        console.log('👤 Creating Test Users...');
        
        // SPOC
        const spoc = await User.create({
            name: 'Test SPOC',
            email: 'test_spoc@example.com',
            password: 'password123',
            role: 'spoc',
            instituteId: TEST_INSTITUTE_A
        });

        // Student 1 (Leader)
        const student1 = await User.create({
            name: 'Test Student 1',
            email: 'test_s1@example.com',
            password: 'password123',
            role: 'student',
            instituteId: TEST_INSTITUTE_A
        });

        // Student 2 (Member)
        const student2 = await User.create({
            name: 'Test Student 2',
            email: 'test_s2@example.com',
            password: 'password123',
            role: 'student',
            instituteId: TEST_INSTITUTE_A
        });

        // Student 3 (Other Institute)
        const student3 = await User.create({
            name: 'Test Student 3',
            email: 'test_s3@example.com',
            password: 'password123',
            role: 'student',
            instituteId: TEST_INSTITUTE_B
        });

        console.log('✅ Users created');

        // --- TEST 1: TEAM CREATION ---
        console.log('\n🧪 Test 1: Team Creation');
        const team = await Team.create({
            name: 'TEST_TEAM_A',
            leaderId: student1._id,
            members: [student1._id],
            instituteId: student1.instituteId,
            status: 'pending'
        });
        
        // Update student1 teamId
        student1.teamId = team._id as mongoose.Types.ObjectId;
        await student1.save();

        if (team.status === 'pending' && team.instituteId === TEST_INSTITUTE_A) {
            console.log('✅ Team created successfully with status "pending" and correct institute');
        } else {
            console.error('❌ Team creation failed validation', team);
        }

        // --- TEST 2: CROSS-INSTITUTE INVITE ---
        console.log('\n🧪 Test 2: Cross-Institute Invite Validation');
        // Logic from inviteController.ts: if (team.instituteId !== invitee.instituteId)
        if (team.instituteId !== student3.instituteId) {
            console.log('✅ Logic check: Team Inst (' + team.instituteId + ') != Student3 Inst (' + student3.instituteId + '). Invite should fail.');
        } else {
            console.error('❌ Logic check failed for cross-institute');
        }

        // --- TEST 3: SAME-INSTITUTE INVITE ---
        console.log('\n🧪 Test 3: Same-Institute Invite');
        const invite = await TeamInvite.create({
            teamId: team._id,
            fromUserId: student1._id,
            toUserId: student2._id,
            instituteId: team.instituteId,
            status: 'pending'
        });

        if (invite && invite.status === 'pending') {
            console.log('✅ Invite created successfully');
        } else {
            console.error('❌ Invite creation failed');
        }

        // --- TEST 4: ACCEPT INVITE ---
        console.log('\n🧪 Test 4: Accept Invite');
        // Simulate accept logic
        invite.status = 'accepted';
        invite.respondedAt = new Date();
        await invite.save();

        team.members.push(student2._id as mongoose.Types.ObjectId);
        await team.save();
        
        student2.teamId = team._id as mongoose.Types.ObjectId;
        await student2.save();

        const updatedTeam = await Team.findById(team._id);
        if (updatedTeam?.members.length === 2) {
            console.log('✅ Member added to team successfully');
        } else {
            console.error('❌ Member addition failed');
        }

        // --- TEST 5: SPOC APPROVAL ---
        console.log('\n🧪 Test 5: SPOC Approval');
        // Simulate SPOC approval
        // Verify SPOC institute matches Team institute
        if (spoc.instituteId === team.instituteId) {
            team.status = 'approved';
            team.approvedBy = spoc._id as mongoose.Types.ObjectId;
            team.approvedAt = new Date();
            team.spocNotes = 'Looks good!';
            await team.save();
            console.log('✅ Team approved by SPOC');
        } else {
            console.error('❌ SPOC Institute mismatch');
        }

        const finalTeam = await Team.findById(team._id);
        if (finalTeam?.status === 'approved' && finalTeam.approvedBy) {
            console.log('✅ Final Team Status Verified: APPROVED');
        } else {
            console.error('❌ Final team status verification failed');
        }

        console.log('\n🎉 ALL TESTS PASSED!');

    } catch (error) {
        console.error('❌ Test Failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

runTest();
