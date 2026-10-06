// "Crazy Chekers" - Core Engine with Rebalanced 1-Use Doomsday Button

export const INITIAL_ROWS = 8;
export const INITIAL_COLS = 8;

export function createInitialBoard(rows = INITIAL_ROWS, cols = INITIAL_COLS) {
  const board = [];
  let pieceIdCounter = 1;

  for (let r = 0; r < rows; r++) {
    const rowArray = [];
    for (let c = 0; c < cols; c++) {
      const isPlayable = (r + c) % 2 === 1;
      let piece = null;

      if (isPlayable) {
        if (r < 3) {
          piece = {
            id: `red_${pieceIdCounter++}`,
            player: 'red',
            isKing: false,
            type: 'checker',
            isInvincible: 0,
            isDistracted: 0,
          };
        } else if (r >= rows - 3) {
          piece = {
            id: `blue_${pieceIdCounter++}`,
            player: 'blue',
            isKing: false,
            type: 'checker',
            isInvincible: 0,
            isDistracted: 0,
          };
        }
      }

      rowArray.push({
        row: r,
        col: c,
        isPlayable,
        piece,
        irradiatedTurns: 0,
        isMine: false,
        isBrothel: false,
      });
    }
    board.push(rowArray);
  }

  return board;
}

export function createInitialState() {
  return {
    rows: INITIAL_ROWS,
    cols: INITIAL_COLS,
    board: createInitialBoard(INITIAL_ROWS, INITIAL_COLS),
    turn: 'blue',
    scores: { red: 60, blue: 60 },
    inventory: {
      red: { nuke: 1, ufo: 2, strike: 2, shield: 2, brothel: 1 },
      blue: { nuke: 1, ufo: 2, strike: 2, shield: 2, brothel: 1 },
    },
    activeAbility: null,
    pendingSpawnUnit: null,
    selectedTile: null,
    validMoves: [],
    comboPiece: null,
    gameMode: 'pvp',
    onlineRole: null,
    roomId: null,
    winner: null,
    combatLog: [
      { id: Date.now(), text: '🔥 CRAZY CHEKERS READY!', type: 'system' }
    ],
    screenShake: false,
    isWhiteScreenActive: false,
    isBoardSplit: false,
    isDoomsdayUsed: false, // LIMIT 1 USE PER GAME TOTAL!
    lastEvent: null,
    isLootboxOpen: false,
  };
}

export function cloneBoard(board) {
  return board.map(row =>
    row.map(tile => ({
      ...tile,
      piece: tile.piece ? { ...tile.piece } : null,
    }))
  );
}

// RED DOOMSDAY BUTTON: 1-USE PER GAME, REBALANCED 45% DESTRUCTION
export function executeDoomsdayWhiteDemon(state) {
  if (state.isDoomsdayUsed) return state; // Only 1 use per game total!

  const newBoard = cloneBoard(state.board);
  const player = state.turn;
  let piecesToAnnihilate = [];

  newBoard.forEach(row => {
    row.forEach(tile => {
      if (tile.piece && tile.piece.isInvincible === 0) {
        piecesToAnnihilate.push(tile);
      }
    });
  });

  // Rebalanced: Destroy 45% of units
  const destroyCount = Math.floor(piecesToAnnihilate.length * 0.45);
  for (let i = 0; i < destroyCount; i++) {
    if (piecesToAnnihilate.length > 0) {
      const randIdx = Math.floor(Math.random() * piecesToAnnihilate.length);
      piecesToAnnihilate[randIdx].piece = null;
      piecesToAnnihilate.splice(randIdx, 1);
    }
  }

  return {
    ...state,
    board: newBoard,
    screenShake: true,
    isWhiteScreenActive: true,
    isBoardSplit: true,
    isDoomsdayUsed: true, // Mark as used for whole game
    activeAbility: null,
    turn: state.turn === 'red' ? 'blue' : 'red',
    combatLog: [
      { id: Date.now(), text: `🚨 APOKALIPSA! ${player === 'red' ? '🔴 CZERWONY' : '🔵 NIEBIESKI'} UŻYŁ JEDYNEGO GUZIKA DOOMSDAY!`, type: 'nuke' },
      ...state.combatLog,
    ],
    lastEvent: { type: 'demon_doomsday' },
  };
}

