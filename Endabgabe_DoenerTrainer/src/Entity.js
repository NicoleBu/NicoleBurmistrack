"use strict";
var RestaurantSimulation;
(function (RestaurantSimulation) {
    class Entity {
        position;
        constructor(initPos) {
            this.position = new RestaurantSimulation.Vector(initPos.x, initPos.y);
        }
    }
    RestaurantSimulation.Entity = Entity;
})(RestaurantSimulation || (RestaurantSimulation = {}));
//# sourceMappingURL=Entity.js.map