// Copilot Agent Log Automation Config
// This file is used as a system command for Copilot agent to automate log writing and error review after each change.

module.exports = {
  logFile: 'logs/web-output.log',
  activityLog: 'logs/activity-log.md',
  runtimeLogFile: 'logs/runtime-errors.log',
  afterEachChange: [
    // 1. Write a summary of the change to activity-log.md
    // 2. Test the website functionality and capture runtime output to web-output.log
    // 3. Capture any runtime errors to runtime-errors.log
    // 4. Run scripts/read-logs.js to check for new compilation and runtime errors
    // 5. If errors are found, automatically trigger a review and fix
    // 6. Do not proceed to next step until all errors (compilation AND runtime) are resolved
  ],
  systemPrompt: [
    'After every file or code change, test the relevant website section and append the output and errors to logs/web-output.log.',
    'Capture any runtime errors (console errors, JavaScript errors, React errors) to logs/runtime-errors.log.',
    'Update logs/activity-log.md with a summary of the change and both compilation and runtime test results.',
    'Run scripts/read-logs.js to check for new compilation and runtime errors.',
    'Test actual website functionality by accessing the relevant pages/components.',
    'If new errors are found (compilation OR runtime), fix them before proceeding.'
  ]
};
