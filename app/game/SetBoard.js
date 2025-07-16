export const SetBoard = (gamedata, previousplayer, nextplayer, playpos, player) => {
    // Set the background color
    document.body.style.backgroundColor = "lightgray";

    // Create the game board
    const gameboard = document.createElement("div");
    gameboard.id = "game-board";
    gameboard.classList.add("game-board");
    document.body.appendChild(gameboard);

    // Create opponent discard area
    const oppdiscard = document.createElement("div");
    oppdiscard.classList.add("oppdiscard");
    oppdiscard.id = "oppdiscard";
    gameboard.appendChild(oppdiscard);

    // Create left discard area
    const leftdiscard = document.createElement("div");
    leftdiscard.classList.add("leftdiscard");
    leftdiscard.id = "leftdiscard";
    gameboard.appendChild(leftdiscard);

    // Create right discard area
    const rightdiscard = document.createElement("div");
    rightdiscard.classList.add("rightdiscard");
    rightdiscard.id = "rightdiscard";
    gameboard.appendChild(rightdiscard);

    // Create own discard area
    const owndiscard = document.createElement("div");
    owndiscard.classList.add("owndiscard");
    owndiscard.id = "owndiscard";
    gameboard.appendChild(owndiscard);

    // Create player hand area
    const playerhand = document.createElement("div");
    playerhand.classList.add("player-hand");
    playerhand.id = "player-hand";
    gameboard.appendChild(playerhand);

    // Create left player hand area
    const leftplayerhand = document.createElement("div");
    leftplayerhand.classList.add("left-player-hand");
    leftplayerhand.id = "left-player-hand";
    gameboard.appendChild(leftplayerhand);

    // Create right player hand area
    const rightplayerhand = document.createElement("div");
    rightplayerhand.classList.add("right-player-hand");
    rightplayerhand.id = "right-player-hand";
    gameboard.appendChild(rightplayerhand);

    // Create player exposed area
    const playerexposed = document.createElement("div");
    playerexposed.classList.add("player-exposed");
    playerexposed.id = "player-exposed";
    gameboard.appendChild(playerexposed);

    // Create left player exposed area
    const leftplayerexposed = document.createElement("div");
    leftplayerexposed.classList.add("left-player-exposed");
    leftplayerexposed.id = "left-player-exposed";
    gameboard.appendChild(leftplayerexposed);

    // Create right player exposed area
    const rightplayerexposed = document.createElement("div");
    rightplayerexposed.classList.add("right-player-exposed");
    rightplayerexposed.id = "right-player-exposed";
    gameboard.appendChild(rightplayerexposed);

    // Create center board
    const centreboard = document.createElement("div");
    centreboard.classList.add("centreboard");
    centreboard.id = "centreboard";
    gameboard.appendChild(centreboard);

    // Create point indicators
    const pointleft = document.createElement("div");
    pointleft.id = "point-left";
    pointleft.innerHTML = gamedata[0]['point'][previousplayer]; // Ensure gamedata is defined in scope
    centreboard.appendChild(pointleft);

    const pointright = document.createElement("div");
    pointright.id = "point-right";
    pointright.innerHTML = gamedata[0]['point'][nextplayer]; // Ensure gamedata is defined in scope
    centreboard.appendChild(pointright);

    const pointself = document.createElement("div");
    pointself.id = "point-self";
    pointself.innerHTML = gamedata[0]['point'][playpos]; // Ensure gamedata is defined in scope
    centreboard.appendChild(pointself);

    // Create Dora indicator
    const doraindicate = document.createElement('div');
    doraindicate.id = "doraind";
    centreboard.appendChild(doraindicate);

    // Create round info area
    const roundinfo = document.createElement('div');
    roundinfo.id = "roundinfo";
    centreboard.appendChild(roundinfo);

    // Create button area
    const buttonarea = document.createElement("div");
    buttonarea.classList.add("button-area");
    buttonarea.id = "button-area";
    gameboard.appendChild(buttonarea);

    // Update player hands (ensure these functions are defined)
    player[(playpos + 1) % 3][1]['hand'].pop();
    player[(playpos + 2) % 3][1]['hand'].pop();
    updateleftplayerhand((playpos + 1) % 3);
    updaterightplayerhand((playpos + 1) % 3);
}