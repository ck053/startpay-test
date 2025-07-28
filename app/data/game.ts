interface playerdata {
    position: number,
    exposed: number[][],
    last_drawn: number,
    discard: number[],
    name: string,
    hand: number[]
}

export interface roomdata {
    current_player: number,
    cards_remain: number,
    last_discard: number,
    wall: number[],
    playerdatalist: playerdata[],
    stars: number,
    listen: boolean,
    round: number,
    position: number,
}
const standard_wall = [11, 11, 11, 11, 12, 12, 12, 12, 13, 13, 13, 13, 14, 14, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 31, 31, 31, 31, 32, 32, 32, 32, 33, 33, 33, 33, 34, 34, 34, 34, 35, 35, 35, 35, 36, 36, 36, 36, 37, 37, 37, 37, 38, 38, 38, 38, 39, 39, 39, 39, 51, 51, 51, 51, 52, 52, 52, 52, 53, 53, 53, 53, 54, 54, 54, 54, 55, 55, 55, 55, 56, 56, 56, 56, 57, 57, 57, 57, 58, 58, 58, 58, 59, 59, 59, 59, 65, 65, 65, 65, 69, 69, 69, 69, 73, 73, 73, 73, 77, 77, 77, 77, 81, 81, 81, 81, 85, 85, 85, 85, 89, 89, 89, 89];

type valid_actions = 'draw' | 'discard';
export interface replay_record {
    action: valid_actions,
    value: number,
    player: number,
}

