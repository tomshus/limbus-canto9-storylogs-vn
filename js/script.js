const ICONS_PATH = "../assets/icons/";
const PLAY_IMAGE = `${ICONS_PATH}playbutton.webp`;
const PAUSE_IMAGE = `${ICONS_PATH}pausebutton.webp`;
const VOICES_PATH = "../assets/voices";

// EAGER/LAZY IMG LOADING + BACKGROUND-IMAGE PRELOAD
document.addEventListener('DOMContentLoaded', () => {
    // Set loading attributes
    try {
        const imgs = Array.from(document.images || []);
        imgs.forEach((img, idx) => {
            if (idx < 4) {
                img.setAttribute('loading', 'eager');
            } else {
                if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
            }
        });
    } catch (e) {
        console.warn('Error applying eager/lazy loading to images', e);
    }

    // rel preload
    try {
        const styleEls = Array.from(document.querySelectorAll('[style*="background-image"]'));
        styleEls.forEach(el => {
            const style = el.getAttribute('style') || '';
            const m = style.match(/background-image\s*:\s*url\((['"]?)([^'"\)]+)\1\)/i);
            if (!m) return;
            const url = m[2];
            const href = new URL(url, location.href).href;

            const already = Array.from(document.querySelectorAll('link[rel="preload"][as="image"]')).some(l => {
                try { return new URL(l.href, location.href).href === href; } catch { return l.href === href; }
            });

            if (!already) {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'image';
                link.href = href;
                document.head.appendChild(link);
            }
        });
    } catch (e) {
        console.warn('Error preloading background-image(s)', e);
    }

    // Preload none media controls
    try {
        const mediaControls = Array.from(document.querySelectorAll('audio[controls], video[controls]'));
        mediaControls.forEach(media => {
            if (!media.hasAttribute('preload')) {
                media.setAttribute('preload', 'none');
            }
        });
    } catch (e) {
        console.warn('Error applying preload="none" to media controls', e);
    }
});

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

// GLOBAL AUDIO 
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