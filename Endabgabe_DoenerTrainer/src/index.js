"use strict";
var RestaurantSimulation;
(function (RestaurantSimulation) {
    document.addEventListener('DOMContentLoaded', function () {
        const startBtn = document.getElementById("startBtn");
        startBtn.addEventListener("click", startGame);
    });
    function startGame(evt) {
        let employeeField = document.getElementById("employees");
        let customerField = document.getElementById("customersmin");
        let storageField = document.getElementById("storage");
        let employeetimeField = document.getElementById("employeetime");
        let canvas = document.getElementById("cv");
        let ctx = canvas.getContext("2d");
        if (!employeeField || !customerField || !storageField || !employeetimeField || !ctx || !canvas) {
            return;
        }
        new RestaurantSimulation.Trainer(Number(customerField.value), Number(employeeField.value), Number(storageField.value), Number(employeetimeField.value), ctx, canvas);
    }
})(RestaurantSimulation || (RestaurantSimulation = {}));
//# sourceMappingURL=index.js.map