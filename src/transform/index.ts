import { Vector2d } from '../vector';
import { Geometry } from '../geometry';

export class Transform {

  position: Vector2d;
  saved_positions: Vector2d[];
  rotation: number;
  saved_rotations: number[];

  constructor() {
    this.position = [0,0];
    this.rotation = 0;
    this.saved_positions = [];
    this.saved_rotations = [];
  }

  apply = (geometry: Geometry): Geometry =>
    Object.assign(
      geometry,
      {
        position: [...this.position],
        rotation: this.rotation,
      },
    );

  save() {
    this.saved_positions.push([this.position[0], this.position[1]]);
    this.saved_rotations.push(this.rotation);
  }

  restore() {
    if (this.saved_positions.length) {
      const pos = this.saved_positions.pop();
      const rot = this.saved_rotations.pop();
      this.position[0] = (pos as Vector2d)[0];
      this.position[1] = (pos as Vector2d)[1];
      this.rotation = rot as number;
    }
  }

}
