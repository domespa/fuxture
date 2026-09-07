// ====================================================================================================== //
//        LOGICA DI 2048
//
//        Tenuta fuori dal componente, come per Fuxtrix: qui non c'e' React, solo funzioni pure che
//        prendono una griglia e ne restituiscono una nuova. Si ragiona e si corregge senza passare
//        dall'interfaccia, e la stessa logica varrebbe con qualunque resa grafica.
// ====================================================================================================== //

export const SIZE = 4;
export const WINNING_TILE = 2048;

export type Board = number[][];
export type Direction = "left" | "right" | "up" | "down";

export interface MoveResult {
  board: Board;
  gained: number;
  moved: boolean;
}

const emptyRow = (): number[] => Array(SIZE).fill(0);

export const createEmptyBoard = (): Board =>
  Array.from({ length: SIZE }, () => emptyRow());

// CELLE LIBERE
const emptyCells = (board: Board): Array<[number, number]> => {
  const cells: Array<[number, number]> = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) cells.push([r, c]);
    }
  }
  return cells;
};

// NUOVA TESSERA: 2 nel 90% dei casi, 4 nel restante 10%, come nel gioco originale
export const spawnTile = (board: Board): Board => {
  const cells = emptyCells(board);
  if (cells.length === 0) return board;

  const [row, col] = cells[Math.floor(Math.random() * cells.length)];
  const next = board.map((r) => [...r]);
  next[row][col] = Math.random() < 0.9 ? 2 : 4;
  return next;
};

export const createBoard = (): Board => spawnTile(spawnTile(createEmptyBoard()));

// COMPATTA UNA RIGA VERSO SINISTRA E FONDE LE COPPIE UGUALI.
// Ogni tessera partecipa a una sola fusione per mossa: e' la regola che
// impedisce a [2,2,4] di diventare 8 in un colpo solo.
const slideRow = (row: number[]): { row: number[]; gained: number } => {
  const tiles = row.filter((value) => value !== 0);
  const result: number[] = [];
  let gained = 0;

  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i] === tiles[i + 1]) {
      const merged = tiles[i] * 2;
      result.push(merged);
      gained += merged;
      i++; // la tessera fusa non partecipa alla coppia successiva
    } else {
      result.push(tiles[i]);
    }
  }

  while (result.length < SIZE) result.push(0);
  return { row: result, gained };
};

// ROTAZIONI: si implementa una sola direzione (sinistra) e si ruota la griglia
// per ottenere le altre tre. Meno codice, e nessuna possibilita' che una
// direzione si comporti diversamente dalle altre.
const rotateClockwise = (board: Board): Board =>
  board[0].map((_, col) => board.map((row) => row[col]).reverse());

const rotateCounterClockwise = (board: Board): Board =>
  board[0].map((_, col) => board.map((row) => row[SIZE - 1 - col]));

// Una rotazione oraria porta il bordo inferiore a sinistra, quindi 1 giro
// corrisponde a "giu" e 3 a "su". Invertirli e' l'errore naturale qui, ed e'
// invisibile finche' non si prova ogni direzione.
const ROTATIONS: Record<Direction, number> = {
  left: 0,
  down: 1,
  right: 2,
  up: 3,
};

const rotate = (board: Board, times: number): Board => {
  let result = board;
  for (let i = 0; i < times; i++) result = rotateClockwise(result);
  return result;
};

const unrotate = (board: Board, times: number): Board => {
  let result = board;
  for (let i = 0; i < times; i++) result = rotateCounterClockwise(result);
  return result;
};

const sameBoard = (a: Board, b: Board): boolean =>
  a.every((row, r) => row.every((value, c) => value === b[r][c]));

// MOSSA COMPLETA. "moved" dice se qualcosa e' cambiato: se no, non va
// generata una nuova tessera, altrimenti premere contro un muro riempirebbe
// la griglia gratis.
export const move = (board: Board, direction: Direction): MoveResult => {
  const turns = ROTATIONS[direction];
  const rotated = rotate(board, turns);

  let gained = 0;
  const slid = rotated.map((row) => {
    const result = slideRow(row);
    gained += result.gained;
    return result.row;
  });

  const next = unrotate(slid, turns);

  return { board: next, gained, moved: !sameBoard(board, next) };
};

// PARTITA FINITA: nessuna cella libera e nessuna coppia adiacente uguale
export const canMove = (board: Board): boolean => {
  if (emptyCells(board).length > 0) return true;

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const value = board[r][c];
      if (c + 1 < SIZE && board[r][c + 1] === value) return true;
      if (r + 1 < SIZE && board[r + 1][c] === value) return true;
    }
  }

  return false;
};

export const highestTile = (board: Board): number =>
  Math.max(...board.map((row) => Math.max(...row)));

export const hasWon = (board: Board): boolean =>
  highestTile(board) >= WINNING_TILE;
