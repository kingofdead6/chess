let currentPlayer = 'white';
let selectedPiece = null;
let validMoves = [];

// Store original colors
const originalColors = [];

// Define the initial positions of chess pieces using a 2D array
const initialBoard = [
  ['\u265C', '\u265E', '\u265D', '\u265B', '\u265A', '\u265D', '\u265E', '\u265C'], // Black pieces (row 0)
  ['\u265F', '\u265F', '\u265F', '\u265F', '\u265F', '\u265F', '\u265F', '\u265F'], // Black pawns (row 1)
  ['', '', '', '', '', '', '', ''], // Empty row (row 2)
  ['', '', '', '', '', '', '', ''], // Empty row (row 3)
  ['', '', '', '', '', '', '', ''], // Empty row (row 4)
  ['', '', '', '', '', '', '', ''], // Empty row (row 5)
  ['\u2659', '\u2659', '\u2659', '\u2659', '\u2659', '\u2659', '\u2659', '\u2659'], // White pawns (row 6)
  ['\u2656', '\u2658', '\u2657', '\u2655', '\u2654', '\u2657', '\u2658', '\u2656']  // White pieces (row 7)
];

// Create the chessboard (8x8 grid)
for (let row = 0; row < 8; row++) {
  originalColors[row] = []; // Initialize each row
  for (let col = 0; col < 8; col++) {
    const square = document.createElement('div');
    square.classList.add('square');
    square.dataset.row = row;
    square.dataset.col = col;

    // Set colors for the squares
    if ((row + col) % 2 === 0) {
      square.style.backgroundColor = '#a1d4f8';  // Light square
      originalColors[row][col] = '#a1d4f8';       // Store original color
    } else {
      square.style.backgroundColor = '#143fe9';  // Dark square
      originalColors[row][col] = '#143fe9';      // Store original color
    }

    const piece = initialBoard[row][col];
    if (piece) {
      square.textContent = piece;  // Add the piece to the square
      square.style.color = row < 2 ? 'black' : 'white';  // Black pieces on top, white on bottom
    }

    // Add click event listener to each square
    square.addEventListener('click', () => {
      handleSquareClick(row, col);
    });

    chessboard.appendChild(square);
  }
}

// Handle click on a square
function handleSquareClick(row, col) {
  const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  const piece = square.textContent; // Get the piece from the square

  if (!selectedPiece && piece && isCurrentPlayerPiece(piece)) {
    selectedPiece = { piece, row, col };
    validMoves = calculateValidMoves(piece, row, col); // Get valid moves based on the piece type
    highlightValidMoves(validMoves); // Highlight valid moves
  } else if (selectedPiece) {
    // Check if the clicked square is a valid move
    const move = validMoves.find(move => move[0] === row && move[1] === col);
    if (move) {
      // Move the piece
      movePiece(selectedPiece.row, selectedPiece.col, row, col);
      clearHighlights();
      selectedPiece = null; // Deselect the piece
      switchTurn(); // Switch turns
    } else {
      clearHighlights(); // Clear previous highlights
      selectedPiece = null; // Deselect the piece
    }
  }
}

// Check if the piece belongs to the current player
function isCurrentPlayerPiece(piece) {
  const isWhite = piece >= '\u2654' && piece <= '\u2659'; // White pieces Unicode range
  return (currentPlayer === 'white' && isWhite) || (currentPlayer === 'black' && !isWhite);
}

function movePiece(fromRow, fromCol, toRow, toCol) {
    const fromSquare = document.querySelector(`[data-row="${fromRow}"][data-col="${fromCol}"]`);
    const toSquare = document.querySelector(`[data-row="${toRow}"][data-col="${toCol}"]`);
    
    if (fromSquare && toSquare) {
      toSquare.textContent = selectedPiece.piece; // Move piece to new square
      toSquare.style.color = currentPlayer === 'white' ? 'white' : 'black'; // Set color based on player
      fromSquare.textContent = ''; // Clear the original square
  
      // Update the initialBoard state (optional if needed)
      initialBoard[toRow][toCol] = selectedPiece.piece;  // Update new position
      initialBoard[fromRow][fromCol] = ''; // Clear old position
    }
    if ((selectedPiece.piece === '\u2659' && toRow === 0) || (selectedPiece.piece === '\u265F' && toRow === 7)) {
        // Promote to queen
        const queen = currentPlayer === 'white' ? '\u2655' : '\u265B'; // Set queen based on player
        toSquare.textContent = queen; // Update square to queen
        initialBoard[toRow][toCol] = queen; // Update the board state
      }
}  

// Check if a square is occupied by any piece
function isSquareOccupied(row, col) {
  const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  return square && square.textContent !== '';
}

