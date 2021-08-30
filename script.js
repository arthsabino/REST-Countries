if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready)
} else {
    ready()
}

var state = {
    'dataSet' : [],
    'page' : 1,
    'count' : 12,
    'window' : 5
}
var pages;
var countries;
async function ready() {
    countries = await getCountries();
    const regions = await getRegions();
    let modalElement = document.getElementById('country_modal')
    let closeModalButton = modalElement.getElementsByClassName('modal-close')
    let searchButton = document.getElementsByClassName('btn-search')[0]
    let filterRegionSelectElement = document.getElementById('filter_by_region')
    let searchCountryInputElement = document.getElementsByClassName('search-country')[0]
    let modeContainerElement = document.getElementsByClassName('mode-container')[0]

    for(let i = 0; i < closeModalButton.length; i++) {
        let button = closeModalButton[i]
        button.addEventListener('click', closeModal)
    }
    searchButton.addEventListener('click', searchCountry)
    searchCountryInputElement.addEventListener('input', searchCountryInput);
    filterRegionSelectElement.addEventListener('change', filterRegionChange)
    modeContainerElement.addEventListener('click', modeContainerClick);

    
    updateDisplayCountries()
    displayRegions(regions);

    if (localStorage.getItem('theme') === 'theme-light') {
        setTheme('theme-light');
    } else {
        setTheme('theme-dark');
    }
}


function setPagination(dataset, page, count) {
    let trimStart = (page - 1) * count;
    let trimEnd = trimStart + count;
    let paginatedData = dataset.slice(trimStart, trimEnd)
    let totalPages = Math.ceil(dataset.length / count)

    state.dataSet = paginatedData;
    pages = totalPages;
}

function updateDisplayCountries() {
    setPagination(countries, state.page, state.count)
    displayPageButtons(pages);
    displayCountries(countries);
}

function displayPageButtons(pages) {
    const paginationContainer = document.getElementsByClassName('pagination-container')[0]
    paginationContainer.innerHTML = ''

    let maxLeft = (state.page - Math.floor(state.window/2))
    let maxRight = (state.page + Math.floor(state.window/2))

    if(maxLeft < 1) {
        maxLeft = 1
        maxRight = state.window
    }

    if(maxRight > pages) {
        maxLeft = pages - (state.window - 1)
        maxRight = pages
        if(maxLeft < 1) maxLeft = 1
    }

    for(let i = maxLeft; i <= maxRight; i++) paginationContainer.innerHTML += `<button type="button" class="btn btn-pages" value="${i}">${i}</button>`
    if(state.page != 1) paginationContainer.innerHTML = `<button type="button" class="btn btn-pages" value="${1}">&#171; First</button> ${paginationContainer.innerHTML}`
    if(state.page != pages) paginationContainer.innerHTML += `<button type="button" class="btn btn-pages" value="${pages}">Last &#187;</button>`
    let btnPages = document.getElementsByClassName('btn-pages')
    for (let i = 0; i < btnPages.length; i++) {
        let element = btnPages[i];
        element.addEventListener('click', btnPageClicked)
    }

    state.page = 1
    
}

function btnPageClicked(event) {
    const element = event.target
    const value = event.target.value;
    const btnPages = document.getElementsByClassName('btn-pages')
    removeClassName(btnPages, 'active')
    element.classList.add('active')
    console.log(element.classList)
    state.page = value;
    setPagination(countries, state.page, state.count)
    displayCountries(countries);

}

async function getCountries() {
    const response = await fetch('https://restcountries.eu/rest/v2/all?fields=flag;name;population;region;capital', { method: 'GET' });
    const _countries =  await response.json()
    return _countries;
}

async function getRegions() {
    let countryRegions = new Set()
    const response = await fetch('https://restcountries.eu/rest/v2/all?fields=region', { method: 'GET' });
    const regions =  await response.json()
    regions.forEach((region) => {
        if(region.region) countryRegions.add(region.region)
    })
    
    return Array.from(countryRegions);
}

async function getCountriesByRegions(region) {
    const response = await fetch(`https://restcountries.eu/rest/v2/region/${region}`, { method: 'GET' });
    const _countries =  await response.json()
    return _countries;

}

async function getCountry(name) {
    const response = await fetch(`https://restcountries.eu/rest/v2/name/${name}?fullText=true`, { method: 'GET' });
    const country =  await response.json()
    return country[0];
}

async function searchCountryInput(event) {
    let element = event.target;
    if(element.value === null || element.value === ''){
        countries = await getCountries();
        updateDisplayCountries()
    }
}

async function searchCountry() {
    let inputValue = document.getElementsByClassName('search-country')[0].value
    if(inputValue === null || inputValue === ''){
        alert('No search value');
        return;
    } else {
        clearDisplayCountries()
        let country = await getCountry(inputValue);
        countries = [country]
        updateDisplayCountries()
    }

}

async function filterRegionChange(event) {
    let element = event.target
    let region = element.value
    countries = await getCountriesByRegions(region)
    updateDisplayCountries()
}

