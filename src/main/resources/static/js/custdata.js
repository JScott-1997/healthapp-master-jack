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