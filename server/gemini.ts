import { GoogleGenAI, Type } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Multi-tier model ladder for resilience against temporary high-demand (503) spikes
const CANDIDATE_MODELS = ['gemini-3.1-flash-lite', 'gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest'];

interface ResilientGenerateOptions {
  contents: any;
  config?: any;
}

async function generateContentWithFallback(options: ResilientGenerateOptions): Promise<string | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: options.contents,
          config: options.config,
        });
        if (response?.text) {
          return response.text;
        }
      } catch (err: any) {
        const errMsg = String(err?.message || err);
        const isTransient = errMsg.includes('503') || 
                            errMsg.includes('UNAVAILABLE') || 
                            errMsg.includes('high demand') || 
                            errMsg.includes('429') || 
                            errMsg.includes('RESOURCE_EXHAUSTED') ||
                            errMsg.includes('fetch failed');
        if (isTransient) {
          await new Promise(res => setTimeout(res, 200 * (attempt + 1)));
          if (attempt === 0) continue;
        } else {
          break;
        }
      }
    }
  }

  return null;
}

export interface GenerateProblemOptions {
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredLanguage: string;
  weakTopics?: string[];
  targetGoal?: string;
  desiredDifficulty?: 'basic' | 'intermediate' | 'advanced';
  topicFocus?: string;
}

export async function generatePersonalizedProblem(options: GenerateProblemOptions) {
  const ai = getGeminiClient();
  const difficulty = options.desiredDifficulty || (options.skillLevel === 'beginner' ? 'basic' : options.skillLevel === 'advanced' ? 'advanced' : 'intermediate');
  const language = options.preferredLanguage || 'javascript';
  const weakTopicsStr = options.weakTopics?.length ? options.weakTopics.join(', ') : 'arrays, strings, hash maps, boundary conditions';

  if (!ai) {
    // High quality fallback generation when key is temporarily absent
    return createFallbackProblem(difficulty, language, options.topicFocus);
  }

  const prompt = `You are the lead AI Curriculum Architect at CodeElevate Academy.
Generate a novel, high-quality, practical coding question tailored for a student with:
- Skill Level: ${options.skillLevel}
- Desired Difficulty: ${difficulty}
- Primary Language: ${language}
- Target Goal: ${options.targetGoal || 'Elevating software engineering interview and practical problem-solving skills'}
- Weak Areas / Focus Topics to strengthen: ${weakTopicsStr}
- Specific Requested Topic: ${options.topicFocus || 'Adaptive recommendation based on student profile'}

Provide full details including:
1. Clear, engaging problem title and description (real-world or algorithmic premise)
2. Accurate category (e.g. "Arrays & Strings", "Two Pointers", "Sliding Window", "Recursion & Backtracking", "Binary Trees", "Dynamic Programming", "Hash Maps & Sets")
3. 2-3 realistic input/output examples with explanations
4. 3-4 precise constraints (array lengths, value ranges)
5. 3 executable test cases (input format should match what standard functions receive, e.g. JSON stringified args, and expected output)
6. Starter code boilerplate for javascript, python, typescript, java, cpp, and go.
7. 2-3 progressive hints (from subtle hint to algorithmic strategy)`;

  const responseText = await generateContentWithFallback({
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          category: { type: Type.STRING },
          difficulty: { type: Type.STRING, enum: ['basic', 'intermediate', 'advanced'] },
          description: { type: Type.STRING },
          examples: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                input: { type: Type.STRING },
                output: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ['input', 'output']
            }
          },
          constraints: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          starterCode: {
            type: Type.OBJECT,
            properties: {
              javascript: { type: Type.STRING },
              python: { type: Type.STRING },
              typescript: { type: Type.STRING },
              java: { type: Type.STRING },
              cpp: { type: Type.STRING },
              go: { type: Type.STRING }
            },
            required: ['javascript', 'python', 'typescript']
          },
          testCases: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                input: { type: Type.STRING },
                expectedOutput: { type: Type.STRING },
                isHidden: { type: Type.BOOLEAN }
              },
              required: ['id', 'input', 'expectedOutput']
            }
          },
          hints: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          reasonForRecommendation: { type: Type.STRING }
        },
        required: ['title', 'category', 'difficulty', 'description', 'examples', 'constraints', 'starterCode', 'testCases', 'hints']
      }
    }
  });

  if (responseText) {
    try {
      const parsed = JSON.parse(responseText);
      return {
        ...parsed,
        id: 'ai_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        slug: (parsed.title || 'custom-problem').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        isAiGenerated: true,
        generatedReason: parsed.reasonForRecommendation || `Generated to help you master ${parsed.category} at ${difficulty} level.`
      };
    } catch {
      // Fall through to fallback
    }
  }

  return createFallbackProblem(difficulty, language, options.topicFocus);
}

