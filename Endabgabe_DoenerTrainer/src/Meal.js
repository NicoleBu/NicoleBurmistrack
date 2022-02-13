"use strict";
var RestaurantSimulation;
(function (RestaurantSimulation) {
    class Meal {
        name;
        requires = [];
        contains = [];
        finished = false;
        constructor(itemName) {
            this.name = itemName;
        }
    }
    RestaurantSimulation.Meal = Meal;
})(RestaurantSimulation || (RestaurantSimulation = {}));
//# sourceMappingURL=Meal.js.map