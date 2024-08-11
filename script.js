let mainGrid = document.querySelector(".main-grid");
let turn = "X";
let isGameOver = false;
let moveHistory = []; // Stack to keep track of moves for undo
let redoStack = [];   // Stack to keep track of undone moves for redo

function createGrid(size) {
    mainGrid.innerHTML = "";
    mainGrid.className = `main-grid grid-${size}x${size}`;
    for (let i = 0; i < size * size; i++) {
        let box = document.createElement("div");
        box.className = "box align";
        box.dataset.index = i;
        box.addEventListener("click", handleClick);
        mainGrid.appendChild(box);
    }
    resetGame();
}

function handleClick() {
    if (!isGameOver && this.innerHTML === "") {
        this.innerHTML = turn;
        moveHistory.push({index: this.dataset.index, player: turn});
        redoStack = []; // Clear redo stack when a new move is made
        checkWin();
        checkDraw();
        changeTurn();
    }
}

function changeTurn() {
    turn = (turn === "X") ? "O" : "X";
    document.querySelector(".bg").style.left = (turn === "X") ? "0" : "85px";
}

function checkWin() {
    let size = Math.sqrt(mainGrid.children.length);
    let winConditions = generateWinConditions(size);

    for (let condition of winConditions) {
        let [a, b, c, ...rest] = condition;
        let values = [mainGrid.children[a].innerHTML, mainGrid.children[b].innerHTML, mainGrid.children[c].innerHTML, ...rest.map(i => mainGrid.children[i].innerHTML)];

        if (values.every(val => val !== "" && val === values[0])) {
            isGameOver = true;
            document.querySelector("#results").innerHTML = turn + " wins";
            document.querySelector("#play-again").style.display = "inline";
            condition.forEach(index => {
                mainGrid.children[index].style.backgroundColor = "#08D9D6";
                mainGrid.children[index].style.color = "#000";
            });
            break;
        }
    }
}

function checkDraw() {
    if (!isGameOver) {
        let isDraw = [...mainGrid.children].every(box => box.innerHTML !== "");
        if (isDraw) {
            isGameOver = true;
            document.querySelector("#results").innerHTML = "Draw";
            document.querySelector("#play-again").style.display = "inline";
        }
    }
}

function generateWinConditions(size) {
    let conditions = [];
    // Rows and columns
    for (let i = 0; i < size; i++) {
        let row = [], col = [];
        for (let j = 0; j < size; j++) {
            row.push(i * size + j);
            col.push(j * size + i);
        }
        conditions.push(row, col);
    }
    // Diagonals
    let diag1 = [], diag2 = [];
    for (let i = 0; i < size; i++) {
        diag1.push(i * size + i);
        diag2.push(i * size + (size - i - 1));
    }
    conditions.push(diag1, diag2);
    return conditions;
}

function undoMove() {
    if (moveHistory.length > 0) {
        let lastMove = moveHistory.pop();
        redoStack.push(lastMove);
        mainGrid.children[lastMove.index].innerHTML = "";
        changeTurn();
        document.querySelector("#results").innerHTML = "";
        isGameOver = false;
    }
}

function redoMove() {
    if (redoStack.length > 0) {
        let lastUndoneMove = redoStack.pop();
        mainGrid.children[lastUndoneMove.index].innerHTML = lastUndoneMove.player;
        moveHistory.push(lastUndoneMove);
        changeTurn();
        checkWin();
        checkDraw();
    }
}

function resetGame() {
    isGameOver = false;
    turn = "X";
    moveHistory = [];
    redoStack = [];
    document.querySelector(".bg").style.left = "0";
    document.querySelector("#results").innerHTML = "";
    document.querySelector("#play-again").style.display = "none";
    [...mainGrid.children].forEach(box => {
        box.innerHTML = "";
        box.style.removeProperty("background-color");
        box.style.color = "#fff";
    });
}

document.querySelector("#grid-size").addEventListener("change", function () {
    createGrid(this.value);
});

document.querySelector("#play-again").addEventListener("click", function () {
    createGrid(document.querySelector("#grid-size").value);
});

document.querySelector("#undo").addEventListener("click", undoMove);
document.querySelector("#redo").addEventListener("click", redoMove);

createGrid(3);  // Default grid size on load
