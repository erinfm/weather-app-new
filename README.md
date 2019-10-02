# weather-app-new

# Weather App

**Project in progress**

Fetches and displays current weather data, and the local date and time, for a user-chosen city. Uses vanilla Javascript, CSS, HTML, OpenWeatherMap API and TimeZoneDB API. User needs to **recreate config.js file** with their own OpenWeatherMap API and TimeZoneDB API keys before use.

### To use the app: first create config.js

To use, you will need to use your own API keys for the OpenWeatherMap API and TimeZoneDB API. Then create a config.js file in the project's root directory, containing the following:

```
const config = {
  OWM_API_KEY: " *your OpenWeatherMap API Key* ",
  TIMEZONEDB_API_KEY: " *your TimeZoneDB API Key* ",
}
```

for example:

```
const config = {
  OWM_API_KEY: "AAAAAAA111111",
  TIMEZONEDB_API_KEY: "BBBBB22222222",
}
```
