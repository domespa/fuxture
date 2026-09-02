// ====================================================================================================== //
//        Logica pura di Fuxtrix, separata dalla UI perche e la parte dove si annidano i bug
//        (collisioni, rotazioni, cancellazione righe) ed e l unica testabile senza browser.
// ====================================================================================================== //

export const COLS = 10;
export const ROWS = 20;

// PUNTI PER RIGHE CANCELLATE IN UNA VOLTA, MOLTIPLICATI PER IL LIVELLO
export const LINE_SCORES = [0, 100, 300, 500, 800];
export const LINES_PER_LEVEL = 10;

// I 7 PEZZI, OGNUNO NEL SUO RIQUADRO MINIMO. Il numero e anche l indice del colore.
export const SHAPES: number[][][] = [
  [[1, 1, 1, 1]],
  [
    [2, 2],
    [2, 2],
  ],
  [
    [0, 3, 0],
    [3, 3, 3],
  ],
  [
    [0, 4, 4],
    [4, 4, 0],
  ],
  [
    [5, 5, 0],
    [0, 5, 5],
  ],
  [
    [6, 0, 0],
    [6, 6, 6],
  ],
  [
    [0, 0, 7],
    [7, 7, 7],
  ],
];

export type Board = number[][];
export type GameStatus = "idle" | "playing" | "paused" | "over";

export interface Piece {
  matrix: number[][];
  x: number;
  y: number;
}

export interface State {
  board: Board;
  piece: Piece | null;
  bag: number[];
  nextId: number;
  score: number;
  lines: number;
  level: number;
  status: GameStatus;
}

export type Action =
  | { type: "START" }
  | { type: "TICK" }
  | { type: "MOVE"; dx: number }
  | { type: "ROTATE" }
  | { type: "SOFT_DROP" }
  | { type: "HARD_DROP" }
  | { type: "TOGGLE_PAUSE" };

export const createBoard = (): Board =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(0));

// SACCHETTO DEI 7 PEZZI: si svuota prima di ricominciare, cosi non escono 5 pezzi uguali di fila
export const refillBag = (): number[] => {
  const bag = [0, 1, 2, 3, 4, 5, 6];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
};

export const takeFromBag = (bag: number[]): { id: number; bag: number[] } => {
  const source = bag.length > 0 ? [...bag] : refillBag();
  const id = source.pop() as number;
  return { id, bag: source };
};

export const spawnPiece = (id: number): Piece => {
  const matrix = SHAPES[id].map((row) => [...row]);
  return {
    matrix,
    x: Math.floor((COLS - matrix[0].length) / 2),
    y: 0,
  };
};

export const collides = (
  board: Board,
  matrix: number[][],
  x: number,
  y: number
) => {
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (!matrix[row][col]) continue;

      const boardX = x + col;
      const boardY = y + row;

      if (boardX < 0 || boardX >= COLS || boardY >= ROWS) return true;
      if (boardY >= 0 && board[boardY][boardX]) return true;
    }
  }
  return false;
};

// ROTAZIONE ORARIA: traspone e inverte le righe
export const rotateMatrix = (matrix: number[][]): number[][] =>
  matrix[0].map((_, col) => matrix.map((row) => row[col]).reverse());

export const mergePiece = (board: Board, piece: Piece): Board => {
  const next = board.map((row) => [...row]);

  piece.matrix.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      if (!value) return;
      const boardY = piece.y + rowIndex;
      const boardX = piece.x + colIndex;
      if (boardY >= 0) next[boardY][boardX] = value;
    });
  });

  return next;
};

export const clearLines = (board: Board): { board: Board; cleared: number } => {
  const kept = board.filter((row) => row.some((cell) => !cell));
  const cleared = ROWS - kept.length;

  if (cleared === 0) return { board, cleared };

  const empty = Array.from({ length: cleared }, () => Array(COLS).fill(0));
  return { board: [...empty, ...kept], cleared };
};

export const dropDistance = (board: Board, piece: Piece): number => {
  let distance = 0;
  while (!collides(board, piece.matrix, piece.x, piece.y + distance + 1)) {
    distance++;
  }
  return distance;
};

// PEZZO APPOGGIATO A TERRA: fonde, cancella le righe e fa entrare il successivo
export const lockPiece = (state: State): State => {
  const merged = mergePiece(state.board, state.piece as Piece);
  const { board, cleared } = clearLines(merged);

  const lines = state.lines + cleared;
  const level = Math.floor(lines / LINES_PER_LEVEL) + 1;
  const score = state.score + LINE_SCORES[cleared] * state.level;

  const piece = spawnPiece(state.nextId);
  const { id, bag } = takeFromBag(state.bag);

  // SE IL NUOVO PEZZO NASCE GIA ADDOSSO A QUALCOSA, LA PARTITA FINISCE
  if (collides(board, piece.matrix, piece.x, piece.y)) {
    return { ...state, board, lines, level, score, piece: null, status: "over" };
  }

  return {
    ...state,
    board,
    piece,
    bag,
    nextId: id,
    lines,
    level,
    score,
  };
};

export const initialState: State = {
  board: createBoard(),
  piece: null,
  bag: [],
  nextId: 0,
  score: 0,
  lines: 0,
  level: 1,
  status: "idle",
};

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START": {
      const first = takeFromBag(refillBag());
      const second = takeFromBag(first.bag);

      return {
        board: createBoard(),
        piece: spawnPiece(first.id),
        bag: second.bag,
        nextId: second.id,
        score: 0,
        lines: 0,
        level: 1,
        status: "playing",
      };
    }

    case "TOGGLE_PAUSE": {
      if (state.status === "playing") return { ...state, status: "paused" };
      if (state.status === "paused") return { ...state, status: "playing" };
      return state;
    }

    case "TICK":
    case "SOFT_DROP": {
      if (state.status !== "playing" || !state.piece) return state;

      const { piece, board } = state;

      if (!collides(board, piece.matrix, piece.x, piece.y + 1)) {
        const moved = { ...piece, y: piece.y + 1 };
        // LA DISCESA MANUALE VALE UN PUNTO A CELLA
        return {
          ...state,
          piece: moved,
          score: action.type === "SOFT_DROP" ? state.score + 1 : state.score,
        };
      }

      return lockPiece(state);
    }

    case "MOVE": {
      if (state.status !== "playing" || !state.piece) return state;

      const { piece, board } = state;
      const x = piece.x + action.dx;

      if (collides(board, piece.matrix, x, piece.y)) return state;

      return { ...state, piece: { ...piece, x } };
    }

    case "ROTATE": {
      if (state.status !== "playing" || !state.piece) return state;

      const { piece, board } = state;
      const matrix = rotateMatrix(piece.matrix);

      // WALL KICK: se ruotando si finisce dentro un muro, si prova a scostarsi
      for (const offset of [0, -1, 1, -2, 2]) {
        const x = piece.x + offset;
        if (!collides(board, matrix, x, piece.y)) {
          return { ...state, piece: { matrix, x, y: piece.y } };
        }
      }

      return state;
    }

    case "HARD_DROP": {
      if (state.status !== "playing" || !state.piece) return state;

      const distance = dropDistance(state.board, state.piece);

      return lockPiece({
        ...state,
        piece: { ...state.piece, y: state.piece.y + distance },
        // LA CADUTA ISTANTANEA VALE DUE PUNTI A CELLA
        score: state.score + distance * 2,
      });
    }

    default:
      return state;
  }
}
