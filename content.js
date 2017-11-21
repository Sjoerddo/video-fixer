const
    createVideoHolder = () => {
        const holder = document.createElement('div');
        holder.id = 'video-floater';
        holder.style = 'position:fixed;right:15px;bottom:15px;background-color:black;width:400px;height:225px;display:none;z-index:99;box-shadow:0 0 10px #66c221;border:1px solid black';
        return holder;
    },
    get = (url, callback) => {
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = () => {
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200)
                callback(xmlHttp.responseText);
        };
        xmlHttp.open('GET', url, true);
        xmlHttp.send(null);
    },
    scrapeResponse = (response) => {
        let input = response.split('\n'),
            title = '',
            content = [],
            body = {},
            lineBelongsToDump = false;

        input.forEach((line) => {
            if (line.includes('<title>')) {
                title = line.match(/<title>(.*)<\/title>/)[1];
            }

            if (lineBelongsToDump) {
                content.push(line);
            }

            if (line.includes('dump-main')) {
                lineBelongsToDump = true;
            } else if (line.includes('</footer>')) {
                lineBelongsToDump = false;
            }

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
    },
    overrideLinks = () => {
        Array.from(document.getElementsByTagName('a'))
            .forEach((el) => {
                if (el.hasAttribute('href') && el.href.includes('www.dumpert.nl')) {
                    el.addEventListener('click', (e) => {
                        const target = e.target.closest('a');
                        e.preventDefault();
                        handle(target.href);
                    });
                }
            });
    },
    handle = (url) => {
        get(url, (resp) => {
            const { title, content, body } = scrapeResponse(resp);
            const video = document.getElementById('video1');

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

            const shouldHideVideo = !url.includes('/mediabase/');
            toggleVideo(shouldHideVideo, video);
        });
    },
    toggleVideo = (small, video) => {
        const videoFloater = document.getElementById('video-floater');

        if (!video) {
            videoFloater.style.display = 'none';
            return;
        }

        const dumpPlayers = document.getElementsByClassName('dump-player');
        const [firstDumpPlayer] = dumpPlayers;

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
            video.children[1].children[0].play();
        }
    },
    init = () => {
        overrideLinks();

        document.body.appendChild(createVideoHolder());

        window.addEventListener('popstate', () => handle(location.href));
        window.addEventListener('scroll', () => {
            if (location.href.includes('/mediabase/')) {
                const { scrollTop } = document.documentElement;
                const hasScrolledDown = scrollTop >= document.querySelector('.dump-player').getBoundingClientRect().bottom;

                toggleVideo(hasScrolledDown, document.getElementById('video1'));
            }
        });
    };

init();