export function addClickerCash(state, amount = 1) {
  const player = state.turn;
  const newScores = {
    ...state.scores,
    [player]: state.scores[player] + amount,
  };
  return {
    ...state,
    scores: newScores,
  };
}

export function getLegalMovesForPlayer(board, player, rows, cols, comboPiece = null) {
  let allCaptures = [];
  let allNormalMoves = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tile = board[r][c];
      if (tile.piece && tile.piece.player === player) {
        if (tile.piece.isDistracted > 0) continue;

        if (comboPiece && (r !== comboPiece.r || c !== comboPiece.c)) {
          continue;
        }

        const moves = getMovesForPiece(board, r, c, rows, cols, comboPiece !== null);
        moves.captures.forEach(m => allCaptures.push(m));
        if (!comboPiece) {
          moves.normals.forEach(m => allNormalMoves.push(m));
        }
      }
    }
  }

  if (allCaptures.length > 0) {
    return { capturesOnly: true, moves: allCaptures };
  }
  return { capturesOnly: false, moves: allNormalMoves };
}

export function getMovesForPiece(board, r, c, rows, cols, isCombo = false) {
  const tile = board[r][c];
  if (!tile || !tile.piece) return { normals: [], captures: [] };

  const piece = tile.piece;
  const isKing = piece.isKing;
  const player = piece.player;
  const normals = [];
  const captures = [];

  if (piece.type === 'demon') {
    for (let nr = 0; nr < rows; nr++) {
      for (let nc = 0; nc < cols; nc++) {
        if ((nr + nc) % 2 === 1) {
          const target = board[nr][nc];
          if (!target.piece) {
            normals.push({ fromR: r, fromC: c, toR: nr, toC: nc, jumped: null });
          } else if (target.piece.player !== player && target.piece.isInvincible === 0) {
            captures.push({
              fromR: r, fromC: c, toR: nr, toC: nc,
              jumped: { r: nr, c: nc, piece: target.piece, isFriendly: false }
            });
          }
        }
      }
    }
    return { normals, captures };
  }

  if (piece.type === 'knight') {
    const knightOffsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    for (const [dr, dc] of knightOffsets) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        const target = board[nr][nc];
        if (!target.piece && target.irradiatedTurns === 0) {
          normals.push({ fromR: r, fromC: c, toR: nr, toC: nc, jumped: null });
        } else if (target.piece && target.piece.player !== player && target.piece.isInvincible === 0) {
          captures.push({
            fromR: r, fromC: c, toR: nr, toC: nc,
            jumped: { r: nr, c: nc, piece: target.piece, isFriendly: false }
          });
        }
      }
    }
    return { normals, captures };
  }

  let dirs = [];
  if (piece.type === 'rook') dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  else if (piece.type === 'bishop') dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  else if (piece.type === 'queen') dirs = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];

  if (dirs.length > 0) {
    for (const [dr, dc] of dirs) {
      let step = 1;
      while (true) {
        const nr = r + dr * step;
        const nc = c + dc * step;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) break;
        const target = board[nr][nc];
        if (target.piece) {
          if (target.piece.player !== player && target.piece.isInvincible === 0) {
            captures.push({
              fromR: r, fromC: c, toR: nr, toC: nc,
              jumped: { r: nr, c: nc, piece: target.piece, isFriendly: false }
            });
          }
          break;
        } else {
          if (target.irradiatedTurns === 0) {
            normals.push({ fromR: r, fromC: c, toR: nr, toC: nc, jumped: null });
          }
        }
        step++;
      }
    }
    return { normals, captures };
  }

  const directions = isKing
    ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
    : player === 'red'
      ? [[1, -1], [1, 1], [-1, -1], [-1, 1]]
      : [[-1, -1], [-1, 1], [1, -1], [1, 1]];

  if (!isKing) {
    const forwardDirs = player === 'red' ? [[1, -1], [1, 1]] : [[-1, -1], [-1, 1]];

    if (!isCombo) {
      for (const [dr, dc] of forwardDirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          const target = board[nr][nc];
          if (target.isPlayable && !target.piece && target.irradiatedTurns === 0) {
            normals.push({ fromR: r, fromC: c, toR: nr, toC: nc, jumped: null });
          }
        }
      }
    }

    for (const [dr, dc] of directions) {
      const midR = r + dr;
      const midC = c + dc;
      const landR = r + dr * 2;
      const landC = c + dc * 2;

      if (landR >= 0 && landR < rows && landC >= 0 && landC < cols) {
        const midTile = board[midR][midC];
        const landTile = board[landR][landC];

        if (midTile && midTile.piece && landTile && landTile.isPlayable && !landTile.piece && landTile.irradiatedTurns === 0) {
          if (midTile.piece.isInvincible > 0) continue;

          const isEnemy = midTile.piece.player !== player;
          const isFriendlyFire = isCombo && midTile.piece.player === player;

          if (isEnemy || isFriendlyFire) {
            captures.push({
              fromR: r,
              fromC: c,
              toR: landR,
              toC: landC,
              jumped: { r: midR, c: midC, piece: midTile.piece, isFriendly: isFriendlyFire },
            });
          }
        }
      }
    }
  } else {
    for (const [dr, dc] of directions) {
      let step = 1;
      let encounteredPiece = null;

      while (true) {
        const nr = r + dr * step;
        const nc = c + dc * step;

        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) break;
        const currentTile = board[nr][nc];
        if (!currentTile.isPlayable) break;

        if (currentTile.piece) {
          if (encounteredPiece) break;
          if (currentTile.piece.isInvincible > 0) break;
          const isEnemy = currentTile.piece.player !== player;
          const isFriendlyFire = isCombo && currentTile.piece.player === player;

          if (isEnemy || isFriendlyFire) {
            encounteredPiece = { r: nr, c: nc, piece: currentTile.piece, isFriendly: isFriendlyFire };
          } else {
            break;
          }
        } else {
          if (currentTile.irradiatedTurns === 0) {
            if (!encounteredPiece && !isCombo) {
              normals.push({ fromR: r, fromC: c, toR: nr, toC: nc, jumped: null });
            } else if (encounteredPiece) {
              captures.push({
                fromR: r,
                fromC: c,
                toR: nr,
                toC: nc,
                jumped: encounteredPiece,
              });
            }
          }
        }
        step++;
      }
    }
  }

  return { normals, captures };
}

