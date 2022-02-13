namespace RestaurantSimulation{
    export class Place extends Entity{
        public has: Meal | null = null;
        constructor(pos: Vector) {
            super(pos);
        }
    }
}