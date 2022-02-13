"use strict";
var RestaurantSimulation;
(function (RestaurantSimulation) {
    class Place extends RestaurantSimulation.Entity {
        has = null;
        constructor(pos) {
            super(pos);
        }
    }
    RestaurantSimulation.Place = Place;
})(RestaurantSimulation || (RestaurantSimulation = {}));
//# sourceMappingURL=Place.js.map