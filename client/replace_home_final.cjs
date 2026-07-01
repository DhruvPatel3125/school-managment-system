 const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, './src/pages/Home.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const startMarker = "  // ==========================================\n  if (user?.role === 'student') {";
const endMarker = "  // ==========================================\n  // RENDER: Teacher Portal view";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error("Error: Could not find start or end marker in Home.jsx");
  console.log("StartIndex:", startIndex, "EndIndex:", endIndex);
  process.exit(1);
}

const replacement = fs.readFileSync(path.resolve(__dirname, './student_view_final.txt'), 'utf8');
const updatedContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log("Success: Home.jsx student portal updated with module unavailability checks!");