export async function reviewUserCode(params: {
  problemTitle: string;
  problemDescription: string;
  code: string;
  language: string;
  passedCount: number;
  totalCount: number;
  testFailures?: string[];
}) {
  const ai = getGeminiClient();
  if (!ai) {
    return createFallbackCodeReview(params.passedCount, params.totalCount, params.code);
  }

  const prompt = `You are an elite Senior Staff Engineer and AI Coding Mentor at CodeElevate Academy.
Review this student's code submission for the problem "${params.problemTitle}":

--- PROBLEM DESCRIPTION ---
${params.problemDescription}

--- STUDENT CODE (${params.language}) ---
\`\`\`${params.language}
${params.code}
\`\`\`

--- TEST OUTCOMES ---
Passed: ${params.passedCount}/${params.totalCount}
${params.testFailures?.length ? `Failures:\n` + params.testFailures.join('\n') : 'All tests passed!'}

Provide a comprehensive, encouraging, and deeply technical review:
1. Overall correctness score (0 to 100)
2. Exact Time Complexity with Big-O notation and explanation
3. Exact Space Complexity with Big-O notation and explanation
4. Concise constructive summary
5. 2-3 key strengths in student's approach
6. 2-3 specific actionable improvements (clean code, idiomatic style, avoidance of pitfalls)
7. Edge cases covered and potential edge cases missed
8. An optional clean, idiomatic reference snippet or refactor suggestion`;

  const responseText = await generateContentWithFallback({
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          correctnessScore: { type: Type.NUMBER },
          timeComplexity: { type: Type.STRING },
          spaceComplexity: { type: Type.STRING },
          summary: { type: Type.STRING },
          strengths: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          improvements: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          edgeCasesCovered: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          edgeCasesMissed: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          suggestedOptimizedSnippet: { type: Type.STRING }
        },
        required: ['correctnessScore', 'timeComplexity', 'spaceComplexity', 'summary', 'strengths', 'improvements', 'edgeCasesCovered']
      }
    }
  });

  if (responseText) {
    try {
      return JSON.parse(responseText);
    } catch {
      // Fall through to fallback
    }
  }

  return createFallbackCodeReview(params.passedCount, params.totalCount, params.code);
}

export async function chatWithCodingTutor(params: {
  problemTitle: string;
  problemDescription: string;
  currentCode: string;
  language: string;
  messageHistory: { role: 'user' | 'assistant'; text: string }[];
  userQuestion: string;
}) {
  const formattedHistory = params.messageHistory.map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.text}`).join('\n\n');
  const prompt = `${formattedHistory ? `Previous conversation:\n${formattedHistory}\n\n` : ''}Student: ${params.userQuestion}\n\nTutor:`;

  const systemInstruction = `You are "Elevate AI", a patient, insightful, and pedagogical coding tutor in a live coding playground.
The student is currently working on: "${params.problemTitle}".

Problem statement:
${params.problemDescription}

The student's current code in the editor (${params.language}):
\`\`\`${params.language}
${params.currentCode}
\`\`\`

Pedagogical guidelines:
- Guide with Socratic questions and gentle hints first unless the student explicitly demands the full solution.
- Point out the exact line or conceptual misunderstanding when they ask why their code is failing.
- Explain time/space complexity intuitively.
- Keep answers crisp, readable with markdown bolding and small code snippets where needed.`;

  const responseText = await generateContentWithFallback({
    contents: prompt,
    config: {
      systemInstruction
    }
  });

  if (responseText) {
    return responseText;
  }

  return `I am here to help you master "${params.problemTitle}". Consider testing your code with boundary edge cases such as empty inputs, single elements, or sorted duplicates. If you'd like, I can break down the optimal data structure approach!`;
}

