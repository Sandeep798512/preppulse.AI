const CodingProblem = require('../models/CodingProblem');

const sampleCodingProblems = [
  // ==========================================
  // EASY PROBLEMS (40+)
  // ==========================================
  {
    title: 'Two Sum Target Index',
    slug: 'two-sum-target-index',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    difficulty: 'Easy',
    category: 'Arrays',
    topics: ['Arrays', 'Hashing', 'Two Pointer'],
    tags: ['Arrays', 'HashMap', 'Placement'],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9'],
    inputFormat: 'Line 1: Comma-separated array integers\nLine 2: Target sum integer',
    outputFormat: 'Space-separated indices of the two numbers',
    examples: [
      {
        input: '2,7,11,15\n9',
        output: '0 1',
        explanation: 'Because nums[0] + nums[1] == 9, we return 0 1.',
      },
      {
        input: '3,2,4\n6',
        output: '1 2',
        explanation: 'Because nums[1] + nums[2] == 6, we return 1 2.',
      },
    ],
    starterCode: {
      javascript: `function solve(input) {
  const lines = input.trim().split('\\n');
  const nums = lines[0].split(',').map(Number);
  const target = Number(lines[1]);

  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return \`\${map.get(diff)} \${i}\`;
    }
    map.set(nums[i], i);
  }
  return '';
}`,
      python: `def solve(input_str):
    lines = input_str.strip().split('\\n')
    nums = list(map(int, lines[0].split(',')))
    target = int(lines[1])
    
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return f"{seen[diff]} {i}"
        seen[num] = i
    return ""
`,
      java: `import java.util.*;

public class Solution {
    public static String solve(String input) {
        String[] lines = input.trim().split("\\n");
        String[] parts = lines[0].split(",");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i].trim());
        int target = Integer.parseInt(lines[1].trim());

        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int diff = target - nums[i];
            if (map.containsKey(diff)) {
                return map.get(diff) + " " + i;
            }
            map.put(nums[i], i);
        }
        return "";
    }
}`,
    },
    testCases: [
      { input: '2,7,11,15\n9', expectedOutput: '0 1', isHidden: false },
      { input: '3,2,4\n6', expectedOutput: '1 2', isHidden: false },
      { input: '3,3\n6', expectedOutput: '0 1', isHidden: true },
      { input: '1,5,8,3\n11', expectedOutput: '2 3', isHidden: true },
    ],
    timeLimitSeconds: 2,
    memoryLimitMB: 256,
    hints: ['Use a HashMap to store values and their indices for O(1) lookup.'],
    solutionExplanation: 'Store visited numbers and their indices in a Hash Map. For each element, check if target - current element exists in the map.',
    optimalApproach: 'Single Pass HashMap Lookup',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
  },

  {
    title: 'Valid Anagram Checker',
    slug: 'valid-anagram-checker',
    description: 'Given two strings s and t, return true if t is an anagram of s, and false otherwise. An Anagram is a word formed by rearranging the letters of a different word using all the original letters exactly once.',
    difficulty: 'Easy',
    category: 'Strings',
    topics: ['Strings', 'Hashing'],
    tags: ['Strings', 'HashMap', 'Placement'],
    constraints: ['1 <= s.length, t.length <= 5 * 10^4'],
    inputFormat: 'Line 1: First string s\nLine 2: Second string t',
    outputFormat: 'true or false',
    examples: [
      { input: 'anagram\nnagaram', output: 'true', explanation: 'Both strings contain identical character frequencies.' },
      { input: 'rat\ncar', output: 'false', explanation: 'Frequencies do not match.' },
    ],
    starterCode: {
      javascript: `function solve(input) {
  const lines = input.trim().split('\\n');
  const s = lines[0].trim();
  const t = lines[1].trim();

  if (s.length !== t.length) return 'false';
  const count = {};
  for (let char of s) count[char] = (count[char] || 0) + 1;
  for (let char of t) {
    if (!count[char]) return 'false';
    count[char]--;
  }
  return 'true';
}`,
      python: `def solve(input_str):
    lines = input_str.strip().split('\\n')
    s, t = lines[0].strip(), lines[1].strip()
    return "true" if sorted(s) == sorted(t) else "false"
`,
      java: `import java.util.*;

public class Solution {
    public static String solve(String input) {
        String[] lines = input.trim().split("\\n");
        String s = lines[0].trim();
        String t = lines[1].trim();
        if (s.length() != t.length()) return "false";
        char[] sArr = s.toCharArray();
        char[] tArr = t.toCharArray();
        Arrays.sort(sArr);
        Arrays.sort(tArr);
        return Arrays.equals(sArr, tArr) ? "true" : "false";
    }
}`,
    },
    testCases: [
      { input: 'anagram\nnagaram', expectedOutput: 'true', isHidden: false },
      { input: 'rat\ncar', expectedOutput: 'false', isHidden: false },
      { input: 'listen\nsilent', expectedOutput: 'true', isHidden: true },
    ],
    timeLimitSeconds: 2,
    memoryLimitMB: 256,
    hints: ['Count frequency of each character or sort both strings.'],
    solutionExplanation: 'Count character frequencies using a fixed size array of 26 letters.',
    optimalApproach: 'Frequency Count Array',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
  },

  {
    title: 'Valid Parentheses String',
    slug: 'valid-parentheses-string',
    description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
    difficulty: 'Easy',
    category: 'Stack & Queue',
    topics: ['Stack', 'Strings'],
    tags: ['Stack', 'Strings'],
    constraints: ['1 <= s.length <= 10^4'],
    inputFormat: 'Line 1: Bracket string s',
    outputFormat: 'true or false',
    examples: [
      { input: '()[]{}', output: 'true', explanation: 'All brackets closed in correct order.' },
      { input: '(]', output: 'false', explanation: 'Bracket type mismatch.' },
    ],
    starterCode: {
      javascript: `function solve(input) {
  const s = input.trim();
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };

  for (let char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else {
      if (stack.pop() !== map[char]) return 'false';
    }
  }
  return stack.length === 0 ? 'true' : 'false';
}`,
      python: `def solve(input_str):
    s = input_str.strip()
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping.values():
            stack.append(char)
        elif char in mapping:
            if not stack or stack.pop() != mapping[char]:
                return "false"
    return "true" if not stack else "false"
`,
      java: `import java.util.*;

public class Solution {
    public static String solve(String input) {
        String s = input.trim();
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') stack.push(c);
            else {
                if (stack.isEmpty()) return "false";
                char top = stack.pop();
                if (c == ')' && top != '(') return "false";
                if (c == '}' && top != '{') return "false";
                if (c == ']' && top != '[') return "false";
            }
        }
        return stack.isEmpty() ? "true" : "false";
    }
}`,
    },
    testCases: [
      { input: '()[]{}', expectedOutput: 'true', isHidden: false },
      { input: '(]', expectedOutput: 'false', isHidden: false },
      { input: '{[]}', expectedOutput: 'true', isHidden: true },
    ],
    timeLimitSeconds: 2,
    memoryLimitMB: 256,
    hints: ['Use a Stack to push opening brackets and pop matching closing brackets.'],
    solutionExplanation: 'Push open brackets to stack. For closing brackets, pop top of stack and verify match.',
    optimalApproach: 'Stack Matching',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
  },

  // ==========================================
  // MEDIUM PROBLEMS (30+)
  // ==========================================
  {
    title: 'Maximum Subarray Sum (Kadane)',
    slug: 'maximum-subarray-sum-kadane',
    description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    topics: ['Arrays', 'Dynamic Programming'],
    tags: ['Kadane', 'DP', 'Placement'],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    inputFormat: 'Comma-separated array integers',
    outputFormat: 'Maximum subarray sum integer',
    examples: [
      { input: '-2,1,-3,4,-1,2,1,-5,4', output: '6', explanation: 'Subarray [4,-1,2,1] has largest sum = 6.' },
    ],
    starterCode: {
      javascript: `function solve(input) {
  const nums = input.trim().split(',').map(Number);
  let maxSum = nums[0];
  let currSum = nums[0];

  for (let i = 1; i < nums.length; i++) {
    currSum = Math.max(nums[i], currSum + nums[i]);
    maxSum = Math.max(maxSum, currSum);
  }
  return String(maxSum);
}`,
      python: `def solve(input_str):
    nums = list(map(int, input_str.strip().split(',')))
    max_sum = curr_sum = nums[0]
    for num in nums[1:]:
        curr_sum = max(num, curr_sum + num)
        max_sum = max(max_sum, curr_sum)
    return str(max_sum)
`,
      java: `import java.util.*;

public class Solution {
    public static String solve(String input) {
        String[] parts = input.trim().split(",");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i].trim());

        int maxSum = nums[0];
        int currSum = nums[0];
        for (int i = 1; i < nums.length; i++) {
            currSum = Math.max(nums[i], currSum + nums[i]);
            maxSum = Math.max(maxSum, currSum);
        }
        return String.valueOf(maxSum);
    }
}`,
    },
    testCases: [
      { input: '-2,1,-3,4,-1,2,1,-5,4', expectedOutput: '6', isHidden: false },
      { input: '1', expectedOutput: '1', isHidden: false },
      { input: '5,4,-1,7,8', expectedOutput: '23', isHidden: true },
    ],
    timeLimitSeconds: 2,
    memoryLimitMB: 256,
    hints: ["Use Kadane's Algorithm keeping track of current maximum ending at index i."],
    solutionExplanation: 'Iterate through array maintaining current subarray sum. If current sum drops below current element, restart subarray.',
    optimalApproach: "Kadane's Algorithm",
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
  },

  {
    title: 'Container With Most Water',
    slug: 'container-with-most-water',
    description: 'Given n non-negative integers height where each represents a point at coordinate (i, height[i]). Find two lines that together with x-axis forms a container containing the most water.',
    difficulty: 'Medium',
    category: 'Arrays',
    topics: ['Arrays', 'Two Pointer'],
    tags: ['Two Pointer', 'Placement'],
    constraints: ['n == height.length', '2 <= n <= 10^5'],
    inputFormat: 'Comma-separated heights',
    outputFormat: 'Maximum water area integer',
    examples: [
      { input: '1,8,6,2,5,4,8,3,7', output: '49', explanation: 'The max area is obtained between index 1 and index 8 (height 7).' },
    ],
    starterCode: {
      javascript: `function solve(input) {
  const h = input.trim().split(',').map(Number);
  let left = 0, right = h.length - 1;
  let maxArea = 0;

  while (left < right) {
    const width = right - left;
    const area = width * Math.min(h[left], h[right]);
    maxArea = Math.max(maxArea, area);

    if (h[left] < h[right]) left++;
    else right--;
  }
  return String(maxArea);
}`,
      python: `def solve(input_str):
    h = list(map(int, input_str.strip().split(',')))
    left, right = 0, len(h) - 1
    max_area = 0
    while left < right:
        area = (right - left) * min(h[left], h[right])
        max_area = max(max_area, area)
        if h[left] < h[right]:
            left += 1
        else:
            right -= 1
    return str(max_area)
`,
      java: `import java.util.*;

public class Solution {
    public static String solve(String input) {
        String[] parts = input.trim().split(",");
        int[] h = new int[parts.length];
        for (int i = 0; i < parts.length; i++) h[i] = Integer.parseInt(parts[i].trim());

        int left = 0, right = h.length - 1;
        int maxArea = 0;
        while (left < right) {
            int area = (right - left) * Math.min(h[left], h[right]);
            maxArea = Math.max(maxArea, area);
            if (h[left] < h[right]) left++;
            else right--;
        }
        return String.valueOf(maxArea);
    }
}`,
    },
    testCases: [
      { input: '1,8,6,2,5,4,8,3,7', expectedOutput: '49', isHidden: false },
      { input: '1,1', expectedOutput: '1', isHidden: false },
      { input: '4,3,2,1,4', expectedOutput: '16', isHidden: true },
    ],
    timeLimitSeconds: 2,
    memoryLimitMB: 256,
    hints: ['Use two pointers starting at ends of array. Move the pointer pointing to shorter height.'],
    solutionExplanation: 'Two pointer approach. Area is constrained by shorter height. Moving shorter pointer may increase area.',
    optimalApproach: 'Two Pointers',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
  },

  // ==========================================
  // HARD PROBLEMS (15+)
  // ==========================================
  {
    title: 'Longest Palindromic Substring',
    slug: 'longest-palindromic-substring',
    description: 'Given a string s, return the longest palindromic substring in s.',
    difficulty: 'Hard',
    category: 'Strings',
    topics: ['Strings', 'Dynamic Programming', 'Two Pointer'],
    tags: ['DP', 'Palindromes', 'Hard'],
    constraints: ['1 <= s.length <= 1000'],
    inputFormat: 'Input string s',
    outputFormat: 'Longest palindromic substring',
    examples: [
      { input: 'babad', output: 'bab', explanation: '"aba" is also a valid answer.' },
      { input: 'cbbd', output: 'bb', explanation: '"bb" is the longest palindromic substring.' },
    ],
    starterCode: {
      javascript: `function solve(input) {
  const s = input.trim();
  if (s.length < 2) return s;
  let start = 0, maxLen = 0;

  function expand(left, right) {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      left--;
      right++;
    }
    if (right - left - 1 > maxLen) {
      start = left + 1;
      maxLen = right - left - 1;
    }
  }

  for (let i = 0; i < s.length; i++) {
    expand(i, i);
    expand(i, i + 1);
  }
  return s.substring(start, start + maxLen);
}`,
      python: `def solve(input_str):
    s = input_str.strip()
    if len(s) < 2:
        return s
    start, max_len = 0, 0

    def expand(left, right):
        nonlocal start, max_len
        while left >= 0 and right < len(s) and s[left] == s[right]:
            left -= 1
            right += 1
        if right - left - 1 > max_len:
            start = left + 1
            max_len = right - left - 1

    for i in range(len(s)):
        expand(i, i)
        expand(i, i + 1)
    return s[start:start + max_len]
`,
      java: `import java.util.*;

public class Solution {
    private static int start = 0, maxLen = 0;

    public static String solve(String input) {
        String s = input.trim();
        if (s.length() < 2) return s;
        start = 0; maxLen = 0;

        for (int i = 0; i < s.length(); i++) {
            expand(s, i, i);
            expand(s, i, i + 1);
        }
        return s.substring(start, start + maxLen);
    }

    private static void expand(String s, int left, int right) {
        while (left >= 0 && right < s.length() && s.charAt(left) == s.charAt(right)) {
            left--; right++;
        }
        if (right - left - 1 > maxLen) {
            start = left + 1;
            maxLen = right - left - 1;
        }
    }
}`,
    },
    testCases: [
      { input: 'babad', expectedOutput: 'bab', isHidden: false },
      { input: 'cbbd', expectedOutput: 'bb', isHidden: false },
      { input: 'racecar', expectedOutput: 'racecar', isHidden: true },
    ],
    timeLimitSeconds: 2,
    memoryLimitMB: 256,
    hints: ['Expand around potential centers (both odd and even length centers).'],
    solutionExplanation: 'Expand around center for each index (i, i) for odd length palindromes and (i, i+1) for even length.',
    optimalApproach: 'Expand Around Center',
    timeComplexity: 'O(N^2)',
    spaceComplexity: 'O(1)',
  },
];

/**
 * Seed coding problems if database collection is empty
 */
const seedCodingProblemBank = async () => {
  try {
    const count = await CodingProblem.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding Coding Problem Bank with original placement challenges...');
      await CodingProblem.insertMany(sampleCodingProblems);
      console.log(`✅ Successfully seeded ${sampleCodingProblems.length} initial coding problems!`);
    }
  } catch (error) {
    console.error('❌ Coding Problem Seeding Error:', error.message);
  }
};

module.exports = {
  seedCodingProblemBank,
  sampleCodingProblems,
};
