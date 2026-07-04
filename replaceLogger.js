const fs = require('fs');
const path = require('path');

function replaceLogger(filePath, requirePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes(requirePath)) {
    // Add require at the top
    content = `const logger = require('${requirePath}');\n` + content;
  }
  
  // Replace console.log and console.error
  content = content.replace(/console\.log\(/g, 'logger.info(');
  content = content.replace(/console\.error\(/g, 'logger.error(');
  content = content.replace(/console\.warn\(/g, 'logger.warn(');
  
  fs.writeFileSync(filePath, content);
}

replaceLogger(path.join('server', 'src', 'app.js'), './utils/logger');
replaceLogger(path.join('server', 'src', 'server.js'), './utils/logger');
replaceLogger(path.join('server', 'src', 'seed.js'), './utils/logger');
replaceLogger(path.join('server', 'src', 'config', 'db.js'), '../utils/logger');
replaceLogger(path.join('server', 'src', 'utils', 'mailer.js'), './logger');
// auth.js might have some console.logs
replaceLogger(path.join('server', 'src', 'routes', 'auth.js'), '../utils/logger');

console.log('Logging updated');
