export async function callTheServer(route, value1, value2 = null) {

    const object = {'key1': value1, 'key2': value2};
    const response = await fetch(`/${route}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(object)
    });
    if (!response.ok) throw new Error(`Une erreur est survenue: ${response.status}`);
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
}



export async function getWeather(latitude, longitude, timezoneName) {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relativehumidity_2m,dewpoint_2m,apparent_temperature,precipitation,weathercode,surface_pressure,cloudcover,windspeed_10m,winddirection_10m,windgusts_10m,soil_temperature_0cm,soil_moisture_0_1cm&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant,shortwave_radiation_sum&current_weather=true&timezone=${timezoneName}`);
    if (!response.ok) throw new Error(`Une erreur est survenue: ${response.status}`);
    return await response.json()
}
