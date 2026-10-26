const LearningRoadmap = require('../models/LearningRoadmap');
const RoadmapTask = require('../models/RoadmapTask');
const CareerGoal = require('../models/CareerGoal');
const LearningProgress = require('../models/LearningProgress');
const { calculateSkillGaps } = require('./skillGapService');
const { mapSkillToPlatformRoute } = require('./recommendationService');

/**
 * Generate a new Learning Roadmap for a user and active CareerGoal
 */
const generateRoadmap = async (user, goal, reason = 'initial_generation') => {
  const userId = user._id;

  // 1. Archive previous active roadmaps
  const existingActive = await LearningRoadmap.find({ userId, status: 'active' });
  let nextVersion = 1;

  for (const old of existingActive) {
    if (old.roadmapVersion >= nextVersion) {
      nextVersion = old.roadmapVersion + 1;
    }
    old.status = 'archived';
    await old.save();
  }

  // 2. Fetch Skill Gaps
  const skillGapData = await calculateSkillGaps(user, goal.primaryRole);
  const gaps = skillGapData.gaps;

  const targetRole = goal.primaryRole;
  const dailyHours = goal.dailyStudyHours || 2;
  const dailyMinutes = dailyHours * 60;

  // 3. Define Roadmap Phases based on actual gaps
  const phases = [
    {
      phaseNumber: 1,
      title: 'Programming & Core Fundamentals',
      focusArea: 'Language Basics, OOP & Core CS Concepts',
      status: 'in_progress',
      completedTasks: 0,
      totalTasks: 0,
    },
    {
      phaseNumber: 2,
      title: 'Data Structures & Algorithmic Problem Solving',
      focusArea: 'Arrays, Strings, Searching, Sorting & DSA Practice',
      status: 'not_started',
      completedTasks: 0,
      totalTasks: 0,
    },
    {
      phaseNumber: 3,
      title: 'Role-Specific Technical Mastery & Frameworks',
      focusArea: `${targetRole} Domain Skills, APIs & DB Architecture`,
      status: 'not_started',
      completedTasks: 0,
      totalTasks: 0,
    },
    {
      phaseNumber: 4,
      title: 'Resume Optimization, Mock Interviews & Placement Readiness',
      focusArea: 'AI Mock Interviews, Resume vs JD Match & Final Prep',
      status: 'not_started',
      completedTasks: 0,
      totalTasks: 0,
    },
  ];

  // 4. Define Weekly Goals
  const weeklyGoals = [
    {
      weekNumber: 1,
      title: 'Week 1: Core Fundamentals & Basic DSA',
      primaryGoal: 'Strengthen Programming Language & Array Problem Solving',
      targets: ['Review Language Concepts', 'Solve 10 Easy Array/String Problems', 'Complete Technical MCQ Assessment'],
      expectedImprovement: 'Improve Core CS Score by +10%',
      completed: false,
    },
    {
      weekNumber: 2,
      title: 'Week 2: Advanced Data Structures & DBMS',
      primaryGoal: 'Master Searching, Sorting, Stacks & SQL Queries',
      targets: ['Solve 10 Medium Coding Problems', 'Practice SQL & DBMS MCQs', 'Build Small Module Project'],
      expectedImprovement: 'Improve Coding & Database Scores by +15%',
      completed: false,
    },
    {
      weekNumber: 3,
      title: 'Week 3: Domain Frameworks & Resume Alignment',
      primaryGoal: 'Deep-dive into Frameworks & Resume JD Matching',
      targets: ['Complete Domain Technical Assessment', 'Analyze Resume vs Target JD', 'Solve 10 Medium/Hard Problems'],
      expectedImprovement: 'Improve Resume Match & Technical Knowledge by +12%',
      completed: false,
    },
    {
      weekNumber: 4,
      title: 'Week 4: AI Mock Interviews & Final Readiness',
      primaryGoal: 'Conduct Technical Mock Interviews & Behavioral Prep',
      targets: ['Complete 2 AI Technical Mock Interviews', 'Practice STAR Project Stories', 'Final Placement Readiness Evaluation'],
      expectedImprovement: 'Achieve 75+ Overall Placement Readiness',
      completed: false,
    },
  ];

  const startDate = new Date();
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 28); // 4-week roadmap

  // 5. Create LearningRoadmap record
  const newRoadmap = await LearningRoadmap.create({
    userId,
    goalId: goal._id,
    targetRole,
    startDate,
    targetDate,
    status: 'active',
    overallProgress: 0,
    currentPhase: 1,
    phases,
    weeklyGoals,
    dailyStudyTarget: dailyHours,
    roadmapVersion: nextVersion,
    reason,
  });

  // 6. Generate Tasks respecting dailyMinutes limit
  const tasksToCreate = [];
  const topCriticalGaps = gaps.slice(0, 5);

  let taskCountByPhase = { 1: 0, 2: 0, 3: 0, 4: 0 };

  // For 4 weeks, 5 days/week = 20 active prep days
  for (let week = 1; week <= 4; week++) {
    for (let day = 1; day <= 5; day++) {
      let dailyAllocatedMinutes = 0;
      const phaseNum = week;

      // Select gap to target for this day
      const targetGap = topCriticalGaps[(week + day) % topCriticalGaps.length] || topCriticalGaps[0];
      const skillName = targetGap.skill;
      const priority = targetGap.priority;

      // Task 1: Learn / Concept Revision (30 mins)
      if (dailyAllocatedMinutes + 30 <= dailyMinutes) {
        const route1 = mapSkillToPlatformRoute(skillName, 'PRACTICE');
        tasksToCreate.push({
          userId,
          roadmapId: newRoadmap._id,
          title: `Learn & Review ${skillName} Concepts`,
          description: `Study fundamental principles and design patterns in ${skillName}.`,
          type: 'LEARN',
          skill: skillName,
          priority,
          estimatedMinutes: 30,
          difficulty: 'Medium',
          relatedModule: route1.module,
          relatedRoute: route1.route,
          status: 'not_started',
          weekNumber: week,
          dayNumber: day,
          dueDate: new Date(startDate.getTime() + ((week - 1) * 7 + (day - 1)) * 86400000),
        });
        dailyAllocatedMinutes += 30;
        taskCountByPhase[phaseNum]++;
      }

      // Task 2: Hands-on Coding or Quiz Practice (45-60 mins)
      const remainingForTask2 = Math.min(60, dailyMinutes - dailyAllocatedMinutes);
      if (remainingForTask2 >= 30) {
        const isCodingTask = skillName === 'DSA' || targetGap.category === 'Coding' || day % 2 === 1;
        const taskType2 = isCodingTask ? 'CODE' : 'QUIZ';
        const route2 = mapSkillToPlatformRoute(skillName, taskType2);

        tasksToCreate.push({
          userId,
          roadmapId: newRoadmap._id,
          title: isCodingTask ? `Solve ${skillName} Problems` : `Practice ${skillName} MCQs`,
          description: isCodingTask ? `Solve 2 ${skillName} problem challenges on the platform.` : `Complete a 15-question ${skillName} technical quiz.`,
          type: taskType2,
          skill: skillName,
          priority,
          estimatedMinutes: remainingForTask2,
          difficulty: targetGap.currentScore < 50 ? 'Easy' : 'Medium',
          relatedModule: route2.module,
          relatedRoute: route2.route,
          status: 'not_started',
          weekNumber: week,
          dayNumber: day,
          dueDate: new Date(startDate.getTime() + ((week - 1) * 7 + (day - 1)) * 86400000),
        });
        dailyAllocatedMinutes += remainingForTask2;
        taskCountByPhase[phaseNum]++;
      }

      // Task 3: Interview / Revision / Project Task (if study limit permits)
      const remainingForTask3 = dailyMinutes - dailyAllocatedMinutes;
      if (remainingForTask3 >= 20 && day === 5) {
        const taskType3 = week === 4 ? 'INTERVIEW' : 'PROJECT';
        const route3 = mapSkillToPlatformRoute(skillName, taskType3);

        tasksToCreate.push({
          userId,
          roadmapId: newRoadmap._id,
          title: week === 4 ? 'Conduct AI Technical Mock Interview' : `Review ${skillName} Project Architecture`,
          description: week === 4 ? 'Complete a 15-minute simulated technical interview session.' : 'Work on real-world placement project implementation.',
          type: taskType3,
          skill: skillName,
          priority: 'High',
          estimatedMinutes: remainingForTask3,
          difficulty: 'Medium',
          relatedModule: route3.module,
          relatedRoute: route3.route,
          status: 'not_started',
          weekNumber: week,
          dayNumber: day,
          dueDate: new Date(startDate.getTime() + ((week - 1) * 7 + (day - 1)) * 86400000),
        });
        taskCountByPhase[phaseNum]++;
      }
    }
  }

  // Insert created tasks
  await RoadmapTask.insertMany(tasksToCreate);

  // Update total task count per phase in newRoadmap
  newRoadmap.phases.forEach((p) => {
    p.totalTasks = taskCountByPhase[p.phaseNumber] || 0;
  });
  await newRoadmap.save();

  return newRoadmap;
};

