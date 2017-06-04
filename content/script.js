var TYPE = {
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
        var line = window.outerHeight * 0.62;
        var { scrollTop, clientTop } = document.documentElement;
        var top = (window.pageYOffset || scrollTop) - (clientTop || 0);

        if (this.appended && top <= line) {
            this._removeStyle();
        } else if (!this.appended && top > line) {
            this._appendStyle();
        }
    }

    _appendStyle() {
        this.video.style.width = this.toAppend.width;
        this.video.style.height = this.toAppend.height;

        Object.keys(this.toAppend).forEach((prop) => {
            this.player.style[prop] = this.toAppend[prop];
        });

        if (this.nodes) {
            this._loopNodes(TYPE.Append);
        }

        this.appended = true;
    }

    _removeStyle() {
        this.video.style.width = this.toRemove.width;
        this.video.style.height = this.toRemove.height;
        this.player.style = this.playerStyle;

        if (this.nodes) {
            this._loopNodes(TYPE.Original);
        }

        this.appended = false;
    }

    _loopNodes(type) {
        this.nodes.forEach((node) => {
            Object.keys(node[type]).forEach((prop) => {
                node.el.style[prop] = node[type][prop];
            });
        });
    }
}

(function () {
    const YOUTUBE_SETTINGS = {
        append: {
            width: '499.2px',
            height: '280.8px'
        },
        original: {
            width: '854px',
            height: '480px'
        }
    };

    const DUMPERT_SETTINGS = {
        append: {
            width: '427px',
            height: '240px'
        },
        original: {
            width: '854px',
            height: '480px'
        }
    };

    setTimeout(() => {
        var fixer = getFixer(window.location.href);

        window.onscroll = () => {
            fixer.onScroll();
        };
    }, 3000);

    function getFixer(pageUrl) {
        if (pageUrl.includes('youtube.com/watch')) {
            const { append, original } = YOUTUBE_SETTINGS;
            return new VideoFixer(
                document.querySelector('video'),
                document.getElementById('player-api'),
                createConfig(append.width, append.height, '60px', '4px'),
                createConfig(original.width, original.height),
                [{
                    el: document.querySelector('.ytp-chrome-bottom'),
                    appendStyle: {
                        width: addPixels(append.width, -20)
                    },
                    originalStyle: {
                        width: addPixels(original.width, -20)
                    }
                }]
            );
        } else if (pageUrl.includes('dumpert.nl/mediabase')) {
            const { append, original } = DUMPERT_SETTINGS;
            return new VideoFixer(
                document.querySelector('video'),
                document.querySelector('.dump-player'),
                createConfig(append.width, append.height),
                createConfig(original.width, original.height),
                [{
                    el: document.querySelector('article'),
                    appendStyle: {
                        height: '473px'
                    },
                    originalStyle: {
                        height: '638.984px'
                    }
                }]
            );
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