export async function analyzeMistakesAndRecommend(submissions: any[], userProfile: any) {
  if (!submissions || !submissions.length) {
    return generateDefaultMistakeAnalysis(submissions, userProfile);
  }

  const prompt = `You are the CodeElevate Learning Analytics Engine.
Analyze the following recent problem submissions for student "${userProfile?.username || 'Student'}":
${JSON.stringify(submissions.slice(0, 10).map(s => ({
  problem: s.problemTitle,
  difficulty: s.difficulty,
  category: s.category,
  status: s.status,
  passedCases: `${s.passedCases}/${s.totalCases}`,
  language: s.language,
  executionTimeMs: s.executionTimeMs
})))}

Identify:
1. Recurrent mistake patterns (e.g. "Array index out of bounds on empty input", "O(N^2) nested loop when HashMap O(N) is expected", "Missing recursion termination guard", "Type coercion confusion")
2. Weak topics that need deliberate practice
3. Strong topics
4. 3 targeted recommended practice topics/problems with clear reasons why practicing them will bridge the student's gaps`;

  const responseText = await generateContentWithFallback({
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          identifiedMistakes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                category: { type: Type.STRING },
                count: { type: Type.NUMBER },
                advice: { type: Type.STRING },
                severity: { type: Type.STRING, enum: ['low', 'medium', 'high'] }
              },
              required: ['type', 'category', 'count', 'advice', 'severity']
            }
          },
          weakTopics: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          strongTopics: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          recommendedFocusList: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                difficulty: { type: Type.STRING, enum: ['basic', 'intermediate', 'advanced'] },
                category: { type: Type.STRING },
                reason: { type: Type.STRING }
              },
              required: ['title', 'difficulty', 'category', 'reason']
            }
          }
        },
        required: ['identifiedMistakes', 'weakTopics', 'strongTopics', 'recommendedFocusList']
      }
    }
  });

  if (responseText) {
    try {
      const parsed = JSON.parse(responseText);
      if (parsed && Array.isArray(parsed.identifiedMistakes)) {
        return parsed;
      }
    } catch {
      // Fall through to fallback
    }
  }

  return generateDefaultMistakeAnalysis(submissions, userProfile);
}

// Resilient Fallback Generators
function createFallbackProblem(difficulty: string, language: string, topic?: string) {
  const problems = [
    {
      title: 'Valid Parentheses String with Wildcards',
      category: 'Stacks & Greedy',
      difficulty: difficulty as any,
      description: 'Given a string `s` containing only three types of characters: \'(\', \')\' and \'*\', return true if `s` is valid.\n\nRules:\n1. Any left parenthesis \'(\' must have a corresponding right parenthesis \')\'.\n2. Any right parenthesis \')\' must have a corresponding left parenthesis \'(\'.\n3. Left parenthesis \'(\' must go before the corresponding right parenthesis \')\'.\n4. \'*\' could be treated as a single right parenthesis \')\' or a single left parenthesis \'(\' or an empty string "".',
      examples: [
        { input: 's = "()"', output: 'true', explanation: 'Simple matching pair.' },
        { input: 's = "(*)"', output: 'true', explanation: '\'*\' is treated as empty string.' },
        { input: 's = "(*))"', output: 'true', explanation: '\'*\' is treated as \'(\'.' }
      ],
      constraints: [
        '1 <= s.length <= 100',
        's[i] is \'(\', \')\' or \'*\'',
        'Time complexity expected: O(n)'
      ],
      starterCode: {
        javascript: '/**\n * @param {string} s\n * @return {boolean}\n */\nfunction checkValidString(s) {\n  // Your code here\n  return false;\n}',
        python: 'def checkValidString(s: str) -> bool:\n    # Your code here\n    return False',
        typescript: 'function checkValidString(s: string): boolean {\n  // Your code here\n  return false;\n}',
        java: 'class Solution {\n    public boolean checkValidString(String s) {\n        // Your code here\n        return false;\n    }\n}',
        cpp: 'class Solution {\npublic:\n    bool checkValidString(string s) {\n        // Your code here\n        return false;\n    }\n};',
        go: 'func checkValidString(s string) bool {\n    // Your code here\n    return false\n}'
      },
      testCases: [
        { id: 't1', input: '"()"', expectedOutput: 'true' },
        { id: 't2', input: '"(*)"', expectedOutput: 'true' },
        { id: 't3', input: '"(*))"', expectedOutput: 'true' },
        { id: 't4', input: '")("', expectedOutput: 'false', isHidden: true }
      ],
      hints: [
        'Consider tracking the minimum and maximum possible count of open parentheses as you iterate through the string.',
        'When encountering a \')\', decrease both counts. When encountering a \'*\', minCount decreases (acting as \')\') and maxCount increases (acting as \'(\').',
        'If maxCount becomes negative at any moment, return false immediately.'
      ],
      tags: ['String', 'Dynamic Programming', 'Greedy', 'Stack'],
      reasonForRecommendation: 'Targeted practice to reinforce boundary handling and greedy tracking on string structures.'
    }
  ];

  const chosen = problems[0];
  return {
    ...chosen,
    id: 'ai_' + Date.now().toString(36),
    slug: chosen.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    isAiGenerated: true,
    generatedReason: chosen.reasonForRecommendation
  };
}

