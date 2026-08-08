const ICONS_PATH = "../assets/icons/";
const PLAY_IMAGE = `${ICONS_PATH}playbutton.webp`;
const PAUSE_IMAGE = `${ICONS_PATH}pausebutton.webp`;
const VOICES_PATH = "../assets/voices";

// PLYR INJECTION & CONFIG LOGIC 
(function() {
    if (!document.querySelector('link[href*="plyr.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.plyr.io/3.8.4/plyr.css';
        document.head.appendChild(link);
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.plyr.io/3.8.4/plyr.js';
    script.onload = () => {
        // Initialize Plyr for background music
        const players = Plyr.setup('audio[controls]:not(.voice)', {
            // Options
        });

        players.forEach(instance => {
            const audio = instance.media; 

            audio.volume = 0.4;            
            audio.loop = true;

            // Ensure only one player at a time
            instance.on('play', () => {
                players.forEach(otherInstance => {
                    if (otherInstance !== instance) {
                        otherInstance.pause();
                    }
                });
            });
        });
    };
    document.body.appendChild(script);
})();

// Update all icon img sources
document.querySelectorAll('td.icon img').forEach(img => {
    const currentSrc = img.getAttribute('src');
    if (currentSrc) {
        img.setAttribute('src', `${ICONS_PATH}${currentSrc}`);
    }
});

// Global audio 
const sharedVoiceAudio = new Audio();
sharedVoiceAudio.preload = 'none';
sharedVoiceAudio.volume = 1.0;
let activeVoiceButton = null;
let activeVoiceSrc = null;

sharedVoiceAudio.addEventListener('ended', () => {
    if (activeVoiceButton) {
        const icon = activeVoiceButton.querySelector('.status-icon');
        if (icon) {
            icon.src = PLAY_IMAGE;
        }
    }
    activeVoiceButton = null;
    activeVoiceSrc = null;
});

sharedVoiceAudio.addEventListener('pause', () => {
    if (activeVoiceButton && sharedVoiceAudio.src && sharedVoiceAudio.paused) {
        const icon = activeVoiceButton.querySelector('.status-icon');
        if (icon) {
            icon.src = PLAY_IMAGE;
        }
    }
});

document.querySelectorAll('.voice-container').forEach(container => {
    let voiceSrc = container.dataset.voice;
    if (!voiceSrc) {
        return;
    }

    // create play button 'cause i'm lazy
    let btn = container.querySelector('.voice-btn');
    if (!btn) {
        btn = document.createElement('button');
        btn.className = 'voice-btn';

        const icon = document.createElement('img');
        icon.className = 'status-icon';
        icon.src = PLAY_IMAGE;

        btn.appendChild(icon);
        container.appendChild(btn);
    }

    const icon = container.querySelector('.status-icon');

    function toggleAudio() {
        const fullUrl = `${VOICES_PATH}/${voiceSrc}`;
        const sameVoice = activeVoiceSrc === voiceSrc && sharedVoiceAudio.src.endsWith(voiceSrc);

        if (!sameVoice || sharedVoiceAudio.paused) {
            if (activeVoiceButton && activeVoiceButton !== btn) {
                const oldIcon = activeVoiceButton.querySelector('.status-icon');
                if (oldIcon) {
                    oldIcon.src = PLAY_IMAGE;
                }
            }

            sharedVoiceAudio.src = fullUrl;
            activeVoiceButton = btn;
            activeVoiceSrc = voiceSrc;
            sharedVoiceAudio.play().then(() => {
                if (icon) {
                    icon.src = PAUSE_IMAGE;
                }
            }).catch(() => {
                if (icon) {
                    icon.src = PLAY_IMAGE;
                }
            });
        } else {
            sharedVoiceAudio.pause();
            if (icon) {
                icon.src = PLAY_IMAGE;
            }
            activeVoiceButton = null;
            activeVoiceSrc = null;
        }
    }

    btn.addEventListener('click', toggleAudio);
});