if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready)
} else {
    ready()
}

function ready() {
    console.log('awd')
    getCountries()
}

function getCountries() {
    const p = fetch('https://restcountries.eu/rest/v2/all', {
        method: 'GET'
    })

    console.log(p)
}

function fetchCountries() {
    return new Promise((resolve, reject) => {
        
    })
}