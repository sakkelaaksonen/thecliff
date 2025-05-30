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
 * Build CSS using Tailwind CLI and inject build tag
 */
function buildCSS() {
    console.log('🎨 Building CSS...');
    try {
        // Ensure htdocs directory exists
        if (!fs.existsSync('htdocs')) {
            console.error('❌ htdocs directory not found');
            process.exit(1);
        }
        
        // Check if source CSS exists
        if (!fs.existsSync('src/source.css')) {
            console.error('❌ src/source.css not found');
            process.exit(1);
        }
        
        // Build CSS with Tailwind
        execSync('npx tailwindcss -i ./src/source.css -o ./htdocs/main.css --minify', { 
            stdio: 'inherit' 
        });
        
        // Generate build tag
        const now = new Date();
        const isoDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const timestamp = now.getTime(); //ep
        const buildTag = `thecliff-${isoDate}-${timestamp}`;
        
        // Read the compiled CSS
        let cssContent = fs.readFileSync('htdocs/main.css', 'utf8');
        
        // Prepend build tag comment
        const buildComment = `/* Build: ${buildTag} */\n`;
        cssContent = buildComment + cssContent;
        
        // Write back to file
        fs.writeFileSync('htdocs/main.css', cssContent, 'utf8');
        
        console.log('✅ CSS built successfully');
        console.log(`🏷️  Build tag: ${buildTag}`);
        
        return buildTag; // Return build tag for use in other functions
        
    } catch (error) {
        console.error('❌ CSS build failed:', error.message);
        process.exit(1);
    }
}

/**
 * Generate sitemap with current date
 */
function generateSitemap() {
    console.log('🗺️  Generating sitemap...');
    
    const currentDate = new Date().toISOString().split('T')[0];
    
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://thecliff.fi/</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
</urlset>`;

    try {
        fs.writeFileSync('htdocs/sitemap.xml', sitemapContent, 'utf8');
        console.log('✅ Sitemap generated successfully');
    } catch (error) {
        console.error('❌ Sitemap generation failed:', error.message);
        process.exit(1);
    }
}

/**
 * Process any additional build steps for src files
 */
function processSrcFiles() {
    console.log('🔧 Processing source files...');
    
    try {
        // Check if src directory exists
        if (!fs.existsSync('src')) {
            console.warn('⚠️  src directory not found, skipping source processing');
            return;
        }
        
        // Future: Add processing for templates, JS compilation, etc.
        // For now, just log that we're ready for future enhancements
        console.log('✅ Source files processed (CSS compilation completed)');
        
    } catch (error) {
        console.error('❌ Source file processing failed:', error.message);
        process.exit(1);
    }
}

/**
 * Process HTML files to inject build version into asset URLs
 */
function processHTMLFiles(buildTag) {
    console.log('🔧 Processing HTML files for cache busting...');
    
    try {
        const htmlFiles = ['index.html', '404.html']; // Add more as needed
        
        htmlFiles.forEach(filename => {
            const filePath = `htdocs/${filename}`;
            
            if (!fs.existsSync(filePath)) {
                console.warn(`⚠️  ${filename} not found, skipping`);
                return;
            }
            
            let htmlContent = fs.readFileSync(filePath, 'utf8');
            
            // Store original for comparison
            const originalContent = htmlContent;
            
            // Replace CSS references (handles both with and without existing query strings)
            htmlContent = htmlContent.replace(
                /href="main\.css(\?[^"]*)?"/g, 
                `href="main.css?v=${buildTag}"`
            );
            
            // Replace JS references (handles both with and without existing query strings)
            htmlContent = htmlContent.replace(
                /src="main\.js(\?[^"]*)?"/g, 
                `src="main.js?v=${buildTag}"`
            );
            
            // Add/update build version meta tag for debugging
            const metaTag = `    <meta name="build-version" content="${buildTag}">`;
            
            if (htmlContent.includes('<meta name="build-version"')) {
                // Update existing meta tag
                htmlContent = htmlContent.replace(
                    /<meta name="build-version" content="[^"]*">/,
                    metaTag
                );
            } else {
                // Add new meta tag after viewport
                htmlContent = htmlContent.replace(
                    /(<meta name="viewport"[^>]*>\n)/,
                    `$1${metaTag}\n`
                );
            }
            
            // Only write if content changed
            if (htmlContent !== originalContent) {
                fs.writeFileSync(filePath, htmlContent, 'utf8');
                console.log(`✅ Processed ${filename} with build version ${buildTag}`);
            } else {
                console.log(`ℹ️  ${filename} - no changes needed`);
            }
        });
        
    } catch (error) {
        console.error('❌ HTML processing failed:', error.message);
        process.exit(1);
    }
}

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
    
    const requiredFiles = ['main.css', 'sitemap.xml', 'index.html', '.htaccess', 'robots.txt', '404.html'];
    
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
 * Production build process
 */
function buildProd() {
    try {
        const buildTag = buildCSS();
        generateSitemap();
        processSrcFiles();
        processHTMLFiles(buildTag); // Add HTML processing with build tag
        verifyBuild();
        
        console.log('\n🚀 Production build complete!');
        console.log(`🏷️  All assets versioned with: ${buildTag}`);
        console.log('📁 htdocs/ ready for deployment');
        
    } catch (error) {
        console.error('❌ Production build failed:', error.message);
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

/**
 * Deploy process (build + deploy)
 */
async function buildDeploy() {
    try {
        // Ask for confirmation at the very start
        const confirmed = await confirmBuildAndDeploy();
        
        if (!confirmed) {
            console.log('\n🛑 Build and deployment aborted by user');
            process.exit(0);
        }
        
        // Run production build
        buildProd();
        
        console.log('\n🚀 Starting deployment process...');
        
        // Deploy via SFTP
        await deploySFTP();
        
    } catch (error) {
        console.error('❌ Build and deploy failed:', error.message);
        process.exit(1);
    }
}

/**
 * Main execution
 */
async function main() {
    const command = process.argv[2];
    
    switch (command) {
        case 'prod':
            buildProd();
            break;
        case 'deploy':
            await buildDeploy();
            break;
        default:
            // Default to production build
            buildProd();
            break;
    }
}

// Run the script
main().catch(error => {
    console.error('❌ Script execution failed:', error.message);
    process.exit(1);
}); 