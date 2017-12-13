chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const { type } = request;

    if (type === 'options') {
        const options = JSON.parse(localStorage.getItem('options'));
        sendResponse({ options });
    }
});
