namespace RestaurantSimulation{
    export class Doener extends Meal{
        constructor() {
            super("Doener_fertig");
            this.requires = [ "Zwiebel_ganz", "Tomate_ganz", "Kebabfleisch_roh", "Salat_ganz"];
            this.contains = [];
        }
    }
}