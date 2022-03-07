/**Holds all the tiles of the game */
var board=[[]]

/**The charges for use with the states */
var charges=0;

var score=0,highScore=0;

/**Enum for consistency */
const dirs={up:'up',down:'down',left:'left',right:'right'}

/**Holds points for the tiles you click on for the states */
var click1=undefined,click2=undefined

/**Used like Math to calculate random numbers easier */
const Random={
    arrayElement(arr){
        return arr[Math.floor(Math.random()*arr.length)]
    },
    chance(n,d){
        return (d===undefined)?Random.chance(1,n):Math.floor(Math.random()*d)<n;
    }
}

/**Simple getter for tiles at (x,y). Seems broken ish and returns (y,x) */
function b(x,y){
    try{
        return board[x][y];
    }catch(e){
        return undefined
    }
}

class Tile{
    constructor(val=1){
        this.val=val;
        this.hasMerged=false;
    }
    /**Increases the value of the tile */
    upgrade(n=1){
        //Add check for when trying to upgrade from max value
        while(n-->0){
            if(this.val!==colors.length-1){
                this.val++
                if(n===0)
                    return true
            }else return false
        }
    }
    /**If the value of the tile is > 0 then removes one from the value */
    downgrade(n=1){
        while(n-->0){
            if(this.val>0){
                this.val--;
                if(n===0)
                    return true;
            }else return false
        }
    }
    /**Sets the value of the tile to 0 */
    remove(){
        if(this.val!==0){
            this.val=0;
            return true
        }else
            return false;
    }
    /**Tries to merge this tile with the other one passed in. Returns true only if successful merge */
    tryMerge(other){
        if(this.canMerge(other)&&this.upgrade()){
            other.remove()
            other.hasMerged=true
            return true
        }else 
            return false
    }
    canMerge(other){
        return (this.val===other.val&&!this.isBlank()&&!this.hasMerged&&!other.hasMerged)
    }
    /**Returns true if the value of the Tile is 0 */
    isBlank(){
        return this.val===0
    }
    /**Tries to move this tile to the other tile. Includes merging */
    moveTo(other){
        if(other===undefined||this.isBlank())
            return false
        if(other.isBlank()){
            other.val=this.val
            this.remove()
            return true
        }else if(this.tryMerge(other)){
            return true
        }else
            return false
    }
    /**Swaps the values of this and the other tile. Returns false if both have the same value */
    swapValue(other){
        if(this.val!==other.val){
            var temp=this.val
            this.val=other.val
            other.val=temp;
            return true
        }else return false
    }
}

/**Moves a specific Tile in a direction */
function moveIn(x,y,dir){
    var temp=b(x,y)
    switch(dir){
        case dirs.up:
            return temp.moveTo(b(x-1,y))
        case dirs.down:
            return temp.moveTo(b(x+1,y))
        case dirs.right:
            return temp.moveTo(b(x,y+1))
        case dirs.left:
            return temp.moveTo(b(x,y-1))
    }
}

/**Moves all tiles in a direction */
function move(dir){
    var canMove=true,hasMoved=false

    function f(i,j,dir){
        if(moveIn(i,j,dir)){
            canMove=true;
            if(!hasMoved)
                hasMoved=true
        }
    }

    if(dir===dirs.up){
        while(canMove){
            canMove=false;
            for(let i=0;i<board.length;i++)
                for(let j=0;j<board[i].length;j++)
                    f(i,j,dir)
        }
    }else if(dir===dirs.down){
        while(canMove){
            canMove=false
            for(let i=board.length-1;i>=0;i--)
                for(let j=0;j<board[i].length;j++)
                    f(i,j,dir)
            
        }
    }else if(dir===dirs.left){
        while(canMove){
            canMove=false
            for(let i=0;i<board.length;i++)
                for(let j=0;j<board[i].length;j++)
                    f(i,j,dir)
            
        }
    }else if(dir===dirs.right){
        while(canMove){
            canMove=false
            for(let i=0;i<board.length;i++)
                for(let j=board[i].length-1;j>=0;j--)
                    f(i,j,dir)
        }
    }
    if(hasMoved)
        postMove()

    updateBoard()
}

function postMove(){
    if(charges<Math.max(states.downgrade.cost,states.move.cost,states.swap.cost,states.upgrade.cost))
        charges++
    else 
        updateStateEles()
    addRandomTiles()
    
    removeMerged()
    updateBoard()
    click1=undefined
    click2=undefined
    removeButtonBorders()
    curState=states.none
    if(checkLose()){
        console.log('lose')
    }
}

