namespace RestaurantSimulation {
    const images = [
        'Doenerbrot_gebacken.png',
        'Doenerbrot_roh.png',
        'Doener_fertig.png',
        'Fladenbrot_gebacken.png',
        'Fladenbrot_roh.png',
        'Gurke_ganz.png',
        'Gurke_geschnitten.png',
        'Kebabfleisch_geschnitten.png',
        'Kebabfleisch_roh.png',
        'Kunde_genervt.png',
        'Kunde_veraergert.png',
        'Kunde_zufrieden.png',
        'Lahmacunteig_gebacken.png',
        'Lahmacunteig_roh.png',
        'Lahmacun_fertig.png',
        'Mais_ganz.png',
        'Mais_verarbeitet.png',
        'Mitarbeiter_gestresst.png',
        'Mitarbeiter_normal.png',
        'Mitarbeiter_schlaefrig.png',
        'Peperoni.png',
        'Salat_ganz.png',
        'Salat_verarbeitet.png',
        'Tomate_ganz.png',
        'Tomate_verarbeitet.png',
        'Yufka_fertig.png',
        'Grundriss.png',
        'Muell.png',
        'Zwiebel_ganz.png',
        'cancel.png',
        'check.png'
    ];

    export class Trainer {
        private entityList: Entity[] = [];
        private debug: boolean = false;
        private images: Record<string, HTMLImageElement> = {};
        private selection: Customer | Employee | null = null;
        private customerInterval: number | null = null;
        private counter : Counter | null = null;

        private nextCustomer: Customer | null = null;

        private yufkaCount: number = 0;
        private doenerCount: number = 0;
        private lahmaCount: number = 0;

        constructor(private customerTime: number, private employeeCount: number, private storageAmount: number, private employeeTiredTime: number, private map: CanvasRenderingContext2D, private canvas: HTMLCanvasElement) {
            this.loadTrainer();
        }

        private async loadTrainer() {
            this.hideStartUI();
            await this.loadImages();
            this.loadCanvas();
            this.setEvents();

            this.loadWorkplaces();
            this.loadStorages();
            this.loadCounter();
            this.loadMealPlaces();
            this.loadHumans();
            this.loadTrashBin();
            requestAnimationFrame(this.update.bind(this));
        }

        private hideStartUI(){
            const start = document.getElementById("start");
            const root = document.getElementById("root");
            if(!start || !root){
                return;
            }
            start.style.display = "none";
            root.style.visibility = "visible";
        }

        private setEvents(){
            this.canvas.addEventListener('contextmenu', this.rightClick.bind(this));
            this.canvas.addEventListener('click', this.leftClick.bind(this));

            if(this.debug){
                this.canvas.addEventListener('pointermove', this.move.bind(this));
            }

            const exit = document.getElementById("exit");
            if(!exit){
                return;
            }
            exit.addEventListener("click", () =>{
                window.location.reload();
            });
        }

        private move(evt: MouseEvent){
            console.log(evt.offsetX, evt.offsetY);
        }

        private getEntityFromXY(x: number, y: number, findOnlyHuman: boolean = false){
            let vec = new Vector(x, y);
            let found = null;
            let distFound = null;
            for(let ent of this.entityList){
                if(findOnlyHuman){
                    if(!(ent instanceof Employee || ent instanceof Customer)){
                        continue;
                    }
                }
                let dist = vec.distanceToVector(ent.position.middle());

                if((!found && dist <= 45) || (found && distFound && dist <= distFound)){
                    found = ent;
                    distFound = dist;
                }
            }
            return found;
        }

        private leftClick(evt: MouseEvent){
            let ent = this.getEntityFromXY(evt.offsetX, evt.offsetY, true) as Customer | Employee | null;
            if(ent){
                this.selection = ent;
                console.log("changed selection to ", ent);
            }
            else{
                this.selection = null;
            }
        }

        private rightClick(evt: MouseEvent){
            evt.preventDefault();
            let ent = this.getEntityFromXY(evt.offsetX, evt.offsetY);
            if(!ent){
                return;
            }
            if(this.selection instanceof Employee && this.selection.target === null && this.selection !== ent){
                if(ent instanceof Storage || ent instanceof Workplace || ent instanceof Place || ent instanceof Counter || ent instanceof Bin){
                    this.selection.target = ent;
                }
            }
        }

        private loadImage(name: string){
            return new Promise((resolve) =>{
                let img = new Image();
                img.src = "images/" + name;
                img.onload = () =>{
                  resolve(img);
                };
                this.images[name] = img;
            });
        }

        private async loadImages() {
            for (let name of images) {
                await this.loadImage(name);
            }
        }

