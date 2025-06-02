document.addEventListener('DOMContentLoaded', () => {
    const drumPads = document.querySelectorAll('.drum-pad');
    const repeatButton = document.getElementById('repeat-button');
    const statusMessage = document.getElementById('status-message');

    let recordedSequence = [];
    let startTime = null;
    let isPlayingBack = false;
    let playbackTimeouts = []; // To store timeout IDs for potential clearing

    // Function to play a sound
    function playSound(soundId) {
        const audio = document.getElementById(soundId);
        const pad = document.querySelector(`.drum-pad[data-sound="${soundId}"]`);
        if (!audio) {
            console.error(`Audio element with id "${soundId}" not found.`);
            return;
        }
        audio.currentTime = 0; // Rewind to the start
        audio.play();

        // Visual feedback
        if (pad) {
            pad.classList.add('playing');
            setTimeout(() => {
                pad.classList.remove('playing');
            }, 150); // Duration of the visual effect
        }
    }

    // Attach event listeners to drum pads
    drumPads.forEach(pad => {
        pad.addEventListener('click', () => {
            if (isPlayingBack) return; // Don't record if currently playing back

            const soundId = pad.dataset.sound;
            playSound(soundId);

            if (startTime === null) {
                startTime = performance.now(); // Get high-resolution timestamp
                recordedSequence.push({ soundId, time: 0 });
            } else {
                const timeOffset = performance.now() - startTime;
                recordedSequence.push({ soundId, time: timeOffset });
            }
            statusMessage.textContent = "Recording...";
            // console.log('Recorded:', recordedSequence);
        });
    });

    // Reset sequence and prepare for new recording
    function resetSequence() {
        recordedSequence = [];
        startTime = null;
        isPlayingBack = false;
        repeatButton.disabled = false;
        statusMessage.textContent = "點擊爵士鼓演奏後，再點擊Repeat按鈕，會自動重複演奏.";
        // Clear any pending timeouts if reset is called prematurely (e.g., by user action later)
        playbackTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        playbackTimeouts = [];
    }

    // Event listener for the repeat button
    repeatButton.addEventListener('click', () => {
        if (recordedSequence.length === 0 || isPlayingBack) {
            statusMessage.textContent = recordedSequence.length === 0 ? "Nothing to repeat." : "Already playing...";
            return;
        }

        isPlayingBack = true;
        repeatButton.disabled = true;
        statusMessage.textContent = "Playing back...";
        playbackTimeouts = []; // Clear previous timeouts

        let totalPlaybackTime = 0;

        recordedSequence.forEach(note => {
            const timeoutId = setTimeout(() => {
                playSound(note.soundId);
            }, note.time);
            playbackTimeouts.push(timeoutId);
            if (note.time > totalPlaybackTime) {
                totalPlaybackTime = note.time;
            }
        });

        // After the last sound has been scheduled to play, schedule the reset
        // Add a small buffer (e.g., 200ms) after the last note to ensure it finishes playing
        const resetTimeoutId = setTimeout(() => {
            resetSequence();
        }, totalPlaybackTime + 200); // Add a little buffer
        playbackTimeouts.push(resetTimeoutId);
    });

    // Initial state
    resetSequence();
});