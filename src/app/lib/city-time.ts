export async function getCityTime({ cityName }: { cityName: string }) {
  console.log(
    "-------------------------------getCityTime-------------------------------",
    cityName,
  );
  // Step 1: Resolve city to timezone via Open-Meteo (Free, no key required)
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1`,
  );
  const geoData = await geoRes.json();

  console.log(geoData);

  if (!geoData.results || geoData.results.length === 0) {
    throw new Error("City not found");
  }

  const { timezone } = geoData.results[0];

  // Step 2: Fetch current time using WorldTimeAPI (Free, no key required)
  const timeRes = await fetch(
    `https://worldtimeapi.org/api/timezone/${timezone}`,
  );
  const timeData = await timeRes.json();

  console.log(timeRes);

  return {
    city: geoData.results[0].name as string,
    timezone: timeData.timezone as string,
    datetime: timeData.datetime as string, // ISO string with current local time
  };
}

// Usage
// getTimeByCity("Tokyo").then(console.log);