        private loadHumans() {
            for(let i = 0; i<this.employeeCount; i++){
                let x = 120+i*55;
                let y = 330;
                let emp = new Employee(new Vector(x, y));
                this.entityList.push(emp);
            }
            this.loadCustomers();
            this.customerInterval = setInterval(this.loadCustomers.bind(this), 60 * 1000);
        }



        private loadCustomers(){
            for(let i = 0; i<this.customerTime; i++){
                let meals = [new Yufka(), new Lahmacun(), new Doener()];
                let random = Math.floor(Math.random()*meals.length);

                let randomTargetX = Math.floor(Math.random()*(577-16))+16;
                let randomTargetY = Math.floor(Math.random()*(771-518))+518;
                let randomPos = new Vector(randomTargetX, randomTargetY);
                let cust = new Customer(new Vector(270, 780), randomPos, meals[random]);
                if(!this.nextCustomer){
                    this.nextCustomer = cust;
                }
                this.entityList.push(cust);
            }
        }

        private updateEmployee(ent: Employee) {
            if (!this.map) {
                return;
            }
            ent.stress = false;
            if(ent.target){
                let dir = ent.position.directionVector(ent.target.position);
                ent.position.addVector(dir, ent.speed);
                ent.lastMove = new Date();
                let dist = ent.position.distanceToVector(ent.target.position);
                ent.stress = true;
                if(dist <= 10){
                    console.log("emp reached target");
                    ent.reachTarget();
                }
            }
            ent.updateMood(this.employeeTiredTime);
            let img = this.getImage("Mitarbeiter_"+ent.mood);
            if (!img) {
                return;
            }
            this.map.fillStyle = "lightgrey";
            this.map.drawImage(img, ent.position.x, ent.position.y, 45, 45);
            if (ent.carries) {
                let img = this.getImage(ent.carries.name);
                if (!img) {
                    return;
                }
                this.map.drawImage(img, ent.position.x + 25, ent.position.y, 20, 20);
            }
        }

        private updateCustomer(ent: Customer) {
            if (!this.map) {
                return;
            }
            if(ent.deleted){
                if(ent.carries && ent.carries instanceof Yufka && ent.carries.finished){
                    this.yufkaCount++;
                }
                if(ent.carries && ent.carries instanceof Doener && ent.carries.finished){
                    this.yufkaCount++;
                }
                if(ent.carries && ent.carries instanceof Lahmacun && ent.carries.finished){
                    this.yufkaCount++;
                }
                let i = this.entityList.findIndex((entity: Entity) => entity === ent);
                if(i === -1){
                    return;
                }
                this.entityList.splice(i, 1);
                this.nextCustomer = null;
                return;
            }
            if(ent.targetPos){
                let dir = ent.position.directionVector(ent.targetPos);
                ent.position.addVector(dir, ent.speed);
                let dist = ent.position.distanceToVector(ent.targetPos);
                if(dist <= 3){
                    ent.targetReached(this.counter);
                }
            }
            ent.updateMood();
            let img = this.getImage("Kunde_"+ent.mood);
            if (!img) {
                return;
            }
            this.map.drawImage(img, ent.position.x, ent.position.y, 45, 45);
            if (ent.wants) {
                let img = this.getImage(ent.wants.name);
                if (!img) {
                    return;
                }
                this.map.drawImage(img, ent.position.x + 25, ent.position.y+25, 20, 20);
            }
        }

        private getImage(name:string){
            return this.images[name+".png"];
        }

        private update() {
            if (!this.map) {
                return;
            }
            this.map.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.loadCanvas();

            this.updateScores();

            if(!this.nextCustomer){
                let cust = this.entityList.find((ent: Entity) => ent instanceof Customer) as Customer;
                if(cust){
                    this.nextCustomer = cust;
                }
            }

            for(let ent of this.entityList){
                if(this.selection === ent){
                    this.highlight(ent);
                }
                if(this.nextCustomer === ent){
                    this.highlightNext(ent as Customer);
                }
                if(ent instanceof Customer ){
                    this.updateCustomer(ent);
                }
                if(ent instanceof Workplace){
                    this.updateWorkplace(ent);
                }
                if(ent instanceof Employee ){
                    this.updateEmployee(ent);
                }
                if(ent instanceof Storage){
                    this.updateStorage(ent);
                }
                if(ent instanceof Bin){
                    this.updateBin(ent);
                }
                if(ent instanceof Counter || ent instanceof Place){
                    this.updateCounterOrPlace(ent);
                }
            }

            if(this.counter && this.counter.has && this.nextCustomer && !this.nextCustomer.targetPos && this.nextCustomer.status === "waiting"){
                this.nextCustomer.targetPos = this.counter.position;
                this.nextCustomer.status = "waytocounter";
            }
            requestAnimationFrame(this.update.bind(this));
        }

