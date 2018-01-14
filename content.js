let CloseVideoAfterEnding,
    ScrollSwitch = false;

function initialize(options) {
    overrideLinks();

    document.body.appendChild(createVideoHolder(options.alignment));
    CloseVideoAfterEnding = options.closeAfterEnding;

    window.addEventListener('popstate', () => {
        handlePageChange(location.href);
    });

    window.addEventListener('scroll', () => {
        if (!location.href.includes('/mediabase/')) return;

        const player = document.querySelector('.dump-player');
        if (player === null) return;

        const { scrollTop } = document.documentElement;
        const hasScrolledDown = scrollTop >= player.getBoundingClientRect().bottom;
        if (hasScrolledDown === ScrollSwitch) return;

        ScrollSwitch = hasScrolledDown;
        resizeVideo(document.getElementById('video1'), ScrollSwitch);
    });
}

const videoHasEnded = (video) => video ? video.currentTime === video.duration : false;

function resizeVideo(video, small) {
    const videoFloater = document.getElementById('video-floater');

    if (!video) {
        videoFloater.style.display = 'none';
        return;
    }

    const dumpPlayers = document.getElementsByClassName('dump-player');
    const firstDumpPlayer = dumpPlayers[0];

    if (small && video.parentNode !== videoFloater) {
        videoFloater.appendChild(video);
        videoFloater.style.display = 'block';
    } else if (!small && video.parentNode !== firstDumpPlayer) {
        if (dumpPlayers.length > 0) {
            firstDumpPlayer.insertBefore(video, firstDumpPlayer.firstChild);
            videoFloater.style.display = 'none';
        }
    }

    if (video.className.match(/jw-state-playing/)) {
        video.children[1].children[0].play()
    }
}

function fullyHideVideo() {
    const videoFloater = document.getElementById('video-floater');
    videoFloater.style.display = 'none';

    if (!location.href.includes('/mediabase/')) {
        const video = document.getElementById('video1');

        if (video) video.querySelector('video').pause();
    }
}

function handlePageChange(url) {
    getPage(url, (resp) => {
        const { title, content, body } = scrapeNewPage(resp);
        let makeVideoSmall = !url.includes('/mediabase/');
        let video = document.getElementById('video1');

        if (CloseVideoAfterEnding && videoHasEnded(document.querySelector('video'))) {
            makeVideoSmall = false;
            video = null;
        }

        if (window.location.href !== url) {
            window.history.pushState('', '', url);
        }

        document.getElementsByClassName('dump-main')[0].innerHTML = content.join('\n');
        document.title = title;

        for (let i = document.body.attributes.length; i-- > 0;) {
            document.body.removeAttributeNode(document.body.attributes[i]);
        }

        Object.keys(body).forEach((attr) => {
            document.body.setAttribute(attr, body[attr]);
        });

        window.location.href = 'javascript:dump.init();void 0';

        setTimeout(() => {
            overrideLinks();

            Array.from(document.getElementsByClassName('videoplayer'))
                .forEach(item => item.remove());
        }, 100);

        resizeVideo(video, makeVideoSmall);
    });
}

function createVideoHolder(alignment = 'top') {
    const holder = document.createElement('div');
    holder.id = 'video-floater';
    holder.style = `position:fixed;right:15px;${alignment}:15px;background-color:black;width:400px;height:225px;display:none;z-index:99;box-shadow:0 0 10px #66c221;border:1px solid black`;

    const close = document.createElement('div');
    close.innerHTML = '&#x2716;';
    close.style = 'width:24px;height:24px;position:absolute;right:0;top:0;background-color:rgba(102,194,33,0.7);font-size:15px;z-index:100;color:black;cursor:pointer;';
    close.addEventListener('click', () => fullyHideVideo());

    holder.appendChild(close);
    return holder;
}

function scrapeNewPage(response) {
    const input = response.split('\n');
    let title = '';
    const content = [],
        body = {};
    let lineBelongsToDump = false;

    input.forEach((line) => {
        if (line.includes('<title>')) title = line.match(/<title>(.*)<\/title>/)[1];
        if (lineBelongsToDump) content.push(line);
        if (line.includes('dump-main')) lineBelongsToDump = true;
        else if (line.includes('</footer>')) lineBelongsToDump = false;

        if (line.includes('<body')) {
            const b_attributes = line.match(/<body (.*)>/)[1],
                regx = /(\S+)=["']([\w -]+)["']/,
                match = b_attributes.match(new RegExp(regx, 'g'));

            match.forEach((item) => {
                const groups = item.match(regx);
                body[groups[1]] = groups[2];
            });
        }
    });

    return { title, content, body };
}

function getPage(url, callback) {
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = () => {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200)
            callback(xmlHttp.responseText);
    };
    xmlHttp.open('GET', url, true);
    xmlHttp.send(null);
}

function overrideLinks() {
    Array.from(document.getElementsByTagName('a'))
        .forEach((el) => {
            if (el.hasAttribute('href') && el.href.includes('www.dumpert.nl')) {
                el.addEventListener('click', (e) => {
                    const target = e.target.closest('a');
                    e.preventDefault();
                    handlePageChange(target.href);
                });
            }
        });
}

chrome.runtime.sendMessage({ type: 'options' }, (response) => {
    initialize(response.options);
});
