import Phaser from "phaser";

type Point = { x: number; y: number };

export default class Zombie {
  public sprite: Phaser.GameObjects.Rectangle;
  public body: Phaser.Physics.Arcade.Body;
  public speed = 80;

  public health = 3;
  public readonly maxHealth = 3;

  private healthBarBg: Phaser.GameObjects.Rectangle;
  private healthBar: Phaser.GameObjects.Rectangle;

  // ---- Configuração do mundo / grade (compartilhada por todos os zumbis) ----
  private static readonly CELL = 32;
  private static readonly COLS = Math.ceil(2000 / 32);
  private static readonly PADDING = 18; // folga ao redor dos obstáculos (grade/caminho)
  private static readonly LOS_PADDING = 12; // folga usada só para "posso ir direto no jogador?"

  private static grid: Uint8Array | null = null;
  private static gridRef: unknown = null;
  private static gridSignature = "";

  // ---- Estado de cada zumbi ----
  private scene: Phaser.Scene;
  public uiCamera?: Phaser.Cameras.Scene2D.Camera;
  private path: Point[] = [];
  private pathTargetX = -9999;
  private pathTargetY = -9999;
  private nextRepathAt = 0;

  private lastCheckAt = 0;
  private lastCheckX = 0;
  private lastCheckY = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;

    this.sprite = scene.add.rectangle(x, y, 28, 28, 0xe74c3c);
    scene.physics.add.existing(this.sprite);

    this.healthBarBg = scene.add
      .rectangle(this.sprite.x, this.sprite.y - 24, 34, 5, 0x222222)
      .setDepth(10);

    this.healthBar = scene.add
      .rectangle(this.sprite.x, this.sprite.y - 24, 34, 5, 0x55dd66)
      .setOrigin(0, 0.5)
      .setDepth(11);

    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setCollideWorldBounds(true);
    this.body.setSize(24, 24);
    this.body.setMaxVelocity(this.speed, this.speed);

    this.lastCheckX = x;
    this.lastCheckY = y;

