alter table quests add column preamble text;

-- Array Reversal: preamble reads the list from stdin; starter_code is just the logic
update quests set
  preamble = 'import sys
input_data = sys.stdin.read().strip()
nums = list(map(int, input_data.split()))
',
  starter_code = 'def reverse_list(nums):
    # Your code here
    pass

print(*reverse_list(nums))'
where title = 'Array Reversal';

-- FizzBuzz: preamble reads n; starter_code is the loop logic
update quests set
  preamble = 'import sys
n = int(sys.stdin.read().strip())
',
  starter_code = '# Your code here
# Print numbers 1..n
# Replace multiples of 3 with "Fizz"
# Replace multiples of 5 with "Buzz"
# Replace multiples of both with "FizzBuzz"'
where title = 'FizzBuzz';

-- Sum of Array: preamble reads and parses the nums array; starter_code is the logic
update quests set
  preamble = 'const lines = require(''fs'').readFileSync(''/dev/stdin'', ''utf8'').trim();
const nums = lines.split('' '').map(Number);
',
  starter_code = '// Your code here — compute and log the sum
console.log(0);'
where title = 'Sum of Array';
