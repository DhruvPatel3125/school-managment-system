require('dotenv').config({ path: '../.env' }); // Load root env variables
const app = require('./app');
const { connectDB } = require('./config/db');

// Import Mongoose models to verify/seed the database collections
const Tenant = require('./models/tenant');
const Role = require('./models/role');
const Permission = require('./models/permission');
const User = require('./models/user');
const Class = require('./models/class');
const Student = require('./models/student');
const Staff = require('./models/staff');
const Attendance = require('./models/attendance');
const Assignment = require('./models/assignment');
const Fee = require('./models/fee');

const PORT = process.env.PORT || 5000;

/**
 * Initializes database connection, seeds initial platform data (tenants, roles, permissions, users),
 * and starts listening for HTTP traffic.
 */
const startServer = async () => {
  try {
    // 1. Establish connection to MongoDB Atlas or local MongoDB
    await connectDB();

    // 2. Database Seeding (Runs only in development mode if collections are empty)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Checking database collections for seed data...');

      // A. Seed Demo School Tenants
      const tenantCount = await Tenant.countDocuments();
      if (tenantCount === 0) {
        console.log('🌱 Seeding demo school tenants...');
        await Tenant.create([
          {
            schoolName: 'Delhi Public School',
            subdomain: 'schoola',
            logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?q=80&w=200&h=200&fit=crop',
            primaryColor: '#1e3a8a',
            secondaryColor: '#d97706',
            status: 'active'
          },
          {
            schoolName: 'St. Mary School',
            subdomain: 'schoolb',
            logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=200&h=200&fit=crop',
            primaryColor: '#065f46',
            secondaryColor: '#9d174d',
            status: 'active'
          }
        ]);
        console.log('✅ Demo tenants seeded successfully.');
      }

      // B. Seed Role Collections (without permissions mapped initially)
      const roleCount = await Role.countDocuments();
      if (roleCount === 0) {
        console.log('🌱 Seeding default user roles...');
        await Role.create([
          { name: 'super_admin', description: 'Global administrator of the platform' },
          { name: 'school_admin', description: 'School-level principal / administrator' },
          { name: 'teacher', description: 'School educator / classroom teacher' },
          { name: 'student', description: 'Enrolled school student' },
          { name: 'parent', description: 'Guardian of the student' }
        ]);
        console.log('✅ User roles seeded successfully.');
      }

      // C. Seed Permission Collections and Link them to Roles
      const permissionCount = await Permission.countDocuments();
      if (permissionCount === 0) {
        console.log('🌱 Seeding system permission modules...');
        const seededPermissions = await Permission.create([
          { name: 'manage:tenants', description: 'Can onboard and configure school tenants' },
          { name: 'manage:school', description: 'Can change school configurations' },
          { name: 'write:students', description: 'Can admit and edit student profile records' },
          { name: 'read:students', description: 'Can view student directories' },
          { name: 'write:attendance', description: 'Can record classroom attendance rosters' },
          { name: 'read:attendance', description: 'Can view class attendance reports' }
        ]);
        console.log('✅ Permissions seeded.');

        // Retrieve the roles we just seeded
        const superAdminRole = await Role.findOne({ name: 'super_admin' });
        const schoolAdminRole = await Role.findOne({ name: 'school_admin' });
        const teacherRole = await Role.findOne({ name: 'teacher' });
        const studentRole = await Role.findOne({ name: 'student' });

        // Resolve seeded permission documents
        const manageTenants = seededPermissions.find(p => p.name === 'manage:tenants');
        const manageSchool = seededPermissions.find(p => p.name === 'manage:school');
        const writeStudents = seededPermissions.find(p => p.name === 'write:students');
        const readStudents = seededPermissions.find(p => p.name === 'read:students');
        const writeAttendance = seededPermissions.find(p => p.name === 'write:attendance');
        const readAttendance = seededPermissions.find(p => p.name === 'read:attendance');

        // Assign ObjectIds of permissions to corresponding roles
        if (superAdminRole && manageTenants) {
          superAdminRole.permissions = [manageTenants._id];
          await superAdminRole.save();
        }

        if (schoolAdminRole && manageSchool && writeStudents && readStudents && writeAttendance && readAttendance) {
          schoolAdminRole.permissions = [
            manageSchool._id,
            writeStudents._id,
            readStudents._id,
            writeAttendance._id,
            readAttendance._id
          ];
          await schoolAdminRole.save();
        }

        if (teacherRole && readStudents && writeAttendance && readAttendance) {
          teacherRole.permissions = [
            readStudents._id,
            writeAttendance._id,
            readAttendance._id
          ];
          await teacherRole.save();
        }

        if (studentRole && readAttendance) {
          studentRole.permissions = [readAttendance._id];
          await studentRole.save();
        }

        console.log('✅ Permission-Role mappings established.');
      }

      // D. Seed Default User Accounts
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('🌱 Seeding default login accounts...');
        const schoolATenant = await Tenant.findOne({ subdomain: 'schoola' });
        const schoolBTenant = await Tenant.findOne({ subdomain: 'schoolb' });

        const superAdminRole = await Role.findOne({ name: 'super_admin' });
        const schoolAdminRole = await Role.findOne({ name: 'school_admin' });
        const teacherRole = await Role.findOne({ name: 'teacher' });

        if (schoolATenant && schoolBTenant && superAdminRole && schoolAdminRole && teacherRole) {
          const studentRole = await Role.findOne({ name: 'student' });
          await User.create([
            {
              name: 'Global Platform Admin',
              email: 'admin@educore.app',
              passwordHash: 'Password123', // Model pre-save hook handles hashing
              roleId: superAdminRole._id,
              tenantId: null // Global admin doesn't belong to any specific school tenant
            },
            {
              name: 'Principal DPS A',
              email: 'admin@schoola.com',
              passwordHash: 'Password123',
              roleId: schoolAdminRole._id,
              tenantId: schoolATenant._id
            },
            {
              name: 'Mrs. Sunita Rao (Teacher)',
              email: 'sunita@schoola.com',
              passwordHash: 'Password123',
              roleId: teacherRole._id,
              tenantId: schoolATenant._id
            },
            {
              name: 'Aarav Sharma (Student)',
              email: 'aarav@schoola.com',
              passwordHash: 'Password123',
              roleId: studentRole._id,
              tenantId: schoolATenant._id
            },
            {
              name: 'Dia Patel (Student)',
              email: 'dia@schoola.com',
              passwordHash: 'Password123',
              roleId: studentRole._id,
              tenantId: schoolATenant._id
            },
            {
              name: 'John Doe (Teacher)',
              email: 'teacher@schoolb.com',
              passwordHash: 'Password123',
              roleId: teacherRole._id,
              tenantId: schoolBTenant._id
            },
            {
              name: 'Mr. David Paul (Teacher)',
              email: 'david@schoolb.com',
              passwordHash: 'Password123',
              roleId: teacherRole._id,
              tenantId: schoolBTenant._id
            },
            {
              name: 'Karan Singh (Student)',
              email: 'karan@schoolb.com',
              passwordHash: 'Password123',
              roleId: studentRole._id,
              tenantId: schoolBTenant._id
            }
          ]);
          console.log('✅ Default users seeded successfully.');
        }
      } else {
        // Ensure student and teacher logins exist even if seed ran previously
        const schoolATenant = await Tenant.findOne({ subdomain: 'schoola' });
        const studentRole = await Role.findOne({ name: 'student' });
        const teacherRole = await Role.findOne({ name: 'teacher' });
        if (schoolATenant && studentRole && teacherRole) {
          const hasAarav = await User.findOne({ email: 'aarav@schoola.com' });
          if (!hasAarav) {
            await User.create({
              name: 'Aarav Sharma (Student)',
              email: 'aarav@schoola.com',
              passwordHash: 'Password123',
              roleId: studentRole._id,
              tenantId: schoolATenant._id
            });
          }
          const hasDia = await User.findOne({ email: 'dia@schoola.com' });
          if (!hasDia) {
            await User.create({
              name: 'Dia Patel (Student)',
              email: 'dia@schoola.com',
              passwordHash: 'Password123',
              roleId: studentRole._id,
              tenantId: schoolATenant._id
            });
          }
          const hasSunita = await User.findOne({ email: 'sunita@schoola.com' });
          if (!hasSunita) {
            await User.create({
              name: 'Mrs. Sunita Rao (Teacher)',
              email: 'sunita@schoola.com',
              passwordHash: 'Password123',
              roleId: teacherRole._id,
              tenantId: schoolATenant._id
            });
          }
        }
      }

      // E. Seed Default Classes & Sections
      const classCount = await Class.countDocuments();
      if (classCount === 0) {
        console.log('🌱 Seeding default school classes...');
        const schoolATenant = await Tenant.findOne({ subdomain: 'schoola' });
        const schoolBTenant = await Tenant.findOne({ subdomain: 'schoolb' });

        if (schoolATenant && schoolBTenant) {
          // School A classes
          const class10A = await Class.create({
            name: 'Class 10',
            sections: ['A', 'B'],
            tenantId: schoolATenant._id
          });
          const class11A = await Class.create({
            name: 'Class 11',
            sections: ['A', 'B', 'C'],
            tenantId: schoolATenant._id
          });

          // School B classes
          const class9B = await Class.create({
            name: 'Class 9',
            sections: ['A'],
            tenantId: schoolBTenant._id
          });

          console.log('✅ School classes seeded.');

          // F. Seed Default Students
          const studentCount = await Student.countDocuments();
          if (studentCount === 0) {
            console.log('🌱 Seeding default students...');
            await Student.create([
              {
                admissionNo: 'ADM-2026-001',
                name: 'Aarav Sharma',
                email: 'aarav@schoola.com',
                dob: new Date('2011-05-15'),
                classId: class10A._id,
                section: 'A',
                parentName: 'Ramesh Sharma',
                parentPhone: '9876543210',
                tenantId: schoolATenant._id
              },
              {
                admissionNo: 'ADM-2026-002',
                name: 'Dia Patel',
                email: 'dia@schoola.com',
                dob: new Date('2010-09-20'),
                classId: class10A._id,
                section: 'B',
                parentName: 'Sanjay Patel',
                parentPhone: '9876543211',
                tenantId: schoolATenant._id
              },
              {
                admissionNo: 'ADM-2026-003',
                name: 'Karan Singh',
                email: 'karan@schoolb.com',
                dob: new Date('2012-01-10'),
                classId: class9B._id,
                section: 'A',
                parentName: 'Mohan Singh',
                parentPhone: '9876543212',
                tenantId: schoolBTenant._id
              }
            ]);
            console.log('✅ Default students seeded.');
          }
        }
      }

      // G. Seed Default Staff members
      const staffCount = await Staff.countDocuments();
      if (staffCount === 0) {
        console.log('🌱 Seeding default staff directory...');
        const schoolATenant = await Tenant.findOne({ subdomain: 'schoola' });
        const schoolBTenant = await Tenant.findOne({ subdomain: 'schoolb' });

        if (schoolATenant && schoolBTenant) {
          await Staff.create([
            {
              employeeId: 'EMP-DPS-001',
              name: 'Dr. Anil Mehta',
              email: 'anil@schoola.com',
              designation: 'Principal',
              department: 'Administration',
              tenantId: schoolATenant._id
            },
            {
              employeeId: 'EMP-DPS-002',
              name: 'Mrs. Sunita Rao',
              email: 'sunita@schoola.com',
              designation: 'Teacher',
              department: 'Mathematics',
              tenantId: schoolATenant._id
            },
            {
              employeeId: 'EMP-STM-001',
              name: 'Mr. David Paul',
              email: 'david@schoolb.com',
              designation: 'Teacher',
              department: 'English Lit.',
              tenantId: schoolBTenant._id
            }
          ]);
          console.log('✅ Default staff directory seeded.');
        }
      }

      // H. Seed Demo Attendance, Assignments, and Fees
      const attendanceCount = await Attendance.countDocuments();
      const assignmentCount = await Assignment.countDocuments();
      const feeCount = await Fee.countDocuments();

      if (attendanceCount === 0 || assignmentCount === 0 || feeCount === 0) {
        console.log('🌱 Seeding demo attendance, assignments, and fees...');

        const aarav = await Student.findOne({ email: 'aarav@schoola.com' });
        const dia = await Student.findOne({ email: 'dia@schoola.com' });
        const karan = await Student.findOne({ email: 'karan@schoolb.com' });

        const schoolATenant = await Tenant.findOne({ subdomain: 'schoola' });
        const schoolBTenant = await Tenant.findOne({ subdomain: 'schoolb' });

        if (aarav && dia && schoolATenant) {
          // Attendance logs
          const attendanceData = [];
          for (let i = 1; i <= 15; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            attendanceData.push({
              studentId: aarav._id,
              date,
              status: i === 5 ? 'absent' : (i === 10 ? 'late' : 'present'),
              tenantId: schoolATenant._id
            });
            attendanceData.push({
              studentId: dia._id,
              date,
              status: i === 7 ? 'absent' : 'present',
              tenantId: schoolATenant._id
            });
          }
          if (attendanceCount === 0) {
            await Attendance.insertMany(attendanceData);
            console.log('✅ Demo attendance logs seeded.');
          }

          // Homework assignments
          if (assignmentCount === 0) {
            await Assignment.create([
              {
                title: 'Calculus Assignment 1',
                description: 'Solve exercises 1-10 on limits and continuity.',
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
                classId: aarav.classId,
                section: 'A',
                subject: 'Mathematics',
                submissions: [],
                tenantId: schoolATenant._id
              },
              {
                title: 'Wave Optics Lab Report',
                description: 'Submit your lab observations for the Young Double Slit experiment.',
                dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                classId: aarav.classId,
                section: 'A',
                subject: 'Physics',
                submissions: [
                  {
                    studentId: aarav._id,
                    status: 'submitted',
                    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                    answerText: 'I observed that the fringe width is proportional to the wavelength of light. The calculated wavelength of the laser source is 632.8 nm.'
                  }
                ],
                tenantId: schoolATenant._id
              },
              {
                title: 'Shakespeare Essay',
                description: 'Write a 500-word critical appreciation of Macbeth Act III.',
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                classId: aarav.classId,
                section: 'A',
                subject: 'English',
                submissions: [
                  {
                    studentId: aarav._id,
                    status: 'graded',
                    submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
                    answerText: 'Macbeth Act III represents the turning point of the tragedy. The banquet scene illustrates Macbeth\'s psychological decline...',
                    grade: 'A',
                    feedback: 'Excellent work. Your analysis of Macbeth\'s guilt is profound.'
                  }
                ],
                tenantId: schoolATenant._id
              }
            ]);
            console.log('✅ Demo assignments seeded.');
          }

          // Exam Fees
          if (feeCount === 0) {
            await Fee.create([
              {
                studentId: aarav._id,
                title: 'Term-1 Board Exam Fees',
                amount: 1500,
                dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                status: 'pending',
                tenantId: schoolATenant._id
              },
              {
                studentId: aarav._id,
                title: 'Sports Club Fee Q3',
                amount: 500,
                dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                status: 'paid',
                paymentDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
                transactionId: 'TXN-FEE1098273',
                tenantId: schoolATenant._id
              },
              {
                studentId: dia._id,
                title: 'Term-1 Board Exam Fees',
                amount: 1500,
                dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                status: 'pending',
                tenantId: schoolATenant._id
              }
            ]);
            console.log('✅ Demo fees seeded.');
          }
        }

        // Attendance & Fees for Karan (School B)
        if (karan && schoolBTenant) {
          const attendanceDataB = [];
          for (let i = 1; i <= 10; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            attendanceDataB.push({
              studentId: karan._id,
              date,
              status: i === 3 ? 'absent' : 'present',
              tenantId: schoolBTenant._id
            });
          }
          if (attendanceCount === 0) {
            await Attendance.insertMany(attendanceDataB);
          }

          if (feeCount === 0) {
            await Fee.create([
              {
                studentId: karan._id,
                title: 'Registration Fee',
                amount: 1000,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                status: 'pending',
                tenantId: schoolBTenant._id
              }
            ]);
          }
        }
      }
    }

    // 3. Start API Server Listener
    app.listen(PORT, () => {
      console.log(`🚀 EduCore ERP API Server listening on port ${PORT} in ${process.env.NODE_ENV} mode.`);
    });
  } catch (error) {
    console.error('❌ Failed to launch API Server:', error.stack || error);
    process.exit(1);
  }
};

startServer();
