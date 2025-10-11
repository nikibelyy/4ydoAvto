ymaps.ready(init);

function init() {
    // Создаём карту
    var myMap = new ymaps.Map("map", {
        center: [51.6833, 39.1802], // Воронеж
        zoom: 13,
        controls: []
    });

    window.__MY_MAP = myMap;
    var markersArray = [];
    window.__MY_MARKERS = markersArray;

    // Провайдер пробок с дорожными событиями
    var trafficProvider = new ymaps.traffic.provider.Actual({}, { infoLayerShown: true });
    trafficProvider.setMap(myMap);

    // Глобальный массив для ДТП
    window.__ACCIDENTS = [];

    // Функция для обновления ДТП
    function updateAccidents() {
        const events = trafficProvider.getEvents ? trafficProvider.getEvents() : [];
        events.forEach(e => {
            const props = e.properties || {};
            const coords = e.geometry && e.geometry.coordinates ? e.geometry.coordinates : null;
            const type = props.type || "";

            // Только ДТП
            if (/accident/i.test(type)) {
                const exists = window.__ACCIDENTS.find(a => a.id === props.id);
                if (!exists) {
                    window.__ACCIDENTS.push({
                        id: props.id || (coords ? coords.join(",") : props.name || ""),
                        address: props.name || "Адрес не указан",
                        lat: coords ? coords[1] : null,
                        lon: coords ? coords[0] : null,
                        type: type
                    });
                }
            }
        });
    }

    // Обновляем ДТП каждые 3 секунды
    setInterval(updateAccidents, 3000);

    // Глобальная функция для Python-бота
    window.getIncidents = function() {
        return window.__ACCIDENTS;
    };
}
