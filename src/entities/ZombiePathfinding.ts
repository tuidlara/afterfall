import Phaser from "phaser";

type Point = { x: number; y: number };

export default class ZombiePathfinding {
  private static readonly CELL = 32;
  private static readonly COLS = Math.ceil(2000 / 32);
  private static readonly PADDING = 18;

  private static grid: Uint8Array | null = null;
  private static gridRef: unknown = null;
  private static gridSignature = "";

  static lineClear(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    obstacles: Phaser.GameObjects.Rectangle[],
    padding = 18,
  ): boolean {
    for (const o of obstacles) {
      if (!o.active) continue;

      const left = o.x - o.width / 2 - padding;
      const right = o.x + o.width / 2 + padding;
      const top = o.y - o.height / 2 - padding;
      const bottom = o.y + o.height / 2 + padding;

      if (this.segmentHitsBox(x1, y1, x2, y2, left, top, right, bottom)) {
        return false;
      }
    }

    return true;
  }

  private static segmentHitsBox(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    left: number,
    top: number,
    right: number,
    bottom: number,
  ): boolean {
    const dx = x2 - x1;
    const dy = y2 - y1;

    let tMin = 0;
    let tMax = 1;

    if (Math.abs(dx) < 1e-9) {
      if (x1 < left || x1 > right) return false;
    } else {
      let t1 = (left - x1) / dx;
      let t2 = (right - x1) / dx;

      if (t1 > t2) [t1, t2] = [t2, t1];

      tMin = Math.max(tMin, t1);
      tMax = Math.min(tMax, t2);
      if (tMin > tMax) return false;
    }

    if (Math.abs(dy) < 1e-9) {
      if (y1 < top || y1 > bottom) return false;
    } else {
      let t1 = (top - y1) / dy;
      let t2 = (bottom - y1) / dy;

      if (t1 > t2) [t1, t2] = [t2, t1];

      tMin = Math.max(tMin, t1);
      tMax = Math.min(tMax, t2);
      if (tMin > tMax) return false;
    }

    return true;
  }

  static smoothPath(
    fromX: number,
    fromY: number,
    points: Point[],
    obstacles: Phaser.GameObjects.Rectangle[],
  ): Point[] {
    if (points.length === 0) return [];

    const result: Point[] = [];
    let cx = fromX;
    let cy = fromY;
    let i = 0;

    while (i < points.length) {
      let j = points.length - 1;

      while (j > i) {
        if (this.lineClear(cx, cy, points[j].x, points[j].y, obstacles)) {
          break;
        }
        j--;
      }

      result.push(points[j]);
      cx = points[j].x;
      cy = points[j].y;
      i = j + 1;
    }

    return result;
  }

  private static cellIndex(cx: number, cy: number) {
    return cy * this.COLS + cx;
  }

  private static toCell(v: number) {
    return Phaser.Math.Clamp(Math.floor(v / this.CELL), 0, this.COLS - 1);
  }

  private static cellCenter(cx: number, cy: number): Point {
    return {
      x: cx * this.CELL + this.CELL / 2,
      y: cy * this.CELL + this.CELL / 2,
    };
  }

  static updateGrid(obstacles: Phaser.GameObjects.Rectangle[]) {
    const signature = obstacles
      .map((o) => `${o.active}:${o.x}:${o.y}:${o.width}:${o.height}`)
      .join("|");

    if (
      this.grid &&
      this.gridRef === obstacles &&
      this.gridSignature === signature
    ) {
      return;
    }

    const grid = new Uint8Array(this.COLS * this.COLS);

    for (const o of obstacles) {
      if (!o.active) continue;

      const c0 = this.toCell(o.x - o.width / 2 - this.PADDING);
      const c1 = this.toCell(o.x + o.width / 2 + this.PADDING);
      const r0 = this.toCell(o.y - o.height / 2 - this.PADDING);
      const r1 = this.toCell(o.y + o.height / 2 + this.PADDING);

      for (let cy = r0; cy <= r1; cy++) {
        for (let cx = c0; cx <= c1; cx++) {
          grid[this.cellIndex(cx, cy)] = 1;
        }
      }
    }

    this.grid = grid;
    this.gridRef = obstacles;
    this.gridSignature = signature;
  }

