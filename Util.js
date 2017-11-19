(function () {
    /**
     * @description 帧工具
     * @constructor
     */
    function FrameUtil() {
        this._init();
    }

    FrameUtil.prototype = {
        constructor: FrameUtil,
        _init: function () {
            // 当前帧数
            this.currentFrame = 0;
            // 开始帧数
            this.startFrame = 0;
            // 开始时间
            this.startTime = new Date();
            // 结束帧数
            this.realFrame = 0;
        },

        countFps: function (ctx) {
            this.currentFrame++;
            if ((new Date()) - this.startTime >= 999) {
                this.realFrame = this.currentFrame - this.startFrame;
                this.startFrame = this.currentFrame;
                this.startTime = new Date();
            }
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = "white";
            ctx.fillText("FPS:" + this.realFrame, 10, 15);
            ctx.restore();
        }

    };

    /**
     * @description 资源工具
     * @constructor
     */
    function SourceUtil() {
        this._init();
    }

    SourceUtil.prototype = {
        constructor: SourceUtil,
        _init: function () {
            this.allImages = {};
            this.allAudio = {};
        },

        loadImages: function (callBack) {
            let self = this;
            // 已经加载好的图片个数
            let loadedImagesCount = 0;
            let dataArr = Source().images;
            for (let i = 0; i < dataArr.length; i++) {
                if (dataArr[i].name === "numArr") {
                    this.allImages["numArr"] = dataArr[i].numPic;
                    loadedImagesCount++;
                    continue;
                }
                let image = new Image();
                image.src = dataArr[i].src;
                image.index = i;
                image.onload = function () {
                    loadedImagesCount++;
                    self.allImages[dataArr[this.index].name] = this;

                    callBack(self.allImages, dataArr.length, loadedImagesCount);
                }
            }
        },

        loadSounds: function (callBack) {
            let dataArr = Source().sounds;
            for (let i = 0; i < dataArr.length; i++) {
                let audio = document.createElement("audio");
                audio.setAttribute("src", dataArr[i].src);
                this.allAudio[dataArr[i].name] = audio;

                callBack(this.allAudio, dataArr.length, i + 1);
            }
        }
    };

    window.SourceUtil = SourceUtil;
    window.FrameUtil = FrameUtil;
})();