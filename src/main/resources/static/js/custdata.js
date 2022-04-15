
function getCustData() {
    fetch('/customer/customer')
        .then(jsonData => jsonData.json())
        .then(data => saveToSession(data));

    let saveToSession = (data) => {
        sessionStorage.setItem('customer', JSON.stringify(data));
    }
}

function saveEntry(entry, path, type) {
    let postedData = {};
    postedData.dateOfEntry = entry.x;
    postedData['entry' + type] = entry.y;
    fetch(path, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postedData)
    }).then(res => {
        res.json().then(data => console.log(data))
    });
}

function saveTarget(target, path) {
    fetch(path, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(target)
    }).then(res => {
        res.json().then(data => console.log(data))
    });
}

function saveUnits(evt) {
    const form = document.getElementById('unitsPrefForm')
    const units = {
        customerUnitsPreference: evt.currentTarget.value
    }
    fetch('/customer/units/save', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evt.currentTarget.value.toUpperCase())
    }).then(res => {
        res.json().then(data => console.log(data), form.appendChild(document.createElement('small')).innerHTML = "Updated successfully.")
    });
}