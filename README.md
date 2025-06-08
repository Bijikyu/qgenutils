
# My Utility Module

A simple utility module with common helper functions for JavaScript projects.

## Installation

```bash
npm install my-utility-module
```

## Usage

```javascript
const { greet, capitalize, randomBetween, formatDateTime, formatDuration } = require('my-utility-module');

// Greeting function
console.log(greet('John')); // "Hello, John!"
console.log(greet('Jane', 'Hi')); // "Hi, Jane!"

// Capitalize function
console.log(capitalize('hello world')); // "Hello World"

// Random number generator
console.log(randomBetween(1, 10)); // Random number between 1 and 10

// Date/time formatting
const isoDate = '2023-12-25T10:30:00.000Z';
console.log(formatDateTime(isoDate)); // "12/25/2023, 10:30:00 AM" (locale-dependent)

// Duration formatting
const startDate = '2023-12-25T10:00:00.000Z';
const endDate = '2023-12-25T11:30:45.000Z';
console.log(formatDuration(startDate, endDate)); // "01:30:45"
```

## API

### greet(name, greeting?)

Greets a person with a custom message.

- `name` (string): The name of the person to greet
- `greeting` (string, optional): The greeting to use (defaults to "Hello")
- Returns: string - The greeting message

### capitalize(str)

Capitalizes the first letter of each word in a string.

- `str` (string): The string to capitalize
- Returns: string - The capitalized string

### randomBetween(min, max)

Generates a random number between min and max (inclusive).

- `min` (number): The minimum value
- `max` (number): The maximum value
- Returns: number - A random number between min and max

### formatDateTime(dateString)

Converts an ISO date string to a locale-specific display format.

- `dateString` (string): The ISO date string to format
- Returns: string - The formatted date string or "N/A" if input is empty

### formatDuration(startDate, endDate?)

Shows elapsed time between two dates in hh:mm:ss format.

- `startDate` (string): The start date ISO string
- `endDate` (string, optional): The end date ISO string (defaults to current time)
- Returns: string - The formatted duration string or "00:00:00" if start date is empty

## License

ISC
