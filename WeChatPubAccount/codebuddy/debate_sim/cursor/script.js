document.addEventListener('DOMContentLoaded', () => {
    const dialogueTextElement = document.getElementById('dialogue-text');
    const optionsAreaElement = document.getElementById('options-area');
    const resultTextElement = document.getElementById('result-text');
    const resultImageElement = document.getElementById('result-image');

    // Placeholder image URLs - replace with actual or better placeholders
    const images = {
        default: '', // No image by default
        vance_skeptical: 'placeholder_vance_skeptical.png',
        trump_displeased: 'placeholder_trump_displeased.png',
        negotiation_positive: 'placeholder_handshake.png',
        negotiation_neutral: 'placeholder_neutral_face.png',
        negotiation_negative: 'placeholder_negative.png'
    };

    const scenario = {
        start: {
            dialogue: "Senator Vance opens: \"Mr. President Zelenskyy, with all due respect, many Americans question the endless funding. We need a clear endgame. What is your realistic plan for concluding this conflict, not just continuing it?\"",
            options: [
                { text: "Emphasize shared democratic values and the global threat of inaction.", next: 'valueArgument' },
                { text: "Present a phased plan focusing on defense, resilience, and eventual negotiation from strength.", next: 'planArgument' },
                { text: "Directly counter the 'endless funding' narrative with figures on aid effectiveness and burden-sharing.", next: 'counterArgument' }
            ],
            speaker: 'Vance'
        },
        valueArgument: {
            dialogue: "Former President Trump interjects: \"Values are nice, but what about America First? Billions are going out while we have problems here. Why should our taxpayers foot the bill when Europe isn't doing enough?\"",
            options: [
                { text: "Highlight Europe's significant contributions and frame aid as a strategic investment for US security.", next: 'investmentArgument' },
                { text: "Acknowledge US domestic concerns but argue the cost of letting aggression succeed is far higher.", next: 'costOfInaction' }
            ],
            result: { text: "Vance looks thoughtful but unconvinced.", image: images.vance_skeptical },
            speaker: 'Trump'
        },
        planArgument: {
            dialogue: "Senator Vance nods slightly: \"A phased plan sounds reasonable, but the timeline and resource needs seem vast. How can you guarantee accountability for the aid provided?\"",
            options: [
                { text: "Detail existing transparency mechanisms and propose further joint oversight.", next: 'transparencyFocus' },
                { text: "Shift focus to recent battlefield successes achieved with Western support as proof of concept.", next: 'successFocus' }
            ],
            result: { text: "Trump remains impassive, arms crossed.", image: images.negotiation_neutral },
            speaker: 'Vance'
        },
        counterArgument: {
            dialogue: "Former President Trump leans forward: \"Figures can be spun. The perception is that it's a blank check. We need peace. Have you considered direct talks, concessions even, to stop the fighting NOW?\"",
            options: [
                { text: "Reiterate that negotiations are only possible when Ukraine's sovereignty isn't compromised.", next: 'sovereigntyStance' },
                { text: "Express openness to talks but only after achieving a stronger negotiating position.", next: 'negotiationTiming' }
            ],
            result: { text: "Vance seems to agree with the need for clarity, looking between you and Trump.", image: images.vance_skeptical },
            speaker: 'Trump'
        },
        // Simple Endings (could be expanded greatly)
        investmentArgument: {
            dialogue: "The discussion continues, focusing on strategic interests vs. immediate costs. The outcome remains uncertain.",
            options: [],
            result: { text: "Debate Conclusion: Focus shifted to strategic framing. Further discussion needed.", image: images.negotiation_neutral },
            speaker: 'Narrator'
        },
        costOfInaction: {
            dialogue: "Arguments about the long-term consequences dominate the rest of the exchange. No firm commitments made.",
            options: [],
            result: { text: "Debate Conclusion: Focus remained on the risks of inaction, but financial concerns persist.", image: images.negotiation_negative },
            speaker: 'Narrator'
        },
        transparencyFocus: {
            dialogue: "The conversation delves into oversight mechanisms. There's cautious optimism for improved tracking.",
            options: [],
            result: { text: "Debate Conclusion: Progress made on accountability framing. Funding decisions still pending.", image: images.negotiation_positive },
            speaker: 'Narrator'
        },
        successFocus: {
             dialogue: "Battlefield updates are discussed, but skepticism about the long-term trajectory remains.",
             options: [],
             result: { text: "Debate Conclusion: Military successes acknowledged, but long-term strategy concerns linger.", image: images.negotiation_neutral },
             speaker: 'Narrator'
        },
        sovereigntyStance: {
            dialogue: "The principle of sovereignty is defended firmly. Trump appears displeased with the lack of flexibility.",
            options: [],
            result: { text: "Debate Conclusion: Red lines drawn on sovereignty. Negotiation path seems difficult.", image: images.trump_displeased },
            speaker: 'Narrator'
        },
        negotiationTiming: {
            dialogue: "The conditional openness to talks is noted, but the path to achieving a 'stronger position' is debated intensely.",
            options: [],
            result: { text: "Debate Conclusion: Openness to future talks stated, but immediate concerns about continuation remain high.", image: images.vance_skeptical },
            speaker: 'Narrator'
        }
    };

    let currentStage = 'start';

    function updateUI() {
        const stage = scenario[currentStage];
        if (!stage) {
            console.error(`Scenario stage not found: ${currentStage}`);
            dialogueTextElement.textContent = 'Error: Scenario ended unexpectedly.';
            optionsAreaElement.innerHTML = '';
            resultTextElement.textContent = '';
            resultImageElement.style.display = 'none';
            return;
        }

        dialogueTextElement.textContent = stage.dialogue;
        optionsAreaElement.innerHTML = ''; // Clear old options

        // Display result from the *previous* choice, if any
        const previousStage = scenario[window.previousStageId]; // Need to track previous stage
        if (previousStage && previousStage.result) {
            resultTextElement.textContent = `Result: ${previousStage.result.text}`;
            if (previousStage.result.image && previousStage.result.image !== images.default) {
                resultImageElement.src = previousStage.result.image;
                resultImageElement.style.display = 'block';
            } else {
                resultImageElement.style.display = 'none';
            }
        } else {
            resultTextElement.textContent = '';
            resultImageElement.style.display = 'none';
        }
        
        // Add new options
        if (stage.options && stage.options.length > 0) {
            stage.options.forEach(option => {
                const button = document.createElement('button');
                button.textContent = option.text;
                button.onclick = () => {
                    window.previousStageId = currentStage; // Store current stage ID before changing
                    currentStage = option.next;
                    updateUI();
                };
                optionsAreaElement.appendChild(button);
            });
        } else {
            // End of this path
             if (stage.result) { // Display final result if stage has one
                 resultTextElement.textContent = stage.result.text;
                 if (stage.result.image && stage.result.image !== images.default) {
                    resultImageElement.src = stage.result.image;
                    resultImageElement.style.display = 'block';
                 } else {
                    resultImageElement.style.display = 'none';
                 }
            }
        }
    }

    window.previousStageId = null; // Initialize tracker for previous stage ID
    updateUI(); // Initial load
}); 