// Check if a square is occupied by an opponent's piece
function isOpponentPiece(piece, row, col) {
  const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  const targetPiece = square.textContent;

  if (!targetPiece) return false; // If the square is empty, return false

  const isWhite = (piece >= '\u2654' && piece <= '\u2659'); // White pieces Unicode range
  const isTargetWhite = (targetPiece >= '\u2654' && targetPiece <= '\u2659'); // Target is white piece

  return isWhite !== isTargetWhite; // Return true if it's an opponent's piece
}

// Add valid move calculations for all pieces
function calculateValidMoves(piece, row, col) {
  let moves = [];
  
  switch (piece) {
    case '\u2659': // White Pawn
    case '\u265F': // Black Pawn
      moves = calculatePawnMoves(piece, row, col);
      break;
    case '\u2656': // White Rook
    case '\u265C': // Black Rook
      moves = calculateRookMoves(row, col);
      break;
    case '\u2658': // White Knight
    case '\u265E': // Black Knight
      moves = calculateKnightMoves(row, col);
      break;
    case '\u2657': // White Bishop
    case '\u265D': // Black Bishop
      moves = calculateBishopMoves(row, col);
      break;
    case '\u2655': // White Queen
    case '\u265B': // Black Queen
      moves = calculateQueenMoves(row, col);
      break;
    case '\u2654': // White King
    case '\u265A': // Black King
      moves = calculateKingMoves(row, col);
      break;
  }

  return moves.filter(move => !isSquareOccupied(move[0], move[1]) || isOpponentPiece(piece, move[0], move[1]));

}

// Calculate valid moves for pawns
function calculatePawnMoves(piece, row, col) {
  const direction = piece === '\u2659' ? -1 : 1; // White moves up, black moves down
  const moves = [];
  const nextRow = row + direction;

  // Move forward one square if it's empty
  if (isValidMove(nextRow, col) && !isSquareOccupied(nextRow, col)) {
    moves.push([nextRow, col]);
  }

  // Move forward two squares if it's the pawn's first move and both squares are empty
  if ((piece === '\u2659' && row === 6) || (piece === '\u265F' && row === 1)) {
    if (isValidMove(row + 2 * direction, col) && !isSquareOccupied(nextRow, col) && !isSquareOccupied(row + 2 * direction, col)) {
      moves.push([row + 2 * direction, col]);
    }
  }

  // Capture diagonally
  if (isValidMove(nextRow, col - 1) && isOpponentPiece(piece, nextRow, col - 1)) {
    moves.push([nextRow, col - 1]);
  }
  if (isValidMove(nextRow, col + 1) && isOpponentPiece(piece, nextRow, col + 1)) {
    moves.push([nextRow, col + 1]);
  }

  return moves;
}

// Calculate valid moves for rooks
function calculateRookMoves(row, col) {
    const moves = [];
    
    // Up direction
    for (let i = row - 1; i >= 0; i--) {
      if (isSquareOccupied(i, col)) {
        if (isOpponentPiece(initialBoard[row][col], i, col)) moves.push([i, col]); // Capture opponent
        break; // Stop if a piece is blocking
      }
      moves.push([i, col]);
    }
  
    // Down direction
    for (let i = row + 1; i < 8; i++) {
      if (isSquareOccupied(i, col)) {
        if (isOpponentPiece(initialBoard[row][col], i, col)) moves.push([i, col]);
        break;
      }
      moves.push([i, col]);
    }
  
    // Left direction
    for (let i = col - 1; i >= 0; i--) {
      if (isSquareOccupied(row, i)) {
        if (isOpponentPiece(initialBoard[row][col], row, i)) moves.push([row, i]);
        break;
      }
      moves.push([row, i]);
    }
  
    // Right direction
    for (let i = col + 1; i < 8; i++) {
      if (isSquareOccupied(row, i)) {
        if (isOpponentPiece(initialBoard[row][col], row, i)) moves.push([row, i]);
        break;
      }
      moves.push([row, i]);
    }
    
    return moves;
  }
  

