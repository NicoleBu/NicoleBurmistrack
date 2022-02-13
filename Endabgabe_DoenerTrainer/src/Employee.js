"use strict";
var RestaurantSimulation;
(function (RestaurantSimulation) {
    class Employee extends RestaurantSimulation.Entity {
        speed = 2;
        carries = null;
        mood = "normal";
        target = null;
        lastMove = null;
        stress = false;
        constructor(pos) {
            super(pos);
        }
        updateMood(time) {
            if (!this.lastMove) {
                return;
            }
            let timeInMs = time * 1000;
            if (this.lastMove.getTime() + timeInMs < new Date().getTime()) {
                this.mood = "schlaefrig";
            }
            else if (this.stress) {
                this.mood = "gestresst";
            }
            else {
                this.mood = "normal";
            }
        }
        reachTarget() {
            this.reach();
            this.target = null;
        }
        reach() {
            if (this.target instanceof RestaurantSimulation.Bin) {
                this.carries = null;
                return;
            }
            if (this.target instanceof RestaurantSimulation.Workplace) {
                if (this.carries === null) {
                    if (this.target.meal) {
                        if (this.target.meal instanceof RestaurantSimulation.Yufka) {
                            this.carries = new RestaurantSimulation.Yufka();
                        }
                        if (this.target.meal instanceof RestaurantSimulation.Doener) {
                            this.carries = new RestaurantSimulation.Doener();
                        }
                        if (this.target.meal instanceof RestaurantSimulation.Lahmacun) {
                            this.carries = new RestaurantSimulation.Lahmacun();
                        }
                        this.carries.finished = this.target.meal.finished;
                        this.target.meal.contains = [];
                        this.target.meal.finished = false;
                    }
                    return;
                }
                if (this.carries instanceof RestaurantSimulation.Item) {
                    if (this.target.meal) {
                        let itemsLeft = this.target.meal.requires.filter((item) => this.target instanceof RestaurantSimulation.Workplace && this.target.meal && this.target.meal.contains.indexOf(item) === -1);
                        console.log(itemsLeft);
                        if (itemsLeft.indexOf(this.carries.name) === -1) {
                            console.error("item not needed");
                            return;
                        }
                        this.target.meal.contains.push(this.carries.name);
                        this.carries = null;
                        if (this.target.meal.contains.length === this.target.meal.requires.length) {
                            this.target.meal.finished = true;
                        }
                    }
                }
                return;
            }
            if (this.target instanceof RestaurantSimulation.Storage) {
                if (this.carries instanceof RestaurantSimulation.Item) {
                    if (this.target.stores.name === this.carries.name) {
                        console.log("put back");
                        this.carries = null;
                        this.target.amount += 1;
                    }
                    return;
                }
                if (this.carries === null) {
                    if (this.target.amount >= 1) {
                        this.carries = new RestaurantSimulation.Item(this.target.stores.name);
                        this.target.amount -= 1;
                    }
                    else {
                        console.error("storage empty");
                    }
                }
                return;
            }
            if (this.target instanceof RestaurantSimulation.Place || this.target instanceof RestaurantSimulation.Counter) {
                if (this.carries instanceof RestaurantSimulation.Meal) {
                    this.target.has = this.carries;
                    this.carries = null;
                    console.log(this.target);
                    console.log(this.carries);
                    return;
                }
                if (this.carries === null && this.target.has instanceof RestaurantSimulation.Meal) {
                    this.carries = this.target.has;
                    this.target.has = null;
                    return;
                }
            }
        }
    }
    RestaurantSimulation.Employee = Employee;
})(RestaurantSimulation || (RestaurantSimulation = {}));
//# sourceMappingURL=Employee.js.map