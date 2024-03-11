let keys = {
    "ad": "ad",
    "aggregate": "ag",
    "api": "ai",
    "application": "ap",
    "architecture": "ar",
    "asset": "as",
    "autoplay": "au",
    "avg": "av",
    "beacon": "be",
    "bitrate": "bi",
    "break": "bk",
    "browser": "br",
    "bytes": "by",
    "cancel": "ca",
    "codec": "cc",
    "code": "cd",
    "counter": "ce",
    "config": "cf",
    "category": "cg",
    "changed": "ch",
    "connection": "ci",
    "clicked": "ck",
    "canceled": "cl",
    "custom": "cm",
    "cdn": "cn",
    "count": "co",
    "complete": "cp",
    "creative": "cr",
    "content": "ct",
    "current": "cu",
    "context": "cx",
    "device": "de",
    "downscaling": "dg",
    "drm": "dm",
    "domain": "dn",
    "downscale": "do",
    "dropped": "dr",
    "duration": "du",
    "errorcode": "ec",
    "end": "ed",
    "edge": "eg",
    "engine": "ei",
    "embed": "em",
    "environment": "en",
    "encoding": "eo",
    "expiry": "ep",
    "error": "er",
    "experiments": "es",
    "errortext": "et",
    "event": "ev",
    "experiment": "ex",
    "failed": "fa",
    "first": "fi",
    "fullscreen": "fl",
    "format": "fm",
    "fastpix": "fp",
    "frequency": "fq",
    "frame": "fr",
    "fps": "fs",
    "family": "fy",
    "has": "ha",
    "holdback": "hb",
    "hostname": "hn",
    "host": "ho",
    "headers": "hs",
    "height": "ht",
    "id": "id",
    "internal": "il",
    "instance": "in",
    "ip": "ip",
    "is": "is",
    "init": "it",
    'key': "ke",
    "labeled": "lb",
    'loaded': "ld",
    "level": "le",
    'live': "li",
    "language": "ln",
    "load": "lo",
    "lists": "ls",
    "latency": "lt",
    "max": "ma",
    "media": "me",
    "manifest": "mf",
    "mime": "mi",
    "midroll": "ml",
    "min": "mn",
    "model": "mo",
    "manufacturer": "mr",
    "message": "ms",
    "name": "na",
    "newest": "ne",
    'number': "nu",
    "on": "on",
    "os": "os",
    'page': "pa",
    "playback": "pb",
    "producer": "pd",
    "preroll": "pe",
    "percentage": "pg",
    "playhead": "ph",
    "plugin": "pi",
    "player": "pl",
    "program": "pm",
    "playing": "pn",
    "poster": "po",
    "property": "pp",
    "preload": "pr",
    "position": "ps",
    "part": "pt",
    "paused": "pu",
    "played": "py",
    "ratio": "ra",
    "rebuffer": "rb",
    "requested": "rd",
    "rate": "re",
    "remote": "rm",
    "rendition": "rn",
    "response": "rp",
    "request": "rq",
    "requests": "rs",
    "sample": "sa",
    "sdk": "sd",
    "seek": "se",
    "skipped": "sk",
    "stream": "sm",
    "session": "sn",
    "source": "so",
    "startup": "sp",
    "sequence": "sq",
    "series": "sr",
    "start": "st",
    "sub": "su",
    "server": "sv",
    "software": "sw",
    "tag": "ta",
    "tech": "tc",
    "text": "te",
    "target": "tg",
    "throughput": "th",
    "time": "ti",
    "total": "tl",
    "to": "to",
    "timestamp": "tp",
    "title": "tt",
    "type": "ty",
    "upscaling": "ug",
    "universal": "un",
    "upscale": "up",
    "url": "ur",
    "user": "us",
    "variant": "va",
    "video": "vd",
    "view": "ve",
    "viewer": "vi",
    "version": "vn",
    "viewed": "vw",
    "watch": "wa",
    "waiting": "wg",
    "width": "wt",
    "1": "1",
    "2": "2",
    "3": "3",
    "4": "4",
    "5": "5",
    "6": "6",
    "7": "7",
    "8": "8",
    "9": "9",
    "10": "10"
};
function makeWorker(script) {
    var URL = window.URL || window.webkitURL;
    var Blob = window.Blob;
    var Worker = window.Worker;
    if (!URL || !Blob || !Worker || !script) {
        return null;
    }
    var blob = new Blob([script]);
    var webworker = new Worker(URL.createObjectURL(blob));
    return webworker;
}
var inlineWorkerText = `
let emitIntervalData;
let bufferThreshold = null;
let sustainedBuffer
let started = false;
let buffered = false
let emitPauseData;
let dataArray = [];

function emptyArray() {
  if (navigator.onLine) {
    dataArray = []
  }
}

self.onmessage = function (event) {
  const command = event.data.command;

  switch (command) {
    case "addData":
      dataArray.push(event.data.event)
      break

    case "startInterval":
      if (!started) {
        emitIntervalData = setInterval(function () {
          self.postMessage({ command: "emitEvents", eventData: dataArray });
          emptyArray()
        }, 10000);
        started = true
      }
      break

    case "stopInterval":
      clearInterval(emitIntervalData)
      started = false
      break

    case "startTimeout":
      emitPauseData = setTimeout(function () {
        self.postMessage({ command: "emitEvents", eventData: dataArray });
        emptyArray()
      }, 10000)
      break

    case "stopTimeout":
      clearTimeout(emitPauseData)
      break

    case "sendFirstChunk":
      self.postMessage({ command: "emitEvents", eventData: dataArray });
      emptyArray()
      break

    case "checkBuffering":
      if (bufferThreshold === null) {
        bufferThreshold = setInterval(function () {
          self.postMessage({ command: "onBufferCheck", sustainedBuffer: "startBuffering" })
        }, 25)
      }
      break


    case "clearBuffering":
      if (bufferThreshold !== null) {
        clearInterval(bufferThreshold)
        bufferThreshold = null
        self.postMessage({ command: "onBufferCheck", sustainedBuffer: "endBuffering" })
      }
      break

    default:
      return
  }
}
`;
function HlsPlayer() {
    this.unixEpochTime = {
        now: () => {
            let value = performance.timeOrigin;
            let stamp = typeof value === "number" && typeof performance.now === "function"
                ? value + performance.now()
                : Date.now();
            return Math.round(stamp);
        }
    };
    this.monitor = function (video, devdata) {
        let obj = {};
        let worker = makeWorker(inlineWorkerText);
        const generateShortId = () => {
            return ("000000" + (Math.random() * Math.pow(36, 6) << 0).toString(36)).slice(-6);
        };
        const getElementId = (attr) => {
            if (attr && attr.nodeName) {
                return attr.uniqueId || (attr.uniqueId = generateShortId());
            }
            try {
                const element = document.querySelector(attr);
                if (element && !element.uniqueId) {
                    element.uniqueId = attr;
                }
                return (element === null || element === void 0 ? void 0 : element.uniqueId) || attr;
            }
            catch (e) {
                return attr;
            }
        };
        let analyzeVideo = function (target) {
            let videoTag;
            if (target && void 0 !== target.nodeName) {
                target = getElementId(videoTag = target);
            }
            else {
                videoTag = document.querySelector(target);
            }
            let failureMessage = videoTag && videoTag.nodeName ? videoTag.nodeName.toLowerCase() : "";
            return [videoTag, target, failureMessage];
        };
        let videoParams = analyzeVideo(video);
        let tag = videoParams[0];
        let videoId = videoParams[1];
        let videoString = videoParams[2];
        let actionableData = devdata === null || devdata === void 0 ? void 0 : devdata.data;
        let _hlsjs = devdata.hlsjs;
        let http = devdata.Hls || window.Hls;
        tag.fp = {} || tag.fp;
        if (!tag) {
            console.warn("No element was found with the `" + videoId + "` query selector.");
        }
        if ("video" !== videoString && "audio" !== videoString) {
            console.warn("The element of `" + videoId + "` was not a media element.");
        }
        // Returns time in milliseconds
        let convertToMs = function (duration) {
            return (Math.floor(duration * 1e3));
        };
        // Generate guid
        let guid = function () {
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (y) {
                let x = 16 * Math.random() | 0;
                return ("x" === y ? x : 3 & x | 8).toString(16);
            });
        };
        obj.playerViewCount = 0;
        let viewIdCount = function () {
            obj.playerViewCount++;
            obj.viewId = guid();
        };
        viewIdCount();
        obj.playerInstanceId = guid();
        obj.beaconDomain = "metrix.ws";
        // Returns player details
        let playerDetails = function () {
            return {
                player_software_name: "HTML5 Video Element",
                player_fastpix_sdk_name: "VideoElementMonitor",
                player_fastpix_sdk_version: "1.1.0"
            };
        };
        // Returns page and view details
        let sdkPageDetails = function () {
            obj.fastpixApiVersion = "1.0.1";
            return {
                fastpix_api_version: "1.0.1",
                fastpix_viewer_id: obj.fastpixViewerId,
                fastpix_sample_number: obj.fastpixSampleNumber,
                fastpix_sample_rate: 1,
                player_view_count: obj.playerViewCount,
                view_page_url: window.location.href
            };
        };
        // Returns session id and start time
        let sessionDetails = function () {
            return {
                session_id: obj.sessionId,
                session_start: obj.sessionStart
            };
        };
        // Returns unix epoche timestamp
        let unixTime = {
            now: function () {
                let value = performance.timeOrigin;
                let stamp = "number" === typeof value &&
                    "function" === typeof performance.now ? value + performance.now() : Date.now();
                return Math.round(stamp);
            }
        };
        // Validating viewer cookie
        let validateViewer = function (data) {
            obj.fastpixViewerId = data.fpviid ? data.fpviid : guid();
            obj.fastpixSampleNumber = data.fpsanu ? data.fpsanu : Math.random();
        };
        // Validate session data
        obj.sessionExpiry = 0;
        obj.checkedWatchTime = 0;
        let validateSessionData = function (data) {
            let now = unixTime.now();
            obj.sessionExpiry === 0 ? (obj.sessionExpiry += now + 15E5) :
                (obj.sessionExpiry += now - obj.checkedWatchTime);
            if (data.snst) {
                if (864E5 < (now - parseInt(data.snst))) {
                    obj.sessionStart = data.snst = now;
                    obj.sessionId = data.snid = guid();
                }
                else {
                    obj.sessionStart = data.snst;
                    obj.sessionId = data.snid;
                }
            }
            else {
                obj.sessionStart = data.snst = now;
                obj.sessionId = data.snid = guid();
            }
        };
        // Get cookie from browser
        let getCookie = function (name) {
            const cookies = document.cookie.split(";");
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.startsWith(name + "=")) {
                    const cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    const values = {};
                    const keyValuePairs = cookieValue.split("&");
                    keyValuePairs.forEach(pair => {
                        const [key, value] = pair.split("=");
                        values[key] = value;
                    });
                    return values;
                }
            }
            return {};
        };
        // Set viewer cookie
        obj.fastpixData = "fastpixData";
        let setCookieData = function () {
            const getViewerCookie = getCookie(obj.fastpixData);
            validateViewer(getViewerCookie);
            validateSessionData(getViewerCookie);
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 365);
            const cookieValue = (`snid=${obj.sessionId}&snst=${obj.sessionStart}&snepti=${obj.sessionExpiry}&fpviid=${obj.fastpixViewerId}&fpsanu=${obj.fastpixSampleNumber}`);
            const cookieString = (`${obj.fastpixData}=${(cookieValue)}; expires=${expirationDate}}; path=/`);
            document.cookie = cookieString;
        };
        // Returns video souce duration
        let getSourceDuration = function (duration) {
            let d = isNaN(duration);
            if (d) {
                return null;
            }
            else {
                return convertToMs(duration);
            }
        };
        // Returns domain and hostname for url
        const getHostDomainName = function (type, url) {
            const anchor = document.createElement('a');
            anchor.href = url;
            const hostname = anchor.hostname;
            if (type === 'hostname') {
                return hostname;
            }
            else if (type === 'domain') {
                const segments = hostname.split('.');
                if (segments.length >= 2) {
                    return segments.slice(-2).join('.');
                }
            }
        };
        // Covert event parameters into its short names
        let convertEventParams = function (events) {
            let chunk = [];
            events.forEach((each) => {
                let stack = {};
                for (let ev in each) {
                    const splitKey = ev.split("_");
                    let splitword = "";
                    splitKey.map((each) => {
                        splitword += keys[each];
                    });
                    stack[splitword] = each[ev];
                }
                chunk.push(stack);
            });
            return chunk;
        };
        // Posts data to server
        obj.rtt_ms = 0;
        obj.chunksArray = [];
        obj.array = [];
        let postData = function (data) {
            let metaData = {};
            // If Player is in pause state stoping interval
            tag.paused || obj.isError ? (worker.postMessage({ command: "stopInterval" }), obj.sendFirstChunkData = true) : undefined;
            // Returs array with pulse event if empty array is received
            data.length === 0 ? data.push(emitEvents("pulse")) : undefined;
            // Converting received event chunks into its short names
            const eventData = convertEventParams(data);
            // Handling rtt_ms and transmission timestamp
            metaData["transmission_timestamp"] = unixTime.now();
            obj.rtt_ms > 0 && (metaData["rtt_ms"] = obj.rtt_ms);
            const sendData = { metadata: metaData, events: eventData };
            // const api = devdata.beaconCollectionDomain ? `https://${devdata.beaconCollectionDomain}` : `https://${actionableData === null || actionableData === void 0 ? void 0 : actionableData.environment_id}.${obj.beaconDomain}`;
            const api = `https://fpdata.ibee.ai/streams/${actionableData === null || actionableData === void 0 ? void 0 : actionableData.environment_id}.${obj.beaconDomain}`;

            if (obj.viewCompleted) {
                navigator && (navigator.sendBeacon(api, JSON.stringify(sendData)));
                fetch(api, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain',
                    },
                    body: JSON.stringify(sendData),
                    keepalive: true
                }).then((res) => {
                    res.ok && (obj.rtt_ms = unixTime.now() - metaData.transmission_timestamp);
                });
                obj.viewCompleted = false;
            }
            else {
                fetch(api, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain',
                    },
                    body: JSON.stringify(sendData),
                }).then((res) => {
                    res.ok && (obj.rtt_ms = unixTime.now() - metaData.transmission_timestamp);
                });
            }
        };
        // Returs preloaddata as boolean
        let getPreloadData = function (getPreload) {
            return "auto" === getPreload || "metadata" === getPreload;
        };
        // Return video metadata
        let previousVideoState = {};
        let videoStateData = function () {
            let obj;
            let droppedFrameCount;
            let hlsurl = _hlsjs && _hlsjs.url;
            const statsData = {
                player_is_paused: tag.paused,
                player_width: tag.offsetWidth,
                player_height: tag.offsetHeight,
                player_autoplay_on: tag.autoplay,
                player_preload_on: getPreloadData(tag.preload),
                player_is_fullscreen: document && !!(document.fullscreenElement || ((document === null || document === void 0 ? void 0 : document.webkitFullscreenElement) || ((document === null || document === void 0 ? void 0 : document.mozFullScreenElement) || (document === null || document === void 0 ? void 0 : document.msFullscreenElement)))),
                video_source_height: tag.videoHeight,
                video_source_width: tag.videoWidth,
                video_source_url: (hlsurl || tag.currentSrc),
                video_source_domain: getHostDomainName("domain", (hlsurl || tag.currentSrc)),
                video_source_hostname: getHostDomainName("hostname", (hlsurl || tag.currentSrc)),
                video_source_duration: getSourceDuration(tag.duration),
                video_poster_url: tag.poster,
                player_language_code: tag.lang,
                view_dropped_frame_count: null === (obj = tag) || (void 0 === obj || (null === (droppedFrameCount = obj.getVideoPlaybackQuality) || void 0 === droppedFrameCount)) ? void 0 : droppedFrameCount.call(obj).droppedVideoFrames
            };
            return statsData;
        };
        // Return only changed video meta data
        let getTrimmedVideoState = function () {
            const metaData = videoStateData();
            if (JSON.stringify(previousVideoState) !== JSON.stringify(metaData)) {
                let trimmedData = {};
                for (const key in metaData) {
                    if (metaData[key] !== previousVideoState[key]) {
                        trimmedData[key] = metaData[key];
                    }
                }
                previousVideoState = metaData;
                return trimmedData;
            }
        };
        // Returns videoMaxPlayheadPosition
        obj.playStart = false;
        obj.prevPlayHeadPosition = 0;
        let getMaxHeadPosition = function (duration) {
            if (duration > obj.prevPlayHeadPosition) {
                obj.prevPlayHeadPosition = duration;
                return { view_max_playhead_position: duration };
            }
        };
        // Returns viewMaxSeekTime 
        obj.viewMaxSeekTime = 0;
        obj.seekDuration = 0;
        obj.isSeeking = false;
        obj.seekCount = 0;
        let validateSeekMetrics = function () {
            const seekStamp = unixTime.now();
            const val = seekStamp - obj.seekingViewerTime;
            obj.seekDuration += val;
            const maxSeekTime = Math.max(obj.viewMaxSeekTime, val);
            obj.viewMaxSeekTime = val;
            obj.isSeeking = false;
            return {
                view_seek_duration: obj.seekDuration,
                view_max_seek_time: maxSeekTime
            };
        };
        // Returns viewWatchTime 
        obj.viewWatchTime = 0;
        let getViewWatchTime = function (arg, time) {
            if (obj.playStart || obj.isSeeking || obj.isBuffering) {
                obj.viewWatchTime += time - obj.checkedWatchTime;
                return { view_watch_time: obj.viewWatchTime };
            }
            else if (arg === "viewBegin") {
                return { view_watch_time: 0 };
            }
        };
        obj.lastPlayheadPosition = 0;
        obj.playInProgress = false;
        obj.totalContentPbTime = 0;
        obj.prevPlayBackTime = 0;
        obj.contentTime = 0;
        let getContentPlaybackTime = function (event) {
            if (obj.playInProgress && !obj.isSeeking && obj.startCtPbTime > 0) {
                if (obj.startCtPbTime < obj.lastPlayheadPosition) {
                    obj.lastPlayheadPosition = obj.startCtPbTime;
                }
                else {
                    obj.totalContentPbTime += obj.startCtPbTime - obj.lastPlayheadPosition;
                    obj.contentTime += obj.startCtPbTime - obj.lastPlayheadPosition;
                    obj.lastPlayheadPosition = obj.startCtPbTime;
                    let contentTime = {};
                    contentTime["view_content_playback_time"] = obj.contentTime;
                    if (event === "pause" || event === "pulse" || event === "buffering" || event === "seeking") {
                        contentTime["view_total_content_playback_time"] = obj.totalContentPbTime;
                        obj.contentTime = 0;
                    }
                    obj.prevPlayBackTime = obj.totalContentPbTime;
                    return contentTime;
                }
            }
        };
        // Returns scaling data and percentage
        obj.totalUpscaling = 0;
        obj.totalDownscaling = 0;
        obj.lastScalingPlayPosition = 0;
        let previousScalingData = {};
        let getScalingData = function () {
            if (obj.lastScalingPlayPosition >= 0 && obj.startCtPbTime >= 0 && obj.lastPlayerWidth >= 0 && obj.lastVideoWidth > 0 && obj.lastPlayerHeight >= 0 && obj.lastVideoHeight > 0) {
                let diff = obj.startCtPbTime - obj.lastScalingPlayPosition;
                if (diff < 0) {
                    return void (obj.lastScalingPlayPosition = -1);
                }
                let playerVideoRatio = Math.min((obj.lastPlayerHeight / obj.lastVideoHeight), (obj.lastPlayerWidth / obj.lastVideoWidth));
                let maxUpscale = Math.max(0, playerVideoRatio - 1);
                obj.totalUpscaling += maxUpscale * diff;
                let maxDownscale = Math.max(0, 1 - playerVideoRatio);
                obj.totalDownscaling += maxDownscale * diff;
                let scalingData = {
                    view_total_downscaling: obj.totalDownscaling,
                    view_total_upscaling: obj.totalUpscaling,
                    view_max_upscale_percentage: maxUpscale,
                    view_max_downscale_percentage: maxDownscale
                };
                if (JSON.stringify(previousScalingData) !== JSON.stringify(scalingData)) {
                    let scdata = {};
                    for (const key in scalingData) {
                        if (scalingData[key] !== previousScalingData[key]) {
                            scdata[key] = scalingData[key];
                        }
                    }
                    previousScalingData = scalingData;
                    return scdata;
                }
            }
        };
        // Returns buffer parameters
        obj.isBuffering = false;
        obj.bufferCount = 0;
        obj.bufferStartTime = 0;
        obj.totalBufferDuration = 0;
        let getBufferParams = function (time) {
            if (obj.bufferCount > 0 && obj.viewWatchTime > 0) {
                if (obj.isBuffering && !obj.isSeeking) {
                    obj.totalBufferDuration += time - obj.bufferStartTime;
                }
                const bufferPercentage = (obj.totalBufferDuration / obj.viewWatchTime);
                const bufferFrequency = (obj.bufferCount / obj.viewWatchTime);
                if (obj.isBuffering && !obj.isSeeking) {
                    return {
                        view_rebuffer_duration: obj.totalBufferDuration,
                        view_rebuffer_percentage: bufferPercentage,
                        view_rebuffer_frequency: bufferFrequency,
                    };
                }
                else {
                    return {
                        view_rebuffer_percentage: bufferPercentage,
                        view_rebuffer_frequency: bufferFrequency,
                    };
                }
            }
        };
        // Returns viewTimeToFirstFrame
        let getTimeToFirstFrame = function (time) {
            return { view_to_first_frame: time };
        };
        // Returns interval data from worker and postdata is called
        obj.firstArray = true;
        obj.playbackheartbeatstarted = false;
        worker.onmessage = function (event) {
            if (event.data.command === "onBufferCheck") {
                if (event.data.sustainedBuffer === "startBuffering") {
                    evaluateBuffering("startBuffering", { viewerTime: unixTime.now() });
                    obj.playbackheartbeatstarted = true;
                }
                if (event.data.sustainedBuffer === "endBuffering") {
                    obj.playbackheartbeatstarted = false;
                    obj.playheadBufferFlag = false;
                }
            }
            else if (event.data.command === "emitEvents") {
                let eventsFromWorker = event.data.eventData;
                (!obj.firstArray && (obj.array = []));
                if (obj.firstArray) {
                    obj.firstArray = false;
                    obj.chunksArray = eventsFromWorker;
                }
                if (eventsFromWorker.length === 0) {
                    eventsFromWorker.push(emitEvents("pulse"));
                    obj.chunksArray = eventsFromWorker;
                }
                (actionableData === null || actionableData === void 0 ? void 0 : actionableData.environment_id) && eventsFromWorker.length > 0 && (postData(eventsFromWorker));
            }
        };
        // Sends each event to worker
        let details = true;
        obj.sendFirstChunkData = true;
        let addData = function (d) {
            if (details || d.event_name === "viewBegin") {
                d = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, d), sdkPageDetails()), playerDetails()), sessionDetails()), videoStateData()), actionableData);
                details = false;
            }
            Object.keys(d).forEach(key => {
                if (d[key] === undefined || d[key] === "" || d === undefined) {
                    delete d[key];
                }
            });
            obj.array.push(d);
            obj.chunksArray = obj.array;
            if (d.event_name === "viewBegin") {
                obj.array = [];
            }
            worker.postMessage({ command: "addData", event: d });
        };
        // Reinitiate viewId and viewSequenceNumber after an hour
        let validateDelayEvents = function () {
            const now = unixTime.now();
            if (((now - obj.checkedWatchTime) > 36E5) && obj.checkedWatchTime > 0) {
                viewIdCount();
                obj.viewSequenceNumber = 0;
                obj.viewWatchTime = 0;
            }
        };
        // Events are seperated and emitted
        obj.playerSequenceNumber = 0;
        obj.viewSequenceNumber = 0;
        obj.playerPlayheadTime = 0;
        obj.emitPlayerReady = false;
        obj.playheadBufferFlag = false;
        let defVariantEvents = {
            video_source_bitrate: void 0,
            video_source_codec: void 0,
            video_source_fps: void 0
        };
        let getFirstFrame;
        let emitFirstFrame = true;
        let emitEvents = function (arg, parameters) {
            validateDelayEvents();
            const unixEpocheTime = unixTime.now();
            obj.playerSequenceNumber++;
            obj.viewSequenceNumber++;
            setCookieData();
            const playHeadPosition = getSourceDuration(tag.currentTime);
            const checkMaxPlayheadPosition = getMaxHeadPosition(playHeadPosition);
            const viewWatchTime = getViewWatchTime(arg, unixEpocheTime);
            const videoMetaData = getTrimmedVideoState();
            const getPlaybackTime = getContentPlaybackTime(arg);
            obj.checkedWatchTime = unixEpocheTime;
            if (obj.sendFirstChunkData && !obj.playStart) {
                worker.postMessage({ command: "startTimeout" });
                obj.sendFirstChunkData = false;
                obj.viewCompleted = false;
            }
            if (obj.isBuffering) {
                var bufferParams = getBufferParams(unixEpocheTime);
                obj.bufferStartTime = unixEpocheTime;
            }
            else {
                if (unixEpocheTime - obj.bufferStartTime > 1e3) {
                    var bufferParams = getBufferParams(unixEpocheTime);
                }
            }
            if (arg !== "error") {
                obj.isError = false;
            }
            let CommonEvents = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ beacon_domain: obj.beaconDomain, environment_id: actionableData === null || actionableData === void 0 ? void 0 : actionableData.environment_id, event_name: arg, player_sequence_number: obj.playerSequenceNumber, view_sequence_number: obj.viewSequenceNumber, fastpix_api_version: obj.fastpixApiVersion, fastpix_viewer_id: obj.fastpixViewerId, player_instance_id: obj.playerInstanceId, player_playhead_time: playHeadPosition, session_expiry_time: obj.sessionExpiry, video_id: actionableData === null || actionableData === void 0 ? void 0 : actionableData.video_id, view_id: obj.viewId, viewer_timestamp: unixEpocheTime }, checkMaxPlayheadPosition), viewWatchTime), videoMetaData), getPlaybackTime), bufferParams);
            switch (arg) {
                case "play":
                    const playObj = Object.assign({}, CommonEvents);
                    addData(playObj);
                    break;
                case "loadstart":
                    const loadstart = Object.assign({}, CommonEvents);
                    addData(loadstart);
                    break;
                case "playing":
                    obj.isError = false;
                    obj.isSeeking = false;
                    obj.isBuffering = false;
                    obj.playStart = true;
                    if (emitFirstFrame) {
                        getFirstFrame = getTimeToFirstFrame(viewWatchTime === null || viewWatchTime === void 0 ? void 0 : viewWatchTime.view_watch_time);
                        emitFirstFrame = false;
                    }
                    else {
                        getFirstFrame = undefined;
                    }
                    const playingObj = Object.assign(Object.assign({}, CommonEvents), getFirstFrame);
                    addData(playingObj);
                    obj.lastPlayheadPosition = obj.startCtPbTime;
                    obj.lastScalingPlayPosition = obj.startCtPbTime;
                    obj.playInProgress = true;
                    obj.lastPlayerHeight = tag.offsetHeight;
                    obj.lastPlayerWidth = tag.offsetWidth;
                    obj.lastVideoHeight = tag.videoHeight;
                    obj.lastVideoWidth = tag.videoWidth;
                    break;
                case "pause":
                    if (obj.playInProgress && !obj.isSeeking) {
                        var scalingData = getScalingData();
                    }
                    const pauseObj = Object.assign(Object.assign({}, CommonEvents), scalingData);
                    addData(pauseObj);
                    break;
                case "seeking":
                    if (obj.playInProgress) {
                        var scalingData = getScalingData();
                    }
                    const seekingObj = Object.assign(Object.assign(Object.assign({}, CommonEvents), scalingData), { view_seek_count: obj.seekCount });
                    addData(seekingObj);
                    break;
                case "seeked":
                    obj.isBuffering = false;
                    if (!tag.paused) {
                        obj.playStart = true;
                    }
                    const seekTime = validateSeekMetrics();
                    const seekedObj = Object.assign(Object.assign({}, CommonEvents), seekTime);
                    addData(seekedObj);
                    obj.isSeeking = false;
                    break;
                case "waiting":
                    if (obj.playInProgress) {
                        var scalingData = getScalingData();
                    }
                    obj.playInProgress = false;
                    const waitingObj = Object.assign(Object.assign({}, CommonEvents), scalingData);
                    addData(waitingObj);
                    break;
                case "buffering":
                    obj.bufferCount++;
                    if (obj.playInProgress) {
                        var scalingData = getScalingData();
                    }
                    const bufferingObj = Object.assign(Object.assign(Object.assign({}, CommonEvents), scalingData), { view_rebuffer_count: obj.bufferCount });
                    addData(bufferingObj);
                    obj.playInProgress = false;
                    break;
                case "buffered":
                    obj.playStart = true;
                    const bufferedObj = Object.assign({}, CommonEvents);
                    addData(bufferedObj);
                    obj.lastPlayheadPosition = obj.startCtPbTime;
                    obj.lastScalingPlayPosition = obj.startCtPbTime;
                    obj.playInProgress = true;
                    obj.lastPlayerHeight = tag.offsetHeight;
                    obj.lastPlayerWidth = tag.offsetWidth;
                    obj.lastVideoHeight = tag.videoHeight;
                    obj.lastVideoWidth = tag.videoWidth;
                    break;
                case "ended":
                    const endedObj = Object.assign(Object.assign({}, CommonEvents), { view_end_time: unixEpocheTime });
                    addData(endedObj);
                    worker.postMessage({ command: "sendFirstChunk" });
                    break;
                case "viewCompleted":
                    if (obj.playInProgress) {
                        var scalingData = getScalingData();
                    }
                    const viewCompletedObj = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, CommonEvents), scalingData), obj.requestEvents), obj.playerReady), defVariantEvents), { view_end_time: unixEpocheTime });
                    addData(viewCompletedObj);
                    break;
                case "playerReady":
                    const playerReadyObj = Object.assign(Object.assign({}, CommonEvents), parameters);
                    addData(playerReadyObj);
                    break;
                case "variantChanged":
                    defVariantEvents = parameters;
                    const variantChangedObj = Object.assign(Object.assign({}, CommonEvents), parameters);
                    addData(variantChangedObj);
                    break;
                case "requestCompleted":
                    obj.requestEvents = parameters;
                    const requestCompletedObj = Object.assign(Object.assign({}, CommonEvents), parameters);
                    addData(requestCompletedObj);
                    break;
                case "requestCanceled":
                    const requestCanceledObj = Object.assign(Object.assign({}, CommonEvents), parameters);
                    addData(requestCanceledObj);
                    break;
                case "requestFailed":
                    const requestFailedObj = Object.assign(Object.assign({}, CommonEvents), parameters);
                    addData(requestFailedObj);
                    break;
                case "viewBegin":
                    const viewBeginObj = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, CommonEvents), obj.requestEvents), obj.playerReady), defVariantEvents), { view_start_time: unixTime.now() });
                    addData(viewBeginObj);
                    break;
                case "error":
                    const errorObj = Object.assign(Object.assign({}, CommonEvents), parameters);
                    addData(errorObj);
                    break;
                default:
                    break;
            }
            // Handling Pulse event
            if (CommonEvents.event_name === "pulse") {
                if (obj.playInProgress) {
                    var scalingData = getScalingData();
                }
                obj.lastScalingPlayPosition = obj.playerPlayheadTime;
                const pulseObj = Object.assign(Object.assign({}, CommonEvents), scalingData);
                obj.lastPlayheadPosition = obj.startCtPbTime;
                obj.lastScalingPlayPosition = obj.startCtPbTime;
                obj.lastPlayerHeight = tag.offsetHeight;
                obj.lastPlayerWidth = tag.offsetWidth;
                obj.lastVideoHeight = tag.videoHeight;
                obj.lastVideoWidth = tag.videoWidth;
                return pulseObj;
            }
        };
        obj.viewCompleted = false;
        let onCompletion = function (eve) {
            const unixEpocheTime = unixTime.now();
            obj.playerSequenceNumber++;
            obj.viewSequenceNumber++;
            const playHeadPosition = getSourceDuration(tag.currentTime);
            const checkMaxPlayheadPosition = getMaxHeadPosition(playHeadPosition);
            const viewWatchTime = getViewWatchTime(eve, unixEpocheTime);
            const getPlaybackTime = getContentPlaybackTime(eve);
            if (obj.isBuffering) {
                var bufferParams = getBufferParams(unixEpocheTime);
                obj.bufferStartTime = unixEpocheTime;
            }
            else {
                if (unixEpocheTime - obj.bufferStartTime > 1e3) {
                    var bufferParams = getBufferParams(unixEpocheTime);
                }
            }
            obj.checkedWatchTime = unixEpocheTime;
            let CommonEvents = Object.assign(Object.assign(Object.assign(Object.assign({ beacon_domain: obj.beaconDomain, environment_id: actionableData === null || actionableData === void 0 ? void 0 : actionableData.environment_id, event_name: eve, player_sequence_number: obj.playerSequenceNumber, view_sequence_number: obj.viewSequenceNumber, fastpix_api_version: obj.fastpixApiVersion, fastpix_viewer_id: obj.fastpixViewerId, player_instance_id: obj.playerInstanceId, player_playhead_time: playHeadPosition, session_expiry_time: obj.sessionExpiry, video_id: actionableData === null || actionableData === void 0 ? void 0 : actionableData.video_id, view_id: obj.viewId, viewer_timestamp: unixEpocheTime }, checkMaxPlayheadPosition), viewWatchTime), getPlaybackTime), bufferParams);
            switch (eve) {
                case "buffered":
                    const bufferedObj = Object.assign({}, CommonEvents);
                    addData(bufferedObj);
                    obj.lastPlayheadPosition = obj.playerPlayheadTime;
                    obj.lastScalingPlayPosition = obj.playerPlayheadTime;
                    obj.playInProgress = true;
                    obj.lastPlayerHeight = tag.offsetHeight;
                    obj.lastPlayerWidth = tag.offsetWidth;
                    break;
                case "seeked":
                    obj.isBuffering = false;
                    if (!tag.paused) {
                        obj.playStart = true;
                    }
                    const seekTime = validateSeekMetrics();
                    const seekedObj = Object.assign(Object.assign({}, CommonEvents), seekTime);
                    addData(seekedObj);
                    break;
                case "viewCompleted":
                    if (obj.playInProgress) {
                        var scalingData = getScalingData();
                    }
                    const viewCompletedObj = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, CommonEvents), scalingData), obj.requestEvents), obj.playerReady), defVariantEvents), { view_end_time: unixEpocheTime });
                    addData(viewCompletedObj);
                    break;
            }
        };
        tag.destroy = function () {
            onChange();
        };
        tag.fp.destroy = function () {
            onChange();
        };
        let onChange = function () {
            if (unixTime.now() - obj.checkedWatchTime < 60000) {
                sanitizeRebufferState(null, { viewerTime: unixTime.now() });
                worker.postMessage({ command: "clearBuffering" });
                if (obj.isSeeking) {
                    onCompletion("seeked");
                    obj.isSeeking = false;
                }
                onCompletion("viewCompleted");
                obj.viewCompleted = true;
                postData(obj.chunksArray);
                window.removeEventListener("beforeunload", onChange);
                window.removeEventListener("pagehide", onWindowHashChange);
                window.removeEventListener("unload", onChange);
                window.removeEventListener("popstate", onChange);
            }
        };
        let onWindowHashChange = function (event) {
            if (!event.persisted) {
                onChange();
            }
        };
        window.addEventListener("beforeunload", onChange, false);
        window.addEventListener("pagehide", onWindowHashChange, false);
        window.addEventListener("unload", onChange, false);
        window.addEventListener("popstate", onChange, false);
        window.addEventListener('online', function () {
            worker.postMessage({ command: "stopTimeout" });
            worker.postMessage({ command: "sendFirstChunk" });
        });
        let loaderTiming = {
            exists: function () {
                let page = performance;
                return void 0 !== (page && page.timing);
            },
            domContentLoadedEventEnd: function () {
                let page = performance;
                let dom = page && page.timing;
                return dom && dom.domContentLoadedEventEnd;
            },
            navigationStart: function () {
                let page = performance;
                let nav = page && page.timing;
                return nav && nav.navigationStart;
            }
        };
        obj.playerReady = {};
        let getPlayerReadyParameters = function () {
            let metaData = videoStateData();
            if (actionableData === null || actionableData === void 0 ? void 0 : actionableData.player_init_time) {
                obj.playerReady["player_startup_time"] = unixTime.now() - (actionableData === null || actionableData === void 0 ? void 0 : actionableData.player_init_time);
            }
            ["video_source_duration", "view_dropped_frame_count"].map((e) => obj.playerReady[e] = metaData[e]);
            let pageNavigationStart = loaderTiming.navigationStart();
            let pageDomLoaded = loaderTiming.domContentLoadedEventEnd();
            if (pageDomLoaded || (actionableData === null || actionableData === void 0 ? void 0 : actionableData.player_init_time)) {
                let pageloadtime = Math.min(actionableData.player_init_time || 1 / 0, pageDomLoaded || 1 / 0) - pageNavigationStart;
                obj.playerReady["page_load_time"] = pageloadtime;
            }
            return obj.playerReady;
        };
        if (!obj.emitPlayerReady) {
            const playerReadyParameters = getPlayerReadyParameters();
            emitEvents("playerReady", playerReadyParameters);
        }
        obj.isError = false;
        let handleErrorEvents = function (param) {
            sanitizeRebufferState(null, { viewerTime: unixTime.now() });
            worker.postMessage({ command: "clearBuffering" });
            emitEvents("error", param);
            obj.isError = true;
            obj.playStart = false;
        };
        obj.lastBufferViewerTimer = null;
        obj.lastBufferPlayTime = null;
        obj.recentPlayheadUpdateTime = null;
        obj.bufferingFlag = false;
        const evaluateBuffering = function (prevValue, currValue) {
            if (obj.isSeeking || !obj.playheadBufferFlag) {
                sanitizeRebufferState(prevValue, currValue);
            }
            else {
                if (null !== obj.lastBufferViewerTimer) {
                    if (getSourceDuration(tag.currentTime) === obj.lastBufferPlayTime) {
                        const bufferReliability = currValue.viewerTime - obj.recentPlayheadUpdateTime;
                        if (bufferReliability >= 1000) {
                            if (!obj.bufferingFlag) {
                                obj.bufferingFlag = true;
                                emitEvents("buffering");
                                obj.bufferStartTime = currValue.viewerTime;
                                obj.isBuffering = true;
                            }
                        }
                        obj.lastBufferViewerTimer = currValue.viewerTime;
                    }
                    else {
                        sanitizeRebufferState(prevValue, currValue, true);
                    }
                }
                else {
                    configureRebufferState(currValue.viewerTime);
                }
            }
        };
        const eraseRebufferHistory = function () {
            obj.lastBufferViewerTimer = null;
            obj.lastBufferPlayTime = null;
            obj.recentPlayheadUpdateTime = null;
        };
        const configureRebufferState = function (timer) {
            obj.lastBufferViewerTimer = timer;
            obj.lastBufferPlayTime = getSourceDuration(tag.currentTime);
            obj.recentPlayheadUpdateTime = timer;
        };
        const sanitizeRebufferState = function (currValue, prevValue, bool) {
            let arg = arguments.length > 2 && (void 0 !== arguments[2] && arguments[2]);
            if (obj.bufferingFlag) {
                obj.bufferingFlag = false;
                emitEvents("buffered");
                obj.isBuffering = false;
            }
            else {
                if (null === obj.lastBufferViewerTimer) {
                    return;
                }
                let start = getSourceDuration(tag.currentTime) - obj.lastBufferPlayTime;
                let end = prevValue.viewerTime - obj.recentPlayheadUpdateTime;
                if (start > 0) {
                    if (end - start > 250) {
                        obj.lastBufferViewerTimer = null;
                        emitEvents("buffering");
                        obj.isBuffering = true;
                        obj.bufferStartTime = obj.recentPlayheadUpdateTime;
                        emitEvents("buffered");
                        obj.isBuffering = false;
                    }
                }
            }
            if (arg) {
                configureRebufferState(prevValue.viewerTime);
            }
            else {
                eraseRebufferHistory();
            }
        };
        obj.startCtPbTime = 0;
        obj.prevCtPbTime = 0;
        const startPlayBack = function () {
            if (obj.playerPlayheadTime - obj.prevCtPbTime < 300 && obj.playerPlayheadTime > obj.prevCtPbTime) {
                obj.startCtPbTime += obj.playerPlayheadTime - obj.prevCtPbTime;
            }
            obj.prevCtPbTime = obj.playerPlayheadTime;
        };
        const htmlEvents = ["loadstart", "pause", "play", "playing", "seeking", "seeked", "timeupdate", "ratechange", "stalled", "waiting", "error", "ended"];
        let videoTagError = {
            1: "MEDIA_ERR_ABORTED",
            2: "MEDIA_ERR_NETWORK",
            3: "MEDIA_ERR_DECODE",
            4: "MEDIA_ERR_SRC_NOT_SUPPORTED"
        };
        let sendViewBegin = true;
        htmlEvents.forEach((name) => {
            tag.addEventListener(name, function () {
                if (name === "timeupdate") {
                    obj.playerPlayheadTime = getSourceDuration(video.currentTime);
                    if (obj.playInProgress) {
                        startPlayBack();
                    }
                    if (obj.playbackheartbeatstarted) {
                        evaluateBuffering("startBuffering", { viewerTime: unixTime.now() });
                    }
                }
                else if (name === "play") {
                    if (((unixTime.now() - obj.checkedWatchTime) > 36E5) && obj.checkedWatchTime > 0) {
                        sendViewBegin = true;
                    }
                    if (sendViewBegin) {
                        emitEvents("viewBegin");
                        worker.postMessage({ command: "sendFirstChunk" });
                        sendViewBegin = false;
                    }
                    obj.isError = false;
                    emitEvents("play");
                    obj.playStart = true;
                    obj.viewCompleted = false;
                    worker.postMessage({ command: "stopTimeout" });
                    worker.postMessage({ command: "startInterval" });
                    worker.postMessage({ command: "checkBuffering" });
                }
                else if (name === "playing") {
                    emitEvents("playing");
                    obj.playheadBufferFlag = true;
                    worker.postMessage({ command: "checkBuffering" });
                }
                else if (name === "pause") {
                    sanitizeRebufferState(null, { viewerTime: unixTime.now() });
                    worker.postMessage({ command: "clearBuffering" });
                    emitEvents("pause");
                    obj.playStart = false;
                    obj.playInProgress = false;
                }
                else if (name === "seeking") {
                    const viewerTime = unixTime.now();
                    sanitizeRebufferState(null, { viewerTime: unixTime.now() });
                    if (obj.isSeeking && viewerTime - obj.seekingViewerTime <= 2E3) {
                        obj.seekingViewerTime = viewerTime;
                    }
                    else {
                        if (obj.isSeeking) {
                            validateSeekMetrics();
                        }
                        obj.seekingViewerTime = viewerTime;
                        obj.seekCount++;
                        emitEvents("seeking");
                        obj.isSeeking = true;
                    }
                    obj.playInProgress = false;
                }
                else if (name === "seeked") {
                    if (tag.paused) {
                        sanitizeRebufferState(null, { viewerTime: unixTime.now() });
                    }
                    else {
                        evaluateBuffering("startBuffering", { viewerTime: unixTime.now() });
                        obj.playbackheartbeatstarted = true;
                    }
                    emitEvents("seeked");
                    obj.isSeeking = false;
                }
                else if (name === "error") {
                    if (tag.error && 1 !== tag.error.code) {
                        let result = {};
                        result.player_error_code = tag.error.code;
                        result.player_error_message = videoTagError[tag.error.code] || tag.error.message;
                        handleErrorEvents(result);
                    }
                }
                else {
                    emitEvents(name);
                }
            });
        });
        var after = ["x-request-id", "cf-ray", "x-amz-cf-id", "x-akamai-request-id"];
        var before = ["x-cdn", "content-type"].concat(after);
        function removeCharacters(className) {
            let map = {};
            return (className = className || "").trim().split(/[\r\n]+/).forEach(function (pair) {
                if (pair) {
                    let namespaces = pair.split(": ");
                    let letter = namespaces.shift();
                    if (letter) {
                        if (before.indexOf(letter.toLowerCase()) >= 0 || 0 === letter.toLowerCase().indexOf("x-litix-")) {
                            map[letter] = namespaces.join(": ");
                        }
                    }
                }
            }), map;
        }
        let fail = function (reqargs) {
            if (reqargs && "function" == typeof reqargs.getAllResponseHeaders) {
                return removeCharacters(reqargs.getAllResponseHeaders());
            }
        };
        let parse = function (event) {
            if (!event) {
                return {};
            }
            let pageStartTime = loaderTiming.navigationStart();
            let requestLoading = event.loading;
            let reqStart = requestLoading ? requestLoading.start : event.trequest;
            let reqFirst = requestLoading ? requestLoading.first : event.tfirst;
            let reqLoad = requestLoading ? requestLoading.end : event.tload;
            return {
                bytesLoaded: event.total,
                requestStart: Math.round(pageStartTime + reqStart),
                responseStart: Math.round(pageStartTime + reqFirst),
                responseEnd: Math.round(pageStartTime + reqLoad)
            };
        };
        let totalLatency = 0;
        let everyThroughput = 0;
        let tdf = 0;
        let reqCount = 0;
        let totalRequestFiles = 0;
        let reqFailedCount = 0;
        let reqCanceledCount = 0;
        let viewMinReqThroughput = 0;
        let viewMaxReqLatency = 0;
        function handleReqCompleted(req, eve) {
            let latency;
            let variation;
            let reqStart = eve.request_start;
            let reqResStart = eve.request_response_start;
            let reqResEnd = eve.request_response_end;
            let bytesLength = eve.request_bytes_loaded;
            obj.reqObj = {};
            if (reqCount++, reqResStart ? (latency = reqResStart - (null != reqStart ? reqStart : 0), variation = (null != reqResEnd ? reqResEnd : 0) - reqResStart) : variation = (null != reqResEnd ? reqResEnd : 0) - (null != reqStart ? reqStart : 0), variation > 0 && (bytesLength && bytesLength > 0)) {
                let throughputRequest = bytesLength / variation * 8E3;
                totalRequestFiles++;
                everyThroughput += bytesLength;
                tdf += variation;
                if (viewMinReqThroughput === 0 || viewMinReqThroughput > throughputRequest) {
                    obj.reqObj["view_min_request_throughput"] = Math.min(viewMinReqThroughput || 1 / 0, throughputRequest);
                    viewMinReqThroughput = throughputRequest;
                }
                obj.reqObj["view_avg_request_throughput"] = everyThroughput / tdf * 8E3;
                obj.reqObj["view_request_count"] = reqCount;
                if (latency > 0) {
                    totalLatency += latency;
                    if (viewMaxReqLatency === 0 || viewMaxReqLatency > latency) {
                        obj.reqObj["view_max_request_latency"] = Math.max(viewMaxReqLatency || 0, latency);
                        viewMaxReqLatency = latency;
                    }
                    obj.reqObj["view_avg_request_latency"] = totalLatency / totalRequestFiles;
                }
            }
        }
        ;
        function handleRequestCanceled() {
            obj.reqObj = {};
            reqCount++;
            reqCanceledCount++;
            obj.reqObj["view_request_count"] = reqCount;
            obj.reqObj["view_request_canceled_count"] = reqCanceledCount;
        }
        function handleRequestFailed() {
            obj.reqObj = {};
            reqCount++;
            reqFailedCount++;
            obj.reqObj["view_request_count"] = reqCount;
            obj.reqObj["view_request_failed_count"] = reqFailedCount;
        }
        function brief(a) {
            if (a) {
                let key2 = after.find(function (prefix) {
                    return void 0 !== a[prefix];
                });
                return key2 ? a[key2] : void 0;
            }
        }
        function handleVariantChanged(arg, params) {
            let metaData = videoStateData();
            let handleAdaptationEvent = {};
            ["video_source_height", "video_source_width", "video_source_duration", "video_source_hostname", "video_source_domain", "video_source_url"].map((eve) => handleAdaptationEvent[eve] = metaData[eve]);
            emitEvents(arg, Object.assign(Object.assign({}, params), handleAdaptationEvent));
        }
        if (_hlsjs) {
            let hlsProgress = function (object) {
                let objLength;
                let replace = parseInt(http.version);
                return 1 === replace && (null !== object.programDateTime && (objLength = object.programDateTime)), 0 === replace && (null !== object.pdt && (objLength = object.pdt)), objLength;
            };
            let hlsManifest = function (position, data) {
                let sourceLevels = data.levels;
                let sourceDetails = data.audioTracks;
                let sourceUrl = data.url;
                let sourceStats = data.stats;
                let sourceNetwork = data.networkDetails;
                let sessionInfo = data.sessionData;
                let getSourceLevels = {};
                let getSourceDetails = {};
                sourceLevels.forEach(function (func, id) {
                    getSourceLevels[id] = {
                        width: func.width,
                        height: func.height,
                        bitrate: func.bitrate,
                        attrs: func.attrs
                    };
                });
                sourceDetails.forEach(function (data, index) {
                    getSourceDetails[index] = {
                        name: data.name,
                        language: data.lang,
                        bitrate: data.bitrate
                    };
                });
                let t = parse(sourceStats);
                let manifestBytes = t.bytesLoaded;
                let manifestReqStart = t.requestStart;
                let manifestResStart = t.responseStart;
                let manifestResEnd = t.responseEnd;
                let reqEvent = {
                    request_event_type: position,
                    request_bytes_loaded: manifestBytes,
                    request_start: manifestReqStart,
                    request_response_start: manifestResStart,
                    request_response_end: manifestResEnd,
                    request_type: "manifest",
                    request_hostname: getHostDomainName("hostname", sourceUrl),
                    request_response_headers: fail(sourceNetwork),
                    request_rendition_lists: {
                        media: getSourceLevels,
                        audio: getSourceDetails,
                        video: {}
                    }
                };
                handleReqCompleted("requestCompleted", reqEvent);
                emitEvents("requestCompleted", Object.assign(Object.assign({}, reqEvent), obj.reqObj));
            };
            _hlsjs.on(http.Events.MANIFEST_LOADED, hlsManifest);
            let hlsLevelLoader = function (levelLoadString, levelLoadEvent) {
                let levelConfigDetails = levelLoadEvent.details;
                let eventLevel = levelLoadEvent.level;
                let getNetworkDetails = levelLoadEvent.networkDetails;
                let levelLoadStats = levelLoadEvent.stats;
                let timerData = parse(levelLoadStats);
                let levelBytesLoaded = timerData.bytesLoaded;
                let levelReqStart = timerData.requestStart;
                let levelResStart = timerData.responseStart;
                let levelResEnd = timerData.responseEnd;
                let levelLoadResult = levelConfigDetails.fragments[levelConfigDetails.fragments.length - 1];
                let state = hlsProgress(levelLoadResult) + parseInt(levelLoadResult.duration);
                let reqEvent = {
                    request_event_type: levelLoadString,
                    request_bytes_loaded: levelBytesLoaded,
                    request_start: levelReqStart,
                    request_response_start: levelResStart,
                    request_response_end: levelResEnd,
                    request_current_level: eventLevel,
                    request_type: "manifest",
                    request_hostname: getHostDomainName("hostname", levelConfigDetails.url),
                    request_response_headers: fail(getNetworkDetails),
                    video_holdback: levelConfigDetails.holdBack && parseInt(levelConfigDetails.holdBack),
                    video_part_holdback: levelConfigDetails.partHoldBack && parseInt(levelConfigDetails.partHoldBack),
                    video_part_target_duration: levelConfigDetails.partTarget && parseInt(levelConfigDetails.partTarget),
                    video_target_duration: levelConfigDetails.targetduration && parseInt(levelConfigDetails.targetduration),
                    video_source_is_live: levelConfigDetails.live,
                    player_manifest_newest_program_time: isNaN(state) ? void 0 : state
                };
                handleReqCompleted("requestCompleted", reqEvent);
                emitEvents("requestCompleted", Object.assign(Object.assign({}, reqEvent), obj.reqObj));
            };
            _hlsjs.on(http.Events.LEVEL_LOADED, hlsLevelLoader);
            let hlsTrack = function (total, data) {
                let audioDeatils = data.details;
                let audioNetworkDetails = data.networkDetails;
                let audioStats = data.stats;
                let audioTimers = parse(audioStats);
                let audioBytesLoad = audioTimers.bytesLoaded;
                let audioReqStart = audioTimers.requestStart;
                let audioResStart = audioTimers.responseStart;
                let audioResEnd = audioTimers.responseEnd;
                let reqEvents = {
                    request_event_type: total,
                    request_bytes_loaded: audioBytesLoad,
                    request_start: audioReqStart,
                    request_response_start: audioResStart,
                    request_response_end: audioResEnd,
                    request_type: "manifest",
                    request_hostname: getHostDomainName("hostname", audioDeatils.url),
                    request_response_headers: fail(audioNetworkDetails)
                };
                handleReqCompleted("requestCompleted", reqEvents);
                emitEvents("requestCompleted", Object.assign(Object.assign({}, reqEvents), obj.reqObj));
            };
            _hlsjs.on(http.Events.AUDIO_TRACK_LOADED, hlsTrack);
            let hlsFragLoad = function (fragEvent, data) {
                let fragStats = data.stats;
                let fragNetworkDetails = data.networkDetails;
                let params = data.frag;
                fragStats = fragStats || params.stats;
                let fragTimers = parse(fragStats);
                let fragBytesLoaded = fragTimers.bytesLoaded;
                let fragReqStart = fragTimers.requestStart;
                let fragResStart = fragTimers.responseStart;
                let fragResEnd = fragTimers.responseEnd;
                let fragHeaders = fragNetworkDetails ? fail(fragNetworkDetails) : void 0;
                let fragRequestObject = {
                    request_event_type: fragEvent,
                    request_bytes_loaded: fragBytesLoaded,
                    request_start: fragReqStart,
                    request_response_start: fragResStart,
                    request_response_end: fragResEnd,
                    request_hostname: fragNetworkDetails ? getHostDomainName("hostname", fragNetworkDetails.responseURL) : void 0,
                    request_id: fragHeaders ? brief(fragHeaders) : void 0,
                    request_response_headers: fragHeaders,
                    request_media_duration: params.duration,
                    request_url: null == fragNetworkDetails ? void 0 : fragNetworkDetails.responseURL
                };
                if ("main" === params.type) {
                    fragRequestObject.request_type = "media";
                    fragRequestObject.request_current_level = params.level;
                    fragRequestObject.request_video_width = (_hlsjs.levels[params.level] || {}).width;
                    fragRequestObject.request_video_height = (_hlsjs.levels[params.level] || {}).height;
                    fragRequestObject.request_labeled_bitrate = (_hlsjs.levels[params.level] || {}).bitrate;
                }
                else {
                    fragRequestObject.request_type = params.type;
                }
                handleReqCompleted("requestCompleted", fragRequestObject);
                emitEvents("requestCompleted", Object.assign(Object.assign({}, fragRequestObject), obj.reqObj));
            };
            _hlsjs.on(http.Events.FRAG_LOADED, hlsFragLoad);
            let hlsLevelSwitched = function (token, lvl) {
                let i = lvl.level;
                let switches = _hlsjs.levels[i];
                if (switches && (switches.attrs && switches.attrs.BANDWIDTH)) {
                    let frame;
                    let levelBitrate = switches.attrs.BANDWIDTH;
                    let frameRate = parseFloat(switches.attrs["FRAME-RATE"]);
                    if (!isNaN(frameRate)) {
                        frame = frameRate;
                    }
                    if (levelBitrate) {
                        handleVariantChanged("variantChanged", {
                            video_source_fps: frame,
                            video_source_bitrate: levelBitrate,
                            video_source_width: switches.width,
                            video_source_height: switches.height,
                            video_source_rendition_name: switches.name,
                            video_source_codec: null == switches ? void 0 : switches.videoCodec
                        });
                    }
                    else {
                        console.warn("missing BANDWIDTH from HLS manifest parsed by HLS.js");
                    }
                }
            };
            _hlsjs.on(http.Events.LEVEL_SWITCHED, hlsLevelSwitched);
            let hlsFragAborted = function (canceledEvent, canceledState) {
                let fragDetails = canceledState.frag;
                let fragUrl = fragDetails && fragDetails._url || "";
                handleRequestCanceled();
                emitEvents("requestCanceled", Object.assign({ request_event_type: canceledEvent, request_url: fragUrl, request_type: "media", request_hostname: getHostDomainName("hostname", fragUrl) }, obj.reqObj));
            };
            _hlsjs.on(http.Events.FRAG_LOAD_EMERGENCY_ABORTED, hlsFragAborted);
            let handleReqFailed = function (arg, failedParams) {
                handleRequestFailed();
                emitEvents(arg, Object.assign(Object.assign({}, failedParams), obj.reqObj));
            };
            let hlsError = function (accessor, data) {
                let errorType = data.type;
                let config = data.details;
                let options = data.response;
                let fatal = data.fatal;
                let req = data.frag;
                let error = data.networkDetails;
                let e = (null == req ? void 0 : req.url) || (data.url || "");
                let found = error ? fail(error) : void 0;
                if (config !== http.ErrorDetails.MANIFEST_LOAD_ERROR && (config !== http.ErrorDetails.MANIFEST_LOAD_TIMEOUT && (config !== http.ErrorDetails.FRAG_LOAD_ERROR && (config !== http.ErrorDetails.FRAG_LOAD_TIMEOUT && (config !== http.ErrorDetails.LEVEL_LOAD_ERROR && (config !== http.ErrorDetails.LEVEL_LOAD_TIMEOUT && (config !== http.ErrorDetails.AUDIO_TRACK_LOAD_ERROR && (config !== http.ErrorDetails.AUDIO_TRACK_LOAD_TIMEOUT && (config !== http.ErrorDetails.SUBTITLE_LOAD_ERROR &&
                    (config !== http.ErrorDetails.SUBTITLE_LOAD_TIMEOUT && (config !== http.ErrorDetails.KEY_LOAD_ERROR && config !== http.ErrorDetails.KEY_LOAD_TIMEOUT)))))))))) ||
                    handleReqFailed("requestFailed", {
                        request_error: config,
                        request_url: e,
                        request_hostname: getHostDomainName("hostname", e),
                        request_id: found ? brief(found) : void 0,
                        request_type: config === http.ErrorDetails.FRAG_LOAD_ERROR || config === http.ErrorDetails.FRAG_LOAD_TIMEOUT ? "media" : config === http.ErrorDetails.AUDIO_TRACK_LOAD_ERROR || config === http.ErrorDetails.AUDIO_TRACK_LOAD_TIMEOUT ? "audio" : config === http.ErrorDetails.SUBTITLE_LOAD_ERROR || config === http.ErrorDetails.SUBTITLE_LOAD_TIMEOUT ? "subtitle" : config === http.ErrorDetails.KEY_LOAD_ERROR || config === http.ErrorDetails.KEY_LOAD_TIMEOUT ? "encryption" : "manifest",
                        request_error_code: null == options ? void 0 : options.code,
                        request_error_text: null == options ? void 0 : options.text
                    }), fatal) {
                    let err;
                    let player_error_context = "".concat(e ? "url: ".concat(e, "\n") : "") + "".concat(options && (options.code || options.text) ? "response: ".concat(options.code, ", ").concat(options.text, "\n") : "") + "".concat(data.reason ? "failure reason: ".concat(data.reason, "\n") : "") + "".concat(data.level ? "level: ".concat(data.level, "\n") : "") + "".concat(data.parent ? "parent stream controller: ".concat(data.parent, "\n") : "") + "".concat(data.buffer ? "buffer length: ".concat(data.buffer, "\n") : "") + "".concat(data.error ? "error: ".concat(data.error, "\n") : "") + "".concat(data.event ? "event: ".concat(data.event, "\n") : "") + "".concat(data.err ? "error message: ".concat(null === (err = data.err) || void 0 === err ? void 0 : err.message, "\n") : "");
                    handleErrorEvents({
                        player_error_code: errorType,
                        player_error_message: config,
                        player_error_context: player_error_context
                    });
                }
            };
            _hlsjs.on(http.Events.ERROR, hlsError);
        }
    };
}
const fastpixMetrix = new HlsPlayer();

