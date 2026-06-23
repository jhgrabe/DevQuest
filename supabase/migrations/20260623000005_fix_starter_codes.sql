-- FizzBuzz starter code was a complete working solution; replace with a proper stub
update quests
set starter_code = 'import sys

n = int(sys.stdin.read().strip())

# Your code here
# Print numbers 1..n
# Replace multiples of 3 with "Fizz"
# Replace multiples of 5 with "Buzz"
# Replace multiples of both with "FizzBuzz"
'
where title = 'FizzBuzz';
