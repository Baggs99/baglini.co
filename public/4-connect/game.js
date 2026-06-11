/* ============================================================
   4 Connect
   ------------------------------------------------------------
   Single-page app organized into:

     - Constants / state
     - Sound module          (Web Audio, no audio files)
     - Board logic           (pure functions on a board array)
     - AI                    (random + smart "win/block/random")
     - Rendering             (board, player cards, overlays)
     - Screen navigation     (main menu / game / settings / how-to-play)
     - Effects               (confetti + stars)
     - Wiring                (event listeners, app boot)

   Mental model:
   - The board is a 2D array: board[row][col]. Row 0 is the TOP.
   - Pieces drop into the lowest empty row in their column.
   - After every move we check win, then draw, then switch turns.
   - In "Vs Computer" mode RED is the human, YELLOW is the AI.
   ============================================================ */

// ----- Board / player constants -----
const ROWS = 6;
const COLS = 7;
const EMPTY = null;
const RED = "red";
const YELLOW = "yellow";

// ----- Mode constants -----
const MODE_PVP = "pvp"; // two human players
const MODE_CPU = "cpu"; // human (RED) vs computer (YELLOW)
const MODE_ONLINE = "online"; // multiplayer over Supabase

// ----- Difficulty constants -----
const DIFFICULTY = {
  EASY:       "easy",       // pure random
  MEDIUM:     "medium",     // take wins, block losses, otherwise random
  HARD:       "hard",       // medium + avoid moves that let opponent win next, prefer center
  IMPOSSIBLE: "impossible", // alpha-beta minimax with position evaluation
};

// Search depth for "Impossible" minimax. Each ply ~= 7x branching factor;
// 5 plies with alpha-beta + center-first ordering completes in well under
// 100ms on a modern phone, comfortably inside our 600ms "thinking" delay.
const MINIMAX_DEPTH = 5;

// ----- Timing constants -----
const DROP_ANIM_MS = 280; // keep in sync with the .cell.dropping animation
const AI_THINK_MS = 0;    // delay before the AI plays. 0 = respond immediately

// ----- DOM references (grabbed once) -----
const boardEl           = document.getElementById("board");
const undoBtn           = document.getElementById("undoBtn");
const resetBtn          = document.getElementById("resetBtn");

const redPlayerCardEl   = document.getElementById("redPlayerCard");
const yellowPlayerCardEl= document.getElementById("yellowPlayerCard");
const redPlayerNameEl   = document.getElementById("redPlayerName");
const yellowPlayerNameEl= document.getElementById("yellowPlayerName");

// Game header & mode toggle
const muteBtn           = document.getElementById("muteBtn");
const gameSettingsBtn   = document.getElementById("gameSettingsBtn");
const modeCpuBtn        = document.getElementById("modeCpuBtn");
const modePvpBtn        = document.getElementById("modePvpBtn");
const modeOnlineBtn     = document.getElementById("modeOnlineBtn");

// Online Setup
const onlineScreen      = document.getElementById("onlineScreen");
const onlineBackBtn     = document.getElementById("onlineBackBtn");
const hostBtn           = document.getElementById("hostBtn");
const joinBtn           = document.getElementById("joinBtn");
const joinCodeInput     = document.getElementById("joinCodeInput");
const onlineStatusOverlay= document.getElementById("onlineStatusOverlay");
const onlineStatusTitle = document.getElementById("onlineStatusTitle");
const roomCodeDisplay   = document.getElementById("roomCodeDisplay");
const copyLinkBtn       = document.getElementById("copyLinkBtn");
const cancelOnlineBtn   = document.getElementById("cancelOnlineBtn");

// Settings & How to Play
const settingsBackBtn   = document.getElementById("settingsBackBtn");
const soundToggle       = document.getElementById("soundToggle");
const undoMoveToggle    = document.getElementById("undoMoveToggle");
const howToPlayLink     = document.getElementById("howToPlayLink");
const howToPlayBackBtn  = document.getElementById("howToPlayBackBtn");
const diffOptionEls     = document.querySelectorAll(".diff-option");

// Overlays
const winOverlayEl      = document.getElementById("winOverlay");
const winTitleEl        = document.getElementById("winTitle");
const winPlayAgainBtn   = document.getElementById("winPlayAgainBtn");
const confettiEl        = document.getElementById("confetti");

const drawOverlayEl     = document.getElementById("drawOverlay");
const drawPlayAgainBtn  = document.getElementById("drawPlayAgainBtn");
const drawStarsEl       = document.getElementById("drawStars");

// ----- Game state -----
// All mutable state lives in this one object. Easy to reset, easy to inspect.
const Game = {
  board: [],            // 2D array of EMPTY | RED | YELLOW
  currentPlayer: RED,   // RED always starts
  isOver: false,
  isAnimating: false,   // true while a piece is mid-drop (locks input)
  lastMove: null,       // { row, col } of most recent drop, or null
  mode: MODE_CPU,       // MODE_PVP | MODE_CPU | MODE_ONLINE
  difficulty: DIFFICULTY.MEDIUM, // AI difficulty (only matters in CPU mode)
  /** CPU mode only: each finished drop { row, col, player } for undo */
  moveHistory: [],
  /** Online mode only */
  onlineRole: null,     // RED (Host) or YELLOW (Guest)
  onlineRoomCode: null, // string
};

