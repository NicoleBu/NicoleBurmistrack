"use strict";
var RestaurantSimulation;
(function (RestaurantSimulation) {
    const customer_waiting_time_seconds = 20;
    class Customer extends RestaurantSimulation.Entity {
        targetPos;
        wants;
        mood = "zufrieden";
        speed = 1;
        waitingSince = null;
        status = "coming";
        carries = null;
        deleted = false;
        constructor(pos, targetPos, wants) {
            super(pos);
            this.targetPos = targetPos;
            this.wants = wants;
        }
        /**
         * Customer erreicht sein Ziel.
         * @param counter
         */
        targetReached(counter) {
            this.targetPos = null;
            //coming -> waiting
            if (this.status === "coming") {
                this.status = "waiting";
                this.waitingSince = new Date();
                return;
            }
            //waytocounter -> leaving, Kunde nimmt Meal vom Counter
            if (this.status === "waytocounter" && counter) {
                this.status = "leaving";
                this.carries = counter.has;
                counter.has = null;
                if (this.carries && this.carries.finished) {
                    this.mood = "zufrieden";
                }
                else {
                    this.mood = "veraergert";
                }
                this.targetPos = new RestaurantSimulation.Vector(270, 780);
                return;
            }
            //leaving -> deletion, Kunde wird gelöscht wenn er am Ausgang angekommen ist
            if (this.status === "leaving") {
                this.deleted = true;
            }
        }
        /**
         * Laune des Kunden aktualisieren
         */
        updateMood() {
            //wenn der Kunde wartet und zufrieden ist, aber zu lange wartet, dann auf genervt setzen
            if (this.status === "waiting" && this.mood === "zufrieden" && this.waitingSince) {
                if (this.waitingSince.getTime() + (customer_waiting_time_seconds * 1000) < new Date().getTime()) {
                    this.mood = "genervt";
                    this.waitingSince = new Date();
                }
            }
            //wenn der Kunde wartet und genervt ist, aber zu lange wartet, dann auf genervt setzen
            if (this.status === "waiting" && this.mood === "genervt" && this.waitingSince) {
                if (this.waitingSince.getTime() + (customer_waiting_time_seconds * 1000) < new Date().getTime()) {
                    this.mood = "veraergert";
                }
            }
        }
    }
    RestaurantSimulation.Customer = Customer;
})(RestaurantSimulation || (RestaurantSimulation = {}));
//# sourceMappingURL=Customer.js.map