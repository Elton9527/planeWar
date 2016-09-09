/*******全局变量*******/
var canvasWidth=480;//画布的宽
var canvasHeight=650;//画布的高

var canvas=document.getElementById('canvas');
canvas.width=canvasWidth;
canvas.height=canvasHeight;
var ctx=canvas.getContext('2d');//画笔对象

const PHASE_DOWNLOAD= 1; //图片下载阶段
const PHASE_READY= 2;    //就绪阶段
const PHASE_LOADING= 3;  //图片加载阶段
const PHASE_PLAY= 4;     //开始运行阶段
const PHASE_PAUSE= 5;    //暂停阶段
const PHASE_GAMEOVER=6;  //游戏结束阶段


//所有的图片变量
var imgBackground;
var imgBullet1;
var imgsEnemy1=[];//小号敌机的所有图片
var imgsEnemy2=[];//中号敌机的所有图片
var imgsEnemy3=[];//大号敌机的所有图片
var imgsGameLoading=[];//游戏加载中
var imgGamePauseNor;//游戏暂停
var imgsHero=[];//英雄所有的图片
var imgStart;//游戏开始
var heroCount=3;//剩余可用英雄的数量
var heroScore=0;//英雄的得分
var curPhase=PHASE_DOWNLOAD;//当前所处阶段
var sounds=[];//游戏的所有声音

/***********阶段1：下载图片******************/
downLoad(); 
function downLoad(){
	   //下载进度 共33张图片，每张的进入权重为3，背景图的权重为4
	   var progress=0;
	   function drawProgress(){
		  ctx.clearRect(0,0,canvasWidth,canvasHeight)//清除缓存
          //画数字
          ctx.fillStyle='#fff';
	      ctx.strokeStyle="#ddd";
	      ctx.font='18px Microsoft yahei';
		  var txt="亲，请稍等^_^努力加载中..."+progress+'%';
		  var w=ctx.measureText(txt).width;
		  
		  ctx.fillText(txt,canvasWidth/2-w/2,canvasHeight/2+40);
		  ctx.strokeText(txt,canvasWidth/2-w/2,canvasHeight/2+40);
		  if(progress>=100){//所有图片加载完成
			startGame();
		  }
	   }
	   //背景图
	   imgBackground=new Image();
	   imgBackground.src='img/background.png';
	   imgBackground.onload=function(){
		  progress+=4;
		  drawProgress();
	   }   
	   //子弹
	   imgBullet1=new Image();
	   imgBullet1.src='img/bullet1.png';
	   imgBullet1.onload=function(){
		  progress+=3;
		  drawProgress();
	   }
	   //小号敌机加载 
	   for(var i=0;i<5;i++){
	        imgsEnemy1[i]=new Image(); 
		    imgsEnemy1[i].src="img/enemy1_down"+i+".png";
	         imgsEnemy1[i].onload=function(){
		              progress+=3;
		             drawProgress();
	         }
	    }
	   //中号敌机加载
	   for(var i=0;i<5;i++){
	        imgsEnemy2[i]=new Image(); 
		    imgsEnemy2[i].src="img/enemy2_down"+i+".png";
            imgsEnemy2[i].onload=function(){
		              progress+=3;
		             drawProgress();
	         }
	    }
	   //大号敌机图片
	   imgsEnemy3[0]=new Image();
	   imgsEnemy3[0].src="img/enemy3_n1.png";
	   imgsEnemy3[0].onload=function(){
		 progress+=3;
		 drawProgress();
	   }
	   imgsEnemy3[1]=new Image();
	   imgsEnemy3[1].src="img/enemy3_n2.png";
	   imgsEnemy3[1].onload=function(){
		 progress+=3;
		 drawProgress();
	   }
       //大号敌机炸毁图片
	   for(var i=2;i<9;i++){
	        imgsEnemy3[i]=new Image(); 
		    imgsEnemy3[i].src="img/enemy3_down"+(i-2)+".png";
            imgsEnemy3[i].onload=function(){
		              progress+=3;
		             drawProgress();
	         }
	    }
	   //游戏加载中
        for(var i=0;i<4;i++){
	        imgsGameLoading[i]=new Image(); 
		    imgsGameLoading[i].src="img/game_loading"+(i+1)+".png";
             imgsGameLoading[i].onload=function(){
		              progress+=3;
		             drawProgress();
	         }
	    }
	   //游戏暂停
	   imgGamePauseNor=new Image();
	   imgGamePauseNor.src="img/game_pause_nor.png";
	   imgGamePauseNor.onload=function(){
		  progress+=3;
		  drawProgress();
	   }
	   //英雄图片
       for(var i=0;i<2;i++){
	          imgsHero[i]=new Image();
	          imgsHero[i].src="img/hero"+(i+1)+".png";
	          imgsHero[i].onload=function(){
		            progress+=3;
		            drawProgress();
	            }
	   }	  
	   //英雄炸毁图片加载
	   for(var i=2;i<6;i++){
	        imgsHero[2]=new Image();
	        imgsHero[2].src="img/hero_blowup_n"+(i-1)+".png";
	        imgsHero[2].onload=function(){
		         progress+=3;
		         drawProgress();
	        }
	   }
	   //声音加载
       sounds[0]=new Audio();
	   sounds[0].src="sounds/game_music.mp3";
       progress+=1;
	   drawProgress();

	   sounds[1]=new Audio();
	   sounds[1].src="sounds/game_over.mp3";
       progress+=1;
	   drawProgress();
	   

//	   sounds[0].onload=function(){
//	         progress+=2;
//		     drawProgress();
//	   }

	   //游戏开始
	    imgStart=new Image();
	    imgStart.src="img/start.png";
	    imgStart.onload=function(){
		   progress+=1;
		  drawProgress();
	   }  
}

