namespace RestaurantSimulation{
    export class Meal {
        public readonly name: string;
        public requires: string[] = [];
        public contains: string[] = [];
        public finished: boolean = false;

        constructor(itemName: string) {
            this.name = itemName;
        }

    }
}