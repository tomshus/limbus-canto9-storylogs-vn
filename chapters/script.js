const PLAY_IMAGE = "../assets/icons/playbutton.png";
const PAUSE_IMAGE = "../assets/icons/pausebutton.png";

// Get all voice containers
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

    // Function to handle the toggle
    function toggleAudio() {
        if (audio.paused) {
            audio.play();
            icon.src = PAUSE_IMAGE;
        } else {
            audio.pause();
            icon.src = PLAY_IMAGE;
        }
    }

    // Add click event listener to the button
    btn.addEventListener('click', toggleAudio);

    // If the audio ends naturally, switch back to the play icon
    audio.addEventListener('ended', () => {
        icon.src = PLAY_IMAGE;
    });
});