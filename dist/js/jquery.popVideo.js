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
        this.video = null
        this.$video = null
        var self = this
        this.isOpen = false
        this.init(element, options)
        this.isPlay = function () {
            return !self.$video[0].paused
        }
        this.isLoop = function () {
            return !!self.$video.attr('loop')
        }
    }
    PopVideo.VERSION = "0.0.3";
    PopVideo.DEFAULTS = {
        playOnOpen: false,
        closeOnEnd: false,
        pauseOnClose: true,
        loop: false,
        closeKey: 'esc', //(String || Boolean) 可选值 any，false,esc。其他值默认为esc
        title: '',
        video: '',//(String || Array)
        duration: 300,
        callback: {
            // TODO 回调的插入位置
            onOpen: function () {
                //窗口打开时
            },
            onClose: function () {
                //窗口关闭时
            },
            onPlay: function () {
                //视频播放时
            },
            onPause: function () {
                //视频暂停
            },
            onEnd: function () {
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
        var loop = this.options.loop ? 'loop': '';
        //生成一个随机5位数，作为id
        var popid = 'popid-'
        do popid += ~~(Math.random() * 100000)
        while (document.getElementById(popid))
        this.popid = popid
        //TODO 自定义控制界面
        var tpl = '<div class="popvideo-wrapper" id="' + popid + '">' +
            '<div class="popvideo">' +
            '<div class="popvideo-head">' +
            '<a href="javascript:void(0)" class="popvideo-close">&times;</a><h3 class="popvideo-title">' + this.options.title + '</h3>' +
            '</div>' +
            '<div class="popvideo-content">' + '<video controls '+loop+'></video>' +
            '</div></div></div>';
        $('body').append(tpl);
        this.$wrapper = $('#' + popid);
        this.$video = this.$wrapper.find('video');
        this.setVideo(video);
        // 为x添加close事件
        var self = this;
        this.$wrapper.find('.popvideo-close').on('click.popvideo.close',function () {
            self.close();
        });
        if(this.options.closeOnEnd){
            self.$video.on('ended.close', function () {
                self.close();
            });
        }
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
        if(this.options.closeKey){
            var key = this.options.closeKey;
            switch (key){
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
        this.options.callback.onOpen();
    };
    PopVideo.prototype.play = function () {
        this.$video[0].play();
    }
    PopVideo.prototype.pause = function () {
        this.$video[0].pause();
    }
    PopVideo.prototype.close = function () {
        $('body').css('overflow', 'auto');
        this.$wrapper.fadeOut(this.options.duration).off('scroll.popvideo');
        if (this.options.pauseOnClose) {
            this.pause();
        }
        this.isOpen = false;
    };
    PopVideo.prototype.destroy = function () {
        this.$body.remove(this.$wrapper);
    };
    PopVideo.prototype.setVideo = function (video) {
this.$video.attr('src',video);
    }

    // PopVideo PLUGIN DEFINITION
    // ===========================

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

    var old = $.fn.popVideo

    $.fn.popVideo = Plugin
    $.fn.popVideo.Constructor = PopVideo


    // PopVideo NO CONFLICT
    // =====================

    $.fn.popVideo.noConflict = function () {
        $.fn.popVideo = old
        return this
    }

}(jQuery);