var APPEND_WIDTH = '499.2px';
var APPEND_HEIGHT = '280.8px';
var REMOVE_WIDTH = '890px';
var REMOVE_HEIGHT = '500px';

class VideoFixer {
    constructor(video, player, nodes, offsetTop = '0', offsetRight = '0') {
        this.video = video;
        this.player = player;
        this.nodes = nodes;
        this.removedStyle = this.player.style;
        this.appended = false;

        this.style = {
            position: 'fixed',
            top: offsetTop,
            right: offsetRight,
            'z-index': 9990,
            width: APPEND_WIDTH,
            height: APPEND_HEIGHT
        };
    }

    onScroll() {
        var height = window.outerHeight;
        var line = height * 0.62;

        var docElement = document.documentElement;
        var top = (window.pageYOffset || docElement.scrollTop) - (docElement.clientTop || 0);

        if (this.appended && top <= line) {
            this.removeStyle();
        } else if (!this.appended && top > line) {
            this.appendStyle();
        }
    }

    appendStyle() {
        this.video.style.width = APPEND_WIDTH;
        this.video.style.height = APPEND_HEIGHT;

        Object.keys(this.style).forEach((prop) => {
            this.player.style[prop] = this.style[prop];
        });

        if (this.nodes) {
            this.appendNodes();
        }

        this.appended = true;
    }

    appendNodes() {
        this.nodes.forEach((node) => {
            Object.keys(node.style).forEach((prop) => {
                node.el.style[prop] = node.style[prop];
            });
        });
    }

    removeStyle() {
        this.video.style.width = REMOVE_WIDTH;
        this.video.style.height = REMOVE_HEIGHT;

        this.player.style = this.removedStyle;
        this.appended = false;
    }
}

(function () {
    var videoSet = false;
    var video = document.querySelector('video');

    function getFixer(video, controls, href) {
        if (href.includes('youtube.com')) {
            return new VideoFixer(video, document.getElementById('player-api'), [controls], '60px', '10px');
        } else if (href.includes('dumpert.com')) {
            return new VideoFixer(video, document.querySelector('.dump-player'));
        } else {
            return null;
        }
    }

    function addPixels(pixels, amount) {
        return (pixels ? parseInt(pixels.slice(0, -2), 10) : 0) + amount + 'px';
    }

    var controls = {
        el: document.querySelector('.ytp-chrome-bottom'),
        style: {
            width: addPixels(APPEND_WIDTH, -20)
        }
    };

    var fixer = getFixer(document.querySelector('video'), controls, window.location.href);

    if (fixer) {
        window.onscroll = function () {
            if (!videoSet) {
                videoSet = true;
            }

            fixer.onScroll();
        };
    }
})();
