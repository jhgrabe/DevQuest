-- More quests: additional Novice, Apprentice, Adept, and Master tiers
-- language_id 71 = Python 3, 63 = JavaScript (Node.js)
-- preamble: boilerplate that reads stdin and sets up variables
-- starter_code: only the logic the player fills in

-- ─── NOVICE ────────────────────────────────────────────────────────────────

insert into quests (title, description, topic, difficulty, language_id, estimated_minutes, preamble, starter_code, test_cases, xp_reward)
values
  (
    'Count Vowels',
    'Given a string, count and print the number of vowel characters (a, e, i, o, u — case-insensitive).',
    'strings',
    'novice',
    71,
    15,
    $preamble$import sys
s = sys.stdin.read().strip()
$preamble$,
    $code$def count_vowels(s):
    # Your code here
    pass

print(count_vowels(s))$code$,
    '[
      {"stdin": "hello",         "expected_stdout": "2"},
      {"stdin": "aeiou",         "expected_stdout": "5"},
      {"stdin": "rhythm",        "expected_stdout": "0"},
      {"stdin": "OpenAI",        "expected_stdout": "4"}
    ]'::jsonb,
    100
  ),
  (
    'Maximum Value',
    'Given a list of integers (space-separated on stdin), print the largest value.',
    'arrays',
    'novice',
    71,
    15,
    $preamble$import sys
nums = list(map(int, sys.stdin.read().strip().split()))
$preamble$,
    $code$def find_max(nums):
    # Your code here — do not use the built-in max()
    pass

print(find_max(nums))$code$,
    '[
      {"stdin": "3 1 4 1 5 9 2 6", "expected_stdout": "9"},
      {"stdin": "-5 -1 -3",        "expected_stdout": "-1"},
      {"stdin": "42",              "expected_stdout": "42"}
    ]'::jsonb,
    100
  ),
  (
    'Repeat String',
    'Given a string and an integer N (both on stdin, separated by a newline), print the string repeated N times with no spaces or separators.',
    'strings',
    'novice',
    63,
    15,
    $preamble$const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const s = lines[0];
const n = parseInt(lines[1], 10);
$preamble$,
    $code$function repeatString(s, n) {
    // Your code here — do not use String.prototype.repeat()
    return '';
}

console.log(repeatString(s, n));$code$,
    '[
      {"stdin": "ab\n3",  "expected_stdout": "ababab"},
      {"stdin": "hi\n1",  "expected_stdout": "hi"},
      {"stdin": "x\n4",   "expected_stdout": "xxxx"}
    ]'::jsonb,
    100
  ),
  (
    'Celsius to Fahrenheit',
    'Given a temperature in Celsius (one number per line), convert each to Fahrenheit and print the results, one per line. Formula: F = C × 9/5 + 32. Print each result as an integer (no decimal point).',
    'functions',
    'novice',
    71,
    20,
    $preamble$import sys
lines = sys.stdin.read().strip().split('\n')
celsius_values = [float(x) for x in lines]
$preamble$,
    $code$def to_fahrenheit(c):
    # Your code here
    pass

for c in celsius_values:
    print(to_fahrenheit(c))$code$,
    '[
      {"stdin": "0\n100\n-40", "expected_stdout": "32\n212\n-40"},
      {"stdin": "37",          "expected_stdout": "98"},
      {"stdin": "20",          "expected_stdout": "68"}
    ]'::jsonb,
    100
  );

-- ─── APPRENTICE ────────────────────────────────────────────────────────────

