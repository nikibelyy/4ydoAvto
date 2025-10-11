ymaps.ready(init);

function init() {
    const map = new ymaps.Map("map", {
        center: [51.6833, 39.1802], // Воронеж
        zoom: 13,
        controls: []
    });

    // Провайдер пробок и событий
    const provider = new ymaps.traffic.provider.Actual({}, { infoLayerShown: true });
    provider.setMap(map);

    // Слой дорожных событий
    const infoLayer = new ymaps.traffic.layer.Info({ provider: provider });
    map.layers.add(infoLayer);

    // Функция для получения ДТП
    window.getIncidents = function() {
        const results = [];

        try {
            const events = provider.getEvents();
            if (!events || !events.length) return [];

            for (const e of events) {
                try {
                    const props = e.properties ? e.properties.getAll() : {};
                    const description = props.description || props.hintContent || "";

                    // Только ДТП
                    if (/ДТП/i.test(description)) {
                        const geo = e.geometry ? e.geometry.getCoordinates() : null;
                        if (geo) {
                            results.push({
                                id: props.id || `${geo[0]},${geo[1]}`,
                                address: props.address || description,
                                lat: geo[0],
                                lon: geo[1]
                            });
                        }
                    }
                } catch (err) {
                    console.error("Ошибка разбора события:", err);
                }
            }
        } catch (err) {
            console.error("Ошибка получения событий:", err);
        }

        return results;
    };

    console.log("✅ Яндекс.Карта и getIncidents() готовы!");
}
