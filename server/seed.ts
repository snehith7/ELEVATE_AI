import { dbManager } from './db';

export async function seedInitialData() {
  const usersCol = dbManager.getCollection('users');
  const problemsCol = dbManager.getCollection('problems');
  const submissionsCol = dbManager.getCollection('submissions');
  const messagesCol = dbManager.getCollection('messages');

  const existingUsers = await usersCol.countDocuments();
  if (existingUsers > 0) {
    return;
  }

  console.log('Seeding initial CodeElevate curriculum, users, and community data...');

  // Default Users
  const defaultUsers = [
    {
      id: 'usr_student_demo',
      username: 'alex_coder',
      email: 'alex@student.codenow.io',
      password: 'password123',
      role: 'student',
      skillLevel: 'intermediate',
      preferredLanguage: 'javascript',
      targetGoal: 'Ace Technical Interviews at Top Tech Companies',
      streakDays: 7,
      totalSolved: 14,
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString()
    },
    {
      id: 'usr_student_beginner',
      username: 'sarah_dev',
      email: 'sarah@student.codenow.io',
      password: 'password123',
      role: 'student',
      skillLevel: 'beginner',
      preferredLanguage: 'python',
      targetGoal: 'Learn Algorithms from Scratch and Master Data Structures',
      streakDays: 3,
      totalSolved: 5,
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
    },
    {
      id: 'usr_admin_mentor',
      username: 'lead_mentor',
      email: 'mentor@codenow.io',
      password: 'adminsecret123',
      role: 'admin',
      skillLevel: 'advanced',
      preferredLanguage: 'typescript',
      targetGoal: 'Oversee student progress and guide adaptive curricula',
      streakDays: 45,
      totalSolved: 150,
      createdAt: new Date(Date.now() - 90 * 86400000).toISOString()
    }
  ];
  await usersCol.insertMany(defaultUsers);

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
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
        python: `def twoSum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
        typescript: `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const comp = target - nums[i];
    if (map.has(comp)) {
      return [map.get(comp)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
        java: `import java.util.HashMap;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int comp = target - nums[i];
            if (map.containsKey(comp)) {
                return new int[]{map.get(comp), i};
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
        cpp: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> map;
        for (int i = 0; i < nums.size(); i++) {
            int comp = target - nums[i];
            if (map.find(comp) != map.end()) {
                return {map[comp], i};
            }
            map[nums[i]] = i;
        }
        return {};
    }
};`,
        go: `package main

func twoSum(nums []int, target int) []int {
    seen := make(map[int]int)
    for i, num := range nums {
        comp := target - num
        if idx, ok := seen[comp]; ok {
            return []int{idx, i}
        }
        seen[num] = i
    }
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
  // Your code here
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let left = 0, right = cleaned.length - 1;
  while (left < right) {
    if (cleaned[left] !== cleaned[right]) return false;
    left++;
    right--;
  }
  return true;
}`,
        python: `def isPalindrome(s: str) -> bool:
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    return cleaned == cleaned[::-1]`,
        typescript: `function isPalindrome(s: string): boolean {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let left = 0, right = cleaned.length - 1;
  while (left < right) {
    if (cleaned[left] !== cleaned[right]) return false;
    left++;
    right--;
  }
  return true;
}`,
        java: `class Solution {
    public boolean isPalindrome(String s) {
        String cleaned = s.toLowerCase().replaceAll("[^a-z0-9]", "");
        int l = 0, r = cleaned.length() - 1;
        while (l < r) {
            if (cleaned.charAt(l) != cleaned.charAt(r)) return false;
            l++; r--;
        }
        return true;
    }
}`,
        cpp: `#include <string>
#include <cctype>
using namespace std;

class Solution {
public:
    bool isPalindrome(string s) {
        int l = 0, r = s.length() - 1;
        while (l < r) {
            while (l < r && !isalnum(s[l])) l++;
            while (l < r && !isalnum(s[r])) r--;
            if (tolower(s[l]) != tolower(s[r])) return false;
            l++; r--;
        }
        return true;
    }
};`,
        go: `package main
import "unicode"

func isPalindrome(s string) bool {
    var chars []rune
    for _, r := range s {
        if unicode.IsLetter(r) || unicode.IsDigit(r) {
            chars = append(chars, unicode.ToLower(r))
        }
    }
    for i, j := 0, len(chars)-1; i < j; i, j = i+1, j-1 {
        if chars[i] != chars[j] {
            return false
        }
    }
    return true
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
        javascript: `function containsDuplicate(nums) {
  const seen = new Set();
  for (const n of nums) {
    if (seen.has(n)) return true;
    seen.add(n);
  }
  return false;
}`,
        python: `def containsDuplicate(nums: list[int]) -> bool:
    return len(nums) != len(set(nums))`,
        typescript: `function containsDuplicate(nums: number[]): boolean {
  return new Set(nums).size !== nums.length;
}`,
        java: `import java.util.HashSet;

class Solution {
    public boolean containsDuplicate(int[] nums) {
        HashSet<Integer> set = new HashSet<>();
        for (int n : nums) {
            if (!set.add(n)) return true;
        }
        return false;
    }
}`,
        cpp: `#include <vector>
#include <unordered_set>
using namespace std;

class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        unordered_set<int> set(nums.begin(), nums.end());
        return set.size() != nums.size();
    }
};`,
        go: `package main

func containsDuplicate(nums []int) bool {
    seen := make(map[int]bool)
    for _, v := range nums {
        if seen[v] {
            return true
        }
        seen[v] = true
    }
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
  nums.sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let left = i + 1, right = nums.length - 1;
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }
  return result;
}`,
        python: `def threeSum(nums: list[int]) -> list[list[int]]:
    nums.sort()
    res = []
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        l, r = i + 1, len(nums) - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if s == 0:
                res.append([nums[i], nums[l], nums[r]])
                while l < r and nums[l] == nums[l + 1]:
                    l += 1
                while l < r and nums[r] == nums[r - 1]:
                    r -= 1
                l += 1
                r -= 1
            elif s < 0:
                l += 1
            else:
                r -= 1
    return res`,
        typescript: `function threeSum(nums: number[]): number[][] {
  nums.sort((a, b) => a - b);
  const result: number[][] = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let l = i + 1, r = nums.length - 1;
    while (l < r) {
      const sum = nums[i] + nums[l] + nums[r];
      if (sum === 0) {
        result.push([nums[i], nums[l], nums[r]]);
        while (l < r && nums[l] === nums[l + 1]) l++;
        while (l < r && nums[r] === nums[r - 1]) r--;
        l++;
        r--;
      } else if (sum < 0) {
        l++;
      } else {
        r--;
      }
    }
  }
  return result;
}`,
        java: `import java.util.*;

