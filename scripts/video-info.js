#!/usr/bin/env node

/**
 * Video Info Script
 * Shows video metadata using ffprobe
 * Usage: npm run video:info <filename>
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎬 Video Info Tool');
console.log('==================');

/**
 * Get video information using ffprobe
 */
function getVideoInfo(filename) {
    if (!filename) {
        console.error('❌ Please provide a video filename');
        console.log('💡 Usage: npm run video:info <filename>');
        process.exit(1);
    }

    // Check if file exists
    if (!fs.existsSync(filename)) {
        console.error(`❌ File not found: ${filename}`);
        process.exit(1);
    }

    console.log(`📹 Analyzing: ${filename}`);
    console.log('');

    try {
        // Get basic video stream info
        const videoInfo = execSync(
            `ffprobe -v error -select_streams v:0 -show_entries stream=width,height,codec_name,bit_rate,duration -of csv=p=0:s=x "${filename}"`,
            { encoding: 'utf8' }
        ).trim();

        // Get file size
        const stats = fs.statSync(filename);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        // Parse video info
        const [width, height, codec, bitrate, duration] = videoInfo.split('x');

        console.log('📊 Video Information:');
        console.log('=====================');
        console.log(`📐 Resolution: ${width}x${height}`);
        console.log(`🎥 Codec: ${codec}`);
        console.log(`⚡ Bitrate: ${bitrate ? (parseInt(bitrate) / 1000).toFixed(0) + ' kbps' : 'Unknown'}`);
        console.log(`⏱️  Duration: ${duration ? parseFloat(duration).toFixed(1) + 's' : 'Unknown'}`);
        console.log(`📦 File Size: ${fileSizeMB} MB`);

        // Get audio info if available
        try {
            const audioInfo = execSync(
                `ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,bit_rate -of csv=p=0:s=x "${filename}"`,
                { encoding: 'utf8' }
            ).trim();

            if (audioInfo) {
                const [audioCodec, audioBitrate] = audioInfo.split('x');
                console.log('');
                console.log('🔊 Audio Information:');
                console.log('=====================');
                console.log(`🎵 Codec: ${audioCodec}`);
                console.log(`⚡ Bitrate: ${audioBitrate ? (parseInt(audioBitrate) / 1000).toFixed(0) + ' kbps' : 'Unknown'}`);
            }
        } catch (error) {
            console.log('');
            console.log('🔇 No audio track found');
        }

        console.log('');
        console.log('✅ Analysis complete');

    } catch (error) {
        console.error('❌ Error analyzing video:', error.message);
        console.error('💡 Make sure ffprobe is installed and in your PATH');
        process.exit(1);
    }
}

// Get filename from command line arguments
const filename = process.argv[2];
getVideoInfo(filename); 