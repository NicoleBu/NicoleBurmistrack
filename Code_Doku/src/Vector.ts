namespace RestaurantSimulation{
    export class Vector {
        public x: number;
        public y: number;

        constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
        }

        /**
         * Die Mitte eines Objektes zurückgeben, da alle Objekte so grob 40-50 breit und hoch sind.
         */
        public middle(){
            return new Vector(this.x+25, this.y+25);
        }

        /**
         * Anderen Vektor auf den bestehenden Vektor draufaddieren (multipliziert mit Geschwindigkeit)
         * @param dir
         * @param speed
         */
        public addVector(dir: Vector, speed: number){
            this.x += dir.x * speed;
            this.y += dir.y * speed;
        }

        /**
         * Distanz zu einem Vektor berechnen
         * @param vec
         */
        public distanceToVector(vec: Vector){
            return Math.sqrt(Math.pow(vec.x-this.x,2) + Math.pow(vec.y - this.y, 2));
        }

        /**
         * normalisierten Richtungsvektor zurückgeben zu einem Zielvektor
         * @param vec
         */
        public directionVector(vec: Vector){
            let distanceVector = new Vector(vec.x-this.x, vec.y-this.y);
            return new Vector(distanceVector.x*(1/Math.sqrt(Math.pow(distanceVector.x,2) + Math.pow(distanceVector.y, 2))), distanceVector.y*(1/Math.sqrt(Math.pow(distanceVector.x,2) + Math.pow(distanceVector.y, 2))));
        }


    }
}