class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> res = new ArrayList<>();
        for (int i = 0; i < nums.length - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int l = i + 1, r = nums.length - 1;
            while (l < r) {
                int sum = nums[i] + nums[l] + nums[r];
                if (sum == 0) {
                    res.add(Arrays.asList(nums[i], nums[l], nums[r]));
                    while (l < r && nums[l] == nums[l + 1]) l++;
                    while (l < r && nums[r] == nums[r - 1]) r--;
                    l++; r--;
                } else if (sum < 0) {
                    l++;
                } else {
                    r--;
                }
            }
        }
        return res;
    }
}`,
        cpp: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        vector<vector<int>> res;
        for (int i = 0; i < (int)nums.size() - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int l = i + 1, r = nums.size() - 1;
            while (l < r) {
                int sum = nums[i] + nums[l] + nums[r];
                if (sum == 0) {
                    res.push_back({nums[i], nums[l], nums[r]});
                    while (l < r && nums[l] == nums[l + 1]) l++;
                    while (l < r && nums[r] == nums[r - 1]) r--;
                    l++; r--;
                } else if (sum < 0) l++;
                else r--;
            }
        }
        return res;
    }
};`,
        go: `package main
import "sort"

func threeSum(nums []int) [][]int {
    sort.Ints(nums)
    res := [][]int{}
    for i := 0; i < len(nums)-2; i++ {
        if i > 0 && nums[i] == nums[i-1] {
            continue
        }
        l, r := i+1, len(nums)-1
        for l < r {
            sum := nums[i] + nums[l] + nums[r]
            if sum == 0 {
                res = append(res, []int{nums[i], nums[l], nums[r]})
                for l < r && nums[l] == nums[l+1] { l++ }
                for l < r && nums[r] == nums[r-1] { r-- }
                l++
                r--
            } else if sum < 0 {
                l++
            } else {
                r--
            }
        }
    }
    return res
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
        javascript: `function lengthOfLongestSubstring(s) {
  const map = new Map();
  let maxLen = 0, left = 0;
  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (map.has(char) && map.get(char) >= left) {
      left = map.get(char) + 1;
    }
    map.set(char, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
        python: `def lengthOfLongestSubstring(s: str) -> int:
    char_map = {}
    max_len = 0
    left = 0
    for right, char in enumerate(s):
        if char in char_map and char_map[char] >= left:
            left = char_map[char] + 1
        char_map[char] = right
        max_len = max(max_len, right - left + 1)
    return max_len`,
        typescript: `function lengthOfLongestSubstring(s: string): number {
  const map = new Map<string, number>();
  let maxLen = 0, left = 0;
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if (map.has(c) && map.get(c)! >= left) {
      left = map.get(c)! + 1;
    }
    map.set(c, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
        java: `import java.util.HashMap;

class Solution {
    public int lengthOfLongestSubstring(String s) {
        HashMap<Character, Integer> map = new HashMap<>();
        int maxLen = 0, left = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (map.containsKey(c) && map.get(c) >= left) {
                left = map.get(c) + 1;
            }
            map.put(c, right);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}`,
        cpp: `#include <string>
#include <unordered_map>
#include <algorithm>
using namespace std;

class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_map<char, int> map;
        int maxLen = 0, left = 0;
        for (int right = 0; right < s.length(); right++) {
            if (map.count(s[right]) && map[s[right]] >= left) {
                left = map[s[right]] + 1;
            }
            map[s[right]] = right;
            maxLen = max(maxLen, right - left + 1);
        }
        return maxLen;
    }
};`,
        go: `package main

func lengthOfLongestSubstring(s string) int {
    lastSeen := make(map[rune]int)
    maxLen, left := 0, 0
    for right, r := range s {
        if idx, ok := lastSeen[r]; ok && idx >= left {
            left = idx + 1
        }
        lastSeen[r] = right
        if currLen := right - left + 1; currLen > maxLen {
            maxLen = currLen
        }
    }
    return maxLen
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
        javascript: `function groupAnagrams(strs) {
  const map = new Map();
  for (const str of strs) {
    const sorted = str.split('').sort().join('');
    if (!map.has(sorted)) map.set(sorted, []);
    map.get(sorted).push(str);
  }
  return Array.from(map.values());
}`,
        python: `from collections import defaultdict

def groupAnagrams(strs: list[str]) -> list[list[str]]:
    groups = defaultdict(list)
    for s in strs:
        key = ''.join(sorted(s))
        groups[key].append(s)
    return list(groups.values())`,
        typescript: `function groupAnagrams(strs: string[]): string[][] {
  const map = new Map<string, string[]>();
  for (const s of strs) {
    const key = s.split('').sort().join('');
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  return Array.from(map.values());
}`,
        java: `import java.util.*;

class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> map = new HashMap<>();
        for (String s : strs) {
            char[] chars = s.toCharArray();
            Arrays.sort(chars);
            String key = new String(chars);
            map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
        }
        return new ArrayList<>(map.values());
    }
}`,
        cpp: `#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>
using namespace std;

class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> map;
        for (const string& s : strs) {
            string key = s;
            sort(key.begin(), key.end());
            map[key].push_back(s);
        }
        vector<vector<string>> res;
        for (auto& pair : map) res.push_back(pair.second);
        return res;
    }
};`,
        go: `package main
import "sort"

func groupAnagrams(strs []string) [][]string {
    groups := make(map[string][]string)
    for _, s := range strs {
        r := []rune(s)
        sort.Slice(r, func(i, j int) bool { return r[i] < r[j] })
        key := string(r)
        groups[key] = append(groups[key], s)
    }
    var res [][]string
    for _, list := range groups {
        res = append(res, list)
    }
    return res
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
        javascript: `function trap(height) {
  let left = 0, right = height.length - 1;
  let leftMax = 0, rightMax = 0;
  let totalWater = 0;

  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= leftMax) {
        leftMax = height[left];
      } else {
        totalWater += leftMax - height[left];
      }
      left++;
    } else {
      if (height[right] >= rightMax) {
        rightMax = height[right];
      } else {
        totalWater += rightMax - height[right];
      }
      right--;
    }
  }
  return totalWater;
}`,
        python: `def trap(height: list[int]) -> int:
    left, right = 0, len(height) - 1
    left_max, right_max = 0, 0
    water = 0
    while left < right:
        if height[left] < height[right]:
            if height[left] >= left_max:
                left_max = height[left]
            else:
                water += left_max - height[left]
            left += 1
        else:
            if height[right] >= right_max:
                right_max = height[right]
            else:
                water += right_max - height[right]
            right -= 1
    return water`,
        typescript: `function trap(height: number[]): number {
  let left = 0, right = height.length - 1;
  let leftMax = 0, rightMax = 0;
  let water = 0;
  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= leftMax) leftMax = height[left];
      else water += leftMax - height[left];
      left++;
    } else {
      if (height[right] >= rightMax) rightMax = height[right];
      else water += rightMax - height[right];
      right--;
    }
  }
  return water;
}`,
        java: `class Solution {
    public int trap(int[] height) {
        int l = 0, r = height.length - 1;
        int lMax = 0, rMax = 0, res = 0;
        while (l < r) {
            if (height[l] < height[r]) {
                if (height[l] >= lMax) lMax = height[l];
                else res += lMax - height[l];
                l++;
            } else {
                if (height[r] >= rMax) rMax = height[r];
                else res += rMax - height[r];
                r--;
            }
        }
        return res;
    }
}`,
        cpp: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int trap(vector<int>& height) {
        int l = 0, r = height.size() - 1;
        int lMax = 0, rMax = 0, water = 0;
        while (l < r) {
            if (height[l] < height[r]) {
                if (height[l] >= lMax) lMax = height[l];
                else water += lMax - height[l];
                l++;
            } else {
                if (height[r] >= rMax) rMax = height[r];
                else water += rMax - height[r];
                r--;
            }
        }
        return water;
    }
};`,
        go: `package main

func trap(height []int) int {
    l, r := 0, len(height)-1
    lMax, rMax, water := 0, 0, 0
    for l < r {
        if height[l] < height[r] {
            if height[l] >= lMax {
                lMax = height[l]
            } else {
                water += lMax - height[l]
            }
            l++
        } else {
            if height[r] >= rMax {
                rMax = height[r]
            } else {
                water += rMax - height[r]
            }
            r--
        }
    }
    return water
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
        javascript: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (i - coin >= 0) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
        python: `def coinChange(coins: list[int], amount: int) -> int:
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for c in coins:
            if i - c >= 0:
                dp[i] = min(dp[i], dp[i - c] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1`,
        typescript: `function coinChange(coins: number[], amount: number): number {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (i - coin >= 0) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
        java: `import java.util.Arrays;

class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int i = 1; i <= amount; i++) {
            for (int c : coins) {
                if (i - c >= 0) {
                    dp[i] = Math.min(dp[i], dp[i - c] + 1);
                }
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
}`,
        cpp: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        vector<int> dp(amount + 1, amount + 1);
        dp[0] = 0;
        for (int i = 1; i <= amount; i++) {
            for (int c : coins) {
                if (i - c >= 0) {
                    dp[i] = min(dp[i], dp[i - c] + 1);
                }
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
};`,
        go: `package main
import "math"

func coinChange(coins []int, amount int) int {
    dp := make([]int, amount+1)
    for i := range dp {
        dp[i] = math.MaxInt32
    }
    dp[0] = 0
    for i := 1; i <= amount; i++ {
        for _, c := range coins {
            if i-c >= 0 && dp[i-c] != math.MaxInt32 {
                if dp[i-c]+1 < dp[i] {
                    dp[i] = dp[i-c] + 1
                }
            }
        }
    }
    if dp[amount] == math.MaxInt32 {
        return -1
    }
    return dp[amount]
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
        javascript: `function canFinish(numCourses, prerequisites) {
  const inDegree = new Array(numCourses).fill(0);
  const adj = Array.from({ length: numCourses }, () => []);
  for (const [course, pre] of prerequisites) {
    adj[pre].push(course);
    inDegree[course]++;
  }
  const queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }
  let count = 0;
  while (queue.length > 0) {
    const curr = queue.shift();
    count++;
    for (const next of adj[curr]) {
      inDegree[next]--;
      if (inDegree[next] === 0) queue.push(next);
    }
  }
  return count === numCourses;
}`,
        python: `from collections import deque

def canFinish(numCourses: int, prerequisites: list[list[int]]) -> bool:
    in_degree = [0] * numCourses
    adj = [[] for _ in range(numCourses)]
    for course, pre in prerequisites:
        adj[pre].append(course)
        in_degree[course] += 1
    queue = deque([i for i in range(numCourses) if in_degree[i] == 0])
    visited = 0
    while queue:
        curr = queue.popleft()
        visited += 1
        for neighbor in adj[curr]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
    return visited == numCourses`,
        typescript: `function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  const inDegree = new Array(numCourses).fill(0);
  const adj: number[][] = Array.from({ length: numCourses }, () => []);
  for (const [course, pre] of prerequisites) {
    adj[pre].push(course);
    inDegree[course]++;
  }
  const queue: number[] = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }
  let visited = 0;
  while (queue.length) {
    const curr = queue.shift()!;
    visited++;
    for (const next of adj[curr]) {
      inDegree[next]--;
      if (inDegree[next] === 0) queue.push(next);
    }
  }
  return visited === numCourses;
}`,
        java: `import java.util.*;

class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        int[] inDegree = new int[numCourses];
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
        for (int[] p : prerequisites) {
            adj.get(p[1]).add(p[0]);
            inDegree[p[0]]++;
        }
        Queue<Integer> q = new LinkedList<>();
        for (int i = 0; i < numCourses; i++) {
            if (inDegree[i] == 0) q.offer(i);
        }
        int visited = 0;
        while (!q.isEmpty()) {
            int curr = q.poll();
            visited++;
            for (int next : adj.get(curr)) {
                if (--inDegree[next] == 0) q.offer(next);
            }
        }
        return visited == numCourses;
    }
}`,
        cpp: `#include <vector>
#include <queue>
using namespace std;

class Solution {
public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        vector<int> inDegree(numCourses, 0);
        vector<vector<int>> adj(numCourses);
        for (const auto& p : prerequisites) {
            adj[p[1]].push_back(p[0]);
            inDegree[p[0]]++;
        }
        queue<int> q;
        for (int i = 0; i < numCourses; i++) {
            if (inDegree[i] == 0) q.push(i);
        }
        int visited = 0;
        while (!q.empty()) {
            int curr = q.front(); q.pop();
            visited++;
            for (int next : adj[curr]) {
                if (--inDegree[next] == 0) q.push(next);
            }
        }
        return visited == numCourses;
    }
};`,
        go: `package main

func canFinish(numCourses int, prerequisites [][]int) bool {
    inDegree := make([]int, numCourses)
    adj := make([][]int, numCourses)
    for _, p := range prerequisites {
        adj[p[1]] = append(adj[p[1]], p[0])
        inDegree[p[0]]++
    }
    var q []int
    for i := 0; i < numCourses; i++ {
        if inDegree[i] == 0 {
            q = append(q, i)
        }
    }
    visited := 0
    for len(q) > 0 {
        curr := q[0]
        q = q[1:]
        visited++
        for _, next := range adj[curr] {
            inDegree[next]--
            if inDegree[next] == 0 {
                q = append(q, next)
            }
        }
    }
    return visited == numCourses
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
  await problemsCol.insertMany(curatedProblems);

  // Sample Submissions for analytics demonstration
  const sampleSubmissions = [
    {
      id: 'sub_1',
      userId: 'usr_student_demo',
      userEmail: 'alex@student.codenow.io',
      userName: 'alex_coder',
      problemId: 'prob_two_sum',
      problemTitle: 'Two Sum',
      difficulty: 'basic',
      category: 'Arrays & Hash Maps',
      code: curatedProblems[0].starterCode.javascript,
      language: 'javascript',
      status: 'accepted',
      passedCases: 4,
      totalCases: 4,
      executionTimeMs: 42,
      memoryKb: 34100,
      testResults: [
        { testId: 't1', passed: true, input: '[2,7,11,15], 9', expected: '[0,1]', actual: '[0,1]' },
        { testId: 't2', passed: true, input: '[3,2,4], 6', expected: '[1,2]', actual: '[1,2]' },
        { testId: 't3', passed: true, input: '[3,3], 6', expected: '[0,1]', actual: '[0,1]' },
        { testId: 't4', passed: true, input: '[1,5,8,3], 4', expected: '[0,3]', actual: '[0,3]' }
      ],
      aiReview: {
        correctnessScore: 100,
        timeComplexity: 'O(N) linear time with single-pass hash map',
        spaceComplexity: 'O(N) auxiliary map storage',
        summary: 'Optimal single pass solution. Complement lookup is clean and handles duplicate numbers gracefully.',
        strengths: ['Early return on match', 'Map lookup O(1) average time', 'Clean syntactic variable naming'],
        improvements: ['Could add explicit input length verification guard'],
        edgeCasesCovered: ['Standard array', 'Duplicates summing to target']
      },
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    {
      id: 'sub_2',
      userId: 'usr_student_demo',
      userEmail: 'alex@student.codenow.io',
      userName: 'alex_coder',
      problemId: 'prob_3sum',
      problemTitle: '3Sum',
      difficulty: 'intermediate',
      category: 'Two Pointers',
      code: curatedProblems[3].starterCode.javascript,
      language: 'javascript',
      status: 'accepted',
      passedCases: 3,
      totalCases: 3,
      executionTimeMs: 118,
      memoryKb: 48200,
      testResults: [
        { testId: 't1', passed: true, input: '[-1,0,1,2,-1,-4]', expected: '[[-1,-1,2],[-1,0,1]]', actual: '[[-1,-1,2],[-1,0,1]]' },
        { testId: 't2', passed: true, input: '[0,1,1]', expected: '[]', actual: '[]' },
        { testId: 't3', passed: true, input: '[0,0,0]', expected: '[[0,0,0]]', actual: '[[0,0,0]]' }
      ],
      aiReview: {
        correctnessScore: 95,
        timeComplexity: 'O(N^2) sorting + two pointers',
        spaceComplexity: 'O(1) auxiliary space (excluding return array)',
        summary: 'Solid implementation of 3Sum with proper duplicate skipping after matches.',
        strengths: ['Well-handled duplicate skips for i, left, and right', 'In-place sorting avoids unnecessary allocations'],
        improvements: ['Could break early if nums[i] > 0 since remaining elements are positive'],
        edgeCasesCovered: ['All zeroes', 'No triplet valid', 'Multiple duplicates']
      },
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: 'sub_3',
      userId: 'usr_student_demo',
      userEmail: 'alex@student.codenow.io',
      userName: 'alex_coder',
      problemId: 'prob_coin_change',
      problemTitle: 'Coin Change',
      difficulty: 'advanced',
      category: 'Dynamic Programming',
      code: `// Initial recursive attempt without memoization (struggled with TLE)\nfunction coinChange(coins, amount) {\n  if (amount === 0) return 0;\n  let minCoins = Infinity;\n  for (const c of coins) {\n    if (amount - c >= 0) {\n      minCoins = Math.min(minCoins, coinChange(coins, amount - c) + 1);\n    }\n  }\n  return minCoins === Infinity ? -1 : minCoins;\n}`,
      language: 'javascript',
      status: 'time_limit',
      passedCases: 2,
      totalCases: 4,
      executionTimeMs: 2500,
      memoryKb: 54000,
      errorDetails: 'Time Limit Exceeded: Recursive branching without memoization caused exponential O(S^N) blowup.',
      aiReview: {
        correctnessScore: 50,
        timeComplexity: 'O(S^N) exponential without memoization (TLE)',
        spaceComplexity: 'O(N) recursion call stack',
        summary: 'Recursive structure is conceptually sound, but duplicate subproblems cause catastrophic time limit exceeded on larger amounts.',
        strengths: ['Identified correct base case for amount == 0'],
        improvements: ['Convert to bottom-up DP table or add a memoization Map/array', 'Initialize dp array of size amount + 1'],
        edgeCasesCovered: ['Small amounts'],
        edgeCasesMissed: ['Large amounts (timed out)']
      },
      createdAt: new Date(Date.now() - 5 * 3600000).toISOString()
    }
  ];
  await submissionsCol.insertMany(sampleSubmissions);

  // Initial Community Chat Messages
  const initialMessages = [
    {
      id: 'msg_1',
      channel: 'general',
      senderId: 'usr_admin_mentor',
      senderName: 'Lead Mentor (David)',
      senderRole: 'mentor',
      text: 'Welcome to CodeElevate Academy! Our AI Mentor is online 24/7 in your coding playground. Feel free to ask questions here or use the "Ask AI Tutor" side drawer while solving.',
      createdAt: new Date(Date.now() - 48 * 3600000).toISOString()
    },
    {
      id: 'msg_2',
      channel: 'algorithms',
      senderId: 'usr_student_demo',
      senderName: 'Alex Coder',
      senderRole: 'student',
      text: 'Has anyone tackled the Trapping Rain Water problem yet? I found that using two pointers was much easier than maintaining two separate prefix/suffix maximum arrays.',
      codeSnippet: {
        language: 'javascript',
        code: 'let leftMax = 0, rightMax = 0;\nwhile (left < right) {\n  if (height[left] < height[right]) { ... }\n}'
      },
      reactions: { '🔥': 4, '💡': 3 },
      createdAt: new Date(Date.now() - 12 * 3600000).toISOString()
    },
    {
      id: 'msg_3',
      channel: 'algorithms',
      senderId: 'usr_admin_mentor',
      senderName: 'Lead Mentor (David)',
      senderRole: 'mentor',
      text: 'Spot on, Alex! The two-pointer approach reduces the space complexity from O(N) to O(1) by lazily evaluating whichever boundary is strictly smaller.',
      reactions: { '🚀': 5 },
      createdAt: new Date(Date.now() - 10 * 3600000).toISOString()
    },
    {
      id: 'msg_4',
      channel: 'interview-prep',
      senderId: 'usr_student_beginner',
      senderName: 'Sarah Dev',
      senderRole: 'student',
      text: 'The AI feedback feature highlighted that I was missing null checks on empty string inputs. That immediate review really saved me!',
      reactions: { '❤️': 6 },
      createdAt: new Date(Date.now() - 4 * 3600000).toISOString()
    }
  ];
  await messagesCol.insertMany(initialMessages);

  console.log('✅ Seed completed: Users, Problems, Submissions, and Community Messages loaded.');
}
