namespace RestaurantSimulation {

    // Bilderliste zum vorladen der ganzen Bilder
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
        //Entitätenliste
        private entityList: Entity[] = [];
        //Debugmodus, true gibt zusätzliche Events in die Console aus
        private debug: boolean = false;
        //Images Objekt. Alle images werden hier reingespeichert wenn sie geladen sind.
        private images: Record<string, HTMLImageElement> = {};
        //die aktuelle selektierung des Spielers.
        private selection: Customer | Employee | null = null;
        //das Intervall zum erzeugen der Kunden
        private customerInterval: number | null = null;
        //der Tresen
        private counter : Counter | null = null;
        //der Kunde der als nächstes dran ist
        private nextCustomer: Customer | null = null;

        //die Highscores
        private yufkaCount: number = 0;
        private doenerCount: number = 0;
        private lahmaCount: number = 0;

        constructor(private customerTime: number, private employeeCount: number, private storageAmount: number, private employeeTiredTime: number, private map: CanvasRenderingContext2D, private canvas: HTMLCanvasElement) {
            this.loadTrainer();
        }

        /**
         * lädt alle benötigten initialen Entitäten und zeichnet die Map. Startet ebenfalls die update-loop
         * @private
         */
        private async loadTrainer() {
            //Start UI ausblenden und Game einblenden
            this.hideStartUI();
            //Bilder laden und erst weitermachen, wenn sie geladen sind
            await this.loadImages();
            //Das Canvas mit dem Grundriss laden
            this.loadCanvas();
            //Die Events vorbereiten und an die Funktionen binden
            this.setEvents();

            //Workplaces erzeugen
            this.loadWorkplaces();
            //Storages erzeugen
            this.loadStorages();
            //Tresen erzeugen
            this.loadCounter();
            //Zwischenlager erzeugen
            this.loadMealPlaces();
            //Menschen erzeugen (Mitarbeiter/Kunden)
            this.loadHumans();
            //Mülleimer erzeugen
            this.loadTrashBin();
            //update loop starten, zeichnet das komplette Spiel anhand der Entitätenliste regelmäßig neu
            requestAnimationFrame(this.update.bind(this));
        }

        /**
         * versteckt das initiale Einstellungs-UI und zeigt das Spiel
         * @private
         */
        private hideStartUI(){
            const start = document.getElementById("start");
            const root = document.getElementById("root");
            if(!start || !root){
                return;
            }
            start.style.display = "none";
            root.style.visibility = "visible";
        }

        /**
         * Setzt die Events für: Rechtsklick, Linksklick, Pointermove(im Debugmodus die Koordinaten ausgeben und den Exit-Button
         * @private
         */
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

        /**
         * gibt die X und Y Koordinate aus
         * @param evt
         * @private
         */
        private move(evt: MouseEvent){
            console.log(evt.offsetX, evt.offsetY);
        }

        /**
         * Sucht das nächste Objekt an den übergebenen x und y koordinaten.
         * @param x
         * @param y
         * @param findOnlyHuman Wenn gesetzt, dann sucht die Funktion nur nach Customers oder Employees
         * @private
         */
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

        /**
         * Funktion für den Linksklick
         * @param evt
         * @private
         */
        private leftClick(evt: MouseEvent){
            //sucht Objekt an Klickposition
            let ent = this.getEntityFromXY(evt.offsetX, evt.offsetY, true) as Customer | Employee | null;
            if(ent){
                //Wenn objekt gefunden: dann Objekt als selektiertes Objekt setzen
                this.selection = ent;
                console.log("changed selection to ", ent);
            }
            else{
                //wenn kein Objekt gefunden: dann Selektierung löschen
                this.selection = null;
            }
        }

        /**
         * Funktion für den Rechtsklick
         * @param evt
         * @private
         */
        private rightClick(evt: MouseEvent){
            //das Standard-Contextmenu beim Rechtsklick unterdrücken
            evt.preventDefault();
            //nächstes Objekt vom Mausklick suchen
            let ent = this.getEntityFromXY(evt.offsetX, evt.offsetY);
            if(!ent){
                //wenn keins gefunden: nichts machen
                return;
            }
            if(this.selection instanceof Employee && this.selection.target === null && this.selection !== ent){
                if(ent instanceof Storage || ent instanceof Workplace || ent instanceof Place || ent instanceof Counter || ent instanceof Bin){
                    //wenn ein Employee selektiert ist und das Zielobjekt ein Storage, Workplace, Place, Counter oder Bin ist, dann dieses Objekt dem Employee als Target zuweisen.
                    this.selection.target = ent;
                }
            }
        }

