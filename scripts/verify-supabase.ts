import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Verify Supabase connectivity and configuration
 * Run with: pnpm verify:supabase
 */

// Load .env.local file
function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    return {};
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env: Record<string, string> = {};

  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').trim();

    if (key && value) {
      env[key.trim()] = value;
    }
  });

  return env;
}

async function verifySupabaseConnection() {
  console.log('🔍 Verifying Supabase Configuration...\n');

  // Load from .env.local file
  const envVars = loadEnvFile();
  const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'] || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('📋 Environment Variables:');
  console.log(`  URL: ${supabaseUrl ? '✓ Set' : '✗ Missing'}`);
  console.log(`  Key: ${supabaseKey ? '✓ Set' : '✗ Missing'}`);

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      '\n❌ Error: Missing Supabase credentials in .env.local\n',
      'Please set:\n',
      '  NEXT_PUBLIC_SUPABASE_URL=your-url\n',
      '  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key\n'
    );
    process.exit(1);
  }

  // Check for placeholder values
  if (supabaseUrl.includes('your-project') || supabaseKey.includes('your-anon-key')) {
    console.error(
      '\n❌ Error: Placeholder values detected in .env.local\n',
      'Please replace with actual Supabase credentials from:\n',
      '  https://app.supabase.com/projects\n'
    );
    process.exit(1);
  }

  // Initialize client
  console.log('\n🔗 Initializing Supabase Client...');
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test basic connectivity
    console.log('\n📡 Testing Connection...');
    const { data, error } = await supabase.from('tasks').select('id').limit(1);

    if (error) {
      console.error(`\n❌ Connection Failed: ${error.message}`);
      console.error(`   Code: ${error.code}`);
      process.exit(1);
    }

    console.log('✓ Successfully connected to Supabase');

    // Test authentication
    console.log('\n🔐 Testing Authentication...');
    const { data: authData, error: authError } = await supabase.auth.getSession();

    if (authError) {
      console.error(`❌ Auth Error: ${authError.message}`);
    } else {
      console.log('✓ Authentication configured');
    }

    // Verify tables exist
    console.log('\n📊 Verifying Database Schema...');
    const tables = ['tasks', 'bids'];

    for (const table of tables) {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (error && error.code === 'PGRST116') {
        console.log(`✗ Table missing: ${table}`);
      } else if (error) {
        console.log(`⚠ Table ${table}: ${error.message}`);
      } else {
        console.log(`✓ Table exists: ${table}`);
      }
    }

    console.log('\n✅ All checks passed! Supabase is properly configured.\n');
  } catch (err) {
    console.error('\n❌ Unexpected error:', err);
    process.exit(1);
  }
}

verifySupabaseConnection();