insert into quests (title, description, topic, difficulty, language_id, estimated_minutes, preamble, starter_code, test_cases, xp_reward)
values
  (
    'Count Character Frequency',
    'Given a string, print each unique character and its count in the order the character first appears, one per line in the format "char:count".',
    'strings',
    'apprentice',
    71,
    25,
    $preamble$import sys
s = sys.stdin.read().strip()
$preamble$,
    $code$def char_frequency(s):
    # Return a list of (char, count) tuples in first-appearance order
    pass

for char, count in char_frequency(s):
    print(f"{char}:{count}")$code$,
    '[
      {"stdin": "aabb",   "expected_stdout": "a:2\nb:2"},
      {"stdin": "hello",  "expected_stdout": "h:1\ne:1\nl:2\no:1"},
      {"stdin": "aaa",    "expected_stdout": "a:3"}
    ]'::jsonb,
    150
  ),
  (
    'Remove Duplicates',
    'Given a list of integers (space-separated), return the list with duplicates removed while preserving the original order of first appearances.',
    'arrays',
    'apprentice',
    71,
    25,
    $preamble$import sys
nums = list(map(int, sys.stdin.read().strip().split()))
$preamble$,
    $code$def remove_duplicates(nums):
    # Your code here — preserve order of first appearance
    pass

print(*remove_duplicates(nums))$code$,
    '[
      {"stdin": "1 2 3 2 1",    "expected_stdout": "1 2 3"},
      {"stdin": "4 4 4 4",      "expected_stdout": "4"},
      {"stdin": "5 1 5 2 1 3",  "expected_stdout": "5 1 2 3"}
    ]'::jsonb,
    150
  ),
  (
    'Flatten Array',
    'Given a nested array (one level deep) represented as a JSON string on stdin, print the flattened elements space-separated.',
    'arrays',
    'apprentice',
    63,
    30,
    $preamble$const data = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const nested = JSON.parse(data);
$preamble$,
    $code$function flatten(arr) {
    // Your code here — do not use Array.prototype.flat()
    return [];
}

console.log(flatten(nested).join(' '));$code$,
    '[
      {"stdin": "[[1,2],[3,4],[5]]",   "expected_stdout": "1 2 3 4 5"},
      {"stdin": "[[10],[20,30]]",      "expected_stdout": "10 20 30"},
      {"stdin": "[[1,2,3]]",           "expected_stdout": "1 2 3"}
    ]'::jsonb,
    150
  );

-- ─── ADEPT ─────────────────────────────────────────────────────────────────

insert into quests (title, description, topic, difficulty, language_id, estimated_minutes, preamble, starter_code, test_cases, xp_reward)
values
  (
    'Fibonacci Sequence',
    'Given an integer N, print the first N numbers of the Fibonacci sequence space-separated. The sequence starts: 0 1 1 2 3 5 …',
    'functions',
    'adept',
    71,
    25,
    $preamble$import sys
n = int(sys.stdin.read().strip())
$preamble$,
    $code$def fibonacci(n):
    # Return a list of the first n Fibonacci numbers
    pass

print(*fibonacci(n))$code$,
    '[
      {"stdin": "8",  "expected_stdout": "0 1 1 2 3 5 8 13"},
      {"stdin": "1",  "expected_stdout": "0"},
      {"stdin": "2",  "expected_stdout": "0 1"}
    ]'::jsonb,
    200
  ),
  (
    'Binary Search',
    'Given a sorted list of integers and a target, print the index of the target in the list, or -1 if not found. The first line of stdin is the target; the second line is the space-separated sorted list.',
    'arrays',
    'adept',
    71,
    30,
    $preamble$import sys
lines = sys.stdin.read().strip().split('\n')
target = int(lines[0])
nums = list(map(int, lines[1].split()))
$preamble$,
    $code$def binary_search(nums, target):
    # Implement binary search — do not use the bisect module or list.index()
    pass

print(binary_search(nums, target))$code$,
    '[
      {"stdin": "7\n1 3 5 7 9 11",   "expected_stdout": "3"},
      {"stdin": "1\n1 3 5 7 9 11",   "expected_stdout": "0"},
      {"stdin": "4\n1 3 5 7 9 11",   "expected_stdout": "-1"}
    ]'::jsonb,
    200
  ),
  (
    'Is Anagram',
    'Given two strings (one per line), print "true" if they are anagrams of each other (same letters, different order, case-insensitive) or "false" if not.',
    'strings',
    'adept',
    71,
    25,
    $preamble$import sys
lines = sys.stdin.read().strip().split('\n')
a, b = lines[0], lines[1]
$preamble$,
    $code$def is_anagram(a, b):
    # Your code here — case-insensitive, ignore spaces
    pass

print(str(is_anagram(a, b)).lower())$code$,
    '[
      {"stdin": "listen\nsilent",       "expected_stdout": "true"},
      {"stdin": "hello\nworld",         "expected_stdout": "false"},
      {"stdin": "Astronomer\nMoon starer", "expected_stdout": "true"}
    ]'::jsonb,
    200
  ),
  (
    'Group By Length',
    'Given a list of words (space-separated), group them by character length and print each group on its own line: "length:word1,word2" sorted by length ascending. Words within a group appear in the original order.',
    'arrays',
    'adept',
    63,
    35,
    $preamble$const words = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split(' ');
$preamble$,
    $code$function groupByLength(words) {
    // Return a Map or object: length -> [words...]
}

const groups = groupByLength(words);
const keys = Array.from(groups.keys()).sort((a, b) => a - b);
for (const k of keys) {
    console.log(`${k}:${groups.get(k).join(',')}`);
}$code$,
    '[
      {"stdin": "cat dog elephant at",  "expected_stdout": "2:at\n3:cat,dog\n8:elephant"},
      {"stdin": "a bb ccc",             "expected_stdout": "1:a\n2:bb\n3:ccc"},
      {"stdin": "hi hi bye",            "expected_stdout": "2:hi,hi\n3:bye"}
    ]'::jsonb,
    200
  );

