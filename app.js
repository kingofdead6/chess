let currentPlayer = 'white';
let selectedPiece = null;
let validMoves = [];

const originalColors = [];

const initialBoard = [
  ['\u265C', '\u265E', '\u265D', '\u265B', '\u265A', '\u265D', '\u265E', '\u265C'],
  ['\u265F', '\u265F', '\u265F', '\u265F', '\u265F', '\u265F', '\u265F', '\u265F'],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['\u2659', '\u2659', '\u2659', '\u2659', '\u2659', '\u2659', '\u2659', '\u2659'],
  ['\u2656', '\u2658', '\u2657', '\u2655', '\u2654', '\u2657', '\u2658', '\u2656']
];


for (let row = 0; row < 8; row++) {
  originalColors[row] = [];
  for (let col = 0; col < 8; col++) {
    const square = document.createElement('div');
    square.classList.add('square');
    square.dataset.row = row;
    square.dataset.col = col;

    if ((row + col) % 2 === 0) {
      square.style.backgroundColor = '#a1d4f8';
      originalColors[row][col] = '#a1d4f8';
    } else {
      square.style.backgroundColor = '#143fe9';
      originalColors[row][col] = '#143fe9';
    }

    const piece = initialBoard[row][col];
    if (piece) {
      square.textContent = piece;
      square.style.color = row < 2 ? 'black' : 'white';
    }

    square.addEventListener('click', () => {
      handleSquareClick(row, col);
    });

    chessboard.appendChild(square);
  }
}

function handleSquareClick(row, col) {
  const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  const piece = square.textContent;

  if (!selectedPiece && piece && isCurrentPlayerPiece(piece)) {
    selectedPiece = { piece, row, col };
    validMoves = calculateValidMoves(piece, row, col);
    highlightValidMoves(validMoves);
  } else if (selectedPiece) {
    const move = validMoves.find(move => move[0] === row && move[1] === col);
    if (move) {
      movePiece(selectedPiece.row, selectedPiece.col, row, col);
      clearHighlights();
      selectedPiece = null;
      switchTurn();
    } else {
      clearHighlights();
      selectedPiece = null;
    }
  }
}

function isCurrentPlayerPiece(piece) {
  const isWhite = piece >= '\u2654' && piece <= '\u2659';
  return (currentPlayer === 'white' && isWhite) || (currentPlayer === 'black' && !isWhite);
}

function movePiece(fromRow, fromCol, toRow, toCol) {
  const fromSquare = document.querySelector(`[data-row="${fromRow}"][data-col="${fromCol}"]`);
  const toSquare = document.querySelector(`[data-row="${toRow}"][data-col="${toCol}"]`);

  if (fromSquare && toSquare) {
    toSquare.textContent = selectedPiece.piece;
    toSquare.style.color = currentPlayer === 'white' ? 'white' : 'black';
    fromSquare.textContent = '';

    initialBoard[toRow][toCol] = selectedPiece.piece;
    initialBoard[fromRow][fromCol] = '';
  }

  if ((selectedPiece.piece === '\u2659' && toRow === 0) || (selectedPiece.piece === '\u265F' && toRow === 7)) {
    const queen = currentPlayer === 'white' ? '\u2655' : '\u265B';
    toSquare.textContent = queen;
    initialBoard[toRow][toCol] = queen;
  }

  if (!isKingAlive(currentPlayer === 'white' ? 'black' : 'white')) {
    declareWinner(currentPlayer);
  }
}

function isKingAlive(player) {
  const king = player === 'white' ? '\u2654' : '\u265A';
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (initialBoard[row][col] === king) {
        return true;
      }
    }
  }
  return false;
}

function declareWinner(player) {
  const modal = document.getElementById('winnerModal');
  const winnerMessage = document.getElementById('winnerMessage');
  const replayButton = document.getElementById('replayButton');

  winnerMessage.textContent = `${player} wins!`;
  modal.style.display = 'block';

  document.querySelectorAll('.square').forEach(square => {
    square.removeEventListener('click', handleSquareClick);
  });

  replayButton.addEventListener('click', startNewGame);
}

function startNewGame() {
  location.reload();
}

function isSquareOccupied(row, col) {
  const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  return square && square.textContent !== '';
}

function isOpponentPiece(piece, row, col) {
  const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  const targetPiece = square.textContent;

  if (!targetPiece) return false;

  const isWhite = piece >= '\u2654' && piece <= '\u2659';
  const isTargetWhite = targetPiece >= '\u2654' && targetPiece <= '\u2659';

  return isWhite !== isTargetWhite;
}

function calculateValidMoves(piece, row, col) {
  let moves = [];

  switch (piece) {
    case '\u2659':
    case '\u265F':
      moves = calculatePawnMoves(piece, row, col);
      break;
    case '\u2656':
    case '\u265C':
      moves = calculateRookMoves(row, col);
      break;
    case '\u2658':
    case '\u265E':
      moves = calculateKnightMoves(row, col);
      break;
    case '\u2657':
    case '\u265D':
      moves = calculateBishopMoves(row, col);
      break;
    case '\u2655':
    case '\u265B':
      moves = calculateQueenMoves(row, col);
      break;
    case '\u2654':
    case '\u265A':
      moves = calculateKingMoves(row, col);
      break;
  }

  return moves.filter(move => !isSquareOccupied(move[0], move[1]) || isOpponentPiece(piece, move[0], move[1]));
}

