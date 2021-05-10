// configuration keys of auth api for fetch data
const config = {
    // countries
    cUrl: "https://api.countrystatecity.in/v1/countries",
    cKey: "dXRHa2l1QXZBMXNEUmxjdE9VZ2l5ejRudmZ4dVZwMUpTOTBOcnZtMg==",
    // weather
    wUrl: "https://api.openweathermap.org/data/2.5/",
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
        return `
        <div class="tempcard">
        
    <div>Temprature : ${val.temp}${flag}</div>
    <div>Max : ${val.temp_max}${flag}</div>
    <div>Min : ${val.temp_min}${flag}</div>
    </div>
    <div class="button button-dial mt-4">

            <span class="button-dial-spoke"></span>
            <span class="button-dial-spoke"></span>
            <span class="button-dial-spoke"></span>
            <span class="button-dial-spoke"></span>
            <span class="button-dial-spoke"></span>
            <span class="button-dial-spoke"></span>

            <div class="button-dial-top"></div>
            <div class="button-dial-label">
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px"
                y="0px" viewBox="0 0 100 125" enable-background="new 0 0 100 100" xml:space="preserve" class="meter">
                <g>
                  <path
                    d="M60.333,68.349V11.111C60.333,4.984,55.349,0,49.222,0c-6.126,0-11.111,4.984-11.111,11.111v57.237   c-4.15,3.323-6.667,8.397-6.667,13.874c0,9.802,7.975,17.777,17.777,17.777C59.024,100,67,92.024,67,82.223   C67,76.746,64.482,71.672,60.333,68.349z M44.778,48.363h4.444v-4.444h-4.444V35.03h4.444v-4.444h-4.444v-8.889h4.444v-4.444   h-4.444v-6.142c0-2.455,1.99-4.444,4.444-4.444c2.455,0,4.445,1.989,4.445,4.444v41.111h-8.889V48.363z">
                  </path>
                </g>
              </svg> ${val.temp}${flag}
            </div>
          </div>
    `;
    }
    // @param data = weatherInfo.{} = getWeather(selectedCity, countryDropDown.value).{};
    // and display the html
const displayWeather = (data) => {
        const temp = getTemp(data.main, "cell");
        const weatherWidget = `
        
        


        <div class="flex-button-container">
        <button class="button button-large units">
        ${getDateTime(data.dt)}<br/>
        City : ${data.name} ${data.sys.country}
    </button>

        
    
    ${data.weather.map(
            (w) => `
            <button class="button button-large">
            
            Weather : ${w.description}<br>
            Haze : <img src="https://openweathermap.org/img/wn/${w.icon}.png">
            </button>`
        ).join(" ")} 
        </div>
        <button class="button button-large w-100 mt-4" id="tempcard">
        ${getTemp(data.main,"cell")}
        </button>
                    
                    
          
          <a class="btn btn-primary button unitLink mt-2 active" data-list="metric">C </a>
          <a class="btn btn-primary button unitLink mt-2 mx-1" data-list="imperial">F </a>
          `;
    tempCont.innerHTML = weatherWidget;
};

const dispLoader = () => {
    return `
    <div class="spinner-grow text-primary m-auto d-block" role="status">
      <span class="sr-only">Loading...</span>
  </div>`;
};

const countryDropDown = document.querySelector("#countrylist");
const stateDropDown = document.querySelector("#statelist");
const cityDropDown = document.querySelector("#citylist");
const tempCont = document.querySelector("#tempContainer");


const countryValue = document.querySelector("#countryValue");
const stateValue = document.querySelector("#stateValue");
const cityValue = document.querySelector("#cityValue");




// on Document  load
document.addEventListener("DOMContentLoaded", async () => {

    // return promise
    const countries = await getCountries("countries");
    // console.log(countries);
    // to display option to select country
    let countriesOptions = "";
    if (countries) {
        countries.forEach(country => {
            countriesOptions += `<option value="${country.iso2}">${country.name}</option>`;
        });
        countryDropDown.innerHTML = countriesOptions;
    }

    // List state when client select country and here we using this keyword so we are not using arrow function here
    countryValue.addEventListener('change', async function () {
        const selectedCountryCode = this.value;
        const states = await getCountries("states", selectedCountryCode);


        let stateOptions = '';
        if (states) {

            states.forEach(state => {
                stateOptions += `<option value="${state.iso2}">${state.name}</option>`;
            });
            stateDropDown.innerHTML = stateOptions;
            stateValue.disabled = false;
            stateValue.focus();
        }
        // console.log(states);

    });

    // list cities
    stateValue.addEventListener("change", async function () {
        // for getting the value of country we can't use this keyword so we'll use option value explicity by  id
        const selectedCountryCode = countryValue.value;
        const selectedStateCode = this.value;
        const cities = await getCountries("cities", selectedCountryCode, selectedStateCode);
        // console.log(cities);

        let citiesOptions = '';
        if (cities) {

            cities.forEach(city => {
                citiesOptions += `<option value="${city.name}">${city.name}</option>`;
            })
        }
        cityDropDown.innerHTML = citiesOptions;
        cityValue.disabled = false;
        cityValue.focus();

    });

    // select city value
    cityValue.addEventListener("change", async function () {
        const selectedCity = this.value;
        // console.log(city);
        tempCont.innerHTML = dispLoader();
        // getWeather is also return Promise so we will use async await
        const weatherInfo = await getWeather(selectedCity, countryValue.value);

        // console.log(weatherInfo);

        displayWeather(weatherInfo);

        // console.log(countryDropDown.value);

    });
});

document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("unitLink")) {

        const unitValue = e.target.getAttribute("data-list");

        const selectedCountryCode = countryValue.value;
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