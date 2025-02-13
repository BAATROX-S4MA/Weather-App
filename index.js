const cityInput = document.querySelector('.input')
const searchBtn = document.querySelector('.searchbtn')
const locationBtn = document.querySelector('.locationbtn')

const weatherInfoSection = document.querySelector('.container-result')
const searchCitySection = document.querySelector('.container-search')
const notFoundSection = document.querySelector('.container-not-found')

const cityName = document.querySelector('.location-name')
const weatherTemp = document.querySelector('.temp-txt')
const weatherDescriptionTxt = document.querySelector('.weather-description')
const weatherDescriptionImg = document.querySelector('.weather-img')
const sunriseTime = document.querySelector('.sunrise-value')
const sunsetTime = document.querySelector('.sunset-value')
const feelsLikeTemp = document.querySelector('.feels-like-value')
const windSpeedValue = document.querySelector('.wind-speed-value')
const pressureValeu = document.querySelector('.pressure-value')
const humidityValue = document.querySelector('.humidity-value')
const actualtDate = document.querySelector('.current-date-text')
const dailyForecast = document.querySelector('.daily-forcast-cards')
const hourlyForecast = document.querySelector('.hourly-forcast-cards')

const APIkey = 'ec0603119ed94f2a6898711c1e4ed654 '

searchBtn.addEventListener('click', () => {
    if(cityInput.value.trim() != ''){
        updateWeatherInfo(cityInput.value.trim())
        cityInput.value = '';
        cityInput.blur();
    }
})

cityInput.addEventListener('keyup', (e) => {
    if(cityInput.value.trim() != '' && e.key=='Enter'){
        updateWeatherInfo(cityInput.value.trim())
        cityInput.value = '';
        cityInput.blur();
    }
})

locationBtn.addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        updateWeatherInfoByCoords(latitude, longitude);
    }, error => {
        alert("Location access denied. Please enable permissions to use this feature.");
    });
})

function getWeatherImg(id){
    if(id <= 232 && id >= 200){ return 'Thunderstorm.svg'}
    if(id <= 321 && id >= 300){ return 'Drizzle.svg'}
    if(id <= 531 && id >= 500) {return 'Rain.svg'}
    if(id <= 622 && id >= 600) {return 'Snow.svg'}
    if(id <= 781 && id >= 701) {return 'Atmosphere.svg'}
    if(id == 800) return 'Clear.svg'
    if(id <= 804 && id >= 801) return'Clouds.svg'
}

function getCurrentDate(){
    const currentDate = new Date()
    const options = {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
    }
    return currentDate.toLocaleDateString('en-GB', options)
}

function convertUnixToTime(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000);

    // Extract hours and minutes
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
}