        /**
         * lädt ein Bild anhand seines Namens und legt es in das Image-Objekt
         * Die Promise wird erst resolved, wenn das Bild fertig geladen ist
         * @param name
         * @private
         */
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

        /**
         * lädt jedes Bild aus dem images-Array
         * @private
         */
        private async loadImages() {
            for (let name of images) {
                await this.loadImage(name);
            }
        }

        /**
         * Erzeugt Kunden und Mitarbeiter
         * @private
         */
        private loadHumans() {
            //Alle Mitarbeiter erzeugen und in die Entitylist legen
            for(let i = 0; i<this.employeeCount; i++){
                let x = 120+i*55;
                let y = 330;
                let emp = new Employee(new Vector(x, y));
                this.entityList.push(emp);
            }
            //initialer Aufruf um einen Kunden zu erzeugen
            this.loadCustomers();
            //Intervall, was minütlich Kunden erzeugt
            this.customerInterval = setInterval(this.loadCustomers.bind(this), 60 * 1000);
        }

        /**
         * Wird im Intervall minütlich aufgerufen und erzeugt soviele Kunden wie eingestellt
         * @private
         */
        private loadCustomers(){
            for(let i = 0; i<this.customerTime; i++){
                //zufälliges Meal berechnen
                let meals = [new Yufka(), new Lahmacun(), new Doener()];
                let random = Math.floor(Math.random()*meals.length);
                //zufällige Position im Raum berechnen
                let randomTargetX = Math.floor(Math.random()*(577-16))+16;
                let randomTargetY = Math.floor(Math.random()*(771-518))+518;
                let randomPos = new Vector(randomTargetX, randomTargetY);
                let cust = new Customer(new Vector(270, 780), randomPos, meals[random]);
                //wenn es noch keinen nextCustomer gibt, dann ist der nextCustomer der aktuelle Customer
                if(!this.nextCustomer){
                    this.nextCustomer = cust;
                }
                //Kunde in die Entitylist reinlegen
                this.entityList.push(cust);
            }
        }

        /**
         * Aktualisiert die Laune, die Bewegung und das Aussehen eines Mitarbeiters auf der Karte
         * @param ent
         * @private
         */
        private updateEmployee(ent: Employee) {
            if (!this.map) {
                return;
            }
            ent.stress = false;
            //Employee bewegen wenn ein Ziel gesetzt ist
            if(ent.target){
                //Richtungsvektor erzeugen
                let dir = ent.position.directionVector(ent.target.position);
                //Richtungsvektor auf Employeevektor addieren
                ent.position.addVector(dir, ent.speed);
                //lastMove aktualisieren
                ent.lastMove = new Date();
                //Distanz zum Ziel berechnen
                let dist = ent.position.distanceToVector(ent.target.position);
                ent.stress = true;
                //Ist Mitarbeiter schon in der Nähe vom Ziel?
                if(dist <= 10){
                    //wenn ja: Mitarbeiter hat Ziel erreicht
                    console.log("emp reached target");
                    ent.reachTarget();
                }
            }
            //Laune aktualisieren
            ent.updateMood(this.employeeTiredTime);

            //Bild des Mitarbeiters anhand der Laune auslesen
            let img = this.getImage("Mitarbeiter_"+ent.mood);
            if (!img) {
                return;
            }
            this.map.fillStyle = "lightgrey";
            //Bild des Mitarbeiters zeichenn
            this.map.drawImage(img, ent.position.x, ent.position.y, 45, 45);
            //Wenn der Mitarbeiter etwas trägt, dann auch das Bild des Items an den Mitarbeiter zeichnen (in klein)
            if (ent.carries) {
                let img = this.getImage(ent.carries.name);
                if (!img) {
                    return;
                }
                this.map.drawImage(img, ent.position.x + 25, ent.position.y, 20, 20);
            }
        }

