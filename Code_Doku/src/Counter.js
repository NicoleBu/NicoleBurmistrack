"use strict";
var RestaurantSimulation;
(function (RestaurantSimulation) {
    class Counter extends RestaurantSimulation.Entity {
        //Entweder liegt ein Meal auf dem Tresen, oder nicht (null)
        has = null;
        constructor(pos) {
            super(pos);
        }
    }
    RestaurantSimulation.Counter = Counter;
})(RestaurantSimulation || (RestaurantSimulation = {}));
//# sourceMappingURL=Counter.js.map