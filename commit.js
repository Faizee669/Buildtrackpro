const { execSync } = require('child_process');

try {
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "Update"', { stdio: 'inherit' });
  execSync('git push origin master', { stdio: 'inherit' });
} catch (e) {
  console.error(e.message);
}
