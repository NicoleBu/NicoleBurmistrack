"use strict";
var RestaurantSimulation;
(function (RestaurantSimulation) {
    class Vector {
        x;
        y;
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
        middle() {
            return new Vector(this.x + 25, this.y + 25);
        }
        addVector(dir, speed) {
            this.x += dir.x * speed;
            this.y += dir.y * speed;
        }
        distanceToVector(vec) {
            return Math.sqrt(Math.pow(vec.x - this.x, 2) + Math.pow(vec.y - this.y, 2));
        }
        directionVector(vec) {
            let distanceVector = new Vector(vec.x - this.x, vec.y - this.y);
            return new Vector(distanceVector.x * (1 / Math.sqrt(Math.pow(distanceVector.x, 2) + Math.pow(distanceVector.y, 2))), distanceVector.y * (1 / Math.sqrt(Math.pow(distanceVector.x, 2) + Math.pow(distanceVector.y, 2))));
        }
    }
    RestaurantSimulation.Vector = Vector;
})(RestaurantSimulation || (RestaurantSimulation = {}));
//# sourceMappingURL=Vector.js.map