/** 1 Player: show "Go back one move" when enabled (default off). */
let undoMoveEnabled = false;

/* ============================================================
   Sound (Web Audio)
   ------------------------------------------------------------
   Generated on the fly so we don't have to ship any audio files.
   The AudioContext is created lazily on the first user gesture,
   because browsers block audio until the user has interacted.
   ============================================================ */
const Sound = {
  ctx: null,
  muted: false,

  init() {
    if (this.ctx) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) this.ctx = new Ctx();
  },

  ensureRunning() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
  },

  beep({ freq = 440, duration = 0.1, type = "sine", volume = 0.2, endFreq = null }) {
    if (this.muted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + duration);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  },

  drop()  { this.ensureRunning(); this.beep({ freq: 280, endFreq: 140, duration: 0.18, type: "square",   volume: 0.18 }); },
  click() { this.ensureRunning(); this.beep({ freq: 600, duration: 0.05, type: "sine",  volume: 0.1 }); },
  win() {
    this.ensureRunning();
    [523, 659, 784, 1047].forEach((freq, i) => {
      setTimeout(() => this.beep({ freq, duration: 0.22, type: "triangle", volume: 0.22 }), i * 110);
    });
  },

  setMuted(muted) {
    this.muted = muted;
    try { localStorage.setItem("connect4-muted", muted ? "1" : "0"); }
    catch (_) { /* private mode - safe to ignore */ }
  },

  loadMuted() {
    try { this.muted = localStorage.getItem("connect4-muted") === "1"; }
    catch (_) { this.muted = false; }
  },
};

/* ============================================================
   Board logic (pure functions - take `board` as a parameter)
   These don't touch DOM or Game state, which is what lets the
   AI safely simulate moves on copies of the board.
   ============================================================ */

function createEmptyBoard() {
  const board = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) row.push(EMPTY);
    board.push(row);
  }
  return board;
}

/**
 * Find the lowest empty row in a column. Returns -1 if the column is full.
 * "Lowest" = largest row index (row 5 is the bottom).
 */
function findLowestEmptyRow(board, col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === EMPTY) return r;
  }
  return -1;
}

/**
 * Win detection.
 * After a piece is placed at (row, col), the only possible new
 * 4-in-a-row MUST pass through that piece. So we only check 4
 * directions starting from (row, col): horizontal, vertical, and
 * the two diagonals. Walk forward and backward in each direction
 * counting matching pieces.
 *
 * Returns the array of 4 winning [row, col] pairs, or null.
 */
function findWinningCells(board, row, col, player) {
  const directions = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal down-right
    [1, -1],  // diagonal down-left
  ];

  for (const [dr, dc] of directions) {
    const line = [[row, col]];

    let r = row + dr, c = col + dc;
    while (inBounds(r, c) && board[r][c] === player) {
      line.push([r, c]);
      r += dr; c += dc;
    }

    r = row - dr; c = col - dc;
    while (inBounds(r, c) && board[r][c] === player) {
      line.unshift([r, c]);
      r -= dr; c -= dc;
    }

    if (line.length >= 4) return line.slice(0, 4);
  }

  return null;
}

function inBounds(r, c) {
  return r >= 0 && r < ROWS && c >= 0 && c < COLS;
}

function isBoardFull(board) {
  return board[0].every((cell) => cell !== EMPTY);
}

/* ============================================================
   AI (computer opponent)
   ------------------------------------------------------------
   Four difficulty levels, each one building on the last:

     easy       -> pickRandomMove        (any valid column)
     medium     -> pickSmartMove         (win/block/random)
     hard       -> pickHardMove          (smart + avoid suicide,
                                          prefer center)
     impossible -> pickMinimaxMove       (alpha-beta minimax with
                                          position evaluation)

   All AIs use the SAME pure helpers (findWinningCells,
   findLowestEmptyRow). That's why we made those helpers take a
   board parameter back in Phase 3 - it's what makes simulating
   hypothetical moves trivial.

   The "mutate then restore" pattern in wouldWin / minimax is safe
   because JS is single-threaded - nothing else can observe the
   board mid-mutation.
   ============================================================ */

// Scoring constants used by the Impossible-mode evaluator.
const SCORE = {
  WIN:                1_000_000,
  THREE_IN_WINDOW:    50,   // 3 of ours + 1 empty in a 4-window
  TWO_IN_WINDOW:      4,    // 2 of ours + 2 empty
  OPP_THREE_IN_WIN:  -80,   // opponent has 3 of theirs in a 4-window
  CENTER_PIECE:       6,    // bonus per piece in the center column
};

