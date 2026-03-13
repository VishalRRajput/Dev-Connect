const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

let pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';

// Define master slide
pptx.defineSlideMaster({
  title: 'MASTER_SLIDE',
  background: { color: 'F5F5F5' },
  objects: [
    { rect: { x: 0, y: 0, w: '100%', h: 0.75, fill: { color: '2B3A42' } } },
    { text: { text: 'DevConnect - Empowering Developer Collaboration', options: { x: 0.5, y: 0.15, w: 8, h: 0.4, color: 'FFFFFF', fontSize: 16, bold: true } } },
    { text: { text: '© 2026 DevConnect', options: { x: 0.5, y: '93%', w: 4, h: 0.3, color: '888888', fontSize: 10 } } },
    { text: { text: 'Confidential & Proprietary', options: { x: 7.5, y: '93%', w: 2, h: 0.3, align: 'right', color: '888888', fontSize: 10 } } }
  ],
  slideNumber: { x: 9.3, y: '93%', fontFace: 'Arial', fontSize: 10, color: '888888' }
});

function addTitleSlide(title, subtitle) {
  let slide = pptx.addSlide();
  slide.background = { color: '2B3A42' };
  slide.addText(title, { x: 0, y: 2.0, w: '100%', h: 1.5, align: 'center', fontSize: 52, color: 'FFFFFF', bold: true });
  slide.addText(subtitle, { x: 0, y: 3.5, w: '100%', h: 1, align: 'center', fontSize: 24, color: 'A0C1D1' });
}

function addContentSlide(title, items) {
  let slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  slide.addText(title, { x: 0.5, y: 1.0, w: 9, h: 0.8, fontSize: 32, color: '2B3A42', bold: true });
  if (Array.isArray(items)) {
    slide.addText(items.map(item => ({ text: item, options: { bullet: { type: 'number' }, breakLine: true } })), { x: 0.5, y: 2.0, w: 9, h: 4.5, fontSize: 20, color: '333333', lineSpacing: 36, valign: 'top' });
  } else {
    slide.addText(items, { x: 0.5, y: 2.0, w: 9, h: 4.5, fontSize: 20, color: '333333', valign: 'top' });
  }
}

addTitleSlide('DevConnect', 'Empowering Developer Collaboration\nConnecting ideas, skills, and people.');
addContentSlide('1. Problem Statement', ['Developers often struggle to find collaborators.', 'Information is scattered.', 'Networking spaces are limited.', 'Matching talent is hard.']);
addContentSlide('2. The Solution: DevConnect', ['Centralized hub for engineers.', 'Seamless project posting.', 'Connect with like-minded creators.', 'Organic networking flows.']);
addContentSlide('3. Key Features', ['Secure JWT Authentication.', 'Advanced Project Management.', 'Fully Responsive Design.', 'Powerful Admin Dashboard.']);
addContentSlide('4. Technology Stack (MERN)', ['React, Vite, Tailwind CSS.', 'Node.js, Express.', 'MongoDB Atlas.', 'JWT & Bcrypt Security.']);
addContentSlide('5. Security & Authentication', ['Role-Based Access (User/Admin).', 'Bcrypt encryption.', 'Protected Middleware API.', 'Environment safety.']);
addContentSlide('6. System Architecture', ['Frontend on Vercel.', 'Backend on Render.', 'Database on Atlas.', 'HTTPS REST Communication.']);
addContentSlide('7. User & Admin Roles', ['Users: Post & Apply.', 'Admins: Exclusive Moderation.', 'Project Metadata Oversight.', 'Platform Maintenance.']);
addContentSlide('8. Challenges & Learnings', ['Role-based routing logic.', 'Mobile scaling with Tailwind.', 'Cross-origin deployment config.', 'Performance optimization.']);
addContentSlide('9. Future Scope & Conclusion', ['Socket.io Real-time Chat.', 'AI-Powered Skill Matching.', 'Bridges idea-to-execution gap.', 'Ready for scale.']);

const outPath = path.resolve(__dirname, 'DevConnect_Presentation.pptx');
console.log('Generating PPT at:', outPath);

pptx.writeFile({ fileName: outPath }).then(fileName => {
  console.log('Successfully created: ' + fileName);
  if (fs.existsSync(outPath)) {
    console.log('File verified on disk.');
  } else {
    console.error('File NOT found on disk after write!');
    process.exit(1);
  }
}).catch(err => {
  console.error('Error writing file:', err);
  process.exit(1);
});
