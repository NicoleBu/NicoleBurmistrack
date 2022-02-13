namespace RestaurantSimulation{
    export class Yufka extends Meal{
        constructor() {
            super("Yufka_fertig");
            this.requires = [ "Zwiebel_ganz", "Tomate_ganz", "Kebabfleisch_roh", "Salat_ganz", "Mais_ganz"];
            this.contains = [];
        }
    }
}