const AI = {
  validColumns(board) {
    const cols = [];
    for (let c = 0; c < COLS; c++) {
      if (findLowestEmptyRow(board, c) !== -1) cols.push(c);
    }
    return cols;
  },

  // Returns true if `player` would win by dropping in `col`.
  // Mutate-and-restore is safe because JS is single-threaded.
  wouldWin(board, col, player) {
    const row = findLowestEmptyRow(board, col);
    if (row === -1) return false;
    board[row][col] = player;
    const win = findWinningCells(board, row, col, player) !== null;
    board[row][col] = EMPTY;
    return win;
  },

  // ---------- Difficulty dispatch ----------
  pickMove(board, player, difficulty) {
    switch (difficulty) {
      case DIFFICULTY.EASY:       return this.pickRandomMove(board);
      case DIFFICULTY.MEDIUM:     return this.pickSmartMove(board, player);
      case DIFFICULTY.HARD:       return this.pickHardMove(board, player);
      case DIFFICULTY.IMPOSSIBLE: return this.pickMinimaxMove(board, player);
      default:                    return this.pickSmartMove(board, player);
    }
  },

  // ---------- Easy: random ----------
  pickRandomMove(board) {
    const cols = this.validColumns(board);
    if (cols.length === 0) return -1;
    return cols[Math.floor(Math.random() * cols.length)];
  },

  // ---------- Medium: win / block / random ----------
  pickSmartMove(board, player) {
    const opponent = player === RED ? YELLOW : RED;
    const cols = this.validColumns(board);
    if (cols.length === 0) return -1;

    for (const c of cols) if (this.wouldWin(board, c, player))   return c;
    for (const c of cols) if (this.wouldWin(board, c, opponent)) return c;
    return this.pickRandomMove(board);
  },

  // ---------- Hard: smart + avoid suicide + center bias ----------
  /**
   * Like Medium, but additionally rejects "suicidal" moves:
   * moves that, after our piece lands, hand the opponent an
   * immediate winning reply. Among the safe candidates, we prefer
   * columns closer to the center (statistically the strongest).
   */
  pickHardMove(board, player) {
    const opponent = player === RED ? YELLOW : RED;
    const cols = this.validColumns(board);
    if (cols.length === 0) return -1;

    for (const c of cols) if (this.wouldWin(board, c, player))   return c;
    for (const c of cols) if (this.wouldWin(board, c, opponent)) return c;

    // Find columns that DON'T create a winning move for the opponent.
    const safe = [];
    for (const c of cols) {
      const row = findLowestEmptyRow(board, c);
      board[row][c] = player;

      let opponentCanWin = false;
      for (const c2 of this.validColumns(board)) {
        if (this.wouldWin(board, c2, opponent)) { opponentCanWin = true; break; }
      }
      board[row][c] = EMPTY;
      if (!opponentCanWin) safe.push(c);
    }

    const candidates = safe.length > 0 ? safe : cols;

    // Prefer moves closer to the center column (col 3).
    candidates.sort((a, b) => Math.abs(3 - a) - Math.abs(3 - b));

    // 70% pick the most-central, 30% pick a random safe candidate
    // for a bit of variety so games don't always look identical.
    if (Math.random() < 0.7) return candidates[0];
    return candidates[Math.floor(Math.random() * candidates.length)];
  },

  // ---------- Impossible: alpha-beta minimax ----------
  pickMinimaxMove(board, player) {
    const opponent = player === RED ? YELLOW : RED;
    const cols = this.validColumns(board);
    if (cols.length === 0) return -1;

    // Quick wins: take the immediate win or block - faster than
    // running minimax for these obvious cases.
    for (const c of cols) if (this.wouldWin(board, c, player))   return c;
    for (const c of cols) if (this.wouldWin(board, c, opponent)) return c;

    // Try center-first to maximize alpha-beta pruning.
    const ordered = cols.slice().sort((a, b) => Math.abs(3 - a) - Math.abs(3 - b));

    let bestEval = -Infinity;
    let bestCols = [];

    for (const col of ordered) {
      const row = findLowestEmptyRow(board, col);
      board[row][col] = player;

      // If this move wins outright, no need to recurse.
      const justWon = findWinningCells(board, row, col, player) !== null;
      const score = justWon
        ? SCORE.WIN
        : minimax(board, MINIMAX_DEPTH - 1, -Infinity, Infinity, false, player, opponent);

      board[row][col] = EMPTY;

      if (score > bestEval) {
        bestEval = score;
        bestCols = [col];
      } else if (score === bestEval) {
        bestCols.push(col);
      }
    }

    // Tie-break randomly among equally good moves.
    return bestCols[Math.floor(Math.random() * bestCols.length)];
  },
};

/**
 * Alpha-beta minimax recursion. Returns a score from `player`'s
 * perspective: higher = better for player. Standard pattern:
 *   - Maximizing layer = it's `player`'s turn next.
 *   - Minimizing layer = it's `opponent`'s turn next.
 *   - Terminal wins are scored as +/- SCORE.WIN with a small
 *     depth offset so the AI prefers FASTER wins / SLOWER losses.
 */
function minimax(board, depth, alpha, beta, isMaximizing, player, opponent) {
  if (depth === 0) return evaluatePosition(board, player, opponent);

  const cols = AI.validColumns(board);
  if (cols.length === 0) return 0; // draw

  // Center-first move ordering = much better pruning.
  cols.sort((a, b) => Math.abs(3 - a) - Math.abs(3 - b));

  const movingPlayer = isMaximizing ? player : opponent;
  let best = isMaximizing ? -Infinity : Infinity;

  for (const col of cols) {
    const row = findLowestEmptyRow(board, col);
    board[row][col] = movingPlayer;

    let score;
    const winningCells = findWinningCells(board, row, col, movingPlayer);
    if (winningCells) {
      // Adding `depth` rewards faster wins / penalizes slower losses.
      score = isMaximizing ? SCORE.WIN + depth : -SCORE.WIN - depth;
    } else {
      score = minimax(board, depth - 1, alpha, beta, !isMaximizing, player, opponent);
    }

    board[row][col] = EMPTY;

    if (isMaximizing) {
      if (score > best) best = score;
      if (best > alpha) alpha = best;
    } else {
      if (score < best) best = score;
      if (best < beta)  beta  = best;
    }

    if (beta <= alpha) break; // alpha-beta cutoff
  }

  return best;
}

