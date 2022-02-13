"use strict";
var RestaurantSimulation;
(function (RestaurantSimulation) {
    class Counter extends RestaurantSimulation.Entity {
        has = null;
        constructor(pos) {
            super(pos);
        }
    }
    RestaurantSimulation.Counter = Counter;
})(RestaurantSimulation || (RestaurantSimulation = {}));
//# sourceMappingURL=Counter.js.map