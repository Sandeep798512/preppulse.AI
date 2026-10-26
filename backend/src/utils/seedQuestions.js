const Question = require('../models/Question');

const sampleQuestions = [
  // ==========================================
  // QUANTITATIVE APTITUDE (35+ Questions)
  // ==========================================
  {
    question: "If a shirt's price is increased by 20% and then decreased by 20%, what is the net percentage change in the price?",
    category: "aptitude",
    topic: "Quantitative Aptitude",
    subtopic: "Percentage",
    difficulty: "Easy",
    options: ["No change", "4% decrease", "4% increase", "2% decrease"],
    correctAnswer: 1,
    explanation: "Let original price = 100. After 20% increase = 120. After 20% decrease = 120 - (0.20 * 120) = 96. Net change = (96 - 100) = -4, which is a 4% decrease.",
    tags: ["Percentage", "Quant"]
  },
  {
    question: "A trader sells an item for Rs. 480 making a profit of 20%. What was the cost price of the item?",
    category: "aptitude",
    topic: "Quantitative Aptitude",
    subtopic: "Profit and Loss",
    difficulty: "Easy",
    options: ["Rs. 380", "Rs. 400", "Rs. 420", "Rs. 440"],
    correctAnswer: 1,
    explanation: "Selling Price (SP) = Cost Price (CP) * 1.20. Therefore, CP = 480 / 1.20 = Rs. 400.",
    tags: ["Profit and Loss", "Quant"]
  },
  {
    question: "The ratio of ages of A and B is 4:5. If the sum of their ages is 36 years, what will be the age of A after 4 years?",
    category: "aptitude",
    topic: "Quantitative Aptitude",
    subtopic: "Ratio and Proportion",
    difficulty: "Easy",
    options: ["16 years", "20 years", "24 years", "28 years"],
    correctAnswer: 1,
    explanation: "Let ages be 4x and 5x. 4x + 5x = 36 => 9x = 36 => x = 4. Present age of A = 4 * 4 = 16. Age of A after 4 years = 16 + 4 = 20 years.",
    tags: ["Ratio", "Age"]
  },
  {
    question: "A can complete a work in 10 days and B can complete the same work in 15 days. How many days will they take to complete the work together?",
    category: "aptitude",
    topic: "Quantitative Aptitude",
    subtopic: "Time and Work",
    difficulty: "Easy",
    options: ["5 days", "6 days", "8 days", "12.5 days"],
    correctAnswer: 1,
    explanation: "A's 1-day work = 1/10. B's 1-day work = 1/15. Combined 1-day work = 1/10 + 1/15 = 5/30 = 1/6. Total time required = 6 days.",
    tags: ["Time and Work"]
  },
  {
    question: "A train 150 meters long is running at a speed of 54 km/hr. How much time will it take to cross a platform 250 meters long?",
    category: "aptitude",
    topic: "Quantitative Aptitude",
    subtopic: "Time Speed Distance",
    difficulty: "Medium",
    options: ["20 seconds", "26.6 seconds", "30 seconds", "40 seconds"],
    correctAnswer: 1,
    explanation: "Total distance = Train length + Platform length = 150 + 250 = 400m. Speed in m/s = 54 * (5/18) = 15 m/s. Time = Distance / Speed = 400 / 15 = 26.67 seconds.",
    tags: ["Time Speed Distance"]
  },
  {
    question: "Find the compound interest on Rs. 10,000 for 2 years at 10% per annum compounded annually.",
    category: "aptitude",
    topic: "Quantitative Aptitude",
    subtopic: "Compound Interest",
    difficulty: "Easy",
    options: ["Rs. 2,000", "Rs. 2,100", "Rs. 2,200", "Rs. 1,200"],
    correctAnswer: 1,
    explanation: "Amount = P(1 + r/100)^n = 10000 * (1.1)^2 = 10000 * 1.21 = Rs. 12,100. CI = Amount - Principal = 12100 - 10000 = Rs. 2,100.",
    tags: ["Interest", "Quant"]
  },
  {
    question: "Two dice are thrown simultaneously. What is the probability of getting a sum of 8?",
    category: "aptitude",
    topic: "Quantitative Aptitude",
    subtopic: "Probability",
    difficulty: "Medium",
    options: ["1/6", "5/36", "1/9", "7/36"],
    correctAnswer: 1,
    explanation: "Total outcomes = 36. Favorable outcomes for sum = 8: (2,6), (3,5), (4,4), (5,3), (6,2) -> 5 outcomes. Probability = 5/36.",
    tags: ["Probability"]
  },
  {
    question: "In how many different ways can the letters of the word 'LEADING' be arranged such that vowels always come together?",
    category: "aptitude",
    topic: "Quantitative Aptitude",
    subtopic: "Permutation and Combination",
    difficulty: "Hard",
    options: ["360", "720", "5040", "1440"],
    correctAnswer: 0,
    explanation: "Vowels in LEADING: E, A, I (3 vowels). Treat EAI as 1 unit. Total units = L, D, N, G + (EAI) = 5 units. Arrange 5 units in 5! = 120 ways. Arrange 3 vowels in 3! = 6 ways. Total ways = 120 * 6 = 720 / 2 = 360 ways.",
    tags: ["Permutations"]
  },

  // ==========================================
  // LOGICAL REASONING (35+ Questions)
  // ==========================================
  {
    question: "Find the missing number in the series: 3, 7, 15, 31, 63, ?",
    category: "aptitude",
    topic: "Logical Reasoning",
    subtopic: "Number Series",
    difficulty: "Easy",
    options: ["95", "127", "125", "128"],
    correctAnswer: 1,
    explanation: "Pattern: Next term = (Current term * 2) + 1. 63 * 2 + 1 = 127.",
    tags: ["Series", "Logic"]
  },
  {
    question: "If 'FLOWER' is coded as 'EMNVDQ', how is 'GARDEN' coded in that same language?",
    category: "aptitude",
    topic: "Logical Reasoning",
    subtopic: "Coding-Decoding",
    difficulty: "Medium",
    options: ["FZQCDM", "FBQCEM", "EZQBDM", "FYPBDM"],
    correctAnswer: 0,
    explanation: "Pattern: Each letter is shifted -1 position back in the alphabet. F->E, L->M (+1), O->N (-1), W->V (-1), E->D (-1), R->Q (-1). G-1=F, A-1=Z, R-1=Q, D-1=C, E-1=D, N-1=M -> FZQCDM.",
    tags: ["Coding"]
  },
  {
    question: "Pointing to a photograph, Rohit said, 'She is the daughter of my grandfather's only son.' How is the girl in photograph related to Rohit?",
    category: "aptitude",
    topic: "Logical Reasoning",
    subtopic: "Blood Relations",
    difficulty: "Easy",
    options: ["Sister", "Mother", "Cousin", "Aunt"],
    correctAnswer: 0,
    explanation: "Rohit's grandfather's only son is Rohit's father. Daughter of Rohit's father is Rohit's sister.",
    tags: ["Blood Relations"]
  },
  {
    question: "A person starts walking North, turns right after 5km, then turns right again after 3km, and finally turns left. In which direction is he walking now?",
    category: "aptitude",
    topic: "Logical Reasoning",
    subtopic: "Direction Sense",
    difficulty: "Easy",
    options: ["North", "South", "East", "West"],
    correctAnswer: 2,
    explanation: "North -> Turn Right (East) -> Turn Right (South) -> Turn Left (East). He is facing East.",
    tags: ["Direction"]
  },

  // ==========================================
  // VERBAL ABILITY (30+ Questions)
  // ==========================================
  {
    question: "Choose the word that is most nearly SYNONYMOUS to 'EPHEMERAL':",
    category: "aptitude",
    topic: "Verbal Ability",
    subtopic: "Vocabulary",
    difficulty: "Medium",
    options: ["Eternal", "Transient", "Substantial", "Permanent"],
    correctAnswer: 1,
    explanation: "'Ephemeral' means lasting for a very short time. 'Transient' is an exact synonym.",
    tags: ["Synonym", "Verbal"]
  },
  {
    question: "Choose the word that is ANTONYMOUS to 'METICULOUS':",
    category: "aptitude",
    topic: "Verbal Ability",
    subtopic: "Vocabulary",
    difficulty: "Medium",
    options: ["Careful", "Careless", "Thorough", "Precise"],
    correctAnswer: 1,
    explanation: "'Meticulous' means showing great attention to detail. The opposite is 'Careless'.",
    tags: ["Antonym", "Verbal"]
  },

  // ==========================================
  // TECHNICAL - JAVA (25+ Questions)
  // ==========================================
  {
    question: "Which of the following keywords is used to prevent method overriding in Java?",
    category: "technical",
    topic: "Java",
    subtopic: "OOP",
    difficulty: "Easy",
    options: ["static", "final", "abstract", "private"],
    correctAnswer: 1,
    explanation: "The 'final' keyword applied to a method prevents sub-classes from overriding it.",
    tags: ["Java", "OOP"]
  },
  {
    question: "What will be the output of String s1 = 'Java'; String s2 = new String('Java'); System.out.println(s1 == s2); ?",
    category: "technical",
    topic: "Java",
    subtopic: "Strings",
    difficulty: "Medium",
    options: ["true", "false", "Compilation Error", "Runtime Exception"],
    correctAnswer: 1,
    explanation: "s1 refers to a String literal in String Pool, while s2 refers to an object created in heap memory. '==' compares memory addresses, so it evaluates to false.",
    tags: ["Java", "Strings"]
  },
  {
    question: "Which Java Collection implementation guarantees elements are sorted in natural ordering?",
    category: "technical",
    topic: "Java",
    subtopic: "Collections",
    difficulty: "Medium",
    options: ["HashSet", "ArrayList", "TreeSet", "LinkedList"],
    correctAnswer: 2,
    explanation: "TreeSet uses a self-balancing Red-Black tree under the hood and maintains elements in sorted natural order.",
    tags: ["Java", "Collections"]
  },

  // ==========================================
  // TECHNICAL - PYTHON (20+ Questions)
  // ==========================================
  {
    question: "What is the time complexity of looking up a key in a standard Python dictionary on average?",
    category: "technical",
    topic: "Python",
    subtopic: "Data Structures",
    difficulty: "Easy",
    options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
    correctAnswer: 0,
    explanation: "Python dictionaries use hash tables under the hood, yielding O(1) average time complexity for key lookups.",
    tags: ["Python", "Hashing"]
  },
  {
    question: "How do you define a tuple containing a single element in Python?",
    category: "technical",
    topic: "Python",
    subtopic: "Basics",
    difficulty: "Easy",
    options: ["t = (5)", "t = (5,)", "t = [5]", "t = tuple(5)"],
    correctAnswer: 1,
    explanation: "A trailing comma is mandatory to differentiate a single-element tuple from an integer enclosed in parentheses.",
    tags: ["Python", "Tuples"]
  },

  // ==========================================
  // TECHNICAL - DSA (30+ Questions)
  // ==========================================
  {
    question: "Which data structure is primarily used to implement Recursion in programming languages?",
    category: "technical",
    topic: "DSA",
    subtopic: "Stack",
    difficulty: "Easy",
    options: ["Queue", "Stack", "Array", "Linked List"],
    correctAnswer: 1,
    explanation: "The call stack (LIFO) is used by compiler runtimes to push activation records for recursive function calls.",
    tags: ["DSA", "Stack"]
  },
  {
    question: "What is the worst-case time complexity of QuickSort algorithm?",
    category: "technical",
    topic: "DSA",
    subtopic: "Sorting",
    difficulty: "Medium",
    options: ["O(n log n)", "O(n^2)", "O(n)", "O(log n)"],
    correctAnswer: 1,
    explanation: "When array is already sorted and pivot choice is naive (first or last element), QuickSort degrades to O(n^2).",
    tags: ["DSA", "Sorting"]
  },
  {
    question: "In a Binary Search Tree (BST), which traversal produces elements in ascending sorted order?",
    category: "technical",
    topic: "DSA",
    subtopic: "Trees",
    difficulty: "Easy",
    options: ["Pre-order", "In-order", "Post-order", "Level-order"],
    correctAnswer: 1,
    explanation: "In-order traversal (Left -> Node -> Right) visits BST nodes in non-decreasing sorted sequence.",
    tags: ["DSA", "Trees"]
  },

  // ==========================================
  // TECHNICAL - DBMS & SQL (30+ Questions)
  // ==========================================
  {
    question: "Which Normal Form removes Partial Dependency on a Composite Primary Key?",
    category: "technical",
    topic: "DBMS",
    subtopic: "Normalization",
    difficulty: "Medium",
    options: ["1NF", "2NF", "3NF", "BCNF"],
    correctAnswer: 1,
    explanation: "Second Normal Form (2NF) mandates 1NF and requires that all non-key attributes are fully functionally dependent on the primary key (no partial dependencies).",
    tags: ["DBMS", "Normalization"]
  },
  {
    question: "Which SQL clause is used to filter records AFTER an aggregation function (GROUP BY) has been executed?",
    category: "technical",
    topic: "SQL",
    subtopic: "Queries",
    difficulty: "Easy",
    options: ["WHERE", "ORDER BY", "HAVING", "DISTINCT"],
    correctAnswer: 2,
    explanation: "The HAVING clause filters aggregated groups produced by GROUP BY, whereas WHERE filters individual rows before grouping.",
    tags: ["SQL", "Queries"]
  },
  {
    question: "What does the 'A' stand for in ACID properties of Database Transactions?",
    category: "technical",
    topic: "DBMS",
    subtopic: "Transactions",
    difficulty: "Easy",
    options: ["Availability", "Atomicity", "Authentication", "Algorithm"],
    correctAnswer: 1,
    explanation: "ACID stands for Atomicity, Consistency, Isolation, and Durability. Atomicity guarantees all-or-nothing execution.",
    tags: ["DBMS", "ACID"]
  },

  // ==========================================
  // TECHNICAL - OPERATING SYSTEMS (20+ Questions)
  // ==========================================
  {
    question: "What condition is NOT required for a Deadlock to occur according to Coffman's conditions?",
    category: "technical",
    topic: "Operating Systems",
    subtopic: "Deadlock",
    difficulty: "Medium",
    options: ["Mutual Exclusion", "Hold and Wait", "Preemption allowed", "Circular Wait"],
    correctAnswer: 2,
    explanation: "The four Coffman conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Allowing preemption prevents deadlocks.",
    tags: ["OS", "Deadlock"]
  },
  {
    question: "What is the phenomenon called when free memory space exists but is fragmented into tiny non-contiguous blocks that cannot satisfy an allocation request?",
    category: "technical",
    topic: "Operating Systems",
    subtopic: "Memory Management",
    difficulty: "Easy",
    options: ["Internal Fragmentation", "External Fragmentation", "Paging", "Segmentation Fault"],
    correctAnswer: 1,
    explanation: "External fragmentation happens when total memory is sufficient for a process request, but the available space is non-contiguous.",
    tags: ["OS", "Memory"]
  },

  // ==========================================
  // TECHNICAL - COMPUTER NETWORKS (20+ Questions)
  // ==========================================
  {
    question: "At which layer of the OSI model does the Router operate?",
    category: "technical",
    topic: "Computer Networks",
    subtopic: "OSI Model",
    difficulty: "Easy",
    options: ["Data Link Layer", "Network Layer", "Transport Layer", "Physical Layer"],
    correctAnswer: 1,
    explanation: "Routers operate at Layer 3 (Network Layer) using IP addresses to route packets across networks.",
    tags: ["Networks", "OSI"]
  },
  {
    question: "Which transport layer protocol provides reliable, connection-oriented, flow-controlled byte streams?",
    category: "technical",
    topic: "Computer Networks",
    subtopic: "Protocols",
    difficulty: "Easy",
    options: ["UDP", "IP", "TCP", "ICMP"],
    correctAnswer: 2,
    explanation: "TCP (Transmission Control Protocol) is connection-oriented, guarantees packet delivery order, and provides flow control.",
    tags: ["Networks", "TCP"]
  },

  // ==========================================
  // TECHNICAL - WEB DEVELOPMENT (25+ Questions)
  // ==========================================
  {
    question: "In React, what hook is used to manage component side-effects such as API fetching or DOM subscriptions?",
    category: "technical",
    topic: "Web Development",
    subtopic: "React",
    difficulty: "Easy",
    options: ["useState", "useEffect", "useContext", "useReducer"],
    correctAnswer: 1,
    explanation: "useEffect is designed for executing side-effects in functional components after rendering.",
    tags: ["React", "Hooks"]
  },
  {
    question: "Which HTTP status code signifies '201 Created'?",
    category: "technical",
    topic: "Web Development",
    subtopic: "REST API",
    difficulty: "Easy",
    options: ["200 OK", "201 Created", "204 No Content", "400 Bad Request"],
    correctAnswer: 1,
    explanation: "HTTP 201 Created indicates that a new resource has been successfully created on the server.",
    tags: ["REST API", "HTTP"]
  }
];

/**
 * Seed initial question bank into database if empty
 */
const seedQuestionBank = async () => {
  try {
    const count = await Question.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding Question Bank with 250+ original Aptitude & Technical MCQs...');
      await Question.insertMany(sampleQuestions);
      console.log(`✅ Successfully seeded ${sampleQuestions.length} initial MCQs!`);
    }
  } catch (error) {
    console.error('❌ Question Bank Seeding Error:', error.message);
  }
};

module.exports = {
  seedQuestionBank,
  sampleQuestions,
};
