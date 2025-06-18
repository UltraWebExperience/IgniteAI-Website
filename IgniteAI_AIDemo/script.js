document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded: Initializing AI Demo script.");

    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const chatHistoryDisplay = document.getElementById('chat-history-display');
    const newChatBtn = document.getElementById('new-chat-btn');
    const dailyLimitMessage = document.getElementById('daily-limit-message');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const chatSessionTitle = document.getElementById('chat-session-title');


    const MAX_QUERIES_PER_DAY = 10; // Set your daily query limit here

    let chatHistory = []; // Stores the full chat conversation for API
    let demoQueryCount = 0; // Tracks queries for the daily limit

    // --- Theme Toggle ---
    function setTheme(theme) {
        console.log(`Setting theme to: ${theme}`);
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggleBtn.textContent = '🌙'; // Moon icon for dark mode
        } else {
            document.body.classList.remove('dark-theme');
            themeToggleBtn.textContent = '☀️'; // Sun icon for light mode
        }
    }

    // Apply saved theme on load (for the demo page itself)
    const savedTheme = localStorage.getItem('igniteAiDemoTheme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme('light'); // Default to light if no theme saved
    }

    // Event listener for theme toggle button
    themeToggleBtn.addEventListener('click', () => {
        console.log("Theme toggle button clicked.");
        if (document.body.classList.contains('dark-theme')) {
            setTheme('light');
            localStorage.setItem('igniteAiDemoTheme', 'light');
        } else {
            setTheme('dark');
            localStorage.setItem('igniteAiDemoTheme', 'dark');
        }
    });

    // --- Daily Query Limit Management ---
    function getTodayDateString() {
        return new Date().toISOString().slice(0, 10); //YYYY-MM-DD
    }

    function loadDailyLimit() {
        console.log("Loading daily limit...");
        const storedCount = localStorage.getItem('igniteAiDemoQueryCount');
        const storedDate = localStorage.getItem('igniteAiDemoLastQueryDate');
        const today = getTodayDateString();

        if (storedDate === today) {
            demoQueryCount = parseInt(storedCount || '0');
            console.log(`Loaded count for today (${today}): ${demoQueryCount}`);
        } else {
            // New day, reset count
            console.log(`New day detected. Resetting count from ${storedDate} to ${today}.`);
            demoQueryCount = 0;
            localStorage.setItem('igniteAiDemoLastQueryDate', today);
            localStorage.setItem('igniteAiDemoQueryCount', demoQueryCount); // Also reset count in storage immediately
        }
        updateLimitMessage();
    }

    function incrementDailyLimit() {
        demoQueryCount++;
        localStorage.setItem('igniteAiDemoQueryCount', demoQueryCount);
        localStorage.setItem('igniteAiDemoLastQueryDate', getTodayDateString()); // Ensure date is updated on each query
        console.log(`Query count incremented to: ${demoQueryCount}`);
        updateLimitMessage();
    }

    function updateLimitMessage() {
        console.log(`Updating limit message. Current count: ${demoQueryCount}, Max: ${MAX_QUERIES_PER_DAY}`);
        if (demoQueryCount >= MAX_QUERIES_PER_DAY) {
            dailyLimitMessage.style.display = 'block';
            userInput.disabled = true;
            sendBtn.disabled = true;
            userInput.placeholder = "Daily limit reached. Try again tomorrow.";
            console.log("Daily limit reached. Input disabled.");
        } else {
            dailyLimitMessage.style.display = 'none';
            userInput.disabled = false;
            sendBtn.disabled = false;
            userInput.placeholder = "Ask anything";
            console.log("Daily limit not reached. Input enabled.");
        }
    }

    // --- Chat Display Functions ---
    // This function will now parse Markdown before appending to innerHTML
    function addMessageToChat(message, sender) {
        console.log(`Adding message to chat. Sender: ${sender}, Message: "${message.substring(0, 50)}..."`);
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', `${sender}-message`);

        if (sender === 'ai') {
            // Use marked.parse() to convert Markdown to HTML
            messageDiv.innerHTML = marked.parse(message);
        } else {
            // For user messages, just wrap in a paragraph
            messageDiv.innerHTML = `<p>${message}</p>`;
        }

        chatHistoryDisplay.appendChild(messageDiv);
        chatHistoryDisplay.scrollTop = chatHistoryDisplay.scrollHeight;
    }

    function showLoadingIndicator() {
        console.log("Showing loading indicator.");
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('chat-message', 'loading-indicator');
        loadingDiv.innerHTML = `<div class="spinner"></div><p>Ignite AI is thinking...</p>`;
        chatHistoryDisplay.appendChild(loadingDiv);
        chatHistoryDisplay.scrollTop = chatHistoryDisplay.scrollHeight;
    }

    function removeLoadingIndicator() {
        console.log("Removing loading indicator.");
        const loadingDiv = chatHistoryDisplay.querySelector('.loading-indicator');
        if (loadingDiv) {
            chatHistoryDisplay.removeChild(loadingDiv);
        }
    }

    function showTemporaryMessage(message, type = 'error') {
        console.log(`Showing temporary message: "${message}" (Type: ${type})`);
        let tempMessageDiv = document.createElement('div');
        tempMessageDiv.classList.add('chat-message');
        if (type === 'error') {
            tempMessageDiv.classList.add('user-message'); // Using user-message for error styling
            tempMessageDiv.style.background = 'var(--accent-color)'; // Reddish color
        } else { // 'warning' or other non-critical
            tempMessageDiv.classList.add('ai-message'); // Using ai-message for warning styling
            tempMessageDiv.style.background = 'rgba(0, 123, 255, 0.8)'; // Blueish for warnings
            tempMessageDiv.style.color = 'white';
        }
        tempMessageDiv.style.maxWidth = 'fit-content';
        tempMessageDiv.style.alignSelf = 'center';
        tempMessageDiv.textContent = message;
        chatHistoryDisplay.appendChild(tempMessageDiv);
        chatHistoryDisplay.scrollTop = chatHistoryDisplay.scrollHeight;

        setTimeout(() => {
            console.log("Removing temporary message after 5 seconds.");
            if (tempMessageDiv.parentNode) {
                tempMessageDiv.parentNode.removeChild(tempMessageDiv);
            }
        }, 5000);
    }


    // --- AI Interaction Logic ---
    async function sendQuery() {
        console.log("sendQuery function called.");
        // Clear any previous temporary messages before processing new query
        const existingTempMessage = chatHistoryDisplay.querySelector('.chat-message[style*="max-width: fit-content"]');
        if (existingTempMessage) {
            existingTempMessage.parentNode.removeChild(existingTempMessage);
        }

        const prompt = userInput.value.trim();
        if (!prompt) {
            showTemporaryMessage("Please type your question or prompt.", 'warning');
            console.log("Prompt is empty. Aborting query.");
            return;
        }

        if (demoQueryCount >= MAX_QUERIES_PER_DAY) {
            showTemporaryMessage("Daily demo limit reached. Please try again tomorrow.", 'error');
            console.log("Daily limit reached. Aborting query.");
            return;
        }

        addMessageToChat(prompt, 'user');
        userInput.value = ''; // Clear input immediately
        userInput.style.height = '50px'; // Reset textarea height

        showLoadingIndicator();
        sendBtn.disabled = true; // Disable button while AI is thinking

        // Ensure chatHistory is correctly structured for the API call
        // The API expects 'user' and 'model' roles.
        // We ensure we only add valid roles to the history sent to the API.
        const apiChatHistory = chatHistory.filter(msg => msg.role === 'user' || msg.role === 'model');
        apiChatHistory.push({ role: "user", parts: [{ text: prompt }] });
        console.log("Chat history prepared for API call:", JSON.stringify(apiChatHistory));


        const payload = { contents: apiChatHistory };
        // YOUR API KEY IS HERE
        const apiKey = "AIzaSyBdxuyUlqY-2dUEWMlg8To76pRbgD4wMMs"; // THIS IS YOUR PROVIDED API KEY
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        console.log("API URL:", apiUrl);
        console.log("Request Payload (contents only):", JSON.stringify(payload.contents));


        try {
            console.log("Attempting to fetch from API...");
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            console.log("Fetch response received:", response.status, response.statusText);

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API HTTP Error Response Data:", errorData);
                const apiErrorMessage = errorData.error && errorData.error.message ? `API Error: ${errorData.error.message}` : `HTTP Error: ${response.status} ${response.statusText}`;
                showTemporaryMessage(`${apiErrorMessage}. Please try a different prompt or consult the console.`, 'error');
                removeLoadingIndicator();
                sendBtn.disabled = false;
                return;
            }

            const result = await response.json();
            console.log("AI Raw Response (JSON):", result);
            removeLoadingIndicator();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const aiText = result.candidates[0].content.parts[0].text;
                addMessageToChat(aiText, 'ai'); // Now `addMessageToChat` will parse Markdown
                // Add AI response to local chat history for context in subsequent queries
                chatHistory.push({ role: "model", parts: [{ text: aiText }] });
                incrementDailyLimit(); // Increment count only on successful AI response
                console.log("AI response successfully displayed and count incremented.");
            } else {
                addMessageToChat("Error: Could not get a valid response from AI. The response might be empty or in an unexpected format.", 'ai');
                console.error("AI response structure unexpected or empty content:", result);
                showTemporaryMessage("AI response error. Please try a different prompt or check console for details.", 'error');
            }
        } catch (error) {
            removeLoadingIndicator();
            console.error("Fetch/Network Error:", error);
            addMessageToChat("Error: Failed to connect to AI. Please check your network connection or try again later.", 'ai');
            showTemporaryMessage("Network error. Ensure you're online and try again.", 'error');
        } finally {
            sendBtn.disabled = false; // Re-enable button
            console.log("sendQuery function finished. Button re-enabled.");
        }
    }

    // --- Event Listeners ---
    sendBtn.addEventListener('click', sendQuery);
    console.log("Send button event listener attached.");

    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) { // Allow Shift+Enter for new line
            event.preventDefault(); // Prevent default Enter key behavior (new line)
            sendQuery();
            console.log("Enter key pressed (non-Shift). sendQuery called.");
        }
    });
    console.log("User input keydown event listener attached.");

    // Auto-resize textarea based on content
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto'; // Reset height to recalculate
        userInput.style.height = userInput.scrollHeight + 'px';
        // console.log("Textarea resized. Current height:", userInput.style.height); // Log for debugging
    });
    console.log("User input 'input' event listener for auto-resize attached.");


    newChatBtn.addEventListener('click', () => {
        console.log("New chat button clicked.");
        chatHistory = []; // Clear chat history for new conversation
        chatHistoryDisplay.innerHTML = `
            <div class="chat-message ai-message initial-ai-message">
                <p>Hello! I'm Ignite AI, your interactive demo. What can I help you with today?</p>
            </div>
        `;
        userInput.value = ''; // Clear input
        userInput.style.height = '50px'; // Reset textarea height
        loadDailyLimit(); // Reload daily limit status (it might be a new day)
        console.log("New chat initiated.");
    });
    console.log("New chat button event listener attached.");

    // Sidebar toggle functionality
    sidebarToggle.addEventListener('click', () => {
        console.log("Sidebar toggle button clicked.");
        sidebar.classList.toggle('collapsed');
        // Optionally adjust main chat header title visibility if needed, though CSS handles most.
        // const isCollapsed = sidebar.classList.contains('collapsed');
        // chatSessionTitle.style.opacity = isCollapsed ? '0' : '1';
        // console.log(`Sidebar collapsed status: ${isCollapsed}`);
    });
    console.log("Sidebar toggle event listener attached.");

    // --- Initial Load ---
    loadDailyLimit(); // Check daily limit status on page load
    console.log("Initial daily limit check performed.");
});
