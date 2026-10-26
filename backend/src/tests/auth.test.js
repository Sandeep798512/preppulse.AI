const test = require('node:test');
const assert = require('node:assert');
const User = require('../models/User');

test('User Model Schema Verification', () => {
  const userData = {
    name: 'Rahul Sharma',
    email: 'rahul.test@placement.edu',
    passwordHash: 'hashed_secret_pass',
    role: 'student',
    targetRoles: ['Software Developer', 'Full Stack Developer'],
    skills: ['Java', 'React', 'Node.js', 'SQL'],
    education: {
      degree: 'B.Tech',
      branch: 'Computer Science & Engineering',
      college: 'National Institute of Technology',
      graduationYear: 2026,
      cgpa: 8.7,
      backlogs: 0,
    },
  };

  const user = new User(userData);
  assert.strictEqual(user.name, 'Rahul Sharma');
  assert.strictEqual(user.email, 'rahul.test@placement.edu');
  assert.strictEqual(user.role, 'student');
  assert.strictEqual(user.education.cgpa, 8.7);
  assert.strictEqual(user.skills.length, 4);
});