    // Desencontra o momento de recalcular caminho entre zumbis
    this.nextRepathAt = scene.time.now + Math.random() * 300;
  }

  takeDamage(amount: number) {
    if (!this.sprite.active) return;

    this.health -= amount;

    const ratio = Math.max(0, this.health) / this.maxHealth;

    this.healthBar.setDisplaySize(34 * ratio, 5);
    this.healthBar.setFillStyle(
      ratio <= 0.33 ? 0xe74c3c : ratio <= 0.66 ? 0xf1c40f : 0x55dd66,
    );

    this.sprite.setFillStyle(0xffffff);

    this.scene.time.delayedCall(100, () => {
      if (this.sprite.active) {
        this.sprite.setFillStyle(0xe74c3c);
      }
    });

    if (this.health <= 0) {
      this.scene.sound.play("zombie-death");

      const particles = this.scene.add.particles(
        this.sprite.x,
        this.sprite.y,
        "__WHITE",
        {
          speed: { min: 40, max: 140 },
          angle: { min: 0, max: 360 },
          scale: { start: 0.7, end: 0 },
          lifespan: 250,
          quantity: 12,
          tint: 0xc0392b,
          emitting: false,
        },
      );

      this.uiCamera?.ignore(particles);

      particles.explode();

      this.scene.time.delayedCall(300, () => {
        particles.destroy();
      });

      this.healthBarBg.destroy();
      this.healthBar.destroy();
      this.sprite.destroy();
    }
  }

  updateHealthBar() {
    this.healthBarBg.setPosition(this.sprite.x, this.sprite.y - 24);
    this.healthBar.setPosition(this.sprite.x - 17, this.sprite.y - 24);
  }

  getHealthBarObjects() {
    return [this.healthBarBg, this.healthBar];
  }

  /**
   * @param target    jogador
   * @param obstacles obstáculos (retângulos com origem no centro)
   * @param others    lista de todos os zumbis (para não se empilharem)
   */
  follow(
    target: Phaser.GameObjects.Image,
    obstacles: Phaser.GameObjects.Rectangle[] = [],
    others: Zombie[] = [],
  ) {
    const now = this.scene.time.now;
    const sx = this.sprite.x;
    const sy = this.sprite.y;

    Zombie.updateGrid(obstacles);

    // 1) Define o destino: direto, se enxerga o jogador; senão, pelo caminho
    let destX = target.x;
    let destY = target.y;

    const hasLineOfSight = Zombie.lineClear(
      sx,
      sy,
      target.x,
      target.y,
      obstacles,
      Zombie.LOS_PADDING,
    );

    if (hasLineOfSight) {
      this.path = [];
    } else {
      const targetMoved =
        Phaser.Math.Distance.Between(
          target.x,
          target.y,
          this.pathTargetX,
          this.pathTargetY,
        ) > 48;

      if (now >= this.nextRepathAt || (targetMoved && this.path.length > 0)) {
        this.repath(target, obstacles);
        this.nextRepathAt = now + 400 + Math.random() * 150;
      }

      // Descarta waypoints já alcançados
      while (
        this.path.length > 0 &&
        Phaser.Math.Distance.Between(sx, sy, this.path[0].x, this.path[0].y) <
          12
      ) {
        this.path.shift();
      }

      if (this.path.length > 0) {
        destX = this.path[0].x;
        destY = this.path[0].y;
      }
      // Sem waypoints (chegou ao fim do caminho ou não achou rota):
      // segue direto para o jogador, que é o destino padrão.
    }

    // 2) Detecta travamento (quase não saiu do lugar) e força novo caminho
    if (now - this.lastCheckAt > 500) {
      const moved = Phaser.Math.Distance.Between(
        sx,
        sy,
        this.lastCheckX,
        this.lastCheckY,
      );
      const distToTarget = Phaser.Math.Distance.Between(
        sx,
        sy,
        target.x,
        target.y,
      );

      if (moved < 8 && distToTarget > 40) {
        this.path = [];
        this.nextRepathAt = 0;
      }

      this.lastCheckAt = now;
      this.lastCheckX = sx;
      this.lastCheckY = sy;
    }

    // 3) Direção desejada
    let dirX = destX - sx;
    let dirY = destY - sy;
    const dirLen = Math.hypot(dirX, dirY);

    if (dirLen > 0.001) {
      dirX /= dirLen;
      dirY /= dirLen;
    } else {
      dirX = 0;
      dirY = 0;
    }

    // 4) Separação: empurra para longe de outros zumbis próximos
    const SEP_RADIUS = 36;
    let sepX = 0;
    let sepY = 0;

    for (const other of others) {
      if (other === this || !other.sprite.active) continue;

      let dx = sx - other.sprite.x;
      let dy = sy - other.sprite.y;
      let d = Math.hypot(dx, dy);

      if (d >= SEP_RADIUS) continue;

      if (d < 0.001) {
        // Exatamente um em cima do outro: sorteia uma direção
        const a = Math.random() * Math.PI * 2;
        dx = Math.cos(a);
        dy = Math.sin(a);
        d = 1;
      }

      const weight = (SEP_RADIUS - d) / SEP_RADIUS;
      sepX += (dx / d) * weight;
      sepY += (dy / d) * weight;
    }

    let finalX = dirX + sepX * 1.5;
    let finalY = dirY + sepY * 1.5;
    const finalLen = Math.hypot(finalX, finalY);

    if (finalLen > 0.001) {
      finalX /= finalLen;
      finalY /= finalLen;
    }

    // 5) Suaviza a velocidade para não tremer
    const desiredVX = finalX * this.speed;
    const desiredVY = finalY * this.speed;

    this.body.setVelocity(
      this.body.velocity.x + (desiredVX - this.body.velocity.x) * 0.2,
      this.body.velocity.y + (desiredVY - this.body.velocity.y) * 0.2,
    );
  }

  private repath(
    target: Phaser.GameObjects.Image,
    obstacles: Phaser.GameObjects.Rectangle[],
  ) {
    this.pathTargetX = target.x;
    this.pathTargetY = target.y;

    const raw = Zombie.findPath(
      this.sprite.x,
      this.sprite.y,
      target.x,
      target.y,
    );

    this.path = Zombie.smoothPath(this.sprite.x, this.sprite.y, raw, obstacles);
  }

  private static cellIndex(cx: number, cy: number) {
    return cy * Zombie.COLS + cx;
  }

  private static toCell(v: number) {
    return Phaser.Math.Clamp(Math.floor(v / Zombie.CELL), 0, Zombie.COLS - 1);
  }

  private static cellCenter(cx: number, cy: number): Point {
    return {
      x: cx * Zombie.CELL + Zombie.CELL / 2,
      y: cy * Zombie.CELL + Zombie.CELL / 2,
    };
  }

  /** Reconstrói a grade só quando os obstáculos mudam. */
  private static updateGrid(obstacles: Phaser.GameObjects.Rectangle[]) {
    const signature = obstacles
      .map((o) => `${o.active}:${o.x}:${o.y}:${o.width}:${o.height}`)
      .join("|");

    if (
      Zombie.grid &&
      Zombie.gridRef === obstacles &&
      Zombie.gridSignature === signature
    ) {
      return;
    }

    const grid = new Uint8Array(Zombie.COLS * Zombie.COLS);

    for (const o of obstacles) {
      if (!o.active) continue;

      const c0 = Zombie.toCell(o.x - o.width / 2 - Zombie.PADDING);
      const c1 = Zombie.toCell(o.x + o.width / 2 + Zombie.PADDING);
      const r0 = Zombie.toCell(o.y - o.height / 2 - Zombie.PADDING);
      const r1 = Zombie.toCell(o.y + o.height / 2 + Zombie.PADDING);

      for (let cy = r0; cy <= r1; cy++) {
        for (let cx = c0; cx <= c1; cx++) {
          grid[Zombie.cellIndex(cx, cy)] = 1;
        }
      }
    }

    Zombie.grid = grid;
    Zombie.gridRef = obstacles;
    Zombie.gridSignature = signature;
  }

  /** Se a célula estiver bloqueada, acha a livre mais próxima. */
  private static nearestFreeCell(cx: number, cy: number): [number, number] {
    const grid = Zombie.grid!;
    if (!grid[Zombie.cellIndex(cx, cy)]) return [cx, cy];

    for (let radius = 1; radius <= 8; radius++) {
      let best: [number, number] | null = null;
      let bestDist = Infinity;

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;

          const nx = cx + dx;
          const ny = cy + dy;

          if (nx < 0 || ny < 0 || nx >= Zombie.COLS || ny >= Zombie.COLS) {
            continue;
          }

          if (grid[Zombie.cellIndex(nx, ny)]) continue;

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

  /** A* em grade com 8 direções, sem cortar quinas. */
  private static findPath(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ): Point[] {
    const grid = Zombie.grid!;
    const COLS = Zombie.COLS;

    const [sx, sy] = Zombie.nearestFreeCell(
      Zombie.toCell(fromX),
      Zombie.toCell(fromY),
    );
    const [gx, gy] = Zombie.nearestFreeCell(
      Zombie.toCell(toX),
      Zombie.toCell(toY),
    );

    const start = Zombie.cellIndex(sx, sy);
    const goal = Zombie.cellIndex(gx, gy);

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

    // Heap binário simples: [f, índice]
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

        // Não corta quina na diagonal
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
      cells.push(Zombie.cellCenter(node % COLS, Math.floor(node / COLS)));
      node = cameFrom[node];
    }

    return cells.reverse();
  }

  private static smoothPath(
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

      // Usa a folga grande (PADDING) para o caminho não raspar nas quinas
      while (j > i) {
        if (Zombie.lineClear(cx, cy, points[j].x, points[j].y, obstacles)) {
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

  private static lineClear(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    obstacles: Phaser.GameObjects.Rectangle[],
    padding: number = Zombie.PADDING,
  ): boolean {
    for (const o of obstacles) {
      if (!o.active) continue;

      const left = o.x - o.width / 2 - padding;
      const right = o.x + o.width / 2 + padding;
      const top = o.y - o.height / 2 - padding;
      const bottom = o.y + o.height / 2 + padding;

      if (Zombie.segmentHitsBox(x1, y1, x2, y2, left, top, right, bottom)) {
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
}
