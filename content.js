const Type = {
	Append: 'appendStyle',
	Original: 'originalStyle'
};

var
getCurrentVideo = () => {
	const video = document.getElementsByTagName('video')[0];
	if (!video)
		return null;

	const {
		src,
		currentTime,
		duration,
		volume,
		paused
	} = video;
	return {
		type: 'video',
		src,
		currentTime,
		duration,
		volume,
		paused
	};
},
createVideo = (width, height, settings) => {
	const video = document.createElement('video');
	video.width = width;
	video.height = height;
	video.src = settings.src;
	video.controls = 'controls';
	video.currentTime = settings.currentTime;
	video.volume = settings.volume;
	return video;
},
createVideoHolder = () => {
	var holder = document.createElement("div");
	holder.id = "video-floater";
	holder.style = "position:fixed;right:15px;bottom:15px;background-color:black;width:400px;height:225px;display:none;z-index:99;box-shadow:0 0 10px #66c221;border:1px solid black";
	return holder;
},
_get = (url, callback) => {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function () {
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
			callback(xmlHttp.responseText);
	}
	xmlHttp.open("GET", url, true); // true for asynchronous
	xmlHttp.send(null);
},
_handle = (response) => {
	var input = response.split("\n"),
	title = "",
	content = [],
	body = {},
	going = false;

	input.forEach((line, index) => {
		// Title
		if (line.indexOf("<title>") >= 0) {
			title = line.match(/<title>(.*)<\/title>/)[1];
		}
		// content
		if (going) {
			content.push(line);
		}
		if (line.indexOf("dump-main") >= 0) {
			going = true;
		} else if (line.indexOf("</footer>") >= 0) {
			going = false;
		}
		// Body
		if (line.indexOf("<body") >= 0) {
			var
			b_attributes = line.match(/<body (.*)>/)[1],
			regx = /(\S+)=["']([\w -]+)["']/,
			match = b_attributes.match(new RegExp(regx, "g"));

			match.forEach((item, index) => {
				var groups = item.match(regx);
				body[groups[1]] = groups[2];
			});
		}
	});
	return {
		title: title,
		content: content,
		body: body
	}
},
get_target = (el) => {
	return el.closest("a");
},
override_links = () => {
	Array.from(document.getElementsByTagName("a"))
	.forEach((el, index) => {
		if (el.hasAttribute("href") && el.href.indexOf("www.dumpert.nl") >= 0) {
			el.addEventListener("click", (e) => {
				target = get_target(e.target);
				e.preventDefault();
				handle(target.href);
			});
		}
	});
},
handle = (url) => {
	_get(url, (m) => {
		var res = _handle(m);

		var video = document.getElementById("video1");

		if (window.location.href !== url) {
			window.history.pushState("", "", url);
		}

		document.getElementsByClassName("dump-main")[0].innerHTML = res['content'].join("\n");
		document.title = res['title'];

		for (var i = document.body.attributes.length; i-- > 0; )
			document.body.removeAttributeNode(document.body.attributes[i]);
		for (var attr in res['body'])
			document.body.setAttribute(attr, res['body'][attr]);

		location.href = "javascript:dump.init();void 0";
		setTimeout(() => {
			override_links();
			Array.from(document.getElementsByClassName("videoplayer"))
			.forEach((item, index) => {
				item.remove();
			});
		}, 100);

		if (!url.includes("/mediabase/")) {
			toggle_video(true, video);
		}
		if (url.includes("/mediabase/")) {
			toggle_video(false, video);
		}

	});
},
toggle_video = (small, video) => {
	if (!video) {
		document.getElementById("video-floater")
		.style.display = "none";
		return;
	}

	if (small && video.parentNode !== document.getElementById("video-floater")) {
		document.getElementById("video-floater")
		.append(video);
		document.getElementById("video-floater")
		.style.display = "block";
	} else if(!small && video.parentNode !== document.getElementsByClassName("dump-player")[0]) {
		if (document.getElementsByClassName("dump-player")
			.length) {
			document.getElementsByClassName("dump-player")[0].prepend(video);
			document.getElementById("video-floater")
			.style.display = "none";
		}
	}

	if (video.className.match(/jw-state-playing/))
		video.children[1].children[0].play();
},
getOffsetTop = (elem) => {
	var offset = 0;
	do {
		if (!isNaN(elem.offsetTop)) {
			offset += elem.offsetTop;
		}
	} while (elem = elem.offsetTop);
	return offset;
}
init = () => {
	var holder = createVideoHolder();

	override_links();

	document.body.append(holder);

	// Events
	window.addEventListener("popstate", (e) => {
		handle(location.href);
	});
	window.addEventListener("scroll", (e) => {
		if (location.href.includes("/mediabase/")) {
			var {
				scrollTop,
				clientTop
			} = document.documentElement;
			if (scrollTop >= document.getElementsByClassName("dump-player")[0].getBoundingClientRect().bottom) {
				toggle_video(true, document.getElementById("video1"));
			} else {
				toggle_video(false, document.getElementById("video1"));
			}
		}
	});
};

init();
