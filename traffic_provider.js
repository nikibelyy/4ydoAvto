ymaps.ready(init);

function init() {
    // Создаем карту, центрируем на Воронеж
    var myMap = new ymaps.Map("map", {
        center: [51.6833, 39.1802], // координаты центра Воронежа
        zoom: 13,                    // подходящий масштаб для города
        controls: []
    });

    // Создаем провайдер пробок с включенными дорожными событиями
    var actualProvider = new ymaps.traffic.provider.Actual(
        {},
        { infoLayerShown: true } // дорожные события
    );

    // Добавляем провайдер на карту
    actualProvider.setMap(myMap);

    // Слой инфоточек для событий на дорогах
    var infoLayer = new ymaps.traffic.InfoLayer(myMap, {
        provider: actualProvider
    });

    infoLayer.setMap(myMap);
}