// Calculate valid moves for bishops
function calculateBishopMoves(row, col) {
    const moves = [];
    
    // Up-Right
    for (let i = 1; row - i >= 0 && col + i < 8; i++) {
      if (isSquareOccupied(row - i, col + i)) {
        if (isOpponentPiece(initialBoard[row][col], row - i, col + i)) moves.push([row - i, col + i]);
        break;
      }
      moves.push([row - i, col + i]);
    }
  
    // Up-Left
    for (let i = 1; row - i >= 0 && col - i >= 0; i++) {
      if (isSquareOccupied(row - i, col - i)) {
        if (isOpponentPiece(initialBoard[row][col], row - i, col - i)) moves.push([row - i, col - i]);
        break;
      }
      moves.push([row - i, col - i]);
    }
  
    // Down-Right
    for (let i = 1; row + i < 8 && col + i < 8; i++) {
      if (isSquareOccupied(row + i, col + i)) {
        if (isOpponentPiece(initialBoard[row][col], row + i, col + i)) moves.push([row + i, col + i]);
        break;
      }
      moves.push([row + i, col + i]);
    }
  
    // Down-Left
    for (let i = 1; row + i < 8 && col - i >= 0; i++) {
      if (isSquareOccupied(row + i, col - i)) {
        if (isOpponentPiece(initialBoard[row][col], row + i, col - i)) moves.push([row + i, col - i]);
        break;
      }
      moves.push([row + i, col - i]);
    }
  
    return moves;
  }
  

// Calculate valid moves for queens (combination of rook and bishop)
function calculateQueenMoves(row, col) {
  return [...calculateRookMoves(row, col), ...calculateBishopMoves(row, col)];
}

// Calculate valid moves for knights
function calculateKnightMoves(row, col) {
    const moves = [];
    const knightMoves = [
      [row - 2, col - 1], [row - 2, col + 1],
      [row + 2, col - 1], [row + 2, col + 1],
      [row - 1, col - 2], [row - 1, col + 2],
      [row + 1, col - 2], [row + 1, col + 2]
    ];
  
    knightMoves.forEach(([r, c]) => {
      if (isValidMove(r, c) && (!isSquareOccupied(r, c) || isOpponentPiece(initialBoard[row][col], r, c))) {
        moves.push([r, c]);
      }
    });
  
    return moves;
  }
  

// Calculate valid moves for kings
function calculateKingMoves(row, col) {
    const moves = [];
    const kingMoves = [
      [row - 1, col], [row + 1, col],
      [row, col - 1], [row, col + 1],
      [row - 1, col - 1], [row - 1, col + 1],
      [row + 1, col - 1], [row + 1, col + 1]
    ];
  
    kingMoves.forEach(([r, c]) => {
      if (isValidMove(r, c) && (!isSquareOccupied(r, c) || isOpponentPiece(initialBoard[row][col], r, c))) {
        moves.push([r, c]);
      }
    });
  
    return moves;
  }
  
  function isKingInCheck(player) {
    const kingPosition = findKingPosition(player);
    const opponentPieces = player === 'white' ? ['\u265C', '\u265E', '\u265D', '\u265B', '\u265A', '\u265F'] : ['\u2656', '\u2658', '\u2657', '\u2655', '\u2654', '\u2659'];
  
    for (const piece of opponentPieces) {
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          if (initialBoard[row][col] === piece) {
            const moves = calculateValidMoves(piece, row, col);
            if (moves.some(move => move[0] === kingPosition.row && move[1] === kingPosition.col)) {
              return true; // King is in check
            }
          }
        }
      }
    }
    return false; // King is not in check
  }
  
  function findKingPosition(player) {
    const kingSymbol = player === 'white' ? '\u2654' : '\u265A';
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (initialBoard[row][col] === kingSymbol) {
          return { row, col };
        }
      }
    }
    return null; // King not found (should not happen)
  }
  
  function isCheckmate() {
    if (!isKingInCheck(currentPlayer)) {
      return false; // If the king is not in check, it's not checkmate
    }
  
    // Check if there are any legal moves left for the current player
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = initialBoard[row][col];
        if (isCurrentPlayerPiece(piece)) {
          const moves = calculateValidMoves(piece, row, col);
          for (const move of moves) {
            const originalSquare = initialBoard[move[0]][move[1]]; // Store original square
            initialBoard[move[0]][move[1]] = piece; // Move the piece temporarily
            initialBoard[row][col] = ''; // Clear the original position
  
            // Check if the move puts the king in check
            if (!isKingInCheck(currentPlayer)) {
              initialBoard[move[0]][move[1]] = originalSquare; // Restore the original square
              initialBoard[row][col] = piece; // Restore the piece
              return false; // There is a legal move available
            }
  
            // Restore the board state
            initialBoard[move[0]][move[1]] = originalSquare;
            initialBoard[row][col] = piece;
          }
        }
      }
    }
  
    return true; // No legal moves left, checkmate
  }
  
// Validate if the row and column are within the board boundaries
function isValidMove(row, col) {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

// Highlight valid moves on the board
function highlightValidMoves(moves) {
  moves.forEach(([row, col]) => {
    const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    square.style.backgroundColor = 'yellow'; // Highlight valid moves
  });
}

// Clear highlights from the board
function clearHighlights() {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      square.style.backgroundColor = originalColors[row][col]; // Restore original color
    }
  }
}

// Switch turns between players
function switchTurn() {
  currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
}