/**
 * Heuristic position evaluator (only called at depth 0 of the
 * minimax recursion). Counts every 4-cell "window" (horizontal,
 * vertical, both diagonals) on the board and adds a score for it
 * based on how many of our pieces vs the opponent's are in it.
 *
 * Plus a center-column bonus: pieces in the middle have the most
 * potential 4-in-a-row lines pass through them.
 */
function evaluatePosition(board, player, opponent) {
  let score = 0;

  // Center column bonus.
  for (let r = 0; r < ROWS; r++) {
    if (board[r][3] === player) score += SCORE.CENTER_PIECE;
  }

  // Horizontal windows.
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      score += scoreWindow(
        [board[r][c], board[r][c+1], board[r][c+2], board[r][c+3]],
        player, opponent
      );
    }
  }
  // Vertical windows.
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r <= ROWS - 4; r++) {
      score += scoreWindow(
        [board[r][c], board[r+1][c], board[r+2][c], board[r+3][c]],
        player, opponent
      );
    }
  }
  // Diagonal (down-right) windows.
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      score += scoreWindow(
        [board[r][c], board[r+1][c+1], board[r+2][c+2], board[r+3][c+3]],
        player, opponent
      );
    }
  }
  // Diagonal (down-left) windows.
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 3; c < COLS; c++) {
      score += scoreWindow(
        [board[r][c], board[r+1][c-1], board[r+2][c-2], board[r+3][c-3]],
        player, opponent
      );
    }
  }

  return score;
}

function scoreWindow(window, player, opponent) {
  let p = 0, o = 0, e = 0;
  for (const cell of window) {
    if (cell === player)        p++;
    else if (cell === opponent) o++;
    else                        e++;
  }
  // Mixed windows can't be completed by either side - ignore.
  if (p > 0 && o > 0) return 0;

  if (p === 4)             return SCORE.WIN;
  if (p === 3 && e === 1)  return SCORE.THREE_IN_WINDOW;
  if (p === 2 && e === 2)  return SCORE.TWO_IN_WINDOW;
  if (o === 3 && e === 1)  return SCORE.OPP_THREE_IN_WIN;
  return 0;
}

/* ============================================================
   Rendering
   ============================================================ */

/**
 * Rebuild the 7-column board. Re-rendering the whole board on every
 * move is plenty fast for a 7x6 grid and keeps the code simple.
 *
 * Only the just-dropped cell gets the .dropping class so only it
 * animates. The --drop-row CSS variable tells the keyframe how far
 * the piece should fall.
 */
function renderBoard() {
  boardEl.innerHTML = "";

  for (let c = 0; c < COLS; c++) {
    const colEl = document.createElement("div");
    colEl.className = "column";
    colEl.dataset.col = String(c);
    colEl.setAttribute("role", "button");
    colEl.setAttribute("aria-label", `Drop piece in column ${c + 1}`);

    for (let r = 0; r < ROWS; r++) {
      const cellEl = document.createElement("div");
      cellEl.className = "cell";
      const value = Game.board[r][c];
      if (value === RED) cellEl.classList.add("red");
      if (value === YELLOW) cellEl.classList.add("yellow");

      if (Game.lastMove && Game.lastMove.row === r && Game.lastMove.col === c) {
        cellEl.classList.add("dropping");
        cellEl.style.setProperty("--drop-row", String(r));
      }

      colEl.appendChild(cellEl);
    }

    colEl.addEventListener("click", () => handleColumnClick(c));
    boardEl.appendChild(colEl);
  }
}

/**
 * Sync the player cards with current state:
 * - Names depend on the mode (You/Computer or Player 1/Player 2).
 * - The active player gets the .active class (shows "Turn" badge).
 */
function updatePlayerCards() {
  const isCpu = Game.mode === MODE_CPU;
  const isOnline = Game.mode === MODE_ONLINE;
  
  if (isOnline) {
    redPlayerNameEl.textContent    = Game.onlineRole === RED ? "You" : "Opponent";
    yellowPlayerNameEl.textContent = Game.onlineRole === YELLOW ? "You" : "Opponent";
  } else {
    redPlayerNameEl.textContent    = isCpu ? "You" : "Player 1";
    yellowPlayerNameEl.textContent = isCpu ? "Computer" : "Player 2";
  }

  const redActive = Game.currentPlayer === RED;
  redPlayerCardEl.classList.toggle("active", redActive && !Game.isOver);
  yellowPlayerCardEl.classList.toggle("active", !redActive && !Game.isOver);
}

/**
 * Outline the 4 winning cells. Combined with .cell.win in CSS this
 * also triggers the "pop" + glow animation.
 */
