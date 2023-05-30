let game;
let gameOptions = {

    // Inställningar
    bollsize: 0.04,
    bollspeed: 1000,
    blocksPerrad: 7,
    blockrader: 8,
    maxBlocksPerrad: 4,
    chansSpecial: 60
}
window.onload = function() {
    let gameConfig = {
        type: Phaser.AUTO,
        backgroundColor:0x444444,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            parent: "thegame",
            width: 640,
            height: 960
        },
        physics: {
            default: "arcade"
        },
        scene: playGame
    };
    game = new Phaser.Game(gameConfig);
    window.focus();
};

// spel status
const VANTAR_PA_SPELARE = 0;
const SPELARE_SIKTAR = 1;
const BOLLARNA_FLYTTAS = 2;
const FYSIKEN_UPPDATERAS = 3;
const FORBERDER_NASTA = 4;

class playGame extends Phaser.Scene {
    constructor() {
        super("PlayGame");
    }
    preload() {
        this.load.image("ball", "ball.png");
        this.load.image("panel", "panel.png");
        this.load.image("sikte", "sikte.png");
        this.load.image("block", "block.png");
    }
    create() {

        this.gameState = VANTAR_PA_SPELARE;
        this.gameOver = false;
        this.level = 0;
        this.anvandablock = [];
        this.blockSize = game.config.width / gameOptions.blocksPerrad;
        this.Spelarhojd = this.blockSize * gameOptions.blockrader;
        this.emptySpace = game.config.height - this.Spelarhojd;
        this.physics.world.setBounds(0, this.emptySpace / 2, game.config.width, this.Spelarhojd);
        this.blockGroup = this.physics.add.group();
        this.bollGroup = this.physics.add.group();
        this.Specialblock = this.physics.add.group();

        let topbanner = this.add.sprite(game.config.width / 2, 0, "panel");
        topbanner.displayWidth = game.config.width;
        topbanner.displayHeight = this.emptySpace / 2;
        let text = this.add.text(topbanner.x, topbanner.y + 50, "Ballz", {
            font: "bold 64px Arial",
            align: "center",
            color: "#E3C2FE"
        });
        text.setOrigin(0.5);
        topbanner.setOrigin(0.5, 0);

        this.score = this.add.text(topbanner.x + 175, topbanner.y + 50, 0, {
            font: "bold 64px Arial",
            align: "center",
            color: "#E3C2FE"
        });
        this.scoreval = 0;
        this.score.setOrigin(0.5);

        this.Round = this.add.text(topbanner.x-175, topbanner.y + 50, this.level, {
            font: "bold 64px Arial",
            align: "center",
            color: "#E3C2FE"
        });
        this.Round.setOrigin(0.5);

        this.botPanel = this.add.sprite(game.config.width / 2, game.config.height, "panel");
        this.botPanel.displayWidth = game.config.width;
        this.botPanel.displayHeight = this.emptySpace / 2;
        this.botPanel.setOrigin(0.5, 1);

        this.instructioner = this.add.text(topbanner.x,this.botPanel.y - 525, "Use you mouse to aim, Hold down",{
            font: "bold 32px Arial",
            align: "center",
            color: "#E3C2FE"
        });
        this.instructioner.setOrigin(0.5)
        this.instructioner2 = this.add.text(topbanner.x,this.botPanel.y - 475, "the left button and drag backwards",{
            font: "bold 32px Arial",
            align: "center",
            color: "#E3C2FE"
        });
        this.instructioner2.setOrigin(0.5)
        this.instructioner3 = this.add.text(topbanner.x,this.botPanel.y - 425, "Aim and relese when ready to shoot",{
            font: "bold 32px Arial",
            align: "center",
            color: "#E3C2FE"
            
        });
        this.instructioner3.setOrigin(0.5)
        this.bollsize = game.config.width * gameOptions.bollsize;
        this.nyBoll(game.config.width / 2, game.config.height - this.botPanel.displayHeight - this.bollsize / 2, false);

        this.addsikte();
        this.nyBlockrad();

        this.input.on("pointerdown", this.borjaSikta, this);
        this.input.on("pointerup", this.skjut, this);
        this.input.on("pointermove", this.sikta, this);

        this.physics.world.on("worldbounds", this.landa, this);
    }
// lägger till extra bollar
    nyBoll(x, y, prickadboll) {
        let ball = prickadboll ? this.Specialblock.create(x, y, "ball") : this.bollGroup.create(x, y, "ball");
        
        ball.displayWidth = this.bollsize;
        ball.displayHeight = this.bollsize;
        ball.body.setBounce(1, 1);

        if(prickadboll) {
            ball.row = 1;
            ball.collected = false;
        }

        else {

            ball.body.collideWorldBounds = true;
            ball.body.onWorldBounds = true;
        }
    }
        // skjuter bollarna
    skjut() {
        if(this.gameState == SPELARE_SIKTAR) {
            this.sikte.setVisible(false);
            if(this.giltiglinje) {
                this.gameState = BOLLARNA_FLYTTAS;
                this.landadeBollar = 0;
                let angleOfFire = Phaser.Math.DegToRad(this.sikte.angle - 90);
                this.instructioner.visible = false;
                this.instructioner2.visible = false;
                this.instructioner3.visible = false;

                this.bollGroup.getChildren().forEach(function(ball, index) {
                    this.time.addEvent({
                        delay: 100 * index,
                        callback: function() {
                            ball.body.setVelocity(gameOptions.bollspeed * Math.cos(angleOfFire), gameOptions.bollspeed * Math.sin(angleOfFire));
                        }
                    });
                }.bind(this))
            }
            else {
                this.gameState = VANTAR_PA_SPELARE;
            }
        }
    }
    
