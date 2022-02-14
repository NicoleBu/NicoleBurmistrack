"use strict";
var RestaurantSimulation;
(function (RestaurantSimulation) {
    class Lahmacun extends RestaurantSimulation.Meal {
        constructor() {
            super("Lahmacun_fertig");
            this.requires = ["Zwiebel_ganz", "Lahmacunteig_gebacken", "Tomate_ganz", "Kebabfleisch_roh", "Peperoni"];
            this.contains = ["Lahmacunteig_gebacken"];
        }
    }
    RestaurantSimulation.Lahmacun = Lahmacun;
})(RestaurantSimulation || (RestaurantSimulation = {}));
//# sourceMappingURL=Lahmacun.js.map