export function executeMove(state, move) {
  const { fromR, fromC, toR, toC, jumped } = move;
  const newBoard = cloneBoard(state.board);
  const movingPiece = { ...newBoard[fromR][fromC].piece };

  newBoard[fromR][fromC].piece = null;

  let pointsEarned = 0;
  let eventText = null;
  let isFriendlyFireExplosion = false;
  let steppedOnMine = false;

  if (jumped) {
    const jumpedTile = newBoard[jumped.r][jumped.c];
    if (jumpedTile.piece) {
      if (jumped.piece.type === 'golden_pawn') pointsEarned += 100;
      if (jumped.isFriendly) {
        isFriendlyFireExplosion = true;
        eventText = `💥 FRIENDLY FIRE! ${movingPiece.player === 'red' ? 'Czerwony' : 'Niebieski'} poświęcił własnego pionka w combo!`;
      } else {
        pointsEarned += 25;
        eventText = `⚔️ ${movingPiece.player === 'red' ? 'Czerwony' : 'Niebieski'} zbił pionka (+25 $ PKT)!`;
      }
      jumpedTile.piece = null;
    }
  }

  const promotionRow = movingPiece.player === 'red' ? state.rows - 1 : 0;
  let promoted = false;
  if (!movingPiece.isKing && toR === promotionRow && movingPiece.type === 'checker') {
    movingPiece.isKing = true;
    promoted = true;
    pointsEarned += 50;
    eventText = `👑 ${movingPiece.player === 'red' ? 'Czerwony' : 'Niebieski'} awansuje na KRÓLOWĄ/DAMKĘ (+50 $ PKT)!`;
  }

  const landingTile = newBoard[toR][toC];
  if (landingTile.isMine && movingPiece.isInvincible === 0) {
    steppedOnMine = true;
    landingTile.isMine = false;
    landingTile.piece = null;
    eventText = `💣 BUM! ${movingPiece.player === 'red' ? 'Czerwony' : 'Niebieski'} wdepnął na MINĘ!`;
  } else {
    landingTile.piece = movingPiece;
  }

  const newScores = {
    ...state.scores,
    [state.turn]: state.scores[state.turn] + pointsEarned,
  };

  let nextComboPiece = null;
  if (jumped && !steppedOnMine && !promoted && movingPiece.type === 'checker') {
    const nextMoves = getMovesForPiece(newBoard, toR, toC, state.rows, state.cols, true);
    if (nextMoves.captures.length > 0) {
      nextComboPiece = { r: toR, c: toC };
    }
  }

  let nextTurn = state.turn;
  if (!nextComboPiece) {
    nextTurn = state.turn === 'red' ? 'blue' : 'red';
    decrementTurnStatuses(newBoard);
  }

  const logEntry = eventText ? { id: Date.now() + Math.random(), text: eventText, type: 'action' } : null;

  return {
    ...state,
    board: newBoard,
    turn: nextTurn,
    scores: newScores,
    selectedTile: null,
    validMoves: [],
    comboPiece: nextComboPiece,
    combatLog: logEntry ? [logEntry, ...state.combatLog] : state.combatLog,
    lastEvent: {
      type: steppedOnMine ? 'mine' : isFriendlyFireExplosion ? 'friendly' : jumped ? 'capture' : 'move',
      r: toR,
      c: toC,
      promoted,
    },
  };
}