class FastPixPlayer extends HTMLElement {
    constructor() {
        super();

        // Shadow DOM setup
        this.attachShadow({ mode: 'open' });

        // HLS.js setup
        this.hls = new Hls();
        this.video = document.createElement('video');

        console.log("volume", this.video.volume)

        console.log("visiblerestry___", this.retryButtonVisible)

        // Check if the browser is Firefox
        this.isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

        console.log("firefoxCheck___", this.isFirefox)

        // Remove controls from the video element
        this.video.controls = false;
        this.seekBarVisible = false;

        // New property to track initial play button click
        this.initialPlayClick = true;

        // New Property to track retry button visible or not
        this.retryButtonVisible = false;

        console.log("asdfsda___", navigator)

        // Listen for HLS events
        this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('Manifest parsed');
            this.hls.attachMedia(this.video);
        });

        // Define showError method inside the constructor
        this.showError = function (errorMessage) {
            // Create a div for the error message
            const errorDiv = document.createElement('div');
            errorDiv.textContent = errorMessage;
            errorDiv.style.color = '#fff';
            errorDiv.style.position = 'absolute';
            errorDiv.style.top = '50%';
            errorDiv.style.left = '50%';
            errorDiv.style.transform = 'translate(-50%, -50%)';
            errorDiv.style.textAlign = 'center';
            errorDiv.style.zIndex = '9999'; // Ensure it's above other elements
            errorDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            errorDiv.style.padding = '1.25rem';
            errorDiv.style.borderRadius = '0.313rem';

            // Hide all controls
            this.playPauseButton.style.display = 'none';
            this.timeDisplay.style.display = 'none';
            this.seekBar.style.display = 'none';
            this.volumeControl.style.display = 'none';
            this.pipButton.style.display = 'none';
            this.fullScreenButton.style.display = 'none';
            // this.ccButton.style.display = "none";
            this.volumeButton.style.display = 'none';
            this.increaseTimeButton.style.display = 'none';
            this.decreaseTimeButton.style.display = 'none';

            // Set background color of parent div to black
            this.parentDiv.style.backgroundColor = '#000';

            // Append the error message div to the parent div in the shadow DOM
            this.parentDiv.appendChild(errorDiv);
        };

        // Create a container div for positioning
        this.parentDiv = document.createElement("div")
        this.parentDiv.style.position = 'relative';


        // Create subtitle menu container
        this.subtitleMenu = document.createElement('div');
        this.subtitleMenu.style.display = 'none'; // Initially hide the subtitle menu

        // Create CC button
        this.ccButton = document.createElement('button');
        this.ccButton.className = 'ccButton';
        this.ccButton.innerHTML = `<svg width="24" height="24" viewBox="0 0 49 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.9444 14.6667C14.6 14.6667 13.5 15.8667 13.5 17.3334V30.6667C13.5 32.1334 14.6 33.3334 15.9444 33.3334H33.0556C34.4 33.3334 35.5 32.1334 35.5 30.6667V17.3334C35.5 15.8667 34.4 14.6667 33.0556 14.6667H15.9444ZM15.9444 22.6667H19.6111V25.3334H15.9444V22.6667ZM26.9444 30.6667H15.9444V28H26.9444V30.6667ZM33.0556 30.6667H29.3889V28H33.0556V30.6667ZM33.0556 25.3334H22.0556V22.6667H33.0556V25.3334Z" fill="white"/>
        <path d="M15.9444 13.6667C13.9676 13.6667 12.5 15.3981 12.5 17.3334V30.6667C12.5 32.602 13.9676 34.3334 15.9444 34.3334H33.0556C35.0324 34.3334 36.5 32.602 36.5 30.6667V17.3334C36.5 15.3981 35.0324 13.6667 33.0556 13.6667H15.9444ZM16.9444 23.6667H18.6111V24.3334H16.9444V23.6667ZM25.9444 29.6667H16.9444V29H25.9444V29.6667ZM32.0556 29.6667H30.3889V29H32.0556V29.6667ZM32.0556 24.3334H23.0556V23.6667H32.0556V24.3334Z" stroke="black" stroke-opacity="0.15" stroke-width="2"/>
        <path d="M15.9444 14.6667C14.6 14.6667 13.5 15.8667 13.5 17.3334V30.6667C13.5 32.1334 14.6 33.3334 15.9444 33.3334H33.0556C34.4 33.3334 35.5 32.1334 35.5 30.6667V17.3334C35.5 15.8667 34.4 14.6667 33.0556 14.6667H15.9444ZM15.9444 22.6667H19.6111V25.3334H15.9444V22.6667ZM26.9444 30.6667H15.9444V28H26.9444V30.6667ZM33.0556 30.6667H29.3889V28H33.0556V30.6667ZM33.0556 25.3334H22.0556V22.6667H33.0556V25.3334Z" fill="white"/>
        <path d="M15.9444 13.6667C13.9676 13.6667 12.5 15.3981 12.5 17.3334V30.6667C12.5 32.602 13.9676 34.3334 15.9444 34.3334H33.0556C35.0324 34.3334 36.5 32.602 36.5 30.6667V17.3334C36.5 15.3981 35.0324 13.6667 33.0556 13.6667H15.9444ZM16.9444 23.6667H18.6111V24.3334H16.9444V23.6667ZM25.9444 29.6667H16.9444V29H25.9444V29.6667ZM32.0556 29.6667H30.3889V29H32.0556V29.6667ZM32.0556 24.3334H23.0556V23.6667H32.0556V24.3334Z" stroke="black" stroke-opacity="0.15" stroke-width="2"/>
        </svg>`;
        this.ccButton.style.color = "#fff";
        // this.ccButton.style.display = "none";

        // Listen for CC button clicks
        this.ccButton.addEventListener('click', () => {
            // Check if subtitle menu is currently displayed
            if (this.subtitleMenu.style.display === 'flex') {
                // If subtitle menu is displayed, hide it
                this.subtitleMenu.style.display = 'none';
            } else {
                // If subtitle menu is not displayed, show it
                this.toggleSubtitlesMenu();
            }
        });

        // Create a retry button element
        this.retryButton = document.createElement('button');
        // retry svg
        this.retryButton.innerHTML = `<svg width="25%" height="25%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 6V2L7 7L12 12V8C15.31 8 18 10.69 18 14C18 17.31 15.31 20 12 20C8.69 20 6 17.31 6 14H4C4 18.42 7.58 22 12 22C16.42 22 20 18.42 20 14C20 9.58 16.42 6 12 6Z" fill="#5D09C7"/>
        </svg>`;
        this.retryButton.className = "retryButton";
        this.retryButton.style.position = 'absolute';
        this.retryButton.style.top = '50%';
        this.retryButton.style.left = '50%';
        this.retryButton.style.transform = 'translate(-50%, -50%)';
        this.retryButton.style.display = 'none'; // Initially hide the retry button
        this.retryButton.style.background = 'transparent';

        // Listen for click events on the retry button
        this.retryButton.addEventListener('click', () => {
            this.retry();
        });

        this.video.addEventListener('loadedmetadata', () => {
            console.log("videoWidth____", this.video.videoWidth)
            // Assuming this.video is your <video> element
            console.log('Buffered ranges:', this.video.buffered);

            console.log('enabled___', document.pictureInPictureEnabled ? true : false)

            // If you want to log each individual buffered range
            for (let i = 0; i < this.video.buffered.length; i++) {
                console.log(`Buffered range ${i}: ${this.video.buffered.start(i)} - ${this.video.buffered.end(i)}`);
            }

        })

        // Listen for play event on the video element
        this.video.addEventListener('play', () => {
            // Initial Pause Button
            this.playPauseButton.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M6 19H10V5H6V19ZM14 5V19H18V5H14Z" fill="#fff"/>
             </svg>
             `;
        });

        // Listen for pause event on the video element
        this.video.addEventListener('pause', () => {
            this.playPauseButton.innerHTML = `<svg width="32" height="32" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.5 14C3.36739 14 3.24021 13.9473 3.14645 13.8536C3.05268 13.7598 3 13.6326 3 13.5V2.5C3.00001 2.41312 3.02267 2.32773 3.06573 2.25227C3.1088 2.17681 3.17078 2.11387 3.24558 2.06966C3.32037 2.02545 3.4054 2.00149 3.49227 2.00015C3.57915 1.9988 3.66487 2.02012 3.741 2.062L13.741 7.562C13.8194 7.60516 13.8848 7.66857 13.9303 7.74562C13.9758 7.82266 13.9998 7.91051 13.9998 8C13.9998 8.08949 13.9758 8.17734 13.9303 8.25438C13.8848 8.33143 13.8194 8.39484 13.741 8.438L3.741 13.938C3.66718 13.9786 3.58427 14 3.5 14Z" fill="#fff"/>
            </svg>`;
        });

        // Create a seek bar
        // Create a seek bar
        this.seekBar = document.createElement('input');
        this.seekBar.className = "seekBar"
        this.seekBar.type = "range";
        this.seekBar.min = "0";
        this.seekBar.value = "0";
        this.seekBar.step = '0.01'; //each step
        // this.seekBar.style.width = "96%";
        // this.seekBar.style.position = "absolute";
        // this.seekBar.style.height = "3px";
        // this.seekBar.style.bottom = "50px";
        // this.seekBar.style.left = "2%";
        // this.seekBar.style.right = "2%";
        this.seekBar.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
        // Hide the seek bar initially
        this.seekBar.style.display = 'none';

        // Disable default styling in Webkit
        this.seekBar.style.webkitAppearance = 'none';
        this.seekBar.style.borderRadius = '5px'; // Optional: Add border-radius for a rounded look
        // Set the background color for the seek bar track (gray)

        // Disable default styling in Mozilla
        this.seekBar.style.mozAppearance = 'none';

        // Create play/pause button
        this.playPauseButton = document.createElement('button');
        this.playPauseButton.className = 'playPauseButton';
        this.playPauseButton.id = "playPauseButton"

        // Create a parent-div for bottom right controls
        this.bottomRightDiv = document.createElement('div');
        this.bottomRightDiv.className = "bottomRightContainer";

        // create picture-in-picture button
        this.pipButton = document.createElement('button');
        this.pipButton.className = 'pipButton';
        // this.pipButton.setAttribute('id', 'pip-button');
        this.pipButton.innerHTML = `<svg width="24" height="24" id="pipButtonSvg" viewBox="0 0 41 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M28.2778 22.8889H19.3889V29.5556H28.2778V22.8889ZM32.7223 31.7778V16.2C32.7223 14.9778 31.7223 14 30.5001 14H10.5001C9.27783 14 8.27783 14.9778 8.27783 16.2V31.7778C8.27783 33 9.27783 34 10.5001 34H30.5001C31.7223 34 32.7223 33 32.7223 31.7778ZM30.5001 31.8H10.5001V16.1889H30.5001V31.8Z" fill="white"/>
        <path d="M28.2778 22.8889H19.3889V29.5556H28.2778V22.8889ZM32.7223 31.7778V16.2C32.7223 14.9778 31.7223 14 30.5001 14H10.5001C9.27783 14 8.27783 14.9778 8.27783 16.2V31.7778C8.27783 33 9.27783 34 10.5001 34H30.5001C31.7223 34 32.7223 33 32.7223 31.7778ZM30.5001 31.8H10.5001V16.1889H30.5001V31.8Z" fill="white"/>
        </svg>
        
        `;
        this.pipButton.style.display = "none"; // might remove later

        // Create full-screen button
        this.fullScreenButton = document.createElement('button');
        this.fullScreenButton.className = 'fullScreenButton';
        this.fullScreenButton.innerHTML = `<svg width="24" height="24" viewBox="0 0 44 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.2227 21.334H14.6671V16.0007H19.556V13.334H12.2227V21.334Z" fill="white"/>
        <path d="M12.2227 21.334H14.6671V16.0007H19.556V13.334H12.2227V21.334Z" fill="white"/>
        <path d="M24.4443 13.334V16.0007H29.3332V21.334H31.7777V13.334H24.4443Z" fill="white"/>
        <path d="M24.4443 13.334V16.0007H29.3332V21.334H31.7777V13.334H24.4443Z" fill="white"/>
        <path d="M29.3332 31.9993H24.4443V34.666H31.7777V26.666H29.3332V31.9993Z" fill="white"/>
        <path d="M29.3332 31.9993H24.4443V34.666H31.7777V26.666H29.3332V31.9993Z" fill="white"/>
        <path d="M14.6671 26.666H12.2227V34.666H19.556V31.9993H14.6671V26.666Z" fill="white"/>
        <path d="M14.6671 26.666H12.2227V34.666H19.556V31.9993H14.6671V26.666Z" fill="white"/>
        </svg>`; //may include svg in future
        this.fullScreenButton.style.display = "none";
        // this.fullScreenButton.style.transform = 'translateX(50%)';
        // Center the button horizontally

        // Create button to increase currentTime
        this.increaseTimeButton = document.createElement('button');
        // this.increaseTimeButton.className = 'timeControlButtonIncrease';
        this.increaseTimeButton.innerHTML = `<svg id="forwardSeekBtnSvg" width="24" height="24" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24.5 18.6667C24.5 23.08 20.9133 26.6667 16.5 26.6667C12.0867 26.6667 8.50001 23.08 8.50001 18.6667C8.50001 14.2533 12.0867 10.6667 16.5 10.6667V16L23.1667 9.33332L16.5 2.66666V7.99999C10.6067 7.99999 5.83334 12.7733 5.83334 18.6667C5.83334 24.56 10.6067 29.3333 16.5 29.3333C22.3933 29.3333 27.1667 24.56 27.1667 18.6667H24.5Z" fill="white"/>
        <path d="M15.0333 22.6667V16.9733H14.9133L12.5533 17.8133V18.7333L13.9 18.32V22.6667H15.0333Z" fill="currentColor"/>
        <path d="M19.5933 17.04C19.3533 16.9467 19.1 16.9067 18.8067 16.9067C18.5133 16.9067 18.26 16.9467 18.02 17.04C17.78 17.1333 17.58 17.28 17.42 17.48C17.26 17.68 17.1133 17.9333 17.0333 18.24C16.9533 18.5467 16.9 18.9067 16.9 19.3333V20.32C16.9 20.7467 16.9533 21.12 17.0467 21.4133C17.14 21.7067 17.2733 21.9733 17.4467 22.1733C17.62 22.3733 17.82 22.52 18.06 22.6133C18.3 22.7067 18.5533 22.7467 18.8467 22.7467C19.14 22.7467 19.3933 22.7067 19.6333 22.6133C19.8733 22.52 20.0733 22.3733 20.2333 22.1733C20.3933 21.9733 20.5267 21.72 20.62 21.4133C20.7133 21.1067 20.7533 20.7467 20.7533 20.32V19.3333C20.7533 18.9067 20.7 18.5333 20.6067 18.24C20.5133 17.9467 20.38 17.68 20.2067 17.48C20.0333 17.28 19.82 17.1333 19.5933 17.04ZM19.6067 20.4667C19.6067 20.72 19.5933 20.9333 19.5533 21.1067C19.5133 21.28 19.4733 21.4267 19.4067 21.5333C19.34 21.64 19.26 21.72 19.1533 21.76C19.0467 21.8 18.94 21.8267 18.82 21.8267C18.7 21.8267 18.58 21.8 18.4867 21.76C18.3933 21.72 18.3 21.64 18.2333 21.5333C18.1667 21.4267 18.1133 21.28 18.0733 21.1067C18.0333 20.9333 18.02 20.72 18.02 20.4667V19.1733C18.02 18.92 18.0333 18.7067 18.0733 18.5333C18.1133 18.36 18.1533 18.2267 18.2333 18.12C18.3133 18.0133 18.38 17.9333 18.4867 17.8933C18.5933 17.8533 18.7 17.8267 18.82 17.8267C18.94 17.8267 19.06 17.8533 19.1533 17.8933C19.2467 17.9333 19.34 18.0133 19.4067 18.12C19.4733 18.2267 19.5267 18.36 19.5667 18.5333C19.6067 18.7067 19.62 18.92 19.62 19.1733V20.4667H19.6067Z" fill="white"/>
        </svg>   
        `;

        // Create button to decrease currentTime
        this.decreaseTimeButton = document.createElement('button');
        // this.decreaseTimeButton.className = 'timeControlButtonDecrease';
        this.decreaseTimeButton.innerHTML = `<svg width="24" height="24" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.5 7.99999V2.66666L9.83334 9.33332L16.5 16V10.6667C20.9133 10.6667 24.5 14.2533 24.5 18.6667C24.5 23.08 20.9133 26.6667 16.5 26.6667C12.0867 26.6667 8.50001 23.08 8.50001 18.6667H5.83334C5.83334 24.56 10.6067 29.3333 16.5 29.3333C22.3933 29.3333 27.1667 24.56 27.1667 18.6667C27.1667 12.7733 22.3933 7.99999 16.5 7.99999ZM15.0333 22.6667H13.9V18.32L12.5533 18.7333V17.8133L14.9133 16.9733H15.0333V22.6667ZM20.74 20.32C20.74 20.7467 20.7 21.12 20.6067 21.4133C20.5133 21.7067 20.38 21.9733 20.22 22.1733C20.06 22.3733 19.8467 22.52 19.62 22.6133C19.3933 22.7067 19.1267 22.7467 18.8333 22.7467C18.54 22.7467 18.2867 22.7067 18.0467 22.6133C17.8067 22.52 17.6067 22.3733 17.4333 22.1733C17.26 21.9733 17.1267 21.72 17.0333 21.4133C16.94 21.1067 16.8867 20.7467 16.8867 20.32V19.3333C16.8867 18.9067 16.9267 18.5333 17.02 18.24C17.1133 17.9467 17.2467 17.68 17.4067 17.48C17.5667 17.28 17.78 17.1333 18.0067 17.04C18.2333 16.9467 18.5 16.9067 18.7933 16.9067C19.0867 16.9067 19.34 16.9467 19.58 17.04C19.82 17.1333 20.02 17.28 20.1933 17.48C20.3667 17.68 20.5 17.9333 20.5933 18.24C20.6867 18.5467 20.74 18.9067 20.74 19.3333V20.32ZM19.6067 19.1733C19.6067 18.92 19.5933 18.7067 19.5533 18.5333C19.5133 18.36 19.46 18.2267 19.3933 18.12C19.3267 18.0133 19.2467 17.9333 19.14 17.8933C19.0333 17.8533 18.9267 17.8267 18.8067 17.8267C18.6867 17.8267 18.5667 17.8533 18.4733 17.8933C18.38 17.9333 18.2867 18.0133 18.22 18.12C18.1533 18.2267 18.1 18.36 18.06 18.5333C18.02 18.7067 18.0067 18.92 18.0067 19.1733V20.4667C18.0067 20.72 18.02 20.9333 18.06 21.1067C18.1 21.28 18.1533 21.4267 18.22 21.5333C18.2867 21.64 18.3667 21.72 18.4733 21.76C18.58 21.8 18.6867 21.8267 18.8067 21.8267C18.9267 21.8267 19.0467 21.8 19.14 21.76C19.2333 21.72 19.3267 21.64 19.3933 21.5333C19.46 21.4267 19.5133 21.28 19.54 21.1067C19.5667 20.9333 19.5933 20.72 19.5933 20.4667V19.1733H19.6067Z" fill="white"/>
        </svg>        
        `;

        // Hide the +10 and -10 buttons by default
        this.increaseTimeButton.style.display = 'none';
        this.decreaseTimeButton.style.display = 'none';

        // Listen for full-screen button clicks
        this.fullScreenButton.addEventListener('click', () => {
            this.toggleFullScreen();
        });

        // Listen for increase time button clicks
        this.increaseTimeButton.addEventListener('click', () => {
            this.adjustCurrentTimeBy(10); // Increase currentTime by 10 seconds
        });

        // Listen for decrease time button clicks
        this.decreaseTimeButton.addEventListener('click', () => {
            this.adjustCurrentTimeBy(-10); // Decrease currentTime by 10 seconds
        });

        //Initial playback icon
        this.playPauseButton.innerHTML = `<svg width="100%" height="100%" id="initialPlayButton" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.5 14C3.36739 14 3.24021 13.9473 3.14645 13.8536C3.05268 13.7598 3 13.6326 3 13.5V2.5C3.00001 2.41312 3.02267 2.32773 3.06573 2.25227C3.1088 2.17681 3.17078 2.11387 3.24558 2.06966C3.32037 2.02545 3.4054 2.00149 3.49227 2.00015C3.57915 1.9988 3.66487 2.02012 3.741 2.062L13.741 7.562C13.8194 7.60516 13.8848 7.66857 13.9303 7.74562C13.9758 7.82266 13.9998 7.91051 13.9998 8C13.9998 8.08949 13.9758 8.17734 13.9303 8.25438C13.8848 8.33143 13.8194 8.39484 13.741 8.438L3.741 13.938C3.66718 13.9786 3.58427 14 3.5 14Z" fill="currentColor"/>
    </svg>`;
        this.playPauseButton.style.position = 'absolute';
        this.playPauseButton.style.bottom = '50%'; // Adjust as needed
        this.playPauseButton.style.left = '50%'; // Center the button horizontally
        this.playPauseButton.style.transform = 'translateX(-50%)'; // Center the button horizontally

        // Create a parent-div for volumeButton and volume input(volume control)
        this.parentVolumeDiv = document.createElement('div');
        this.parentVolumeDiv.className = "parentVolumeDiv";

        // Create volume/mute button
        this.volumeButton = document.createElement('button');
        this.volumeButton.className = 'volumeButton';
        this.volumeButton.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 9.00047V15.0005H7L12 20.0005V4.00047L7 9.00047H3ZM10 8.83047V15.1705L7.83 13.0005H5V11.0005H7.83L10 8.83047ZM16.5 12.0005C16.5 10.2305 15.48 8.71047 14 7.97047V16.0205C15.48 15.2905 16.5 13.7705 16.5 12.0005ZM14 3.23047V5.29047C16.89 6.15047 19 8.83047 19 12.0005C19 15.1705 16.89 17.8505 14 18.7105V20.7705C18.01 19.8605 21 16.2805 21 12.0005C21 7.72047 18.01 4.14047 14 3.23047Z" fill="white"/>
        </svg>        
        `;
        this.volumeButton.style.display = 'none'; // Assuming you're using Font Awesome for icons

        // Listen for volume/mute button clicks
        this.volumeButton.addEventListener('click', () => {
            if (this.video.muted) {
                // If video is muted, unmute it
                this.video.muted = false;
                this.volumeButton.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9.00047V15.0005H7L12 20.0005V4.00047L7 9.00047H3ZM10 8.83047V15.1705L7.83 13.0005H5V11.0005H7.83L10 8.83047ZM16.5 12.0005C16.5 10.2305 15.48 8.71047 14 7.97047V16.0205C15.48 15.2905 16.5 13.7705 16.5 12.0005ZM14 3.23047V5.29047C16.89 6.15047 19 8.83047 19 12.0005C19 15.1705 16.89 17.8505 14 18.7105V20.7705C18.01 19.8605 21 16.2805 21 12.0005C21 7.72047 18.01 4.14047 14 3.23047Z" fill="white"/>
                </svg>`;
                this.volumeControl.value = this.video.volume; // Update volume control value
                this.volumeControl.style.background = `linear-gradient(to right, #fff 0%, #fff ${(this.video.volume * 100).toFixed(2)}%, rgba(255, 255, 255, 0.1) ${(this.video.volume * 100).toFixed(2)}%, rgba(255, 255, 255, 0.1) 100%)`; // Update volume control background
            } else {
                // If video is not muted, mute it
                this.video.muted = true;
                this.volumeButton.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.33999 2.93457L2.92999 4.34457L7.28999 8.70457L6.99999 9.00457H2.99999V15.0046H6.99999L12 20.0046V13.4146L16.18 17.5946C15.53 18.0846 14.8 18.4746 14 18.7046V20.7646C15.34 20.4646 16.57 19.8446 17.61 19.0146L19.66 21.0646L21.07 19.6546L4.33999 2.93457ZM9.99999 15.1746L7.82999 13.0046H4.99999V11.0046H7.82999L8.70999 10.1246L9.99999 11.4146V15.1746ZM19 12.0046C19 12.8246 18.85 13.6146 18.59 14.3446L20.12 15.8746C20.68 14.7046 21 13.3946 21 12.0046C21 7.72457 18.01 4.14457 14 3.23457V5.29457C16.89 6.15457 19 8.83457 19 12.0046ZM12 4.00457L10.12 5.88457L12 7.76457V4.00457ZM16.5 12.0046C16.5 10.2346 15.48 8.71457 14 7.97457V9.76457L16.48 12.2446C16.49 12.1646 16.5 12.0846 16.5 12.0046Z" fill="white"/>
                </svg>                
                `;
                this.volumeControl.value = 0; // Set volume control value to 0 for muted state
                this.volumeControl.style.background = `linear-gradient(to right, #fff 0%, #fff 0%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.1) 100%)`; // Update volume control background
            }
        });

        // Create a volume control input
        this.volumeControl = document.createElement('input');
        this.volumeControl.className = 'volumeControl';
        this.volumeControl.type = 'range';
        this.volumeControl.min = '0';
        this.volumeControl.max = '1';
        this.volumeControl.step = '0.1'; //each step
        this.volumeControl.value = '1';
        this.volumeControl.style.display = 'none'; // remove later 
        this.volumeControl.style.webkitAppearance = 'none';
        this.volumeControl.style.borderRadius = '0.313rem';
        this.volumeControl.style.mozAppearance = 'none';


        // to add stylings only after click initial play button 
        this.playPauseButton.addEventListener('click', () => {
            if (this.video.paused) {
                this.video.play();
                // Initial Pause Button
                this.playPauseButton.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 19H10V5H6V19ZM14 5V19H18V5H14Z" fill="#fff"/>
                </svg>
                `;

                const video = this.shadowRoot.querySelector('video');
                const videoWidth = video.offsetWidth;
                const videoHeight = video.offsetHeight;

                // Additional code for adjusting position after initial play click
                if (this.initialPlayClick) {

                    this.seekBar.style.display = 'block';
                    this.volumeControl.style.display = "inline-block"
                    this.volumeButton.style.display = "inline-block";
                    this.isFirefox ? this.pipButton.style.display = 'none' : this.pipButton.style.display = 'inline-block';
                    this.fullScreenButton.style.display = 'inline-block';
                    // this.ccButton.style.display = 'inline-block';
                    this.timeDisplay.style.disply = 'inline-block';

                    // Show the +10 and -10 buttons after initial play click
                    this.increaseTimeButton.style.display = 'inline-block';
                    this.increaseTimeButton.style.color = "#fff";
                    this.increaseTimeButton.className = 'timeControlButtonIncrease';

                    // styling and positioning for -10
                    this.decreaseTimeButton.style.display = 'inline-block';
                    this.increaseTimeButton.style.color = "#fff";
                    this.decreaseTimeButton.className = 'timeControlButtonDecrease';

                    // this.playPauseButton.id = "playBackAfterClick";
                    this.initialPlayClick = false; // Update the flag

                }
            } else {
                this.video.pause();
                this.playPauseButton.innerHTML = `<svg width="32" height="32" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3.5 14C3.36739 14 3.24021 13.9473 3.14645 13.8536C3.05268 13.7598 3 13.6326 3 13.5V2.5C3.00001 2.41312 3.02267 2.32773 3.06573 2.25227C3.1088 2.17681 3.17078 2.11387 3.24558 2.06966C3.32037 2.02545 3.4054 2.00149 3.49227 2.00015C3.57915 1.9988 3.66487 2.02012 3.741 2.062L13.741 7.562C13.8194 7.60516 13.8848 7.66857 13.9303 7.74562C13.9758 7.82266 13.9998 7.91051 13.9998 8C13.9998 8.08949 13.9758 8.17734 13.9303 8.25438C13.8848 8.33143 13.8194 8.39484 13.741 8.438L3.741 13.938C3.66718 13.9786 3.58427 14 3.5 14Z" fill="#fff"/>
                            </svg>`;
            }
        });

        // Listen for seekbar 
        this.seekBar.addEventListener('input', () => {
            const seekTime = this.seekBar.value;
            this.video.currentTime = seekTime;
            console.log("seekTime____", seekTime)
        })

        // Listen for volume control input changes
        this.volumeControl.addEventListener('input', () => {
            const volume = this.volumeControl.value;
            const gradient = `linear-gradient(to right, #fff 0%, #fff ${(volume * 100).toFixed(2)}%, rgba(255, 255, 255, 0.1) ${(volume * 100).toFixed(2)}%, rgba(255, 255, 255, 0.1) 100%)`;
            this.volumeControl.style.background = gradient;
            this.video.volume = volume;
            console.log("asdf___", volume)

            // Update volume button state based on whether volume is muted or not
            if (volume === '0') {
                this.video.muted = true;
                this.volumeButton.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.33999 2.93457L2.92999 4.34457L7.28999 8.70457L6.99999 9.00457H2.99999V15.0046H6.99999L12 20.0046V13.4146L16.18 17.5946C15.53 18.0846 14.8 18.4746 14 18.7046V20.7646C15.34 20.4646 16.57 19.8446 17.61 19.0146L19.66 21.0646L21.07 19.6546L4.33999 2.93457ZM9.99999 15.1746L7.82999 13.0046H4.99999V11.0046H7.82999L8.70999 10.1246L9.99999 11.4146V15.1746ZM19 12.0046C19 12.8246 18.85 13.6146 18.59 14.3446L20.12 15.8746C20.68 14.7046 21 13.3946 21 12.0046C21 7.72457 18.01 4.14457 14 3.23457V5.29457C16.89 6.15457 19 8.83457 19 12.0046ZM12 4.00457L10.12 5.88457L12 7.76457V4.00457ZM16.5 12.0046C16.5 10.2346 15.48 8.71457 14 7.97457V9.76457L16.48 12.2446C16.49 12.1646 16.5 12.0846 16.5 12.0046Z" fill="white"/>
                </svg>
                `;
            } else if (volume >= '0.1' && volume <= '0.6') {
                this.video.muted = false;
                this.volumeButton.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.25 7.97V16.02C17.73 15.29 18.75 13.77 18.75 12C18.75 10.23 17.73 8.71 16.25 7.97ZM5.25 9V15H9.25L14.25 20V4L9.25 9H5.25ZM12.25 8.83V15.17L10.08 13H7.25V11H10.08L12.25 8.83Z" fill="white"/>
                </svg>
                `
            } else {
                this.video.muted = false;
                this.volumeButton.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9.00047V15.0005H7L12 20.0005V4.00047L7 9.00047H3ZM10 8.83047V15.1705L7.83 13.0005H5V11.0005H7.83L10 8.83047ZM16.5 12.0005C16.5 10.2305 15.48 8.71047 14 7.97047V16.0205C15.48 15.2905 16.5 13.7705 16.5 12.0005ZM14 3.23047V5.29047C16.89 6.15047 19 8.83047 19 12.0005C19 15.1705 16.89 17.8505 14 18.7105V20.7705C18.01 19.8605 21 16.2805 21 12.0005C21 7.72047 18.01 4.14047 14 3.23047Z" fill="white"/>
                </svg>
                `;
            }

            // Save the volume to localStorage
            this.saveVolumeToLocalStorage();
        });

        // // Add event listener for PiP button clicks
        this.pipButton.addEventListener('click', () => {
            if (document.pictureInPictureEnabled && !this.video.disablePictureInPicture) {
                if (document.pictureInPictureElement) {
                    document.exitPictureInPicture()
                        .then(() => {
                            console.log('Exited Picture-in-Picture');
                        })
                        .catch((error) => {
                            console.error('Error exiting Picture-in-Picture:', error);
                            this.showError('Error exiting Picture-in-Picture');
                        });
                } else {
                    this.video.requestPictureInPicture()
                        .then(() => {
                            console.log('Entered Picture-in-Picture');
                        })
                        .catch((error) => {
                            console.error('Error entering Picture-in-Picture:', error);
                            this.showError('Error entering Picture-in-Picture');
                        });
                }
            } else {
                console.error('Picture-in-Picture is not supported in this browser.');
                this.showError('Picture-in-Picture is not supported in this browser.');
            }
        });

        // Listen for the 'loadedmetadata' event to know when the duration is available
        this.video.addEventListener('loadedmetadata', () => {
            // Add the play/pause button to the left of the volume control below the seek bar
            // this.parentDiv.insertBefore(this.playPauseButton, this.volumeControl);

            // Additional styles for play/pause button in this context
            this.playPauseButton.style.position = 'absolute';
            this.playPauseButton.style.bottom = '50%'; // Adjust as needed
            this.playPauseButton.style.left = '50%'; // Adjust as needed
            this.playPauseButton.style.transform = 'translateX(-50%)'; // Center the button horizontally

            updateTimeDisplay.call(this); // to display initial duration and currentTime before playing
            this.video.addEventListener('timeupdate', updateTimeDisplay.bind(this)); // Bind updateTimeDisplay to this context
        });

        // Listen for double-click on the video element to enter full-screen mode
        this.video.addEventListener('dblclick', () => {
            this.toggleFullScreen();
        });

        // Listen for fullscreenchange event to update full screen button text
        document.addEventListener('fullscreenchange', () => {
            const isFullScreen = !!document.fullscreenElement;
            this.fullScreenButton.innerHTML = isFullScreen ? ` <svg width = "24" height = "24" viewBox = "0 0 49 48" fill = "none" xmlns = "http://www.w3.org/2000/svg" >
            <path d="M19.6115 18.6673H14.7227V21.334H22.056V13.334H19.6115V18.6673Z" fill="white"/>
            <path d="M18.6115 13.334V17.6673H14.7227H13.7227V18.6673V21.334V22.334H14.7227H22.056H23.056V21.334V13.334V12.334H22.056H19.6115H18.6115V13.334Z" stroke="black" stroke-opacity="0.15" stroke-width="2"/>
            <path d="M19.6115 18.6673H14.7227V21.334H22.056V13.334H19.6115V18.6673Z" fill="white"/>
            <path d="M18.6115 13.334V17.6673H14.7227H13.7227V18.6673V21.334V22.334H14.7227H22.056H23.056V21.334V13.334V12.334H22.056H19.6115H18.6115V13.334Z" stroke="black" stroke-opacity="0.15" stroke-width="2"/>
            <path d="M29.3888 18.6673V13.334H26.9443V21.334H34.2777V18.6673H29.3888Z" fill="white"/>
            <path d="M34.2777 17.6673H30.3888V13.334V12.334H29.3888H26.9443H25.9443V13.334V21.334V22.334H26.9443H34.2777H35.2777V21.334V18.6673V17.6673H34.2777Z" stroke="black" stroke-opacity="0.15" stroke-width="2"/>
            <path d="M29.3888 18.6673V13.334H26.9443V21.334H34.2777V18.6673H29.3888Z" fill="white"/>
            <path d="M34.2777 17.6673H30.3888V13.334V12.334H29.3888H26.9443H25.9443V13.334V21.334V22.334H26.9443H34.2777H35.2777V21.334V18.6673V17.6673H34.2777Z" stroke="black" stroke-opacity="0.15" stroke-width="2"/>
            <path d="M26.9443 34.666H29.3888V29.3327H34.2777V26.666H26.9443V34.666Z" fill="white"/>
            <path d="M25.9443 34.666V35.666H26.9443H29.3888H30.3888V34.666V30.3327H34.2777H35.2777V29.3327V26.666V25.666H34.2777H26.9443H25.9443V26.666V34.666Z" stroke="black" stroke-opacity="0.15" stroke-width="2"/>
            <path d="M26.9443 34.666H29.3888V29.3327H34.2777V26.666H26.9443V34.666Z" fill="white"/>
            <path d="M25.9443 34.666V35.666H26.9443H29.3888H30.3888V34.666V30.3327H34.2777H35.2777V29.3327V26.666V25.666H34.2777H26.9443H25.9443V26.666V34.666Z" stroke="black" stroke-opacity="0.15" stroke-width="2"/>
            <path d="M14.7227 29.3327H19.6115V34.666H22.056V26.666H14.7227V29.3327Z" fill="white"/>
            <path d="M13.7227 29.3327V30.3327H14.7227H18.6115V34.666V35.666H19.6115H22.056H23.056V34.666V26.666V25.666H22.056H14.7227H13.7227V26.666V29.3327Z" stroke="black" stroke-opacity="0.15" stroke-width="2"/>
            <path d="M14.7227 29.3327H19.6115V34.666H22.056V26.666H14.7227V29.3327Z" fill="white"/>
            <path d="M13.7227 29.3327V30.3327H14.7227H18.6115V34.666V35.666H19.6115H22.056H23.056V34.666V26.666V25.666H22.056H14.7227H13.7227V26.666V29.3327Z" stroke="black" stroke-opacity="0.15" stroke-width="2"/>
            </svg >`
                :
                `<svg width = "24" height = "24" viewBox = "0 0 44 48" fill = "none" xmlns = "http://www.w3.org/2000/svg" >
            <path d="M12.2227 21.334H14.6671V16.0007H19.556V13.334H12.2227V21.334Z" fill="white"/>
            <path d="M12.2227 21.334H14.6671V16.0007H19.556V13.334H12.2227V21.334Z" fill="white"/>
            <path d="M24.4443 13.334V16.0007H29.3332V21.334H31.7777V13.334H24.4443Z" fill="white"/>
            <path d="M24.4443 13.334V16.0007H29.3332V21.334H31.7777V13.334H24.4443Z" fill="white"/>
            <path d="M29.3332 31.9993H24.4443V34.666H31.7777V26.666H29.3332V31.9993Z" fill="white"/>
            <path d="M29.3332 31.9993H24.4443V34.666H31.7777V26.666H29.3332V31.9993Z" fill="white"/>
            <path d="M14.6671 26.666H12.2227V34.666H19.556V31.9993H14.6671V26.666Z" fill="white"/>
            <path d="M14.6671 26.666H12.2227V34.666H19.556V31.9993H14.6671V26.666Z" fill="white"/>
            </svg >`;
        });

        this.loader = document.createElement('div'); // Create loader element

        // Set up loader styles
        this.loader.className = 'spinner';

        // Hide the loader initially
        this.loader.style.display = 'none';
        this.loader.style.position = 'absolute';
        this.loader.style.bottom = '50%'; // Adjust as needed
        this.loader.style.left = '50%'; // Center the button horizontally
        // this.loader.style.transform = 'translateX(50%)'; // Center the button horizontally

        // Append the video element, button, volumeControl and seek bar to the container div in the shadow DOM
        this.parentDiv.appendChild(this.video);
        this.parentDiv.className = "parent";
        this.parentDiv.appendChild(this.playPauseButton);
        this.parentDiv.appendChild(this.seekBar);

        this.parentDiv.appendChild(this.increaseTimeButton); /* +10 */
        this.parentDiv.appendChild(this.decreaseTimeButton); /* -10 */
        this.parentDiv.appendChild(this.retryButton);

        // Append pipButton and fullScreenElement to bottomRightDiv
        // this.bottomRightDiv.appendChild(this.ccButton);
        this.bottomRightDiv.appendChild(this.pipButton);
        this.bottomRightDiv.appendChild(this.fullScreenButton);
        this.bottomRightDiv.appendChild(this.subtitleMenu);

        // Append the volume/mute button to the parent div
        this.parentVolumeDiv.appendChild(this.volumeButton);
        this.parentVolumeDiv.appendChild(this.volumeControl);

        // Append parentVolumeDiv to parentDiv;
        this.parentDiv.appendChild(this.parentVolumeDiv);
        this.parentDiv.appendChild(this.bottomRightDiv);
        this.parentDiv.appendChild(this.loader);
        this.shadowRoot.appendChild(this.parentDiv);

        // // Check if there are any subtitle tracks
        // this.hasSubtitles = this.video.textTracks.length > 0;

        // // Show or hide CC button based on subtitle availability
        // if (this.hasSubtitles) {
        //     this.ccButton.style.display = 'block'; // might remove later
        // } else {
        //     this.ccButton.style.display = 'none';
        // }

        // Bind 'this' to methods
        this.toggleSubtitlesMenu = this.toggleSubtitlesMenu.bind(this);
        this.changeSubtitleTrack = this.changeSubtitleTrack.bind(this);


        document.addEventListener("DOMContentLoaded", function () {
            const container = document.querySelector(".bottomRightContainer");
            const buttons = container.querySelectorAll(".bottomRightContainer > *");

            function updateVisibility() {
                let prevButton = null;
                buttons.forEach(button => {
                    if (button.offsetParent === null) {
                        button.style.display = 'none'; // Hide the button
                    } else {
                        button.style.display = ''; // Show the button
                        if (prevButton) {
                            prevButton.style.marginRight = '30px'; // Add 30px margin to the previous button
                        }
                        prevButton = button;
                    }
                });
            }

            window.addEventListener("resize", updateVisibility);
            updateVisibility();
        });



    }

    // Define toggleFullScreen outside the constructor
    toggleFullScreen() {
        const element = this.parentDiv;

        if (document.fullscreenElement) {
            // If currently in full-screen mode, exit full-screen
            document.exitFullscreen();
            this.fullScreenButton.innerHTML = `<svg width = "24" height = "24" viewBox = "0 0 44 48" fill = "none" xmlns = "http://www.w3.org/2000/svg" >
            <path d="M12.2227 21.334H14.6671V16.0007H19.556V13.334H12.2227V21.334Z" fill="white"/>
            <path d="M12.2227 21.334H14.6671V16.0007H19.556V13.334H12.2227V21.334Z" fill="white"/>
            <path d="M24.4443 13.334V16.0007H29.3332V21.334H31.7777V13.334H24.4443Z" fill="white"/>
            <path d="M24.4443 13.334V16.0007H29.3332V21.334H31.7777V13.334H24.4443Z" fill="white"/>
            <path d="M29.3332 31.9993H24.4443V34.666H31.7777V26.666H29.3332V31.9993Z" fill="white"/>
            <path d="M29.3332 31.9993H24.4443V34.666H31.7777V26.666H29.3332V31.9993Z" fill="white"/>
            <path d="M14.6671 26.666H12.2227V34.666H19.556V31.9993H14.6671V26.666Z" fill="white"/>
            <path d="M14.6671 26.666H12.2227V34.666H19.556V31.9993H14.6671V26.666Z" fill="white"/>
            </svg > `;
        } else {
            // If not in full-screen mode, request full-screen
            element.requestFullscreen()
                .catch(err => {
                    console.error('Error attempting to enable full-screen mode:', err);
                    this.showError('Error attempting to enable full-screen mode:')
                });
            // exit full screen svg
            this.fullScreenButton.innerHTML = `
                <svg width = "24" height = "24" viewBox = "0 0 49 48" fill = "none" xmlns = "http://www.w3.org/2000/svg" >
            <path d="M19.6115 18.6673H14.7227V21.334H22.056V13.334H19.6115V18.6673Z" fill="white"/>
            <path d="M18.6115 13.334V17.6673H14.7227H13.7227V18.6673V21.334V22.334H14.7227H22.056H23.056V21.334V13.334V12.334H22.056H19.6115H18.6115V13.334Z" stroke="black" stroke-opacity="0.15" stroke-width="2"/>
            <path d="M19.6115 18.6673H14.7227V21.334H22.056V13.334H19.6115V18.6673Z" fill="white"/>
            <path d="M18.6115 13.334V17.6673H14.7227H13.7227V18.6673V21.334V22.334H14.7227H22.056H23.056V21.334V13.334V12.334H22.056H19.6115H18.6115V13.334Z" stroke="black" stroke-opacity="0.15" stroke-width="2"/>
            <path d="M29.3888 18.6673V13.334H26.9443V21.334H34.2777V18.6673H29.3888Z" fill="white"/>
            <path d="M34.2777 17.6673H30.3888V13.334V12.334H29.3888H26.9443H25.9443V13.334V21.334V22.334H26.9443H34.2777H35.2777V21.334V18.6673V17.6673H34.2777Z" stroke="black" stroke-opacity="0.15" stroke-width="2"/>
            <path d="M29.3888 18.6673V13.334H26.9443V21.334H34.2777V18.6673H29.3888Z" fill="white"/>
            <path d="M34.2777 17.6673H30.3888V13.334V12.334H29.3888H26.9443H25.9443V13.334V21.334V22.334H26.9443H34.2777H35.2777V21.334V18.6673V17.6673H34.2777Z" stroke="black" stroke-opacity="0.15" stroke-width="2"/>
            <path d="M26.9443 34.666H29.3888V29.3327H34.2777V26.666H26.9443V34.666Z" fill="white"/>
            <path d="M25.9443 34.666V35.666H26.9443H29.3888H30.3888V34.666V30.3327H34.2777H35.2777V29.3327V26.666V25.666H34.2777H26.9443H25.9443V26.666V34.666Z" stroke="black" stroke-opacity="0.15" stroke-width="2"/>
            <path d="M26.9443 34.666H29.3888V29.3327H34.2777V26.666H26.9443V34.666Z" fill="white"/>
            <path d="M25.9443 34.666V35.666H26.9443H29.3888H30.3888V34.666V30.3327H34.2777H35.2777V29.3327V26.666V25.666H34.2777H26.9443H25.9443V26.666V34.666Z" stroke="black" stroke-opacity="0.15" stroke-width="2"/>
            <path d="M14.7227 29.3327H19.6115V34.666H22.056V26.666H14.7227V29.3327Z" fill="white"/>
            <path d="M13.7227 29.3327V30.3327H14.7227H18.6115V34.666V35.666H19.6115H22.056H23.056V34.666V26.666V25.666H22.056H14.7227H13.7227V26.666V29.3327Z" stroke="black" stroke-opacity="0.15" stroke-width="2"/>
            <path d="M14.7227 29.3327H19.6115V34.666H22.056V26.666H14.7227V29.3327Z" fill="white"/>
            <path d="M13.7227 29.3327V30.3327H14.7227H18.6115V34.666V35.666H19.6115H22.056H23.056V34.666V26.666V25.666H22.056H14.7227H13.7227V26.666V29.3327Z" stroke="black" stroke-opacity="0.15" stroke-width="2"/>
            </svg >

                `;
        }
    }

    // Define toggleFullScreen outside the constructor
    toggleFullScreen() {
        const element = this.parentDiv;

        if (document.fullscreenElement) {
            // If currently in full-screen mode, exit full-screen
            document.exitFullscreen();
        } else {
            // If not in full-screen mode, request full-screen
            element.requestFullscreen()
                .catch(err => {
                    console.error('Error attempting to enable full-screen mode:', err);
                    this.showError('Error attempting to enable full-screen mode:')
                });
        }
    }

    adjustCurrentTimeBy(change) {
        const newTime = Math.min(Math.max(this.video.currentTime + change, 0), this.video.duration);
        this.video.currentTime = newTime;
    }

    // to save volume to local storage
    saveVolumeToLocalStorage() {
        const volume = this.volumeControl.value;
        if (volume === '0') {
            this.volumeButton.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.33999 2.93457L2.92999 4.34457L7.28999 8.70457L6.99999 9.00457H2.99999V15.0046H6.99999L12 20.0046V13.4146L16.18 17.5946C15.53 18.0846 14.8 18.4746 14 18.7046V20.7646C15.34 20.4646 16.57 19.8446 17.61 19.0146L19.66 21.0646L21.07 19.6546L4.33999 2.93457ZM9.99999 15.1746L7.82999 13.0046H4.99999V11.0046H7.82999L8.70999 10.1246L9.99999 11.4146V15.1746ZM19 12.0046C19 12.8246 18.85 13.6146 18.59 14.3446L20.12 15.8746C20.68 14.7046 21 13.3946 21 12.0046C21 7.72457 18.01 4.14457 14 3.23457V5.29457C16.89 6.15457 19 8.83457 19 12.0046ZM12 4.00457L10.12 5.88457L12 7.76457V4.00457ZM16.5 12.0046C16.5 10.2346 15.48 8.71457 14 7.97457V9.76457L16.48 12.2446C16.49 12.1646 16.5 12.0846 16.5 12.0046Z" fill="white"/>
            </svg>`;
        } else if (volume >= '0.1' && volume <= '0.6') {
            this.volumeButton.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.25 7.97V16.02C17.73 15.29 18.75 13.77 18.75 12C18.75 10.23 17.73 8.71 16.25 7.97ZM5.25 9V15H9.25L14.25 20V4L9.25 9H5.25ZM12.25 8.83V15.17L10.08 13H7.25V11H10.08L12.25 8.83Z" fill="white"/>
            </svg>`;
        } else {
            this.volumeButton.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9.00047V15.0005H7L12 20.0005V4.00047L7 9.00047H3ZM10 8.83047V15.1705L7.83 13.0005H5V11.0005H7.83L10 8.83047ZM16.5 12.0005C16.5 10.2305 15.48 8.71047 14 7.97047V16.0205C15.48 15.2905 16.5 13.7705 16.5 12.0005ZM14 3.23047V5.29047C16.89 6.15047 19 8.83047 19 12.0005C19 15.1705 16.89 17.8505 14 18.7105V20.7705C18.01 19.8605 21 16.2805 21 12.0005C21 7.72047 18.01 4.14047 14 3.23047Z" fill="white"/>
            </svg>`;
        }
        localStorage.setItem('savedVolume', volume);
        localStorage.setItem('savedVolumeIcon', this.volumeButton.innerHTML)
    }

    // Function to retry loading the video
    retry() {
        this.video.play()
        this.hideRetryButton(); // Hide the retry button after retrying
    }

    // Method to update responsive styles of controls based on video dimensions
    updateBorderStyle() {
        const video = this.shadowRoot.querySelector('video');
        const videoWidth = video.offsetWidth;
        const videoHeight = video.offsetHeight;

        if (videoWidth < 170) {
            // Hide fullScreenButton when videoWidth is less than 170
            this.pipButton.style.display = '0';
            this.playPauseButton.id = "playPauseButtonMini";
            // this.playPauseButton.style.position = "absolute";
            // this.playPauseButton.style.bottom = "22%";

            this.seekBar.id = "seekBarMini";
            this.timeDisplay.style.display = 'none';
            this.increaseTimeButton.id = "increaseTimeButtonMini";
            this.decreaseTimeButton.id = "decreaseTimeBUttonMini";
            this.bottomRightDiv.id = "bottomRightDivMini";
            // this.pipButton.id = "pipButtonMini";
            // this.fullScreenButton.id = "fullScreenButtonMini";
            this.parentVolumeDiv.id = "parentVolumeMini";
        } else if (videoWidth > 170 && videoWidth <= 469) {
            // Apply red border for small widths
            // video.style.border = "2px solid red";
            this.increaseTimeButton.id = "fowardSeekInsecs";
            this.decreaseTimeButton.id = "backwardSeekInsecs";
            this.playPauseButton.id = "playPauseButtonResponsive";
            this.seekBar.id = "seekBarResponsive";
            // this.pipButton.id = "pipButtonResponsive";
            // this.fullScreenButton.id = "mediaFullScreenResponsive";
            this.bottomRightDiv.id = "bottomRightDivResponsive";
            this.timeDisplay.style.opacity = "timeDisplayResponsive";
            this.parentVolumeDiv.id = "parentVolumeResponsive";
            this.pipButton.style.opacity = '1';
            this.timeDisplay.style.display = 'none';
        } else if (videoWidth >= 470 && videoWidth <= 950) {
            this.increaseTimeButton.id = "fowardSeekInsecsMd";
            this.decreaseTimeButton.id = "backwardSeekInsecsMd";
            this.playPauseButton.id = "playPauseButtonResponsiveMd";
            this.seekBar.id = "seekBarResponsiveMd";
            this.bottomRightDiv.id = "bottomRightDivMd";
            // this.pipButton.id = "pipButtonResponsiveMd";
            // this.fullScreenButton.id = "mediaFullScreenResponsiveMd";
            this.timeDisplay.id = "timeDisplayResponsiveMd";
            this.parentVolumeDiv.id = "parentVolumeResponsiveMd";
            this.pipButton.style.opacity = '1';
            this.timeDisplay.style.display = 'block';
        } else if (videoWidth < videoHeight) {
            // Apply styles for portrait mode
            this.seekBar.id = "seekBarResponsiveHeightWidth";
            this.timeDisplay.id = "timeDisplayHeightWidth";
            this.increaseTimeButton.id = "forwardSeekInHeightWidth";
            this.decreaseTimeButton.id = "backwardSeekInHeightWidth";
            this.parentVolumeDiv.id = "parentVolumeHeightWidth";
            this.bottomRightDiv.id = "bottomRightDivHeightWidth";

            // this.pipButton.id = "pipButtonHeightWidth";
            // this.fullScreenButton.id = "mediaFullScreenResponsiveHeightWidth";
            this.timeDisplay.style.display = 'inline-block';
            this.pipButton.style.opacity = '1';

        } else {
            // Apply green border for landscape orientation (large screens)
            // video.style.border = "2px solid green";
            this.increaseTimeButton.id = "timeControlButtonIncrease";
            this.decreaseTimeButton.id = "timeControlButtonDecrease";
            this.seekBar.id = "seekBar";
            // this.pipButton.id = "pipButtonLandscape";
            // this.fullScreenButton.id = "fullScreenLandscape";
            this.timeDisplay.id = "timeDisplay";
            this.parentVolumeDiv.id = "parentVolume";
            this.bottomRightDiv.id = "bottomRightDiv";

            // Show fullScreenButton when videoWidth is greater than 170
            this.pipButton.style.opacity = '1'

        }
    }

    // Function to hide the retry button
    hideRetryButton() {
        // to detect whether the retry button is hidden
        this.retryButtonVisible = "false";
        this.retryButton.style.display = 'none';
        this.timeDisplay.style.display = "block";
        this.playPauseButton.style.display = "block";
        this.seekBar.style.display = 'block';
        this.parentVolumeDiv.style.display = 'inline-flex';
        this.increaseTimeButton.style.display = 'block';
        this.decreaseTimeButton.style.display = 'block';
        this.bottomRightDiv.style.display = 'inline-flex';

    }

    // Function to display the retry button
    showRetryButton() {
        // set its state to trues
        this.retryButtonVisible = "true";

        this.retryButton.style.display = 'block';
        this.playPauseButton.style.display = "none";
        this.seekBar.style.display = 'none';
        this.parentVolumeDiv.style.display = 'none';
        this.increaseTimeButton.style.display = 'none';
        this.decreaseTimeButton.style.display = 'none';
        this.bottomRightDiv.style.display = 'none';
        this.timeDisplay.style.display = "none";

    }

    updateVolumeControlBackground() {
        const volume = this.volumeControl.value;
        const gradient = `linear-gradient(to right, #fff 0%, #fff ${(volume * 100).toFixed(2)}%, rgba(255, 255, 255, 0.1) ${(volume * 100).toFixed(2)}%, rgba(255, 255, 255, 0.1) 100%)`;
        this.volumeControl.style.background = gradient;
    }

    updateVolumeButtonIcon() {
        const volume = this.volumeControl.value;
        if (volume === '0') {
            this.volumeButton.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.33999 2.93457L2.92999 4.34457L7.28999 8.70457L6.99999 9.00457H2.99999V15.0046H6.99999L12 20.0046V13.4146L16.18 17.5946C15.53 18.0846 14.8 18.4746 14 18.7046V20.7646C15.34 20.4646 16.57 19.8446 17.61 19.0146L19.66 21.0646L21.07 19.6546L4.33999 2.93457ZM9.99999 15.1746L7.82999 13.0046H4.99999V11.0046H7.82999L8.70999 10.1246L9.99999 11.4146V15.1746ZM19 12.0046C19 12.8246 18.85 13.6146 18.59 14.3446L20.12 15.8746C20.68 14.7046 21 13.3946 21 12.0046C21 7.72457 18.01 4.14457 14 3.23457V5.29457C16.89 6.15457 19 8.83457 19 12.0046ZM12 4.00457L10.12 5.88457L12 7.76457V4.00457ZM16.5 12.0046C16.5 10.2346 15.48 8.71457 14 7.97457V9.76457L16.48 12.2446C16.49 12.1646 16.5 12.0846 16.5 12.0046Z" fill="white"/>
            </svg>`;
        } else if (volume >= '0.1' && volume <= '0.6') {
            this.volumeButton.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.25 7.97V16.02C17.73 15.29 18.75 13.77 18.75 12C18.75 10.23 17.73 8.71 16.25 7.97ZM5.25 9V15H9.25L14.25 20V4L9.25 9H5.25ZM12.25 8.83V15.17L10.08 13H7.25V11H10.08L12.25 8.83Z" fill="white"/>
            </svg>`;
        } else {
            this.volumeButton.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9.00047V15.0005H7L12 20.0005V4.00047L7 9.00047H3ZM10 8.83047V15.1705L7.83 13.0005H5V11.0005H7.83L10 8.83047ZM16.5 12.0005C16.5 10.2305 15.48 8.71047 14 7.97047V16.0205C15.48 15.2905 16.5 13.7705 16.5 12.0005ZM14 3.23047V5.29047C16.89 6.15047 19 8.83047 19 12.0005C19 15.1705 16.89 17.8505 14 18.7105V20.7705C18.01 19.8605 21 16.2805 21 12.0005C21 7.72047 18.01 4.14047 14 3.23047Z" fill="white"/>
            </svg>`;
        }
    }

    toggleSubtitlesMenu() {
        // Check if this.video is defined and has the textTracks property
        if (!this.video || !this.video.textTracks) {
            console.error('Video or textTracks is not available.');
            return;
        }

        // Clear existing subtitle menu items
        while (this.subtitleMenu.firstChild) {
            this.subtitleMenu.removeChild(this.subtitleMenu.firstChild);
        }

        // Create the "off" button
        const offButton = document.createElement('button');
        offButton.textContent = 'Off';
        offButton.style.paddingLeft = '20px';
        offButton.style.paddingRight = '20px';
        offButton.style.paddingTop = '10px';
        offButton.style.paddingBottom = '10px';
        offButton.addEventListener('click', () => {
            this.disableAllSubtitles();
        });
        this.subtitleMenu.appendChild(offButton);

        // Convert textTracks to an array if it's not iterable
        const tracksArray = Array.from(this.video.textTracks);

        // Iterate over each text track
        for (let index = 0; index < tracksArray.length; index++) {
            const track = tracksArray[index];
            const menuItem = document.createElement('button');
            menuItem.textContent = track.label || `Language ${index + 1}`;
            menuItem.style.paddingLeft = '20px';
            menuItem.style.paddingRight = '20px';
            menuItem.style.paddingTop = '10px';
            menuItem.style.paddingBottom = '10px';
            menuItem.style.border = "1px solid #5D09C7"
            menuItem.addEventListener('click', () => {
                this.changeSubtitleTrack(track.language);
            });
            this.subtitleMenu.appendChild(menuItem);
        }

        // Display the subtitle menu
        this.subtitleMenu.style.display = 'flex';
        this.subtitleMenu.className = 'subtitle-menu';

        this.subtitleMenu.style.flexDirection = 'column';
        this.subtitleMenu.style.backgroundColor = '#fff';
        this.subtitleMenu.style.color = '#000';
    }

    disableAllSubtitles() {
        // Convert textTracks to an array if it's not iterable
        const tracksArray = Array.from(this.video.textTracks);

        // Loop through each text track and disable it
        for (let i = 0; i < tracksArray.length; i++) {
            const track = tracksArray[i];
            track.mode = 'disabled';
        }

        // Log that subtitles are turned off
        console.log('All subtitles are turned off.');
    }

    changeSubtitleTrack(language) {
        // Hide the subtitle menu
        this.subtitleMenu.style.display = 'none';

        // Convert textTracks to an array if it's not iterable
        const tracksArray = Array.from(this.video.textTracks);

        // Loop through each text track and update its mode
        for (let i = 0; i < tracksArray.length; i++) {
            const track = tracksArray[i];
            if (track.language === language) {
                track.mode = 'showing';
            } else {
                track.mode = 'disabled';
            }
        }

        // Log the selected language
        console.log(`Changing subtitle language to ${language}`);
    }

    // Define method to show loader
    showLoader() {
        this.loader.style.display = 'block';
    }

    // Define method to hide loader
    hideLoader() {
        this.loader.style.display = 'none';
    }


    connectedCallback() {
        // Get the playbackId attribute from the custom element
        const playbackId = this.getAttribute('playbackId');
        // const src = `http://dev-live.fastpix.io:8081/watch/${playbackId}.m3u8`

        // Set default width and height to full viewport width and height
        const width = this.getAttribute('width') || '100%';
        const height = this.getAttribute('height') || '100%';
        // const aspectRatio = this.getAttribute('aspect-ratio') || '16:9'; // default aspect ratio = width/height

        // Set width and height attributes directly on the video element
        this.video.style.width = width;
        this.video.style.height = height;
        this.video.style.display = 'flex';
        this.video.style.alignItems = 'center';
        this.video.style.justifyContent = 'center';

        //poster 
        const thumbnailUrl = "https://image-api.fastpix.io"; // Replace this with the actual thumbnail URL
        const thumbnailUrlWithId = `${thumbnailUrl}/${playbackId}/thumbnail.jpg?time=5`;
        this.video.poster = thumbnailUrlWithId;

        // streamType
        const streamType = this.getAttribute('stream-type') || 'on-demand';

        let src;
        if (streamType === 'on-demand') {
            // If stream-type is on-demand, set the source accordingly
            src = `https://staging-api.fastpix.io/v1/stream/${playbackId}`;
            // src = `https://rocketlane.ibee-cdn.net/episode/${playbackId}/stream.m3u8`;
            // src = `https://bitmovin-a.akamaihd.net/content/sintel/hls/playlist.m3u8`;
            // src = `https://stream.fastpix.io/${playbackId}`;

        } else if (streamType === 'live-stream') {
            // If stream-type is liveStream, set the source accordingly
            // src = `http://dev-live.fastpix.io:8081/watch/${playbackId}.m3u8`;
        } else {
            // Handle unsupported stream types or defaults
            console.error('Unsupported stream type:', streamType);
            this.showError('Unsupported stream type');
            this.video.poster = "" //If error occurs, remove poster
            return;
        }

        // Listen for HLS events
        this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('Manifest parsed');
            this.hls.attachMedia(this.video);
        });

        // Listen for HLS waiting event to show loader
        this.video.addEventListener('waiting', () => {
            this.showLoader();
        });

        // Listen for HLS playing event to hide loader
        this.video.addEventListener('playing', () => {
            this.hideLoader();
        });

        // // Add event listener to the parent div for single tap play/pause
        // this.parentDiv.addEventListener('click', () => {
        //     if (this.video.paused) {
        //         this.video.play();
        //         this.playPauseButton.textContent = '||'; // Update button text to pause symbol
        //         // Additional code for adjusting position after initial play click
        //         if (this.initialPlayClick) {
        //             this.playPauseButton.style.position = 'absolute';
        //             this.playPauseButton.style.bottom = '0'; // Place at the bottom
        //             this.playPauseButton.style.left = '17%'; // Place at the left
        //             this.showTimeControlButtons(); // Show the +10 and -10 buttons after initial play click
        //             this.playPauseButton.id = "playBackAfterClick";
        //             this.initialPlayClick = false; // Update the flag
        //         }
        //     } else {
        //         this.video.pause();
        //         this.playPauseButton.textContent = 'Play'; // Update button text to play symbol
        //     }
        // });

        //responsiveness
        // Add event listener for fullscreenchange event
        document.addEventListener('fullscreenchange', () => {
            // Check if the document is currently in fullscreen mode
            if (document.fullscreenElement) {
                // If in fullscreen mode, apply border color based on video dimensions
                this.updateBorderStyle();
            } else {
                // If not in fullscreen mode, remove any border from the video element
                const video = this.shadowRoot.querySelector('video');
                this.updateBorderStyle();
            }
        });

        // Add an event listener to the full screen button
        // Function to handle changes in fullscreen mode
        function handleFullScreenChange() {
            var fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;

            // Check if the video is in fullscreen mode
            if (fullscreenElement && fullscreenElement === video) {
                // Apply styling to the seekbar when in fullscreen mode
                seekBar.style.height = "1.875rem"; // Change background color to yellow as an example
            } else {
                // Reset the styling when exiting fullscreen mode
                seekBar.style.backgroundColor = ""; // Reset background color
            }
        }

        // Event listener for fullscreenchange event
        document.addEventListener("fullscreenchange", handleFullScreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
        document.addEventListener("mozfullscreenchange", handleFullScreenChange);
        document.addEventListener("MSFullscreenChange", handleFullScreenChange);

        // Call updateBorderStyle when the window resizes
        window.addEventListener('resize', () => {
            // Apply border color based on video dimensions
            this.updateBorderStyle();
        });

        // Call updateBorderStyle once the video element is loaded
        const video = this.shadowRoot.querySelector('video');
        video.addEventListener('loadedmetadata', () => {
            console.log("typeOfVideoDUration___", typeof (this.getAttribute("meta-video-duration")))

            this.updateBorderStyle();
        });


        fastpixMetrix.monitor(video, {
            hlsjs: this.hls,
            Hls: Hls,
            // beaconCollectionDomain: "webhook.site/a1d5767b-697b-4f17-8d03-faf4b7b55033",
            data: {
                environment_id: `${this.getAttribute("env_key")}`,
                video_title: `${this.getAttribute("metadata-video-title")}`,
                viewer_id: `${this.getAttribute("metadata-viewer-user-id")}`,
                video_id: `${this.getAttribute("metadata-video-id")}`,
                experiment_name: `${this.getAttribute("metadata-experiment-name")}`,
                player_name: `${this.getAttribute("metadata-player-name")}`,
                player_version: `${this.getAttribute("metadata-player-version")}`,
                video_duration: this.getAttribute("metadata-video-duration"),
                video_stream_type: this.getAttribute("metadata-video-stream-type"),
                view_session_id: this.getAttribute("metadata-view-session-id"),
                // page_context: this.getAttribute("metadata-page-context"),
                sub_property_id: this.getAttribute("metadata-sub-property-id"),
                video_content_type: this.getAttribute("metadata-video-content-type"),
                video_drm_type: this.getAttribute("metadata-video-drm-type"),
                video_encoding_variant: this.getAttribute("metadata-video-encoding-variant"),
                video_language_code: this.getAttribute("metadata-video-language-code"),
                video_producer: this.getAttribute("metadata-video-producer"),
                video_variant_name: this.getAttribute("metadata-video-variant-name"),
                video_cdn: this.getAttribute("metadata-video-cdn"),
                video_variant_id: this.getAttribute("metadata-video-variant-id"),
                video_series: this.getAttribute("metadata-video-series"),
                custom_1: this.getAttribute("metadata-custom-1"),
                // fastpix_playback_id: this.getAttribute("playbackId"),
                // browser: this.getAttribute("metadata-browser"),
                // browser_version: this.getAttribute("metadata-browser-version"),
                // cdn: this.getAttribute("metadata-cdn"),
                // operating_system: this.getAttribute("metadata-operating-system"),
                // page_url: this.getAttribute("metadata-page-url"),
                // player_autoplay: this.getAttribute("metadata-player-autoplay"),
                player_init_time: fastpixMetrix.unixEpochTime.now()
            }
        })
        // Load HLS source using HLS.js
        if (Hls.isSupported()) {
            this.hls.loadSource(src);
            // Handle HLS errors
            this.hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.details === 'bufferStalledError') {
                    this.showLoader(); // Show loader when buffer stalls
                }
                console.error('HLS.js error:', event, data);
                // this.showError('Video does not exist');
            });
        } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
            // If HLS is not supported, check if the browser can play HLS natively
            this.video.src = src;
            // Handle metadata loaded event
            this.video.addEventListener('loadedmetadata', () => {
                console.log('Video metadata loaded');
                this.video.play();
            });
        } else {
            // If HLS is not supported and the browser can't play HLS natively
            console.error('HLS is not supported, and the browser does not support the HLS format.');
            this.showError('HLS is not supported, and the browser does not support the HLS format.');
            return;
        }

        console.log("buffered___", this.video.seekable)

        //Accessibility - forward/back-10

        // Create a div for the buffered range
        this.bufferedRange = document.createElement('div');
        this.bufferedRange.style.position = 'absolute';
        this.bufferedRange.style.top = '0';
        this.bufferedRange.style.left = '0';
        this.bufferedRange.style.height = '100%';
        this.bufferedRange.style.width = '0';

        // Append the buffered range div to the seek bar
        this.seekBar.appendChild(this.bufferedRange);

        // Applying border-radius to the video element inside the shadow DOM
        const defaultBorderRadius = this.shadowRoot.querySelector('video').style.borderRadius = '2px';

        const borderRadius = this.getAttribute('borderRadius') || '2px';

        this.video.style.borderRadius = borderRadius;

        // Create a time display event
        this.timeDisplay = document.createElement("div");
        this.timeDisplay.className = 'timeDisplay';

        const style = document.createElement('style');

        style.innerHTML = `
        :host {
            display: block; /* Ensure the custom element is a block-level element */
        }
        
        video {
            width: 100%;
            height: 100vh;
            max-width: 100% !important; /* Ensure the video does not exceed its container */
            max-height: 100% !important; /* Ensure the video does not exceed its container */
            object-fit: contain; /* Adjust this based on your requirement */
            overflow: clip;
            background-color: #000;
        }

        #forwardSeekBtnSvg {
            height: 24px;
            width: 24px;
        }

        #pipButtonSvg {
            width: 24px;
            height: 24px;
        }
        
        .parent {
            display: flex;
            row-gap: 1.875rem;
            height: 100%;
        }

        .parentVolumeDiv {
            display: flex;
            flex-direction: row;
            position: absolute;
            left: 5%;
            width: auto;
            justify-content: space-between;
            align-items: center;
            bottom: 0;
        }

        #parentVolumeDivResponse {
            display: flex;
            flex-direction: row;
            position: absolute;
            left: 5%;
            width: auto;
            justify-content: space-between;
            align-items: center;
            bottom: 0;
        }

        #parentVolume {
            position: absolute;
            bottom: 10px;
            left: 255px;
        }

        .volumeButton {
            height: 24px;
            width: 30px;
            border-radius: 2px;
        }

        .volumeButton:hover {
            background-color: #5D09C7;

        }
      
        .bottomRightContainer {
            display: flex;
            flex-direction: row;
            position: absolute;
            right: 6px;
            width: auto;
            justify-content: space-between;
            align-items: center;
            bottom: 0;
        }
        
        #bottomRightDivMd {
            bottom: 10px;
            right: 10px;
        }
        
        .subtitle-menu {
        display: flex;
        color: #fff;
        background - color: red;
        flex - direction: column;
        padding: 10px;
        position: absolute;
        bottom: 32px;
        left: -36px;
        z-index: 2;
        }

        .pipButton {
            height: 24px;
            width: 30px;
            border-radius: 2px;
        }

        /* Additional styling for each button */
        .fullScreenButton,
        .ccButton {
            height: 24px;
            width: 30px;
            border-radius: 2px;
        }


        .fullScreenButton:hover,
        .pipButton:hover,
        .ccButton:hover {
            background-color: #5D09C7;
        }


        .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-left-color: #5D09C7;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        
        // #fullScreenLandscape {
        //     position: absolute;
        //     background-color: transparent;
        //     border: gray;
        //     cursor: pointer;
        //     fill: white;
        //     outline: none;
        //     color: white;
        //     display: flex;
        //     justify-content: center;
        //     bottom: 10px;
        //     width: 30px;
        //     height: 24px;
        //     right: 20px;
        //     align-items: center;
        //     background-color: red;
        //     flex-shrink: 0; /* Prevent buttons from shrinking */
        //     transition: margin-left 0.3s ease; /* Add transition for smooth animation */
        // }

        
    
/* Default styles for volume controls */
.volumeControl {
    width: 3.125rem; /* Adjust width as needed */
    color: #fff;
    display: inline-block;
    -webkit-appearance: none;
    border-radius: 0.313rem;
    height: 3px;
    -moz-appearance: none;
    background: linear-gradient(to right,  #5D09C7 0%,  #5D09C7 100%, #ddd 50%, #ddd 100%);x
}

.volumeControl::-webkit-slider-thumb {
    visibility: hidden
}

/* Show the thumb of the seek bar on hover */
.volumeControl::-webkit-slider-thumb {
-webkit-appearance: none;
appearance: none;
width: 0.375rem;
height: 0.75rem;
background-color: #ddd;
border-radius: 30%;
cursor: pointer;
color: #5D09C7;
display: block;
visibility: visible
}

    .playPauseButton {
        background-color: rgba(255, 255, 255, 0.1);
        border: none;
        cursor: pointer;
        fill: white;
        outline: none;
        width: 3.75rem;
        height: 3.75rem;
        border-radius: 50%;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        bottom: 50%;
    }

    .playPauseButton:hover {
        background-color: #5D09C7;
    }

    #playBackAfterClick {
     background-color: rgba(255, 255, 255, 0.1)
    right: 0;
    width: 2.5rem;
        height: 2.5rem;
        right: 40%
    }

    #playBackAfterClick:hover {
        background-color: #5D09C7;
    }

    .timeDisplay:hover {
        background-color: #5D09C7;
    }

    /* .seekBar::-webkit-slider-thumb {
        visibility: hidden
    } */

    /* Show the thumb of the seek bar on hover */
.seekBar:hover::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 12px;
    height: 12px;
    background-color: #ddd;
    border-radius: 50%;
    cursor: pointer;
    background-color: #5D09C7;
    opacity: 1;
    visibility: visible;
    position: relative; /* Required for positioning the dot */
}
.seekBar:hover::-webkit-slider-thumb::before {
    content: "s"; /* Required for pseudo-element */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 6px; /* Adjust the size of the dot as needed */
    height: 6px; /* Adjust the size of the dot as needed */
    background-color: white; /* Color of the dot */
    border-radius: 50%;
}

input[type="range"]::-moz-range-thumb {
    opacity: 0;
}
input[type="range"]::-webkit-slider-thumb {
    opacity: 0;
}

    #seekBar {
       width : 96%;
       position : absolute;
        height : 0.25rem;
       bottom : 40px;
        left : 2%;
       right : 2%;
        backgroundColor : rgba(255, 255, 255, 0.1);
    }

    #seekBarResponsiveMd {
        width : 96%;
        position : absolute;
         height : 3px;
        bottom : 40px;
         left : 2%;
        right : 2%;
         backgroundColor : rgba(255, 255, 255, 0.1);
    }

    #mediaFullScreenResponsiveMd {
        position: absolute;
        bottom: 9.1px;
        right: 0;
        height: 24px;
        width: 30px;
        border-radius: 2px;
    }

    #mediaFullScreenResponsiveMd:hover {
        background-color: #5D09C7;
    }

    #pipButtonResponsiveMd {
        position: absolute;
        bottom: 9.1px;
        right: 0;
        height: 24px;
        width: 30px;
    }

    #pipButtonResponsiveMd:hover {
        background-color: #
    }

    #parentVolumeResponsiveMd {
        display: flex;
            flex-direction: row;
            position: absolute;
            left: 240px;
            width: auto;
            justify-content: space-between;
            align-items: center;
            bottom: 10px;
    }

   #bottomRightDivResponsive {
    position: absolute;
    right: 60px;
   }

    #timeDisplayResponsiveMd {
        position: absolute;
        bottom: 10px;
        font-size: 0.875rem;
        left: 126px;
        color: #fff;
        font-family: Arial, sans-serif;
        padding: 4px;
        border-radius: 2px;
    }

    #timeDisplayResponsiveMd:hover {
        background-color: #5D09C7;
    }

    #forwardSeekInHeightWidth {
        position: absolute;
        bottom: 1px;
        left: 60%;
    }

    #backwardSeekInHeightWidth {
        position: absolute;
        bottom: 50%;
        right: 60%;
    }

    #mediaFullScreenResponsiveHeightWidth,
    #pipButtonHeightWidth {
        bottom: 0%;
    }

    #seekBar:hover {
        cursor: pointer;
    }

    #seekBarResponsive {
        position: absolute;
        bottom: 2.5rem;
        height: 0.125rem;
        width: 95%;
        left: 2%;
        right: 3%;
    }


    #playPauseButtonResponsive {
        position: absolute;
        bottom: 50%;
        left: 50%;
        color: #fff;
        height: 2.875rem;
        width: 2.875rem;
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
    }

    #initialPlayButton {
        color: #fff;
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-items: center;
    }

    #initialPlayButton:hover {
        background-color: #5D09C7;   
    }

    #seekBarMini {
        position: absolute;
        height: 3px;
        width: 84%;
        bottom: 40px;
    }

    #parentVolumeMini {
        left: 1%;
    }

    #pipButtonMini, #fullScreenButtonMini {
        position: absolute;
        bottom: 1px;
    }

    #bottomRightContainerMini {
        bottom: 40px;
    }

    #seekBarResponsiveHeightWidth {
        position: absolute;
        height: 0.25rem;
        bottom: 3.75rem;
        height: 0.25 rem;
        width: 89%;
        right: 50%;
        left: 2%;
    }

    #timeDisplayHeightWidth {
        position: absolute;
        bottom: 3.75rem;
        font-size: 0.875rem;
        right: 2%;
        color: #fff;
        font-family: Arial, sans-serif;  
    }

    #timeDisplayResponsive {
        position: absolute;
        bottom: 1px;
        font-size: 0.875rem;
        right: 2%;
        color: #fff;
        font-family: Arial, sans-serif;
    }

    #timeDisplay {
        font-family: Arial, sans-serif;
        font-size: 0.875rem;
        color: white;
        position: absolute;
        bottom: 7px;
        padding: 5px;
        left: 159px; /* Adjust as needed */
    }

    #bottomRightDiv {
        position: absolute;
        bottom: 7px;
    }

    /* for screens/video width less <=481 */
    #pipButtonResponsive {
        position: absolute;
        bottom: 12px;
        right: 0;
        height: 24px;
        width: 30px;
    }
    #pipButtonResponsive:hover {
    background-color: #5D09C7;
    }
    
    #mediaFullScreenResponsive {
        bottom: 12px;
        right: 0;
        height: 24px;
        width: 30px;
    }

    #mediaFullScreenResponsive:hover {
        background-color: #5D09C7;
    }

    #play
    #pause {
        display: flex;
        background-color: rgba(255, 255, 255, 0.1);;
        color: #ddd;
        position: absolute;
    bottom: -0.125rem;
    left: 15%;
    transform: translateX(-50%);
    }

    #play:hover,
    #pause:hover {
        background-color: rgba(255, 255, 255, 0.1)
    }

    #fowardSeekInsecs {
        background-color: transparent;
        border: gray;
        cursor: pointer;
        fill: green;
        outline: none;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 0.875;
        position: absolute;
        bottom: 50%; /* Default bottom position */
        left: 60%;
    }
    
    #backwardSeekInsecs {
        position: absolute;
        bottom: 50%;
        right: 60%;
    }

    #playPauseButtonResponsiveMd {
        position: absolute;
        bottom: 50%;
        left: 50%;
        color: #fff;
        height: 2.875rem;
        width: 2.875rem;
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
    }

    #backwardSeekInsecsMd {
        position: absolute;
        bottom: 10px;
        left: 61px;
        height: 24px;
        width: 30px;
    }


    #backwardSeekInsecsMd:hover {
        background-color: #5D09C7;
    }


    #fowardSeekInsecsMd {
        border: gray;
        cursor: pointer;
        fill: green;
        outline: none;
        height: 24px;
        width: 30px;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 0.875;
        position: absolute;
        bottom: 10px; /* Default bottom position */
        left: 93px;
    }

    #fowardSeekInsecsMd:hover {
        background-color: #5D09C7;
    }

    #mediaFullScreenLandscape {
        background-color: transparent;
        border: gray;
        cursor: pointer;
        fill: white;
        outline: none;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 20%;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        // transform: translateX(-50%);
    }
 
    #timeControlButtonIncrease {
        background-color: transparent
        border: gray;
        cursor: pointer;
        outline: none;
        border-radius: 2px;
        width: 30px;
        height: 24px;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        bottom: 10px;
        left: 8.5%;
        font-size: 0.875rem;
    }
    #timeControlButtonDecrease {
        background-color: transparent
        border: gray;
        cursor: pointer;
        outline: none;
        border-radius: 2px;
        width: 30px;
        height: 24px;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        bottom: 10px;
        left: 6%;
        font-size: 0.875rem;
}

#timeControlButtonIncrease:hover,
#timeControlButtonDecrease:hover {
    background-color: #5D09C7;
}

.retryButton, button {
background: none;
border: none;
padding: 0;
margin: 0;
font-family: inherit;
font-size: inherit;
color: inherit;
cursor: pointer;
outline: none; /* Prevents default focus outline */
    }


    /* MEdia controls responsive */
    /* Media query for screens with a width pf > 481 or less */

@media screen and (min-width: 182px) and (max-width: 729px) {
    #timeControlButtonDecrease {
        left: 8%;
        background-color: transoparent;
        bottom: -0.5%;
        }

    #timeControlButtonIncrease {
            left: 16.45%;
            bottom: -0.5%;
        }

        #timeControlButtonIncrease:hover {
            background-color: #5D09C7
        }
    #parentVolume {
        left: 25.5%;
        bottom: -0.5%;
    }

    .bottomRightContainer {
        position: absolute;
        bottom: 0;
    }
            #seekBar {
        width : 87%;
       position : absolute;
        height : 0.25rem;
       bottom : 40px;
        left : 2%;
       right : 2%;
            }

            #timeDisplay {
                bottom: 14.5%
            }
}

@media screen and (min-width: 730px) and (max-width: 960px) {
    #timeControlButtonDecrease {
    left: 8%;
    background-color: transparent;
    bottom: 1%;
    }
    #timeControlButtonIncrease {
        left: 14.2%;
        background-color: transparent;
        bottom: 1%;
    }
    #parentVolume {
        position: absolute;
        left: 20.6%;
        bottom: 10px;
    }

    .bottomRightContainer {
        position: absolute;
        bottom: 0;
    }
    
}

`;
        this.shadowRoot.appendChild(style);
        // Append the time display element to the parent div
        this.parentDiv.appendChild(this.timeDisplay);

        // should uncomment it before moving it to prod

        // Variable to track the timer for hiding controls
        // let hideControlsTimer;

        // Store the timestamp of the last interaction
        let lastInteractionTimestamp = Date.now(); // Initialize with the current timestamp

        // Store the timestamp of the last key press
        let lastKeyPressTimestamp = Date.now();

        // Listen for keydown events on the document
        document.addEventListener('keydown', (event) => {
            // When a key is pressed, show the controls and reset the hide timer
            showControls();
            resetHideControlsTimer();
        });

        // // Function to reset the timer for hiding controls
        // const resetHideControlsTimer = () => {
        //     clearTimeout(hideControlsTimer);
        //     hideControlsTimer = setTimeout(hideControls, 3000); // Adjust the time as needed (3000 milliseconds = 3 seconds)
        // };

        // Function to hide controls after a few seconds of inactivity
        const hideControls = () => {
            // Calculate the time elapsed since the last interaction
            const elapsedTime = Date.now() - lastInteractionTimestamp;

            // Check if both mouse and keyboard interactions are inactive
            if (!isMouseOverControl() || elapsedTime >= 3000 || wasKeyboardInteraction()) { // Adjust the time threshold as needed
                this.seekBar.style.opacity = "0";
                this.volumeControl.style.opacity = "0";
                this.volumeButton.style.opacity = "0";
                this.pipButton.style.opacity = "0";
                this.fullScreenButton.style.opacity = "0";
                this.ccButton.style.opacity = "0";
                this.increaseTimeButton.style.opacity = "0";
                this.decreaseTimeButton.style.opacity = "0";
                this.playPauseButton.style.opacity = "0";
                this.timeDisplay.style.opacity = "0";
            }
            // else {
            //     // If either mouse or keyboard interactions are active, set a new timer
            //     clearTimeout(hideControlsTimer);
            //     hideControlsTimer = setTimeout(hideControls, 3000 - elapsedTime);
            // }
        };

        // Function to check if there was recent keyboard interaction
        const wasKeyboardInteraction = () => {
            // Check if the current timestamp is within the last 3 seconds of the last key press
            return Date.now() - lastKeyPressTimestamp < 3000;
        };

        // // Function to check if the mouse is currently over any control
        const isMouseOverControl = () => {
            return (
                this.seekBar.matches(':hover') ||
                this.volumeControl.matches(':hover') ||
                this.pipButton.matches(':hover') ||
                this.fullScreenButton.matches(':hover') ||
                this.increaseTimeButton.matches(':hover') ||
                this.decreaseTimeButton.matches(':hover') ||
                this.playPauseButton.matches(':hover') ||
                this.timeDisplay.matches(":hover") ||
                this.volumeButton.matches(":hover")
            );
        };

        // Function to show controls
        const showControls = () => {
            this.seekBar.style.opacity = "1";
            this.volumeControl.style.opacity = "1";
            this.pipButton.style.opacity = "1";
            this.fullScreenButton.style.opacity = "1";
            this.ccButton.style.opacity = "1";
            this.increaseTimeButton.style.opacity = "1";
            this.decreaseTimeButton.style.opacity = "1";
            this.playPauseButton.style.opacity = "1";
            this.timeDisplay.style.opacity = "1";
            this.volumeButton.style.opacity = "1";
            // Reset the timer for hiding controls
            // clearTimeout(hideControlsTimer);
            // Set a new timer to hide controls after a few seconds of inactivity
            // hideControlsTimer = setTimeout(hideControls, 3000); // Adjust the time as needed (3000 milliseconds = 3 seconds)
        };

        // Event listener for mousemove to show controls
        this.addEventListener('mousemove', showControls);

        // Event listener for mouseout to hide controls when mouse leaves the player area
        // this.addEventListener('mouseout', (event) => {
        //     // Check if the mouse is still inside the player area after a short delay
        //     setTimeout(() => {
        //         if (!this.contains(event.relatedTarget)) {
        //             hideControls();
        //         }
        //     }, 200); // Adjust the delay as needed
        // });

        // Initial display of controls
        showControls();

        // Listen for the ended event of the video
        this.video.addEventListener('ended', () => {
            // Display the retry button when the video playback ends
            this.showRetryButton();
        });

        // Check if there is a saved volume in localStorage
        const savedVolume = localStorage.getItem('savedVolume');
        if (savedVolume !== null) {
            this.video.volume = parseFloat(savedVolume);
            this.volumeControl.value = savedVolume;
            const gradient = `linear-gradient(to right, #fff 0%, #fff ${(savedVolume * 100).toFixed(2)}%, rgba(255, 255, 255, 0.1) ${(savedVolume * 100).toFixed(2)}%, rgba(255, 255, 255, 0.1) 100%)`;
            this.volumeControl.style.background = gradient;
        }

        // //function to convert seconds to the desired format
        // function formatTime(seconds) {
        //     const hrs = Math.floor(seconds / 3600);
        //     const mins = Math.floor((seconds % 3600) / 60);
        //     const secs = Math.floor(seconds % 60);

        //     const hrsStr = hrs > 0 ? `${hrs}:` : '';
        //     const minsStr = mins.toString().padStart(2, '0');
        //     const secsStr = secs.toString().padStart(2, '0');

        //     return `${hrsStr}${minsStr}:${secsStr}`;
        // }

        function formatTime(seconds) {
            const hrs = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);

            const hrsStr = hrs > 0 ? `${hrs}:` : '';
            // const hrsStr = `${hrs}:`;

            const minsStr = mins.toString().padStart(2, '0');
            const secsStr = secs.toString().padStart(2, '0');

            return `${hrsStr}${minsStr}:${secsStr}`;
        }

        // Update volume button icon and volume control based on saved volume level
        window.addEventListener('DOMContentLoaded', () => {
            const savedVolume = localStorage.getItem('savedVolume') || '0.6'; // Default to 0.6 if not saved
            const volumeButtonIcon = localStorage.getItem('savedVolumeIcon'); // Retrieve saved volume button icon

            // Update volume control value and video volume
            this.volumeControl.value = savedVolume;
            this.video.volume = savedVolume;

            // Update volume button icon
            if (volumeButtonIcon) {
                this.volumeButton.innerHTML = volumeButtonIcon;
            } else {
                // Set default icon based on volume level
                this.updateVolumeButtonIcon();
            }
        });


        // Update the time display
        function updateTimeDisplay() {
            const currentTime = Math.floor(this.video.currentTime);
            const duration = Math.floor(this.video.duration);

            const currentTimeFormatted = !isNaN(currentTime) ? formatTime(currentTime) : '0:00';
            let durationFormatted;
            if (!isNaN(duration)) {
                durationFormatted = formatTime(duration);
            } else {
                durationFormatted = '0:00'; // Default to 0:00 if duration is NaN
            }

            this.timeDisplay.textContent = `${currentTimeFormatted} / ${durationFormatted}`;

            // Update the buffered range
            if (this.video.buffered.length > 0) {
                const bufferedPercentage = (this.video.buffered.end(0) / duration) * 100;
                this.bufferedRange.style.width = `${bufferedPercentage}%`;
            }
        }

        // Define a function to calculate and log the thumb position time

        // this.video.addEventListener('timeupdate', () => {
        //     const currentTime = this.video.currentTime;
        //     const duration = this.video.duration;

        //     // Initialize total buffered time to 0
        //     let totalBufferedTime = 0;

        //     // Iterate over each buffered range
        //     for (let i = 0; i < this.video.buffered.length; i++) {
        //         // Add the length of each range to the total buffered time
        //         totalBufferedTime += this.video.buffered.end(i) - this.video.buffered.start(i);
        //     }

        //     console.log('Total buffered time:', totalBufferedTime);

        //     // Calculate the percentages
        //     const seekedPercentage = Math.min((currentTime / duration) * 100, 100);

        //     // Log thumb position and seeked content
        //     const thumbPosition = `${seekedPercentage}%`; // Adding '%' to keep consistency
        //     console.log('Thumb position:', thumbPosition);
        //     console.log('Seeked content:', seekedPercentage);

        //     // Check if there is at least one buffered range
        //     if (this.video.buffered.length > 0) {
        //         const bufferedPercentage = (this.video.buffered.end(0) / duration) * 100;
        //         const unseekedPercentage = 100 - seekedPercentage;

        //         updateTimeDisplay.call(this);

        //         // Update seekbar value based on current time and duration
        //         if (duration > 0) {
        //             this.seekBar.value = (currentTime / duration) * 100;

        //             // Set the position of the thumb
        //             this.seekBar.style.setProperty('--seekbar-thumb-position', thumbPosition);

        //             // Set background color using linear gradients

        //             this.seekBar.style.background = `linear-gradient(to right, #5D09C7 0%, #5D09C7 ${seekedPercentage}%, #F5F5DC ${seekedPercentage}%, #F5F5DC ${bufferedPercentage}%, rgba(255, 255, 255, 0.1) ${bufferedPercentage}%, rgba(255, 255, 255, 0.1) 100%)`;
        //         }
        //     }
        // });

        this.video.addEventListener('timeupdate', () => {
            const currentTime = this.video.currentTime;
            const duration = this.video.duration;

            // Initialize total buffered time to 0
            let totalBufferedTime = 0;

            // Iterate over each buffered range
            for (let i = 0; i < this.video.buffered.length; i++) {
                // Add the length of each range to the total buffered time
                totalBufferedTime += this.video.buffered.end(i) - this.video.buffered.start(i);
            }

            console.log('Total buffered time:', totalBufferedTime);

            // Calculate the percentages
            const seekedPercentage = Math.min((currentTime / duration) * 100, 100);
            const bufferedPercentage = (totalBufferedTime / duration) * 100;

            updateTimeDisplay.call(this);

            // Update seekbar value based on current time and duration
            if (duration > 0) {
                this.seekBar.value = (currentTime / duration) * 100;

                // Set the position of the thumb
                this.seekBar.style.setProperty('--seekbar-thumb-position', `${seekedPercentage}%`);

                // Set background color using linear gradients
                this.seekBar.style.background = `linear-gradient(to right, #5D09C7 0%, #5D09C7 ${seekedPercentage}%, #F5F5DC ${seekedPercentage}%, #F5F5DC ${bufferedPercentage}%, rgba(255, 255, 255, 0.1) ${bufferedPercentage}%, rgba(255, 255, 255, 0.1) 100%)`;
            }
        });



        const logThumbPositionTime = () => {
            const seekPercentage = parseFloat(this.seekBar.value);
            const currentTimeInSeconds = (seekPercentage / 100) * this.video.duration;

            // Convert seconds to minutes and seconds
            const minutes = Math.floor(currentTimeInSeconds / 60);
            const seconds = Math.floor(currentTimeInSeconds % 60);

            // Log the current time represented by the thumb position
            console.log("Thumb Position Time:", minutes, "minutes", seconds, "seconds");
        };

        // Listen to input event on the seek bar to update video's current time
        this.seekBar.addEventListener('input', logThumbPositionTime);

        // Listen for keydown events on the document, but only if initialPlayClick is true
        document.addEventListener('keydown', (event) => {
            event.preventDefault();
            // Update the timestamp of the last key press
            lastKeyPressTimestamp = Date.now();
            console.log("Key pressed:", event.code);
            if (!this.initialPlayClick && !this.retryButtonVisible) {
                switch (event.code) {
                    case 'Space':
                    case ' ': // Play/Pause
                        event.preventDefault();
                        // Toggle play/pause
                        if (this.video.paused) {
                            this.video.play();
                            this.playPauseButton.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <!-- pause icon --> </svg>`;
                        } else {
                            this.video.pause();
                            this.playPauseButton.innerHTML = `<svg width="32" height="32" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <!-- play icon --> </svg>`;
                        }
                        break;
                    case 'ArrowUp': // Increase volume
                        event.preventDefault();
                        if (this.video.volume < 1) {
                            this.video.volume += 0.1;
                            // Update volume control
                            this.volumeControl.value = this.video.volume;
                            this.updateVolumeControlBackground();
                            this.updateVolumeButtonIcon();
                            // Save the volume to localStorage
                            localStorage.setItem('savedVolume', this.video.volume);
                            localStorage.setItem('savedVolumeIcon', this.volumeButton.innerHTML);
                        }
                        break;
                    case 'ArrowDown': // Decrease volume
                        event.preventDefault();
                        if (this.video.volume > 0) {
                            this.video.volume -= 0.1;
                            // Update volume control
                            this.volumeControl.value = this.video.volume;
                            this.updateVolumeControlBackground();
                            this.updateVolumeButtonIcon();
                            // Save the volume to localStorage
                            localStorage.setItem('savedVolume', this.video.volume);
                            localStorage.setItem('savedVolumeIcon', this.volumeButton.innerHTML);
                        }
                        break;
                    case 'ArrowRight': // Forward 10 seconds
                        event.preventDefault();
                        this.adjustCurrentTimeBy(10); // Forward 10 seconds
                        break;
                    case 'ArrowLeft': // Backward 10 seconds
                        event.preventDefault();
                        this.adjustCurrentTimeBy(-10); // Backward 10 seconds
                        break;
                    case 'KeyM': // Mute/Unmute
                        event.preventDefault();
                        this.video.muted = !this.video.muted;
                        if (this.video.muted) {
                            // Update volume control and mute button
                            this.volumeControl.value = 0;
                            this.video.volume = 0;
                        } else {
                            // Restore volume control and mute button
                            let savedVolume = localStorage.getItem('savedVolume');
                            if (savedVolume === '0') {
                                savedVolume = '1'; // Set to 0.6 if previously stored volume was 0
                            }
                            this.volumeControl.value = savedVolume; // Update volume control value when unmuting
                            this.video.volume = savedVolume;
                        }
                        // Update UI
                        this.updateVolumeControlBackground();
                        this.updateVolumeButtonIcon();
                        // Save the volume to localStorage
                        localStorage.setItem('savedVolume', this.video.volume);
                        localStorage.setItem('savedVolumeIcon', this.volumeButton.innerHTML);
                        break;

                }
            }
        });

        this.seekBar.addEventListener('input', () => {
            const seekTime = (this.seekBar.value / 100) * this.video.duration;

            // Update the video's current time
            this.video.currentTime = seekTime;

            // Check if the video is paused
            if (this.video.paused) { // returns boolean
                // If the video is paused, do not play it after seeking
                this.video.pause();
            } else {
                // If the video is playing, play it from the seeked position
                this.video.play();
            }

            console.log("seekTime____", this.video.paused);
        });
    }
}


// export { FastPixPlayer };

// Define the custom element
customElements.define('fp-player', FastPixPlayer);