        /**
         * Aktualisiert die Bewegung, Laune und Aussehen eines Kunden
         * @param ent
         * @private
         */
        private updateCustomer(ent: Customer) {
            if (!this.map) {
                return;
            }
            //Wenn der Kunde am Ausgang angekommen ist, dann Score hochzählen und löschen
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
                //Index finden aus Entitylist um Kunde zu löschen
                let i = this.entityList.findIndex((entity: Entity) => entity === ent);
                if(i === -1){
                    return;
                }
                //Kunde löschen
                this.entityList.splice(i, 1);
                //NextCustomer ist wieder null, da der alte Kunde nun gelöscht ist.
                this.nextCustomer = null;
                return;
            }
            //Bewegung des Kunden wenn eine Zielposition gesetzt ist
            if(ent.targetPos){
                //Richtungsvektor erzeugen zum Ziel
                let dir = ent.position.directionVector(ent.targetPos);
                //Richtungsvektor addieren
                ent.position.addVector(dir, ent.speed);
                let dist = ent.position.distanceToVector(ent.targetPos);
                //Ist der Kunde angekommen?
                if(dist <= 3){
                    //wenn ja: targetReached ausführen
                    ent.targetReached(this.counter);
                }
            }
            //Laune aktualisieren
            ent.updateMood();

            //Bild für Kunde auslesen und Kunde zeichnen
            let img = this.getImage("Kunde_"+ent.mood);
            if (!img) {
                return;
            }
            this.map.drawImage(img, ent.position.x, ent.position.y, 45, 45);

