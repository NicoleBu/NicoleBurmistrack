"use strict";
var RestaurantSimulation;
(function (RestaurantSimulation) {
    class Workplace extends RestaurantSimulation.Entity {
        meal = null;
        constructor(workOn, initPos) {
            super(initPos);
            this.meal = workOn;
        }
    }
    RestaurantSimulation.Workplace = Workplace;
})(RestaurantSimulation || (RestaurantSimulation = {}));
//# sourceMappingURL=WorkPlace.js.map