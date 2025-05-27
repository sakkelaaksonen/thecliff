#!/usr/bin/env node

/**
 * Video Compression Script
 * Compresses videos using ffmpeg with different presets
 * Usage: npm run video:compress <filename> [--preset web|mobile|720p|480p]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎬 Video Compression Tool');
console.log('=========================');

/**
 * Compression presets optimized for web
 */
const PRESETS = {
    'web': {
        scale: '1280:-1',
        crf: 23,
        description: 'Web optimized (1280p)',
        suffix: '-small'
    },
    'mobile': {
        scale: '854:-1',
        crf: 25,
        description: 'Mobile optimized (480p)',
        suffix: '-mobile'
    },
    '1280p': {
        scale: '1280:-1',
        crf: 23,
        description: '1280p (default)',
        suffix: '-small'
    },
    '720p': {
        scale: '1280:-1',
        crf: 23,
        description: '720p',
        suffix: '-small'
    },
    '480p': {
        scale: '854:-1',
        crf: 23,
        description: '480p',
        suffix: '-small'
    }
};

/**
 * Parse command line arguments
 */
function parseArgs() {
    const args = process.argv.slice(2);
    const inputFile = args.find(arg => !arg.startsWith('--'));
    const presetArg = args.find(arg => arg.startsWith('--preset'));
    
    let preset = 'web'; // Default to web preset
    
    if (presetArg) {
        preset = presetArg.split('=')[1] || args[args.indexOf(presetArg) + 1] || 'web';
    }
    
    return { inputFile, preset };
}

/**
 * Compress video with specified preset
 */
function compressVideo(inputFile, preset = 'web') {
    if (!inputFile) {
        console.error('❌ Please provide an input video filename');
        console.log('💡 Usage: npm run video:compress <filename> [--preset web|mobile|720p|480p]');
        console.log('💡 Available presets:', Object.keys(PRESETS).join(', '));
        process.exit(1);
    }

    // Check if file exists
    if (!fs.existsSync(inputFile)) {
        console.error(`❌ File not found: ${inputFile}`);
        process.exit(1);
    }

    // Validate preset
    if (!PRESETS[preset]) {
        console.error(`❌ Invalid preset: ${preset}`);
        console.log('💡 Available presets:', Object.keys(PRESETS).join(', '));
        process.exit(1);
    }

    // Generate output filename
    const ext = path.extname(inputFile);
    const basename = path.basename(inputFile, ext);
    const { suffix } = PRESETS[preset];
    const outputFile = `${basename}${suffix}${ext}`;

    console.log(`📹 Input: ${inputFile}`);
    console.log(`📤 Output: ${outputFile}`);
    console.log(`⚙️  Preset: ${PRESETS[preset].description}`);
    console.log('');

    // Check if output file already exists
    if (fs.existsSync(outputFile)) {
        console.warn(`⚠️  Output file already exists: ${outputFile}`);
        console.log('🔄 Overwriting...');
    }

    try {
        // Get input file size for comparison
        const inputStats = fs.statSync(inputFile);
        const inputSizeMB = (inputStats.size / (1024 * 1024)).toFixed(2);
        console.log(`📦 Input size: ${inputSizeMB} MB`);

        // Build ffmpeg command
        const { scale, crf } = PRESETS[preset];
        const command = `ffmpeg -i "${inputFile}" -vf "scale=${scale}" -c:v libx264 -preset slow -crf ${crf} -c:a aac -b:a 128k -movflags +faststart -y "${outputFile}"`;

        console.log('🔄 Compressing video...');
        console.log('⏳ This may take a while...');
        console.log('');

        // Execute compression
        execSync(command, { stdio: 'inherit' });

        // Get output file size
        const outputStats = fs.statSync(outputFile);
        const outputSizeMB = (outputStats.size / (1024 * 1024)).toFixed(2);
        const compressionRatio = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);

        console.log('');
        console.log('✅ Compression complete!');
        console.log('========================');
        console.log(`📦 Output size: ${outputSizeMB} MB`);
        console.log(`📉 Size reduction: ${compressionRatio}%`);
        console.log(`📁 Saved as: ${outputFile}`);

    } catch (error) {
        console.error('❌ Compression failed:', error.message);
        console.error('💡 Make sure ffmpeg is installed and in your PATH');
        
        // Clean up partial file if it exists
        if (fs.existsSync(outputFile)) {
            try {
                fs.unlinkSync(outputFile);
                console.log('🧹 Cleaned up partial output file');
            } catch (cleanupError) {
                console.warn('⚠️  Could not clean up partial file:', outputFile);
            }
        }
        
        process.exit(1);
    }
}

// Parse arguments and run compression
const { inputFile, preset } = parseArgs();
compressVideo(inputFile, preset); 