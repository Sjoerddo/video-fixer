chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const key = 'item';
    const { type, item } = request;

    if (type === 'get') {
        const item = JSON.parse(localStorage.getItem(key)) || {};
        sendResponse({ item });
    } else if (type === 'set') {
        localStorage.setItem(key, JSON.stringify(item));
        sendResponse({});
    }
});
