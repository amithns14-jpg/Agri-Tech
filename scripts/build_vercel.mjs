import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🌾 AgroGuide AI: Starting Vercel Production Build...');

try {
  // 1. Build the Vite React Frontend
  console.log('Step 1: Compiling React frontend with pnpm filter (agroguide-ai-client)...');
  execSync('pnpm --filter agroguide-ai-client build', { stdio: 'inherit' });

  // 2. Synchronize dist outputs so Vercel finds the output regardless of project settings
  const clientDist = path.resolve('client', 'dist');
  const rootPublic = path.resolve('public');
  const rootDist = path.resolve('dist');

  if (fs.existsSync(clientDist)) {
    // Copy to public/ (Vercel default for "Other" preset)
    if (!fs.existsSync(rootPublic)) {
      fs.mkdirSync(rootPublic, { recursive: true });
    }
    fs.cpSync(clientDist, rootPublic, { recursive: true, force: true });
    console.log('✓ Successfully synced client/dist to public/');

    // Copy to dist/ (Vercel default for "Vite" preset)
    if (!fs.existsSync(rootDist)) {
      fs.mkdirSync(rootDist, { recursive: true });
    }
    fs.cpSync(clientDist, rootDist, { recursive: true, force: true });
    console.log('✓ Successfully synced client/dist to dist/');
  } else {
    console.error('❌ Expected build output in client/dist was not found.');
    process.exit(1);
  }

  console.log('✅ AgroGuide AI Build Complete for Vercel!');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