        private updateBin(ent: Bin){
            this.map.drawImage(this.getImage("Muell"), ent.position.x, ent.position.y, 40, 40);
        }

        private updateCounterOrPlace(ent: Counter | Place){
            this.map.beginPath();
            this.map.strokeStyle = "brown";
            this.map.lineWidth = 3;
            this.map.rect(ent.position.x, ent.position.y, 65, 45);
            if(ent.has){
                this.map.drawImage(this.getImage(ent.has.name), ent.position.x+10, ent.position.y+2, 40, 40)
            }
            this.map.stroke();
        }

        private highlightNext(ent: Customer){
            this.map.beginPath();
            this.map.strokeStyle = "green";
            this.map.lineWidth = 5;
            this.map.arc(ent.position.x+22, ent.position.y+22, 25, 0, 2*Math.PI);
            this.map.stroke();
        }

        private highlight(ent: Entity){
            this.map.beginPath();
            this.map.lineWidth = 3;
            this.map.rect(ent.position.x-2, ent.position.y-2, 49, 49);
            this.map.stroke();
        }

        private updateScores(){
            let moods = ["genervt", "veraergert", "zufrieden", "gestresst", "normal", "schlaefrig"];
            for(let mood of moods){
                const elem = document.getElementById(mood) as HTMLInputElement;
                if(!elem){
                    continue;
                }
                let count = this.entityList.filter((ent: Entity) => {
                   return (ent instanceof Customer || ent instanceof Employee) && ent.mood === mood;
                }).length;
                elem.value = count.toString();
            }
            let yufkaC = document.getElementById("yufka_count") as HTMLInputElement;
            let doenerC = document.getElementById("doener_count") as HTMLInputElement;
            let lahmaC = document.getElementById("lahmacun_count") as HTMLInputElement;
            let gesamt = document.getElementById("gesamt_count") as HTMLInputElement;
            if(!yufkaC || !doenerC || !lahmaC){
                return;
            }
            yufkaC.value = this.yufkaCount.toString();
            doenerC.value = this.doenerCount.toString();
            lahmaC.value = this.lahmaCount.toString();
            gesamt.value = (this.yufkaCount + this.doenerCount + this.lahmaCount).toString();
        }

        private updateWorkplace(ent: Workplace) {
            if (!ent.meal) {
                return;
            }
            this.map.drawImage(this.getImage(ent.meal.name), ent.position.x + 5, ent.position.y + 5, 30, 30);
            if(ent.meal.finished){
                this.map.drawImage(this.getImage('check'), ent.position.x+35, ent.position.y+20, 15,15);
            }
            else{
                this.map.drawImage(this.getImage('cancel'), ent.position.x+35, ent.position.y+20, 15,15);
            }
        }

        private updateStorage(ent: Storage) {
            this.map.drawImage(this.getImage(ent.stores.name), ent.position.x + 5, ent.position.y + 1, 30, 30)
        }

        private loadCanvas() {
            this.map.drawImage(this.getImage("Grundriss"), 0, 0, 600, 800);
        }


        private loadWorkplaces() {
            this.map.fillStyle = "lightgrey";
            this.entityList.push(new Workplace(new Yufka(), new Vector(370, 20)));
            this.entityList.push(new Workplace(new Doener(), new Vector(450, 20)));
            this.entityList.push(new Workplace(new Lahmacun(), new Vector(525, 20)));
        }

        private loadStorages() {
            this.entityList.push(new Storage(new Item("Tomate_ganz"), this.storageAmount, new Vector(72,22)));
            this.entityList.push(new Storage(new Item("Zwiebel_ganz"), this.storageAmount, new Vector(118,22)));
            this.entityList.push(new Storage(new Item("Peperoni"), this.storageAmount, new Vector(164,22)));
            this.entityList.push(new Storage(new Item("Gurke_ganz"), this.storageAmount, new Vector(215,22)));
            this.entityList.push(new Storage(new Item("Mais_ganz"), this.storageAmount, new Vector(260,22)));
            this.entityList.push(new Storage(new Item("Salat_ganz"), this.storageAmount, new Vector(307,22)));
            this.entityList.push(new Storage(new Item("Kebabfleisch_roh"), this.storageAmount, new Vector(16,320)));
        }

        private loadCounter(){
            let counter = new Counter(new Vector(262, 428));
            this.entityList.push(counter);
            this.counter = counter;
        }

        private loadMealPlaces(){
            this.entityList.push(new Place(new Vector(345, 428)))
            this.entityList.push(new Place(new Vector(422, 428)))
        }

        private loadTrashBin(){
            this.entityList.push(new Bin(new Vector(18, 81)))
        }
    }
}


