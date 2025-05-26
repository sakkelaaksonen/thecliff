#!/usr/bin/env node

/**
 * Build script for The Cliff Website
 * Compiles CSS and generates sitemap
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏗️  Building The Cliff Website...');
console.log('================================');

/**
 * Build CSS using Tailwind CLI
 */
function buildCSS() {
    console.log('🎨 Building CSS...');
    try {
        execSync('npx tailwindcss -i ./source.css -o ./main.css --minify', { 
            stdio: 'inherit' 
        });
        console.log('✅ CSS built successfully');
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
        fs.writeFileSync('sitemap.xml', sitemapContent, 'utf8');
        console.log('✅ Sitemap generated successfully');
    } catch (error) {
        console.error('❌ Sitemap generation failed:', error.message);
        process.exit(1);
    }
}

/**
 * Verify build outputs
 */
function verifyBuild() {
    console.log('🔍 Verifying build outputs...');
    
    if (!fs.existsSync('main.css')) {
        console.error('❌ main.css not found');
        process.exit(1);
    }
    
    if (!fs.existsSync('sitemap.xml')) {
        console.error('❌ sitemap.xml not found');
        process.exit(1);
    }
    
    const cssStats = fs.statSync('main.css');
    const cssSize = (cssStats.size / 1024).toFixed(1);
    
    console.log(`✅ main.css (${cssSize}KB)`);
    console.log('✅ sitemap.xml');
}

/**
 * Main build process
 */
function build() {
    try {
        buildCSS();
        generateSitemap();
        verifyBuild();
        
        console.log('');
        console.log('🚀 Build complete!');
        console.log('Ready for deployment to thecliff.fi');
        
    } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
    }
}

// Run build
build(); 