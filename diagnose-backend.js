#!/usr/bin/env node

/**
 * Aether Backend Diagnostic Tool
 * 
 * Run this to diagnose backend issues:
 * node diagnose-backend.js
 */

const fs = require('fs')
const path = require('path')

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(type, message, detail = '') {
  const symbols = {
    error: `${colors.red}✗${colors.reset}`,
    success: `${colors.green}✓${colors.reset}`,
    warn: `${colors.yellow}⚠${colors.reset}`,
    info: `${colors.blue}ℹ${colors.reset}`,
  }

  console.log(`${symbols[type]} ${message}${detail ? ` - ${detail}` : ''}`)
}

function checkFile(filePath, name) {
  if (fs.existsSync(filePath)) {
    log('success', `Found ${name}`)
    return true
  } else {
    log('error', `Missing ${name}`, filePath)
    return false
  }
}

function checkEnvVar(varName) {
  const envFile = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envFile)) {
    log('error', `.env.local not found`)
    return false
  }

  const content = fs.readFileSync(envFile, 'utf-8')
  if (content.includes(varName)) {
    log('success', `Environment variable ${varName} is set`)
    return true
  } else {
    log('error', `Missing environment variable ${varName}`)
    return false
  }
}

async function diagnose() {
  console.log(`
${colors.cyan}╔════════════════════════════════════════╗
║  AETHER BACKEND DIAGNOSTIC TOOL        ║
║  Checking your setup                   ║
╚════════════════════════════════════════╝${colors.reset}
`)

  let issues = 0
  let checks = 0

  // Check file structure
  console.log(`\n${colors.cyan}=== File Structure ===${colors.reset}`)
  checks++
  if (!checkFile('lib/supabase.ts', 'Supabase client')) issues++
  checks++
  if (!checkFile('lib/api-handler.ts', 'API handler utilities')) issues++
  checks++
  if (!checkFile('hooks/useRealtimeData.ts', 'Real-time data hooks')) issues++
  checks++
  if (!checkFile('app/api/report-issue/route.ts', 'Report issue API')) issues++
  checks++
  if (!checkFile('app/api/approvals/certificates/route.ts', 'Certificate API')) issues++
  checks++
  if (!checkFile('app/api/requests/leaves/route.ts', 'Leave requests API')) issues++

  // Check environment variables
  console.log(`\n${colors.cyan}=== Environment Variables ===${colors.reset}`)
  checks++
  if (!checkEnvVar('NEXT_PUBLIC_SUPABASE_URL')) issues++
  checks++
  if (!checkEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY')) issues++
  checks++
  if (!checkEnvVar('GEMINI_API_KEY')) issues++

  // Check Supabase connection string format
  console.log(`\n${colors.cyan}=== Supabase Configuration ===${colors.reset}`)
  checks++
  const envFile = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, 'utf-8')
    if (content.includes('oukxdfiyewptvchkyhsw.supabase.co')) {
      log('success', 'Supabase URL looks correct')
    } else {
      log('warn', 'Supabase URL format might be incorrect')
    }
  }

  // Check if node_modules has dependencies
  console.log(`\n${colors.cyan}=== Dependencies ===${colors.reset}`)
  checks++
  if (fs.existsSync('node_modules/@supabase/supabase-js')) {
    log('success', 'Supabase JS client installed')
  } else {
    log('error', 'Supabase JS client not installed', 'Run: npm install')
    issues++
  }

  // Check package.json scripts
  console.log(`\n${colors.cyan}=== Build Configuration ===${colors.reset}`)
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
  checks++
  if (packageJson.scripts && packageJson.scripts.dev) {
    log('success', 'Dev script configured')
  } else {
    log('warn', 'Dev script not found in package.json')
    issues++
  }

  // Summary
  console.log(`\n${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`)
  console.log(`${colors.cyan}║          DIAGNOSTIC SUMMARY             ║${colors.reset}`)
  console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}`)

  console.log(`\nChecks run: ${checks}`)
  console.log(`Issues found: ${issues}`)

  if (issues === 0) {
    console.log(
      `\n${colors.green}✨ All checks passed! Your backend setup looks good!${colors.reset}\n`
    )
    console.log(`${colors.blue}Next steps:${colors.reset}`)
    console.log(`  1. Run SQL initialization in Supabase console`)
    console.log(`  2. Start dev server: npm run dev`)
    console.log(`  3. Test endpoints: node test-backend.js`)
  } else {
    console.log(
      `\n${colors.red}❌ Some issues found. Please fix them and run again.${colors.reset}\n`
    )
    console.log(`${colors.blue}Common fixes:${colors.reset}`)
    console.log(`  - Missing files: Copy from reference files`)
    console.log(`  - Missing env vars: Add to .env.local`)
    console.log(`  - Missing dependencies: npm install`)
  }
}

diagnose().catch((error) => {
  console.error(`${colors.red}Error running diagnostics:${colors.reset}`, error)
  process.exit(1)
})
