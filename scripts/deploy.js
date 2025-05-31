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
 * Verify build outputs in htdocs
 */
function verifyBuild() {
    console.log('🔍 Verifying build outputs...');
    
    // Check if htdocs exists
    if (!fs.existsSync('htdocs')) {
        console.error('❌ htdocs directory not found');
        process.exit(1);
    }
    
    const requiredFiles = [ 'sitemap.xml', 'index.html', '.htaccess', 'robots.txt'];
    
    requiredFiles.forEach(file => {
        const filePath = `htdocs/${file}`;
        if (!fs.existsSync(filePath)) {
            console.error(`❌ ${file} not found in htdocs/`);
            process.exit(1);
        }
    });
    
    // Show directory listing
    console.log('\n📁 htdocs/ contents:');
    console.log('===================');
    
    try {
        const items = fs.readdirSync('htdocs', { withFileTypes: true });
        
        // Sort items: directories first, then files
        const sortedItems = items.sort((a, b) => {
            if (a.isDirectory() && !b.isDirectory()) return -1;
            if (!a.isDirectory() && b.isDirectory()) return 1;
            return a.name.localeCompare(b.name);
        });
        
        let totalSize = 0;
        
        sortedItems.forEach(item => {
            const itemPath = `htdocs/${item.name}`;
            
            if (item.isDirectory()) {
                console.log(`   📁 ${item.name}/`);
                try {
                    const dirItems = fs.readdirSync(itemPath, { recursive: true });
                    console.log(`      (${dirItems.length} items)`);
                } catch (error) {
                    console.log(`      (unable to read)`);
                }
            } else {
                try {
                    const stats = fs.statSync(itemPath);
                    const size = (stats.size / 1024).toFixed(1);
                    totalSize += stats.size;
                    console.log(`   📄 ${item.name} (${size}KB)`);
                } catch (error) {
                    console.log(`   📄 ${item.name} (size unknown)`);
                }
            }
        });
        
        const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
        console.log(`\n📊 Total size: ${totalSizeMB}MB`);
        console.log(`📊 Total items: ${items.length}`);
        
    } catch (error) {
        console.warn('⚠️  Could not read htdocs directory listing');
    }
    
    console.log('✅ Build verification complete');
}

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
 * Verify deployment files exist
 */
function verifyDeploymentFiles() {
    console.log('\n📋 Verifying deployment files...');
    
    try {
        // Check if htdocs directory exists
        execSync('ls htdocs/', { stdio: 'pipe' });
        console.log('✅ htdocs directory found');
        
        // Check for essential files
        const essentialFiles = ['index.html', 'css/main.css'];
        for (const file of essentialFiles) {
            try {
                execSync(`ls htdocs/${file}`, { stdio: 'pipe' });
                console.log(`✅ ${file} found`);
            } catch {
                console.warn(`⚠️  ${file} not found - you may need to run 'npm run build' first`);
            }
        }
        
    } catch (error) {
        console.error('❌ htdocs directory not found');
        console.error('Please run "npm run build" first to generate deployment files');
        process.exit(1);
    }
}

/**
 * Deploy to SFTP server
 */
async function deploySFTP() {
    console.log('\n🚀 Starting SFTP Deployment...');
    
    // Get credentials from keys.json
    const credentials = await getSFTPCredentials();
    
    console.log(`📡 Connecting to ${credentials.username}@${credentials.host}:${credentials.port}...`);
    
    try {
        // Use here-document approach instead of batch file
        const sftpCommand = `sshpass -p '${credentials.password}' sftp -P ${credentials.port} -o StrictHostKeyChecking=no ${credentials.username}@${credentials.host} << 'EOF'
cd ${credentials.remoteDir}
lcd htdocs
put -r *
quit
EOF`;
        
        execSync(sftpCommand, { stdio: 'inherit', shell: '/bin/bash' });
        
        console.log('✅ SFTP deployment successful!');
        console.log('🌐 Website deployed to server');
        
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
    
    if (args.includes('--verify-only')) {
        verifyDeploymentFiles();
        return;
    }
    
    console.log('🎯 The Cliff - Deployment Script');
    console.log('================================');
    
    // Verify files before deployment
    verifyDeploymentFiles();
    
    // Test connection before deployment
    await testSFTPConnection();
    
    // Deploy to SFTP
    await deploySFTP();
    
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