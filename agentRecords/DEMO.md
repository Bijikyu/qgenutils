DEMO: Functional Frontend for Testing Opencode Flows

Overview
- A lightweight in-browser demo (demo.html) showcasing key flows: authentication, feature flags, API usage, input validation, URL helpers, and password hashing via Web Crypto.
- A tiny Node server (demo-server.js) to host the static demo.html for easy local testing with npm.

What it demonstrates
1) Authentication flow
   - Select a user and login; a token is stored in localStorage and displayed in the UI.
2) Feature flags
   - Toggle a couple features and persist config in localStorage.
3) API client flow
   - Fetch a sample resource from jsonplaceholder and display result.
4) Validation utilities
   - Sanitize user input by stripping angle brackets.
5) URL utilities
   - Ensure a URL has a protocol (adds https:// if missing).
6) Security utilities
   - Hash a password with SHA-256 using Web Crypto API.

How to run
- Prerequisite: Node.js (npm).
- Start the demo server:
  1. Ensure you are in the repository root.
  2. Run: npm run start-demo   (if not, run: node demo-server.js)
- Open in browser: http://localhost:3000/demo.html

Notes
- This demo is intended for testing the frontend UX and basic flows locally. It does not rely on Bun, and uses browser-native APIs where available.
- For full end-to-end testing, you may wire the frontend to real API endpoints in your environment.
