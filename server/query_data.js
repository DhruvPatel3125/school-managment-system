const mongoose = require('mongoose');
const Attendance = require('./src/models/attendance');
const Assignment = require('./src/models/assignment');
const Fee = require('./src/models/fee');
const Student = require('./src/models/student');

const MONGODB_URI = 'mongodb+srv://school-management:402125@cluster0.cbtvu9x.mongodb.net/educore_db?retryWrites=true&w=majority';

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");
  
  const student = await Student.findOne({ email: 'aarav@schoola.com' });
  if (!student) {
    console.log("Student Aarav not found.");
    return;
  }

  console.log(`\n--- STUDENT DETAILS: ${student.name} ---`);
  console.log(`ID: ${student._id}, Class: ${student.classId}, Section: ${student.section}`);

  const attendance = await Attendance.find({ studentId: student._id });
  console.log(`\nAttendance records found: ${attendance.length}`);
  attendance.forEach(a => {
    console.log(`- Date: ${a.date.toISOString().split('T')[0]}, Status: ${a.status}`);
  });

  const assignments = await Assignment.find({ classId: student.classId, section: student.section });
  console.log(`\nAssignments found: ${assignments.length}`);
  assignments.forEach(a => {
    const sub = a.submissions.find(s => s.studentId.toString() === student._id.toString());
    console.log(`- Title: ${a.title}, Subject: ${a.subject}, Due: ${a.dueDate.toISOString().split('T')[0]}, Status: ${sub ? sub.status : 'pending'}`);
  });

  const fees = await Fee.find({ studentId: student._id });
  console.log(`\nFees found: ${fees.length}`);
  fees.forEach(f => {
    console.log(`- Title: ${f.title}, Amount: ${f.amount}, Status: ${f.status}`);
  });

  await mongoose.disconnect();
}

run().catch(console.error);