function checkLose(){
    if(getEmptyTiles().length===0){
        for(let i=0;i<board.length;i++){
            for(let j=0;j<board[i].length-1;j++){

            }
        }
    }
}

/**Removes the merged tag from all tiles */
function removeMerged(){
    board.forEach(row=>{
        row.forEach(tile=>{
            if(tile.hasMerged)
                score+=Math.pow(BASE,tile.val)
            if(score>highScore)
                highScore=score
            tile.hasMerged=false
        })
    })
}

document.addEventListener('keyup',(event)=>{
    switch(event.key){
        case 'ArrowUp':case'w':
            move(dirs.up);break;
        case'ArrowDown':case's':
            move(dirs.down);break;
        case'ArrowLeft':case'a':
            move(dirs.left);break;
        case'ArrowRight':case'd':
            move(dirs.right);break
    }
})

document.addEventListener('click',(event)=>{
    updateStateEles()
    var cell=event.target;
    var id=cell.id.toString()
    if(id.charAt(0)==='t'){
        id=id.substring(1)
        //Get's the point version of the tile you clicked on
        var p=Point(id.substring(0,id.indexOf(',')),id.substring(id.indexOf(',')+1))
        if(click1===undefined){
            click1=p;
            if(states[curState].oneTile)
                interpretState()
            click2=undefined;
        }else if(click1!==undefined&&click2===undefined){
            click2=p;
            interpretState();
        }
    }
})

/**Makes a div, gives it an id, then appends it to the parent */
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

function removeButtonBorders(){
    btnEles.forEach(e=>{
        e.style.border=''
    })
}

var btnEles=[]

function buttonFunctions(){
    function f(name){
        var ele=document.getElementById(name)
        btnEles.push(ele)
        ele.onclick=()=>{
            click1=undefined
            click2=undefined
            curState=name
            removeButtonBorders()
            ele.style.border='solid red 1px'
        }
    }
    f(states.downgrade.name)
    f(states.upgrade.name)
    f(states.swap.name)
    f(states.move.name)
    updateStateEles()
}

/**Defines the basic structure of the states */
function state(name,oneTile=false){
    return {
        name:name,
        cost:5,
        canUse(){
            return charges>=this.cost
        },
        updateEle(){
            var ele=document.getElementById(this.name)
            ele.innerHTML=this.name.charAt(0).toUpperCase()+this.name.substring(1)+'<br>'+this.cost
            if(this.canUse())
                ele.disabled=false
            else
                ele.disabled=true
        },
        /**Tells if it only requires one tile to function. Otherwise takes two */
        oneTile:oneTile
    }
}
/**The states that are possible */
const states={
    none:'none',//Used when no power is present
    swap:state('swap'),//Swaps two pieces, no merge
    move:state('move'),//Moves a piece to another spot. Can merge
    downgrade:state('downgrade',true),//Removes the piece
    upgrade:state('upgrade',true),//Ranks up the piece
}
/**The current state to use when clicking on a tile */
var curState=states.none;
/**The rate that the cost of each state goes up by on use */
const costRate=2;

/**Determines what state you have and uses it if possible */
function interpretState(){
    var hasActivated=false;
    /**Checks if this is the current state and if you can use it */
    function check(name){
        return(curState===name&&states[name].canUse())
    }

    var p1=b(click1.y,click1.x),p2
    if(click2!==undefined)
        p2=b(click2.y,click2.x)

    if(check(states.upgrade.name)){
        if(p1.upgrade())
            hasActivated=true
        else curState=states.none
    }else if(check(states.swap.name)){
        if(p1.swapValue(p2))
            hasActivated=true
        else curState=states.none
    }else if(check(states.move.name)){
        if(!(click1.x===click2.x&&click1.y===click2.y)&&(p2.moveTo(p1)||p1.moveTo(p2)))
            hasActivated=true
        else curState=states.none
    }else if(check(states.downgrade.name)){
        if(p1.downgrade())
            hasActivated=true
        else curState=states.none
    }

    if(hasActivated){
        charges-=states[curState].cost
        states[curState].cost+=costRate
        updateStateEles()
        updateBoard()
        
    }
    removeButtonBorders()
    click1=undefined
    click2=undefined   
}

function updateStateEles(){
    for(name in states)
        if(name!==states.none)
            states[name].updateEle()
    document.getElementById('score').innerHTML='Score: '+score+'<br>High Score:'+highScore
    document.getElementById('charges').innerHTML=charges+' charges'
}

