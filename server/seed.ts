import { dbManager } from './db';

export async function seedInitialData() {
  const usersCol = dbManager.getCollection('users');
  const problemsCol = dbManager.getCollection('problems');
  const submissionsCol = dbManager.getCollection('submissions');
  const messagesCol = dbManager.getCollection('messages');

  // Purge any demo accounts that may have existed previously
  await usersCol.deleteMany({
    $or: [
      { email: 'alex@student.codenow.io' },
      { email: 'sarah@student.codenow.io' },
      { email: 'mentor@codenow.io' },
      { id: 'usr_student_demo' },
      { id: 'usr_student_beginner' },
      { id: 'usr_admin_mentor' }
    ]
  });

  // Purge demo submissions associated with old demo students
  await submissionsCol.deleteMany({
    $or: [
      { userId: 'usr_student_demo' },
      { userId: 'usr_student_beginner' },
      { userEmail: 'alex@student.codenow.io' },
      { userEmail: 'sarah@student.codenow.io' }
    ]
  });

  // Ensure Single Root Admin Account exists
  const rootAdminExists = await usersCol.findOne({
    $or: [
      { email: 'admin@codeelevate.io' },
      { id: 'usr_admin_root' }
    ]
  });

  if (!rootAdminExists) {
    const singleAdmin = {
      id: 'usr_admin_root',
      username: 'admin',
      email: 'admin@codeelevate.io',
      password: 'AdminPass123!',
      role: 'admin',
      skillLevel: 'advanced',
      preferredLanguage: 'typescript',
      targetGoal: 'System and Curriculum Administration',
      batch: 'Administration',
      streakDays: 0,
      totalSolved: 0,
      status: 'Verified',
      isVerified: true,
      emailVerified: true,
      createdAt: new Date().toISOString()
    };
    await usersCol.insertOne(singleAdmin);
  }

  // Ensure Default Faculty Account exists
  const rootFacultyExists = await usersCol.findOne({
    $or: [
      { email: 'faculty@codeelevate.io' },
      { id: 'usr_faculty_mentor' }
    ]
  });

  if (!rootFacultyExists) {
    const singleFaculty = {
      id: 'usr_faculty_mentor',
      username: 'Prof. Alan Turing',
      email: 'faculty@codeelevate.io',
      password: 'FacultyPass123!',
      role: 'faculty',
      skillLevel: 'advanced',
      preferredLanguage: 'python',
      targetGoal: 'Instruct curriculum and guide batch performance',
      batch: 'Batch 2026-A',
      streakDays: 14,
      totalSolved: 45,
      status: 'Verified',
      isVerified: true,
      emailVerified: true,
      createdAt: new Date().toISOString()
    };
    await usersCol.insertOne(singleFaculty);
  }

  // Ensure Default Student Account exists
  const rootStudentExists = await usersCol.findOne({
    $or: [
      { email: 'student@codeelevate.io' },
      { id: 'usr_student_active' }
    ]
  });

  if (!rootStudentExists) {
    const singleStudent = {
      id: 'usr_student_active',
      username: 'Demo Student',
      email: 'student@codeelevate.io',
      password: 'StudentPass123!',
      role: 'student',
      skillLevel: 'intermediate',
      preferredLanguage: 'javascript',
      targetGoal: 'Master algorithms and technical interviews',
      batch: 'Batch 2026-A',
      streakDays: 5,
      totalSolved: 12,
      status: 'Verified',
      isVerified: true,
      emailVerified: true,
      createdAt: new Date().toISOString()
    };
    await usersCol.insertOne(singleStudent);

    // Seed sample submission for this student
    await submissionsCol.insertOne({
      id: 'sub_sample_student_01',
      userId: 'usr_student_active',
      problemId: 'prob_two_sum',
      problemTitle: 'Two Sum',
      language: 'javascript',
      status: 'Passed',
      passedCases: 3,
      totalCases: 3,
      executionTimeMs: 14,
      memoryKb: 2048,
      category: 'Arrays & Hash Maps',
      difficulty: 'basic',
      createdAt: new Date().toISOString()
    });
  }

  console.log('Seeding & synchronizing initial CodeElevate curriculum with clean boilerplate...');

  // Curated Roadmap Problems across Basic, Intermediate, and Advanced
  const curatedProblems = [
    // --- BASIC LEVEL ---
    {
      id: 'prob_two_sum',
      title: 'Two Sum',
      slug: 'two-sum',
      difficulty: 'basic',
      category: 'Arrays & Hash Maps',
      description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.\n\nYou can return the answer in any order.',
      examples: [
        {
          input: 'nums = [2,7,11,15], target = 9',
          output: '[0, 1]',
          explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
        },
        {
          input: 'nums = [3,2,4], target = 6',
          output: '[1, 2]',
          explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
        },
        {
          input: 'nums = [3,3], target = 6',
          output: '[0, 1]'
        }
      ],
      constraints: [
        '2 <= nums.length <= 10^4',
        '-10^9 <= nums[i] <= 10^9',
        '-10^9 <= target <= 10^9',
        'Only one valid answer exists.',
        'Target time complexity: O(N)'
      ],
            starterCode: {
        javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Write your code here
  return [];
}`,
        python: `def twoSum(nums: list[int], target: int) -> list[int]:
    # Write your code here
    return []`,
        typescript: `function twoSum(nums: number[], target: number): number[] {
  // Write your code here
  return [];
}`,
        java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your code here
        return new int[]{};
    }
}`,
        cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your code here
        return {};
    }
};`,
        go: `package main

func twoSum(nums []int, target int) []int {
    // Write your code here
    return []int{}
}`
      },
      testCases: [
        { id: 't1', input: '[2,7,11,15], 9', expectedOutput: '[0,1]' },
        { id: 't2', input: '[3,2,4], 6', expectedOutput: '[1,2]' },
        { id: 't3', input: '[3,3], 6', expectedOutput: '[0,1]' },
        { id: 't4', input: '[1,5,8,3], 4', expectedOutput: '[0,3]', isHidden: true }
      ],
      hints: [
        'A brute-force solution checks every pair with two nested loops in O(N^2). Can you do better?',
        'Can you use a Hash Map to store numbers you have already visited and check for the complement in O(1) time?'
      ],
      tags: ['Array', 'Hash Table', 'Beginner Friendly'],
      acceptanceRate: 88
    },
    {
      id: 'prob_valid_palindrome',
      title: 'Valid Palindrome',
      slug: 'valid-palindrome',
      difficulty: 'basic',
      category: 'Two Pointers & Strings',
      description: 'A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.\n\nGiven a string `s`, return `true` if it is a palindrome, or `false` otherwise.',
      examples: [
        {
          input: 's = "A man, a plan, a canal: Panama"',
          output: 'true',
          explanation: '"amanaplanacanalpanama" is a palindrome.'
        },
        {
          input: 's = "race a car"',
          output: 'false',
          explanation: '"raceacar" is not a palindrome.'
        },
        {
          input: 's = " "',
          output: 'true',
          explanation: 'An empty string reads the same forward and backward.'
        }
      ],
      constraints: [
        '1 <= s.length <= 2 * 10^5',
        '`s` consists only of printable ASCII characters.',
        'Optimal space complexity: O(1) using two pointers'
      ],
            starterCode: {
        javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isPalindrome(s) {
  // Write your code here
  return false;
}`,
        python: `def isPalindrome(s: str) -> bool:
    # Write your code here
    return False`,
        typescript: `function isPalindrome(s: string): boolean {
  // Write your code here
  return false;
}`,
        java: `class Solution {
    public boolean isPalindrome(String s) {
        // Write your code here
        return false;
    }
}`,
        cpp: `#include <string>
using namespace std;

class Solution {
public:
    bool isPalindrome(string s) {
        // Write your code here
        return false;
    }
};`,
        go: `package main

func isPalindrome(s string) bool {
    // Write your code here
    return false
}`
      },
      testCases: [
        { id: 't1', input: '"A man, a plan, a canal: Panama"', expectedOutput: 'true' },
        { id: 't2', input: '"race a car"', expectedOutput: 'false' },
        { id: 't3', input: '" "', expectedOutput: 'true' },
        { id: 't4', input: '"0P"', expectedOutput: 'false', isHidden: true }
      ],
      hints: [
        'Consider two pointers starting at the beginning and the end of the string.',
        'Increment the left pointer and decrement the right pointer until both point to alphanumeric characters.'
      ],
      tags: ['Two Pointers', 'String', 'Easy'],
      acceptanceRate: 79
    },
    {
      id: 'prob_contains_duplicate',
      title: 'Contains Duplicate',
      slug: 'contains-duplicate',
      difficulty: 'basic',
      category: 'Arrays & Hash Maps',
      description: 'Given an integer array `nums`, return `true` if any value appears **at least twice** in the array, and return `false` if every element is distinct.',
      examples: [
        { input: 'nums = [1,2,3,1]', output: 'true' },
        { input: 'nums = [1,2,3,4]', output: 'false' },
        { input: 'nums = [1,1,1,3,3,4,3,2,4,2]', output: 'true' }
      ],
      constraints: [
        '1 <= nums.length <= 10^5',
        '-10^9 <= nums[i] <= 10^9'
      ],
            starterCode: {
        javascript: `/**
 * @param {number[]} nums
 * @return {boolean}
 */
function containsDuplicate(nums) {
  // Write your code here
  return false;
}`,
        python: `def containsDuplicate(nums: list[int]) -> bool:
    # Write your code here
    return False`,
        typescript: `function containsDuplicate(nums: number[]): boolean {
  // Write your code here
  return false;
}`,
        java: `class Solution {
    public boolean containsDuplicate(int[] nums) {
        // Write your code here
        return false;
    }
}`,
        cpp: `#include <vector>
using namespace std;

class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        // Write your code here
        return false;
    }
};`,
        go: `package main

func containsDuplicate(nums []int) bool {
    // Write your code here
    return false
}`
      },
      testCases: [
        { id: 't1', input: '[1,2,3,1]', expectedOutput: 'true' },
        { id: 't2', input: '[1,2,3,4]', expectedOutput: 'false' },
        { id: 't3', input: '[1,1,1,3,3,4,3,2,4,2]', expectedOutput: 'true' }
      ],
      hints: [
        'A Set only contains unique elements. What happens when you compare the size of a Set to the length of the array?'
      ],
      tags: ['Array', 'Hash Table', 'Set'],
      acceptanceRate: 85
    },

    // --- INTERMEDIATE LEVEL ---
    {
      id: 'prob_3sum',
      title: '3Sum',
      slug: '3sum',
      difficulty: 'intermediate',
      category: 'Two Pointers',
      description: 'Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.\n\nNotice that the solution set must not contain duplicate triplets.',
      examples: [
        {
          input: 'nums = [-1,0,1,2,-1,-4]',
          output: '[[-1,-1,2],[-1,0,1]]',
          explanation: 'nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0.\nnums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0.\nnums[0] + nums[3] + nums[4] = (-1) + 2 + (-1) = 0.\nThe distinct triplets are [-1,0,1] and [-1,-1,2].'
        },
        {
          input: 'nums = [0,1,1]',
          output: '[]'
        },
        {
          input: 'nums = [0,0,0]',
          output: '[[0,0,0]]'
        }
      ],
      constraints: [
        '3 <= nums.length <= 3000',
        '-10^5 <= nums[i] <= 10^5',
        'Time complexity: O(N^2)'
      ],
            starterCode: {
        javascript: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function threeSum(nums) {
  // Write your code here
  return [];
}`,
        python: `def threeSum(nums: list[int]) -> list[list[int]]:
    # Write your code here
    return []`,
        typescript: `function threeSum(nums: number[]): number[][] {
  // Write your code here
  return [];
}`,
        java: `import java.util.List;
import java.util.ArrayList;

class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        // Write your code here
        return new ArrayList<>();
    }
}`,
        cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        // Write your code here
        return {};
    }
};`,
        go: `package main

func threeSum(nums []int) [][]int {
    // Write your code here
    return [][]int{}
}`
      },
      testCases: [
        { id: 't1', input: '[-1,0,1,2,-1,-4]', expectedOutput: '[[-1,-1,2],[-1,0,1]]' },
        { id: 't2', input: '[0,1,1]', expectedOutput: '[]' },
        { id: 't3', input: '[0,0,0]', expectedOutput: '[[0,0,0]]' }
      ],
      hints: [
        'Sorting the array first makes it easy to avoid duplicate triplets and enables the two-pointer technique.',
        'Fix the first element nums[i] and use two pointers (left and right) to find pairs that sum to -nums[i].'
      ],
      tags: ['Array', 'Two Pointers', 'Sorting', 'Interview Classic'],
      acceptanceRate: 46
    },
    {
      id: 'prob_longest_substring',
      title: 'Longest Substring Without Repeating Characters',
      slug: 'longest-substring-without-repeating-characters',
      difficulty: 'intermediate',
      category: 'Sliding Window',
      description: 'Given a string `s`, find the length of the **longest substring** without duplicate characters.',
      examples: [
        {
          input: 's = "abcabcbb"',
          output: '3',
          explanation: 'The answer is "abc", with the length of 3.'
        },
        {
          input: 's = "bbbbb"',
          output: '1',
          explanation: 'The answer is "b", with the length of 1.'
        },
        {
          input: 's = "pwwkew"',
          output: '3',
          explanation: 'The answer is "wke", with the length of 3. Notice that "pwke" is a subsequence and not a substring.'
        }
      ],
      constraints: [
        '0 <= s.length <= 5 * 10^4',
        '`s` consists of English letters, digits, symbols and spaces.',
        'Target time complexity: O(N)'
      ],
            starterCode: {
        javascript: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
  // Write your code here
  return 0;
}`,
        python: `def lengthOfLongestSubstring(s: str) -> int:
    # Write your code here
    return 0`,
        typescript: `function lengthOfLongestSubstring(s: string): number {
  // Write your code here
  return 0;
}`,
        java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        // Write your code here
        return 0;
    }
}`,
        cpp: `#include <string>
using namespace std;

class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        // Write your code here
        return 0;
    }
};`,
        go: `package main

func lengthOfLongestSubstring(s string) int {
    // Write your code here
    return 0
}`
      },
      testCases: [
        { id: 't1', input: '"abcabcbb"', expectedOutput: '3' },
        { id: 't2', input: '"bbbbb"', expectedOutput: '1' },
        { id: 't3', input: '"pwwkew"', expectedOutput: '3' },
        { id: 't4', input: '""', expectedOutput: '0', isHidden: true }
      ],
      hints: [
        'Use the sliding window technique with two pointers [left, right].',
        'Store the last seen index of each character to quickly advance the left boundary.'
      ],
      tags: ['Hash Table', 'String', 'Sliding Window'],
      acceptanceRate: 54
    },
    {
      id: 'prob_group_anagrams',
      title: 'Group Anagrams',
      slug: 'group-anagrams',
      difficulty: 'intermediate',
      category: 'Hash Maps & Strings',
      description: 'Given an array of strings `strs`, group the **anagrams** together. You can return the answer in **any order**.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.',
      examples: [
        {
          input: 'strs = ["eat","tea","tan","ate","nat","bat"]',
          output: '[["bat"],["nat","tan"],["ate","eat","tea"]]'
        },
        {
          input: 'strs = [""]',
          output: '[[""]]'
        },
        {
          input: 'strs = ["a"]',
          output: '[["a"]]'
        }
      ],
      constraints: [
        '1 <= strs.length <= 10^4',
        '0 <= strs[i].length <= 100',
        '`strs[i]` consists of lowercase English letters.'
      ],
            starterCode: {
        javascript: `/**
 * @param {string[]} strs
 * @return {string[][]}
 */
function groupAnagrams(strs) {
  // Write your code here
  return [];
}`,
        python: `def groupAnagrams(strs: list[str]) -> list[list[str]]:
    # Write your code here
    return []`,
        typescript: `function groupAnagrams(strs: string[]): string[][] {
  // Write your code here
  return [];
}`,
        java: `import java.util.List;
import java.util.ArrayList;

class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        // Write your code here
        return new ArrayList<>();
    }
}`,
        cpp: `#include <vector>
#include <string>
using namespace std;

class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        // Write your code here
        return {};
    }
};`,
        go: `package main

func groupAnagrams(strs []string) [][]string {
    // Write your code here
    return [][]string{}
}`
      },
      testCases: [
        { id: 't1', input: '["eat","tea","tan","ate","nat","bat"]', expectedOutput: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
        { id: 't2', input: '[""]', expectedOutput: '[[""]]' },
        { id: 't3', input: '["a"]', expectedOutput: '[["a"]]' }
      ],
      hints: [
        'Two words are anagrams if and only if their sorted character representations are identical.'
      ],
      tags: ['Array', 'Hash Table', 'String', 'Sorting'],
      acceptanceRate: 67
    },

    // --- ADVANCED LEVEL ---
    {
      id: 'prob_trapping_rain_water',
      title: 'Trapping Rain Water',
      slug: 'trapping-rain-water',
      difficulty: 'advanced',
      category: 'Two Pointers & Monotonic Stack',
      description: 'Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.',
      examples: [
        {
          input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
          output: '6',
          explanation: 'The elevation map traps 6 units of rain water.'
        },
        {
          input: 'height = [4,2,0,3,2,5]',
          output: '9'
        }
      ],
      constraints: [
        'n == height.length',
        '1 <= n <= 2 * 10^4',
        '0 <= height[i] <= 10^5',
        'Optimal time: O(N), Optimal space: O(1)'
      ],
            starterCode: {
        javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function trap(height) {
  // Write your code here
  return 0;
}`,
        python: `def trap(height: list[int]) -> int:
    # Write your code here
    return 0`,
        typescript: `function trap(height: number[]): number {
  // Write your code here
  return 0;
}`,
        java: `class Solution {
    public int trap(int[] height) {
        // Write your code here
        return 0;
    }
}`,
        cpp: `#include <vector>
using namespace std;

class Solution {
public:
    int trap(vector<int>& height) {
        // Write your code here
        return 0;
    }
};`,
        go: `package main

func trap(height []int) int {
    // Write your code here
    return 0
}`
      },
      testCases: [
        { id: 't1', input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6' },
        { id: 't2', input: '[4,2,0,3,2,5]', expectedOutput: '9' },
        { id: 't3', input: '[3,0,2,0,4]', expectedOutput: '7', isHidden: true }
      ],
      hints: [
        'For each element, how much water can be trapped above it? It is min(maxLeft, maxRight) - currentHeight.',
        'Can you maintain maxLeft and maxRight dynamically using two pointers moving inwards?'
      ],
      tags: ['Two Pointers', 'Dynamic Programming', 'Monotonic Stack', 'Hard'],
      acceptanceRate: 38
    },
    {
      id: 'prob_coin_change',
      title: 'Coin Change',
      slug: 'coin-change',
      difficulty: 'advanced',
      category: 'Dynamic Programming',
      description: 'You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money.\n\nReturn the **fewest number of coins** that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return `-1`.\n\nYou may assume that you have an infinite number of each kind of coin.',
      examples: [
        {
          input: 'coins = [1,2,5], amount = 11',
          output: '3',
          explanation: '11 = 5 + 5 + 1'
        },
        {
          input: 'coins = [2], amount = 3',
          output: '-1'
        },
        {
          input: 'coins = [1], amount = 0',
          output: '0'
        }
      ],
      constraints: [
        '1 <= coins.length <= 12',
        '1 <= coins[i] <= 2^31 - 1',
        '0 <= amount <= 10^4'
      ],
            starterCode: {
        javascript: `/**
 * @param {number[]} coins
 * @param {number} amount
 * @return {number}
 */
function coinChange(coins, amount) {
  // Write your code here
  return -1;
}`,
        python: `def coinChange(coins: list[int], amount: int) -> int:
    # Write your code here
    return -1`,
        typescript: `function coinChange(coins: number[], amount: number): number {
  // Write your code here
  return -1;
}`,
        java: `class Solution {
    public int coinChange(int[] coins, int amount) {
        // Write your code here
        return -1;
    }
}`,
        cpp: `#include <vector>
using namespace std;

class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        // Write your code here
        return -1;
    }
};`,
        go: `package main

func coinChange(coins []int, amount int) int {
    // Write your code here
    return -1
}`
      },
      testCases: [
        { id: 't1', input: '[1,2,5], 11', expectedOutput: '3' },
        { id: 't2', input: '[2], 3', expectedOutput: '-1' },
        { id: 't3', input: '[1], 0', expectedOutput: '0' },
        { id: 't4', input: '[186,419,83,408], 6249', expectedOutput: '20', isHidden: true }
      ],
      hints: [
        'Think of this as finding the shortest path in a graph where nodes are amounts from 0 to amount.',
        'Define dp[i] as the minimum coins needed to make amount i. What is the transition relation?'
      ],
      tags: ['Dynamic Programming', 'Breadth-First Search', 'State Optimization'],
      acceptanceRate: 43
    },
    {
      id: 'prob_course_schedule',
      title: 'Course Schedule',
      slug: 'course-schedule',
      difficulty: 'advanced',
      category: 'Graphs & Topological Sort',
      description: 'There are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. You are given an array `prerequisites` where `prerequisites[i] = [a_i, b_i]` indicates that you **must** take course `b_i` first if you want to take course `a_i`.\n\nReturn `true` if you can finish all courses. Otherwise, return `false` (i.e. if there is a circular dependency / cycle).',
      examples: [
        {
          input: 'numCourses = 2, prerequisites = [[1,0]]',
          output: 'true',
          explanation: 'To take course 1 you should have finished course 0. So it is possible.'
        },
        {
          input: 'numCourses = 2, prerequisites = [[1,0],[0,1]]',
          output: 'false',
          explanation: 'Course 1 requires course 0, but course 0 requires course 1. Cycle exists!'
        }
      ],
      constraints: [
        '1 <= numCourses <= 2000',
        '0 <= prerequisites.length <= 5000',
        'prerequisites[i].length == 2',
        'All prerequisite pairs are unique.'
      ],
            starterCode: {
        javascript: `/**
 * @param {number} numCourses
 * @param {number[][]} prerequisites
 * @return {boolean}
 */
function canFinish(numCourses, prerequisites) {
  // Write your code here
  return false;
}`,
        python: `def canFinish(numCourses: int, prerequisites: list[list[int]]) -> bool:
    # Write your code here
    return False`,
        typescript: `function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  // Write your code here
  return false;
}`,
        java: `class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        // Write your code here
        return false;
    }
}`,
        cpp: `#include <vector>