function decrementTurnStatuses(board) {
  board.forEach(row => {
    row.forEach(tile => {
      if (tile.irradiatedTurns > 0) tile.irradiatedTurns -= 1;
      if (tile.piece) {
        if (tile.piece.isInvincible > 0) tile.piece.isInvincible -= 1;
        if (tile.piece.isDistracted > 0) tile.piece.isDistracted -= 1;
      }
      if (tile.isBrothel) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const tr = tile.row + dr;
            const tc = tile.col + dc;
            if (tr >= 0 && tr < board.length && tc >= 0 && tc < board[0].length) {
              const target = board[tr][tc];
              if (target.piece && target.piece.isInvincible === 0) {
                target.piece.isDistracted = 2;
              }
            }
          }
        }
      }
    });
  });
}

export function buyPawnFromShop(state, pawnType, cost) {
  const player = state.turn;
  if (state.scores[player] < cost) return state;

  const unitNames = {
    checker: 'ZWYKŁY PIONEK',
    golden_pawn: 'ZŁOTY PIONEK',
    knight: 'SKOCZEK SZACHOWY',
  };

  const newScores = {
    ...state.scores,
    [player]: state.scores[player] - cost,
  };

  return {
    ...state,
    scores: newScores,
    activeAbility: 'place_unit',
    pendingSpawnUnit: { id: pawnType, name: unitNames[pawnType] || 'PIONEK' },
    combatLog: [
      { id: Date.now(), text: `🛒 KUPIONO ${unitNames[pawnType]} (-${cost} $ PKT)!`, type: 'action' },
      ...state.combatLog,
    ],
  };
}

