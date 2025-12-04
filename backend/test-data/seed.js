const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Department = require('../models/Department');
const Class = require('../models/Class');
const Course = require('../models/Course');
const Student = require('../models/Student');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const departments = [
  {
    departmentName: 'Computer Science',
    departmentCode: 'CS',
    headOfDepartment: {
      name: 'Dr. John Smith',
      email: 'john.smith@university.edu',
      phone: '1234567890',
      qualification: 'PhD in Computer Science'
    },
    contactEmail: 'cs@university.edu',
    contactPhone: '1234567891',
    establishmentYear: 2000,
    description: 'Department of Computer Science offering cutting-edge programs',
    totalFaculty: 25,
    totalStudents: 500,
    location: {
      building: 'Science Block',
      floor: '3rd Floor',
      room: '301'
    },
    facilities: ['Computer Labs', 'Research Center', 'Library'],
    status: 'Active'
  },
  {
    departmentName: 'Electrical Engineering',
    departmentCode: 'EE',
    headOfDepartment: {
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@university.edu',
      phone: '1234567892',
      qualification: 'PhD in Electrical Engineering'
    },
    contactEmail: 'ee@university.edu',
    contactPhone: '1234567893',
    establishmentYear: 1995,
    description: 'Department of Electrical Engineering with modern labs',
    totalFaculty: 20,
    totalStudents: 400,
    location: {
      building: 'Engineering Block',
      floor: '2nd Floor',
      room: '201'
    },
    facilities: ['Electronics Lab', 'Power Systems Lab', 'Workshop'],
    status: 'Active'
  },
  {
    departmentName: 'Business Administration',
    departmentCode: 'BA',
    headOfDepartment: {
      name: 'Dr. Michael Brown',
      email: 'michael.brown@university.edu',
      phone: '1234567894',
      qualification: 'PhD in Business Administration'
    },
    contactEmail: 'ba@university.edu',
    contactPhone: '1234567895',
    establishmentYear: 1990,
    description: 'Department of Business Administration focusing on modern business practices',
    totalFaculty: 30,
    totalStudents: 600,
    location: {
      building: 'Commerce Block',
      floor: '1st Floor',
      room: '101'
    },
    facilities: ['Case Study Room', 'Business Lab', 'Conference Hall'],
    status: 'Active'
  }
];

const classes = [
  {
    className: 'CS101',
    section: 'A',
    academicYear: '2024-2025',
    capacity: 50,
    currentStrength: 45,
    department: null, // Will be populated
    classTeacher: {
      name: 'Prof. Alice Johnson',
      email: 'alice.johnson@university.edu',
      phone: '1234567801'
    },
    schedule: {
      days: ['Monday', 'Wednesday', 'Friday'],
      time: { start: '09:00', end: '10:00' },
      roomNumber: 'CS-101'
    },
    description: 'Introduction to Computer Science',
    status: 'Active'
  },
  {
    className: 'EE201',
    section: 'B',
    academicYear: '2024-2025',
    capacity: 40,
    currentStrength: 38,
    department: null, // Will be populated
    classTeacher: {
      name: 'Prof. Bob Williams',
      email: 'bob.williams@university.edu',
      phone: '1234567802'
    },
    schedule: {
      days: ['Tuesday', 'Thursday'],
      time: { start: '11:00', end: '12:30' },
      roomNumber: 'EE-201'
    },
    description: 'Electrical Circuits and Systems',
    status: 'Active'
  },
  {
    className: 'BA301',
    section: 'C',
    academicYear: '2024-2025',
    capacity: 60,
    currentStrength: 55,
    department: null, // Will be populated
    classTeacher: {
      name: 'Prof. Carol Davis',
      email: 'carol.davis@university.edu',
      phone: '1234567803'
    },
    schedule: {
      days: ['Monday', 'Wednesday'],
      time: { start: '14:00', end: '15:30' },
      roomNumber: 'BA-301'
    },
    description: 'Principles of Management',
    status: 'Active'
  }
];

const courses = [
  {
    courseName: 'Data Structures',
    courseCode: 'CS201',
    creditHours: 3,
    description: 'Introduction to data structures and algorithms',
    department: null, // Will be populated
    instructor: {
      name: 'Dr. David Wilson',
      email: 'david.wilson@university.edu',
      phone: '1234567810'
    },
    prerequisites: [],
    semester: 'Fall',
    year: 2,
    schedule: {
      days: ['Monday', 'Wednesday'],
      time: { start: '10:00', end: '11:00' },
      room: 'CS-201'
    },
    maxStudents: 50,
    enrolledStudents: 45,
    courseType: 'Core',
    gradingPolicy: {
      assignments: 30,
      midterm: 30,
      final: 40,
      projects: 20,
      attendance: 10
    },
    status: 'Active'
  },
  {
    courseName: 'Database Management',
    courseCode: 'CS202',
    creditHours: 3,
    description: 'Fundamentals of database systems',
    department: null, // Will be populated
    instructor: {
      name: 'Dr. Emily Taylor',
      email: 'emily.taylor@university.edu',
      phone: '1234567811'
    },
    prerequisites: [], // Will be populated
    semester: 'Spring',
    year: 2,
    schedule: {
      days: ['Tuesday', 'Thursday'],
      time: { start: '11:00', end: '12:00' },
      room: 'CS-202'
    },
    maxStudents: 40,
    enrolledStudents: 35,
    courseType: 'Core',
    gradingPolicy: {
      assignments: 25,
      midterm: 35,
      final: 40,
      projects: 30,
      attendance: 10
    },
    status: 'Active'
  },
  {
    courseName: 'Digital Electronics',
    courseCode: 'EE101',
    creditHours: 4,
    description: 'Introduction to digital circuits and systems',
    department: null, // Will be populated
    instructor: {
      name: 'Dr. Frank Miller',
      email: 'frank.miller@university.edu',
      phone: '1234567812'
    },
    prerequisites: [],
    semester: 'Fall',
    year: 1,
    schedule: {
      days: ['Monday', 'Wednesday', 'Friday'],
      time: { start: '09:00', end: '10:00' },
      room: 'EE-101'
    },
    maxStudents: 60,
    enrolledStudents: 55,
    courseType: 'Core',
    gradingPolicy: {
      assignments: 20,
      midterm: 30,
      final: 50,
      projects: 25,
      attendance: 10
    },
    status: 'Active'
  }
];

