# Date/Time Utility Module

A simple utility module for date and time formatting in JavaScript projects.

## Installation

```bash
npm install
```

## Usage

```javascript
const { formatDateTime, formatDuration } = require('./index.js');

// Date/time formatting
const isoDate = '2023-12-25T10:30:00.000Z';
console.log(formatDateTime(isoDate)); // "12/25/2023, 10:30:00 AM" (locale-dependent)

// Duration formatting
const startDate = '2023-12-25T10:00:00.000Z';
const endDate = '2023-12-25T11:30:45.000Z';
console.log(formatDuration(startDate, endDate)); // "01:30:45"

// Duration from a start time to now
console.log(formatDuration(startDate)); // Duration from startDate to current time
```

## API

### formatDateTime(dateString)

Converts an ISO date string to a locale-specific display format.

- `dateString` (string): The ISO date string to format
- Returns: string - The formatted date string or "N/A" if input is empty
- Throws: Error if the date string is invalid

### formatDuration(startDate, endDate?)

Shows elapsed time between two dates in hh:mm:ss format.

- `startDate` (string): The start date ISO string
- `endDate` (string, optional): The end date ISO string (defaults to current time)
- Returns: string - The formatted duration string or "00:00:00" if start date is empty
- Throws: Error if either date string is invalid

## Testing

Run the test suite to see the functions in action:

```bash
npm test
```

Or run the test file directly:

```bash
node test.js
```

## License

ISC