using namespace std;

class Solution {
public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        // Write your code here
        return false;
    }
};`,
        go: `package main

func canFinish(numCourses int, prerequisites [][]int) bool {
    // Write your code here
    return false
}`
      },
      testCases: [
        { id: 't1', input: '2, [[1,0]]', expectedOutput: 'true' },
        { id: 't2', input: '2, [[1,0],[0,1]]', expectedOutput: 'false' },
        { id: 't3', input: '4, [[1,0],[2,0],[3,1],[3,2]]', expectedOutput: 'true', isHidden: true }
      ],
      hints: [
        'Model the courses and prerequisites as a Directed Graph.',
        'Kahn\'s algorithm for Topological Sorting uses in-degrees and a queue. If you process all nodes, no cycle exists.'
      ],
      tags: ['Depth-First Search', 'Breadth-First Search', 'Graph', 'Topological Sort'],
      acceptanceRate: 47
    }
  ];
  for (const prob of curatedProblems) {
    const existing = await problemsCol.findOne({ id: prob.id });
    if (!existing) {
      await problemsCol.insertOne(prob);
    } else {
      await problemsCol.updateOne({ id: prob.id }, { $set: { starterCode: prob.starterCode } });
    }
  }

  // Initial Community Chat Messages (Clean welcome messages from faculty)
  const existingMsg = await messagesCol.countDocuments();
  if (existingMsg === 0) {
    const initialMessages = [
      {
        id: 'msg_welcome',
        channel: 'general',
        senderId: 'usr_admin_root',
        senderName: 'System Administrator',
        senderRole: 'admin',
        text: 'Welcome to CodeElevate Academy! The interactive coding platform is active. Work through curriculum modules, test your algorithms, and submit code for instant AI diagnostics.',
        createdAt: new Date().toISOString()
      }
    ];
    await messagesCol.insertMany(initialMessages);
  }

  console.log('✅ Seed completed: Users, Problems, Submissions, and Community Messages loaded.');
}