/***********阶段2：就绪******************/
var sky;//天空对象
var logo;//游戏的logo对象
var audio;//声音playAudio的对象
function startGame(){
   curPhase=PHASE_READY; 
   sky=new Sky(imgBackground);//实例化天空对象
   logo=new Logo(imgStart);//实例化logo对象
   audio=new  playAudio(sounds);//实例化playAudio对象
  
   startEngine();//启动整个游戏的主引擎--定时器

   //当用户点击画布后，进入下一个阶段
   canvas.onclick=function(){
       if(curPhase===PHASE_READY){
	      curPhase=PHASE_LOADING;//当所有图片加载完成后，就进入加载阶段
		  loading=new Loading(imgsGameLoading);
	   }
   }
}
//天空的构造函数-使用两张图片轮换
function Sky(img){
   this.x1=0;//初始时第一张背景图的坐标
   this.y1=0;
   this.x2=0;//初始时第二张背景图的坐标
   this.y2=-img.height;
   this.draw=function(){//绘制天空对象
      ctx.drawImage(img,this.x1,this.y1);
      ctx.drawImage(img,this.x2,this.y2);   
   }
   this.move=function(){//移动天空对象
      this.y1++;//图片坐标下移
	  this.y2++;
	  if(this.y1>=canvas.height){//第一张背景图片移出画布了
	     this.y1=this.y2-img.height;
	  }
	  if(this.y2>=canvas.height){
	     this.y2=this.y1-img.height;
	  }
   }
}
//游戏的主logo
function Logo(img){
   this.x=canvasWidth/2-img.width/2;
   this.y=canvasHeight/2-img.height/2;
   this.draw=function(){
      ctx.drawImage(img,this.x,this.y);
   }
} 

var audio;
//游戏背景音乐
function playAudio(sounds){
    this.soundState="game";//游戏声音
	//console.log( this.soundState);
	//播放声音
	this.playSound=function(){
       if(this.soundState==="game"){
               //sounds[0].autoplay='autoplay';
	           sounds[0].loop='loop';
	           sounds[0].play();
			   return;
	   }else if(this.soundState==="over"){
	            sounds[1].autoplay='autoplay';
	            sounds[1].play(); 
				sounds[1].pause();
	           return;
	   }
	}
	 
}


