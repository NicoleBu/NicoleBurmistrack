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
        targetReached(counter) {
            this.targetPos = null;
            if (this.status === "coming") {
                this.status = "waiting";
                this.waitingSince = new Date();
                return;
            }
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
            if (this.status === "leaving") {
                this.deleted = true;
            }
        }
        updateMood() {
            if (this.status === "waiting" && this.mood === "zufrieden" && this.waitingSince) {
                if (this.waitingSince.getTime() + (customer_waiting_time_seconds * 1000) < new Date().getTime()) {
                    this.mood = "genervt";
                    this.waitingSince = new Date();
                }
            }
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