# jquery.popVideo.js
## 开速开始
引入相关css和js
```html
<link rel="stylesheet" href="path/to/jquery.popVideo.css">
<script src="path/to/jquery-3.1.1.js"></script>
<script src="path/to/jquery.popVideo.js"></script>
```

```javascript
//以默认配置启动
var popvideo = $('#video').popVideo();
//传入string，string的可选值为下面的popvideo的方法
//如果没有使用在html中设置data-video ，则默认的video为#video的src
var popvideo = $('#video').popVideo("open")
//自定义配置
var popvideo = $('#video').popVideo({
            playOnOpen: true,
            title: "这是一个视频",
            closeOnEnd: true,
            pauseOnClose: true,
            video:'https://c1.mifile.cn/f/i/17/mi6/index/video-footer.mp4'
        });
  //默认配置
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
 //如果在html中设置了data-video

```

## popvideo的属性
```javascript
popvideo.$body
popvideo.$control
popvideo.$element
popvideo.$playbtn //播放按钮
popvideo.$wrapper
popvideo.duration
popvideo.isOpen
popvideo.isPlay
popvideo.options
popvideo.popid //this.$wrapper 的id
popvideo.video //当前播放视频的url
```

## popvideo的方法
```javascript
popvideo.play()
popvideo.pause()
popvideo.open()
popvideo.close()
popvideo.getDefaults()
popvideo.getOptions()
popvideo.getCurrentTime()
popvideo.setCurrentTime(number)//控制当前播放时间(范围[0 - 视频总长度，单位ms])
popvideo.getVolume()
popvideo.setVolume(number) // 控制当前播放声音(范围[0 - 100])
popvideo.fullScreen()
popvideo.exitFullScreen()
popvideo.getVideo() //获取当前播放视频的url
popvideo.setVideo(videourl) //控制当前播放的视频
popvideo.destroy()
```
## TODO
- 优化视频播放页面的交互，添加缓冲图
- 点击视频控制播放暂停
- 视频时间条和声音控制条的鼠标滑动控制
- 全屏时隐藏控制界面