/**Creates the board to the correct size of tiles */
function makeBoard(width,height){
    board=[]
    if(width&&!height)
        height=width
    else if(!width&&!height){
        width=4
        height=4
    }
    for(let i=0;i<height;i++){
        board[i]=[]
        for(let j=0;j<width;j++)
            board[i][j]=new Tile(0)
    }
}

function Point(x,y){return{x:x,y:y}}

function getEmptyTiles(){
    var tiles=[];
    for(let i=0;i<board.length;i++)
        for(let j=0;j<board[i].length;j++)
            if(b(i,j).isBlank())
                tiles.push(Point(i,j))
    return tiles
}

function addRandomTiles(n=1){
    var tiles=getEmptyTiles(),p;
    for(let i=0;i<n;i++){
        p=Random.arrayElement(tiles)
        if(tiles.length!==0){
            //This gives a 1/10 chance for a level 2 piece, 1/100 chance for level 3, 1/1000 for lvl 4 etc.
            do 
                b(p.x,p.y).upgrade()
            while 
                (Random.chance(1,10))
            tiles=getEmptyTiles()
        }else{
            updateBoard();
            return false
        }
    }
    updateBoard()
    return true
}

function color(color,text='white'){return{color:color,text:text}}

var colors=[
    color('white'),
    color('#FFE4C3'),color('#ffc579'),color('#f58231'),color('#9a6324'),
    color('#808000'),color('#800000'),color('#ff5050'),color('#ff461c'),
    color('#ff466b'),color('#cc4398'),color('#ff50d9'),color('#b936ff'),
    color('#e6beff'),color('#6e42ff'),color('#0000c5'),color('#313bff'),
    color('#378aff'),color('#40e6ff'),color('#44ffc1'),color('#49ff70'),
    color('#3cb44b'),color('#bfff7f'),color('#e6ff55'),color('#fff34d'),
]

const BASE=2

function updateBoard(){
    for(let i=0;i<board.length;i++){
        for(let j=0;j<board[i].length;j++){
            var temp=b(i,j).val
            var ele=document.getElementById('t'+j+','+i)
            if(temp!==0){
                var num=Math.pow(BASE,temp)
                if(num.toString().length>6)
                    num=BASE+'^'+temp
                ele.innerHTML=num
            }else{
                ele.innerHTML=''
            }
            ele.style.backgroundColor=colors[temp].color
        }
    }
    updateStateEles()
}

/**Makes the elements on the html */
function makeEle(){
    var all=div('2048',document.body)
    div('score',all)
    var main=div('main',all)
    for(let y=0;y<board.length;y++){
        var row=div('row'+y,main)
        row.classList.add('row')

        row.style.display='flex'

        for(let x=0;x<board[y].length;x++){
            var temp=div('t'+x+','+y,row)
            temp.classList.add('tile')

            temp.style.display='flex'
            temp.style.width='50px'
            temp.style.height='50px'
            temp.style.border='2px solid black'
            temp.style.borderRadius='15%'
            temp.style.justifyContent='center'
            temp.style.transition='0.2s all'

        }
    }
    var buttonsDiv=div('buttons',all)
    div('charges',buttonsDiv)
    appendEle(states.upgrade.name,buttonsDiv,'button')
    appendEle(states.downgrade.name,buttonsDiv,'button')
    appendEle(states.swap.name,buttonsDiv,'button')
    appendEle(states.move.name,buttonsDiv,'button')
}

function newGame(width,height){
    var all=document.getElementById('2048')
    if(all!==null)
        document.body.removeChild(all)

    score=0
    board=[[]]
    curState=states.none
    click1=undefined
    click2=undefined
    makeBoard(width,height)
    makeEle()
    buttonFunctions()
    addRandomTiles(2)
    updateBoard()
}

function init(){
    makeBoard(6,6)
    makeEle();
    buttonFunctions()
    addRandomTiles(2)
    updateBoard()
}

newGame(6,6)

function clearBoard(){
    board.forEach(y=>{
        y.forEach(x=>{
            x.remove()
        })
    })
}

function setAll(val){
    clearBoard()
    board.forEach(y=>{
        y.forEach(x=>{
            x.upgrade(val)
        })
    })
}

var loopDir=dirs.left;
var loopEnd=false

function endLoop(){loopEnd=true}

function loop(delay){
    loopDir=
        (loopDir===dirs.left)?dirs.up:
        (loopDir===dirs.up)?dirs.right:
        (loopDir===dirs.right)?dirs.down:
            dirs.left
    
    move(loopDir)
    if(!loopEnd)
        setTimeout(()=>{loop(delay)},delay)
    else
        loopEnd=false
}