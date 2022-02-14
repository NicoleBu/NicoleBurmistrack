namespace RestaurantSimulation{
    const customer_waiting_time_seconds = 20;

    export class Customer extends Entity{
        public mood: "genervt" | "zufrieden" | "veraergert" = "zufrieden";
        public speed: number = 1;
        public waitingSince: Date | null = null;
        public status : "waiting" | "leaving" | "coming" | "waytocounter" = "coming";
        public carries: Meal | null = null;
        public deleted: boolean = false;

        constructor(pos: Vector, public targetPos: Vector | null, public wants: Meal) {
            super(pos);
        }

        /**
         * Customer erreicht sein Ziel.
         * @param counter
         */
        public targetReached(counter: Counter | null){
            this.targetPos = null;
            //coming -> waiting
            if(this.status === "coming"){
                this.status = "waiting";
                this.waitingSince = new Date();
                return;
            }
            //waytocounter -> leaving, Kunde nimmt Meal vom Counter
            if(this.status === "waytocounter" && counter){
                this.status = "leaving";
                this.carries = counter.has;
                counter.has = null;
                if(this.carries && this.carries.finished){
                    this.mood = "zufrieden";
                }
                else{
                    this.mood = "veraergert";
                }
                this.targetPos = new Vector(270, 780);
                return;
            }
            //leaving -> deletion, Kunde wird gelöscht wenn er am Ausgang angekommen ist
            if(this.status === "leaving"){
                this.deleted = true;
            }
        }

        /**
         * Laune des Kunden aktualisieren
         */
        public updateMood(){
            //wenn der Kunde wartet und zufrieden ist, aber zu lange wartet, dann auf genervt setzen
            if(this.status === "waiting" && this.mood === "zufrieden" && this.waitingSince){
                if(this.waitingSince.getTime() + (customer_waiting_time_seconds * 1000) < new Date().getTime()){
                    this.mood = "genervt";
                    this.waitingSince = new Date();
                }
            }
            //wenn der Kunde wartet und genervt ist, aber zu lange wartet, dann auf genervt setzen
            if(this.status === "waiting" && this.mood === "genervt" && this.waitingSince){
                if(this.waitingSince.getTime() + (customer_waiting_time_seconds * 1000) < new Date().getTime()){
                    this.mood = "veraergert";
                }
            }
        }

    }
}