function shuffle(array: number[]){
    let currentIndex = array.length, randomIndex;
    while (currentIndex > 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]]=[
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

export function sorthand(sort: number[], last_drawn=-1) {
    sort.sort((a,b) => a-b);
    if (last_drawn>0) {
        sort.splice(sort.indexOf(last_drawn), 1);
        sort.push(last_drawn);
    }
    return sort;
}

export function FetchRoomData(room: roomdata): roomdata {
    // Create a new playerdatalist with filtered data
    const publicPlayerDataList = room.playerdatalist.map((player, index) => {
        // Player 0 (the current player) sees their own hand and last_drawn
        if (index === 0) {
            return {
                position: player.position,
                exposed: player.exposed,
                discard: player.discard,
                last_drawn: player.last_drawn, // Keep for self
                name: player.name,
                hand: [...player.hand], // Keep a copy of their hand
            };
        }
        // Other players only see public info
        return {
            position: player.position,
            exposed: player.exposed,
            discard: player.discard,
            last_drawn: -1, // Hide for opponents
            name: player.name,
            hand: [], // Hide hand for opponents
        };
    });

    return {
        current_player: room.current_player,
        cards_remain: room.cards_remain,
        last_discard: room.last_discard,
        wall: [], // Hide the wall (private)
        playerdatalist: publicPlayerDataList,
        stars: room.stars,
        listen: room.listen,
        round: 12,
        position: 1,
    };
}

export function initializeRoomData(stars=1) {
    // create a playerdatalist
    const playerdatalist: playerdata[] = [];

    // create 4 playerdata in playerdatalist
    [0,1,2,3].forEach(e => {
        playerdatalist.push({
            position: e,
            exposed: [],
            discard: [],
            last_drawn: -1,
            name: `bot${e}`,
            hand: [],
        });
    });

    // get a copy of wall and shuffle
    let wall = shuffle(shuffle([...standard_wall]))
    // deal the starting hand
    for (let i = 0; i < 13; i++) {
        for (let j = 0; j<4 ; j++) {
            const card = wall.pop();
            if (card !== undefined) {
                playerdatalist[j].hand.push(card);
            } else {
                throw new Error("Wall is empty before dealing all cards");
            }
        }
    }
    // sort the hands
    [0,1,2,3].forEach(i => {
        playerdatalist[i]['hand'] = sorthand(playerdatalist[i]['hand']);
    });
    const cards_remain = wall.length;
    const roomdata = {
        current_player: 0,
        cards_remain,
        last_discard: -1,
        wall,
        playerdatalist,
        stars,
        listen: true,
        round: -1,
        position: -1,
    };
    const PublicRoomData = FetchRoomData(roomdata);
    // create roomdata
    return [roomdata, PublicRoomData];
}

function checkpairs(array: number[]) {
    array = [...array].sort((a,b) => a-b);
    let result = [];
    let trigger = false;
    for (let i=0; i < array.length-1; i++){
        if (array[i] == array[i+1]){
            result.push(array[i]);
            trigger = true;
        }
    }
    if (trigger){
        const orgsethand = new Set(result);
        //remake into array
        let sethand: number[] = [];
        orgsethand.forEach(function(value){
            sethand.push(value);
        })
        return sethand;
    }
    return false;
}

export function checkWin(winhand: number[]) {
    //check if the hand is legal
    //console.log("hand is:", winhand)
    if (winhand.length%3 != 2){
        return false;
    }
    //first sort the hand
    winhand.sort((a:number, b:number) => a-b);
    //get list of pair
    const pairlist = checkpairs(winhand);
    //if no pair must not be a winning hand
    if ((!pairlist)){
        return false;
    }
    //take away pairs and see if it is winning
    for (let i=0; i<pairlist.length; i++){
        //console.log("remove a pair", pairlist[i])
        //get a copy of hand
        let copyhand = [...winhand];
        //remove the pair
        copyhand.splice(winhand.indexOf(pairlist[i]),2);
        //check if is winning
        if (checkhu(copyhand)){
            return true;
        }
        //console.log("Going to next for loop")
        //console.log("current i: ", i)
        //console.log("current pairlist: ", pairlist)
    }
    return false;
}

function removestraight(myArray: number[], removeArray:number[]){
    let copyremoveArray = [...removeArray];
    const filteredArray = myArray.filter((num, index) => {
        if (copyremoveArray.includes(num)) {
            copyremoveArray.splice(copyremoveArray.indexOf(num), 1);
          return false;
        } else {
          return true;
        }
      });
    return filteredArray;
}

function lowerstraightchecking(hand: number[]){
    let copy = [...hand].sort((a,b) => a-b);
    //remove all samehand
    const orgsethand = new Set(copy);
    //remake into array
    let sethand: number[] = [];
    orgsethand.forEach(function(value){
        sethand.push(value);
    })
    const abshand = [...sethand];
    if (sethand[0]+2 == sethand[2]){
        return[sethand[0],sethand[1],sethand[2]];
    }
    for (let i=0; i<sethand.length;i++){
        if (sethand[i]+2 == sethand[i+2]){
            let hu = true;
            let checklist = [];
            for (let j=0; j<i; j++){   
                checklist[j] = sethand[j]; 
            }
            let ttriplist = checktrips(hand);
            if (ttriplist==false){
                return [abshand[i],abshand[i+1],abshand[i+2]]
            }
            for (let j=0; j<i; j++){
                var constrips =[];
                if(!ttriplist.flat().includes(checklist[j])){
                    hu = false;
                } else{
                    let tempvar = [];
                    tempvar.push(checklist[j]);
                    tempvar.push(checklist[j]);
                    tempvar.push(checklist[j]);
                    constrips.push(tempvar);
                }
            }
            if (!hu){
                return false;
            } else{
                return [abshand[i],abshand[i+1],abshand[i+2]]
            }
        }
    }
    return [0,0,0]; //對對 or not hu
}

function checktrips(array: number[]) {
    array = [...array].sort((a,b) => a-b);
    let result = [];
    let trigger = false;
    for (let i=0; i < array.length-1; i++){
        if (array[i] == array[i+2]){
            result.push(array[i]);
            trigger = true;
        }
    }
    if (trigger){
        const orgsethand = new Set(result);
        //remake into array
        let sethand: number[][] = [];
        let subsethand: number[] = [];
        orgsethand.forEach(function(value){
            subsethand.push(value);
            subsethand.push(value);
            subsethand.push(value);
            sethand.push(subsethand);
            subsethand = [];
        })
        return sethand;
    }
    return false;
}

export function checkpon(hand: number[], tile: number): boolean {
    let count = 0;
    for (const t of hand) {
        if (t === tile) {
            count++;
            if (count >= 2) {
                return true; // Early exit if found twice
            }
        }
    }
    return false; // Tile appears less than twice
}
export function checkkan(hand: number[], exposed: number[][] = [], tile: number = -1, ondraw: boolean = true): number {
    if (hand.length === 0) return 0;

    // Open Kan logic (when specific tile is provided)
    if (tile !== -1) {
        // Closed Kan logic (check all possible 4-of-a-kinds in hand)
        const tileCounts: Record<number, number> = {};
        for (const t of hand) {
            tileCounts[t] = (tileCounts[t] || 0) + 1;
            if (tileCounts[t] === 4 && t == tile) {
                return 2; // Closed Kan found
            }
        }
        if (ondraw){
            let count = 0;
            for (const t of hand) {
                if (t === tile) {
                    count++;
                    if (count >= 3) {
                        return 1;
                    }
                }
            }
            // Added Kan logic (3 in hand + matching exposed Pon)
            if (exposed.some(set => set.length === 3 && set.every(t => t === tile))) {
                return 3; // Added Kan possible
            }
        }
        return 0;
    }

    // Closed Kan logic (check all possible 4-of-a-kinds in hand)
    const tileCounts: Record<number, number> = {};
    for (const t of hand) {
        tileCounts[t] = (tileCounts[t] || 0) + 1;
        if (tileCounts[t] === 4) {
            return 2; // Closed Kan found
        }
    }

    // Added Kan logic (3 in hand + matching exposed Pon)
    const uniqueTiles = [...new Set(hand)]; // Check each tile type only once
    for (const tile of uniqueTiles) {
        if (exposed.some(set => set.length === 3 && set.every(t => t === tile))) {
            return 3; // Added Kan possible
        }
    }

    return 0; // No Kan found
}

export function getPossibleKan(hand: number[], exposed: number[][] = []): number[][] {
    const possibleKans: number[][] = [];
    const handCounts: Record<number, number> = {};

    // 1. Count tiles in hand
    for (const tile of hand) {
        handCounts[tile] = (handCounts[tile] || 0) + 1;
    }

    // 2. Check for closed Kan (4 identical tiles in hand)
    for (const [tile, count] of Object.entries(handCounts)) {
        if (count >= 4) {
            possibleKans.push(Array(4).fill(Number(tile)));
        }
    }

    // 3. Check for added Kan (3 in hand + matching exposed Pon)
    const exposedPonTiles = new Set<number>();
    // Get all tiles from exposed Pons (length-3 sets)
    for (const set of exposed) {
        if (set.length === 3 && set[0] === set[1] && set[1] === set[2]) {
            exposedPonTiles.add(set[0]);
        }
    }

    // Check if hand has at least 1 matching tile for each exposed Pon
    for (const ponTile of exposedPonTiles) {
        const countInHand = handCounts[ponTile] || 0;
        if (countInHand >= 1) {
            possibleKans.push([ponTile, ponTile, ponTile, ponTile]);
        }
    }

    return possibleKans;
}

export function checkchi(hand: number[], tile: number): number[][] {
    // Check for possible sequences that can form a Chi with the given tile
    const possibleSequences = [
        [tile - 2, tile - 1, tile],
        [tile - 1, tile, tile + 1],
        [tile, tile + 1, tile + 2] 
    ];

    // Check if any sequence exists in hand
    return possibleSequences.filter(combination => {
        return combination.every(t => 
            standard_wall.includes(t) && 
            combination.filter(t => t !== tile).every(t => hand.includes(t)));
    });
}

function checkpinghu(array: number[]): number[][] | false {
    let handcombine: number[][] = [];
    let straightlist: number[] = [];
    
    // First check - returns false or number[]
    const straightCheck = lowerstraightchecking(array);
    if (!straightCheck) {
        return false;
    }
    straightlist = straightCheck;

    const removedblock = [...straightlist];
    
    // Base case - empty array
    if (array.length === 0) {
        return handcombine;
    }

    // Invalid straight case
    if (straightlist[0] === 0 || !straightlist.length) {
        return false;
    }

    // Recursive case
    array = removestraight(array, straightlist);
    const recursiveResult = checkpinghu(array);
    
    if (recursiveResult) {
        recursiveResult.push(removedblock);
        return recursiveResult;
    } else {
        return false;
    }
}

function removetrips(mainarray: number[], referarray: number[][]){
    for (let i=0; i<referarray.length; i++){
        if((referarray[i].length == 0)||(referarray[i][0]==0)){
            continue;
        }
        mainarray.splice(mainarray.indexOf(referarray[i][0]),3);
    }
    return mainarray;
}

function checkhu(hand: number[]) {
    if(checkpinghu([...hand])){
        return true;
    }
    var triplist = checktrips(hand);
    if (triplist !== false) {
        for (let i=0;i<2**triplist.length;i++){
            let temphand = [...hand];
            let tripsOn = [...triplist];
            let a = i;
            let count = 0;
            while (true){
                if (a == 0){
                    break;
                }
                if (a%2){
                    tripsOn[count] = [0];
                }
                count++;
                a = Math.floor(a/2);
            }
            removetrips(temphand,tripsOn);
            //check ping hu
            if(checkpinghu(temphand)){
                return true;
            }
        }
    } 
    
    return false;
}
