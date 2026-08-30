import axios from "axios";

/**
 * Judge0 CE — Free public instance utility
 * Endpoint: https://ce.judge0.com (no API key required)
 */

// Language IDs valid on ce.judge0.com (Supports 25+ programming languages)
export const JUDGE0_LANGUAGES = {
  javascript: {
    id: 63,
    name: "JavaScript (Node.js)",
    monacoLanguage: "javascript",
    fileExtension: "js",
    defaultCode: `// JavaScript (Node.js) Playground
function solve() {
  console.log("Hello from InterviewFlow Code Runner!");

  const arr = [10, 20, 30, 40, 50];
  const sum = arr.reduce((acc, num) => acc + num, 0);
  console.log("Array Sum:", sum);
}

solve();
`,
  },
  typescript: {
    id: 74,
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
    id: 71,
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
    id: 62,
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
    id: 54,
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
    id: 50,
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
  csharp: {
    id: 51,
    name: "C# (.NET Core)",
    monacoLanguage: "csharp",
    fileExtension: "cs",
    defaultCode: `// C# Playground
using System;

public class Program {
    public static void Main() {
        Console.WriteLine("Hello from C# .NET Engine!");
    }
}
`,
  },
  go: {
    id: 60,
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
    id: 73,
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
  php: {
    id: 68,
    name: "PHP",
    monacoLanguage: "php",
    fileExtension: "php",
    defaultCode: `<?php
// PHP Playground
echo "PHP Backend Execution Engine Active!\\n";
$frameworks = ["Laravel", "Symfony", "WordPress"];
echo "Popular Frameworks: " . implode(", ", $frameworks) . "\\n";
`,
  },
  ruby: {
    id: 72,
    name: "Ruby",
    monacoLanguage: "ruby",
    fileExtension: "rb",
    defaultCode: `# Ruby Playground
puts "Hello from Ruby on Rails Engine!"
languages = ["Ruby", "Python", "JavaScript"]
languages.each_with_index do |lang, idx|
  puts "#{idx + 1}. #{lang}"
end
`,
  },
  swift: {
    id: 83,
    name: "Swift",
    monacoLanguage: "swift",
    fileExtension: "swift",
    defaultCode: `// Swift (iOS) Playground
import Foundation

print("Swift 5.10 Execution Ready!")
let frameworks = ["SwiftUI", "UIKit", "Combine"]
for fw in frameworks {
    print("-> Framework: \\(fw)")
}
`,
  },
  kotlin: {
    id: 78,
    name: "Kotlin",
    monacoLanguage: "kotlin",
    fileExtension: "kt",
    defaultCode: `// Kotlin Playground
fun main() {
    println("Kotlin Android / JVM Engine Online!")
    val items = listOf("Coroutines", "Flow", "Jetpack Compose")
    items.forEach { println("-> $it") }
}
`,
  },
  dart: {
    id: 74,
    name: "Dart (Flutter)",
    monacoLanguage: "dart",
    fileExtension: "dart",
    defaultCode: `// Dart / Flutter Playground
void main() {
  print("Dart Multi-Platform Engine Online!");
}
`,
  },
  sql: {
    id: 82,
    name: "SQL",
    monacoLanguage: "sql",
    fileExtension: "sql",
    defaultCode: `-- SQL Query Playground
SELECT 
    user_id, 
    email, 
    role, 
    createdAt 
FROM users 
WHERE isActive = 1 
ORDER BY createdAt DESC;
`,
  },
  scala: {
    id: 81,
    name: "Scala",
    monacoLanguage: "scala",
    fileExtension: "scala",
    defaultCode: `// Scala Playground
object Main extends App {
  println("Scala 3 Functional Engine Online!")
}
`,
  },
  r: {
    id: 80,
    name: "R Language",
    monacoLanguage: "r",
    fileExtension: "r",
    defaultCode: `# R Language Playground
cat("R Data Science Engine Active!\\n")
numbers <- c(12, 34, 56, 78, 90)
cat("Mean:", mean(numbers), "\\n")
`,
  },
  elixir: {
    id: 57,
    name: "Elixir",
    monacoLanguage: "elixir",
    fileExtension: "ex",
    defaultCode: `# Elixir / Erlang VM Playground
IO.puts "Elixir Concurrent Engine Online!"
`,
  },
  haskell: {
    id: 61,
    name: "Haskell",
    monacoLanguage: "haskell",
    fileExtension: "hs",
    defaultCode: `-- Haskell Pure Functional Playground
main :: IO ()
main = putStrLn "Hello from Haskell!"
`,
  },
  bash: {
    id: 46,
    name: "Bash / Shell",
    monacoLanguage: "shell",
    fileExtension: "sh",
    defaultCode: `#!/bin/bash
# Bash Shell Scripting Playground
echo "Shell Script Execution Active!"
uname -a
`,
  },
  perl: {
    id: 70,
    name: "Perl",
    monacoLanguage: "perl",
    fileExtension: "pl",
    defaultCode: `#!/usr/bin/env perl
# Perl Playground
print "Perl Engine Active!\\n";
`,
  },
  lua: {
    id: 64,
    name: "Lua",
    monacoLanguage: "lua",
    fileExtension: "lua",
    defaultCode: `-- Lua Scripting Playground
print("Lua Scripting Engine Online!")
`,
  },
  asm: {
    id: 45,
    name: "Assembly (x86_64)",
    monacoLanguage: "assembly",
    fileExtension: "asm",
    defaultCode: `; Assembly x86_64 Playground
global _start

section .text
_start:
    mov rax, 1          ; write syscall
    mov rdi, 1          ; stdout
    mov rsi, msg
    mov rdx, 14
    syscall
    mov rax, 60         ; exit syscall
    xor rdi, rdi
    syscall

section .data
msg db "Assembly Active", 10
`,
  },
  clojure: {
    id: 86,
    name: "Clojure",
    monacoLanguage: "clojure",
    fileExtension: "clj",
    defaultCode: `; Clojure Lisp Playground
(println "Clojure Lisp Engine Online!")
`,
  },
  erlang: {
    id: 58,
    name: "Erlang",
    monacoLanguage: "erlang",
    fileExtension: "erl",
    defaultCode: `% Erlang Playground
-module(main).
-export([start/0]).

start() ->
    io:format("Erlang Actor Engine Active!~n").
`,
  },
  julia: {
    id: 87,
    name: "Julia",
    monacoLanguage: "julia",
    fileExtension: "jl",
    defaultCode: `# Julia High-Performance Scientific Computing
println("Julia Scientific Engine Online!")
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
    language_id:          langConfig.id,
    source_code:          encodeBase64(sourceCode),
    stdin:                encodeBase64(stdin),
    cpu_time_limit:       5,
    memory_limit:         128000,
    redirect_stderr_to_stdout: false,
  };

  try {
    const response = await axios.post(`${judge0Url}/submissions?base64_encoded=true&wait=true`, payload, { headers });
    const data = response.data;

    const stdout        = decodeBase64(data.stdout);
    const stderr        = decodeBase64(data.stderr);
    const compileOutput = decodeBase64(data.compile_output);
    const statusDesc    = data.status?.description || "Completed";
    const statusId      = data.status?.id || 3;

    return {
      success: statusId === 3,
      stdout:  stdout || "",
      stderr:  stderr || "",
      compileOutput: compileOutput || "",
      statusDescription: statusDesc,
      statusId: statusId,
      time: data.time ? `${data.time}s` : null,
      memory: data.memory ? `${data.memory} KB` : null,
      languageUsed: langConfig.name,
    };
  } catch (err) {
    console.error("Judge0 execution failed:", err.message);
    return {
      success: false,
      stdout: "",
      stderr: err.message || "Execution error",
      compileOutput: "",
      statusDescription: "Execution Error",
      statusId: 11,
      time: null,
      memory: null,
      languageUsed: langConfig.name,
    };
  }
}