function highlightCells(cells) {
  const columnEls = boardEl.querySelectorAll(".column");
  for (const [r, c] of cells) {
    const colEl = columnEls[c];
    if (!colEl) continue;
    const cellEl = colEl.children[r];
    if (cellEl) cellEl.classList.add("win");
  }
}

/* ============================================================
   Effects (confetti + stars)
   ------------------------------------------------------------
   Each particle is a div positioned absolutely inside its
   container. We set per-particle CSS variables (color, delay,
   duration, drift) and let CSS keyframes do the animating.
   ============================================================ */

const CONFETTI_COLORS = ["#ef4444", "#f97316", "#facc15", "#22c55e", "#3b82f6", "#a855f7"];

function spawnConfetti(container, count = 60) {
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    piece.style.background = color;
    piece.style.setProperty("--color", color);
    piece.style.left = (Math.random() * 100) + "%";
    piece.style.setProperty("--fall-duration", (2 + Math.random() * 2.5) + "s");
    piece.style.setProperty("--fall-delay", (Math.random() * 0.6) + "s");
    piece.style.setProperty("--spin-duration", (0.5 + Math.random() * 1.2) + "s");
    piece.style.setProperty("--drift", (Math.random() * 200 - 100) + "px");
    container.appendChild(piece);
  }
}

function spawnStars(container, count = 14) {
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const star = document.createElement("div");
    star.className = "star-piece";
    star.style.left = (5 + Math.random() * 90) + "%";
    star.style.top  = (10 + Math.random() * 70) + "%";
    star.style.setProperty("--twinkle-duration", (1.2 + Math.random() * 1.5) + "s");
    star.style.setProperty("--twinkle-delay", (Math.random() * 1.5) + "s");
    container.appendChild(star);
  }
}

/* ============================================================
   Game flow (move handling, win/draw, AI scheduling)
   ============================================================ */

/**
 * Handle a tap/click on a column. Human entry point.
 * In CPU mode this is a no-op while it's the computer's turn.
 */
function handleColumnClick(col, fromNetwork = false) {
  if (Game.isOver || Game.isAnimating) return;
  if (Game.mode === MODE_CPU && Game.currentPlayer === YELLOW) return;
  
  if (Game.mode === MODE_ONLINE) {
    if (Game.currentPlayer !== Game.onlineRole && !fromNetwork) {
      // Not our turn, wait for opponent's network message
      return;
    }
    if (!fromNetwork) {
      // It's our turn, send it to the opponent
      Online.broadcast({ type: "move", col });
    }
  }

  applyMove(col);
}

/**
 * Place the current player's piece in `col` and advance the game.
 * Used by BOTH the human click handler and the AI.
 */
function applyMove(col) {
  if (Game.isOver || Game.isAnimating) return;

  const row = findLowestEmptyRow(Game.board, col);
  if (row === -1) return;

  Game.board[row][col] = Game.currentPlayer;
  Game.lastMove = { row, col };
  Game.isAnimating = true;

  renderBoard();
  Sound.drop();

  // Wait for the drop animation to finish before declaring a win
  // or switching turns - the piece needs to visibly land first.
  setTimeout(() => {
    Game.isAnimating = false;
    Game.lastMove = null;

    const mover = Game.currentPlayer;

    const winningCells = findWinningCells(Game.board, row, col, Game.currentPlayer);
    if (winningCells) {
      if (Game.mode === MODE_CPU) {
        Game.moveHistory.push({ row, col, player: mover });
      }
      Game.isOver = true;
      highlightCells(winningCells);
      updatePlayerCards();          // clear active state during overlay
      updateUndoButton();
      // Small extra delay so the player sees the winning highlight
      // pop on the board before the celebratory overlay covers it.
      setTimeout(() => showWinOverlay(Game.currentPlayer), 450);
      Sound.win();
      return;
    }

    if (isBoardFull(Game.board)) {
      if (Game.mode === MODE_CPU) {
        Game.moveHistory.push({ row, col, player: mover });
      }
      Game.isOver = true;
      updatePlayerCards();
      updateUndoButton();
      setTimeout(() => showDrawOverlay(), 350);
      return;
    }

    if (Game.mode === MODE_CPU) {
      Game.moveHistory.push({ row, col, player: mover });
    }

    Game.currentPlayer = Game.currentPlayer === RED ? YELLOW : RED;
    updatePlayerCards();
    updateUndoButton();
    maybeTriggerAi();
  }, DROP_ANIM_MS);
}

/**
 * If it's the AI's turn, wait a beat and then play.
 * The inner re-checks defend against the user resetting or
 * switching modes during the "thinking" delay.
 */
function maybeTriggerAi() {
  if (Game.mode !== MODE_CPU) return;
  if (Game.isOver) return;
  if (Game.currentPlayer !== YELLOW) return;

  setTimeout(() => {
    if (Game.mode !== MODE_CPU) return;
    if (Game.isOver) return;
    if (Game.currentPlayer !== YELLOW) return;
    if (Game.isAnimating) return;

    updateUndoButton(); // human can't undo while AI is about to move
    const col = AI.pickMove(Game.board, YELLOW, Game.difficulty);
    if (col !== -1) applyMove(col);
  }, AI_THINK_MS);
}

/**
 * Pop one recorded move off the history and clear that cell.
 */
