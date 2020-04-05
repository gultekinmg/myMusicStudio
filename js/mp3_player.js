(function() {
    var allPlayers = [], isInit = false, audio = document.createElement('audio');
    audio.className = 'podcast__audio';
    audio.crossOrigin = "anonymous";
    var ctx = new(window.AudioContext || window.webkitAudioContext)(), source = ctx.createBufferSource(), audioSrc = ctx.createMediaElementSource(audio);
    audioSrc.connect(ctx.destination);
    function initPlayers(eq) {
        var players = document.querySelectorAll('.podcast'),
            playersLength = players.length;
        for (var i = 0; i < playersLength; i++) {
            allPlayers.push(new player(players[i], eq));
            allPlayers[i]._init();
        }
    }
    function initPlayer(element, info, eq) {
        var inPlayer = document.querySelector(element),
            playersLength = allPlayers.length;
        createPlayer(inPlayer, info);
        allPlayers.push(new player(inPlayer, eq));
        allPlayers[playersLength]._init();
    }
    window.addEventListener('resize', function() {
        for (var i = 0; i < allPlayers.length; i++) {
            if (allPlayers[i].isInit) {
                allPlayers[i].reDraw();
            }
        }
    }, true);
    var player = function(player, eq) {
        var this_ = this;
        this.player = player;
        this.eq = eq.on || false;
        this.isPlaying = false;
        this.controlBtn = this.player.querySelector('.podcast__control');
        this.currLine = this.player.querySelector('.line__current');
        this.currTime = this.player.querySelector('.time__current');
        this.fullTime = this.player.querySelector('.time__full');
        this.timeLine = this.player.querySelector('.time__line');
        this.fullVol = this.player.querySelector('.podcast__volume');
        this.currVol = this.player.querySelector('.volume-line');
        this.canvas = this.player.querySelector('canvas') || false;
        this.podcastMeta = this.player.querySelector('.podcast__meta');
        this.visual = this.player.querySelector('.podcast__visual');
        this.visualProgress = this.player.querySelector('.visual__progress');
        this.mTimeDown = false;
        this.mVolumeDown = false;
        this.playNow = false;
        this.isInit = false;
        this.visualData = {
            width: eq.width || this_.podcastMeta.offsetWidth,
            height: eq.height || 200,
            bg: eq.bg || false,
            textColor: eq.textColor || '#fff',
            lineColor: eq.lineColor || '#000000',
            linesLength: eq.linesLength || 1000
        };
        this._init = function() {
            this.controlBtn.addEventListener('click', this.controls);
            audio.addEventListener('timeupdate', this.updateTime);
            this.timeLine.addEventListener('mousedown', this.setTimeClick);
            this.timeLine.addEventListener('mousemove', this.setTimeMove);
            this.timeLine.addEventListener('mouseup', this.onTimeUp);
            this.timeLine.addEventListener('mouseleave', this.onTimeUp);
            this.fullVol.addEventListener('mousedown', this.setVolumeClick);
            this.fullVol.addEventListener('mousemove', this.setVolumeMove);
            this.fullVol.addEventListener('mouseup', this.onVolumeUp);
            this.fullVol.addEventListener('mouseleave', this.onVolumeUp);
            audio.addEventListener("ended", this.ended);
            audio.volume = 0.5;
            this_.visualData.textColor ? this_.podcastMeta.style.color = this_.visualData.textColor : false;
            this_.visualData.bg ? this_.podcastMeta.style.background = this_.visualData.bg : false;
        };
        this.buffer = function() {
            this.canvasCtx = this.canvas.getContext('2d');
            this.request = new XMLHttpRequest();
            this.request.open('GET', audio.src, true);
            this.request.responseType = 'arraybuffer';
            this.request.onload = function() {
                this_.audioData = this_.request.response;
                ctx.decodeAudioData(this_.audioData, function(buffer) {
                        this_.buffer = buffer;
                        this_.leftChannel = buffer.getChannelData(0);
                        this_.draw();
                        this_.fullTime.innerHTML = formatTime(audio.duration) || '00:00:00';
                        this_.visual.setAttribute('class', 'podcast__visual podcast__visual--loaded');
                        this_.player.setAttribute('class', 'podcast podcast--playing');
                        this_.isInit = true;
                    },
                    function(e) {
                        "Error with decoding audio data" + e.err
                    });
            }
            this.request.send();
        }
        this.stop = function() {
            audio.pause();
            audio.currentTime = 0;
            this_.currTime.innerHTML = '00:00:00';
            this_.currLine.style.width = '0%';
            this_.visualProgress.style.width = '0%';
            this_.isPlaying = false;
            this_.playNow = false;
            this_.controlBtn.setAttribute('class', 'podcast__control podcast__play');
            this_.player.setAttribute('class', 'podcast');
        }
        this.controls = function() {
            if (hasClass(this_.controlBtn, 'podcast__play')) {
                if (!this_.playNow) {
                    for (var i = 0; i < allPlayers.length; i++) {
                        allPlayers[i].stop();
                    }
                    audio.src = this_.player.dataset.src;
                    if (this_.eq && this_.canvas && !this_.isInit) {
                        this_.buffer();
                    }
                    audio.volume = getStyle(this_.currVol, 'left').slice(0, -2) / getStyle(this_.fullVol, 'width').slice(0, -2);
                }
                this_.controlBtn.setAttribute('class', 'podcast__control podcast__pause');
                if (!this_.isInit) {
                    this_.player.setAttribute('class', 'podcast podcast--playing podcast--loading');
                } else {
                    this_.player.setAttribute('class', 'podcast podcast--playing');
                }
                audio.play();
                this_.isPlaying = true;
                this_.playNow = true;
            } else {
                this_.controlBtn.setAttribute('class', 'podcast__control podcast__play');
                this_.isInit ? this_.player.setAttribute('class', 'podcast') : false;
                audio.pause();
                this_.isPlaying = false;
            }
        };
        this.updateTime = function() {
            if (this_.isPlaying) {
                var time = this.currentTime;
                this_.currTime.innerHTML = formatTime(time);
                this_.currLine.style.width = (time * 100) / audio.duration + '%';
                this_.visualProgress.style.width = (time * 100) / audio.duration + '%';
            }
        };
        this.setVolume = function(e) {
            var x, setVolume, setLeft, nowWidth, volLineWidth = this_.fullVol.offsetWidth;
            if (e.pageX) { x = e.pageX; } else { x = e.clientX; }
            nowWidth = x - this_.fullVol.getBoundingClientRect().left;
            setLeft = (nowWidth * 100) / volLineWidth;
            this_.currVol.style.left = setLeft + '%';
            audio.volume = setLeft / 100;
        };
        this.setVolumeClick = function(e) {
            this_.mVolumeDown = true;
            this_.setVolume(e);
        };
        this.onVolumeUp = function() {
            this_.mVolumeDown = false;
        };
        this.setVolumeMove = function(e) { if (this_.mVolumeDown) { this_.setVolume(e); }}
        this.setTime = function(e) {
            var x, setTime, setWidth, nowWidth,     timeLineWidth = this_.timeLine.offsetWidth;
            if (!this_.playNow) { for (var i = 0; i < allPlayers.length; i++) { allPlayers[i].stop(); }  }
            this_.playNow = true;
            audio.pause();
            if (e.pageX) {     x = e.pageX; } else {     x = e.clientX; }
            nowWidth = x - this_.timeLine.getBoundingClientRect().left;
            setWidth = (nowWidth * 100) / timeLineWidth;
            this_.currLine.style.width = setWidth + '%';
            audio.currentTime = (setWidth * audio.duration) / 100;
        };
        this.setTimeClick = function(e) {
            this_.mTimeDown = true;
            this_.setTime(e);
        };
        this.setTimeMove = function(e) {
            if (this_.mTimeDown) {
                this_.setTime(e);
            }
        };
        this.onTimeUp = function() {
            this_.mTimeDown = false;
            this_.isPlaying ? audio.play() : false;
        };
        this.ended = function() {
            this_.stop();
        };
        this.draw = function() {
            this_.canvas.width = this_.visualData.width;
            this_.canvas.height = this_.visualData.height;
            drawVisual();
        };
        this.reDraw = function() {
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;
            drawVisual();
        };
        function drawVisual() {
            this_.canvasCtx.clearRect(0, 0, this_.canvas.width, this_.canvas.height);
            this_.canvasCtx.strokeStyle = this_.visualData.lineColor;
            this_.canvasCtx.translate(0, this_.canvas.height / 2);
            this_.canvasCtx.lineWidth = 1;
            var totallength = this_.leftChannel.length;
            var eachBlock = Math.floor(totallength / this_.visualData.linesLength);
            var lineGap = (this_.canvas.width / this_.visualData.linesLength);
            this_.canvasCtx.beginPath();
            for (var i = 0; i <= this_.visualData.linesLength; i++) {
                var audioBuffKey = Math.floor(eachBlock * i);
                var x = i * lineGap;
                var y = this_.leftChannel[audioBuffKey] * this_.canvas.height / 2;
                this_.canvasCtx.moveTo(x, y);
                this_.canvasCtx.lineTo(x, (y * -1));
            }
            this_.canvasCtx.stroke();
            this_.canvasCtx.restore();
        }
    };
    function createPlayer(el, info) {
        var classes = el.getAttribute('class');
        el.setAttribute('data-src', info.audioSrc);
        el.setAttribute('class', 'podcast ' + classes);
        var plr = '<div style="background-image: url(' + info.imageSrc + ')" class="podcast__cover">\
                                    <div class="podcast__volume volume">\
                                        <div class="volume-full"></div>\
                                        <div class="volume-line"></div>\
                                    </div>\
                                    <div class="podcast__control podcast__play"></div>\
                                    <div class="podcast__loader"></div>\
                                    <div class="podcast__time time">\
                                        <div class="time__current">00:00:00</div>\
                                        <div class="time__line">\
                                            <div class="line__current"></div>\
                                        </div>\
                                        <div class="time__full">00:00:00</div>\
                                    </div>\
                                </div>\
                                <div class="podcast__meta">\
                                    <div class="podcast__visual">\
                                        <div class="visual__progress"></div>\
                                        <canvas></canvas>\
                                    </div>\
                                    <div class="podcast__text">\
                                        <h3 class="podcast__title">' + info.title + '</h3>\
                                        <p class="podcast__date">' + info.date + '</p>\
                                        <p class="podcast__desc">' + info.description + '</p>\
                                    </div>\
                                </div>';
        el.innerHTML = plr;
    }
    window.initAll = initPlayers;
    window.initPlayer = initPlayer;
})();
function hasClass(elem, className) {return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');}
function formatTime(time) {
    var timeArr = [Math.floor(((time % 31536000) % 86400) / 3600),
        Math.floor((((time % 31536000) % 86400) % 3600) / 60),
        ((((time % 31536000) % 86400) % 3600) % 60)
    ];
    timeArr[2] = timeArr[2].toString().split('.')[0];
    for (var i = 0; i < timeArr.length; i++) {
        if (timeArr[i] < 10) {
            timeArr[i] = '0' + timeArr[i];
        };
        i != 2 ? timeArr[i] += ':' : false;
    }
    return timeArr[0] + timeArr[1] + timeArr[2];
}
function getStyle(el, style) {var styles = window.getComputedStyle(el); return styles.getPropertyValue(style);}
initPlayer('.player-two', {
    audioSrc: 'songs/2.mp3',
    imageSrc: 'img/2.jpg',
    title: 'Gunnar Olsen – Flood Gates ',
    date: '24.07.2016',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
}, {
    on: true,
    bg: 'gray',
    textColor: '#000',
    lineColor: '#2ecc71'
});