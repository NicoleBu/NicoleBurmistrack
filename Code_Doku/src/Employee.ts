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

        /**
         * Laune eines Mitarbeiters aktualisieren
         * @param time
         */
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

        /**
         * Employee kommt am Ziel an
         */
        public reachTarget(){
            //reach ausführen um Funktion je nach Target zu berechnen
            this.reach();
            //wenn der Mitarbeiter angekommen ist, immer das Ziel entfernen
            this.target = null;
        }

        public reach(){
            //Mitarbeiter kommt am Mülleimer an
            if(this.target instanceof Bin){
                this.carries = null;
                return;
            }
            //Mitarbeiter kommt am Workplace an
            if(this.target instanceof Workplace){
                //Mitarbeiter trägt nichts -> das vom Workplace aufheben
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
                //Mitarbeiter trägt etwas, d.h. Item versuchen ins Meal zu verarbeiten
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
            //Miarbeiter kommt am Lager an
            if(this.target instanceof Storage){
                //Mitarbeiter trägt etwas, versuchen das Item zurückzulegen
                if(this.carries instanceof Item){
                    if(this.target.stores.name === this.carries.name){
                        console.log("put back");
                        this.carries = null;
                        this.target.amount += 1;
                    }
                    return;
                }
                //Mitarbeiter trägt nichts, versuchen etwas aus dem Lager zu nehmen
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
            //Mitarbeiter kommt am Place oder Counter an
            if(this.target instanceof Place || this.target instanceof Counter){
                //wenn der Mitarbeitet etwas trägt, dann das Meal liegenlassen
                if(this.carries instanceof Meal){
                    this.target.has = this.carries;
                    this.carries = null;
                    console.log(this.target);
                    console.log(this.carries);
                    return;
                }
                //wenn der Mitarbeiter nichts trägt, dann das Meal aufheben
                if(this.carries === null && this.target.has instanceof Meal){
                    this.carries = this.target.has;
                    this.target.has = null;
                    return;
                }
            }
        }
    }
}