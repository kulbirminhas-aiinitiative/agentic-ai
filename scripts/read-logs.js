// Script to read and display new logs and errors from web-output.log and runtime-errors.log
const fs = require('fs');
const path = require('path');

const webLogPath = path.join(__dirname, '../logs/web-output.log');
const runtimeLogPath = path.join(__dirname, '../logs/runtime-errors.log');

function readLog(logPath, logType) {
  if (!fs.existsSync(logPath)) {
    console.log(`No ${logType} log file found.`);
    return { errorCount: 0, lastError: '' };
  }
  
  const content = fs.readFileSync(logPath, 'utf-8');
  const lines = content.split('\n').filter(Boolean);
  let errorCount = 0;
  let lastError = '';
  
  console.log(`\n=== ${logType} Log Analysis ===`);
  lines.forEach((line, idx) => {
    if (line.toLowerCase().includes('error') || line.toLowerCase().includes('failed') || line.toLowerCase().includes('exception')) {
      errorCount++;
      lastError = line;
      console.log(`${logType} Error [${errorCount}]: ${line}`);
    }
  });
  
  if (errorCount === 0) {
    console.log(`No errors found in ${logType} log.`);
  } else {
    console.log(`\nTotal ${logType} errors: ${errorCount}`);
    console.log(`Last ${logType} error: ${lastError}`);
  }
  
  return { errorCount, lastError };
}

function readAllLogs() {
  const webResults = readLog(webLogPath, 'Web Output');
  const runtimeResults = readLog(runtimeLogPath, 'Runtime');
  
  const totalErrors = webResults.errorCount + runtimeResults.errorCount;
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total compilation errors: ${webResults.errorCount}`);
  console.log(`Total runtime errors: ${runtimeResults.errorCount}`);
  console.log(`Total errors: ${totalErrors}`);
  
  if (totalErrors > 0) {
    console.log(`\n⚠️  ERRORS FOUND - Review and fix before proceeding!`);
    process.exit(1);
  } else {
    console.log(`\n✅ No errors found - Safe to proceed!`);
  }
}

readAllLogs();
