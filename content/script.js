const TYPE = {
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

        this._loopNodes(TYPE.Append);
        this.appended = true;
    }

    _remove() {
        this.video.style.width = this.toRemove.width;
        this.video.style.height = this.toRemove.height;
        this.player.style = this.playerStyle;

        this._loopNodes(TYPE.Original);
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

(function () {
    const YT_WIDTH = window.outerWidth * 0.36;
    const YT_HEIGHT = YT_WIDTH * 0.5625;
    const YOUTUBE_SETTINGS = {
        append: {
            width: YT_WIDTH + 'px',
            height: YT_HEIGHT + 'px'
        },
        original: {
            width: '854px',
            height: '480px'
        }
    };

    const D_WIDTH = window.outerWidth * 0.3125;
    const D_HEIGHT = D_WIDTH * 0.5620;
    const DUMPERT_SETTINGS = {
        append: {
            width: D_WIDTH + 'px',
            height: D_HEIGHT + 'px'
        },
        original: {
            width: '854px',
            height: '480px'
        }
    };

    setTimeout(() => {
        const fixer = getFixer(window.location.href);

        window.onscroll = () => {
            fixer.onScroll();
        };
    }, 4000);

    function getFixer(pageUrl) {
        if (pageUrl.includes('youtube.com/watch')) {
            const { append, original } = YOUTUBE_SETTINGS;
            const { width, height } = original;
            const video = document.querySelector('video');
            const player = document.getElementById('player-api');
            const config = createConfig(append.width, append.height, '50px');
            const nodes = [{
                el: document.querySelector('.ytp-chrome-bottom'),
                appendStyle: {
                    width: addPixels(append.width, -20)
                },
                originalStyle: {
                    width: addPixels(original.width, -20)
                }
            }];

            return new VideoFixer(video, player, config, { width, height }, nodes);
        } else if (pageUrl.includes('dumpert.nl/mediabase')) {
            const { append, original } = DUMPERT_SETTINGS;
            const { width, height } = original;
            const video = document.querySelector('video');
            const player = document.querySelector('.dump-player');
            const config = createConfig(append.width, append.height);
            const nodes = [{
                el: document.querySelector('article'),
                appendStyle: {
                    height: '473px'
                },
                originalStyle: {
                    height: '638.984px'
                }
            }];

            return new VideoFixer(video, player, config, { width, height }, nodes);
        }
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

    function addPixels(pixels, amount) {
        return (pixels ? parseInt(pixels.slice(0, -2), 10) : 0) + amount + 'px';
    }
})();
