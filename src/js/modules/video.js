/**
 * Video Control Module
 * Handles background video sound toggle
 */
 const VideoControl = {
    elements: {
        bgVideo: null,
        soundToggle: null,
        soundOnIcon: null,
        soundOffIcon: null
    },

    init() {
        this.elements.bgVideo = document.getElementById('bgVideo');
        this.elements.soundToggle = document.getElementById('soundToggle');
        this.elements.soundOnIcon = document.getElementById('soundOnIcon');
        this.elements.soundOffIcon = document.getElementById('soundOffIcon');

        if (this.elements.soundToggle && this.elements.bgVideo) {
            this.bindEvents();
        }
    },

    bindEvents() {
        this.elements.soundToggle.addEventListener('click', this.toggleSound.bind(this));
    },

    toggleSound() {
        if (this.elements.bgVideo.muted) {
            this.elements.bgVideo.muted = false;
            this.elements.soundOffIcon.classList.add('hidden');
            this.elements.soundOnIcon.classList.remove('hidden');
        } else {
            this.elements.bgVideo.muted = true;
            this.elements.soundOnIcon.classList.add('hidden');
            this.elements.soundOffIcon.classList.remove('hidden');
        }
    }
}; 

export default VideoControl;