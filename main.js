var M=[];const B=2,D={U:'u',D:'d',L:'l',R:'r'},R={A(a){return a[Math.floor(Math.random()*a.length)]},C(n,d){return(d===void 0)?R.C(1,n):Math.floor(Math.random()*d)<n;}};function b(x,y){try{return M[x][y];}catch(e){return void 0}}class T{constructor(val=1){this.val=val;this.hasMerged=false;};remove(){if(this.val!==0){this.val=0;return true}else return false};upgrade(n=1){while(n-->0){if(this.val!==c.length-1){this.val++;if(n===0)return true}else return false}};downgrade(n=1){while(n-->0){if(this.val>0){this.val--;if(n===0)return true}else return false}};tryMerge(other){if(this.val===other.val&&!this.isBlank()){if(!this.hasMerged&&!other.hasMerged&&this.upgrade()){other.remove();this.hasMerged=true;other.hasMerged=true;return true}else return false}else return false};isBlank(){return this.val===0};moveTo(other){if(other===void 0||this.isBlank())return false;if(other.isBlank()){other.val=this.val;this.remove();return true}else if(this.tryMerge(other))return true;else return false};swapValue(other){if(this.val!==other.val){var temp=this.val;this.val=other.val;other.val=temp;return true}else return false}}function moveIn(x,y,d){var t=b(x,y);switch(d){case D.U:return t.moveTo(b(x-1,y));case D.D:return t.moveTo(b(x+1,y));case D.R:return t.moveTo(b(x,y+1));case D.L:return t.moveTo(b(x,y-1))}};function move(d){var canMove=true,hasMoved=false;function f(i,j,d){if(moveIn(i,j,d)){canMove=true;if(!hasMoved)hasMoved=true}}if(d===D.U){while(canMove){canMove=false;for(let i=0;i<M.length;i++)for(let j=0;j<M[i].length;j++)f(i,j,d)}}else if(d===D.D){while(canMove){canMove=false;for(let i=M.length-1;i>=0;i--)for(let j=0;j<M[i].length;j++)f(i,j,d)}}else if(d===D.L){while(canMove){canMove=false;for(let i=0;i<M.length;i++)for(let j=0;j<M[i].length;j++)f(i,j,d)}}else if(d===D.R){while(canMove){canMove=false;for(let i=0;i<M.length;i++)for(let j=M[i].length-1;j>=0;j--)f(i,j,d)}}if(hasMoved){addRandomTiles();M.forEach(row=>{row.forEach(tile=>{tile.hasMerged=false})});updateBoard()};updateBoard()}document.addEventListener('keyup',(event)=>{switch(event.key){case'ArrowUp':case'w':move(D.U);break;case'ArrowDown':case's':move(D.D);break;case'ArrowLeft':case'a':move(D.L);break;case'ArrowRight':case'd':move(D.R);break}});function d(i,p){var t=document.createElement('div');t.id=i;p.appendChild(t);return t}function makeBoard(width=4,height=width){M=[];for(let i=0;i<height;i++){M[i]=[];for(let j=0;j<width;j++)M[i][j]=new T(0)}};function Point(x,y){return{x:x,y:y}};function getEmptyTiles(){var tiles=[];for(let i=0;i<M.length;i++)for(let j=0;j<M[i].length;j++)if(b(i,j).isBlank())tiles.push(Point(i,j));return tiles}function addRandomTiles(n=1){var tiles=getEmptyTiles(),p;for(let i=0;i<n;i++){p=R.A(tiles);if(tiles.length!==0){do b(p.x,p.y).upgrade();while(R.C(1,10));tiles=getEmptyTiles()}else{updateBoard();return false}}updateBoard();return true}var c=['ffffff','ffe4C3','ffc579','f58231','9a6324','808000','800000','ff5050','ff461c','ff466b','cc4398','ff50d9','b936ff','e6beff','6e42ff','0000c5','313bff','378aff','40e6ff','44ffc1','49ff70','3cb44b','bfff7f','e6ff55','fff34d'];function updateBoard(){for(let i=0;i<M.length;i++)for(let j=0;j<M[i].length;j++){var temp=b(i,j).val,ele=document.getElementById('t'+j+','+i);if(temp!==0){var num=Math.pow(B,temp);if(num.toString().length>6)num=B+'^'+temp;ele.innerHTML=num}else ele.innerHTML='';ele.style.backgroundColor='#'+c[temp]}}function makeEle(){var main=d('main',document.body);for(let y=0;y<M.length;y++){var row=d('row'+y,main);row.classList.add('row');row.style.display='flex';for(let x=0;x<M[y].length;x++){var t=d('t'+x+','+y,row);t.style.display='flex';t.style.width='50px';t.style.height='50px';t.style.border='2px solid';t.style.borderRadius='15%';t.style.justifyContent='center';t.classList.add('tile')}}}makeBoard(7,14);makeEle();addRandomTiles(2);updateBoard()