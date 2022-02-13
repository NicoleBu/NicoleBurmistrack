namespace RestaurantSimulation{
    export class Workplace extends Entity{
        public meal: Meal | null = null;
        constructor(workOn: Meal | null, initPos: Vector) {
            super(initPos);
            this.meal = workOn;
        }
    }
}