export function executeShieldAbility(state, targetR, targetC) {
  const newBoard = cloneBoard(state.board);
  const targetTile = newBoard[targetR][targetC];
  const player = state.turn;

  if (!targetTile.piece || targetTile.piece.player !== player) return state;

  targetTile.piece.isInvincible = 3;

  const newInventory = {
    ...state.inventory,
    [player]: { ...state.inventory[player], shield: state.inventory[player].shield - 1 },
  };

  decrementTurnStatuses(newBoard);

  return {
    ...state,
    board: newBoard,
    inventory: newInventory,
    activeAbility: null,
    turn: state.turn === 'red' ? 'blue' : 'red',
    combatLog: [{ id: Date.now(), text: `🛡️ TARCZA NIEZNISZCZALNOŚCI nałożona na Twoją figurę!`, type: 'action' }, ...state.combatLog],
    lastEvent: { type: 'shield', r: targetR, c: targetC },
  };
}

export function executePlaceSpawnedUnit(state, targetR, targetC) {
  const newBoard = cloneBoard(state.board);
  const targetTile = newBoard[targetR][targetC];
  const player = state.turn;
  const unitToPlace = state.pendingSpawnUnit;

  if (!unitToPlace || targetTile.piece || !targetTile.isPlayable) return state;

  targetTile.piece = {
    id: `spawn_${Date.now()}`,
    player,
    isKing: unitToPlace.id === 'queen',
    type: unitToPlace.id,
    isInvincible: 0,
    isDistracted: 0,
  };

  let logText = `🎁 POSTAWIONO FIGURĘ ${unitToPlace.name} NA (${targetR+1}, ${targetC+1})!`;
  let screenShake = false;

  if (unitToPlace.id === 'demon') {
    const enemyPlayer = player === 'red' ? 'blue' : 'red';
    let enemyPieces = [];

    newBoard.forEach(row => {
      row.forEach(tile => {
        if (tile.piece && tile.piece.player === enemyPlayer && tile.piece.isInvincible === 0) {
          enemyPieces.push(tile);
        }
      });
    });

    const destroyCount = Math.ceil(enemyPieces.length / 2);
    for (let i = 0; i < destroyCount; i++) {
      if (enemyPieces.length > 0) {
        const randIdx = Math.floor(Math.random() * enemyPieces.length);
        enemyPieces[randIdx].piece = null;
        enemyPieces.splice(randIdx, 1);
      }
    }

    logText = `👹 DEMON CHAOSU PRZYZWANY! Zniszczono ${destroyCount} wrogich pionków w eksplozji piekieł!`;
    screenShake = true;
  }

  decrementTurnStatuses(newBoard);

  return {
    ...state,
    board: newBoard,
    activeAbility: null,
    pendingSpawnUnit: null,
    turn: state.turn === 'red' ? 'blue' : 'red',
    combatLog: [{ id: Date.now(), text: logText, type: 'nuke' }, ...state.combatLog],
    screenShake,
    lastEvent: { type: 'nuke', r: targetR, c: targetC },
  };
}

export function executeNukeAbility(state, targetR, targetC) {
  const newBoard = cloneBoard(state.board);
  let destroyedCount = 0;

  for (let r = Math.max(0, targetR - 1); r <= Math.min(state.rows - 1, targetR + 1); r++) {
    for (let c = Math.max(0, targetC - 1); c <= Math.min(state.cols - 1, targetC + 1); c++) {
      const tile = newBoard[r][c];
      if (tile.piece && tile.piece.isInvincible === 0) {
        destroyedCount++;
        tile.piece = null;
      }
      tile.irradiatedTurns = 2;
    }
  }

  const player = state.turn;
  const newScores = { ...state.scores, [player]: state.scores[player] + destroyedCount * 15 };
  const newInventory = {
    ...state.inventory,
    [player]: { ...state.inventory[player], nuke: state.inventory[player].nuke - 1 },
  };

  decrementTurnStatuses(newBoard);

  return {
    ...state,
    board: newBoard,
    scores: newScores,
    inventory: newInventory,
    activeAbility: null,
    turn: state.turn === 'red' ? 'blue' : 'red',
    combatLog: [{ id: Date.now(), text: `☢️ ATAK ATOMOWY! Zniszczono ${destroyedCount} pionków!`, type: 'nuke' }, ...state.combatLog],
    screenShake: true,
    lastEvent: { type: 'nuke', r: targetR, c: targetC },
  };
}

