#!/usr/bin/env node

/**
 * Build and Deploy script for The Cliff Website
 * Compiles CSS from src/ and prepares htdocs/ for deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { readFileSync } from 'fs';

console.log('🏗️  The Cliff Website Build & Deploy');
console.log('====================================');

/**
 * Get SFTP credentials from keys.json
 */
async function getSFTPCredentials() {
    try {
        const keys = JSON.parse(readFileSync('keys.json', 'utf8'));
        
        if (!keys.sftp) {
            throw new Error('SFTP configuration not found in keys.json');
        }
        
        const required = ['host', 'username', 'password', 'remoteDir'];
        for (const field of required) {
            if (!keys.sftp[field]) {
                throw new Error(`Missing required SFTP field: ${field}`);
            }
        }
        
        return {
            host: keys.sftp.host,
            username: keys.sftp.username,
            password: keys.sftp.password,
            port: keys.sftp.port || 22,
            remoteDir: keys.sftp.remoteDir
        };
    } catch (error) {
        console.error('❌ Error reading SFTP credentials:', error.message);
        console.error('Make sure keys.json exists with proper SFTP configuration');
        process.exit(1);
    }
}

/**
 * Test SFTP connection
 */
async function testSFTPConnection() {
    console.log('\n🔍 Testing SFTP Connection...');
    
    const credentials = await getSFTPCredentials();
    
    try {
        const testCommand = `sshpass -p '${credentials.password}' sftp -P ${credentials.port} -o StrictHostKeyChecking=no ${credentials.username}@${credentials.host} << 'EOF'
pwd
quit
EOF`;
        
        execSync(testCommand, { stdio: 'pipe', shell: '/bin/bash' });
        console.log('✅ SFTP connection successful!');
        console.log(`📁 Remote directory: ${credentials.remoteDir}`);
        
    } catch (error) {
        console.error('❌ SFTP connection failed');
        console.error('Please check your credentials in keys.json');
        process.exit(1);
    }
}

/**
 * Ask user for deployment confirmation
 */
async function confirmDeployment() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise((resolve) => {
        rl.question('\n❓ Are you sure you want to deploy to the live server? (y/N): ', (answer) => {
            rl.close();
            const confirmed = answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
            resolve(confirmed);
        });
    });
}

/**
 * Verify deployment files (remove menu copying logic)
 */
function verifyDeploymentFiles() {
    console.log('\n📋 Verifying deployment files...');
    
    const requiredFiles = [
        'htdocs/index.html',
        'htdocs/admin/index.html',
        'htdocs/css/style.css'
    ];
    
    for (const file of requiredFiles) {
        if (!fs.existsSync(file)) {
            console.error(`❌ Required file missing: ${file}`);
            process.exit(1);
        }
    }
    
    console.log('✅ All required files present');
    
    // Ensure local data directory exists (but don't deploy it)
    const dataDir = 'data';
    if (!fs.existsSync(dataDir)) {
        console.log('📁 Creating local data directory...');
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    console.log('✅ File verification complete');
}

/**
 * Deploy to SFTP server (exclude data directory)
 */
async function deploySFTP() {
    console.log('\n🚀 Starting SFTP Deployment...');
    
    const credentials = await getSFTPCredentials();
    
    console.log(`📡 Connecting to ${credentials.username}@${credentials.host}:${credentials.port}...`);
    
    try {
        // Deploy only htdocs contents, exclude data directory
        const sftpCommand = `sshpass -p '${credentials.password}' sftp -P ${credentials.port} -o StrictHostKeyChecking=no ${credentials.username}@${credentials.host} << 'EOF'
cd ${credentials.remoteDir}
lcd htdocs
put -r *
quit
EOF`;
        
        execSync(sftpCommand, { stdio: 'inherit', shell: '/bin/bash' });
        
        console.log('✅ SFTP deployment successful!');
        console.log('🌐 Website deployed to server');
        console.log('📝 Note: data/ directory remains on server for persistence');
        
    } catch (error) {
        console.error('❌ SFTP deployment failed');
        console.error('Error details:', error.message);
        process.exit(1);
    }
}

/**
 * Main deployment function
 */
async function deploy() {
    const args = process.argv.slice(2);
    
    if (args.includes('--test-connection')) {
        await testSFTPConnection();
        return;
    }

    
    console.log('🎯 The Cliff - Deployment Script');
    console.log('================================');
    
    // Test connection before deployment
    await testSFTPConnection();
    
    // Ask for confirmation unless --force flag is used
    if (!args.includes('--force')) {
        const confirmed = await confirmDeployment();
        
        if (!confirmed) {
            console.log('❌ Deployment cancelled by user');
            process.exit(0);
        }
    }
    
    // Deploy to SFTP
    await deploySFTP();
    
    // Verify deployment files
    verifyDeploymentFiles();
    
    console.log('\n🎉 Deployment completed successfully!');
}

// Run deployment
deploy().catch(error => {
    console.error('💥 Deployment failed:', error.message);
    process.exit(1);
});

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    deploy();
}