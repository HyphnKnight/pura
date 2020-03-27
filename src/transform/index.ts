import { Geometry } from '../geometry';
import { Vector2d } from '../vector';


export class Transform {
  public position: Vector2d = [0,0];
  public savedPositions: Vector2d[] = [];
  public rotation: number = 0;
  public savedRotations: number[] = [];

  public apply = (geometry: Geometry): Geometry =>
    Object.assign(
      geometry,
      {
        position: [...this.position],
        rotation: this.rotation,
      },
    );

  public save() {
    this.savedPositions.push([this.position[0], this.position[1]]);
    this.savedRotations.push(this.rotation);
  }

  public restore() {
    if (this.savedPositions.length) {
      const pos = this.savedPositions.pop();
      const rot = this.savedRotations.pop();
      this.position[0] = (pos as Vector2d)[0];
      this.position[1] = (pos as Vector2d)[1];
      this.rotation = rot as number;
    }
  }

}
