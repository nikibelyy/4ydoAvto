<script src="https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=3de168ba-04ed-42f5-bb4e-6abff9b3f317"></script>
<script>
ymaps.ready(init);

function init() {
    var myMap = new ymaps.Map("map", {
        center: [51.6833, 39.1802],
        zoom: 13,
        controls: []
    });

    // Провайдер пробок
    var trafficProvider = new ymaps.traffic.provider.Actual({}, { infoLayerShown: true });
    trafficProvider.setMap(myMap);

    // Наш глобальный массив для всех ДТП
    window.__ACCIDENTS = [];

    // Функция для фильтрации ДТП и добавления в массив
    function updateAccidents() {
        const events = trafficProvider.getEvents ? trafficProvider.getEvents() : [];
        events.forEach(e => {
            const props = e.properties || {};
            const coords = e.geometry && e.geometry.coordinates ? e.geometry.coordinates : null;
            const type = props.type || "";

            if (/accident/i.test(type)) {
                // Проверяем, есть ли уже в массиве
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

    // Обновляем ДТП каждые 2-3 секунды
    setInterval(updateAccidents, 3000);

    // Доступно для Python через Playwright
    window.getIncidents = function() {
        return window.__ACCIDENTS;
    };
}
</script>