  private static nearestFreeCell(cx: number, cy: number): [number, number] {
    const grid = this.grid!;

    if (!grid[this.cellIndex(cx, cy)]) return [cx, cy];

    for (let radius = 1; radius <= 8; radius++) {
      let best: [number, number] | null = null;
      let bestDist = Infinity;

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;

          const nx = cx + dx;
          const ny = cy + dy;

          if (nx < 0 || ny < 0 || nx >= this.COLS || ny >= this.COLS) {
            continue;
          }

          if (grid[this.cellIndex(nx, ny)]) continue;

          const d = dx * dx + dy * dy;

          if (d < bestDist) {
            bestDist = d;
            best = [nx, ny];
          }
        }
      }

      if (best) return best;
    }

    return [cx, cy];
  }

  static findPath(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ): Point[] {
    const grid = this.grid!;
    const COLS = this.COLS;

    const [sx, sy] = this.nearestFreeCell(
      this.toCell(fromX),
      this.toCell(fromY),
    );

    const [gx, gy] = this.nearestFreeCell(this.toCell(toX), this.toCell(toY));

    const start = this.cellIndex(sx, sy);
    const goal = this.cellIndex(gx, gy);

    if (start === goal) return [];

    const total = COLS * COLS;
    const gScore = new Float32Array(total).fill(Infinity);
    const cameFrom = new Int32Array(total).fill(-1);
    const closed = new Uint8Array(total);

    const heuristic = (idx: number) => {
      const x = idx % COLS;
      const y = Math.floor(idx / COLS);
      const dx = Math.abs(x - gx);
      const dy = Math.abs(y - gy);

      return Math.max(dx, dy) + 0.414 * Math.min(dx, dy);
    };

    const heap: [number, number][] = [];

    const push = (f: number, idx: number) => {
      heap.push([f, idx]);

      let i = heap.length - 1;

      while (i > 0) {
        const p = (i - 1) >> 1;

        if (heap[p][0] <= heap[i][0]) break;

        [heap[p], heap[i]] = [heap[i], heap[p]];
        i = p;
      }
    };

    const pop = (): [number, number] => {
      const top = heap[0];
      const last = heap.pop()!;

      if (heap.length > 0) {
        heap[0] = last;
        let i = 0;

        for (;;) {
          const l = i * 2 + 1;
          const r = l + 1;
          let m = i;

          if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
          if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
          if (m === i) break;

          [heap[m], heap[i]] = [heap[i], heap[m]];
          i = m;
        }
      }

      return top;
    };

    gScore[start] = 0;
    push(heuristic(start), start);

    const dirs = [
      [1, 0, 1],
      [-1, 0, 1],
      [0, 1, 1],
      [0, -1, 1],
      [1, 1, 1.414],
      [1, -1, 1.414],
      [-1, 1, 1.414],
      [-1, -1, 1.414],
    ];

    let found = false;

    while (heap.length > 0) {
      const [, current] = pop();

      if (current === goal) {
        found = true;
        break;
      }

      if (closed[current]) continue;
      closed[current] = 1;

      const cx = current % COLS;
      const cy = Math.floor(current / COLS);

      for (const [dx, dy, cost] of dirs) {
        const nx = cx + dx;
        const ny = cy + dy;

        if (nx < 0 || ny < 0 || nx >= COLS || ny >= COLS) continue;

        const nIdx = ny * COLS + nx;
        if (grid[nIdx] || closed[nIdx]) continue;

        // Impede cortar quinas na diagonal
        if (dx !== 0 && dy !== 0) {
          if (grid[cy * COLS + nx] || grid[ny * COLS + cx]) continue;
        }

        const tentative = gScore[current] + cost;

        if (tentative < gScore[nIdx]) {
          gScore[nIdx] = tentative;
          cameFrom[nIdx] = current;
          push(tentative + heuristic(nIdx), nIdx);
        }
      }
    }

    if (!found) return [];

    const cells: Point[] = [];
    let node = goal;

    while (node !== start && node !== -1) {
      cells.push(this.cellCenter(node % COLS, Math.floor(node / COLS)));

      node = cameFrom[node];
    }

    return cells.reverse();
  }
}