export function executeUFOAbility(state, targetR, targetC) {
  const newBoard = cloneBoard(state.board);
  const targetTile = newBoard[targetR][targetC];
  const player = state.turn;

  if (!targetTile.piece || targetTile.piece.player === player || targetTile.piece.isInvincible > 0) return state;

  targetTile.piece = null;
  const newScores = { ...state.scores, [player]: state.scores[player] + 30 };
  const newInventory = {
    ...state.inventory,
    [player]: { ...state.inventory[player], ufo: state.inventory[player].ufo - 1 },
  };

  decrementTurnStatuses(newBoard);

  return {
    ...state,
    board: newBoard,
    scores: newScores,
    inventory: newInventory,
    activeAbility: null,
    turn: state.turn === 'red' ? 'blue' : 'red',
    combatLog: [{ id: Date.now(), text: `🛸 UFO PORWAŁO PIONKA z (${targetR+1}, ${targetC+1})!`, type: 'ufo' }, ...state.combatLog],
    lastEvent: { type: 'ufo', r: targetR, c: targetC },
  };
}

export function executeStrikeAbility(state, isRow, index) {
  const newBoard = cloneBoard(state.board);
  const player = state.turn;
  let hitTile = null;

  if (isRow) {
    for (let c = 0; c < state.cols; c++) {
      if (newBoard[index][c].piece && newBoard[index][c].piece.isInvincible === 0) {
        hitTile = { r: index, c };
        newBoard[index][c].piece = null;
        break;
      }
    }
  } else {
    for (let r = 0; r < state.rows; r++) {
      if (newBoard[r][index].piece && newBoard[r][index].piece.isInvincible === 0) {
        hitTile = { r, c: index };
        newBoard[r][index].piece = null;
        break;
      }
    }
  }

  const newScores = { ...state.scores, [player]: state.scores[player] + (hitTile ? 25 : 0) };
  const newInventory = {
    ...state.inventory,
    [player]: { ...state.inventory[player], strike: state.inventory[player].strike - 1 },
  };

  decrementTurnStatuses(newBoard);

  return {
    ...state,
    board: newBoard,
    scores: newScores,
    inventory: newInventory,
    activeAbility: null,
    turn: state.turn === 'red' ? 'blue' : 'red',
    combatLog: [{ id: Date.now(), text: `🚀 NALOT RAKIETOWY wysterelony w ${isRow ? 'wiersz' : 'kolumnę'} ${index+1}!`, type: 'strike' }, ...state.combatLog],
    screenShake: hitTile ? true : false,
    lastEvent: { type: 'strike', isRow, index, hitTile },
  };
}

export function executeBrothelAbility(state, targetR, targetC) {
  const newBoard = cloneBoard(state.board);
  const targetTile = newBoard[targetR][targetC];
  const player = state.turn;

  targetTile.isBrothel = true;
  const newInventory = {
    ...state.inventory,
    [player]: { ...state.inventory[player], brothel: state.inventory[player].brothel - 1 },
  };

  decrementTurnStatuses(newBoard);

  return {
    ...state,
    board: newBoard,
    inventory: newInventory,
    activeAbility: null,
    turn: state.turn === 'red' ? 'blue' : 'red',
    combatLog: [{ id: Date.now(), text: `🏠 BURDEL CHAOSU postawiony na (${targetR+1}, ${targetC+1})!`, type: 'action' }, ...state.combatLog],
    lastEvent: { type: 'brothel', r: targetR, c: targetC },
  };
}