const students = [
  {
    name: 'John Doe',
    rollNumber: 'CS2023001',
    email: 'john.doe@student.university.edu',
    phone: '9876543210',
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    dateOfBirth: new Date('2000-01-15'),
    gender: 'Male',
    class: null, // Will be populated
    department: null, // Will be populated
    courses: [], // Will be populated
    enrollmentDate: new Date('2023-08-01'),
    status: 'Active',
    academicYear: '2023-2024',
    guardianInfo: {
      name: 'Robert Doe',
      relationship: 'Father',
      phone: '9876543211',
      email: 'robert.doe@email.com'
    },
    photo: 'john_doe.jpg'
  },
  {
    name: 'Jane Smith',
    rollNumber: 'EE2023002',
    email: 'jane.smith@student.university.edu',
    phone: '9876543212',
    address: {
      street: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA'
    },
    dateOfBirth: new Date('2001-03-20'),
    gender: 'Female',
    class: null, // Will be populated
    department: null, // Will be populated
    courses: [], // Will be populated
    enrollmentDate: new Date('2023-08-01'),
    status: 'Active',
    academicYear: '2023-2024',
    guardianInfo: {
      name: 'Mary Smith',
      relationship: 'Mother',
      phone: '9876543213',
      email: 'mary.smith@email.com'
    },
    photo: 'jane_smith.jpg'
  },
  {
    name: 'Alice Johnson',
    rollNumber: 'BA2023003',
    email: 'alice.johnson@student.university.edu',
    phone: '9876543214',
    address: {
      street: '789 Pine Road',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    },
    dateOfBirth: new Date('2002-06-10'),
    gender: 'Female',
    class: null, // Will be populated
    department: null, // Will be populated
    courses: [], // Will be populated
    enrollmentDate: new Date('2023-08-01'),
    status: 'Active',
    academicYear: '2023-2024',
    guardianInfo: {
      name: 'Thomas Johnson',
      relationship: 'Father',
      phone: '9876543215',
      email: 'thomas.johnson@email.com'
    },
    photo: 'alice_johnson.jpg'
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database...');

    // Clear existing data
    await Promise.all([
      Department.deleteMany({}),
      Class.deleteMany({}),
      Course.deleteMany({}),
      Student.deleteMany({})
    ]);

    console.log('✅ Cleared existing data');

    // Create departments
    const createdDepartments = await Department.insertMany(departments);
    console.log(`✅ Created ${createdDepartments.length} departments`);

    // Update classes with department IDs
    const csDept = createdDepartments.find(d => d.departmentCode === 'CS');
    const eeDept = createdDepartments.find(d => d.departmentCode === 'EE');
    const baDept = createdDepartments.find(d => d.departmentCode === 'BA');

    classes[0].department = csDept._id;
    classes[1].department = eeDept._id;
    classes[2].department = baDept._id;

    // Create classes
    const createdClasses = await Class.insertMany(classes);
    console.log(`✅ Created ${createdClasses.length} classes`);

    // Update courses with department IDs and prerequisites
    courses[0].department = csDept._id;
    courses[1].department = csDept._id;
    courses[2].department = eeDept._id;

    // Create courses first to get their IDs
    const createdCourses = await Course.insertMany(courses);
    console.log(`✅ Created ${createdCourses.length} courses`);

    // Update course prerequisites (CS202 requires CS201)
    const cs201Course = createdCourses.find(c => c.courseCode === 'CS201');
    const cs202Course = createdCourses.find(c => c.courseCode === 'CS202');
    
    if (cs201Course && cs202Course) {
      cs202Course.prerequisites = [cs201Course._id];
      await cs202Course.save();
    }

    // Update students with class, department, and course IDs
    students[0].class = createdClasses[0]._id; // CS101-A
    students[0].department = csDept._id;
    students[0].courses = [createdCourses[0]._id, createdCourses[1]._id]; // CS201, CS202

    students[1].class = createdClasses[1]._id; // EE201-B
    students[1].department = eeDept._id;
    students[1].courses = [createdCourses[2]._id]; // EE101

    students[2].class = createdClasses[2]._id; // BA301-C
    students[2].department = baDept._id;
    students[2].courses = [];

    // Create students
    const createdStudents = await Student.insertMany(students);
    console.log(`✅ Created ${createdStudents.length} students`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Departments: ${createdDepartments.length}`);
    console.log(`   Classes: ${createdClasses.length}`);
    console.log(`   Courses: ${createdCourses.length}`);
    console.log(`   Students: ${createdStudents.length}`);

    // Display sample data
    console.log('\n🔗 Sample Data IDs:');
    console.log(`   CS Department ID: ${csDept._id}`);
    console.log(`   CS101 Class ID: ${createdClasses[0]._id}`);
    console.log(`   CS201 Course ID: ${createdCourses[0]._id}`);
    console.log(`   John Doe Student ID: ${createdStudents[0]._id}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔒 Database connection closed');
  }
};

// Run the seed function
seedDatabase();