const Type = {
    Append: 'appendStyle',
    Original: 'originalStyle'
};

class VideoFixer {
    constructor(video, player, toAppend, toRemove, nodes) {
        this.video = video;
        this.player = player;
        this.toAppend = toAppend;
        this.toRemove = toRemove;
        this.nodes = nodes;
        this.playerStyle = this.player.style;
        this.appended = false;
    }

    onScroll() {
        const line = window.outerHeight * 0.62;
        const { scrollTop, clientTop } = document.documentElement;
        const top = (window.pageYOffset || scrollTop) - (clientTop || 0);

        if (this.appended && top <= line) {
            this._remove();
        } else if (!this.appended && top > line) {
            this._append();
        }
    }

    _append() {
        this.video.style.width = this.toAppend.width;
        this.video.style.height = this.toAppend.height;

        Object.keys(this.toAppend).forEach((prop) => {
            this.player.style[prop] = this.toAppend[prop];
        });

        this._loopNodes(Type.Append);
        this.appended = true;
    }

    _remove() {
        this.video.style.width = this.toRemove.width;
        this.video.style.height = this.toRemove.height;
        this.player.style = this.playerStyle;

        this._loopNodes(Type.Original);
        this.appended = false;
    }

    _loopNodes(type) {
        if (this.nodes) {
            this.nodes.forEach((node) => {
                Object.keys(node[type]).forEach((prop) => {
                    node.el.style[prop] = node[type][prop];
                });
            });
        }
    }
}

(() => {
    const Width = window.outerWidth * 0.3125;
    const Height = Width * 0.5620;
    const Settings = {
        append: { width: Width + 'px', height: Height + 'px' },
        original: { width: '854px', height: '480px' }
    };
    const FixedStyle = {
        backgroundColor: 'black',
        position: 'fixed',
        top: '0',
        right: '0',
        'z-index': 9990
    };

    const appendFixedStyle = el => appendStyles(el, FixedStyle);
    const isEmbedded = url => url.includes('youtube.com/embed/');

    if (window.location.href.includes('/mediabase/')) {
        setTimeout(() => {
            const fixer = getFixer();

            if (fixer !== null) {
                window.addEventListener('scroll', () => {
                    fixer.onScroll();
                });
            }
        }, 4000);
    } else {
        chrome.runtime.sendMessage({ type: 'get' }, (response) => {
            const videoSettings = response.video;
            const { url } = videoSettings;

            // Check if there is nothing in storage
            if (url === undefined) return;

            if (isEmbedded(url)) {
                initializeFrame(document.body, Width, Height, createEmbeddedUrl(url));
            } else {
                initializeVideo(document.body, Width, Height, videoSettings);
            }
        });
    }

    function initializeVideo(parent, width, height, settings) {
        const container = document.createElement('section');
        const video = createVideo(width, height, settings);
        parent.appendChild(container);
        appendFixedStyle(container);
        container.appendChild(video);

        container.appendChild(createCloseButton(() => {
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            chrome.runtime.sendMessage({ type: 'set', video: {} });
        }));

        if (!settings.isPaused) video.play();
    }

    function initializeFrame(parent, width, height, src) {
        const frame = document.createElement('iframe');
        appendFixedStyle(frame);
        frame.id = 'fixed-player';
        frame.width = width;
        frame.height = height;
        frame.src = src;
        parent.appendChild(frame);
    }

    function createEmbeddedUrl(src) {
        const parser = document.createElement('a');
        parser.href = src;
        const path = parser.pathname;
        const videoId = path.split('/')[2];
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }

    function createCloseButton(onclick) {
        const button = document.createElement('a');
        button.innerHTML = '✖';
        appendStyles(button, {
            backgroundColor: 'transparent', position: 'fixed', top: '0px', cursor: 'pointer',
            right: '5px', color: 'white', 'z-index': 9991, fontSize: '20px'
        });
        button.addEventListener('click', onclick);
        return button;
    }

    function createVideo(width, height, settings) {
        const video = document.createElement('video');
        video.width = width;
        video.height = height;
        video.src = settings.url;
        video.controls = 'controls';
        video.currentTime = settings.time;
        video.volume = settings.volume;
        return video;
    }

    function appendStyles(el, styles) {
        Object.keys(styles).forEach((prop) => {
            el.style[prop] = styles[prop];
        });
    }

    function getFixer() {
        const { append, original } = Settings;
        const { width, height } = original;
        const video = document.querySelector('video');
        if (!video) return null;

        const player = document.querySelector('.dump-player');
        const config = createConfig(append.width, append.height);
        const nodes = [{
            el: document.querySelector('article'),
            appendStyle: { height: '473px' },
            originalStyle: { height: '638.984px' }
        }];

        return new VideoFixer(video, player, config, { width, height }, nodes);
    }

    function createConfig(width, height, offsetTop, offsetRight) {
        return {
            position: 'fixed',
            width: width,
            height: height,
            top: offsetTop || '0',
            right: offsetRight || '0',
            'z-index': 9990
        };
    }
})();

window.onunload = () => {
    const video = document.getElementsByTagName('video')[0] || document.querySelector('iframe');
    const time = video.currentTime;
    const url = video.src;
    const duration = video.duration;
    const volume = video.volume;
    const isPaused = video.paused;

    // Video has ended
    if (time && duration && time === duration) {
        chrome.runtime.sendMessage({ type: 'set', video: {} });
    } else if (url) {
        chrome.runtime.sendMessage({ type: 'set', video: { time, url, volume, isPaused } });
    }
};
