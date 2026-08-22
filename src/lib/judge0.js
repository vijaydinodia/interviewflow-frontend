/**
 * Judge0 CE — Free public instance utility
 * Endpoint: https://ce.judge0.com (no API key required)
 */

// Language IDs valid on ce.judge0.com
export const JUDGE0_LANGUAGES = {
  javascript: {
    id: 63, // Node.js 12.14.0
    name: "JavaScript (Node.js)",
    monacoLanguage: "javascript",
    fileExtension: "js",
    defaultCode: `// JavaScript (Node.js) Playground
function solve() {
  console.log("Hello from InterviewFlow Code Runner!");

  // Example: Sum array
  const arr = [10, 20, 30, 40, 50];
  const sum = arr.reduce((acc, num) => acc + num, 0);
  console.log("Array Sum:", sum);
}

solve();
`,
  },
  typescript: {
    id: 74, // TypeScript 3.7.4
    name: "TypeScript",
    monacoLanguage: "typescript",
    fileExtension: "ts",
    defaultCode: `// TypeScript Playground
interface Candidate {
  name: string;
  role: string;
  skills: string[];
}

function evaluateCandidate(candidate: Candidate): string {
  return \`Candidate \${candidate.name} is applying for \${candidate.role} with: \${candidate.skills.join(", ")}\`;
}

const cand: Candidate = {
  name: "Alex",
  role: "Full Stack Engineer",
  skills: ["React", "Node.js", "TypeScript"],
};

console.log(evaluateCandidate(cand));
`,
  },
  python: {
    id: 71, // Python 3.8.1
    name: "Python 3",
    monacoLanguage: "python",
    fileExtension: "py",
    defaultCode: `# Python 3 Playground
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

if __name__ == "__main__":
    nums = [2, 7, 11, 15]
    target = 9
    print(f"Two Sum result: {two_sum(nums, target)}")
`,
  },
  java: {
    id: 62, // Java OpenJDK 13.0.1
    name: "Java",
    monacoLanguage: "java",
    fileExtension: "java",
    defaultCode: `// Java Main Class
import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("Java Code Execution Active!");

        List<String> list = Arrays.asList("System Design", "DSA", "Live Coding");
        for (String topic : list) {
            System.out.println("-> Topic: " + topic);
        }
    }
}
`,
  },
  cpp: {
    id: 54, // C++ GCC 9.2.0
    name: "C++ (GCC)",
    monacoLanguage: "cpp",
    fileExtension: "cpp",
    defaultCode: `// C++ Playground
#include <iostream>
#include <vector>
#include <numeric>

using namespace std;

int main() {
    cout << "C++ High-Performance Execution Ready!" << endl;
    vector<int> nums = {1, 2, 3, 4, 5};
    int total = accumulate(nums.begin(), nums.end(), 0);
    cout << "Vector Total: " << total << endl;
    return 0;
}
`,
  },
  c: {
    id: 50, // C GCC 9.2.0
    name: "C (GCC)",
    monacoLanguage: "c",
    fileExtension: "c",
    defaultCode: `// C Playground
#include <stdio.h>

int main() {
    printf("C Code Runner Online!\\n");
    int a = 15;
    int b = 27;
    printf("Sum: %d + %d = %d\\n", a, b, a + b);
    return 0;
}
`,
  },
  go: {
    id: 60, // Go 1.13.5
    name: "Go (Golang)",
    monacoLanguage: "go",
    fileExtension: "go",
    defaultCode: `// Go Playground
package main

import "fmt"

func main() {
\tfmt.Println("Go Execution Engine Online!")
\tskills := []string{"Concurrency", "Goroutines", "Microservices"}
\tfor i, skill := range skills {
\t\tfmt.Printf("%d. %s\\n", i+1, skill)
\t}
}
`,
  },
  rust: {
    id: 73, // Rust 1.40.0
    name: "Rust",
    monacoLanguage: "rust",
    fileExtension: "rs",
    defaultCode: `// Rust Playground
fn main() {
    println!("Hello from Rust execution engine!");
    let numbers = vec![1, 2, 3, 4, 5];
    let sum: i32 = numbers.iter().sum();
    println!("Sum of numbers: {}", sum);
}
`,
  },
};

// ── Base64 helpers ────────────────────────────────────────────────────────────
const encodeBase64 = (str) => {
  if (!str) return "";
  return Buffer.from(str, "utf8").toString("base64");
};

const decodeBase64 = (str) => {
  if (!str) return "";
  try {
    return Buffer.from(str, "base64").toString("utf8");
  } catch {
    return str;
  }
};

/**
 * Executes source code via free Judge0 CE public instance.
 * No API key required.
 */
export async function executeCode({ sourceCode, language, stdin = "" }) {
  const langKey    = (language || "javascript").toLowerCase();
  const langConfig = JUDGE0_LANGUAGES[langKey] || JUDGE0_LANGUAGES.javascript;

  // Free public Judge0 CE — no API key, no RapidAPI headers
  const judge0Url = (process.env.JUDGE0_API_URL || "https://ce.judge0.com").replace(/\/$/, "");

  const headers = {
    "Content-Type": "application/json",
    "Accept":       "application/json",
  };

  // Only add auth if an API key is explicitly set (for paid/self-hosted setups)
  const apiKey = process.env.JUDGE0_API_KEY;
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const payload = {
    source_code:    encodeBase64(sourceCode),
    language_id:    langConfig.id,
    stdin:          stdin ? encodeBase64(stdin) : "",
    cpu_time_limit: 5,
    memory_limit:   128000,
  };

  const submitUrl = `${judge0Url}/submissions?base64_encoded=true&wait=true`;

  const response = await fetch(submitUrl, {
    method:  "POST",
    headers,
    body:    JSON.stringify(payload),
    signal:  AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Execution engine error (${response.status}): ${errorText || response.statusText}`);
  }

  const data = await response.json();

  // Poll if still in queue
  let finalResult = data;
  if (data.token && data.status && data.status.id <= 2) {
    finalResult = await pollSubmission(data.token, headers, judge0Url);
  }

  const stdout        = decodeBase64(finalResult.stdout);
  const stderr        = decodeBase64(finalResult.stderr);
  const compileOutput = decodeBase64(finalResult.compile_output);
  const message       = decodeBase64(finalResult.message);

  return {
    success:        true,
    token:          finalResult.token,
    status:         finalResult.status || { id: 3, description: "Accepted" },
    stdout:         stdout         || "",
    stderr:         stderr         || "",
    compile_output: compileOutput  || "",
    message:        message        || "",
    time:   finalResult.time   ? `${parseFloat(finalResult.time).toFixed(3)}s` : "0.000s",
    memory: finalResult.memory ? `${finalResult.memory} KB`                    : "0 KB",
  };
}

/** Poll submission token until status id > 2 (out of queue) */
async function pollSubmission(token, headers, baseUrl, maxAttempts = 8) {
  const checkUrl = `${baseUrl}/submissions/${token}?base64_encoded=true`;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const res = await fetch(checkUrl, { headers });
    if (res.ok) {
      const result = await res.json();
      if (result.status && result.status.id > 2) return result;
    }
  }

  throw new Error("Execution timed out waiting for Judge0 response.");
}
