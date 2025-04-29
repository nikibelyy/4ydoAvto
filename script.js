function generateFromForm() {
  const fio = document.getElementById("fio").value.trim();
  const car = document.getElementById("car").value.trim();
  const plate = document.getElementById("plate").value.trim();
  const street = document.getElementById("street").value.trim();
  const otherCar = document.getElementById("otherCar").value.trim();
  const violation = document.getElementById("violation").value.trim();
  const role = document.querySelector('input[name="role"]:checked');

  if (!role) {
    alert("Пожалуйста, выберите свою роль в ДТП.");
    return;
  }

  let text = "";

  if (role.value === "виновник") {
    text = `Я, ${fio}, управлял автомобилем ${car}, ${plate}, двигаясь по ${street}, не соблюдал безопасную дистанцию/скорость/правила маневрирования, в результате чего произошло столкновение с автомобилем ${otherCar}. Вину признаю, с обстоятельствами согласен.`;
  } else if (role.value === "потерпевший") {
    text = `Я, ${fio}, управлял автомобилем ${car}, ${plate}, и двигался по ${street}, соблюдая ПДД. Водитель автомобиля ${otherCar} нарушил правила: ${violation}, в результате чего произошло столкновение. Вины в произошедшем не признаю.`;
  }

  document.getElementById("output").innerText = text;
}
