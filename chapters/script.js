const ICONS_PATH = "../assets/icons/";
const PLAY_IMAGE = `${ICONS_PATH}playbutton.png`;
const PAUSE_IMAGE = `${ICONS_PATH}pausebutton.png`;
const VOICES_PATH = "../assets/voices";

// Update all voice audio sources to use the VOICES_PATH variable
document.querySelectorAll('audio.voice').forEach(audio => {
    const source = audio.querySelector('source');
    if (source) {
        const currentSrc = source.getAttribute('src');
        if (currentSrc) {
            source.setAttribute('src', `${VOICES_PATH}/${currentSrc}`);
            audio.load(); // Reload the audio element with the new source
        }
    }
});

// Update all icon img sources
document.querySelectorAll('td.icon img').forEach(img => {
    const currentSrc = img.getAttribute('src');
    if (currentSrc) {
        img.setAttribute('src', `${ICONS_PATH}${currentSrc}`);
    }
});

// Set default volume for all music (those with controls)
document.querySelectorAll('audio[controls]').forEach(audio => {
    audio.volume = 0.7;
});

// Add loop for all <audio controls>
document.querySelectorAll('audio[controls]').forEach(audio => {
    audio.loop = true;
});

// Ensure only one music player is playing at a time
document.querySelectorAll('audio[controls]').forEach(audio => {
    audio.addEventListener('play', () => {
        document.querySelectorAll('audio[controls]').forEach(otherAudio => {
            if (otherAudio !== audio) {
                otherAudio.pause();
            }
        });
    });
});

document.querySelectorAll('.voice-container').forEach(container => {
    const audio = container.querySelector('.voice');
    
    // Create button if it doesn't exist because I'm lazy to paste it everytime
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
        if (audio.paused) {
            audio.play();
            icon.src = PAUSE_IMAGE;
        } else {
            audio.pause();
            icon.src = PLAY_IMAGE;
        }
    }

    btn.addEventListener('click', toggleAudio);

    audio.addEventListener('ended', () => {
        icon.src = PLAY_IMAGE;
    });
});