async function getWeatherData(endPoint, query) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?${query}&appid=${APIkey}`;
    const response = await fetch(apiUrl);
    return response.json();
}

async function updateWeatherInfo(city) {
    const weatherData = await getWeatherData('weather', `q=${city}`);

    if (weatherData.cod != 200) {
        showDisplaySection(notFoundSection);
        return;
    }

    const {
        name: mdina,
        sys: { country, sunrise, sunset },
        main: { temp, feels_like, humidity, pressure },
        weather: [{ description, id }],
        wind: { speed }
    } = weatherData;

    // Update elements
    cityName.textContent = mdina + ', ' + country;
    weatherTemp.textContent = Math.round(temp - 273.15) + '°C';
    weatherDescriptionTxt.textContent = description;
    weatherDescriptionImg.src = `images/weather-condition/${getWeatherImg(id)}`;
    sunriseTime.textContent = convertUnixToTime(sunrise); 
    sunsetTime.textContent = convertUnixToTime(sunset); 
    feelsLikeTemp.textContent = Math.round(feels_like - 273.15) + '°C';
    windSpeedValue.textContent = speed + 'M/s';
    pressureValeu.textContent = pressure + 'hPa';
    humidityValue.textContent = humidity + '%';
    actualtDate.textContent = getCurrentDate();

    await updateDailyForecastsInfo(city)
    await updateHourlyForecastsInfo(city)
    showDisplaySection(weatherInfoSection);
}

async function updateWeatherInfoByCoords(latitude, longitude) {
    const weatherData = await getWeatherData('weather', `lat=${latitude}&lon=${longitude}`);

    if (weatherData.cod != 200) {
        showDisplaySection(notFoundSection);
        return;
    }

    const {
        name: mdina,
        sys: { country, sunrise, sunset },
        main: { temp, feels_like, humidity, pressure },
        weather: [{ description, id }],
        wind: { speed }
    } = weatherData;

    // Update elements
    cityName.textContent = mdina + ', ' + country;
    weatherTemp.textContent = Math.round(temp - 273.15) + '°C';
    weatherDescriptionTxt.textContent = description;
    weatherDescriptionImg.src = `images/weather-condition/${getWeatherImg(id)}`;
    sunriseTime.textContent = convertUnixToTime(sunrise);
    sunsetTime.textContent = convertUnixToTime(sunset);
    feelsLikeTemp.textContent = Math.round(feels_like - 273.15) + '°C';
    windSpeedValue.textContent = speed + 'M/s';
    pressureValeu.textContent = pressure + 'hPa';
    humidityValue.textContent = humidity + '%';
    actualtDate.textContent = getCurrentDate();

    await updateDailyForecastsInfoByCoords(latitude, longitude);
    await updateHourlyForecastsInfoByCoords(latitude, longitude);
    showDisplaySection(weatherInfoSection);
}

async function updateDailyForecastsInfo(city){
    const forecastsData = await getWeatherData('forecast', `q=${city}`)
    const timeTaken = '12:00:00'
    const todayDate = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });

    dailyForecast.innerHTML = ''
    forecastsData.list.forEach(forecastWeather => {
        if (forecastWeather.dt_txt.includes(timeTaken) && 
            !forecastWeather.dt_txt.includes(todayDate)){
                updateDailyForecastItems(forecastWeather)
        }
    })
}

async function updateDailyForecastsInfoByCoords(latitude, longitude) {
    const forecastsData = await getWeatherData('forecast', `lat=${latitude}&lon=${longitude}`);
    const timeTaken = '12:00:00';
    const todayDate = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });

    dailyForecast.innerHTML = '';
    forecastsData.list.forEach(forecastWeather => {
        if (forecastWeather.dt_txt.includes(timeTaken) &&
            !forecastWeather.dt_txt.includes(todayDate)) {
            updateDailyForecastItems(forecastWeather);
        }
    });
}

function updateDailyForecastItems(weatherData){
    const {
        dt_txt: date,
        weather: [{id}],
        main: {temp}
    } = weatherData

    const forecastDate = new Date(date)
    const dateOption = {
        day: '2-digit',
        month: 'short'
    }

    const DateResult = forecastDate.toLocaleDateString('en-GB', dateOption)

    const forecastItem = `
                            <div class="daily-forcast-card">
                                <h4 class="daily-forcast-date">${DateResult}</h4>
                                <img src="images/weather-condition/${getWeatherImg(id)}" alt="weather-img" class="daily-forcast-weather-img">
                                <h3 class="daily-forcast-temp-value">${Math.round(temp-273.15)}°C</h3>
                            </div>
                        `
        dailyForecast.insertAdjacentHTML('beforeend', forecastItem)
}

async function updateHourlyForecastsInfo(city){
    const forecastsData = await getWeatherData('forecast', `q=${city}`)
    const todayDate = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });

    hourlyForecast.innerHTML = ''
    const next8Forecasts = forecastsData.list.slice(0, 8);
    next8Forecasts.forEach(forecastWeather => {
        updateHourlyForecastItems(forecastWeather);
    })
}

async function updateHourlyForecastsInfoByCoords(latitude, longitude) {
    const forecastsData = await getWeatherData('forecast', `lat=${latitude}&lon=${longitude}`);
    const todayDate = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });

    hourlyForecast.innerHTML = '';
    const next8Forecasts = forecastsData.list.slice(0, 8);
    next8Forecasts.forEach(forecastWeather => {
        updateHourlyForecastItems(forecastWeather);
    });
}

function updateHourlyForecastItems(weatherData) {
    const {
        dt: value,
        weather: [{ id }],
        main: { temp }
    } = weatherData;

    const time = convertUnixToTime(value);

    const forecastItem = `
        <div class="hourly-forcast-card">
            <h4 class="hourly-forcast-time">${time}</h4>
            <img src="images/weather-condition/${getWeatherImg(id)}" alt="weather-img" class="hourly-forcast-weather-img">
            <h3 class="hourly-forcast-temp-value">${Math.round(temp - 273.15)}°C</h3>
        </div>
    `;
    hourlyForecast.insertAdjacentHTML('beforeend', forecastItem);
}

function showDisplaySection(section){
    [weatherInfoSection, searchCitySection, notFoundSection].forEach(sec => sec.style.display = 'none')

    section.style.display = 'block'
}