    bollPosition() {
        let children = this.bollGroup.getChildren();
        return {
            x: children[0].x,
            y: children[0].y
        }
    }
    landa(ball, up, down, left, right) {
        if(down && this.gameState == BOLLARNA_FLYTTAS) {
            ball.setVelocity(0);
            this.landadeBollar ++;

            if(this.landadeBollar == 1) {
                this.ForstaLandade = ball;
            }
        }
    }
    //När bollen prickar blocken
    BollPrickarBlock() {
        this.physics.world.collide(this.bollGroup, this.blockGroup, function(ball, block, ) {
            block.value --;
            if(block.value == 0) {
                this.anvandablock.push(block);
                this.blockGroup.remove(block);
                block.visible = false;
                block.text.visible = false;
                this.scoreval ++;
                this.score.setText(this.scoreval);
            }
            else{
                block.text.setText(block.value);
            }
        }, null, this);
    }
    //När bollen prickar special block som ger ny boll
    BollPrickarSpecial() {
        this.physics.world.overlap(this.bollGroup, this.Specialblock, function(ball, specialblock) {
            specialblock.collected = true;
            this.tweens.add({
                targets: specialblock,
                y: game.config.height - this.botPanel.displayHeight - specialblock.displayHeight / 2,
                duration: 200,
                ease: "Cubic.easeOut"
            });
        }, null, this);
    }
    // lägger till blocken
    nyttBlock(x, y, anvanda) {
        let block = anvanda ? this.anvandablock.shift() : this.blockGroup.create(x, y, "block");
        block.displayWidth = this.blockSize;
        block.displayHeight = this.blockSize;

        block.value = this.level;
        block.row = 1;

        if(anvanda) {
            block.x = x;
            block.y = y;
            block.text.setText(block.value);
            block.text.x = block.x;
            block.text.y = block.y;
            block.setVisible(true);
            block.text.setVisible(true);
            this.blockGroup.add(block);
        }

        else {
            let text = this.add.text(block.x, block.y, block.value, {
                font: "bold 32px Arial",
                align: "center",
                color: "#000000"
            });
            text.setOrigin(0.5);
            block.text = text;
        }

        block.body.immovable = true;
    }
    nyBlockrad() {
        this.level ++;
        this.Round.setText(this.level);
        let placerade = [];
        let placeraspecialblock = Phaser.Math.Between(0, 100) < gameOptions.chansSpecial;

        for(let i = 0; i < gameOptions.maxBlocksPerrad; i ++) {
            let blockPosition =  Phaser.Math.Between(0, gameOptions.blocksPerrad - 1);

            if(placerade.indexOf(blockPosition) == -1) {
                placerade.push(blockPosition);

                if(placeraspecialblock) {
                    placeraspecialblock = false;
                    this.nyBoll(blockPosition * this.blockSize + this.blockSize / 2, this.blockSize / 2 + this.emptySpace / 2, true);
                }

                else {

                    if(this.anvandablock.length == 0) {
                        this.nyttBlock(blockPosition * this.blockSize + this.blockSize / 2, this.blockSize / 2 + this.emptySpace / 2, false);

                    }
                    else{

                        this.nyttBlock(blockPosition * this.blockSize + this.blockSize / 2, this.blockSize / 2 + this.emptySpace / 2, true)
                    }
                }
            }
        }
    }