/***********阶段3：加载中******************/
//var loading=new Loading(imgsGameLoading);
var loading;
function Loading(imgs){
   this.x=0;
   this.y=canvas.height-imgs[0].height;
   this.index=0;//当前绘制的是数组中哪张图片.
   this.draw=function(){
	 //console.log("aa");
	 //console.log('index:%d x:%d y:%d',this.index,this.x,this.y);
	 //console.log('imgs[0].height:',imgs[0].height);
     ctx.drawImage(imgs[this.index],this.x,this.y);
   }
   this.counter=0;//记录move函数的调用次数
   this.move=function(){
	 this.counter++;
	 if(this.counter%5===0){
	    this.index++;//图片的下标递增，绘制下一张图片	
	 }
	 if(this.index>=imgs.length){
	    curPhase=PHASE_PLAY;//所有图片播放完成，则开始游戏
        hero=new Hero(imgsHero);//进入游戏，可以创建我方飞机对象
	    bulletList=new BulletList();//创建子弹对象
        enemyList=new EnemyList();//创建敌机列表
	 }
   }
}
/***********阶段4：游戏进行中******************/
var hero;//不能new
function Hero(imgs){
   this.x=canvasWidth/2- imgs[0].width/2;
   this.y=canvasHeight-imgs[0].height/2;
   this.index=0;//待绘制的是数组中的哪个图片
   this.counter=0;
   this.width=imgs[0].width;
   this.height=imgs[0].height;
   this.crashed=false;
  
   this.draw=function(){ //绘制每一个飞机
      ctx.drawImage(imgs[this.index],this.x,this.y);  
   }
   this.move=function(){//移动飞机
	   this.counter++;
	   if(this.counter%3===0){
		    if(!this.crashed){//未开始撞毁程序
			   if(this.index===0){
				   this.index=1;
			   }else if(this.index===1){
				   this.index=0;
			   }
			}else{//开始撞毁程序 2 3 4
			   if(this.index===0 || this.index===1){
			       this.index=2;
			   }else if(this.index<imgs.length-1){
			       this.index++;
			   }else{//撞毁程序结束 血格-1 创建新英雄
					heroCount--;
				   if(heroCount>0){
			           hero=new Hero(imgsHero);//还有英雄可用
				   }else{
				       curPhase=PHASE_GAMEOVER;//英雄已全部阵亡
                       audio=new  playAudio(sounds);//实例化playAudio对象
					   audio.soundState="over";
					  
					   console.log("ff");
					   audio.playSound();
					   drawGameOver();
				   }
			   }  
			}	
	    }
		//边移动边发射子弹
		if(this.counter%4===0){//此处10指定每两发子弹的间隔，值越小，则发送的越快
		    this.fire();
		}  
   }
   //发射子弹 
   this.fire=function(){
      var b0=new Bullet(imgBullet1);
	  bulletList.add(b0); 
	}
}
//当鼠标在画布上移动时，修改我方英雄的位置
canvas.onmousemove=function(event){
   if(curPhase===PHASE_PLAY){
       var x=event.offsetX;//相对于画布左上角的偏移量
       var y=event.offsetY;
	   //hero.x=x-imgsHero[0].width/2;
	   //hero.y=y-imgsHero[0].height/2;
       var  maxX=canvasWidth-imgsHero[0].width;
	   var  maxY=canvasHeight-imgsHero[0].height;
	   var tempX=x-imgsHero[0].width/2;
	   var tempY=y-imgsHero[0].height/2;
	   if(tempX>=0&&tempX<=maxX ){
	        hero.x=tempX;
	   }
       if(tempY>=0 && tempY<=maxY){
	        hero.y=tempY;
        }
	  
	  
   }
}
//子弹对象
function Bullet(img){
	//子弹的初始位置
    this.x=hero.x + (imgsHero[0].width/2-img.width/2);
	this.y=hero.y-img.height;
	this.removeable=false;//判断子弹是否可以删除
    
	this.width=img.width;
	this.height=img.height;

    this.draw=function(){
	   ctx.drawImage(img,this.x,this.y);
	}
	this.move=function(){
	   this.y-=25;//此处的5指定子弹移动的速度，可以设置为全局变量
	   //若子弹飞出画布上边界，或打中敌机，子弹需要消失的
       if(this.y<= -img.height){
	       this.removeable=true;
	   }
	}
}
//子弹列表对象，其中保存着当前的所有子弹
var bulletList;
function BulletList(){
    this.arr=[];//画布上所有的子弹
    this.add=function(bullet){
	   this.arr.push(bullet);//往数组中添加子弹       
	}
	this.remove=function(i){//删除子弹
	   this.arr.splice(i,1);
	}
	this.draw=function(){//绘制每一个子弹
	   for(var i  in this.arr){
	      this.arr[i].draw();
		  //console.log("画第%d个子弹",i);
	   }
	}
	this.move=function(){//移动每一个子弹,如果子弹可以删除，那就确定可以删除了
	   for(var i in this.arr){
	      this.arr[i].move();
		  if(this.arr[i].removeable){
		     this.remove(i)
		  }
	   }
	}
}
//小号敌机
function Enemy1(imgs){	
	this.width=imgs[0].width;
	this.height=imgs[0].height;

	this.x = Math.random()*(canvasWidth-imgs[0].width);
	this.y = -imgs[0].height;
	this.index = 0; //当前绘制的图片在数组中的下标
	this.speed = 6;  //小敌机每42ms移动的距离——即飞行速度
	this.removeable = false; //可以删除了吗
	this.blood = 2;  //小敌机只有1格血
	this.crashed=false;//是否被撞毁
    this.counter=0;

	this.draw = function(){
		ctx.drawImage(imgs[this.index],this.x,this.y);
	}
	this.move = function(){
	    this.counter++;
		this.y+=this.speed;
		this.checkHit();//做碰撞检查
		if(this.crashed && this.counter%3===0){
		   if(this.index===0) this.index=1;
		   else if(this.index < imgs.length-1) this.index++;
		   else {
			  this.removeable=true;
			  heroScore+=15;
		   }
		}
		//若飞出下边界或炸毁了，则可以删除了
		if(this.y>=canvasHeight){ //飞出下边界
			this.removeable = true;
		}
	}
	/*满足碰撞的4个条件
	   obj1.x+obj.width>=obj2.x
	   obj2.x+obj2.width>=obj1.x
	   obj1.y+obj1.height>=obj2.y
	   obj2.y+obj2.height>=obj1.y
	**************/
	//碰撞检测
	this.checkHit=function(){
	   //每个敌机必须和我方的每个子弹/英雄做碰撞检测
	   for(var i in bulletList.arr){
	      var b=bulletList.arr[i];
	      if( (this.x+this.width>=b.x) && (b.x+b.width>=this.x) && (this.y+this.height>=b.y) && (b.y+b.height>=this.y) ){
		     //碰撞成功自己的血减一  子弹消失
			 //console.log("碰撞上了");
			 this.blood--;
			 if(this.blood <= 0){//没有血格了，开启撞毁程序
			    this.crashed=true;
			 }
			 b.removeable=true;
		  }
	   }  
	   //每个敌机必须和我方的英雄做碰撞检测
	   if((this.x+this.width>=hero.x) && (hero.x+hero.width>=this.x) && (this.y+this.height>=hero.y) && (hero.y+hero.height>=this.y)){
	      hero.crashed=true; //我方英雄开始撞毁程序
	   }
	}
}
//中号敌机
function Enemy2(imgs){
	this.x = Math.random()*(canvasWidth-imgs[0].width);
	this.y = -imgs[0].height;

	this.width=imgs[0].width;
	this.height=imgs[0].height;

	this.index = 0; //当前绘制的图片在数组中的下标
	this.speed = 4;  //中号敌机每42ms移动的距离——即飞行速度
	this.removeable = false; //可以删除了吗
	this.blood = 8;  //中号敌机有3格血
	this.counter=0;
    this.crashed=false;//是否被撞毁
	this.draw = function(){
		ctx.drawImage(imgs[this.index],this.x,this.y);
	}
	this.move = function(){
	    this.counter++;
		this.y+=this.speed;
		this.checkHit();//做碰撞检查
		if(this.crashed && this.counter%3===0){
		   if(this.index===0) this.index=1;
		   else if(this.index < imgs.length-1) this.index++;
		   else {
			   this.removeable=true;
			   heroScore+=30;   
		   }
		}
		//若飞出下边界或炸毁了，则可以删除了
		if(this.y>=canvasHeight){ //飞出下边界
			this.removeable = true;
		}
	}
	this.checkHit=function(){
	   //每个敌机必须和我方的每个子弹/英雄做碰撞检测
	   for(var i in bulletList.arr){
	      var b=bulletList.arr[i];
	      if( (this.x+this.width>=b.x) && (b.x+b.width>=this.x) && (this.y+this.height>=b.y) && (b.y+b.height>=this.y) ){
		     //碰撞成功自己的血减一  子弹消失
			 this.blood--;
			 if(this.blood <= 0){//没有血格了，开启撞毁程序
			    this.crashed=true;
			 }
			 b.removeable=true;
		  }
	   } 
	   //每个敌机必须和我方的英雄做碰撞检测
	   if((this.x+this.width>=hero.x) && (hero.x+hero.width>=this.x) && (this.y+this.height>=hero.y) && (hero.y+hero.height>=this.y)){
	      hero.crashed=true; //我方英雄开始撞毁程序
	   }
	}
}
//大号敌机
function Enemy3(imgs){
	this.x = Math.random()*(canvasWidth-imgs[0].width);
	this.y = -imgs[0].height;
	this.width=imgs[0].width;
	this.height=imgs[0].height;

	this.index = 0; //当前绘制的图片在数组中的下标
	this.speed = 2;  //大号敌机每42ms移动的距离——即飞行速度
	this.removeable = false; //可以删除了吗
	this.blood = 15;  //大敌机有7格血
	this.crashed=false;//是否被撞毁

	this.draw = function(){
		ctx.drawImage(imgs[this.index],this.x,this.y);
	}
	this.counter = 0; //move()函数被调用的次数
	this.move = function(){
		this.counter++;
		this.y+=this.speed;
		this.checkHit();//碰撞检验
		if(this.counter%2===0){

			if(!this.crashed){
			   if(this.index===0)this.index=1;
			   else if(this.index===1)this.index=0;
		    }else{//开始撞毁程序
			   if(this.index===0||this.index===1) this.index=3;
			   else if(this.index<imgs.length-1) this.index++;
			   else {
				   this.removeable=true;
			       heroScore += 50;
				}
			}
		
		}
		
		//若飞出下边界或炸毁了，则可以删除了
		if(this.y>=canvasHeight){ //飞出下边界
			this.removeable = true;
		}
	}
	this.checkHit=function(){
	   //每个敌机必须和我方的每个子弹/英雄做碰撞检测
	   for(var i in bulletList.arr){
	      var b=bulletList.arr[i];
	      if( (this.x+this.width>=b.x) && (b.x+b.width>=this.x) && (this.y+this.height>=b.y) && (b.y+b.height>=this.y) ){
		     //碰撞成功自己的血减一  子弹消失
			 this.blood--;
			 if(this.blood <= 0){//没有血格了，开启撞毁程序
			    this.crashed=true;
			 }
			 b.removeable=true;
		  }
	   } 
	   //每个敌机必须和我方的英雄做碰撞检测
	   if((this.x+this.width>=hero.x) && (hero.x+hero.width>=this.x) && (this.y+this.height>=hero.y) && (hero.y+hero.height>=this.y)){
	      hero.crashed=true; //我方英雄开始撞毁程序
	   }
	}
}
//所有敌机组成的列表
var enemyList;
function EnemyList(){
	this.arr = []; //保存所有的敌机
	this.add = function(enemy){ //增加新敌机
		this.arr.push(enemy);
		//console.log(this.arr);
	}
	this.remove = function(i){ //删除指定的敌机
		this.arr.splice(i,1);
	}
	this.draw = function(){  //绘制所有的敌机
		for(var i in this.arr){
			//console.log("i的值"+i);
			this.arr[i].draw();
		}
	}
	this.move = function(){  //让所有的敌机移动
		this.generate(); //生成新的敌机
		for(var i in this.arr){
			var e = this.arr[i];
			e.move();
			if(e.removeable){
				this.remove(i);
			}
		}
	}
	//随机生成一个敌机
	this.generate = function(){
		/*敌机生成的要求：
		*何时生成敌机是随机的，不是定时或者连续的
		*小号敌机的概率最大，中号其次，大号最少
		*思路：0~199随机数  小号0/1/2/3/4/5  中号6/7/8  大号9  其它值不生成敌机
		*进一步扩展：可以将6/9/10设置为变量，以增加游戏难度
		*/
		var num = Math.floor( Math.random()*200 );
		if(num<6){
			this.add( new Enemy1(imgsEnemy1) );
		}else if(num<9){
			this.add( new Enemy2(imgsEnemy2) );
		}else if(num<10){
			this.add( new Enemy3(imgsEnemy3) );
		}
	}
}

