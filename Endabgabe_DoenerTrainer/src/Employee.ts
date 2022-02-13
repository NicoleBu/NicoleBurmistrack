namespace RestaurantSimulation {
    export class Employee extends Entity {
        public speed: number = 2;
        public carries: Item | Meal | null = null;
        public mood: "gestresst" | "normal" | "schlaefrig" = "normal"
        public target: Workplace | Storage | Place | Counter | Bin | null = null;
        public lastMove: Date | null = null;
        public stress: boolean = false;

        constructor(pos: Vector) {
            super(pos);
        }

        public updateMood(time: number){
            if(!this.lastMove){
                return;
            }
            let timeInMs = time * 1000;
            if(this.lastMove.getTime() + timeInMs < new Date().getTime()){
                this.mood = "schlaefrig";
            }
            else if (this.stress){
                this.mood = "gestresst";
            }
            else{
                this.mood = "normal";
            }
        }

        public reachTarget(){
            this.reach();
            this.target = null;
        }

        public reach(){
            if(this.target instanceof Bin){
                this.carries = null;
                return;
            }
            if(this.target instanceof Workplace){
                if(this.carries === null){
                    if(this.target.meal){
                        if(this.target.meal instanceof Yufka){
                            this.carries = new Yufka();
                        }
                        if(this.target.meal instanceof Doener){
                            this.carries = new Doener();
                        }
                        if(this.target.meal instanceof Lahmacun){
                            this.carries = new Lahmacun();
                        }
                        (<Meal>this.carries).finished = this.target.meal.finished;
                        this.target.meal.contains = [];
                        this.target.meal.finished = false;
                    }
                    return;
                }
                if(this.carries instanceof Item){
                    if(this.target.meal){
                        let itemsLeft = this.target.meal.requires.filter((item: string) => this.target instanceof Workplace && this.target.meal && this.target.meal.contains.indexOf(item) === -1);
                        console.log(itemsLeft);
                        if(itemsLeft.indexOf(this.carries.name) === -1){
                            console.error("item not needed");
                            return;
                        }
                        this.target.meal.contains.push(this.carries.name);
                        this.carries = null;
                        if(this.target.meal.contains.length === this.target.meal.requires.length){
                            this.target.meal.finished = true;
                        }
                    }

                }
                return;
            }
            if(this.target instanceof Storage){
                if(this.carries instanceof Item){
                    if(this.target.stores.name === this.carries.name){
                        console.log("put back");
                        this.carries = null;
                        this.target.amount += 1;
                    }
                    return;
                }
                if(this.carries === null){
                    if(this.target.amount >= 1){
                        this.carries = new Item(this.target.stores.name);
                        this.target.amount -= 1;
                    }
                    else{
                        console.error("storage empty");
                    }
                }
                return;
            }
            if(this.target instanceof Place || this.target instanceof Counter){
                if(this.carries instanceof Meal){
                    this.target.has = this.carries;
                    this.carries = null;
                    console.log(this.target);
                    console.log(this.carries);
                    return;
                }
                if(this.carries === null && this.target.has instanceof Meal){
                    this.carries = this.target.has;
                    this.target.has = null;
                    return;
                }
            }
        }
    }
}