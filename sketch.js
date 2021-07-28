var DREAM = 1;
var END = 0;
var PLAY = 2;
var CUTSCENE1 = 3;
var gameState = DREAM;

var trex, trex_running, trex_collided;

var monster, monsterImg; 
var ground, invisibleGround, groundImage;

var knife, knifeImg, knifeGroup;

var platformGroup;

var invisiblePlatform; 

var cloudsGroup, cloudImage;
var obstaclesGroup, obstacle, obstacle1, obstacle2, obstacle3;

var score;
var gameOverImg,restartImg
var jumpSound , checkPointSound, dieSound, runningSound;

var rain, backgroundImg;

function preload(){
  trex_running = loadAnimation("trex1.png","trex3.png","trex4.png");
  trex_collided = loadAnimation("trex_collided.png");
  
  groundImage = loadImage("ground2.png");
  
  cloudImage = loadImage("cloud.png");

  knifeImg = loadImage("knifechan.png");

  monsterImg = loadImage("mon.png");
  
  restartImg = loadImage("restart.png")
  gameOverImg = loadImage("gameOver.png")
  
  jumpSound = loadSound("jump.mp3")
  dieSound = loadSound("die.mp3")
  checkPointSound = loadSound("checkPoint.mp3")

  backgroundImg = loadImage("theBG.png");

  runningSound = loadSound("running.mp3");
}

function setup() {
  createCanvas(600, 200);

  var message = "This is a message";
 console.log(message)

  rain = createSprite(300,100,0,0);
  rain.addImage(backgroundImg);
  rain.velocityX = -3;
  
  trex = createSprite(160,160,20,50);
  trex.addAnimation("running", trex_running);
  trex.addAnimation("collided", trex_collided);

  trex.scale = 0.5;

  monster = createSprite(40,160,20,50);
  monster.addImage("monster" , monsterImg);
  monster.scale = 0.2;
  
  ground = createSprite(200,180,400,20);
  ground.addImage("ground",groundImage);
  ground.x = ground.width /2;
  
  gameOver = createSprite(300,100);
  gameOver.addImage(gameOverImg);
  
  restart = createSprite(300,140);
  restart.addImage(restartImg);
 
  gameOver.scale = 0.5;
  restart.scale = 0.5;
  
  invisibleGround = createSprite(200,190,400,10);
  invisibleGround.visible = false;

  
  //create Obstacle and Cloud Groups
  obstaclesGroup = createGroup();
  cloudsGroup = createGroup();
  platformGroup = createGroup();
  knifeGroup = createGroup();

  
  trex.setCollider("rectangle",0,0,trex.width,trex.height);
  trex.debug = true

  monster.debug = true;
  monster.setCollider("rectangle",0,0,monster.width -50,monster.height-4);
  
  score = 0;
  
}

function draw() {
  
  if(score < 490){
    background(0);
  }
  //displaying score
  text("Score: "+ score, 500,50);
  
  
  if(gameState === DREAM){

    gameOver.visible = false;
    restart.visible = false;
    
    trex.changeAnimation("running",trex_running); 
    
    ground.velocityX = -(4 + 5* score/100)
    //scoring
    score = score + Math.round(getFrameRate()/60);
    
    if(score>0 && score%100 === 0){
       checkPointSound.play() 
    }
    
    if (ground.x < 0){
      ground.x = ground.width/2;
    }

    if (rain.x < 170){
      rain.x = rain.width/2;
    }
    
    //jump when the space key is pressed
    if(keyDown("space")&& trex.y >= 100) {
        trex.velocityY = -9;
        jumpSound.play();
    }

    if(trex.y >= 100){
      runningSound.play();
    }
    
    //add gravity
    trex.velocityY = trex.velocityY + 0.8
  
    //spawn the clouds
    spawnClouds();
  
    //spawn obstacles on the ground
    spawnObstacles();
    //spawnPlatform();
    spawnKnife();
    
    if(obstaclesGroup.isTouching(trex)){
        obstacle.destroy();
        jumpSound.play();
        trex.x = trex.x -35;
        dieSound.play(); 
    }

    if(knifeGroup.isTouching(trex)){
      knifeGroup.destroyEach();
      jumpSound.play();
      trex.x = trex.x -35;
      dieSound.play(); 
  }

    if(platformGroup.isTouching(trex)){
      jumpSound.play(); 
      dieSound.play();
   }

   if(monster.isTouching(trex)){
    gameState = END; 
 }
   if(score > 480){
     cutscene1();
   }

   if(gameState === CUTSCENE1){

    knifeGroup.destroyEach();
    obstaclesGroup.destroyEach();
    cloudsGroup.destroyEach();
    platformGroup.destroyEach();

    gameOver.visible = false;
    restart.visible = false;
    
    trex.changeAnimation("running",trex_running); 
    
    ground.velocityX = -(4 + 5* score/100)
    //scoring
    score = score + Math.round(getFrameRate()/60);
    trex.velocityY = trex.velocityY + 0.8;

    if (ground.x < 0){
      ground.x = ground.width/2;
    }

    if(score > 490){
      background("black");
      trex.visible = false;
      ground.visible = false;
    }

   }


  }
   else if (gameState === END) {
       background(0)
       gameOver.visible = true;
       restart.visible = true;
      if(mousePressedOver(restart)) {
      reset();
      }
     
     //change the trex animation
      trex.changeAnimation("collided", trex_collided);
    
     
     
      ground.velocityX = 0;
      trex.velocityY = 0
      
     
      //set lifetime of the game objects so that they are never destroyed
    obstaclesGroup.setLifetimeEach(-1);
    cloudsGroup.setLifetimeEach(-1);
     
     obstaclesGroup.setVelocityXEach(0);
     cloudsGroup.setVelocityXEach(0);    
   }
  
 
  //stop trex from falling down
  trex.collide(invisibleGround);
  trex.collide(platformGroup);
  


  drawSprites();
}

