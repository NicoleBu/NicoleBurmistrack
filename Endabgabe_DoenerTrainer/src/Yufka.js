"use strict";
var RestaurantSimulation;
(function (RestaurantSimulation) {
    class Yufka extends RestaurantSimulation.Meal {
        constructor() {
            super("Yufka_fertig");
            this.requires = ["Zwiebel_ganz", "Tomate_ganz", "Kebabfleisch_roh", "Salat_ganz", "Mais_ganz"];
            this.contains = [];
        }
    }
    RestaurantSimulation.Yufka = Yufka;
})(RestaurantSimulation || (RestaurantSimulation = {}));
//# sourceMappingURL=Yufka.js.map