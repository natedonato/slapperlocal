class Game {
    constructor(canvasheight, canvaswidth) {
        this.canvasheight = canvasheight;
        this.canvaswidth = canvaswidth;
        this.playerWidth = 44;
        this.playerHeight = 66;
        this.player1 = new Player(canvaswidth - 180, 350, 1, this.playerWidth, this.playerHeight);
        this.player2 = new Player(150, 350, 2, this.playerWidth, this.playerHeight, "lightblue");
        this.platforms = [new Platform(100, 500, 600, 50)];
        this.friction = 0.85;
        this.gravity = 0.3;
        this.bumpSound = new Audio('./soundfx/pop.wav');


    }

    platformColision(platform, player){
        let vectorx = (player.pos.x + (player.width / 2)) - (platform.pos.x + (platform.width / 2));
        let vectory = (player.pos.y + (player.height / 2)) - (platform.pos.y + (platform.height / 2));
        let minwidth = (player.width / 2) + (platform.width / 2);
        let minheight = (player.height / 2) + (platform.height / 2);
        let avectorx = Math.abs(vectorx);
        let avectory = Math.abs(vectory);
        if(avectorx < minwidth && avectory < minheight){
            player.pos.y = Math.floor(platform.pos.y - player.height);
            if(player.vel.y > 0){
                player.vel.y = 0;
                player.airborne = false;
            }
        }
    }

    playerColision(player1, player2){
        if (player1.pos.x < player2.pos.x + player2.width &&
            player2.pos.x < player1.pos.x + player1.width &&
            player1.pos.y < player2.pos.y + player2.height &&
            player2.pos.y < player1.pos.y + player1.height
        ) {
            this.bumpSound.play();
            if(player1.pos.x > player2.pos.x){
                //player1 on right side
                player1.pos.x += (player1.pos.x - player2.pos.x) / 2;
                player2.pos.x -= (player1.pos.x - player2.pos.x) / 2;
                player1.vel.x = Math.abs(player1.vel.x) + 2;
                player2.vel.x = -Math.abs(player2.vel.x) - 2;

            }else{
                player2.pos.x += (player2.pos.x - player1.pos.x) / 2;
                player1.pos.x -= (player2.pos.x - player1.pos.x) / 2;
                player2.vel.x = Math.abs(player2.vel.x) + 2;
                player1.vel.x = -Math.abs(player1.vel.x) - 2;
            }
        }
    }

    updatePlayerPos(player, dt){
        player.vel.x *= this.friction;
        player.vel.y += this.gravity;
        player.pos.x += player.vel.x * dt;
        player.pos.y += player.vel.y * dt;

        if(player.pos.y > this.canvasheight){
            player.score --;
            this.player1.score ++;
            this.player2.score ++;
            player.pos.x = player.initialpos.x;
            player.pos.y = player.initialpos.y;
        }


    }


    updatePos(dt) {
        this.updatePlayerPos(this.player1, dt);
        this.updatePlayerPos(this.player2, dt);

        this.platforms.forEach(platform =>{
            this.platformColision(platform, this.player1);
            this.platformColision(platform, this.player2);
        });

        this.playerColision(this.player1, this.player2);

    }

}

class Platform{
    constructor(x,y,w,h, color = "red"){
        this.pos = { x: x, y: y };
        this.width = w;
        this.height = h;
        this.color = color;
    }
}


class Player{
    constructor(x, y, id, width, height, color = "blue") {
        this.pos = {
            x: x,
            y: y
        };
        this.direction = "right"
        this.initialpos = { x: x, y: y };

        this.id = id;
        this.width = width;
        this.height = height;
        this.maxspeed = 10;
        this.score = 0;

        this.vel = {
            x: 0,
            y: 0,
        };
        this.airborne = false;
        this.color = color;
    }

    jump(){
        if(!this.airborne){
            this.vel.y = -8;
            this.airborne = true;
        }
    }

    moveRight() {
        if (this.vel.x < this.maxspeed) {
            this.vel.x += 1;
        }
        this.direction = "right";
    }

