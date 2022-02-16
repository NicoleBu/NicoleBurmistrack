namespace RestaurantSimulation{
    // Klasse Bin erbt von Klasse Entity. Entity braucht Vector um erzeugt zu werden. Super-Call führt dazu, dass bei Erzeugung von Klasse erst die Super-Klasse angesteuert wird
    export class Bin extends Entity{
        constructor( pos: Vector) {
            super(pos);
        }
    }
}
