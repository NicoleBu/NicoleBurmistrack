"use strict";
var RestaurantSimulation;
(function (RestaurantSimulation) {
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
        entityList = [];
        debug = false;
        images = {};
        selection = null;
        customerInterval = null;
        counter = null;
        nextCustomer = null;
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
        async loadTrainer() {
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
        hideStartUI() {
            const start = document.getElementById("start");
            const root = document.getElementById("root");
            if (!start || !root) {
                return;
            }
            start.style.display = "none";
            root.style.visibility = "visible";
        }
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
        move(evt) {
            console.log(evt.offsetX, evt.offsetY);
        }
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
        leftClick(evt) {
            let ent = this.getEntityFromXY(evt.offsetX, evt.offsetY, true);
            if (ent) {
                this.selection = ent;
                console.log("changed selection to ", ent);
            }
            else {
                this.selection = null;
            }
        }
        rightClick(evt) {
            evt.preventDefault();
            let ent = this.getEntityFromXY(evt.offsetX, evt.offsetY);
            if (!ent) {
                return;
            }
            if (this.selection instanceof RestaurantSimulation.Employee && this.selection.target === null && this.selection !== ent) {
                if (ent instanceof RestaurantSimulation.Storage || ent instanceof RestaurantSimulation.Workplace || ent instanceof RestaurantSimulation.Place || ent instanceof RestaurantSimulation.Counter || ent instanceof RestaurantSimulation.Bin) {
                    this.selection.target = ent;
                }
            }
        }
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
        async loadImages() {
            for (let name of images) {
                await this.loadImage(name);
            }
        }
        loadHumans() {
            for (let i = 0; i < this.employeeCount; i++) {
                let x = 120 + i * 55;
                let y = 330;
                let emp = new RestaurantSimulation.Employee(new RestaurantSimulation.Vector(x, y));
                this.entityList.push(emp);
            }
            this.loadCustomers();
            this.customerInterval = setInterval(this.loadCustomers.bind(this), 60 * 1000);
        }
        loadCustomers() {
            for (let i = 0; i < this.customerTime; i++) {
                let meals = [new RestaurantSimulation.Yufka(), new RestaurantSimulation.Lahmacun(), new RestaurantSimulation.Doener()];
                let random = Math.floor(Math.random() * meals.length);
                let randomTargetX = Math.floor(Math.random() * (577 - 16)) + 16;
                let randomTargetY = Math.floor(Math.random() * (771 - 518)) + 518;
                let randomPos = new RestaurantSimulation.Vector(randomTargetX, randomTargetY);
                let cust = new RestaurantSimulation.Customer(new RestaurantSimulation.Vector(270, 780), randomPos, meals[random]);
                if (!this.nextCustomer) {
                    this.nextCustomer = cust;
                }
                this.entityList.push(cust);
            }
        }
        updateEmployee(ent) {
            if (!this.map) {
                return;
            }
            ent.stress = false;
            if (ent.target) {
                let dir = ent.position.directionVector(ent.target.position);
                ent.position.addVector(dir, ent.speed);
                ent.lastMove = new Date();
                let dist = ent.position.distanceToVector(ent.target.position);
                ent.stress = true;
                if (dist <= 10) {
                    console.log("emp reached target");
                    ent.reachTarget();
                }
            }
            ent.updateMood(this.employeeTiredTime);
            let img = this.getImage("Mitarbeiter_" + ent.mood);
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
        updateCustomer(ent) {
            if (!this.map) {
                return;
            }
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
                let i = this.entityList.findIndex((entity) => entity === ent);
                if (i === -1) {
                    return;
                }
                this.entityList.splice(i, 1);
                this.nextCustomer = null;
                return;
            }
            if (ent.targetPos) {
                let dir = ent.position.directionVector(ent.targetPos);
                ent.position.addVector(dir, ent.speed);
                let dist = ent.position.distanceToVector(ent.targetPos);
                if (dist <= 3) {
                    ent.targetReached(this.counter);
                }
            }
            ent.updateMood();
            let img = this.getImage("Kunde_" + ent.mood);
            if (!img) {
                return;
            }
            this.map.drawImage(img, ent.position.x, ent.position.y, 45, 45);
            if (ent.wants) {
                let img = this.getImage(ent.wants.name);
                if (!img) {
                    return;
                }
                this.map.drawImage(img, ent.position.x + 25, ent.position.y + 25, 20, 20);
            }
        }
        getImage(name) {
            return this.images[name + ".png"];
        }
        update() {
            if (!this.map) {
                return;
            }
            this.map.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.loadCanvas();
            this.updateScores();
            if (!this.nextCustomer) {
                let cust = this.entityList.find((ent) => ent instanceof RestaurantSimulation.Customer);
                if (cust) {
                    this.nextCustomer = cust;
                }
            }
            for (let ent of this.entityList) {
                if (this.selection === ent) {
                    this.highlight(ent);
                }
                if (this.nextCustomer === ent) {
                    this.highlightNext(ent);
                }
                if (ent instanceof RestaurantSimulation.Customer) {
                    this.updateCustomer(ent);
                }
                if (ent instanceof RestaurantSimulation.Workplace) {
                    this.updateWorkplace(ent);
                }
                if (ent instanceof RestaurantSimulation.Employee) {
                    this.updateEmployee(ent);
                }
                if (ent instanceof RestaurantSimulation.Storage) {
                    this.updateStorage(ent);
                }
                if (ent instanceof RestaurantSimulation.Bin) {
                    this.updateBin(ent);
                }
                if (ent instanceof RestaurantSimulation.Counter || ent instanceof RestaurantSimulation.Place) {
                    this.updateCounterOrPlace(ent);
                }
            }
            if (this.counter && this.counter.has && this.nextCustomer && !this.nextCustomer.targetPos && this.nextCustomer.status === "waiting") {
                this.nextCustomer.targetPos = this.counter.position;
                this.nextCustomer.status = "waytocounter";
            }
            requestAnimationFrame(this.update.bind(this));
        }
        updateBin(ent) {
            this.map.drawImage(this.getImage("Muell"), ent.position.x, ent.position.y, 40, 40);
        }
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
        highlightNext(ent) {
            this.map.beginPath();
            this.map.strokeStyle = "green";
            this.map.lineWidth = 5;
            this.map.arc(ent.position.x + 22, ent.position.y + 22, 25, 0, 2 * Math.PI);
            this.map.stroke();
        }
        highlight(ent) {
            this.map.beginPath();
            this.map.lineWidth = 3;
            this.map.rect(ent.position.x - 2, ent.position.y - 2, 49, 49);
            this.map.stroke();
        }
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
        updateStorage(ent) {
            this.map.drawImage(this.getImage(ent.stores.name), ent.position.x + 5, ent.position.y + 1, 30, 30);
        }
        loadCanvas() {
            this.map.drawImage(this.getImage("Grundriss"), 0, 0, 600, 800);
        }
        loadWorkplaces() {
            this.map.fillStyle = "lightgrey";
            this.entityList.push(new RestaurantSimulation.Workplace(new RestaurantSimulation.Yufka(), new RestaurantSimulation.Vector(370, 20)));
            this.entityList.push(new RestaurantSimulation.Workplace(new RestaurantSimulation.Doener(), new RestaurantSimulation.Vector(450, 20)));
            this.entityList.push(new RestaurantSimulation.Workplace(new RestaurantSimulation.Lahmacun(), new RestaurantSimulation.Vector(525, 20)));
        }
        loadStorages() {
            this.entityList.push(new RestaurantSimulation.Storage(new RestaurantSimulation.Item("Tomate_ganz"), this.storageAmount, new RestaurantSimulation.Vector(72, 22)));
            this.entityList.push(new RestaurantSimulation.Storage(new RestaurantSimulation.Item("Zwiebel_ganz"), this.storageAmount, new RestaurantSimulation.Vector(118, 22)));
            this.entityList.push(new RestaurantSimulation.Storage(new RestaurantSimulation.Item("Peperoni"), this.storageAmount, new RestaurantSimulation.Vector(164, 22)));
            this.entityList.push(new RestaurantSimulation.Storage(new RestaurantSimulation.Item("Gurke_ganz"), this.storageAmount, new RestaurantSimulation.Vector(215, 22)));
            this.entityList.push(new RestaurantSimulation.Storage(new RestaurantSimulation.Item("Mais_ganz"), this.storageAmount, new RestaurantSimulation.Vector(260, 22)));
            this.entityList.push(new RestaurantSimulation.Storage(new RestaurantSimulation.Item("Salat_ganz"), this.storageAmount, new RestaurantSimulation.Vector(307, 22)));
            this.entityList.push(new RestaurantSimulation.Storage(new RestaurantSimulation.Item("Kebabfleisch_roh"), this.storageAmount, new RestaurantSimulation.Vector(16, 320)));
        }
        loadCounter() {
            let counter = new RestaurantSimulation.Counter(new RestaurantSimulation.Vector(262, 428));
            this.entityList.push(counter);
            this.counter = counter;
        }
        loadMealPlaces() {
            this.entityList.push(new RestaurantSimulation.Place(new RestaurantSimulation.Vector(345, 428)));
            this.entityList.push(new RestaurantSimulation.Place(new RestaurantSimulation.Vector(422, 428)));
        }
        loadTrashBin() {
            this.entityList.push(new RestaurantSimulation.Bin(new RestaurantSimulation.Vector(18, 81)));
        }
    }
    RestaurantSimulation.Trainer = Trainer;
})(RestaurantSimulation || (RestaurantSimulation = {}));
//# sourceMappingURL=Trainer.js.map