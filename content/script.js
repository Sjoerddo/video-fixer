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
            const style = { position: 'fixed', top: '0', right: '0', 'z-index': 9990 };
            initializeVideo(document.body, video.url, Width, Height, style, video.time);
        });
    }

    function initializeVideo(parent, src, width, height, style, time) {
        const video = document.createElement('video');
        parent.appendChild(video);

        video.width = width;
        video.height = height;
        loopStyles(video, style);
        video.src = src;
        video.controls = 'controls';
        video.currentTime = time;

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

    if (time && url) {
        chrome.runtime.sendMessage({ type: 'set', video: { time, url } });
    }
};