//绘制当前得分和剩余英雄数量
function drawStat(){
   ctx.font="20px Helvetica";
   ctx.fillStyle='#E6C753';

   //绘制当前的游戏得分
   var score='SCORE:'+heroScore;
   ctx.fillText(score,10,35);
   //绘制剩余的英雄数量
   var heros='HEROS:'+heroCount;
   var w=ctx.measureText(heros).width;
   ctx.fillText(heros,canvasWidth-w-10,35);
}
/***********阶段5：暂停******************/
canvas.onmouseout=function(){
  if(curPhase===PHASE_PLAY){//鼠标移出画布
     curPhase=PHASE_PAUSE;
  }
}
canvas.onmouseover=function(){
  if(curPhase===PHASE_PAUSE){//鼠标移出画布
     curPhase=PHASE_PLAY;
  }

}
function drawPause(){//绘制暂停图标
   var x=canvasWidth/2-imgGamePauseNor.width/2;
   var y=canvasHeight/2-imgGamePauseNor.height/2;
   ctx.drawImage(imgGamePauseNor,x,y);
}
/***********阶段6：结束阶段******************/
function drawGameOver(){
    ctx.font = '50px Helvetica';
	ctx.fillStyle = '#ccc';
	ctx.strokeStyle = '#333';
	var txt = 'GAME OVER';
	var w = ctx.measureText(txt).width;
	var x = canvasWidth/2 - w/2;
	var y = canvasHeight/2 + 50/2;
	ctx.fillText(txt, x, y);
	ctx.strokeText(txt, x, y);
}
/*************游戏的主引擎-主定时器**********************/
function startEngine(){
   setInterval(function(){
     sky.draw();
	 sky.move();
	 switch(curPhase){
	   case PHASE_READY:
	        logo.draw();
	        audio.playSound();
	        break;
	   case PHASE_LOADING:
		    loading.draw();
		    loading.move();
			break;
	   case PHASE_PLAY:
		    hero.draw();
	        hero.move();
			bulletList.draw();
			bulletList.move();
			enemyList.draw();
			enemyList.move();
			drawStat();
		    break;
	   case PHASE_PAUSE:
		    hero.draw();
	        bulletList.draw();
			enemyList.draw();
			drawStat();
			drawPause();
		    break;
	   case PHASE_GAMEOVER:
		    audio.playSound();
		    drawGameOver();
		    break; 
	 }
   },42);//每一秒动24次
}