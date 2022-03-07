var board=[];
var charges=0;
function state(name,oneTile=false){
    return {
        name:name,
        delay:5,
        canUse(){
            return charges>=this.delay
        },
        updateEle(){
            var ele=document.getElementById(this.name)
            ele.innerHTML=this.name.charAt(0).toUpperCase()+this.name.substring(1)+'<br>'+this.delay
            if(this.canUse()){
                ele.disabled=false
            }else{
                ele.disabled=true
            }
        },
        oneTile:oneTile
    }
}

const states={
    none:state('none',true),//Used when no power is present
    swap:state('swap'),//Swaps two pieces, no merge
    move:state('move'),//Moves a piece to another spot. Can merge
    delete:state('delete',true),//Removes the piece
    upgrade:state('upgrade',true),//Ranks up the piece
}
var powerState=states.none.name

function updateEles(){
    for(name in states)
        if(name!==states.none.name)
            states[name].updateEle()
    document.getElementById('charges').innerHTML=charges+' charges'
}

const Dir={
    up:'up',
    down:'down',
    left:'left',
    right:'right'
}

/**
 * @returns the element at (x,y) of board. It's just shorthand for reading it. Also returns false if it is invalid
 */
function b(x,y){
    if(x<0||x>=board.length||y<0||y>=board[0].length)
        return false;
    return board[x][y]
}

/**
 * Removes the tile at (x,y)
 * @returns the value that was at the removed tile
 */
function r(x,y){
    var old=b(x,y)
    if(old!==undefined){
        board[x][y]=undefined;
        updateBoard()
    }
    return old;
}

/**Increments the tile at (x,y) to the next rank */
function add(x,y,d=1){
    for(let i=0;i<d;i++){
        if(board[x][y]){
            //Makes sure it is in the range of possible tiles
            if(board[x][y]!==types.length-1)
                board[x][y]++
            else{
                return false
            } 
        }else
            board[x][y]=1;
        updateBoard()
    }
    return b(x,y)
}

function moveTo(x1,y1,x2,y2){
    var t1=b(x1,y1)
    var t2=b(x2,y2)
    if(x1===x2&&y1===y2)
        return false
    if(t1===t2&&t1!==undefined&&t1!==types.length-1){
        //I don't use add() or r() because that would increase lag by useing updateBoard() 2x not just 1x
        board[x2][y2]++
        board[x1][y1]=undefined
        updateBoard()
        return true;
    }else if(t1!==undefined&&t2===undefined){
        board[x2][y2]=board[x1][y1];
        board[x1][y1]=undefined;
        updateBoard()
        return true
    }//This part makes infinite colors when trying to match at the max value
    else if(t1===t2&&t1!==undefined&&t1===types.length-1){rndColors(1);board[x2][y2]++;board[x1][y1]=undefined;updateBoard()}

    return false;
}

function swap(x1,y1,x2,y2){
    var temp=b(x1,y1)
    if(b(x1,y1)===b(x2,y2))
        return false
    board[x1][y1]=board[x2][y2]
    board[x2][y2]=temp;
    updateBoard()
    return true
}

/**Moves a singular piece in a singular space of one direction */
function moveIn(x,y,dir){
    switch(dir){
        case Dir.up:
            return moveTo(x,y,x,y-1)
        case Dir.down:
            return moveTo(x,y,x,y+1)
        case Dir.left:
            return moveTo(x,y,x-1,y)
        case Dir.right:
            return moveTo(x,y,x+1,y)
    }
}

/**Controls the whole moving dynamic of the game */
function move(dir){
    var canMove=false,hasMoved=false;
    //Short function to save me time. Checks if a piece can be moved in a direction, and does if possible
    function f(i,j,dir){
        if(moveIn(i,j,dir)){
            canMove=true;
            if(!hasMoved)
                hasMoved=true
        }
    }
    
    if(dir===Dir.up){
        do{
            canMove=false;
            for(let i=0;i<board.length;i++)
                for(let j=0;j<board[i].length;j++)
                    f(i,j,dir)
        }while(canMove)
    }else if(dir===Dir.down){
        do{
            canMove=false;
            for(let i=0;i<board.length;i++)
                for(let j=board[i].length-1;j>=0;j--)
                    f(i,j,dir)
        }while(canMove)
    }else if(dir===Dir.left){
        do{
            canMove=false;
            for(let i=0;i<board.length;i++)
                for(let j=0;j<board[i].length;j++)
                    f(i,j,dir)
        }while(canMove)

    }else if(dir===Dir.right){
        do{
            canMove=false;
            for(let i=board.length-1;i>=0;i--)
                for(let j=0;j<board[i].length;j++)
                    f(i,j,dir)
        }while(canMove)
    }

    if(hasMoved)
        postMove()
        
    return hasMoved
}

