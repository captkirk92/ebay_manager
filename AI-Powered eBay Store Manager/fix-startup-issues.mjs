import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function checkConfiguration() {
  const issues = [];
  
  // Check Vite config
  try {
    const viteConfig = await fs.readFile('vite.config.ts', 'utf8');
    console.log('Checking Vite configuration...');
    
    if (viteConfig.includes('});};') || viteConfig.includes('});});')) {
      issues.push({
        file: 'vite.config.ts',
        issue: 'Malformed configuration ending',
        fix: async () => {
          const fixedConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    open: true,
    fs: {
      strict: true
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    target: 'esnext',
    outDir: 'build'
  }
});`;
          await fs.writeFile('vite.config.ts', fixedConfig, 'utf8');
          console.log('✅ Fixed Vite configuration');
        }
      });
    }
  } catch (error) {
    issues.push({
      file: 'vite.config.ts',
      issue: `Unable to read Vite configuration: ${error.message}`,
      critical: true
    });
  }

  // Check package.json
  try {
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
    console.log('Checking package.json...');
    
    const requiredDeps = {
      dependencies: ['react', 'react-dom'],
      devDependencies: ['vite', '@vitejs/plugin-react-swc']
    };

    for (const [type, deps] of Object.entries(requiredDeps)) {
      const missing = deps.filter(dep => 
        !packageJson[type]?.[dep] && 
        !packageJson[type === 'dependencies' ? 'devDependencies' : 'dependencies']?.[dep]
      );

      if (missing.length > 0) {
        issues.push({
          file: 'package.json',
          issue: `Missing ${type}: ${missing.join(', ')}`,
          fix: async () => {
            console.log(`Installing missing ${type}...`);
            try {
              await execAsync(`npm install ${type === 'devDependencies' ? '-D' : ''} ${missing.join(' ')}`);
              console.log(`✅ Installed missing ${type}`);
            } catch (error) {
              console.error(`Failed to install ${type}:`, error.message);
            }
          }
        });
      }
    }
  } catch (error) {
    issues.push({
      file: 'package.json',
      issue: `Unable to read package.json: ${error.message}`,
      critical: true
    });
  }

  // Check node_modules
  try {
    await fs.access('node_modules');
  } catch (error) {
    issues.push({
      file: 'node_modules',
      issue: 'node_modules directory not found',
      fix: async () => {
        console.log('Installing dependencies...');
        try {
          await execAsync('npm install');
          console.log('✅ Installed dependencies');
        } catch (error) {
          console.error('Failed to install dependencies:', error.message);
        }
      }
    });
  }

  return issues;
}

async function fixIssues(issues) {
  const criticalIssues = issues.filter(issue => issue.critical);
  if (criticalIssues.length > 0) {
    console.error('Critical issues found:');
    criticalIssues.forEach(issue => console.error(`- ${issue.file}: ${issue.issue}`));
    return false;
  }

  for (const issue of issues) {
    if (issue.fix) {
      console.log(`Fixing ${issue.file}: ${issue.issue}`);
      await issue.fix();
    } else {
      console.log(`Warning: ${issue.file} - ${issue.issue}`);
    }
  }
  return true;
}

async function main() {
  console.log('🔍 Starting diagnostic check...');
  const issues = await checkConfiguration();
  
  if (issues.length === 0) {
    console.log('✅ No issues found');
    return;
  }

  console.log(`\n🔧 Found ${issues.length} issue(s) to fix:`);
  issues.forEach(issue => console.log(`- ${issue.file}: ${issue.issue}`));
  
  console.log('\n🚀 Attempting to fix issues...');
  const success = await fixIssues(issues);
  
  if (success) {
    console.log('\n✨ All fixable issues have been addressed');
    console.log('Try running the application again with: npm run dev');
  } else {
    console.log('\n❌ Some critical issues could not be fixed automatically');
  }
}

main().catch(console.error);
