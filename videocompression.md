# video compression ffmpeg cheat sheet

## compress video to 1280p
ffmpeg -i teaser.mp4 -vf "scale=1280:-1" -c:v libx264 -preset slow -crf 23 -c:a aac -b:a 128k -movflags +faststart teaser-small.mp4

## compress video to 720p
ffmpeg -i teaser.mp4 -vf "scale=1280:-1" -c:v libx264 -preset slow -crf 23 -c:a aac -b:a 128k -movflags +faststart teaser-small.mp4

## compress video to 480p
ffmpeg -i teaser.mp4 -vf "scale=854:-1" -c:v libx264 -preset slow -crf 23 -c:a aac -b:a 128k -movflags +faststart teaser-small.mp4











