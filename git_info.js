const { execSync } = require('child_process');

try {
    const status = execSync('git status').toString();
    const remotes = execSync('git remote -v').toString();
    const branch = execSync('git rev-parse --abbrev-ref HEAD').toString();
    
    console.log('--- GIT STATUS ---');
    console.log(status);
    console.log('--- GIT REMOTES ---');
    console.log(remotes);
    console.log('--- GIT BRANCH ---');
    console.log(branch);
} catch (err) {
    console.error('Error getting git info:', err.message);
}
