const { MCPServer } = require('@modelcontextprotocol/server');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class DiagnosticServer extends MCPServer {
  constructor() {
    super();
    this.configFiles = [
      'vite.config.ts',
      'tsconfig.json',
      'package.json',
      '.env'
    ];
  }

  async diagnoseConfigurationIssues() {
    const issues = [];
    
    // Check Vite config
    try {
      const viteConfig = await fs.promises.readFile('vite.config.ts', 'utf8');
      if (viteConfig.includes('});};')) {
        issues.push({
          file: 'vite.config.ts',
          issue: 'Malformed configuration ending',
          fix: 'Remove extra closing braces/parentheses'
        });
      }
    } catch (error) {
      issues.push({
        file: 'vite.config.ts',
        issue: 'Unable to read Vite configuration',
        error: error.message
      });
    }

    // Check dependencies
    try {
      const packageJson = JSON.parse(await fs.promises.readFile('package.json', 'utf8'));
      const requiredDeps = ['vite', '@vitejs/plugin-react-swc', 'react', 'react-dom'];
      const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]);
      
      if (missingDeps.length > 0) {
        issues.push({
          file: 'package.json',
          issue: 'Missing required dependencies',
          missingDeps,
          fix: `Run: npm install ${missingDeps.join(' ')}`
        });
      }
    } catch (error) {
      issues.push({
        file: 'package.json',
        issue: 'Unable to read package.json',
        error: error.message
      });
    }

    return issues;
  }

  async fixConfigurationIssues(issues) {
    for (const issue of issues) {
      if (issue.file === 'vite.config.ts' && issue.issue === 'Malformed configuration ending') {
        try {
          let content = await fs.promises.readFile('vite.config.ts', 'utf8');
          content = content.replace(/\}\);(\s*\})*;?$/, '});');
          await fs.promises.writeFile('vite.config.ts', content, 'utf8');
        } catch (error) {
          console.error('Failed to fix Vite config:', error);
        }
      }
    }
  }

  async validateEnvironment() {
    return new Promise((resolve) => {
      exec('npm --version', (error) => {
        if (error) {
          resolve({
            valid: false,
            issue: 'npm not found or not working properly',
            fix: 'Install or repair Node.js installation'
          });
        } else {
          resolve({ valid: true });
        }
      });
    });
  }

  async onRequest(request) {
    switch (request.method) {
      case 'diagnose':
        const issues = await this.diagnoseConfigurationIssues();
        return { issues };
      
      case 'fix':
        const diagnosisIssues = await this.diagnoseConfigurationIssues();
        await this.fixConfigurationIssues(diagnosisIssues);
        return { fixed: true, issues: diagnosisIssues };
      
      case 'validate':
        return await this.validateEnvironment();
      
      default:
        throw new Error(`Unknown method: ${request.method}`);
    }
  }
}

const server = new DiagnosticServer();
server.start();