-- ─── MASTER ────────────────────────────────────────────────────────────────

insert into quests (title, description, topic, difficulty, language_id, estimated_minutes, preamble, starter_code, test_cases, xp_reward)
values
  (
    'Balanced Parentheses',
    'Given a string containing only the characters (, ), [, ], {, and }, print "true" if the brackets are balanced (every open bracket has a matching close bracket in the correct order) or "false" otherwise.',
    'functions',
    'master',
    71,
    35,
    $preamble$import sys
s = sys.stdin.read().strip()
$preamble$,
    $code$def is_balanced(s):
    # Your code here — use a stack
    pass

print(str(is_balanced(s)).lower())$code$,
    '[
      {"stdin": "()[]{}",    "expected_stdout": "true"},
      {"stdin": "([)]",      "expected_stdout": "false"},
      {"stdin": "{[()]}",    "expected_stdout": "true"},
      {"stdin": "(((",        "expected_stdout": "false"}
    ]'::jsonb,
    300
  ),
  (
    'Merge Intervals',
    'Given a list of intervals as "start,end" pairs (one per line), merge all overlapping intervals and print the result, one merged interval per line in "start,end" format, sorted by start value.',
    'arrays',
    'master',
    71,
    40,
    $preamble$import sys
lines = sys.stdin.read().strip().split('\n')
intervals = [tuple(map(int, line.split(','))) for line in lines]
$preamble$,
    $code$def merge_intervals(intervals):
    # Sort and merge overlapping intervals
    # Return a list of (start, end) tuples
    pass

for start, end in merge_intervals(intervals):
    print(f"{start},{end}")$code$,
    '[
      {"stdin": "1,3\n2,6\n8,10\n15,18",  "expected_stdout": "1,6\n8,10\n15,18"},
      {"stdin": "1,4\n4,5",               "expected_stdout": "1,5"},
      {"stdin": "1,2\n3,4\n5,6",          "expected_stdout": "1,2\n3,4\n5,6"}
    ]'::jsonb,
    300
  ),
  (
    'Longest Consecutive Sequence',
    'Given a list of unsorted integers (space-separated), find the length of the longest sequence of consecutive integers (e.g. 1 2 3 4). Print that length.',
    'arrays',
    'master',
    71,
    40,
    $preamble$import sys
nums = list(map(int, sys.stdin.read().strip().split()))
$preamble$,
    $code$def longest_consecutive(nums):
    # Aim for better than O(n log n) — avoid simply sorting
    pass

print(longest_consecutive(nums))$code$,
    '[
      {"stdin": "100 4 200 1 3 2",    "expected_stdout": "4"},
      {"stdin": "0 3 7 2 5 8 4 6 0 1","expected_stdout": "9"},
      {"stdin": "1 2 3",              "expected_stdout": "3"}
    ]'::jsonb,
    300
  ),
  (
    'Word Frequency Top 3',
    'Given a block of text on stdin, print the top 3 most frequent words (case-insensitive, punctuation stripped) in descending order of frequency, one per line. If there is a tie in frequency, sort those words alphabetically.',
    'strings',
    'master',
    63,
    45,
    $preamble$const text = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
$preamble$,
    $code$function topThreeWords(text) {
    // Return an array of the top 3 words
    return [];
}

topThreeWords(text).forEach(w => console.log(w));$code$,
    '[
      {"stdin": "the cat sat on the mat the cat",  "expected_stdout": "the\ncat\nmat"},
      {"stdin": "a b a b c c",                     "expected_stdout": "a\nb\nc"},
      {"stdin": "hello Hello HELLO world",          "expected_stdout": "hello\nworld"}
    ]'::jsonb,
    300
  );
