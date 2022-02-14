"use strict";
var RestaurantSimulation;
(function (RestaurantSimulation) {
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
    class Trainer {
        customerTime;
        employeeCount;
        storageAmount;
        employeeTiredTime;
        map;
        canvas;
        //Entitätenliste
        entityList = [];
        //Debugmodus, true gibt zusätzliche Events in die Console aus
        debug = false;
        //Images Objekt. Alle images werden hier reingespeichert wenn sie geladen sind.
        images = {};
        //die aktuelle selektierung des Spielers.
        selection = null;
        //das Intervall zum erzeugen der Kunden
        customerInterval = null;
        //der Tresen
        counter = null;
        //der Kunde der als nächstes dran ist
        nextCustomer = null;
        //die Highscores
        yufkaCount = 0;
        doenerCount = 0;
        lahmaCount = 0;
        constructor(customerTime, employeeCount, storageAmount, employeeTiredTime, map, canvas) {
            this.customerTime = customerTime;
            this.employeeCount = employeeCount;
            this.storageAmount = storageAmount;
            this.employeeTiredTime = employeeTiredTime;
            this.map = map;
            this.canvas = canvas;
            this.loadTrainer();
        }
        /**
         * lädt alle benötigten initialen Entitäten und zeichnet die Map. Startet ebenfalls die update-loop
         * @private
         */
        async loadTrainer() {
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
        hideStartUI() {
            const start = document.getElementById("start");
            const root = document.getElementById("root");
            if (!start || !root) {
                return;
            }
            start.style.display = "none";
            root.style.visibility = "visible";
        }
        /**
         * Setzt die Events für: Rechtsklick, Linksklick, Pointermove(im Debugmodus die Koordinaten ausgeben und den Exit-Button
         * @private
         */
        setEvents() {
            this.canvas.addEventListener('contextmenu', this.rightClick.bind(this));
            this.canvas.addEventListener('click', this.leftClick.bind(this));
            if (this.debug) {
                this.canvas.addEventListener('pointermove', this.move.bind(this));
            }
            const exit = document.getElementById("exit");
            if (!exit) {
                return;
            }
            exit.addEventListener("click", () => {
                window.location.reload();
            });
        }
        /**
         * gibt die X und Y Koordinate aus
         * @param evt
         * @private
         */
        move(evt) {
            console.log(evt.offsetX, evt.offsetY);
        }
        /**
         * Sucht das nächste Objekt an den übergebenen x und y koordinaten.
         * @param x
         * @param y
         * @param findOnlyHuman Wenn gesetzt, dann sucht die Funktion nur nach Customers oder Employees
         * @private
         */
        getEntityFromXY(x, y, findOnlyHuman = false) {
            let vec = new RestaurantSimulation.Vector(x, y);
            let found = null;
            let distFound = null;
            for (let ent of this.entityList) {
                if (findOnlyHuman) {
                    if (!(ent instanceof RestaurantSimulation.Employee || ent instanceof RestaurantSimulation.Customer)) {
                        continue;
                    }
                }
                let dist = vec.distanceToVector(ent.position.middle());
                if ((!found && dist <= 45) || (found && distFound && dist <= distFound)) {
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
        leftClick(evt) {
            //sucht Objekt an Klickposition
            let ent = this.getEntityFromXY(evt.offsetX, evt.offsetY, true);
            if (ent) {
                //Wenn objekt gefunden: dann Objekt als selektiertes Objekt setzen
                this.selection = ent;
                console.log("changed selection to ", ent);
            }
            else {
                //wenn kein Objekt gefunden: dann Selektierung löschen
                this.selection = null;
            }
        }
        /**
         * Funktion für den Rechtsklick
         * @param evt
         * @private
         */
        rightClick(evt) {
            //das Standard-Contextmenu beim Rechtsklick unterdrücken
            evt.preventDefault();
            //nächstes Objekt vom Mausklick suchen
            let ent = this.getEntityFromXY(evt.offsetX, evt.offsetY);
            if (!ent) {
                //wenn keins gefunden: nichts machen
                return;
            }
            if (this.selection instanceof RestaurantSimulation.Employee && this.selection.target === null && this.selection !== ent) {
                if (ent instanceof RestaurantSimulation.Storage || ent instanceof RestaurantSimulation.Workplace || ent instanceof RestaurantSimulation.Place || ent instanceof RestaurantSimulation.Counter || ent instanceof RestaurantSimulation.Bin) {
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
        loadImage(name) {
            return new Promise((resolve) => {
                let img = new Image();
                img.src = "images/" + name;
                img.onload = () => {
                    resolve(img);
                };
                this.images[name] = img;
            });
        }
        /**
         * lädt jedes Bild aus dem images-Array
         * @private
         */
        async loadImages() {
            for (let name of images) {
                await this.loadImage(name);
            }
        }
        /**
         * Erzeugt Kunden und Mitarbeiter
         * @private
         */
        loadHumans() {
            //Alle Mitarbeiter erzeugen und in die Entitylist legen
            for (let i = 0; i < this.employeeCount; i++) {
                let x = 120 + i * 55;
                let y = 330;
                let emp = new RestaurantSimulation.Employee(new RestaurantSimulation.Vector(x, y));
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
        loadCustomers() {
            for (let i = 0; i < this.customerTime; i++) {
                //zufälliges Meal berechnen
                let meals = [new RestaurantSimulation.Yufka(), new RestaurantSimulation.Lahmacun(), new RestaurantSimulation.Doener()];
                let random = Math.floor(Math.random() * meals.length);
                //zufällige Position im Raum berechnen
                let randomTargetX = Math.floor(Math.random() * (577 - 16)) + 16;
                let randomTargetY = Math.floor(Math.random() * (771 - 518)) + 518;
                let randomPos = new RestaurantSimulation.Vector(randomTargetX, randomTargetY);
                let cust = new RestaurantSimulation.Customer(new RestaurantSimulation.Vector(270, 780), randomPos, meals[random]);
                //wenn es noch keinen nextCustomer gibt, dann ist der nextCustomer der aktuelle Customer
                if (!this.nextCustomer) {
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
        updateEmployee(ent) {
            if (!this.map) {
                return;
            }
            ent.stress = false;
            //Employee bewegen wenn ein Ziel gesetzt ist
            if (ent.target) {
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
                if (dist <= 10) {
                    //wenn ja: Mitarbeiter hat Ziel erreicht
                    console.log("emp reached target");
                    ent.reachTarget();
                }
            }
            //Laune aktualisieren
            ent.updateMood(this.employeeTiredTime);
            //Bild des Mitarbeiters anhand der Laune auslesen
            let img = this.getImage("Mitarbeiter_" + ent.mood);
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
        updateCustomer(ent) {
            if (!this.map) {
                return;
            }
            //Wenn der Kunde am Ausgang angekommen ist, dann Score hochzählen und löschen
            if (ent.deleted) {
                if (ent.carries && ent.carries instanceof RestaurantSimulation.Yufka && ent.carries.finished) {
                    this.yufkaCount++;
                }
                if (ent.carries && ent.carries instanceof RestaurantSimulation.Doener && ent.carries.finished) {
                    this.yufkaCount++;
                }
                if (ent.carries && ent.carries instanceof RestaurantSimulation.Lahmacun && ent.carries.finished) {
                    this.yufkaCount++;
                }
                //Index finden aus Entitylist um Kunde zu löschen
                let i = this.entityList.findIndex((entity) => entity === ent);
                if (i === -1) {
                    return;
                }
                //Kunde löschen
                this.entityList.splice(i, 1);
                //NextCustomer ist wieder null, da der alte Kunde nun gelöscht ist.
                this.nextCustomer = null;
                return;
            }
            //Bewegung des Kunden wenn eine Zielposition gesetzt ist
            if (ent.targetPos) {
                //Richtungsvektor erzeugen zum Ziel
                let dir = ent.position.directionVector(ent.targetPos);
                //Richtungsvektor addieren
                ent.position.addVector(dir, ent.speed);
                let dist = ent.position.distanceToVector(ent.targetPos);
                //Ist der Kunde angekommen?
                if (dist <= 3) {
                    //wenn ja: targetReached ausführen
                    ent.targetReached(this.counter);
                }
            }
            //Laune aktualisieren
            ent.updateMood();
            //Bild für Kunde auslesen und Kunde zeichnen
            let img = this.getImage("Kunde_" + ent.mood);
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
                this.map.drawImage(img, ent.position.x + 25, ent.position.y + 25, 20, 20);
            }
        }
        /**
         * liest ein Bild aus dem images-Objekt aus und gibt es zurück
         * @param name
         * @private
         */
        getImage(name) {
            return this.images[name + ".png"];
        }
        /**
         * Update-loop. Zeichnet das komplette Spiel max 60x pro Sekunde neu.
         * @private
         */
        update() {
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
            if (!this.nextCustomer) {
                let cust = this.entityList.find((ent) => ent instanceof RestaurantSimulation.Customer);
                if (cust) {
                    this.nextCustomer = cust;
                }
            }
            //Entityliste durchgehen und jede Entität zeichnen
            for (let ent of this.entityList) {
                //Aktuell selektierte Entität umranden (highlight)
                if (this.selection === ent) {
                    this.highlight(ent);
                }
                //Den Customer der als nächstes dran ist selektieren
                if (this.nextCustomer === ent) {
                    this.highlightNext(ent);
                }
                //Den Kunden zeichnen
                if (ent instanceof RestaurantSimulation.Customer) {
                    this.updateCustomer(ent);
                }
                //Den Workplace zeichnen
                if (ent instanceof RestaurantSimulation.Workplace) {
                    this.updateWorkplace(ent);
                }
                //Den Mitarbeiter zeichnen
                if (ent instanceof RestaurantSimulation.Employee) {
                    this.updateEmployee(ent);
                }
                //Das Lager zeichnen
                if (ent instanceof RestaurantSimulation.Storage) {
                    this.updateStorage(ent);
                }
                //Mülleimer zeichnen
                if (ent instanceof RestaurantSimulation.Bin) {
                    this.updateBin(ent);
                }
                //Tresen/Zwischenlager zeichnen
                if (ent instanceof RestaurantSimulation.Counter || ent instanceof RestaurantSimulation.Place) {
                    this.updateCounterOrPlace(ent);
                }
            }
            //wenn auf dem Counter etwas liegt, dann den nächsten Kunden zum Counter schicken
            if (this.counter && this.counter.has && this.nextCustomer && !this.nextCustomer.targetPos && this.nextCustomer.status === "waiting") {
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
        updateBin(ent) {
            this.map.drawImage(this.getImage("Muell"), ent.position.x, ent.position.y, 40, 40);
        }
        /**
         * Tresen/Zwischenlager zeichnen
         * @param ent
         * @private
         */
        updateCounterOrPlace(ent) {
            this.map.beginPath();
            this.map.strokeStyle = "brown";
            this.map.lineWidth = 3;
            this.map.rect(ent.position.x, ent.position.y, 65, 45);
            if (ent.has) {
                this.map.drawImage(this.getImage(ent.has.name), ent.position.x + 10, ent.position.y + 2, 40, 40);
            }
            this.map.stroke();
        }
        /**
         * Den aktuellen Kunden hervorheben
         * @param ent
         * @private
         */
        highlightNext(ent) {
            this.map.beginPath();
            this.map.strokeStyle = "green";
            this.map.lineWidth = 5;
            this.map.arc(ent.position.x + 22, ent.position.y + 22, 25, 0, 2 * Math.PI);
            this.map.stroke();
        }
        /**
         * Die selektierte Entität hervorheben
         * @param ent
         * @private
         */
        highlight(ent) {
            this.map.beginPath();
            this.map.lineWidth = 3;
            this.map.rect(ent.position.x - 2, ent.position.y - 2, 49, 49);
            this.map.stroke();
        }
        /**
         * Die Highscorefelder befüllen
         * @private
         */
        updateScores() {
            let moods = ["genervt", "veraergert", "zufrieden", "gestresst", "normal", "schlaefrig"];
            for (let mood of moods) {
                const elem = document.getElementById(mood);
                if (!elem) {
                    continue;
                }
                let count = this.entityList.filter((ent) => {
                    return (ent instanceof RestaurantSimulation.Customer || ent instanceof RestaurantSimulation.Employee) && ent.mood === mood;
                }).length;
                elem.value = count.toString();
            }
            let yufkaC = document.getElementById("yufka_count");
            let doenerC = document.getElementById("doener_count");
            let lahmaC = document.getElementById("lahmacun_count");
            let gesamt = document.getElementById("gesamt_count");
            if (!yufkaC || !doenerC || !lahmaC) {
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
        updateWorkplace(ent) {
            if (!ent.meal) {
                return;
            }
            this.map.drawImage(this.getImage(ent.meal.name), ent.position.x + 5, ent.position.y + 5, 30, 30);
            if (ent.meal.finished) {
                this.map.drawImage(this.getImage('check'), ent.position.x + 35, ent.position.y + 20, 15, 15);
            }
            else {
                this.map.drawImage(this.getImage('cancel'), ent.position.x + 35, ent.position.y + 20, 15, 15);
            }
        }
        /**
         * Lager zeichnen
         * @param ent
         * @private
         */
        updateStorage(ent) {
            this.map.drawImage(this.getImage(ent.stores.name), ent.position.x + 5, ent.position.y + 1, 30, 30);
        }
        /**
         * Grundriss des Restaurants zeichnen
         * @private
         */
        loadCanvas() {
            this.map.drawImage(this.getImage("Grundriss"), 0, 0, 600, 800);
        }
        /**
         * Workplaces initial erzeugen und in Entitylist hinzufügen
         * @private
         */
        loadWorkplaces() {
            this.map.fillStyle = "lightgrey";
            this.entityList.push(new RestaurantSimulation.Workplace(new RestaurantSimulation.Yufka(), new RestaurantSimulation.Vector(370, 20)));
            this.entityList.push(new RestaurantSimulation.Workplace(new RestaurantSimulation.Doener(), new RestaurantSimulation.Vector(450, 20)));
            this.entityList.push(new RestaurantSimulation.Workplace(new RestaurantSimulation.Lahmacun(), new RestaurantSimulation.Vector(525, 20)));
        }
        /**
         * Lager initial erzeugen und in Entitylist hinzufügen
         * @private
         */
        loadStorages() {
            this.entityList.push(new RestaurantSimulation.Storage(new RestaurantSimulation.Item("Tomate_ganz"), this.storageAmount, new RestaurantSimulation.Vector(72, 22)));
            this.entityList.push(new RestaurantSimulation.Storage(new RestaurantSimulation.Item("Zwiebel_ganz"), this.storageAmount, new RestaurantSimulation.Vector(118, 22)));
            this.entityList.push(new RestaurantSimulation.Storage(new RestaurantSimulation.Item("Peperoni"), this.storageAmount, new RestaurantSimulation.Vector(164, 22)));
            this.entityList.push(new RestaurantSimulation.Storage(new RestaurantSimulation.Item("Gurke_ganz"), this.storageAmount, new RestaurantSimulation.Vector(215, 22)));
            this.entityList.push(new RestaurantSimulation.Storage(new RestaurantSimulation.Item("Mais_ganz"), this.storageAmount, new RestaurantSimulation.Vector(260, 22)));
            this.entityList.push(new RestaurantSimulation.Storage(new RestaurantSimulation.Item("Salat_ganz"), this.storageAmount, new RestaurantSimulation.Vector(307, 22)));
            this.entityList.push(new RestaurantSimulation.Storage(new RestaurantSimulation.Item("Kebabfleisch_roh"), this.storageAmount, new RestaurantSimulation.Vector(16, 320)));
        }
        /**
         * Tresen erzeugen und in Entitylist hinzufügen
         * @private
         */
        loadCounter() {
            let counter = new RestaurantSimulation.Counter(new RestaurantSimulation.Vector(262, 428));
            this.entityList.push(counter);
            this.counter = counter;
        }
        /**
         * Zwischenlager erzeugen und in Entitylist hinzufügen
         * @private
         */
        loadMealPlaces() {
            this.entityList.push(new RestaurantSimulation.Place(new RestaurantSimulation.Vector(345, 428)));
            this.entityList.push(new RestaurantSimulation.Place(new RestaurantSimulation.Vector(422, 428)));
        }
        /**
         * Mülleimer erzeugen und in Entitylist hinzufügen
         * @private
         */
        loadTrashBin() {
            this.entityList.push(new RestaurantSimulation.Bin(new RestaurantSimulation.Vector(18, 81)));
        }
    }
    RestaurantSimulation.Trainer = Trainer;
})(RestaurantSimulation || (RestaurantSimulation = {}));
//# sourceMappingURL=Trainer.js.map