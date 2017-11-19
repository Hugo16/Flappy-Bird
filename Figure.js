(function(){
    /**
     * @description 鸟
     * @param option
     * @constructor
     */
    function Bird(option) {
        this._init(option);
    }

    Bird.prototype = {
        constructor: Bird,
        _init: function (option) {
            option = option || {};
            this.img = option.img0;
            this.img0 = option.img0;
            this.img1 = option.img1;
            this.img2 = option.img2;
            this.x = 80;
            this.y = 150;
            this.state = 1;
            this.t = 1;
            this.wings = 0;
            this.angle = 0;
            this.r = 24;
        },

        render: function (ctx) {
            ctx.save();
            ctx.beginPath();

            ctx.translate(this.x + 17, this.y + 12);
            ctx.rotate(this.angle * Math.PI / 180);
            ctx.translate(-(this.x + 17), -(this.y + 12));
            ctx.drawImage(this.img, 6, 13, 34, 24, this.x, this.y, 34, 24);

            ctx.restore();
        },

        update: function (frame) {
            // 改变翅膀状态
            if (frame % 5 === 0) {
                this.wings++;
                if (this.wings > 2) {
                    this.wings = 0;
                }
                this.img = this["img" + this.wings];
            }

            // 计算下落
            if (this.state) {
                this.t += 0.15;
                this.y += this.t;
                this.angle++;
            }
            else {
                this.t--;
                this.y -= this.t;
                this.angle = -25;
                if (this.t <= 0) {
                    this.state = 1;
                }
            }
        }
    };

    /**
     * @description 地板
     * @param option
     * @constructor
     */
    function Land(option) {
        this._init(option);
    }

    Land.prototype = {
        constructor: Land,
        _init: function (option) {
            option = option || {};
            this.img = option.img;
            this.x = option.x || 0;
            this.y = option.y;
            this.width = option.width || 336;
            this.height = option.height || 112;
            this.speed = option.speed || 1;
        },

        render: function (ctx) {
            ctx.save();
            ctx.beginPath();

            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);

            ctx.restore();
        },

        update: function () {
            this.x -= this.speed;
            if (this.x <= -48) {
                this.x = 0;
            }
        },

        crash: function (bird) {
            return bird.y+bird.r > this.y;
        }

    };

    /**
     * @description 水管
     * @param option
     * @constructor
     */
    function Pipe(option) {
        this._init(option)
    }

    Pipe.prototype = {
        constructor: Pipe,
        _init: function (option) {
            option = option || {};
            this.img1 = option.img1;
            this.img2 = option.img2;
            this.x = option.x || 0;
            this.y1 = -Math.random() * 300;
            this.y2 = this.y1 + 100 + 320;
            this.speed = option.speed;
            this.width = 52;
        },

        render: function (ctx) {
            ctx.save();
            ctx.beginPath();

            ctx.drawImage(this.img1, this.x, this.y1);
            ctx.drawImage(this.img2, this.x, this.y2);

            ctx.restore();
        },

        update: function () {
            this.x -= this.speed;
            if (this.x <= 0 - this.width) {
                return this;
            }
        },

        crash: function (bird) {
            let x = bird.x;
            let y = bird.y;
            let r = bird.r;
            // 检测碰撞
            let crashTop = x + r > this.x && x < this.x + this.width && y < this.y1 + 320;
            let crashBottom = x + r > this.x && x < this.x + this.width && y + r > this.y2;
            if (crashTop || crashBottom) {
                return true;
            }
        }
    };

    /**
     * @description 分数
     * @param option
     * @constructor
     */
    function Score(option) {
        this._init(option);
    }

    Score.prototype = {
        constructor: Score,

        _init: function (option) {
            this.score = -1;
            // 图片数组
            this.numArr = option.numArr || [];
            this.x = option.x || 144;
            this.y = option.y || 80;
            this.width = 25;
        },

        render: function (ctx) {
            let numStr = this.score.toString();
            let len = numStr.length;
            let x = this.x -this.width * len / 2;
            for (let i = 0; i < len; i++) {
                let img = new Image();
                img.src = this.numArr[numStr[i] * 1].src;
                ctx.save();
                ctx.beginPath();

                ctx.drawImage(img, x + this.width * i, this.y);

                ctx.restore();
            }
        },

        update: function (game) {
            if (game.frameUtil.currentFrame % 100 === 0) {
                this.score++;
                if(this.score>0) game.allAudio.goal.play();
            }
        }
    };

    window.Score = Score;
    window.Pipe = Pipe;
    window.Land = Land;
    window.Bird = Bird;
})();