    moveLeft() {
        if (this.vel.x > -this.maxspeed) {
            this.vel.x -= 1;
        }
        this.direction = "left"
    }



}



class GameView{
    constructor(game, ctx, canvasHeight, canvasWidth, walk, walkLeft){
        this.game = game;
        this.walkLeft = walkLeft;
        this.walk = walk;
        this.ctx = ctx;
        this.canvasHeight = canvasHeight;
        this.canvasWidth = canvasWidth;
        this.lastUpdated = 0;
        this.keys = {};
    }

    start(){
        this.bindkeys();
        this.update(1.6);
    }

    drawPlayer(player){

        this.ctx.fillStyle = player.color;
        this.ctx.fillRect(player.pos.x, player.pos.y, player.width, player.height);




        const scale = 2;
        const width = 22;
        const height = 33;
        const scaledWidth = scale * width;
        const scaledHeight = scale * height;


        if(player.direction === "right"){
        this.ctx.drawImage(this.walk, 0, 0, width, height, player.pos.x, player.pos.y, scaledWidth, scaledHeight);
        }else{
            this.ctx.drawImage(this.walkLeft, 0, 0, width, height, player.pos.x, player.pos.y, scaledWidth, scaledHeight);
        }

    }

    drawPlatform(platform){
        this.ctx.fillStyle = platform.color;
        this.ctx.fillRect(platform.pos.x, platform.pos.y, platform.width, platform.height);
    }

    drawPlatforms(){
        this.game.platforms.forEach(platform => {
            this.drawPlatform(platform);
        });
    }

    drawBackground(){
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        this.ctx.font = "30px Arial";
        this.ctx.fillStyle = this.game.player1.color;
        this.ctx.fillText(this.game.player1.score, 670, 100);
        this.ctx.fillStyle = this.game.player2.color;
        this.ctx.fillText(this.game.player2.score, 100, 100);
    }

    draw(){
        this.drawBackground();
        this.drawPlayer(this.game.player1);
        this.drawPlayer(this.game.player2);
        this.ctx.fillStyle = "red";
        this.ctx.fillRect(100, 500, this.canvasWidth - 200, 50);
    }

    bindkeys() {
        let gameview = this;
        window.addEventListener("keydown", function (e) {
            if (e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 39 || e.keyCode === 40 || e.keyCode === 13) {
            e.preventDefault();
            }
            gameview.keys[e.keyCode] = true;
        });

        window.addEventListener("keyup", function (e) {
            gameview.keys[e.keyCode] = false;
        });
    }

    handleKeys(){
        if (this.keys[38]) {
            this.game.player1.jump();
        }

        if (this.keys[87]) {
            this.game.player2.jump();
        }

        if (this.keys[39]) {
            this.game.player1.moveRight();
        }

        if (this.keys[68]) {
            this.game.player2.moveRight();
        }

        if (this.keys[37]) {
            this.game.player1.moveLeft();
        }

        if (this.keys[65]) {
            this.game.player2.moveLeft();
        }
    }


    update(timestamp) {
        const dt = (timestamp - this.lastUpdated) / 10;
        this.handleKeys();
        this.game.updatePos(dt);
        this.draw();
        this.lastUpdated = timestamp;
        requestAnimationFrame(this.update.bind(this));
    }

}

window.addEventListener('DOMContentLoaded', () => {
    const walkLeft = new Image();
    walkLeft.src = './sprites/skelly/SkeletonWalkLeft.png';
    walkLeft.onload = function() {
      console.log("left")
    };
    
    
    const walk = new Image();
    walk.src = './sprites/skelly/SkeletonWalk.png';
    walk.onload = function() {
      init();
      console.log("hey")
    };



    const canvas = document.getElementById("gameCanvas");
    canvas.width = 800;
    canvas.height = 625;

    canvas.style.width = canvas.width;
    canvas.style.height = canvas.height;

    const ctx = canvas.getContext("2d");

    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;


    function init () {
        const game = new Game(canvas.height, canvas.width);
        const gameView = new GameView(game, ctx, canvas.height, canvas.width, walk, walkLeft).start();
    }
});


