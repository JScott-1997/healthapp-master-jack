

function getCustData(){
  fetch('/customer/customer')
      .then(jsonData => jsonData.json())
      .then(data => saveToSession(data))

  let saveToSession = (data) => {
      sessionStorage.setItem('customer', JSON.stringify(data));
  }
  }


  function saveHeartRate(rate){
  console.log(rate);
      fetch("/customer/heartrates/save", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(rate)
      }).then(res => {
      });
  }