            //Wenn der Kunde etwas will, dann das Meal auch noch an den Kunden zeichnen
            if (ent.wants) {
                let img = this.getImage(ent.wants.name);
                if (!img) {
                    return;
                }
                this.map.drawImage(img, ent.position.x + 25, ent.position.y+25, 20, 20);
            }
        }

        /**
         * liest ein Bild aus dem images-Objekt aus und gibt es zurück
         * @param name
         * @private
         */
        private getImage(name:string){
            return this.images[name+".png"];
        }

        /**
         * Update-loop. Zeichnet das komplette Spiel max 60x pro Sekunde neu.
         * @private
         */
        private update() {
            if (!this.map) {
                return;
            }
            //leert das Canvas
            this.map.clearRect(0, 0, this.canvas.width, this.canvas.height);

            //Zeichnet den Grundriss
            this.loadCanvas();

            //Felder mit Highscores befüllen
            this.updateScores();

            //Wenn es keinen Kunden gibt der als nächstes dran ist, dann den ersten Kunden nehmen den man findet
            if(!this.nextCustomer){
                let cust = this.entityList.find((ent: Entity) => ent instanceof Customer) as Customer;
                if(cust){
                    this.nextCustomer = cust;
                }
            }

            //Entityliste durchgehen und jede Entität zeichnen
            for(let ent of this.entityList){
                //Aktuell selektierte Entität umranden (highlight)
                if(this.selection === ent){
                    this.highlight(ent);
                }
                //Den Customer der als nächstes dran ist selektieren
                if(this.nextCustomer === ent){
                    this.highlightNext(ent as Customer);
                }
                //Den Kunden zeichnen
                if(ent instanceof Customer ){
                    this.updateCustomer(ent);
                }
                //Den Workplace zeichnen
                if(ent instanceof Workplace){
                    this.updateWorkplace(ent);
                }
                //Den Mitarbeiter zeichnen
                if(ent instanceof Employee ){
                    this.updateEmployee(ent);
                }
                //Das Lager zeichnen
                if(ent instanceof Storage){
                    this.updateStorage(ent);
                }
                //Mülleimer zeichnen
                if(ent instanceof Bin){
                    this.updateBin(ent);
                }
                //Tresen/Zwischenlager zeichnen
                if(ent instanceof Counter || ent instanceof Place){
                    this.updateCounterOrPlace(ent);
                }
            }

            //wenn auf dem Counter etwas liegt, dann den nächsten Kunden zum Counter schicken
            if(this.counter && this.counter.has && this.nextCustomer && !this.nextCustomer.targetPos && this.nextCustomer.status === "waiting"){
                this.nextCustomer.targetPos = this.counter.position;
                this.nextCustomer.status = "waytocounter";
            }

            //updateloop erneut ausführen (so entsteht eine unendliche Schleife).
            requestAnimationFrame(this.update.bind(this));
        }

        /**
         * Mülleimer zeichnen
         * @param ent
         * @private
         */
        private updateBin(ent: Bin){
            this.map.drawImage(this.getImage("Muell"), ent.position.x, ent.position.y, 40, 40);
        }

        /**
         * Tresen/Zwischenlager zeichnen
         * @param ent
         * @private
         */
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

        /**
         * Den aktuellen Kunden hervorheben
         * @param ent
         * @private
         */
        private highlightNext(ent: Customer){
            this.map.beginPath();
            this.map.strokeStyle = "green";
            this.map.lineWidth = 5;
            this.map.arc(ent.position.x+22, ent.position.y+22, 25, 0, 2*Math.PI);
            this.map.stroke();
        }

        /**
         * Die selektierte Entität hervorheben
         * @param ent
         * @private
         */
        private highlight(ent: Entity){
            this.map.beginPath();
            this.map.lineWidth = 3;
            this.map.rect(ent.position.x-2, ent.position.y-2, 49, 49);
            this.map.stroke();
        }

        /**
         * Die Highscorefelder befüllen
         * @private
         */
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

        /**
         * Einen Workplace zeichnen
         * @param ent
         * @private
         */
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

        /**
         * Lager zeichnen
         * @param ent
         * @private
         */
        private updateStorage(ent: Storage) {
            this.map.drawImage(this.getImage(ent.stores.name), ent.position.x + 5, ent.position.y + 1, 30, 30)
        }

        /**
         * Grundriss des Restaurants zeichnen
         * @private
         */
        private loadCanvas() {
            this.map.drawImage(this.getImage("Grundriss"), 0, 0, 600, 800);
        }


        /**
         * Workplaces initial erzeugen und in Entitylist hinzufügen
         * @private
         */
        private loadWorkplaces() {
            this.map.fillStyle = "lightgrey";
            this.entityList.push(new Workplace(new Yufka(), new Vector(370, 20)));
            this.entityList.push(new Workplace(new Doener(), new Vector(450, 20)));
            this.entityList.push(new Workplace(new Lahmacun(), new Vector(525, 20)));
        }

        /**
         * Lager initial erzeugen und in Entitylist hinzufügen
         * @private
         */
        private loadStorages() {
            this.entityList.push(new Storage(new Item("Tomate_ganz"), this.storageAmount, new Vector(72,22)));
            this.entityList.push(new Storage(new Item("Zwiebel_ganz"), this.storageAmount, new Vector(118,22)));
            this.entityList.push(new Storage(new Item("Peperoni"), this.storageAmount, new Vector(164,22)));
            this.entityList.push(new Storage(new Item("Gurke_ganz"), this.storageAmount, new Vector(215,22)));
            this.entityList.push(new Storage(new Item("Mais_ganz"), this.storageAmount, new Vector(260,22)));
            this.entityList.push(new Storage(new Item("Salat_ganz"), this.storageAmount, new Vector(307,22)));
            this.entityList.push(new Storage(new Item("Kebabfleisch_roh"), this.storageAmount, new Vector(16,320)));
        }

        /**
         * Tresen erzeugen und in Entitylist hinzufügen
         * @private
         */
        private loadCounter(){
            let counter = new Counter(new Vector(262, 428));
            this.entityList.push(counter);
            this.counter = counter;
        }

        /**
         * Zwischenlager erzeugen und in Entitylist hinzufügen
         * @private
         */
        private loadMealPlaces(){
            this.entityList.push(new Place(new Vector(345, 428)))
            this.entityList.push(new Place(new Vector(422, 428)))
        }

        /**
         * Mülleimer erzeugen und in Entitylist hinzufügen
         * @private
         */
        private loadTrashBin(){
            this.entityList.push(new Bin(new Vector(18, 81)))
        }
    }
}


