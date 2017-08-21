+function ($) {
    'use strict';

    // PopVideo CLASS DEFINITION
    // ======================
    var PopVideo = function (element, options) {
        this.options = options
        this.$body = $(document.body)
        this.$element = $(element)
        this.popid = null
        this.$wrapper = null
        this.$control = null
        this.$playbtn = null
        this.video = null
        this.$video = null
        this.isOpen = null
        this.isPlay = null
        var self = this
        this.init(element, options)
    }
    PopVideo.VERSION = "0.0.3";
    PopVideo.DEFAULTS = {
        playOnOpen: false,
        closeOnEnd: false,
        pauseOnClose: true,
        closeKey: 'esc', //(String || Boolean) 可选值 any，false,esc。其他值默认为esc
        title: '',
        video: '',//(String || Array)
        duration: 300,
        callback: {
            onOpen: function (self) {
                //窗口打开时
            },
            onClose: function (self) {
                //窗口关闭时
            },
            onPlay: function (self) {
                //视频播放时
            },
            onPause: function (self) {
                //视频暂停
            },
            onEnd: function (self) {
                //视频播放完毕
            }
        }
    }
    PopVideo.prototype.getDefaults = function () {
        return PopVideo.DEFAULTS
    }
    PopVideo.prototype.getOptions = function (options) {
        options = $.extend({}, this.getDefaults(), this.$element.data(), options)
        return options
    }
    PopVideo.prototype.init = function (element, options) {
        this.options = this.getOptions(options);
        var video = !!this.options.video ? this.options.video : this.$element.attr('src');
        if (!video) {
            throw new Error('`video` option must be specified when initializing or the element must have the src attribute ')
        } else {
            this.video = video;
        }
        //生成一个随机5位数，作为id
        var popid = 'popid-'
        do popid += ~~(Math.random() * 100000)
        while (document.getElementById(popid))
        this.popid = popid
        //自定义控制界面
        var control = " <svg class=\"popvideo_svg_sprite\" display=\"none\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">\n" +
            "            <symbol id=\"popvideo_svg_play\" viewBox=\"0 0 36 36\">\n" +
            "                <path d=\"M25.8 18c0 .6-.3 1.1-.8 1.3L12.5 27c-.2.1-.5.2-.8.2-.8 0-1.5-.6-1.5-1.5V10c0-.8.7-1.5 1.5-1.5.3 0 .5.1.8.2l12.7 7.9c.4.5.6.9.6 1.4z\"></path>\n" +
            "            </symbol>\n" +
            "            <symbol id=\"popvideo_svg_replay\" viewBox=\"0 0 36 36\">\n" +
            "                <path d=\"M17.9 28c-4.9 0-9-3.6-9.8-8.3V19.4c0-.8.7-1.4 1.5-1.4s1.5.6 1.5 1.4c.8 3.8 4.5 6.2 8.3 5.4s6.2-4.5 5.4-8.3c-.7-3.2-3.5-5.6-6.9-5.6-1.8 0-3.6.7-4.8 2h1.3c.8 0 1.5.7 1.5 1.5s-.6 1.6-1.5 1.6h-4c-.8 0-1.5-.7-1.5-1.5v-4c0-.8.7-1.5 1.5-1.5.7 0 1.2.5 1.4 1.1C13.6 8.7 15.7 8 17.9 8c5.5 0 10 4.5 10 10s-4.4 10-10 10z\"></path>\n" +
            "            </symbol>\n" +
            "            <symbol id=\"popvideo_svg_pause\" viewBox=\"0 0 36 36\">\n" +
            "                <path d=\"M23.5 28c-.8 0-1.5-.7-1.5-1.5v-17c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5v17c0 .8-.7 1.5-1.5 1.5zm-11 0c-.8 0-1.5-.7-1.5-1.5v-17c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5v17c0 .8-.7 1.5-1.5 1.5z\"></path>\n" +
            "            </symbol>\n" +
            "            <symbol id=\"popvideo_svg_volume\" viewBox=\"0 0 20 20\">\n" +
            "                <path d=\"M16.714 15.593l-.01-.01a1 1 0 0 1-1.705-.708c0-.287.124-.542.317-.724C16.354 13.073 17 11.614 17 10s-.645-3.072-1.682-4.151A.993.993 0 0 1 15 5.125a1 1 0 0 1 1-1c.3 0 .561.139.744.348l.017-.016A7.969 7.969 0 0 1 19 10c0 2.178-.874 4.15-2.286 5.593zm-3.999 3.122a.956.956 0 0 1-.688.28c-.009 0-.018.005-.027.005a.984.984 0 0 1-.75-.357L5.818 15H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h3.818l5.432-3.643A.984.984 0 0 1 12 1c.009 0 .017.005.026.005a.954.954 0 0 1 .968.967c.001.01.006.018.006.028v16c0 .009-.005.017-.005.026a.959.959 0 0 1-.28.689zM6.75 6.643A.984.984 0 0 1 6 7H3v6h3c.304 0 .567.143.75.357l4.25 2.85V3.792L6.75 6.643z\"></path>\n" +
            "            </symbol>\n" +
            "            <symbol id=\"popvideo_svg_volume_mute\" viewBox=\"0 0 20 20\">\n" +
            "                <path d=\"M16.394 12.566A5.88 5.88 0 0 0 17 10a5.97 5.97 0 0 0-1.682-4.151.993.993 0 0 1-.318-.724 1 1 0 0 1 1-1c.3 0 .561.139.745.348l.016-.016A7.969 7.969 0 0 1 19 10a7.934 7.934 0 0 1-1.116 4.055l-1.49-1.489zM11 3.792L8.978 5.149 7.62 3.792l3.63-2.435A.984.984 0 0 1 12 1c.009 0 .017.005.026.005a.954.954 0 0 1 .968.967c.001.01.006.018.006.028v7.171l-2-2V3.792zm7.864 14.072a.999.999 0 0 1-1.414 0L2.136 2.55a1 1 0 1 1 1.415-1.415L18.864 16.45a1 1 0 0 1 0 1.414zM3.171 5l2 2H3v6h3c.304 0 .567.143.75.357l4.25 2.85v-3.379l2 2V18c0 .009-.005.017-.005.027a.955.955 0 0 1-.967.968c-.01 0-.019.005-.028.005a.984.984 0 0 1-.75-.357L5.818 15H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.171z\"></path>\n" +
            "            </symbol>\n" +
            "            <symbol id=\"popvideo_svg_fullscreen\" viewBox=\"0 0 24 24\">\n" +
            "                <path d=\"M19.7 19.7c-.2.2-.5.3-.7.3h-4c-.6 0-1-.4-1-1s.4-1 1-1h1.6l-3.3-3.3c-.4-.4-.3-1.1.1-1.4.4-.4 1-.4 1.4 0l3.3 3.3V15c0-.6.4-1 1-1s1 .4 1 1v4c-.1.2-.2.5-.4.7zM19 10c-.6 0-1-.4-1-1V7.4l-3.3 3.3c-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4L16.6 6H15c-.6 0-1-.4-1-1s.4-1 1-1h4c.3 0 .5.1.7.3.2.2.3.5.3.7v4c0 .6-.4 1-1 1zM7.4 18H9c.6 0 1 .4 1 1s-.4 1-1 1H5c-.3 0-.5-.1-.7-.3-.2-.2-.3-.5-.3-.7v-4c0-.6.4-1 1-1s1 .4 1 1v1.6l3.3-3.3c.4-.4 1.1-.3 1.4.1.4.4.4 1 0 1.4L7.4 18zm1.9-7.3L6 7.4V9c0 .6-.4 1-1 1s-1-.4-1-1V5c0-.3.1-.5.3-.7.2-.2.5-.3.7-.3h4c.6 0 1 .4 1 1s-.4 1-1 1H7.4l3.3 3.3c.4.4.4 1 0 1.4-.4.4-1 .4-1.4 0z\"></path>\n" +
            "            </symbol>\n" +
            "            <symbol id=\"popvideo_svg_fullscreen_true\" viewBox=\"0 0 24 24\">\n" +
            "                <path d=\"M16.4 9H18c.6 0 1 .4 1 1s-.4 1-1 1h-4c-.3 0-.5-.1-.7-.3-.2-.2-.3-.5-.3-.7V6c0-.6.4-1 1-1s1 .4 1 1v1.6l3.3-3.3c.4-.4 1.1-.3 1.4.1.4.4.4 1 0 1.4L16.4 9zM10 19c-.6 0-1-.4-1-1v-1.6l-3.3 3.3c-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4L7.6 15H6c-.6 0-1-.4-1-1s.4-1 1-1h4c.3 0 .5.1.7.3.2.2.3.5.3.7v4c0 .5-.4 1-1 1zm0-8H6c-.6 0-1-.4-1-1s.4-1 1-1h1.6L4.3 5.7c-.4-.4-.4-1 .1-1.4.4-.4 1-.4 1.4 0L9 7.6V6c0-.6.4-1 1-1s1 .4 1 1v4c0 .3-.1.5-.3.7-.2.2-.5.3-.7.3zm4 2h4c.6 0 1 .4 1 1s-.4 1-1 1h-1.6l3.3 3.3c.4.4.4 1 0 1.4s-1 .4-1.4 0L15 16.4V18c0 .6-.4 1-1 1s-1-.4-1-1v-4c0-.3.1-.5.3-.7.2-.2.5-.3.7-.3z\"></path>\n" +
            "            </symbol>\n" +
            "        </svg>\n" +
            "        <div data-role=\"popvideo-control-wrap\" class=\"popvideo-control-wrap\">\n" +
            "            <div class=\"popvideo_progress_bar_container\" data-role=\"popvideo-control-progress\">\n" +
            "                <div class=\"popvideo_progress_list\" data-role=\"popvideo-control-progress-list\">\n" +
            "                    <div class=\"popvideo_progress_load\"></div>\n" +
            "                    <div class=\"popvideo_progress_play\"></div>\n" +
            "                </div>\n" +
            "                <div class=\"popvideo_btn_scrubber\"><div class=\"popvideo_scrubber_indicator\"></div></div>" +
            "            </div>\n" +
            "            <div class=\"popvideo_controls\">\n" +
            "                <div class=\"popvideo_left_controls\" data-role=\"popvideo-control-left\">\n" +
            "                    <div data-role=\"popvideo-ui-control-playbtn\" class=\"popvideo_btn popvideo_btn_play\"\n" +
            "                         data-status=\"play\">\n" +
            "                        <svg class=\"popvideo_icon popvideo_icon_play\" version=\"1.1\" viewBox=\"0 0 36 36\">\n" +
            "                            <use class=\"popvideo_svg_symbol popvideo_svg_play\"\n" +
            "                                 xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
            "                                 xlink:href=\"#popvideo_svg_play\"></use>\n" +
            "                            <use class=\"popvideo_svg_symbol popvideo_svg_pause\"\n" +
            "                                 xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
            "                                 xlink:href=\"#popvideo_svg_pause\"></use>\n" +
            "                            <use class=\"popvideo_svg_symbol popvideo_svg_replay\"\n" +
            "                                 xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
            "                                 xlink:href=\"#popvideo_svg_replay\"></use>\n" +
            "                        </svg>\n" +
            "                    </div>\n" +
            "                    <div data-role=\"popvideo-control-time-mod\" class=\"popvideo_time_display\">\n" +
            "                        <div class=\"popvideo_time_current\" >00:00</div>\n" +
            "                        <div class=\"popvideo_time_separator\">/</div>\n" +
            "                        <div class=\"popvideo_time_duration\" >00:00</div>\n" +
            "                    </div>\n" +
            "                </div>\n" +
            "                <div class=\"popvideo_right_controls\" data-role=\"popvideo-control-right\">\n" +
            "                    <div class=\"popvideo_btn popvideo_btn_volume\" data-role=\"popvideo-control-volume-button\"\n" +
            "                         data-status=\"normal\">\n" +
            "                        <svg class=\"popvideo_icon popvideo_icon_volume\" version=\"1.1\" viewBox=\"0 0 24 24\">\n" +
            "                            <use class=\"popvideo_svg_symbol popvideo_svg_volume\"\n" +
            "                                 xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
            "                                 xlink:href=\"#popvideo_svg_volume\"></use>\n" +
            "                            <use class=\"popvideo_svg_symbol popvideo_svg_volume_mute\"\n" +
            "                                 xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
            "                                 xlink:href=\"#popvideo_svg_volume_mute\"></use>\n" +
            "                        </svg>\n" +
            "                        <div class=\"popvideo_volume_range\">\n" +
            "                            <div class=\"popvideo_volume_range_current\" style=\"width: 50%;\">\n" +
            "                                <div class=\"popvideo_volume_handle\" style=\"left: 50%;\"></div>\n" +
            "                            </div>\n" +
            "                        </div>\n" +
            "                    </div>\n" +
            "                    <div class=\"popvideo_btn popvideo_btn_fullscreen\"\n" +
            "                         data-status=\"false\"\n" +
            "                         data-report=\"window-fullscreen\">\n" +
            "                        <svg class=\"popvideo_icon popvideo_icon_fullscreen\" version=\"1.1\" viewBox=\"0 0 24 24\">\n" +
            "                            <use class=\"popvideo_svg_symbol popvideo_svg_fullscreen\"\n" +
            "                                 xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
            "                                 xlink:href=\"#popvideo_svg_fullscreen\"></use>\n" +
            "                            <use class=\"popvideo_svg_symbol popvideo_svg_fullscreen_true\"\n" +
            "                                 xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
            "                                 xlink:href=\"#popvideo_svg_fullscreen_true\"></use>\n" +
            "                        </svg>\n" +
            "                    </div>\n" +
            "                </div>\n" +
            "            </div>\n" +
            "        </div>";
        var tpl = '<div class="popvideo-wrapper" id="' + popid + '">' +
            '<div class="popvideo">' +
            '<div class="popvideo-head"><a href="javascript:void(0)" class="popvideo-close">&times;</a><h4 class="popvideo-title">' + this.options.title + '</h4></div>' +
            '<div class="popvideo-content">' + '<video webkit-playsinline="true"></video></div>' +
            control +
            '</div></div>';
        $('body').append(tpl);
        this.$wrapper = $('#' + popid);
        this.$video = this.$wrapper.find('video');
        this.$playbtn = this.$wrapper.find('.popvideo_btn_play');
        this.$control = this.$wrapper.find('.popvideo-control-wrap');
        this.setVideo(video);
        // 为x添加close事件
        var self = this;
        this.$wrapper.click(function (e) {
            if (e.target === this) {
                self.close();
            }
        });
        this.$wrapper.find('.popvideo-close').on('click.popvideo.close', function () {
            self.close();
        });
        //视频播放完毕事件
        this.$video.on('ended.popvideo', function (e) {
            self.options.callback.onEnd(self);
            self.pause();
            if (self.options.closeOnEnd) {
                self.close();
            }
        });
        // 视频播放时间改变时
        this.$video.on('timeupdate', function () {
            self.$control.find('.popvideo_time_current').html(formatTime(self.getCurrentTime()));
            // 更新进度条
            var percentage = self.getCurrentTime() / self.duration * 100 + "%";
            self.$control.find('.popvideo_progress_play').css('width', percentage);
            self.$control.find('.popvideo_btn_scrubber').css('left', percentage);
        });
        //当元数据（比如分辨率和时长）被加载时运行的脚本。
        this.$video.on('loadedmetadata', function (e) {
            var duration = self.duration = this.duration;
            self.$control.find('.popvideo_time_duration').html(formatTime(duration));
        });
        //音量改变时
        this.$video.on('volumechange', function (e) {
            var volume = self.volume = this.volume * 100;
            if (volume < 1) {
                self.$control.find('.popvideo_btn_volume').attr('data-status', 'mute');
            } else {
                self.$control.find('.popvideo_btn_volume').attr('data-status', 'normal');
            }
            self.$control.find('.popvideo_volume_range_current').css('width', volume + "%");
            self.$control.find('.popvideo_volume_handle').css('left', volume + "%");
        });
        //播放按钮事件
        this.$playbtn.on('click.popvideo.play', function () {
            var $playbtn = $(this);
            switch ($playbtn.attr('data-status')) {
                case 'play':
                    self.play();
                    break;
                case 'pause':
                    self.pause();
                    break;
                default:
                    self.play();
                    break;
            }
        })
        //空格控制播放
        $(window).on('keyup.space', function (e) {
            if (e.keyCode === 32 && self.isOpen) {
                if (self.isPlay) {
                    self.pause();
                } else {
                    self.play();
                }
            }
        });
        //进度条点击事件
        this.$control.find('.popvideo_progress_bar_container').on('click.progress', function (e) {
            e.preventDefault();
            var p = parseInt(self.duration * e.offsetX / $(this).width());
            self.setCurrentTime(p);
        });
        //声音控制界面点击事件
        this.$control.find('.popvideo_volume_range').click(function (e) {
            e.preventDefault();
            if (e.target === $(this).find('.popvideo_volume_handle')[0]) {
                return false;
            }
            var volume = ~~(e.offsetX / $(this).width() * 100);
            self.setVolume(volume);
        });
        this.$control.find('.popvideo_btn_volume').click(function (e) {
            if (e.target === $(this).find('.popvideo_icon_volume')[0]) {
                switch ($(this).attr('data-status')) {
                    case "mute":
                        self.setVolume(50);
                        break;
                    case "normal":
                        self.setVolume(0);
                        break;
                    default:
                        break;
                }
            }
        })
        //全屏
        this.$control.find('.popvideo_btn_fullscreen').click(function () {
            switch ($(this).attr('data-status')) {
                case "false":
                    self.fullScreen();
                    break;
                case "true":
                    self.exitFullScreen();
                    break;
                default:
                    break;
            }
        })
    };
    PopVideo.prototype.open = function () {
        $('body').css('overflow', 'hidden');
        this.$wrapper.fadeIn(this.options.duration).on('scroll.popvideo', function (e) {
            e.preventBubble();
        });
        if (this.options.playOnOpen) {
            this.play();
        }
        var self = this;
        if (this.options.closeKey) {
            var key = this.options.closeKey;
            switch (key) {
                case 'any':
                    $(window).one('keyup.closeKey', function (e) {
                        if (e.keyCode) {
                            self.close();
                        }
                    });
                    break;
                case 'esc':
                    $(window).one('keyup.closeKey', function (e) {
                        if (e.keyCode === 27) {
                            self.close();
                        }
                    });
                    break;
                case false:
                    break;
                default:
                    $(window).one('keyup.closeKey', function (e) {
                        if (e.keyCode === 27) {
                            self.close();
                        }
                    });
                    break;
            }
        }
        this.isOpen = true;
        //打开后回调onOpen函数
        this.options.callback.onOpen(this);
    };
    PopVideo.prototype.play = function () {
        this.$video[0].play();
        // 改变播放按钮状态
        this.$playbtn.attr('data-status', 'pause');
        this.isPlay = true;
        this.options.callback.onPlay(this);
    }
    PopVideo.prototype.pause = function () {
        this.$video[0].pause();
        this.$playbtn.attr('data-status', 'play');
        this.isPlay = false;
        this.options.callback.onPause(this);
    };
    PopVideo.prototype.close = function () {
        $('body').css('overflow', 'auto');
        this.$wrapper.fadeOut(this.options.duration).off('scroll.popvideo');
        if (this.options.pauseOnClose) {
            this.pause();
        }
        this.isOpen = false;
        this.options.callback.onClose(this);
    };
    PopVideo.prototype.destroy = function () {
        this.$body.remove(this.$wrapper);
    };
    PopVideo.prototype.getCurrentTime = function () {
        return this.$video[0].currentTime
    };
    PopVideo.prototype.setCurrentTime = function (time) {
        // todo 添加缓冲页面
        this.$video[0].currentTime = time;
    };
// 声音控制
    PopVideo.prototype.getVolume = function () {
        return Math.round(this.$video[0].volume * 100);
    };
    PopVideo.prototype.setVolume = function (volume) {
        this.$video[0].volume = volume / 100 < 0.06 ? 0 : (volume / 100 > 0.94 ? 1 : volume / 100);
    }
    PopVideo.prototype.fullScreen = function () {
        requestFullScreen(this.$wrapper.find('.popvideo')[0])
        this.$control.find('.popvideo_btn_fullscreen').attr('data-status', 'true')
        this.$wrapper.find('.popvideo').addClass('popvideo-fullscreen')

    }
    PopVideo.prototype.exitFullScreen = function () {
        this.$control.find('.popvideo_btn_fullscreen').attr('data-status', 'false');
        this.$wrapper.find('.popvideo').removeClass('popvideo-fullscreen')
        exitFull();
    }
    PopVideo.prototype.getVideo = function () {
        return this.$video[0].currentSrc;
    }
    PopVideo.prototype.setVideo = function (video) {
        this.$video.attr('src', video);
    };

    // PopVideo PLUGIN DEFINITION
    // ===========================
    var formatTime = function (length) {
        if (typeof length !== "number") {
            return false
        }
        var hour = parseInt(length / (60 * 60));
        hour = hour > 9 ? hour : "0" + hour;
        var minute = parseInt(length / 60) % 60;
        minute = minute > 9 ? minute : "0" + minute;
        var second = parseInt(length % 60);
        second = second > 9 ? second : "0" + second;
        return hour === "00" ? minute + ":" + second : hour + ":" + minute + ":" + second;
    }

    function Plugin(option) {
        // return this.each(function () {
        //     var $this = $(this)
        //     var data = $this.data('PopVideo')
        //     if (!data) $this.data('PopVideo', (data = new PopVideo(this, option)))
        //     if (typeof option == 'string') data[option]()
        // })
        var $this = $(this)
        var data = $this.data('PopVideo')
        if (!data) $this.data('PopVideo', (data = new PopVideo(this, option)))
        if (typeof option === 'string') data[option]()
        return data;
    }

    function requestFullScreen(element) {
        // 判断各种浏览器，找到正确的方法
        var requestMethod = element.requestFullScreen || //W3C
            element.webkitRequestFullScreen ||    //Chrome等
            element.mozRequestFullScreen || //FireFox
            element.msRequestFullScreen; //IE11
        if (requestMethod) {
            requestMethod.call(element);
        }
        else if (typeof window.ActiveXObject !== "undefined") {//for Internet Explorer
            var wscript = new ActiveXObject("WScript.Shell");
            if (wscript !== null) {
                wscript.SendKeys("{F11}");
            }
        }
    }

    //退出全屏 判断浏览器种类
    function exitFull() {
        // 判断各种浏览器，找到正确的方法
        var exitMethod = document.exitFullscreen || //W3C
            document.mozCancelFullScreen ||    //Chrome等
            document.webkitExitFullscreen || //FireFox
            document.webkitExitFullscreen; //IE11
        if (exitMethod) {
            exitMethod.call(document);
        }
        else if (typeof window.ActiveXObject !== "undefined") {//for Internet Explorer
            var wscript = new ActiveXObject("WScript.Shell");
            if (wscript !== null) {
                wscript.SendKeys("{F11}");
            }
        }
    }

    var old = $.fn.popVideo

    $.fn.popVideo = Plugin
    $.fn.popVideo.constructor = PopVideo


    // PopVideo NO CONFLICT
    // =====================

    $.fn.popVideo.noConflict = function () {
        $.fn.popVideo = old
        return this
    }

}(jQuery);