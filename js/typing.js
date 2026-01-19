// Typing animation for home page

const quotes = [
    "Building resilient systems in an insecure world.",
    "Cybersecurity beyond compliance.",
    "Designing trust in digital systems.",
    "Security as an enabler, not a blocker.",
    "Working at the intersection of risk and resilience."
];

let currentQuoteIndex = 0;
let currentCharIndex = 0;
let isDeleting = false;
let isPaused = false;

const typedTextElement = document.getElementById('typed-text');
const typingSpeed = 80;        // Speed when typing
const deletingSpeed = 50;      // Speed when deleting
const pauseAfterTyping = 2000; // Pause after finishing typing
const pauseAfterDeleting = 500; // Pause after finishing deleting

function type() {
    const currentQuote = quotes[currentQuoteIndex];

    if (isPaused) {
        return;
    }

    if (!isDeleting) {
        // Typing characters
        typedTextElement.textContent = currentQuote.substring(0, currentCharIndex + 1);
        currentCharIndex++;

        if (currentCharIndex === currentQuote.length) {
            // Finished typing this quote
            isDeleting = true;
            isPaused = true;
            setTimeout(() => {
                isPaused = false;
                type();
            }, pauseAfterTyping);
            return;
        }
    } else {
        // Deleting characters
        typedTextElement.textContent = currentQuote.substring(0, currentCharIndex - 1);
        currentCharIndex--;

        if (currentCharIndex === 0) {
            // Finished deleting, move to next quote
            isDeleting = false;
            currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
            isPaused = true;
            setTimeout(() => {
                isPaused = false;
                type();
            }, pauseAfterDeleting);
            return;
        }
    }

    // Schedule next character
    const speed = isDeleting ? deletingSpeed : typingSpeed;
    setTimeout(type, speed);
}

// Start the typing animation
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(type, 500); // Small initial delay
});
