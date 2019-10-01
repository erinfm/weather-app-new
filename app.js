const OWM_API_KEY = config.OWM_API_KEY;
const TIMEZONEDB_API_KEY = config.TIMEZONEDB_API_KEY;

const input_field = document.getElementById("input-field");
const weather_btn = document.getElementById("weather-btn");
const overlay = document.getElementById("overlay");
const city_list = document.getElementById("city-list");

const input_page = document.getElementById("input-page");
const result_page = document.getElementById("result-page");
const result_container = document.getElementById("result-container");
const search_again_btn = document.getElementById("search-again-btn");

const findMatchingCities = user_input => {
  //Sends request for matching data, with maximum 5 results returned
  fetch(
    `https://api.openweathermap.org/data/2.5/find?q=${user_input}&sort=population&cnt=5&appid=${OWM_API_KEY}`
  )
    .then(response => response.json())
    .then(data => {
      const data_list = data.list;
      getMatchingCities(data_list);
      // hide initial inputs and display weather data
    })
    .catch(e => console.log("Error found!", e));
};

const getMatchingCities = data => {
  // Remove duplicates (same city + country)
  const cities = data.filter((obj, pos, arr) => {
    return (
      arr
        .map(mapObj => mapObj["sys"]["country"])
        .indexOf(obj["sys"]["country"]) === pos
    );
  });
  // Get only city name and country code, and format as a span
  const cities_formatted = cities
    .map(city => {
      return `<span class="city-option" data-id="${city.id}">${city.name}, ${city.sys.country}</span>`;
    })
    // remove commas between array items
    .join("");

  if (cities_formatted) displayMatchingCities(cities_formatted);
};

const displayMatchingCities = cities => {
  city_list.innerHTML = cities;
  overlay.classList.toggle("show");

  overlay.addEventListener("click", manageModal);
};

const manageModal = e => {
  // If user clicked close icon or outside modal, close modal
  if (
    e.target.classList.contains("close-modal-btn") ||
    e.target.classList.contains("overlay")
  ) {
    closeModal();
  }

  // else if user clicked a city, get the name and city id and update the input field
  else if (e.target.classList.contains("city-option")) {
    const city_name = e.target.innerHTML;
    const city_id = e.target.dataset.id;
    searchWeather(city_name, city_id, closeModal);
  }
};

const closeModal = e => {
  city_list.innerHTML = "";
  overlay.classList.toggle("show");
  overlay.removeEventListener("click", manageModal);
};

const searchWeather = (city_name, city_id, callback) => {
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?id=${city_id}&units=metric&appid=${OWM_API_KEY}`
  )
    .then(response => response.json())
    .then(data => {
      formatResponseData(data, toggleWeatherPage);
      callback();
    })
    .catch(e => console.log("Error found!", e));
};

const formatResponseData = (data, callback) => {
  let date_and_time = getLocalDate(data.coord.lon, data.coord.lat)
    .then(result => {
      const date_and_time = result;

      const weather_icon = getWeatherIcon(data.weather[0].main, date_and_time);

      const weather_data = {
        city_name: data.name,
        country: data.sys.country,
        temperature: Math.round(data.main.temp),
        weather_description: data.weather[0].description,
        weather_type: data.weather[0].main,
        weather_icon: weather_icon,
        date_and_time: date_and_time
      };

      callback(weather_data);
    })
    .catch(err => {
      console.log(err);
    });
};

const getLocalDate = async (longitude, latitude) => {
  const response = await fetch(
    `http://api.timezonedb.com/v2.1/get-time-zone?key=${TIMEZONEDB_API_KEY}&format=json&by=position&lat=${latitude}&lng=${longitude}`
  );

  const json = await response.json();
  const date = json.formatted;

  // remove seconds value from date
  const formatted_date = date.substring(0, date.length - 3);

  return formatted_date;
};

const toggleWeatherPage = weather_data => {
  if (weather_data) formatWeatherData(weather_data);

  input_page.classList.toggle("is-hidden");
  result_page.classList.toggle("is-hidden");
};

const getWeatherIcon = (weather_type, date_and_time) => {
  // If it is currently night in chosen city (between 8pm and 6am), show moon icon
  const current_hour = isNight(date_and_time);

  if (current_hour > 19 || current_hour < 07) {
    return "img/night.png";
  }

  //  Else, set icon corresponding to weather type
  switch (weather_type) {
    case "Thunderstorm":
      return "img/storm.png";
      break;

    case "Drizzle":
      return "img/light-rain.png";
      break;

    case "Rain":
      return "img/heavy-rain.png";
      break;

    case "Snow":
      return "img/snow.png";
      break;

    case "Clouds":
      return "img/light-cloud.png";
      break;

    // Heavy clouds
    //TODO

    case "Clear":
      return "img/sunny.png";
      break;

    // Default for fog, atmosphere etc
    default:
      return "img/light-cloud.png";
  }
};

const isNight = date_and_time => {
  // Get last 5 characters from string, which will be the time in 24h format
  const time = date_and_time.substring(
    date_and_time.length - 5,
    date_and_time.length - 3
  );

  return Number(time);
};

const formatWeatherData = weather_data => {
  result_container.innerHTML = `
  <div class="temp-and-description">
    <div class="temp-icon-container">
    <img src="${weather_data.weather_icon}" alt="Icon for ${weather_data.weather_description}"></div>
    <p class="weather-info">${weather_data.weather_description}</p>
  </div>
  <h2 class="temperature">${weather_data.temperature}°C</h2>
  <p class="city-name">${weather_data.city_name}, ${weather_data.country}</p>
  <p class="date">${weather_data.date_and_time}</p>
`;
};

const changeBackgroundColor = date => {
  console.log(date);
};
// EVENT LISTENERS

// when user presses return in input field or presses search button, send GET request to API for matching cities

input_field.addEventListener("keydown", e => {
  // Check if key pressed is return key
  if (e.keyCode === 13) {
    let user_input = input_field.value.toUpperCase();
    if (input_field.dataset.id) searchWeather(input_field.dataset.id);
    else findMatchingCities(user_input);
  }
});

weather_btn.addEventListener("click", () => {
  let user_input = input_field.value.toUpperCase();
  if (input_field.dataset.id) searchWeather(input_field.dataset.id);
  else findMatchingCities(user_input);
});

search_again_btn.addEventListener("click", toggleWeatherPage);
