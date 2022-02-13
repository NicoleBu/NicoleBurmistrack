namespace RestaurantSimulation{
    export class Lahmacun extends Meal{
        constructor() {
            super("Lahmacun_fertig");
            this.requires = [ "Zwiebel_ganz", "Lahmacunteig_gebacken", "Tomate_ganz", "Kebabfleisch_roh", "Peperoni"];
            this.contains = ["Lahmacunteig_gebacken"];
        }
    }
}