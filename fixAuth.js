const fs = require('fs');
const path = require('path');
const file = path.join('client', 'src', 'context', 'AuthContext.jsx');

let code = fs.readFileSync(file, 'utf8');

// Replace interceptor refresh logic
code = code.replace(/const storedRefreshToken = localStorage\.getItem\('refreshToken'\);\s*const res = await axios\.post\(`\$\{API_URL\}\/api\/v1\/auth\/refresh`, \{\s*refreshToken: storedRefreshToken\s*\}\);\s*const newToken = res\.data\.accessToken;\s*const newRefreshToken = res\.data\.refreshToken;\s*setAccessToken\(newToken\);\s*localStorage\.setItem\('accessToken', newToken\);\s*if \(newRefreshToken\) \{\s*localStorage\.setItem\('refreshToken', newRefreshToken\);\s*\}/,
`const res = await axios.post(\`\${API_URL}/api/v1/auth/refresh\`, {});
              const newToken = res.data.accessToken;
              
              setAccessToken(newToken);
              localStorage.setItem('accessToken', newToken);`);

// Replace interceptor catch logic
code = code.replace(/localStorage\.removeItem\('user'\);\s*localStorage\.removeItem\('accessToken'\);\s*localStorage\.removeItem\('refreshToken'\);/,
`localStorage.removeItem('user');
              localStorage.removeItem('accessToken');`);

// Replace initializeAuth logic
code = code.replace(/const storedRefreshToken = localStorage\.getItem\('refreshToken'\);/, ``);
code = code.replace(/if \(storedRefreshToken\) \{([\s\S]*?)const res = await axios\.post\(`\$\{API_URL\}\/api\/v1\/auth\/refresh`, \{\s*refreshToken: storedRefreshToken\s*\}\);\s*const newToken = res\.data\.accessToken;\s*const newRefreshToken = res\.data\.refreshToken;\s*setAccessToken\(newToken\);\s*localStorage\.setItem\('accessToken', newToken\);\s*if \(newRefreshToken\) \{\s*localStorage\.setItem\('refreshToken', newRefreshToken\);\s*\}([\s\S]*?)setUser\(meRes\.data\.user\);\s*localStorage\.setItem\('user', JSON\.stringify\(meRes\.data\.user\)\);\s*\} else \{\s*throw meErr;\s*\}/,
`console.log('🔄 Session profile verify failed. Attempting refresh token...');
              const res = await axios.post(\`\${API_URL}/api/v1/auth/refresh\`, {});
              const newToken = res.data.accessToken;
              
              setAccessToken(newToken);
              localStorage.setItem('accessToken', newToken);$2setUser(meRes.data.user);
              localStorage.setItem('user', JSON.stringify(meRes.data.user));`);

code = code.replace(/\} else if \(storedRefreshToken\) \{([\s\S]*?)const res = await axios\.post\(`\$\{API_URL\}\/api\/v1\/auth\/refresh`, \{\s*refreshToken: storedRefreshToken\s*\}\);\s*const newToken = res\.data\.accessToken;\s*const newRefreshToken = res\.data\.refreshToken;\s*setAccessToken\(newToken\);\s*localStorage\.setItem\('accessToken', newToken\);\s*if \(newRefreshToken\) \{\s*localStorage\.setItem\('refreshToken', newRefreshToken\);\s*\}([\s\S]*?)setUser\(meRes\.data\.user\);\s*localStorage\.setItem\('user', JSON\.stringify\(meRes\.data\.user\)\);\s*\}/,
`} else {
          // No active access token but we might have a refresh token in cookie
          const res = await axios.post(\`\${API_URL}/api/v1/auth/refresh\`, {});
          const newToken = res.data.accessToken;
          
          setAccessToken(newToken);
          localStorage.setItem('accessToken', newToken);$2setUser(meRes.data.user);
          localStorage.setItem('user', JSON.stringify(meRes.data.user));
        }`);

// Replace initialization catch logic
code = code.replace(/localStorage\.removeItem\('user'\);\s*localStorage\.removeItem\('accessToken'\);\s*localStorage\.removeItem\('refreshToken'\);/,
`localStorage.removeItem('user');
        localStorage.removeItem('accessToken');`);

// Replace login logic
code = code.replace(/const \{ accessToken: token, refreshToken: rToken, user: userData \} = res\.data;\s*setAccessToken\(token\);\s*setUser\(userData\);\s*\/\/ Persist in localStorage\s*localStorage\.setItem\('accessToken', token\);\s*localStorage\.setItem\('refreshToken', rToken\);\s*localStorage\.setItem\('user', JSON\.stringify\(userData\)\);/,
`const { accessToken: token, user: userData } = res.data;
      setAccessToken(token);
      setUser(userData);

      // Persist in localStorage
      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(userData));`);

// Replace logout logic
code = code.replace(/const storedRefreshToken = localStorage\.getItem\('refreshToken'\);\s*await axios\.post\(`\$\{API_URL\}\/api\/v1\/auth\/logout`, \{\s*refreshToken: storedRefreshToken\s*\}\);/,
`await axios.post(\`\${API_URL}/api/v1/auth/logout\`, {});`);

code = code.replace(/localStorage\.removeItem\('user'\);\s*localStorage\.removeItem\('accessToken'\);\s*localStorage\.removeItem\('refreshToken'\);/,
`localStorage.removeItem('user');
      localStorage.removeItem('accessToken');`);

fs.writeFileSync(file, code);
console.log('Update done');
