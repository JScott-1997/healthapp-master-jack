const heightForm = document.getElementById('heightForm');
heightForm.addEventListener('submit', saveHeight)
const currentHeightEl = document.getElementById('customerHeight');

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
        res.json().then(data => console.log(data), heightForm.appendChild(document.createElement('small')).innerHTML = "Updated successfully."),
        currentHeightEl.innerHTML = data+'cm';
    });
}