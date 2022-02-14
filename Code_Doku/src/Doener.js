"use strict";
var RestaurantSimulation;
(function (RestaurantSimulation) {
    class Doener extends RestaurantSimulation.Meal {
        constructor() {
            super("Doener_fertig");
            this.requires = ["Zwiebel_ganz", "Tomate_ganz", "Kebabfleisch_roh", "Salat_ganz"];
            this.contains = [];
        }
    }
    RestaurantSimulation.Doener = Doener;
})(RestaurantSimulation || (RestaurantSimulation = {}));
//# sourceMappingURL=Doener.js.map