function calculatePawnMoves(piece, row, col) {
  const direction = piece === '\u2659' ? -1 : 1;
  const moves = [];
  const nextRow = row + direction;

  if (isValidMove(nextRow, col) && !isSquareOccupied(nextRow, col)) {
    moves.push([nextRow, col]);
  }

  if ((piece === '\u2659' && row === 6) || (piece === '\u265F' && row === 1)) {
    if (isValidMove(row + 2 * direction, col) && !isSquareOccupied(nextRow, col) && !isSquareOccupied(row + 2 * direction, col)) {
      moves.push([row + 2 * direction, col]);
    }
  }

  if (isValidMove(nextRow, col - 1) && isOpponentPiece(piece, nextRow, col - 1)) {
    moves.push([nextRow, col - 1]);
  }
  if (isValidMove(nextRow, col + 1) && isOpponentPiece(piece, nextRow, col + 1)) {
    moves.push([nextRow, col + 1]);
  }

  return moves;
}

function calculateRookMoves(row, col) {
  const moves = [];

  for (let i = row - 1; i >= 0; i--) {
    if (isSquareOccupied(i, col)) {
      if (isOpponentPiece(initialBoard[row][col], i, col)) moves.push([i, col]);
      break;
    }
    moves.push([i, col]);
  }

  for (let i = row + 1; i < 8; i++) {
    if (isSquareOccupied(i, col)) {
      if (isOpponentPiece(initialBoard[row][col], i, col)) moves.push([i, col]);
      break;
    }
    moves.push([i, col]);
  }

  for (let i = col - 1; i >= 0; i--) {
    if (isSquareOccupied(row, i)) {
      if (isOpponentPiece(initialBoard[row][col], row, i)) moves.push([row, i]);
      break;
    }
    moves.push([row, i]);
  }

  for (let i = col + 1; i < 8; i++) {
    if (isSquareOccupied(row, i)) {
      if (isOpponentPiece(initialBoard[row][col], row, i)) moves.push([row, i]);
      break;
    }
    moves.push([row, i]);
  }

  return moves;
}

function calculateKnightMoves(row, col) {
  const moves = [
    [row - 2, col - 1],
    [row - 2, col + 1],
    [row + 2, col - 1],
    [row + 2, col + 1],
    [row - 1, col - 2],
    [row - 1, col + 2],
    [row + 1, col - 2],
    [row + 1, col + 2]
  ];

  return moves.filter(move => isValidMove(move[0], move[1]));
}

function calculateBishopMoves(row, col) {
  const moves = [];

  for (let i = 1; i < 8; i++) {
    if (!isValidMove(row - i, col - i)) break;
    if (isSquareOccupied(row - i, col - i)) {
      if (isOpponentPiece(initialBoard[row][col], row - i, col - i)) moves.push([row - i, col - i]);
      break;
    }
    moves.push([row - i, col - i]);
  }

  for (let i = 1; i < 8; i++) {
    if (!isValidMove(row - i, col + i)) break;
    if (isSquareOccupied(row - i, col + i)) {
      if (isOpponentPiece(initialBoard[row][col], row - i, col + i)) moves.push([row - i, col + i]);
      break;
    }
    moves.push([row - i, col + i]);
  }

  for (let i = 1; i < 8; i++) {
    if (!isValidMove(row + i, col - i)) break;
    if (isSquareOccupied(row + i, col - i)) {
      if (isOpponentPiece(initialBoard[row][col], row + i, col - i)) moves.push([row + i, col - i]);
      break;
    }
    moves.push([row + i, col - i]);
  }

  for (let i = 1; i < 8; i++) {
    if (!isValidMove(row + i, col + i)) break;
    if (isSquareOccupied(row + i, col + i)) {
      if (isOpponentPiece(initialBoard[row][col], row + i, col + i)) moves.push([row + i, col + i]);
      break;
    }
    moves.push([row + i, col + i]);
  }

  return moves;
}

function calculateQueenMoves(row, col) {
  return calculateRookMoves(row, col).concat(calculateBishopMoves(row, col));
}

function calculateKingMoves(row, col) {
  const moves = [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
    [row - 1, col - 1],
    [row - 1, col + 1],
    [row + 1, col - 1],
    [row + 1, col + 1]
  ];

  return moves.filter(move => isValidMove(move[0], move[1]));
}

function isValidMove(row, col) {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function highlightValidMoves(moves) {
  moves.forEach(move => {
    const square = document.querySelector(`[data-row="${move[0]}"][data-col="${move[1]}"]`);
    if (square) {
      square.style.backgroundColor = '#ffeb3b';
    }
  });
}

function clearHighlights() {
  document.querySelectorAll('.square').forEach((square, index) => {
    const row = Math.floor(index / 8);
    const col = index % 8;
    square.style.backgroundColor = originalColors[row][col];
  });
}

function switchTurn() {
  currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
}


const audio = document.getElementById("background-music");
const musicIcon = document.getElementById("music-icon");

function toggleMusic() {
  if (audio.paused) {
    audio.play();
    musicIcon.src = 'up.png'; 
  } else {
    audio.pause();
    musicIcon.src = 'mute.png'; 
  }
}

window.onload = function() {
  audio.play();
};
