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

        public targetReached(counter: Counter | null){
            this.targetPos = null;
            if(this.status === "coming"){
                this.status = "waiting";
                this.waitingSince = new Date();
                return;
            }
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
            if(this.status === "leaving"){
                this.deleted = true;
            }
        }

        public updateMood(){
            if(this.status === "waiting" && this.mood === "zufrieden" && this.waitingSince){
                if(this.waitingSince.getTime() + (customer_waiting_time_seconds * 1000) < new Date().getTime()){
                    this.mood = "genervt";
                    this.waitingSince = new Date();
                }
            }
            if(this.status === "waiting" && this.mood === "genervt" && this.waitingSince){
                if(this.waitingSince.getTime() + (customer_waiting_time_seconds * 1000) < new Date().getTime()){
                    this.mood = "veraergert";
                }
            }
        }

    }
}