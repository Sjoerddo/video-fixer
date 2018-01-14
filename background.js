chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const { type } = request;

    if (type === 'options') {
        const options = getOptions();
        sendResponse({ options });
    }
});

function getOptions() {
    return JSON.parse(localStorage.getItem('options')) || { alignment: 'top', closeAfterEnding: false };
}