function postMove(){
    //addRandomTile()
    powerUpCounter()
    updateEles()
    firstClick=undefined
    secondClick=undefined
}

/**Creates the board with a specified size. I made it scalable for more fun */
function makeBoard(size=4){
    board=new Array(size);
    for(let i=0;i<size;i++)
        board[i]=new Array(size);
}

function type(color,text='white'){return{color:color,text:text}}
function grad(color1,color2,color3,text){return type('linear-gradient('+color1+','+color2+','+color3+')',text)}
function rad(color1,color2,color3,text){return type('radial-gradient('+color1+','+color2+','+color3+')',text)}

const types=[
    type('white'),
    type('#FFE4C3'),type('#ffc579'),type('#f58231'),type('#9a6324'),
    type('#808000'),type('#800000'),type('#ff5050'),type('#ff461c'),
    type('#ff466b'),type('#cc4398'),type('#ff50d9'),type('#b936ff'),
    type('#e6beff'),type('#6e42ff'),type('#0000c5'),type('#313bff'),
    type('#378aff'),type('#40e6ff'),type('#44ffc1'),type('#49ff70'),
    type('#3cb44b'),type('#bfff7f'),type('#e6ff55'),type('#fff34d'),
]
var tLen=types.length
for(let i=1;i<tLen-2;i++){
    types.push(grad(types[i].color,types[i+1].color,types[i+2].color))
}
for(let i=1;i<tLen-2;i++){
    types.push(rad(types[i].color,types[i+1].color,types[i+2].color))
}

//This ends with a total of 68 different tiles. Hurts loadup time, but lots of different tiles


function rndColors(n){
    var col=[];
    types.forEach(e=>{
        col.push(e.color)
    })
    for(let i=0;i<n;i++)
        types.push(type(Random.arrayElement(col)))
}

function div(id,parent){
    var temp=document.createElement('div')
    temp.id=id;
    parent.appendChild(temp)
    return temp
}

function appendEle(id,parent,type){
    var temp=document.createElement(type)
    temp.id=id;
    parent.appendChild(temp)
    return temp
}

function makeEle(){
    var main=div('main',document.body)
    for(let y=0;y<board.length;y++){
        var row=div('row'+y,main)
        row.classList.add('row')

        //Sets the style for each row w/o css
        row.style.display='flex'

        for(let x=0;x<board[y].length;x++){
            var temp=div('t'+x+','+y,row)
            temp.classList.add('tile')

            //Sets the style for each tile w/o css file
            temp.style.display='flex'
            temp.style.width='50px'
            temp.style.height='50px'
            temp.style.border='2px solid black'
            temp.style.borderRadius='15%'
            temp.style.justifyContent='center'
            temp.style.transition='0.2s all'
            temp.style.color='black'

        }
    }
    var buttonsDiv=div('buttons',document.body)
    div('charges',buttonsDiv)
    appendEle(states.upgrade.name,buttonsDiv,'button')
    appendEle(states.delete.name,buttonsDiv,'button')
    appendEle(states.swap.name,buttonsDiv,'button')
    appendEle(states.move.name,buttonsDiv,'button')
    
    
}

const Random={
    chance(n,d){
        if(d===undefined)
            return Random.chance(1,n)
        else
            return Math.floor(Math.random()*d)<n;
    },
    intTo(max){
        return Math.floor(Math.random()*max)
    },
    arrayElement(arr){
        return arr[Math.floor(Math.random()*arr.length)]
    }
}

function addRandomTile(n=1){
    //Check if open tile exists first
    for(let r=0;r<n;r++){
        var hasEmpty=false
        for(let i=0;i<board.length&&!hasEmpty;i++){
            for(let j=0;j<board[i].length&&!hasEmpty;j++){
                if(board[i][j]===undefined)
                    hasEmpty=true;
            }
        }
        if(!hasEmpty)
            return false;
    
        var x,y;
        do{
            x=Random.intTo(board.length)
            y=Random.intTo(board[x].length)
        }while(board[x][y]!==undefined);
            board[x][y]=1
            //This means a 1/10 chance for 4, 1/100 for 8, 1/1000 for 16, etc...
            while(Random.chance(10))
                board[x][y]++

            updateBoard()
    }
    return true;
}

/**The base that the numbers are in. 1 gives the count of the value, and 0 gives just colors */
const BASE=2

