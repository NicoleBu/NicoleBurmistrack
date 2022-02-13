namespace RestaurantSimulation{
    export class Counter extends Entity{
        public has: Meal | null = null;

        constructor(pos: Vector) {
            super(pos);
        }
    }
}