function displayCountries(countries) {
    let countryContainer = document.getElementsByClassName('country-container')[0]
    clearDisplayCountries()
    state.dataSet.forEach(country => {
        let countryItem = document.createElement('div');
        countryItem.classList.add('card', 'country-item')
        countryItem.dataset.countryName = country.name
        countryItem.innerHTML=
        `
            <div class="card-header">
                <img class="country-flag" src="${country.flag}" alt="">
            </div>
            <div class="card-body country-information">
                <div class="country-name-container">
                    <span class="country-name">${country.name}</span>
                </div>
                <div class="other-information-container">
                    <div class="flex-container country-population-container">
                        <span class="country-label">Population: </span>
                        <span class="country-info country-population">${Number(country.population).toLocaleString('en')}</span>
                    </div>
                    <div class="flex-container country-region-container">
                        <span class="country-label">Region: </span>
                        <span class="country-info country-region">${country.region}</span>
                    </div>
                    <div class="flex-container country-capital-container">
                        <span class="country-label">Capital: </span>
                        <span class="country-info country-capital">${country.capital}</span>
                    </div>
                </div>
            </div>
        `
        countryItem.addEventListener('click', countryItemClicked)
        countryContainer.append(countryItem)
    });
}

function displayRegions(regions) {
    let filterRegionSelectElement = document.getElementById('filter_by_region')
    regions.forEach((region) => {
        let regionOption = document.createElement('option')
        regionOption.value = region
        regionOption.innerHTML = region
        filterRegionSelectElement.appendChild(regionOption)
    })
}

async function countryItemClicked(event) {
    let element = event.target
    let countryItem = element.closest('.country-item')
    let modalElement = document.getElementById('country_modal')
    let country = await getCountry(countryItem.dataset.countryName)
    
    let countryElement = document.createElement('div')
    const currencies = country.currencies.map((currency) => {
        return currency.name
    }).join(', ')
    const languages = country.languages.map((language) => {
        return language.name
    }).join(', ')
    
    const borderCountries = country.borders.map( (borderCountry) => {
        let buttonElement = document.createElement('button')
        buttonElement.classList.add('btn', 'btn-black', 'btn-border-country')
        buttonElement.innerHTML = borderCountry
        return buttonElement
    })
    countryElement.innerHTML = 
    `
        <div>
            <img class="country-flag" src="${country.flag}" alt="">
        </div>
        <div class="country-information">
            <div class="country-name-container">
                <h2 class="country-name">${country.name}</h2>
            </div>
            <div class="other-information-container">
                <div class="flex-container country-native-name-container">
                    <span class="country-label">Native Name: </span>
                    <span class="country-info country-native-name">${country.nativeName}</span>
                </div>
                <div class="flex-container country-population-container">
                    <span class="country-label">Population: </span>
                    <span class="country-info country-population">${Number(country.population).toLocaleString('en')}</span>
                </div>
                <div class="flex-container country-region-container">
                    <span class="country-label">Region: </span>
                    <span class="country-info country-region">${country.region}</span>
                </div>
                <div class="flex-container country-sub-region-container">
                    <span class="country-label">Sub-Region: </span>
                    <span class="country-info country-sub-region">${country.subRegion}</span>
                </div>
                <div class="flex-container country-capital-container">
                    <span class="country-label">Capital: </span>
                    <span class="country-info country-capital">${country.capital}</span>
                </div>
            </div>
            <div class="other-information-container">
                <div class="flex-container country-top-level-domain-container">
                    <span class="country-label">Top Level Domain: </span>
                    <span class="country-info country-top-level-domain">${country.topLevelDomain}</span>
                </div>
                <div class="flex-container country-currencies-container">
                    <span class="country-label">Currencies: </span>
                    <span class="country-info country-currencies">${currencies}</span>
                </div>
                <div class="flex-container country-languages-container">
                    <span class="country-label">Languages: </span>
                    <span class="country-info country-languages">${languages}</span>
                </div>
            </div>
            <div class="other-information-container">
                <div class="country-border-countries-container">
                    <span class="country-label">Border Countries: </span>
                    <div class="flex-container border-countries-button-container">
                    </div>
                </div>
            </div>
        </div>
    `
    borderCountries.forEach((buttonElement) => { countryElement.getElementsByClassName('border-countries-button-container')[0].append(buttonElement) })
    modalElement.getElementsByClassName('modal-body')[0].appendChild(countryElement)
    displayModal(modalElement)
}

function modeContainerClick(event) {
    if(document.documentElement.classList.contains('theme-dark')) setTheme('theme-light');
    else setTheme('theme-dark')
    
}

function setTheme(themeName) {
    localStorage.setItem('theme', themeName);
    document.documentElement.className = themeName;
}

function toggleTheme() {
    if (localStorage.getItem('theme') === 'theme-light') {
        setTheme('theme-light');
    } else {
        setTheme('theme-dark');
    }
}

function displayModal(modal) {
    document.body.style.overflow = 'hidden';
    modal.style.display = 'block'
}

function closeModal(event) {
    let element = event.target
    let modalElement = element.closest('.modal')
    modalElement.style.display = 'none'
    const scrollY = document.body.style.top;
    document.body.style.position = '';
    document.body.style.top = '';
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
    document.body.style.overflow = 'visible';
    modalElement.getElementsByClassName('modal-body')[0].innerHTML=''
}

function clearDisplayCountries() {
    let countryContainer = document.getElementsByClassName('country-container')[0]
    countryContainer.innerHTML = ''
}

function removeClassName(elements, className) {
    for(let i = 0; i < elements.length; i++) {
        let button = elements[i]
        button.classList.remove(className)
    }
}