    // lägger siktet på bollen
    addsikte() {

        let bollPosition = this.bollPosition();
        this.sikte = this.add.sprite(bollPosition.x, bollPosition.y, "sikte");
        this.sikte.setOrigin(0.5, 1);
        this.sikte.setVisible(false);
    }

    borjaSikta() {

        if(this.gameState == VANTAR_PA_SPELARE) {

            this.giltiglinje = false;
            this.gameState = SPELARE_SIKTAR;

            this.sikte.x = this.bollPosition().x;
            this.sikte.y = this.bollPosition().y;
        }
    }

    sikta(e) {

        if(this.gameState == SPELARE_SIKTAR) {

            let distX = e.x - e.downX;
            let distY = e.y - e.downY;

            if(distY > 10) {

                this.giltiglinje = true;
                this.sikte.setVisible(true);
                this.direction = Phaser.Math.Angle.Between(e.x, e.y, e.downX, e.downY);
                this.sikte.angle = Phaser.Math.RadToDeg(this.direction) + 90;
            }

            else{
                this.giltiglinje = false;
                this.sikte.setVisible(false);
            }
        }
    }

    //flytar blocken
    flyttaBlock() {
        this.tweens.add({
            targets: this.blockGroup.getChildren(),
            props: {
                y: {
                    getEnd: function(target) {
                        return target.y + target.displayHeight;
                    }
                },
            },
            callbackScope: this,

            onUpdate: function(tween, target) {
                target.text.y = target.y;
            },

            onComplete: function() {
                this.gameState = VANTAR_PA_SPELARE;
                Phaser.Actions.Call(this.blockGroup.getChildren(), function(block) {
                    block.row ++;
                    if(block.row == gameOptions.blockrader) {
                        this.gameOver = true;
                    }
                }, this);

                if(!this.gameOver) {
                    this.nyBlockrad();
                }

                else {
                    this.scene.start("PlayGame");
                }
            },

            duration: 500,
            ease: "Cubic.easeInOut"
        });
    }

    flyttaBollar() {
        this.tweens.add({
            targets: this.bollGroup.getChildren(),
            x: this.ForstaLandade.gameObject.x,
            duration: 500,
            ease: "Cubic.easeInOut"
        });
    }
    flyttaSpecial() {
        Phaser.Actions.Call(this.Specialblock.getChildren(), function(ball) {
            if(ball.row == gameOptions.blockrader) {
                ball.collected = true;
            }
        })
        this.tweens.add({
            targets: this.Specialblock.getChildren(),
            props: {
                x: {

                    getEnd: function(target) {
                        if(target.collected) {
                            return target.scene.ForstaLandade.gameObject.x;
                        }
                        return target.x;
                    }
                },
                y: {
                    getEnd: function(target) {
                        if(target.collected) {
                            return target.scene.ForstaLandade.gameObject.y;
                        }
                        return target.y + target.scene.blockSize;
                    }
                },
            },

            callbackScope: this,
            onComplete: function() {
                Phaser.Actions.Call(this.Specialblock.getChildren(), function(ball) {
                    if(!ball.collected) {
                        ball.row ++;
                    }
                    else {
                        this.Specialblock.remove(ball);
                        this.bollGroup.add(ball);
                        ball.body.collideWorldBounds = true;
                        ball.body.onWorldBounds = true;
                        ball.body.setBounce(1, 1);
                    }
                }, this);
            },
            duration: 500,
            ease: "Cubic.easeInOut"
        });
    }
    update() {
        if((this.gameState == FYSIKEN_UPPDATERAS) || this.gameState == BOLLARNA_FLYTTAS && this.landadeBollar == this.bollGroup.getChildren().length) {
            if(this.gameState == BOLLARNA_FLYTTAS) {
                this.gameState = FYSIKEN_UPPDATERAS;
            }

            else{
                this.gameState = FORBERDER_NASTA;
                this.flyttaBlock();
                this.flyttaBollar();
                this.flyttaSpecial();

            }
        }

        if(this.gameState == BOLLARNA_FLYTTAS) {
            this.BollPrickarBlock();
            this.BollPrickarSpecial();
        }
    }
}
