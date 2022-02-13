namespace RestaurantSimulation{
    export class Entity{
        public position: Vector;

        constructor(initPos: Vector) {
            this.position = new Vector(initPos.x, initPos.y);
        }
    }
}