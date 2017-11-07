chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const key = 'video';
    const { type, video } = request;

    if (type === 'set') {
        localStorage.setItem(key, JSON.stringify(video));
        console.log(video);
        sendResponse({});
    } else if (type === 'get') {
        const savedVideo = JSON.parse(localStorage.getItem(key));
        console.log(savedVideo);
        sendResponse({ video: savedVideo });
    }
});
