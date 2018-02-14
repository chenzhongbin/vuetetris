var vm=new Vue({

	el:'#container',
	
	data:{
		COLS:10,
		ROWS:15,
		score:0,
		activeCells:[],
		nextActiveCells:[],
		background:[]
	},
	
	computed:{
	},
	
	methods:{
		init:function(){
			for(var y=0;y<this.ROWS;y++){
				var row=[];
				for(var x=0;x<this.COLS;x++){
					row.push({active:false,background:false});
				}
				this.background.push(row);
			}
			this.renewActiveCells();
		},
		
		getNextActiveClass:function(x,y){
			var active=false;
			if(this.nextActiveCells[y] && this.nextActiveCells[y][x]){
				active=true;
			}
			return {
				'active':active,
				'default':!active
			};
		},
		
		
		renewActiveCells:function(){
			if(this.activeCells.length>0){
				var cell;
				for(var i=0;i<this.activeCells.length;i++){
					cell=this.activeCells[i];
					this.background[cell.y][cell.x].background=true;
				}
			}
			var random=Math.floor(Math.random()*7+1);
			//random=6;
			switch(random){
				/* 
					■ ■ ■ 
					■
				*/				
				case 1://L型
					this.activeCells=[
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
					this.activeCells=[
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
					this.activeCells=[
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
					this.activeCells=[
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
					this.activeCells=[
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
					this.activeCells=[
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
					this.activeCells=[
						{x:0,y:0},
						{x:1,y:0},
						{x:0,y:1},
						{x:1,y:1}
					];
				break;
				default:
				break;
			}
			this.activeCells.type=random;
			//移动方块到合适位置
			for(var i=0;i<7;i++){
				//this.rightShift(this.activeCells);
			}
		},
		
		//绘制方块
		drawActiveCells:function(){
			var cell;
			for(var i=0;i<this.activeCells.length;i++){
				cell=this.activeCells[i];
				this.background[cell.y][cell.x].active=true;
			}
		},
		
		//移除方块
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
			var center=cells[0];
			for(var i=1;i<cells.length;i++){
				var srcX=cells[i].x;
				var srcY=cells[i].y;
				cells[i].x=center.x+center.y-srcY;
				cells[i].y=center.y-center.x+srcX;
			}
			//console.log(cells)
		},
		
		shift:function(type){
			if(!this.canShift(type)){
				//不能下落，生成新的方块
				if(type=='FALL'){
					this.removeActiveCells();
					this.renewActiveCells();
					
					this.dieLine();
					this.drawActiveCells();
				}
				return;
			}
			this.removeActiveCells();
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
				break;
				default:
				break;
			}
			this.drawActiveCells();
		},
		
		//试算能否移动
		canShift:function(type){
			var cells=[];
			//复制一份
			for(var i=0;i<this.activeCells.length;i++){
				var cell={
					x:this.activeCells[i].x,
					y:this.activeCells[i].y
				};
				cells.push(cell);
			}
			//试算
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
				default:
				break;
			}
			//判断是否能移动
			for(var i=0;i<cells.length;i++){
				var cell=cells[i];
				//是否超边界
				if(cell.x<0||cell.y<0||cell.x>=this.COLS||cell.y>=this.ROWS){
					return false;
				}
				//是否位置已被占
				if(this.background[cell.y][cell.x].background==true){
					return false;
				}
			}
			return true;
		},
		
		//消行
		dieLine:function(){
			for(var y=this.ROWS-1;y>=0;y--){
				this.dieOneLine(y);
			}
		},
		
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
				for(var i=rowNum;i>=0;i--){
					for(var x=0;x<this.COLS;x++){
						if(i==0){
							this.background[i][x].background=false;
						}else{
							this.background[i][x].background=this.background[i-1][x].background;
						}
					}	
				}
				//再消一次，避免上行也需要消除
				this.dieOneLine(rowNum);
			}
		},
		
		inArray:function(target,arr){
			for(var i=0;i<arr.length;i++){
				if(target==arr[i]){
					return true;
				}
				return false;
			}
		}
	},
	
	created:function(){
		this.init();
		this.drawActiveCells();
	}
});

$("body").on("keydown",function(e){
	switch(e.keyCode){
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
	}
});

//自动下落
setInterval(function(){
	vm.shift('FALL');
},500);