function popRecordedMove() {
  const m = Game.moveHistory.pop();
  if (!m) return false;
  Game.board[m.row][m.col] = EMPTY;
  return true;
}

/**
 * CPU mode: undo your last turn — removes the computer's reply and your move.
 * If you won on your move (computer never replied), removes only your piece.
 * Clears win/draw overlays so you can keep playing.
 */
function undoCpuRound() {
  if (!undoMoveEnabled) return;
  if (Game.mode !== MODE_CPU || Game.isAnimating) return;
  if (!canUndoCpuRound()) return;

  hideOverlays();

  if (Game.isOver) {
    const last = Game.moveHistory[Game.moveHistory.length - 1];
    if (last.player === RED) {
      popRecordedMove();
    } else {
      popRecordedMove();
      popRecordedMove();
    }
    Game.isOver = false;
  } else {
    popRecordedMove();
    popRecordedMove();
  }

  Game.currentPlayer = RED;
  Game.lastMove = null;
  renderBoard();
  updatePlayerCards();
  updateUndoButton();
  Sound.click();
}

function canUndoCpuRound() {
  if (Game.mode !== MODE_CPU || Game.isAnimating) return false;
  const len = Game.moveHistory.length;
  if (len === 0) return false;

  if (Game.isOver) {
    const last = Game.moveHistory[len - 1];
    if (last.player === RED) return true;
    return len >= 2;
  }

  return Game.currentPlayer === RED && len >= 2;
}

function updateUndoButton() {
  const show = Game.mode === MODE_CPU && undoMoveEnabled;
  undoBtn.classList.toggle("undo-btn--hidden", !show);
  undoBtn.hidden = !show;
  undoBtn.style.display = show ? "" : "none";
  if (!show) {
    undoBtn.disabled = true;
    return;
  }
  undoBtn.disabled = !canUndoCpuRound();
}

/* ============================================================
   Screens & overlays
   ============================================================ */

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("visible"));
  const target = document.getElementById(screenId);
  if (target) target.classList.add("visible");
  // Re-sync undo control when the game screen becomes visible again (e.g. leaving
  // Settings); some browsers/layout passes can leave the button visible otherwise.
  if (screenId === "gameScreen") {
    updateUndoButton();
    requestAnimationFrame(() => updateUndoButton());
  }
}

function showWinOverlay(winner) {
  const isCpu = Game.mode === MODE_CPU;
  const isOnline = Game.mode === MODE_ONLINE;
  let title;
  if (isOnline) {
    title = winner === Game.onlineRole ? "YOU WIN!" : "OPPONENT WINS!";
  } else if (isCpu) {
    title = winner === RED ? "YOU WIN!" : "COMPUTER WINS!";
  } else {
    title = winner === RED ? "PLAYER 1 WINS!" : "PLAYER 2 WINS!";
  }
  winTitleEl.textContent = title;
  spawnConfetti(confettiEl);
  winOverlayEl.classList.add("visible");
}

function showDrawOverlay() {
  spawnStars(drawStarsEl);
  drawOverlayEl.classList.add("visible");
}

function hideOverlays() {
  winOverlayEl.classList.remove("visible");
  drawOverlayEl.classList.remove("visible");
  // Clear particles so they don't pile up between rounds.
  confettiEl.innerHTML = "";
  drawStarsEl.innerHTML = "";
}

/* ============================================================
   Mode + reset
   ============================================================ */

function setMode(mode) {
  if (Game.mode !== mode) {
    if (Game.mode === MODE_ONLINE) {
      Online.leaveRoom();
    }
    Game.mode = mode;
    try { localStorage.setItem("connect4-mode", mode); }
    catch (_) { /* ignore */ }
  }
  renderModeToggle();
  resetGame();
}

function loadMode() {
  try {
    const saved = localStorage.getItem("connect4-mode");
    if (saved === MODE_PVP || saved === MODE_CPU) Game.mode = saved;
  } catch (_) { /* ignore */ }
}

/* ---------- Difficulty ---------- */

function setDifficulty(diff) {
  // Defensive: only accept known values.
  if (!Object.values(DIFFICULTY).includes(diff)) return;
  if (Game.difficulty === diff) return;
  Game.difficulty = diff;
  try { localStorage.setItem("connect4-difficulty", diff); }
  catch (_) { /* ignore */ }
  renderDifficultyOptions();
}

function loadDifficulty() {
  try {
    const saved = localStorage.getItem("connect4-difficulty");
    if (saved && Object.values(DIFFICULTY).includes(saved)) {
      Game.difficulty = saved;
    }
  } catch (_) { /* ignore */ }
}

function loadUndoMoveEnabled() {
  try { undoMoveEnabled = localStorage.getItem("connect4-undo-move") === "1"; }
  catch (_) { undoMoveEnabled = false; }
}

function setUndoMoveEnabled(enabled) {
  if (undoMoveEnabled === enabled) {
    updateUndoButton();
    return;
  }
  undoMoveEnabled = enabled;
  try { localStorage.setItem("connect4-undo-move", enabled ? "1" : "0"); }
  catch (_) { /* ignore */ }
  updateUndoButton();
}

function renderDifficultyOptions() {
  diffOptionEls.forEach((btn) => {
    const isActive = btn.dataset.diff === Game.difficulty;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-checked", String(isActive));
  });
}

