export class Transform {
    constructor() {
        this.apply = (geometry) => Object.assign(geometry, {
            position: [...this.position],
            rotation: this.rotation,
        });
        this.position = [0, 0];
        this.rotation = 0;
        this.saved_positions = [];
        this.saved_rotations = [];
    }
    save() {
        this.saved_positions.push([this.position[0], this.position[1]]);
        this.saved_rotations.push(this.rotation);
    }
    restore() {
        if (this.saved_positions.length) {
            const pos = this.saved_positions.pop();
            const rot = this.saved_rotations.pop();
            this.position[0] = pos[0];
            this.position[1] = pos[1];
            this.rotation = rot;
        }
    }
}