export function executeQueenLaser(state, queenR, queenC) {
  const newBoard = cloneBoard(state.board);
  const player = state.turn;
  let vaporized = 0;

  const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  dirs.forEach(([dr, dc]) => {
    let step = 1;
    while (true) {
      const nr = queenR + dr * step;
      const nc = queenC + dc * step;
      if (nr < 0 || nr >= state.rows || nc < 0 || nc >= state.cols) break;
      const tile = newBoard[nr][nc];
      if (tile.piece && tile.piece.player !== player && tile.piece.isInvincible === 0) {
        tile.piece = null;
        vaporized++;
      }
      step++;
    }
  });

  const newScores = { ...state.scores, [player]: state.scores[player] + vaporized * 30 };
  decrementTurnStatuses(newBoard);

  return {
    ...state,
    board: newBoard,
    scores: newScores,
    activeAbility: null,
    turn: state.turn === 'red' ? 'blue' : 'red',
    combatLog: [{ id: Date.now(), text: `⚡ POPIERDOLONY LASER KRÓLOWEJ ewaporował ${vaporized} wrogów!`, type: 'nuke' }, ...state.combatLog],
    screenShake: true,
    lastEvent: { type: 'strike', r: queenR, c: queenC },
  };
}

export function executeQueenTeleport(state, queenR, queenC, targetR, targetC) {
  const newBoard = cloneBoard(state.board);
  const queenTile = newBoard[queenR][queenC];
  const targetTile = newBoard[targetR][targetC];

  if (!queenTile.piece || targetTile.piece || !targetTile.isPlayable) return state;

  targetTile.piece = queenTile.piece;
  queenTile.piece = null;

  decrementTurnStatuses(newBoard);

  return {
    ...state,
    board: newBoard,
    activeAbility: null,
    turn: state.turn === 'red' ? 'blue' : 'red',
    combatLog: [{ id: Date.now(), text: `✨ TELEPORTACJA KRÓLOWEJ na (${targetR+1}, ${targetC+1})!`, type: 'action' }, ...state.combatLog],
    lastEvent: { type: 'move', r: targetR, c: targetC },
  };
}

export function executeExtendBoardAbility(state, position = 'bottom') {
  const player = state.turn;
  const cost = 100;

  if (state.scores[player] < cost) return state;

  const newRows = state.rows + 1;
  const newBoard = [];
  const newRowIndex = position === 'top' ? 0 : state.rows;

  const createdNewRow = [];
  for (let c = 0; c < state.cols; c++) {
    const isPlayable = (newRowIndex + c) % 2 === 1;
    const isMine = isPlayable && Math.random() < 0.35;

    createdNewRow.push({
      row: newRowIndex,
      col: c,
      isPlayable,
      piece: null,
      irradiatedTurns: 0,
      isMine,
      isBrothel: false,
    });
  }

  if (position === 'top') {
    newBoard.push(createdNewRow);
    state.board.forEach((row, rIdx) => {
      newBoard.push(row.map(tile => ({ ...tile, row: rIdx + 1 })));
    });
  } else {
    state.board.forEach(row => newBoard.push([...row]));
    newBoard.push(createdNewRow);
  }

  const newScores = { ...state.scores, [player]: state.scores[player] - cost };

  decrementTurnStatuses(newBoard);

  return {
    ...state,
    rows: newRows,
    board: newBoard,
    scores: newScores,
    activeAbility: null,
    turn: state.turn === 'red' ? 'blue' : 'red',
    combatLog: [{ id: Date.now(), text: `🗺️ POSZERZONO PLANSZĘ! Dodano nowy rząd z minami!`, type: 'extend' }, ...state.combatLog],
    lastEvent: { type: 'extend' },
  };
}

export function checkWinCondition(board, rows, cols, scores = { red: 0, blue: 0 }) {
  return null;
}

export function makeAIMove(state) {
  if (state.turn !== 'red' || state.winner) return state;

  const legal = getLegalMovesForPlayer(state.board, 'red', state.rows, state.cols, state.comboPiece);
  if (legal.moves.length === 0) {
    if (state.scores.red >= 15) {
      return buyPawnFromShop(state, 'checker', 15);
    }
    return state;
  }

  const chosenMove = legal.moves[Math.floor(Math.random() * legal.moves.length)];
  return executeMove(state, chosenMove);
}