function resetGame(fromNetwork = false) {
  if (Game.mode === MODE_ONLINE && !fromNetwork) {
    Online.broadcast({ type: "reset" });
  }

  Game.board = createEmptyBoard();
  Game.currentPlayer = RED;
  Game.isOver = false;
  Game.isAnimating = false;
  Game.lastMove = null;
  Game.moveHistory = [];
  // Keep online state during resets
  // Game.onlineRole = null;
  // Game.onlineRoomCode = null;
  hideOverlays();
  renderBoard();
  updatePlayerCards();
  updateUndoButton();
}

/* ============================================================
   Supabase Online Multiplayer Setup
   ============================================================ */

// TODO: Replace these with your actual Supabase project URL and Anon Key.
const SUPABASE_URL = "https://iwekfwssxqanwdgbnxcs.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_GbRg9JUYoj6uhOSeqPLz6Q_p9GELdGx"; // I see the key starts with this from your screenshot, you'll need to paste the full key here

const Online = {
  client: null,
  channel: null,

  init() {
    if (this.client || typeof window.supabase === "undefined") return;
    if (SUPABASE_URL !== "YOUR_SUPABASE_URL") {
      this.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
      console.warn("Supabase not configured. Online mode will not work until keys are set.");
    }
  },

  generateRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusing chars like I, 1, O, 0
    let code = "";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  },

  startHost() {
    this.init();
    if (!this.client) return alert("Please configure Supabase URL and Key first.");
    
    Game.onlineRole = RED; // host is always red
    Game.onlineRoomCode = this.generateRoomCode();
    
    showOnlineStatus("WAITING FOR OPPONENT...", Game.onlineRoomCode, true);
    
    // Set to online mode immediately
    Game.mode = MODE_ONLINE;
    this.joinRoom(Game.onlineRoomCode);
  },

  joinAsGuest(code) {
    this.init();
    if (!this.client) return alert("Please configure Supabase URL and Key first.");
    
    code = code.toUpperCase().trim();
    if (code.length !== 5) return alert("Room code must be 5 characters.");
    
    Game.onlineRole = YELLOW; // guest is always yellow
    Game.onlineRoomCode = code;
    
    showOnlineStatus("JOINING ROOM...", code, false);
    
    // Switch immediately to online mode so that when sync happens, we don't double-reset
    Game.mode = MODE_ONLINE;
    this.joinRoom(code);
  },

  joinRoom(code) {
    if (this.channel) {
      this.client.removeChannel(this.channel);
    }
    
    this.channel = this.client.channel(`room-${code}`, {
      config: {
        presence: { key: Game.onlineRole }
      }
    });

    // Listen for incoming moves/events
    this.channel.on('broadcast', { event: 'game-action' }, payload => {
      this.handleNetworkMessage(payload.payload);
    });

    // Listen for presence to detect opponent joining/leaving
    this.channel.on('presence', { event: 'sync' }, () => {
      const state = this.channel.presenceState();
      
      // Because a player might have multiple tabs/connections open,
      // we need to count unique roles (RED vs YELLOW) rather than raw connection keys.
      // But actually, we set `presence: { key: Game.onlineRole }`, so the keys ARE the roles!
      const players = Object.keys(state);
      
      if (players.includes(RED) && players.includes(YELLOW)) {
        // Both roles are present!
        hideOnlineStatus();
        renderModeToggle();
        resetGame(true); // pass true so it doesn't broadcast a reset to the newly joined player
        showScreen("gameScreen");
      } else if (Game.mode === MODE_ONLINE && !document.getElementById("onlineStatusOverlay").classList.contains("visible")) {
        // Opponent disconnected mid-game
        showOnlineStatus("OPPONENT DISCONNECTED", code);
      }
    });

    this.channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await this.channel.track({ online_at: new Date().toISOString() });
      }
    });
  },

  leaveRoom() {
    if (this.channel) {
      this.client.removeChannel(this.channel);
      this.channel = null;
    }
    Game.onlineRole = null;
    Game.onlineRoomCode = null;
    hideOnlineStatus();
    
    // If they were mid-game, switch back to 1-player mode
    if (Game.mode === MODE_ONLINE) {
      setMode(MODE_CPU);
    }
  },

  broadcast(message) {
    if (!this.channel) return;
    this.channel.send({
      type: 'broadcast',
      event: 'game-action',
      payload: message
    });
  },

  handleNetworkMessage(msg) {
    if (msg.type === "move" && Game.currentPlayer !== Game.onlineRole) {
      // It's a move from the opponent
      if (findLowestEmptyRow(Game.board, msg.col) !== -1) {
        handleColumnClick(msg.col, true);
      }
    } else if (msg.type === "reset") {
      resetGame(true);
    }
  }
};

function showOnlineStatus(title, code, isHost = false) {
  onlineStatusTitle.textContent = title;
  roomCodeDisplay.textContent = code;
  if (copyLinkBtn) {
    copyLinkBtn.style.display = isHost ? "block" : "none";
  }
  onlineStatusOverlay.classList.add("visible");
}

function hideOnlineStatus() {
  onlineStatusOverlay.classList.remove("visible");
}

/* ============================================================
   Sound UI helpers (mute icon + sound toggle stay in sync)
   ============================================================ */

