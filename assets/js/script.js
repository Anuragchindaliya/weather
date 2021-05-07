// configuration keys of auth api for fetch data
const config = {
    // countries
    cUrl: "https://api.countrystatecity.in/v1/countries",
    cKey: "dXRHa2l1QXZBMXNEUmxjdE9VZ2l5ejRudmZ4dVZwMUpTOTBOcnZtMg==",
    // weather
    wUrl: "http://api.openweathermap.org/data/2.5/",
    wKey: "714e4f7af2ccc29175dfc4099ff59474",
}


// get countries with fieldName and rest parameter(who have no length/ many args can be used) 
const getCountries = async(fieldName, ...args) => {
    // toCreate a api link 
    let apiEndPoint;
    switch (fieldName) {
        case "countries":
            apiEndPoint = config.cUrl;
            break;
        case "states":
            // https://api.countrystatecity.in/v1/countries/[ciso]/states

            apiEndPoint = `${config.cUrl}/${args[0]}/states/`;

            break;
        case "cities":
            // https://api.countrystatecity.in/v1/countries/[ciso]/states/[siso]/cities
            apiEndPoint = `${config.cUrl}/${args[0]}/states/${args[1]}/cities`;
            break;
        default:

    }

    // fetch will return promise so i will use async await
    const response = await fetch(apiEndPoint, {
        // just a country configuration
        headers: {
            "X-CSCAPI-KEY": config.cKey
        },
    });


    if (response.status != 200) {
        throw new Error(`Something went wrong: ${response.status}`);
    } else {
        // this json method will return Promise
        const countries = await response.json();
        return countries;
    }
};

// @param cityName is selected City
// @param ccode is selected country code

const getWeather = async(cityName, ccode, units = "metric") => {
    // http://api.openweathermap.org/data/2.5/weather?q=London,uk&APPID=714e4f7af2ccc29175dfc4099ff59474 create link like that with template literals
    const apiEndPoint = `${config.wUrl}weather?q=${cityName},${ccode.toLowerCase()}&APPID=${config.wKey}&units=${units}`;
    // console.log(apiEndPoint);
    const response = await fetch(apiEndPoint);
    if (response.status != 200) {
        throw new Error(`Something went wrong, status code ${response.status}`);
    }

    // this will give us json from response
    const weather = response.json();
    return weather;
};

// To print date in human readable form

const getDateTime = (unixTimeStamp) => {
    const miliseconds = unixTimeStamp * 1000;
    const date = new Date(miliseconds);

    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    };
    // @param language
    // @param setting as an object format
    const humanDateFormat = date.toLocaleDateString("en-US", options);
    return humanDateFormat;
}

//@param val is weather.main
//@param unit is metric or imperial
// metric for Celsius  
// imperial for Fahrenheit 
// @return html for tempcard
const getTemp = (val, unit) => {

        const flag = unit == "imperial" ? "°F" : "°C";
        return `Temprature : ${val.temp}${flag}
    <span>Max : ${val.temp_max}${flag}</span>
    <span>Min : ${val.temp_min}${flag}</span>`;
    }
    // @param data = weatherInfo.{} = getWeather(selectedCity, countryDropDown.value).{};
    // and display the html
const displayWeather = (data) => {
        const weatherWidget = `
        <div class="flex-button-container">
        <button class="button button-large units">
        ${getDateTime(data.dt)}<br/>
        City : ${data.name} ${data.sys.country}
    </button>

        <button class="button button-large" id="tempcard">
        ${getTemp(data.main,"cell")}
        </button>
    
    ${data.weather.map(
            (w) => `
            <button class="button button-large">
            
            Weather : ${w.description}<br>
            Haze : <img src="https://openweathermap.org/img/wn/${w.icon}.png">
            </button>`
        ).join(" ")} 
        </div>
        <a class="btn btn-primary button unitLink mt-2 active" data-list="metric">C </a>
                    <a class="btn btn-primary button unitLink mt-2 mx-1" data-list="imperial">F </a>
                    `;
    tempCont.innerHTML = weatherWidget;
};

const dispLoader = () => {
    return `
    <div class="spinner-grow text-primary m-auto" role="status">
      <span class="sr-only">Loading...</span>
  </div>`;
};

const countryDropDown = document.querySelector("#countrylist");
const stateDropDown = document.querySelector("#statelist");
const cityDropDown = document.querySelector("#citylist");
const tempCont = document.querySelector("#tempContainer");


// on Document  load
document.addEventListener("DOMContentLoaded", async () => {

    // return promise
    const countries = await getCountries("countries");
    // console.log(countries);
    // to display option to select country
    let countriesOptions = "";
    if (countries) {
        countriesOptions += `<option value="
            ">Country</option>`;
        countries.forEach(country => {
            countriesOptions += `<option value="${country.iso2}">${country.name}</option>`;
        });
        countryDropDown.innerHTML = countriesOptions;
    }

    // List state when client select country and here we using this keyword so we are not using arrow function here
    countryDropDown.addEventListener('change', async function () {
        const selectedCountryCode = this.value;
        const states = await getCountries("states", selectedCountryCode);


        let stateOptions = '';
        if (states) {
            stateOptions += `<option value="
                ">State</option>`;
            states.forEach(state => {
                stateOptions += `<option value="${state.iso2}">${state.name}</option>`;
            });
            stateDropDown.innerHTML = stateOptions;
            stateDropDown.disabled = false;
            stateDropDown.focus();
        }
        // console.log(states);

    });

    // list cities
    stateDropDown.addEventListener("change", async function () {
        // for getting the value of country we can't use this keyword so we'll use option value explicity by  id
        const selectedCountryCode = countryDropDown.value;
        const selectedStateCode = this.value;
        const cities = await getCountries("cities", selectedCountryCode, selectedStateCode);
        // console.log(cities);

        let citiesOptions = '';
        if (cities) {
            citiesOptions += `<option value="">City</option>`;
            cities.forEach(city => {
                citiesOptions += `<option value="${city.name}">${city.name}</option>`;
            })
        }
        cityDropDown.innerHTML = citiesOptions;
        cityDropDown.disabled = false;
        cityDropDown.focus();

    });

    // select city value
    cityDropDown.addEventListener("change", async function () {
        const selectedCity = this.value;
        // console.log(city);
        tempCont.innerHTML = dispLoader();
        // getWeather is also return Promise so we will use async await
        const weatherInfo = await getWeather(selectedCity, countryDropDown.value);

        // console.log(weatherInfo);

        displayWeather(weatherInfo);

        // console.log(countryDropDown.value);

    })
});

document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("unitLink")) {

        const unitValue = e.target.getAttribute("data-list");

        const selectedCountryCode = countryDropDown.value;
        const selectedCity = cityDropDown.value;


        const weatherInfo = await getWeather(selectedCity, selectedCountryCode, unitValue);
        const weatherTemp = getTemp(weatherInfo.main, unitValue);
        document.querySelector("#tempcard").innerHTML = weatherTemp;

        document.querySelectorAll(".unitLink").forEach((link) => {
            link.classList.remove("active");

        })
        e.target.classList.add("active");
    }
});