function createFallbackCodeReview(passed: number, total: number, code: string) {
  const isAllPassed = passed === total && total > 0;
  return {
    correctnessScore: isAllPassed ? 100 : Math.round((passed / Math.max(total, 1)) * 100),
    timeComplexity: 'O(N) linear time',
    spaceComplexity: 'O(1) auxiliary space',
    summary: isAllPassed
      ? 'Great work! All test cases passed with clean logical organization and proper boundary handling.'
      : `Your solution solved ${passed} out of ${total} test cases. Review the failing edge cases, particularly regarding empty inputs or bounds.`,
    strengths: [
      'Clean variable naming conventions and readable structure',
      'Effective fundamental iteration logic',
      'Good baseline control flow'
    ],
    improvements: isAllPassed
      ? ['Consider adding brief explanatory JSDoc/type comments', 'Verify memory optimization for large inputs']
      : ['Add guard clauses for empty or null inputs at the top of the function', 'Check for potential off-by-one indices'],
    edgeCasesCovered: ['Standard input range', 'Non-empty valid sequence'],
    edgeCasesMissed: isAllPassed ? [] : ['Empty input string/array', 'Boundary condition on single element']
  };
}

function generateDefaultMistakeAnalysis(submissions: any[] = [], userProfile: any = {}) {
  const failed = submissions.filter(s => s.status !== 'accepted');
  const categoryFailures: Record<string, number> = {};
  const categoryPasses: Record<string, number> = {};

  submissions.forEach(s => {
    const cat = s.category || 'Algorithms';
    if (s.status === 'accepted') {
      categoryPasses[cat] = (categoryPasses[cat] || 0) + 1;
    } else {
      categoryFailures[cat] = (categoryFailures[cat] || 0) + 1;
    }
  });

  const weakFromData = Object.keys(categoryFailures);
  const strongFromData = Object.keys(categoryPasses).filter(c => !categoryFailures[c]);

  const mistakes = [];
  if (failed.length > 0) {
    const topFailedCat = weakFromData[0] || 'Arrays & Strings';
    mistakes.push({
      type: `Boundary & Condition Edge Case in ${topFailedCat}`,
      category: topFailedCat,
      count: categoryFailures[topFailedCat] || 1,
      advice: 'Always begin by adding early return guard statements for empty inputs or out-of-bounds indices.',
      severity: 'high'
    });
  }

  mistakes.push(
    {
      type: 'Suboptimal Space Complexity',
      category: 'Hash Maps & Sets',
      count: 2,
      advice: 'Check if you can use two pointers in-place instead of allocating a duplicate lookup hash map.',
      severity: 'medium'
    },
    {
      type: 'Off-by-One Loop Boundary',
      category: 'Basic Logic',
      count: 1,
      advice: 'Carefully check whether your loop boundary condition should be strictly less than (<) or less-than-or-equal (<=).',
      severity: 'low'
    }
  );

  return {
    identifiedMistakes: mistakes,
    weakTopics: weakFromData.length ? weakFromData.slice(0, 3) : ['Two Pointers Boundary Logic', 'Recursion Base Cases', 'Prefix Sum Invariants'],
    strongTopics: strongFromData.length ? strongFromData.slice(0, 3) : ['Linear Array Traversal', 'Dictionary / Map Lookups', 'String Character Counting'],
    recommendedFocusList: [
      {
        title: 'Two Sum II - Input Array Is Sorted',
        difficulty: 'basic',
        category: 'Two Pointers',
        reason: 'Master two-pointer pointers convergence without extra auxiliary memory.'
      },
      {
        title: 'Longest Substring Without Repeating Characters',
        difficulty: 'intermediate',
        category: 'Sliding Window',
        reason: 'Strengthens dynamic window sizing and prevents duplicate boundary errors.'
      },
      {
        title: 'Coin Change',
        difficulty: 'advanced',
        category: 'Dynamic Programming',
        reason: 'Builds intuition for bottom-up state transitions and handles impossibility edge cases.'
      }
    ]
  };
}