function updateBoard(){
    for(let i=0;i<board.length;i++){
        for(let j=0;j<board[i].length;j++){
            var val=(board[i][j])?board[i][j]:0;
            var color=types[val].color;
            var text=types[val].text
            var ele=document.getElementById('t'+i+','+j)
            if(BASE>1){
                var str=(board[i][j])?Math.pow(BASE,board[i][j]).toString():'';
                //if(str!=='')str=str.match(/.{1,5}/g).join('<br>')
                ele.innerHTML=/*str*/(board[i][j])?(Math.pow(BASE,board[i][j])>100000)?BASE+'^'+board[i][j]:Math.pow(BASE,board[i][j]):'';/////////////////////////////////////
            }else if(BASE===1)
                ele.innerHTML=(board[i][j])?board[i][j]:''

            ele.style.background=color;
            ele.style.color=text;
        }
    }
}

function Point(x,y){return {x:x,y:y}}

document.addEventListener('keyup',(event)=>{
    if(['ArrowUp','w'].includes(event.key))
        return move(Dir.up)
    if(['ArrowDown','s'].includes(event.key))
        return move(Dir.down)
    if(['ArrowLeft','a'].includes(event.key))
        return move(Dir.left)
    if(['ArrowRight','d'].includes(event.key))
        return move(Dir.right)
})

const delayRate=2;

function powerUpCounter(){
    var max=Math.max(states.delete.delay,states.move.delay,states.swap.delay,states.upgrade.delay)
    if(charges<max)
        charges++
}

/**Determines what to do with a powerup based on info stored beforehand */
function interpretPower(){
    function check(name){
        return (powerState===name&&states[powerState].canUse())
    }
    if(check(states.upgrade.name)){
        if(add(firstClick.x,firstClick.y)){
            charges-=states.upgrade.delay
            states.upgrade.delay+=delayRate
        }else
            console.log('Upgrade Failed')
    }else if(check(states.delete.name)){
        if(r(firstClick.x,firstClick.y)!==undefined){
            charges-=states.delete.delay
            states.delete.delay+=delayRate
            updateBoard()
        }else
            console.log('Removal Failed')
    }else if(check(states.move.name)){
        if(moveTo(firstClick.x,firstClick.y,secondClick.x,secondClick.y)){
            charges-=states.move.delay
            states.move.delay+=delayRate
        }else
            console.log('Move Failed')
    }else if(check(states.swap.name)){
        if(swap(firstClick.x,firstClick.y,secondClick.x,secondClick.y)){
            charges-=states.swap.delay
            states.swap.delay+=delayRate
        }else
            console.log('Swap Failed')
    }

    updateEles()
    powerState=states.none.name
    firstClick=undefined;
    secondClick=undefined;
}

var firstClick=undefined,secondClick=undefined;

document.addEventListener('click',(event)=>{
    updateEles()
    var cell=event.target;
    var id=cell.id.toString()
    if(id.charAt(0)==='t'){
        id=id.substring(1)
        //Get's the point version of the tile you clicked on
        var p=Point(id.substring(0,id.indexOf(',')),id.substring(id.indexOf(',')+1))
        if(firstClick===undefined){
            firstClick=p;
            if(states[powerState].oneTile)
                interpretPower()
            secondClick=undefined;
        }else if(firstClick!==undefined&&secondClick===undefined){
            secondClick=p;
            interpretPower();
        }
    }
})

function delayedRepeat(func,reps,delay){
    var t=setInterval(()=>{
        func();
        if(--reps<=0)
            clearInterval(t)
    },delay)
}

var loopDir=Dir.left;
var loopEnd=false

function endLoop(){loopEnd=true}

function loop(delay){
    loopDir=
        (loopDir===Dir.left)?Dir.up:
        (loopDir===Dir.up)?Dir.right:
        (loopDir===Dir.right)?Dir.down:
            Dir.left
    
    move(loopDir)
    if(!loopEnd)
        setTimeout(()=>{loop(delay)},delay)
    else
        loopEnd=false
}

/**@oninit */
function buttonFunctions(){
    function f(name){
        document.getElementById(name).onclick=()=>{
            firstClick=undefined
            secondClick=undefined
            powerState=name
        }
    }
    f(states.delete.name)
    f(states.upgrade.name)
    f(states.swap.name)
    f(states.move.name)
    updateEles()
}

function init(){
    makeBoard(9)
    makeEle()
    buttonFunctions()
    addRandomTile(2)
    colorTest()
}

function clearBoard(){
    for(let i=0;i<board.length;i++)
        for(let j=0;j<board[i].length;j++)
            board[i][j]=undefined
}

function colorTest(){
    var endLoop=false,count=1;
    clearBoard()
    for(let i=0;i<board[0].length&&!endLoop;i++){
        for(let j=0;j<board.length&&!endLoop;j++){
            //if(!add(i,j,i+j))endLoop=true    Gradient
            if(!add(j,i,count++)){
                endLoop=true
                board[j][i]=undefined;
            }
        }
    }
    updateBoard()
}

init()