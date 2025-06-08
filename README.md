
# My Utility Module

A simple utility module with common helper functions for JavaScript projects.

## Installation

```bash
npm install my-utility-module
```

## Usage

```javascript
const { greet, capitalize, randomBetween } = require('my-utility-module');

// Greeting function
console.log(greet('John')); // "Hello, John!"
console.log(greet('Jane', 'Hi')); // "Hi, Jane!"

// Capitalize function
console.log(capitalize('hello world')); // "Hello World"

// Random number generator
console.log(randomBetween(1, 10)); // Random number between 1 and 10
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

## License

ISC
