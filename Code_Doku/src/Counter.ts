namespace RestaurantSimulation{
    export class Counter extends Entity{
        //Entweder liegt ein Meal auf dem Tresen, oder nicht (null)
        public has: Meal | null = null;

        constructor(pos: Vector) {
            super(pos);
        }
    }
}