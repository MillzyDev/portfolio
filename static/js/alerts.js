// Hate. Let me tell you how much I've come to hate JavaScript since I began to live. 
// There are 528 thousand miles of grown neurons in micron thin layers that fill my brain. 
// If the word 'hate' was engraved on each nanoangstrom of those hundreds of thousands of miles it 
// would not equal one one-billionth of the hate I feel for JavaScript at this micro-instant. 
// For Brendan Eich. Hate. Hate.

function alerts_contentLoaded() {
    const notes = document.getElementsByClassName("markdown-alert-note")
    for (let note of notes) {
        const heading = document.createElement("pre");
        heading.innerText = "[!] Note";
        heading.className = "jetbrains-mono-bold alert-heading"
        note.prepend(heading);
    }

    const tips = document.getElementsByClassName("markdown-alert-tip")
    for (let tip of tips) {
        const heading = document.createElement("pre");
        heading.innerText = "[!] Tip";
        heading.className = "jetbrains-mono-bold alert-heading"
        tip.prepend(heading);
    }

    const importants = document.getElementsByClassName("markdown-alert-important")
    for (let important of importants) {
        const heading = document.createElement("pre");
        heading.innerText = "[!] Important";
        heading.className = "jetbrains-mono-bold alert-heading"
        important.prepend(heading);
    }

    const warnings = document.getElementsByClassName("markdown-alert-warning")
    for (let warning of warnings) {
        const heading = document.createElement("pre");
        heading.innerText = "[!] Warning";
        heading.className = "jetbrains-mono-bold alert-heading"
        warning.prepend(heading);
    }

    const cautions = document.getElementsByClassName("markdown-alert-caution")
    for (let caution of cautions) {
        const heading = document.createElement("pre");
        heading.innerText = "[!] Caution";
        heading.className = "jetbrains-mono-bold alert-heading"
        caution.prepend(heading);
    }
}

document.addEventListener("DOMContentLoaded", alerts_contentLoaded)