/**
 * Get Today's tasks for user's active roadmap
 */
const getTodayTasks = async (userId) => {
  const activeRoadmap = await LearningRoadmap.findOne({ userId, status: 'active' });
  if (!activeRoadmap) return { roadmap: null, tasks: [] };

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  // Find tasks due today or incomplete tasks from previous days
  let tasks = await RoadmapTask.find({
    userId,
    roadmapId: activeRoadmap._id,
    $or: [
      { dueDate: { $gte: start, $lte: end } },
      { status: { $in: ['not_started', 'in_progress'] } },
    ],
  }).sort({ priority: 1, dueDate: 1 }).limit(6);

  if (tasks.length === 0) {
    tasks = await RoadmapTask.find({
      userId,
      roadmapId: activeRoadmap._id,
    }).sort({ weekNumber: 1, dayNumber: 1 }).limit(4);
  }

  return {
    roadmap: activeRoadmap,
    tasks,
  };
};

/**
 * Update task status and recalculate roadmap & streak progress
 */
const updateTaskStatus = async (userId, taskId, status, timeSpent = 0, score = 0) => {
  const task = await RoadmapTask.findOne({ _id: taskId, userId });
  if (!task) throw new Error('Roadmap task not found');

  task.status = status;
  if (status === 'completed') {
    task.completedAt = new Date();
    task.timeSpent = timeSpent || task.estimatedMinutes;
    task.score = score || 100;
  }
  await task.save();

  // Recalculate roadmap overall progress
  const roadmap = await LearningRoadmap.findById(task.roadmapId);
  if (roadmap) {
    const allTasks = await RoadmapTask.find({ roadmapId: roadmap._id });
    const totalTasksCount = allTasks.length;
    const completedTasksCount = allTasks.filter((t) => t.status === 'completed').length;

    roadmap.overallProgress = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

    // Update phase completion counts
    roadmap.phases.forEach((p) => {
      const phaseTasks = allTasks.filter((t) => t.weekNumber === p.phaseNumber);
      p.totalTasks = phaseTasks.length;
      p.completedTasks = phaseTasks.filter((t) => t.status === 'completed').length;
      if (p.completedTasks === p.totalTasks && p.totalTasks > 0) {
        p.status = 'completed';
      } else if (p.completedTasks > 0) {
        p.status = 'in_progress';
      }
    });

    if (roadmap.overallProgress === 100) {
      roadmap.status = 'completed';
    }
    await roadmap.save();
  }

  // Update LearningProgress (Streak & Gamification)
  if (status === 'completed') {
    let progress = await LearningProgress.findOne({ userId });
    if (!progress) {
      progress = new LearningProgress({ userId });
    }

    progress.completedTasksCount += 1;
    progress.totalStudyMinutes += timeSpent || task.estimatedMinutes;
    progress.preparationPoints += 20;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!progress.lastActiveDate) {
      progress.currentStreak = 1;
    } else {
      const lastActive = new Date(progress.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);

      const diffDays = Math.round((today.getTime() - lastActive.getTime()) / 86400000);
      if (diffDays === 1) {
        progress.currentStreak += 1;
      } else if (diffDays > 1) {
        progress.currentStreak = 1;
      }
    }

    if (progress.currentStreak > progress.longestStreak) {
      progress.longestStreak = progress.currentStreak;
    }
    progress.lastActiveDate = new Date();

    // Check Badges
    const existingBadgeIds = new Set(progress.unlockedBadges.map((b) => b.badgeId));
    if (progress.completedTasksCount >= 1 && !existingBadgeIds.has('first_step')) {
      progress.unlockedBadges.push({ badgeId: 'first_step', name: 'Placement Starter', description: 'Completed your first career preparation task' });
    }
    if (progress.currentStreak >= 7 && !existingBadgeIds.has('streak_7')) {
      progress.unlockedBadges.push({ badgeId: 'streak_7', name: '7-Day Consistency', description: 'Maintained a 7-day preparation streak' });
    }
    if (progress.preparationPoints >= 200 && !existingBadgeIds.has('points_200')) {
      progress.unlockedBadges.push({ badgeId: 'points_200', name: 'Skill Builder', description: 'Earned 200 Preparation Points' });
    }

    await progress.save();
  }

  return { task, roadmap };
};

module.exports = {
  generateRoadmap,
  getTodayTasks,
  updateTaskStatus,
};
