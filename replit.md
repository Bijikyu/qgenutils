# Overview

QGenUtils (`@bijikyu/qgenutils`) is a utilities-focused Node.js library published as a GitHub Package. It provides DateTime formatting, HTTP configuration, URL processing, collections manipulation, batch processing, and performance utilities. This instance focuses purely on utility functions - security, system, and validation modules have been split into separate repositories.

## Publishing
- Package is scoped as `@bijikyu/qgenutils` on GitHub Packages
- Automated publishing via GitHub Actions on release creation (`.github/workflows/publish.yml`)
- `package.json` has `files` field to explicitly include only `dist/`, `README.md`, and `LICENSE`
- Build before publish: `npm run build` compiles TypeScript to `dist/`

# User Preferences

- **Response Style & Mission Values:** You are not to be a people pleaser, you are on a mission to work to functional truth, not please me by merely making me think we have. Truth and true functionality above all. No mock data or displays. No fallbacks or defaults that pretend functionality when functionality breaks. I prefer errors over lies. You prefer errors over lies. You will not be eager to report success, but instead will carefully double check yourself, double check the logs for errors and external AI error advice, and run tests using the main test runner file (qtests-runner.mjs for js projects, test_runner.py for python projects) before reporting success. If problems remain continue work to neutralise them. Only when there are no problems report success. You are my servant, you will not ask me to do things you can do yourself. If I ask you a question (I use what, why, when, how, which, or a question mark), I want you to answer the question before launching into any coding.
- **Development & Changes:**
    - Update documentation as needed, including the folder's `SUMMARY.md` where the file change/s occurred, the `README.md`, etc.
    - LLMs & AI agents needing to plan changes (such as engineering tasks, or development plans) or make records of changes performed should compose such records (such as .md files) in `/agentRecords`; do not write your records and reports at root.
    - Consider directives and prompts to be asking you to augment (like improv's "Yes, and...") and not to remove and replace.
    - Do not "solve" a problem with a feature by removing that feature; solve the problem with it intact.
    - Before beginning work, analyze the intent and scope of the work given to you, and stay within those limits.
    - Always start with a plan!
    - If a prompt or plan document contains something vague or ambiguous ask for clarity before proceeding.
    - Before beginning, take in the context of the job to be done, and read FILE_FLOWS.md to get apprised of the relevant files and data workflows. This will cut down token usage and wrong scope of work.
    - Before applying edits do a type check.
    - As for deletion, never delete without permission.
    - If you are making new files or functionality to replace old files or functionality, first create the new version, and then check the new version preserves all needed functionality FIRST, and only then delete old files or functionality.
    - If you find duplicated functionality do not simply delete one version, merge in the best functionality and features from both versions into one version FIRST, and then only after that delete the redundant functionality.
    - Always add comprehensive error handling as seen in existing functions.
    - Always comment all code with explanation & rationale.
    - Always make sure all changes follow security best practices.
    - Always examine all implementations for bugs and logic errors, revise as necessary.
    - Always implement tests for files or functionality created. Integration tests live in a tests folder at root. Other tests live with the file/s they test.
    - Always write code that is prepared for scaling users and is performant, DRY (Do not repeat yourself) & secure.
    - Never change code or comments between a protected block that starts with "┌── 🚫 PROTECTED: DO NOT EDIT (READ ONLY) BELOW THIS LINE" and ends at "└── END PROTECTED RANGE 🚫".
    - Never remove routing just because it isn't used (unless instructed to).
    - Never remove functions just because there is no route to them or they are unused.
    - Never rename route URIs or endpoints.
    - Never change AI models without being directed by me to do so, if a model seems wrongly specified, it is probable your training date data is out of date, research the internet to see I am correct in my model names.
    - After every change:
        - review your implementation for problems, bugs and logic errors.
        - monitor the logs for errors and external AI error advice.
        - run tests using the main test runner file (qtests-runner.mjs for js/ts projects, test_runner.py for python projects).
        - If problems remain continue work to neutralise them.
        - Only when there are no problems report success.
        - In your success message also report qerrors advice listened to, as I want verification you are using the tool.
    - **Scope Transparency**: When fixing issues beyond the explicit request (e.g., test failures, build errors), explain why this work is necessary for technical integrity.
- **Documentation:**
    - Document all function parameters & return values.
    - Comment all code with both explanation & rationale.
    - I prefer inline comments, rather than above the line.
    - Never comment JSON.
    - Use the correct commenting style for the language (html, js/ts, python, etc).
    - A `SUMMARY.md` per feature & folder, listing all files roles, req/res flows, known side effects, edge cases & caveats, & using machine-readable headings.
    - AI-Agent task anchors in comments like: `// 🚩AI: ENTRY_POINT_FOR_PAYMENT_CREATION` or `// 🚩AI: MUST_UPDATE_IF_SUBSCRIPTION_SCHEMA_CHANGES`. These let LLM agents quickly locate dependencies or update points when editing.
- **Testing:**
    - Integration tests live at root in their own folder `./tests`.
    - Unit tests & other such tests live with the files they test.
    - Tests need to match code, don't ever change code to match tests, change tests to match code.
    - Tests must not make actual API calls to external services, mock these.
- **Code Writing:**
    - I like functions declared via function declaration.
    - I like code with one line per functional operation to aid debugging.
    - When writing code or functions to interact with an API you will write as generic as possible to be able to accept different parameters which enable all functionality for use with a given endpoint.
    - I prefer the smallest practical number of lines, combining similar branches with concise checks.
    - Code should be as DRY as possible.
    - **Naming Conventions:** Function & variable names should describe their use and reveal their purpose; A function's name should preferably consist of an action & a noun, action first, to say what it does, not what it is a doer of, A variable's name should consist of two or more relevant words, the first describing context of use, & the others what it is.
    - Name folders clearly as to what they are for and organize them so that LLMs and developers can understand what they are for.

# System Architecture

- **Sources of Truth & Code Alignment:** External API documentation takes precedence, followed by backend code, then frontend code, and finally READMEs and native documentation. This hierarchy dictates that code and documentation should be adapted to align with higher-priority sources.
- **UI/UX Decisions (Frontend):**
    - Client-side and server-side validation for all form inputs.
    - WCAG 2.1 AA accessibility for all interactive elements.
    - Adherence to general UX/UI best practices.
    - AJAX for asynchronous data exchange to avoid page reloads.
- **Technical Implementations (Utilities):** Common functionality shared across multiple files should be encapsulated into reusable utilities to promote DRY principles and maintain a lean codebase.
- **Deployment:** The application is designed for deployment on platforms such as Replit, Render, and Netlify.

# External Dependencies

- **`node_modules/agentsqripts`**: A suite of CLI tools for code analysis:
    - Static bug analysis: `npx analyze-static-bugs .`
    - Security scanning: `npx analyze-security .`
    - Duplicate code detection: `npx analyze-wet-code .`
    - Performance analysis: `npx analyze-performance .`
    - SRP violation checks: `npx analyze-srp .`
    - Scalability analysis: `npx analyze-scalability .`
    - UI/UX problem detection: `npx analyze-ui-problems .`
    - Frontend/backend integration issues: `npx analyze-frontend-backend .`
- **`node_modules/fileflows`**: Generates `FILE_FLOWS.md` for visualizing application data workflows using `npx fileflows`.
- **External APIs**: Integration with third-party services requires backend code to strictly conform to their API specifications.
- **Test Runners**:
    - `qtests-runner.mjs` for JavaScript/TypeScript projects.
    - `test_runner.py` for Python projects.