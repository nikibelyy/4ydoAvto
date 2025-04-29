function generateExplanation(role) {
  const fio = document.getElementById("fio").value;
  const car = document.getElementById("car").value;
  const plate = document.getElementById("plate").value;
  const street = document.getElementById("street").value;
  const otherCar = document.getElementById("otherCar").value;
  const violation = document.getElementById("violation").value;

  let text = "";

  if (role === "виновник") {
    text = `Я, ${fio}, управлял автомобилем ${car}, ${plate}, двигаясь по ${street}, не соблюдал безопасную дистанцию/скорость/правила маневрирования, в результате чего произошло столкновение с автомобилем ${otherCar}. Вину признаю, с обстоятельствами согласен.`;
  } else if (role === "потерпевший") {
    text = `Я, ${fio}, управлял автомобилем ${car}, ${plate}, и двигался по ${street}, соблюдая ПДД. Водитель автомобиля ${otherCar} нарушил правила: ${violation}, в результате чего произошло столкновение. Вины в произошедшем не признаю.`;
  }

  document.getElementById("output").innerText = text;
}
