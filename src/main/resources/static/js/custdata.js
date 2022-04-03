function getCustData(){
  fetch('/customer/customer')
      .then(jsonData => jsonData.json())
      .then(data => saveToSession(data))

  let saveToSession = (data) => {
      sessionStorage.setItem('customer', JSON.stringify(data));
  }
}


function saveEntry(entry, path, type){
    let postedData = {};
    postedData.dateOfEntry = entry.x;
    postedData['entry' + type] = entry.y;
    fetch(path, {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(postedData)
    }).then(res => {
    });
}

function saveTarget(target, path){
        fetch(path, {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(target)
        }).then(res => {
        });
}

function saveUnits(unitsPref){
        const units = {
            customerUnitsPreference: unitsPref
        }
        fetch('/customer/units/save', {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(unitsPref)
        }).then(res => {
        });
}