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

    if (window.location.href.includes('/mediabase/')) {
        setTimeout(() => {
            const fixer = getFixer();
            window.addEventListener('scroll', () => {
                fixer.onScroll();
            });
        }, 4000);
    } else {
        chrome.runtime.sendMessage({ type: 'get' }, ({ video }) => {

            const style = { position: 'fixed', top: '0', right: '0', 
            'z-index': 9990, 'background-color': 'black'};

            // Check if there is nothing in storage
            if (video.url != null) {
                console.log(video);
                initializeVideo(document.body, video, Width, Height, style);
            }
        });
    }

    function initializeVideo(parent, videoLocal, width, height, style) {
        const container = document.createElement('container');
        const video = document.createElement('video');
        parent.appendChild(container);
        loopStyles(container, { overflow: 'auto', position: 'fixed', top: '0', right: '0'})
        container.appendChild(video);

        // Add close button
        var button = document.createElement('close');
        button.innerHTML = '✖';
        loopStyles(button, {'background-color': 'transperant', 
            position: 'fixed', top: '0px', right: '5px',
            color: 'white', 'z-index': 9991, 'font-size': '20px' });
        container.appendChild(button);
        
        button.addEventListener ('click', function() {
          container.removeChild(video);
          container.removeChild(button);
          chrome.runtime.sendMessage({ type: 'set', video: {} });
        });

        video.width = width;
        video.height = height;
        loopStyles(video, style);
        video.src = videoLocal.url;
        video.controls = 'controls';
        video.currentTime = videoLocal.time;
        video.volume = videoLocal.volume;

        if (!videoLocal.isPaused) 
            video.play();
    }

    function loopStyles(el, styles) {
        Object.keys(styles).forEach((prop) => {
            el.style[prop] = styles[prop];
        });
    }

    function getFixer() {
        const { append, original } = Settings;
        const { width, height } = original;
        const video = document.querySelector('video');

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
    const volume = video.volume;
    const isPaused = video.paused;

    if (time && url) {
        chrome.runtime.sendMessage({ type: 'set', video: { time, url, volume, isPaused } });
    }
};
