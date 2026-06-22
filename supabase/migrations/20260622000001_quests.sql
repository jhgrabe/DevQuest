create table quests (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  description      text,
  topic            text,
  difficulty       text,
  language_id      int not null,
  estimated_minutes int,
  starter_code     text,
  test_cases       jsonb,
  xp_reward        int default 100,
  created_at       timestamptz default now()
);

alter table quests enable row level security;

create policy "quests readable by authenticated users"
  on quests for select
  using (auth.role() = 'authenticated');

-- Seed quests
-- Note: test_cases are never sent to the client; the execute function reads them server-side.

insert into quests (title, description, topic, difficulty, language_id, estimated_minutes, starter_code, test_cases, xp_reward)
values
  (
    'Array Reversal',
    'Write a function that takes a list of integers and returns the list in reverse order. Do not use built-in reverse methods.',
    'arrays',
    'novice',
    71,
    30,
    'def reverse_list(nums):
    # Your code here
    pass

import sys
input_data = sys.stdin.read().strip()
nums = list(map(int, input_data.split()))
print(*reverse_list(nums))',
    '[
      {"stdin": "1 2 3 4 5", "expected_stdout": "5 4 3 2 1"},
      {"stdin": "10 20 30", "expected_stdout": "30 20 10"},
      {"stdin": "42", "expected_stdout": "42"}
    ]'::jsonb,
    100
  ),
  (
    'FizzBuzz',
    'Print numbers from 1 to N. For multiples of 3 print "Fizz", multiples of 5 print "Buzz", multiples of both print "FizzBuzz".',
    'functions',
    'novice',
    71,
    20,
    'import sys
n = int(sys.stdin.read().strip())
for i in range(1, n + 1):
    if i % 15 == 0:
        print("FizzBuzz")
    elif i % 3 == 0:
        print("Fizz")
    elif i % 5 == 0:
        print("Buzz")
    else:
        print(i)',
    '[
      {"stdin": "15", "expected_stdout": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz"},
      {"stdin": "5", "expected_stdout": "1\n2\nFizz\n4\nBuzz"},
      {"stdin": "1", "expected_stdout": "1"}
    ]'::jsonb,
    100
  ),
  (
    'Sum of Array',
    'Given an array of integers passed via stdin (space-separated), return their sum.',
    'arrays',
    'novice',
    63,
    20,
    'const lines = require(''fs'').readFileSync(''/dev/stdin'', ''utf8'').trim();
const nums = lines.split('' '').map(Number);
// Your code here — compute and log the sum
console.log(0);',
    '[
      {"stdin": "1 2 3 4 5", "expected_stdout": "15"},
      {"stdin": "10 20 30", "expected_stdout": "60"},
      {"stdin": "7", "expected_stdout": "7"}
    ]'::jsonb,
    100
  );
