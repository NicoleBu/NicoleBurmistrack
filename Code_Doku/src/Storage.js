"use strict";
var RestaurantSimulation;
(function (RestaurantSimulation) {
    class Storage extends RestaurantSimulation.Entity {
        amount;
        stores;
        constructor(contains, amount, pos) {
            super(pos);
            this.amount = amount;
            this.stores = contains;
        }
    }
    RestaurantSimulation.Storage = Storage;
})(RestaurantSimulation || (RestaurantSimulation = {}));
//# sourceMappingURL=Storage.js.map