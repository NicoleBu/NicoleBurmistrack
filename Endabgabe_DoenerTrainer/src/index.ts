namespace RestaurantSimulation {
    document.addEventListener('DOMContentLoaded', function() {
        const startBtn = document.getElementById("startBtn") as HTMLButtonElement;
        startBtn.addEventListener("click", startGame);
    });

    function startGame(evt: Event){
        let employeeField = document.getElementById("employees") as HTMLInputElement;
        let customerField = document.getElementById("customersmin") as HTMLInputElement;
        let storageField = document.getElementById("storage") as HTMLInputElement;
        let employeetimeField = document.getElementById("employeetime") as HTMLInputElement;
        let canvas = document.getElementById("cv") as HTMLCanvasElement;
        let ctx = canvas.getContext("2d");

        if(!employeeField || !customerField || !storageField || !employeetimeField || !ctx || !canvas){
            return;
        }

        new Trainer(Number(customerField.value), Number(employeeField.value), Number(storageField.value), Number(employeetimeField.value), ctx, canvas);
    }
}