function reset(){
  gameState = DREAM;
  gameOver.visible = false;
  restart.visible = false;
  
  obstaclesGroup.destroyEach();
  cloudsGroup.destroyEach();
  platformGroup.destroyEach();
  knifeGroup.destroyEach();

  trex.x = 160;

  monster.x = 40;
  
  score = 0;

}


function spawnObstacles(){
 if (frameCount % 90 === 0){
   obstacle = createSprite(600,165,10,40);
   obstacle.velocityX = -(6 + score/100);

   obstacle1 = loadImage("trashu.png");
   obstacle2 = loadImage("bushchan.png");
   obstacle3 = loadImage("log.png");
   
    //generate random obstacles
    var rand = Math.round(random(1,3));
    switch(rand) {
      case 1: obstacle.addImage(obstacle1);
              break;
      case 2: obstacle.addImage(obstacle2);
              break;
      case 3: obstacle.addImage(obstacle3);
              break;
      default: break;
    }
   
    //assign scale and lifetime to the obstacle           
    obstacle.lifetime = 300;
    obstacle.scale = 0.2;

    obstacle.debug = true;
    obstacle.setCollider("rectangle", 0, 0, 50, 50);
   
   //add each obstacle to the group
    obstaclesGroup.add(obstacle);
 }
}

function spawnClouds() {
  //write code here to spawn the clouds
  if (frameCount % 60 === 0) {
    var cloud = createSprite(600,120,40,10);
    cloud.y = Math.round(random(80,120));
    cloud.addImage(cloudImage);
    cloud.scale = 0.5;
    cloud.velocityX = -3;
    
     //assign lifetime to the variable
    cloud.lifetime = 200;
    
    //adjust the depth
    cloud.depth = trex.depth;
    trex.depth = trex.depth + 1;
    
    //add each cloud to the group
    cloudsGroup.add(cloud);
  }
}

function spawnPlatform(){
  if (frameCount % 60 === 0) {
    var platform = createSprite(600, 100, 50,10);

    platform.y = Math.round(random(80,120));
    platform.velocityX = -(4 + 3* score/100);
    
     //assign lifetime to the variable
     platform.lifetime = 200;
    
    //adjust the depth
    
    //add each cloud to the group
    platformGroup.add(platform);
  }
}

function spawnKnife(){
  if(score > 350 && score < 480){
    if (frameCount % 150 === 0) {
      knife = createSprite(0, 100, 10, 2);
      knife.addImage(knifeImg);
  
      knife.y = Math.round(random(100,185));
      knife.velocityX = (2 + score/100);
      
       //assign lifetime to the variable
       knife.lifetime = 200;
      
      //adjust the depth
      
      //add each cloud to the group
      knifeGroup.add(knife);
      knife.scale = 0.15;
      knife.debug = true;
      knife.setCollider("rectangle", 0, 0, 50, 50);
    }
  }
}

function cutscene1(){
  if(score > 480){
    monster.x = monster.x -3;
    trex.x = trex.x + 3;
  }

  if(score > 485){
    knifeGroup.destroyEach();
    obstaclesGroup.destroyEach();
    cloudsGroup.destroyEach();
    platformGroup.destroyEach();
    gameState = CUTSCENE1;
   }
}

