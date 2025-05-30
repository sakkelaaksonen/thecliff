# video compression ffmpeg cheat sheet

## compress video to 1280p
ffmpeg -i teaser.mp4 -vf "scale=1280:-1" -c:v libx264 -preset slow -crf 23 -c:a aac -b:a 128k -movflags +faststart teaser-small.mp4

## compress video to 720p
ffmpeg -i teaser.mp4 -vf "scale=1280:-1" -c:v libx264 -preset slow -crf 23 -c:a aac -b:a 128k -movflags +faststart teaser-small.mp4

## compress video to 480p
ffmpeg -i teaser.mp4 -vf "scale=854:-1" -c:v libx264 -preset slow -crf 23 -c:a aac -b:a 128k -movflags +faststart teaser-small.mp4






## show video metadata
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,codec_type,codec_name -of default=noprint_wrappers=1:nokey=1 teaser.mp4




