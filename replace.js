const fs = require('fs');
const path = require('path');

const API_URL_CONST = "const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001`;\n";

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Only add if not already present
  if (!content.includes('const API_URL = import.meta.env.VITE_API_URL')) {
    content = content.replace("import axios from 'axios';", "import axios from 'axios';\n\n" + API_URL_CONST);
  }

  // AuthContext and TenantThemeContext sometimes use http://${window.location.hostname}:5001
  content = content.replace(/http:\/\/\$\{window\.location\.hostname\}:5001/g, '${API_URL}');
  content = content.replace(/`http:\/\/\$\{window\.location\.hostname\}:5001([^`]*)`/g, '`${API_URL}$1`');
  
  // MainLandingPage and others use http://localhost:5001
  content = content.replace(/'http:\/\/localhost:5001([^']*)'/g, '`${API_URL}$1`');
  content = content.replace(/"http:\/\/localhost:5001([^"]*)"/g, '`${API_URL}$1`');
  content = content.replace(/`http:\/\/localhost:5001([^`]*)`/g, '`${API_URL}$1`');
  
  // specifically for AuthContext's config.url rewrite
  content = content.replace(/if \(config\.url && config\.url\.includes\('localhost:5001'\)\) \{/g, "if (config.url && config.url.includes('localhost:5001') && !import.meta.env.VITE_API_URL) {");

  fs.writeFileSync(filePath, content);
}

['AuthContext.jsx', 'TenantThemeContext.jsx'].forEach(f => {
  updateFile(path.join('client', 'src', 'context', f));
});

updateFile(path.join('client', 'src', 'pages', 'MainLandingPage.jsx'));

console.log('Files updated successfully!');