function renderMuteButton() {
  muteBtn.classList.toggle("muted", Sound.muted);
  muteBtn.setAttribute("aria-pressed", String(Sound.muted));
  muteBtn.setAttribute(
    "aria-label",
    Sound.muted ? "Unmute sound" : "Mute sound"
  );
}

function renderSoundToggle() {
  soundToggle.classList.toggle("on", !Sound.muted);
  soundToggle.setAttribute("aria-checked", String(!Sound.muted));
}

function renderUndoMoveToggle() {
  undoMoveToggle.classList.toggle("on", undoMoveEnabled);
  undoMoveToggle.setAttribute("aria-checked", String(undoMoveEnabled));
}

function renderModeToggle() {
  modeCpuBtn.classList.toggle("active", Game.mode === MODE_CPU);
  modePvpBtn.classList.toggle("active", Game.mode === MODE_PVP);
  modeOnlineBtn.classList.toggle("active", Game.mode === MODE_ONLINE);

  modeCpuBtn.setAttribute("aria-selected", String(Game.mode === MODE_CPU));
  modePvpBtn.setAttribute("aria-selected", String(Game.mode === MODE_PVP));
  modeOnlineBtn.setAttribute("aria-selected", String(Game.mode === MODE_ONLINE));
}

/* ============================================================
   Wiring (event listeners)
   ============================================================ */

// --- Mode toggle ---
modeCpuBtn.addEventListener("click", () => {
  Sound.click();
  setMode(MODE_CPU);
});
modePvpBtn.addEventListener("click", () => {
  Sound.click();
  setMode(MODE_PVP);
});
modeOnlineBtn.addEventListener("click", () => {
  Sound.click();
  // Don't setMode yet, just show the lobby screen.
  // The mode button won't highlight until they successfully join a room.
  showScreen("onlineScreen");
});

// --- Game header ---
muteBtn.addEventListener("click", () => {
  Sound.setMuted(!Sound.muted);
  renderMuteButton();
  renderSoundToggle();
  Sound.click();
});

gameSettingsBtn.addEventListener("click", () => {
  Sound.click();
  showScreen("settingsScreen");
});

undoBtn.addEventListener("click", () => {
  undoCpuRound();
});

resetBtn.addEventListener("click", () => {
  Sound.click();
  resetGame();
});

// --- Settings ---
settingsBackBtn.addEventListener("click", () => {
  Sound.click();
  showScreen("gameScreen");
});

// --- Online Setup ---
onlineBackBtn.addEventListener("click", () => {
  Sound.click();
  showScreen("gameScreen");
});
hostBtn.addEventListener("click", () => {
  Sound.click();
  Online.startHost();
});
joinBtn.addEventListener("click", () => {
  Sound.click();
  Online.joinAsGuest(joinCodeInput.value);
});
cancelOnlineBtn.addEventListener("click", () => {
  Sound.click();
  Online.leaveRoom();
});
if (copyLinkBtn) {
  copyLinkBtn.addEventListener("click", () => {
    Sound.click();
    const url = new URL(window.location.href);
    url.searchParams.set("room", Game.onlineRoomCode);
    navigator.clipboard.writeText(url.toString()).then(() => {
      copyLinkBtn.textContent = "COPIED!";
      setTimeout(() => {
        copyLinkBtn.textContent = "COPY INVITE LINK";
      }, 2000);
    });
  });
}

soundToggle.addEventListener("click", () => {
  Sound.setMuted(!Sound.muted);
  renderSoundToggle();
  renderMuteButton();
  Sound.click();
});

undoMoveToggle.addEventListener("click", () => {
  setUndoMoveEnabled(!undoMoveEnabled);
  renderUndoMoveToggle();
  Sound.click();
});

diffOptionEls.forEach((btn) => {
  btn.addEventListener("click", () => {
    Sound.click();
    setDifficulty(btn.dataset.diff);
  });
});

howToPlayLink.addEventListener("click", () => {
  Sound.click();
  showScreen("howToPlayScreen");
});

// --- How to Play ---
howToPlayBackBtn.addEventListener("click", () => {
  Sound.click();
  showScreen("settingsScreen");
});

// --- Win / Draw overlays ---
winPlayAgainBtn.addEventListener("click", () => {
  Sound.click();
  resetGame();
});
drawPlayAgainBtn.addEventListener("click", () => {
  Sound.click();
  resetGame();
});

// --- AudioContext init on first gesture (browser autoplay policy) ---
document.addEventListener("pointerdown", () => Sound.init(), { once: true });

/* ============================================================
   Boot - go straight to the game screen.
   ============================================================ */
Sound.loadMuted();
loadMode();
loadDifficulty();
loadUndoMoveEnabled();
renderMuteButton();
renderSoundToggle();
renderUndoMoveToggle();
renderModeToggle();
renderDifficultyOptions();
resetGame();
showScreen("gameScreen");

// Check if URL has ?room=CODE
const urlParams = new URLSearchParams(window.location.search);
const roomParam = urlParams.get("room");
if (roomParam) {
  // Clean up the URL so the query string doesn't stick around
  window.history.replaceState({}, document.title, window.location.pathname);
  showScreen("onlineScreen");
  Online.joinAsGuest(roomParam);
}
