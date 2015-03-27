var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

WebFontConfig = {

    active: function() { game.time.events.add(Phaser.Timer.SECOND, createText, this); },

    google: {
        families: ['Press Start 2P']
    }

};

function preload() {

    game.load.spritesheet('carplayer', 'assets/car.png', 39, 45, 4);
    game.load.image('background', 'assets/background.png');
    game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
    game.load.image('box', 'assets/box.png');
    game.load.image('carred', 'assets/carred.png');
    game.load.spritesheet('kaboom', 'assets/explode.png', 50, 50, 5);
    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('particle', 'assets/particle.png');

}

var player;
var cursors;
var background;
var speed = 150;
var grassTime;
var grassAlert;
var timer = 0;
var explosions;
var boxes;
var boxCounter = 0;
var carHit = false;
var lives;
var hitCount;
var stateText;
var bullets;
var fireButton;
var bulletTime = 0;
var emitter;
var score = 0;
var scoreText;

function create() {
    //Create World
    game.physics.startSystem(Phaser.Physics.ARCADE);
    background = this.game.add.tileSprite(0, 0, 800, 600, 'background');

    //Box
    boxes = game.add.group();
    boxes.enableBody = true;
    boxes.physicsBodyType = Phaser.Physics.ARCADE;
    boxes.setAll('anchor.x', 0.5);
    boxes.setAll('anchor.y', 1);

    //Bullets
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);


    //Player
    player = game.add.sprite(200, game.world.height - 150, 'carplayer');
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.anchor.setTo(0.5, 0.5);
    player.animations.add('carFast', [0, 1, 2, 3], 20, true);
    player.animations.add('carSlow', [0, 1, 2, 3], 10, true);
    player.body.collideWorldBounds = true;

    //Lives
    hitCount = 3;
    lives = game.add.text(10, 10, 'Lives: ' + hitCount);
    lives.font = 'Press Start 2P';
    lives.fontSize = 20;

    //Input
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    //Explosions
    explosions = game.add.group();
    explosions.createMultiple(30, 'kaboom');

    //Particles
    emitter = game.add.emitter(0, 0, 100);
    emitter.makeParticles('particle');
    emitter.gravity = 0;

    //Score
    scoreText = game.add.text(10, 30, 'Score: ' + score);
    scoreText.font = 'Press Start 2P';
    scoreText.fontSize = 20;
}

function update() {
    updateCar();
    updateBox();
    checkCollision();
    updateBackground();
    if (fireButton.isDown) {
        fireBullet();
    }

}

function updateScore(){
    score += 1;
    this.scoreText.setText('Score: ' + score);
}

function checkCollision(){
    game.physics.arcade.collide(player, boxes, shootPlayer, null, this);
    game.physics.arcade.collide(bullets, boxes, shootEnemy, null, this);
}

function shootEnemy(box, bullet){
    bullet.kill();
    box.kill();
    var explosion = explosions.getFirstExists(false);
    explosion.animations.add('explode', [0, 1, 2, 3, 4], 10, false);
    explosion.reset(box.body.x, box.body.y-20);
    explosion.play('explode', 30, false, true);
    particleBurstBox(box);
    updateScore();
}

function updateBackground(){
    background.tilePosition.y += speed/10;
}

function getRandomInboundWidth(){
    return Math.floor(Math.random() * (590 - 130 + 1)) + 130;
}

function particleBurstPlayer() {
    emitter.x = player.x;
    emitter.y = player.y;
    emitter.start(true, 500, null, 10);
}

function particleBurstBox(box) {
    emitter.x = box.x;
    emitter.y = box.y;
    emitter.start(true, 500, null, 10);
}

function updateBox(){
    if(boxCounter == 25) {
        boxes.create(getRandomInboundWidth(), 0, 'box');
        boxes.setAll('body.velocity.y', speed);
        boxCounter = 0;
    }
    boxCounter += 1;
    console.log(boxCounter);
}



function shootPlayer(player, box){
    box.kill();
    var explosion = explosions.getFirstExists(false);
    explosion.animations.add('explode', [0, 1, 2, 3, 4], 10, false);
    explosion.reset(player.body.x, player.body.y-20);
    carHit = true;
    explosion.play('explode', 30, false, true);
    particleBurstPlayer();
}

function playCar(){
    if (carHit == true) {
        player.loadTexture('carred');
        hitCount -= 1;
        this.lives.setText('Lives: ' + hitCount);
        if(hitCount < 1){
          gameOver();
        }
        carHit = false;
    }else if(speed == 50){
        player.animations.play('carSlow');
    }else{
        player.animations.play('carFast');
    }
}

function fireBullet () {
    if (game.time.now > bulletTime)
    {
        bullet = bullets.create(player.x, player.y, 'bullet');
        if (bullet)
        {
            bullet.reset(player.x, player.y + 8);
            bullet.body.velocity.y = -400;
            bulletTime = game.time.now + 200;
        }
    }
}

function gameOver(){
    player.kill();
    stateText = game.add.text(game.world.centerX, game.world.centerY, "Game Over\n Click to Restart");
    stateText.font = 'Press Start 2P';
    stateText.anchor.setTo(0.5);
    stateText.fontSize = 30;
    stateText.fill = '#FF0000';
    stateText.setShadow(-5, 5, 'rgba(0,0,0,0.3)', 0);
    game.input.onTap.addOnce(restart,this);
}

function updateCarSpeed(){
    if(player.position.x <= 140 || player.position.x >= 620){
        speed=50;
        playCar();
        grassTime+=1;
        showGrassError();
    }else{
        speed=150;
        playCar();
        grassTime=0;
    }
}

function restart () {
    carHit = false;
    hitCount = 3;
    this.lives.setText('Lives: ' + hitCount);
    boxes.removeAll();
    bullets.removeAll();
    player.revive();
    score = 0;
    this.scoreText.setText('Score: ' + score);
    stateText.visible = false;
}

function showGrassError(){
    if(grassTime == 50) {
        showGrassAlert();
        setTimeout("hideAlert()", 250)
        grassTime=0;
    }
}

function showGrassAlert(){
    grassAlert = game.add.text(game.world.centerX, game.world.centerY, "Get off\n the grass!");
    grassAlert.anchor.setTo(0.5);
    grassAlert.font = 'Press Start 2P';
    grassAlert.fontSize = 30;
    grassAlert.fill = '#FF0000';
    grassAlert.setShadow(-5, 5, 'rgba(0,0,0,0.3)', 0);
}

function hideAlert(){
    game.world.remove(grassAlert);
}

function shootBullet(){

}

function updateCar(){
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;
    updateCarSpeed();

    if (cursors.left.isDown)
    {
        player.body.velocity.x = -speed;
    }
    else if(cursors.right.isDown)
    {
        player.body.velocity.x = speed;
    }
    else if(cursors.up.isDown)
    {
        player.body.velocity.y = -speed;
    }
    else if(cursors.down.isDown)
    {
        player.body.velocity.y = speed;
    }
    else
    {
        player.body.velocity.x = 0;
        player.body.velocity.y = 0;
    }
}
