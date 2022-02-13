namespace RestaurantSimulation{
    export class Storage extends Entity{
        stores: Item;
        constructor(contains: Item, public amount: number, pos: Vector) {
            super(pos);
            this.stores = contains;
        }
    }
}