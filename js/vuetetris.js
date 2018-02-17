var vm=new Vue({

	el:'#container',
	
	data:{
		COLS:12,//宽度
		ROWS:18,//高度
		speed:500,//下落速度，单位毫秒
		gameState:'END',//游戏状态	PAUSE,END,GOING
		dieRows:0,//累计消除行数
		activeCells:[],//活动方块
		nextActiveCells:[],//下一个活动方块
		background:[]//背景格子
	},
	
	computed:{
		getGameState:function(){
			if(this.gameState=='GOING'){
				return '进行';
			}
			if(this.gameState=='PAUSE'){
				return '暂停';
			}
			if(this.gameState=='END'){
				return '结束';
			}
		}
	},
	
	methods:{
		
		//初始化，
		init:function(){
			for(var y=0;y<this.ROWS;y++){
				var row=[];
				for(var x=0;x<this.COLS;x++){
					row.push({
						active:false,		//活动方块
						background:false	//背景格子
					});
				}
				this.background.push(row);
			}
		},
		
		changeGameState:function(gameState){
			this.gameState=gameState;
		},
		
		//重新开始
		restart:function(){
			this.background=[];
			this.init();
			this.dieRows=0;
			this.renewActiveCells();			
			this.drawActiveCells();
			this.changeGameState('GOING');
		},
		
		pause:function(){
			if(this.gameState=='PAUSE'){
				this.changeGameState('GOING');
			}else if(this.gameState=='GOING'){
				this.changeGameState('PAUSE');
			}		
		},
		
		//背景格子显示
		getCellClass:function(cell){
			return {
				'active':cell.active, 
				'default':!cell.active&&!cell.background,
				'background':cell.background
			};
		},
		
		//预览下个方块
		getNextActiveClass:function(x,y){
			var active=false;
			if(this.nextActiveCells){
				for(var i=0;i<this.nextActiveCells.length;i++){
					if(this.nextActiveCells[i].x==x-1 && this.nextActiveCells[i].y==y-1){
						active=true;
						break;
					}
				}
			}
			return {
				'active':active,
				'default':!active
			};
		},
			
		//活动方块转为背景格子
		activeCells2Backgroud:function(){
			if(this.activeCells.length>0){
				var cell;
				for(var i=0;i<this.activeCells.length;i++){
					cell=this.activeCells[i];
					this.background[cell.y][cell.x].background=true;
				}
			}
			this.activeCells=[];
		},
		
		//重新生成下个方块
		renewNextActiveCells:function(){
			
			//随机取数
			var random=Math.floor(Math.random()*7+1);
			
			var cells=[];
			switch(random){
				/* 
					■ ■ ■ 
					■
				*/				
				case 1://L型
					cells=[
						{x:0,y:0},
						{x:1,y:0},
						{x:2,y:0},
						{x:0,y:1}
					];
				break;
				/* 
					■  
					■ ■ ■ 
				*/
				case 2://反L型
					cells=[
						{x:0,y:1},
						{x:0,y:0},
						{x:2,y:1},
						{x:1,y:1}
					];
				break;
				/* 
					■  
					■ ■
					■
				*/
				case 3://丁字型
					cells=[
						{x:0,y:1},
						{x:0,y:0},
						{x:1,y:1},
						{x:0,y:2}
					];
				break;
				/* 
					■
					■ ■
					  ■
				*/
				case 4:
					cells=[
						{x:0,y:1},
						{x:0,y:0},
						{x:1,y:1},
						{x:1,y:2}
					];
				break;
				/* 
					  ■
					■ ■
					■
				*/
				case 5:
					cells=[
						{x:0,y:1},
						{x:1,y:0},
						{x:1,y:1},
						{x:0,y:2}
					];
				break;
				/* 
					■ ■ ■ ■
				*/
				case 6:
					cells=[
						{x:1,y:0},
						{x:0,y:0},
						{x:2,y:0},
						{x:3,y:0}
					];
				break;
				/* 
					■ ■ 
					■ ■
				*/
				case 7://田字型
					cells=[
						{x:0,y:0},
						{x:1,y:0},
						{x:0,y:1},
						{x:1,y:1}
					];
				break;
				default:
				break;
			}
			cells.type=random;
			this.nextActiveCells=cells;
		},
		
		//生成新的方块	
		renewActiveCells:function(){
			//下个方块还未生成，先生成一个
			if(this.nextActiveCells==null||this.nextActiveCells.length==0){
				this.renewNextActiveCells();
			}
			
			//下个方块重复为当前方块
			this.activeCells=[];
			for(var i=0;i<this.nextActiveCells.length;i++){
				this.activeCells.push({
					x:this.nextActiveCells[i].x,
					y:this.nextActiveCells[i].y
				});
			}
			this.activeCells.type=this.nextActiveCells.type;
			
			//移动当前方块到合适位置
			for(var i=0;i<this.COLS/2-1;i++){
				this.rightShift(this.activeCells);
			}
			//生成下个方块
			this.renewNextActiveCells();
			
			//判断是否结束
			if(this.canShift('NONE')==false){
				this.changeGameState('END');
			}
		},
		
		//绘制活动方块
		drawActiveCells:function(){
			var cell;
			for(var i=0;i<this.activeCells.length;i++){
				cell=this.activeCells[i];
				this.background[cell.y][cell.x].active=true;
			}
		},
		
		//移除活动方块
		removeActiveCells:function(){
			var cell;
			for(var i=0;i<this.activeCells.length;i++){
				cell=this.activeCells[i];
				this.background[cell.y][cell.x].active=false;
			}
		},
		
		//左移
		leftShift:function(cells){
			for(var i=0;i<cells.length;i++){
				cells[i].x--;
			}
		},
		
		//右移
		rightShift:function(cells){
			for(var i=0;i<cells.length;i++){
				cells[i].x++;
			}
		},
		
		//下落
		fall:function(cells){
			for(var i=0;i<cells.length;i++){
				cells[i].y++;
			}
		},
		
		//翻转
		flip:function(cells){
			//田字型不翻转
			if(cells.type==7){
				return;
			}
			var center=cells[0];//中心格子
			
			//翻转算法
			for(var i=1;i<cells.length;i++){
				var srcX=cells[i].x;
				var srcY=cells[i].y;
				cells[i].x=center.x+center.y-srcY;
				cells[i].y=center.y-center.x+srcX;
			}
			
			//让翻转更灵活
			var adjustX=0;//调整Ｘ坐标
			for(var i=0;i<cells.length;i++){
				if(cells[i].x<0 && cells[i].x<adjustX){
					adjustX=cells[i].x;
				}
				if(cells[i].x>this.COLS-1 && cells[i].x-this.COLS+1>adjustX){
					adjustX=cells[i].x-this.COLS+1;
				}
			}
			for(var i=0;i<cells.length;i++){
				cells[i].x=cells[i].x-adjustX;
			}
		},
		
		//操作
		shift:function(type){
			//游戏非进行状态，禁止操作
			if(this.gameState!='GOING'){
				return;
			}
			//试算不能操作
			if(!this.canShift(type)){
				if(type=='FALL'){
					this.removeActiveCells();		//移除活动方块
					this.activeCells2Backgroud();	//活动方块变成背景
					this.dieLine();					//消行
					this.renewActiveCells();		//生成新的活动方块
					this.drawActiveCells();			//显示新的活动方块
				}
				return;
			}
			
			this.removeActiveCells();//移除活动方块
			switch(type){
				case 'LEFT':
					this.leftShift(this.activeCells);
				break;
				case 'RIGHT':
					this.rightShift(this.activeCells);
				break;
				case 'FLIP':
					this.flip(this.activeCells);
				break;
				case 'FALL':
					this.fall(this.activeCells);
				break;
				case 'FALL_TO_END':
					while(this.canShift('FALL')){
						this.fall(this.activeCells);
					}
					this.activeCells2Backgroud();	//活动方块变成背景
					this.dieLine();					//消行
					this.renewActiveCells();		//生成新的活动方块
				break;
				default:
				break;
			}
			this.drawActiveCells();//显示新的活动方块
		},
		
		//试算能否移动
		canShift:function(type){
			var canShiftFlag=true;
			var cells=[];
			
			//复制一份
			for(var i=0;i<this.activeCells.length;i++){
				var cell={
					x:this.activeCells[i].x,
					y:this.activeCells[i].y
				};
				cells.push(cell);
			}
			
			//对副本进行试算
			switch(type){
				case 'LEFT':
					this.leftShift(cells);
				break;
				case 'RIGHT':
					this.rightShift(cells);
				break;
				case 'FLIP':
					this.flip(cells);
				break;
				case 'FALL':
					this.fall(cells);
				break;
				case 'FALL_TO_END':
					//do nothing
				break;
				case 'NONE':
					//do nothing
				break;
				default:
					//do nothing
				break;
			}		
			canShiftFlag=this.judgeCanShift(cells);
			return canShiftFlag;
		},
		
		//判断是否可操作
		judgeCanShift:function(cells){
			var canShiftFlag=true;
			for(var i=0;i<cells.length;i++){
				var cell=cells[i];
				//是否超边界
				if(cell.x<0||cell.y<0||cell.x>=this.COLS||cell.y>=this.ROWS){
					canShiftFlag = false;
					break;
				}
				//是否位置已被占
				if(this.background[cell.y][cell.x].background==true){
					canShiftFlag = false;
					break
				}
			}
			return canShiftFlag;
		},
		
		//消行
		dieLine:function(){
			for(var y=this.ROWS-1;y>=0;y--){
				this.dieOneLine(y);
			}
		},
		
		//消除指定行，并使上面行下落，如果下落行也可消除，则继续消除
		dieOneLine:function(rowNum){
			var dieFlag=true;
			//判断该行是否需要消除
			for(var x=this.COLS-1;x>=0;x--){
				if(this.background[rowNum][x].background==false){
					dieFlag=false;
					break;
				}
			}
			//消行
			if(dieFlag==true){
				this.dieRows++;//记分
				for(var i=rowNum;i>=0;i--){
					for(var x=0;x<this.COLS;x++){
						if(i==0){
							this.background[i][x].background=false;
						}else{
							this.background[i][x].background=this.background[i-1][x].background;
						}
					}	
				}
				//递归，再消一次，直到当前行不能消除
				this.dieOneLine(rowNum);
			}
		}
	},
	
	created:function(){
		this.init();
		//this.drawActiveCells();//显示新的活动方块
	}
});

$("body").on("keydown",function(e){
	//console.log(e.which);
	switch(e.which){
		case 13://ENTER
			//vm.restart();
		break;
		case 32://space
			vm.shift('FALL_TO_END');
		break;
		case 37://left
			vm.shift('LEFT');
		break;
		case 38://up
			vm.shift('FLIP');
		break;
		case 39://right
			vm.shift('RIGHT');
		break;
		case 40://down
			vm.shift('FALL');
		break;
		case 82://R
			vm.restart();
		break;
		case 80://P
			vm.pause();
		break;
	}
});

//自动下落
setInterval(function(){
	vm.shift('FALL');
},vm.speed);

