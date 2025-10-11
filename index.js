<script src="https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=3de168ba-04ed-42f5-bb4e-6abff9b3f317" type="text/javascript"></script>
<script>
ymaps.ready(init);

function init() {
    // Создаём карту
    var myMap = new ymaps.Map("map", {
        center: [51.6833, 39.1802], // Воронеж
        zoom: 13,
        controls: []
    });

    // Создаём провайдер пробок с дорожными событиями
    var trafficProvider = new ymaps.traffic.provider.Actual({}, { infoLayerShown: true });

    // Добавляем провайдер на карту
    trafficProvider.setMap(myMap);

    // Массив для всех событий ДТП
    var accidentEvents = [];

    // Функция для фильтрации только ДТП
    function updateAccidents() {
        var allEvents = trafficProvider.getEvents();
        accidentEvents = allEvents.filter(e => e.properties.type === 'accident');
    }

    // Обновляем список ДТП каждые 5 секунд
    setInterval(updateAccidents, 5000);

    // Делаем доступным для внешнего скрипта
    window.getIncidents = function() {
        updateAccidents();
        return accidentEvents.map(e => ({
            id: e.id,
            address: e.properties.name || 'Адрес не указан',
            lat: e.geometry.coordinates[1],
            lon: e.geometry.coordinates[0],
            type: e.properties.type
        }));
    };
}
</script>
