#!/usr/bin/env node

/**
 * Build and Deploy script for The Cliff Website
 * Compiles CSS from src/ and prepares htdocs/ for deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

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
 * Get SFTP credentials from keys.json file only
 */
async function getSFTPCredentials() {
    console.log('\n🔐 SFTP Deployment Credentials');
    console.log('==============================');
    
    // Check if keys.json exists
    if (!fs.existsSync('keys.json')) {
        console.error('❌ keys.json file not found');
        console.error('💡 Create a keys.json file with your SFTP credentials');
        process.exit(1);
    }
    
    try {
        const keysData = JSON.parse(fs.readFileSync('keys.json', 'utf8'));
        
        if (!keysData.sftp) {
            console.error('❌ No "sftp" section found in keys.json');
            process.exit(1);
        }
        
        const { host, port, username, password, remoteDir } = keysData.sftp;
        
        if (!host || !port || !username || !password || !remoteDir) {
            console.error('❌ Missing required SFTP credentials in keys.json');
            console.error('   Required: host, port, username, password, remoteDir');
            process.exit(1);
        }
        
        console.log(`✅ Using credentials from keys.json for ${username}@${host}:${port}`);
        return { host, port, username, password, remoteDir };
        
    } catch (error) {
        console.error('❌ Error reading keys.json:', error.message);
        process.exit(1);
    }
}

/**
 * Ask for deployment confirmation at the very start
 */
async function confirmBuildAndDeploy() {
    console.log('\n⚠️  BUILD & DEPLOY CONFIRMATION');
    console.log('===============================');
    console.log('🏗️  This will build the website AND deploy to production');
    console.log('📁 Source: src/ → htdocs/');
    console.log('🌐 Target: Live production server');
    console.log('');
    console.log('💡 If you only want to build without deploying, use:');
    console.log('   npm run build:prod  or  node build.js prod');
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise((resolve) => {
        rl.question('\n❓ Do you want to BUILD and DEPLOY to production? (yes/no): ', (answer) => {
            rl.close();
            
            const normalizedAnswer = answer.toLowerCase().trim();
            
            if (normalizedAnswer === 'yes' || normalizedAnswer === 'y') {
                console.log('✅ Build and deployment confirmed');
                resolve(true);
            } else {
                console.log('❌ Build and deployment cancelled');
                console.log('💡 To build only, run: node build.js prod');
                resolve(false);
            }
        });
    });
}


function deploySite() {
    confirmBuildAndDeploy().then(async (confirmed) => {
        if (confirmed) {
            verifyBuild();
            deploySFTP();
        }
    });
}
export default deploySite