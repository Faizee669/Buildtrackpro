const { execSync } = require('child_process');

try {
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "Fix auth and Vercel URL paths"', { stdio: 'inherit' });
  execSync('git push', { stdio: 'inherit' });
} catch (e) {
  console.error(e);
}
