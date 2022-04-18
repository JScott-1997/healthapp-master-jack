const heightForm = document.getElementById('heightForm');
heightForm.addEventListener('submit', saveHeight)
const currentHeightEl = document.getElementById('customerHeight');
const currentHeight = parseInt(currentHeightEl.innerHTML.replace(/\D/g,''));

getCustData();
let customer = JSON.parse(sessionStorage.getItem('customer'));

//Replace height div content with height in feet and inches if user has chosen imperial
if(customer.customerUnitsPreference=='IMPERIAL'){
    const feetAndInches = imperialHeight(currentHeight);
    currentHeightEl.innerHTML = `${feetAndInches[0]} ft ${feetAndInches[1]} in`;
}

function saveHeight(evt) {
    evt.preventDefault();
    const data = document.getElementById('dataInput').value;
    const height = {
        height: data
    }
    console.log(height)
    fetch('/customer/height/save', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(res => {
        res.json().then(data => console.log(data), heightForm.innerHTML = "<h5>Updated successfully.</h5>"),
        currentHeightEl.innerHTML = data+'cm';
    });
}

//Get height in feet and inches
function imperialHeight(height){
    const inchesTotal = height/2.54;
    const feet = Math.floor(inchesTotal/12);
    const inches = (inchesTotal - (12*feet)).toFixed(1);
    return [feet, inches];
}