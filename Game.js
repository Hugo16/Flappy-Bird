(function () {
    function Game(option) {
        this._init(option);
    }

    Game.prototype = {
        constructor: Game,

        _init: function (option) {
            let self = this;
            option = option || {};
            this.option = option;
            // 帧数
            this.fps = option.fps || 60;
            // 管子和地面的速度
            this.speed = option.speed || 1;
            // 管子数组
            this.pipeArr = [];
            // 帧工具对象；
            this.frameUtil = new FrameUtil();
            // 获取canvas
            this.canvas = document.getElementById(option.canvasId);
            this.ctx = this.canvas.getContext("2d");
            // 顶部到地面的距离
            this.groudHeight = 430;
            // 素材工具类
            this.SourceUtil = new SourceUtil();
            // 加载素材
            this.SourceUtil.loadSounds(function (allAudio, length, loadedAudioCount) {
                if (loadedAudioCount === length) {
                    // 获取所有音频
                    self.allAudio = allAudio;
                }
            });
            this.SourceUtil.loadImages(function (allImages, length, loadedImagesCount) {
                if (loadedImagesCount === length) {
                    // 设置背景
                    self.canvas.style.background = "url(" + allImages.bgDay.src + ")";
                    self.allImages = allImages;
                    // 创建土地
                    self.land = new Land({
                        img: allImages.land,
                        y: self.groudHeight,
                        speed: self.speed
                    });
                    // 创建鸟
                    self.bird = new Bird({
                        img0: allImages.birdY0,
                        img1: allImages.birdY1,
                        img2: allImages.birdY2
                    });
                    // 创建分数
                    self.score = new Score({
                        numArr: allImages.numArr
                    });
                    self.startGame();
                }
            });
        },

        // 开始游戏
        run: function () {
            let self = this;
            // 改变点击事件
            self.canvas.onclick = function () {
                self.bird.state = 0;
                self.bird.t = 10;
                self.bird.angle = 0;
                // 播放翅膀声音
                self.allAudio.wing.currentTime = 0;
                self.allAudio.wing.play();
            };
            self.canvas.removeEventListener("tap",self.canvas.onclick);
            self.canvas.addEventListener("tap", self.canvas.onclick);
            // 场景循环绘制
            this.loopTimer = setInterval(function () {
                self.updateLoop();
                self.renderLoop();
                if (self.crashLoop()) {
                    // 播放撞击声音
                    self.allAudio.crash.play();
                    self.gameOver();
                }
            }, 1000 / self.fps);
        },

        // 游戏开始界面
        startGame: function () {
            let self = this;
            // 清屏
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            // 绘制封面
            this.land.render(this.ctx);
            this.ctx.drawImage(this.allImages.title, this.canvas.width / 2 - 89, 50);
            this.ctx.drawImage(this.allImages.tutorial, this.canvas.width / 2 - 57, 150);
            this.ctx.drawImage(this.allImages.textReady, this.canvas.width / 2 - 102, 250);
            // 添加点击事件
            this.canvas.onclick = function (e) {
                e.preventDefault();
                // 播放开始声音
                self.allAudio.start.play();
                self.run();
            };
            this.canvas.addEventListener("tap", this.canvas.onclick);
            window.document.onkeydown = function (event) {
                let e = event || window.event;
                if (e.keyCode === 32) {
                    self.canvas.onclick();
                }
            };
        },

        // 结束游戏
        gameOver: function () {
            let self = this;
            // 停止更新场景
            clearInterval(this.loopTimer);
            // 更改点击事件
            this.canvas.onclick = function () {
            };
            self.canvas.removeEventListener("tap",self.canvas.onclick);
            // 播放掉落声音
            self.allAudio.fall.play();
            // 鸟的垂死挣扎
            this.gameOverTimer = setInterval(function () {
                // 更新鸟的位置
                self.bird.update(self.frameUtil.currentFrame);
                // 绘制场景
                self.renderLoop();
                // 绘制结束图标
                self.ctx.drawImage(self.allImages.textGameOver, self.canvas.width / 2 - 102, 150);
                // 检测碰到土地
                if (self.land.crash(self.bird)) {
                    clearInterval(self.gameOverTimer);
                    self.canvas.onclick = function () {
                        self = new Game(self.option);
                    };
                    self.canvas.addEventListener("tap", function(e){
                        e.preventDefault();
                        self = new Game(self.option);
                    });
                }
            }, 1000 / self.fps);
        },

        // 更新
        updateLoop: function () {
            // 更新管子
            for (let i = 0; i < this.pipeArr.length; i++) {
                // 清空移出屏幕的管子
                if (this.pipeArr[i].update()) {
                    this.pipeArr.splice(i, 1);
                }
            }
            // 更新鸟
            this.bird.update(this.frameUtil.currentFrame);
            // 更新土地
            this.land.update();
            // 更新分数
            this.score.update(this);
        },

        // 绘制
        renderLoop: function () {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            // 绘制管子
            for (let i = 0; i < this.pipeArr.length; i++) {
                // 绘制管子
                this.pipeArr[i].render(this.ctx);
            }
            // 每100帧绘制新的管子
            if (this.frameUtil.currentFrame % 100 === 0) {
                this.pipeArr.push(new Pipe({
                    img1: this.allImages.pipeDown,
                    img2: this.allImages.pipeUp,
                    x: this.canvas.width,
                    speed: this.speed
                }));
            }

            // 绘制鸟
            this.bird.render(this.ctx);

            // 绘制土地
            this.land.render(this.ctx);

            // 绘制分数
            this.score.render(this.ctx);

            // 计算并显示真实帧
            this.frameUtil.countFps(this.ctx);
        },

        // 检测碰撞
        crashLoop: function () {
            let stop = false;
            for (let i = 0; i < this.pipeArr.length; i++) {
                //检测碰撞
                if (this.pipeArr[i].crash(this.bird)) {
                    stop = true;
                }
            }
            // 检测碰到土地
            if (this.land.crash(this.bird)) {
                stop = true;
            }

            return stop;
        }
    };

    window.Game = Game;
})();