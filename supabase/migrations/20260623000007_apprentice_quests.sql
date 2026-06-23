insert into quests (title, description, topic, difficulty, language_id, estimated_minutes, preamble, starter_code, test_cases, xp_reward)
values
  (
    'Two Sum',
    'Given a list of integers and a target value, return the indices of the two numbers that add up to the target. You may assume exactly one solution exists and you may not use the same element twice.',
    'arrays',
    'apprentice',
    71,
    30,
    $preamble$import sys
data = sys.stdin.read().split()
target = int(data[0])
nums = list(map(int, data[1:]))
$preamble$,
    $code$def two_sum(nums, target):
    # Your code here
    # Return a list containing the two indices
    pass

result = two_sum(nums, target)
print(*result)$code$,
    '[
      {"stdin": "9 2 7 11 15",  "expected_stdout": "0 1"},
      {"stdin": "6 3 2 4",      "expected_stdout": "1 2"},
      {"stdin": "6 3 3",        "expected_stdout": "0 1"}
    ]'::jsonb,
    150
  ),
  (
    'Palindrome Check',
    'Given a string, return "true" if it reads the same forwards and backwards, or "false" if not. Ignore spaces and treat uppercase and lowercase letters as equal.',
    'strings',
    'apprentice',
    71,
    25,
    $preamble$import sys
s = sys.stdin.read().strip()
$preamble$,
    $code$def is_palindrome(s):
    # Your code here
    # Return True or False
    pass

result = is_palindrome(s)
print(str(result).lower())$code$,
    '[
      {"stdin": "racecar",                       "expected_stdout": "true"},
      {"stdin": "hello",                         "expected_stdout": "false"},
      {"stdin": "A man a plan a canal Panama",   "expected_stdout": "true"}
    ]'::jsonb,
    150
  ),
  (
    'Reverse Words',
    'Given a sentence, return the sentence with all the words in reverse order. Words are separated by a single space and the input contains no leading or trailing whitespace.',
    'strings',
    'apprentice',
    63,
    25,
    $preamble$const sentence = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
$preamble$,
    $code$function reverseWords(sentence) {
    // Your code here
    return '';
}

console.log(reverseWords(sentence));$code$,
    '[
      {"stdin": "hello world",          "expected_stdout": "world hello"},
      {"stdin": "the quick brown fox",  "expected_stdout": "fox brown quick the"},
      {"stdin": "one",                  "expected_stdout": "one"}
    ]'::jsonb,
    150
  );
