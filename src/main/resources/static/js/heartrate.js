//Dummy data for user and chart
const userAge = 40;
const maxHeartRate = 220 - userAge;
const heartRates = [55, 65, 57, 58, 59, 62, 61];
const dates = ["01/03/2022", "02/03/2022", "03/03/2022", "04/03/2022", "05/03/2022", "06/03/2022", "07/03/2022"
];

//Gets current date minus time as String
function getCurrentDate() {
    const date = new Date(Date.now()).toLocaleString();
    const dateSplit = date.split(",");
    const dateOnly = dateSplit[0];
    return dateOnly;
}

const dateOnly = getCurrentDate();

//To track current row of data in modal table
let modalRowCounter = 1;

const hrModaltable = document.getElementById('hrModalData');

heartRates.forEach(function () {
    const modalRow1 = hrModaltable.insertRow(modalRowCounter);
    const cell1 = modalRow1.insertCell(0);
    cell1.innerHTML = dates[modalRowCounter - 1];
    const cell2 = modalRow1.insertCell(1);
    cell2.innerHTML = heartRates[modalRowCounter - 1];
    modalRowCounter++;
})

//Setting messages for heart rate section
const maxRateMessage = document.getElementById('maxheartrate');
maxRateMessage.innerHTML = `${maxHeartRate}BPM`;

const heartratemessage = document.getElementById('heartratemessage');
let currentRate = heartRates[heartRates.length - 1];

function getMessage(currentRate) {
    if (currentRate >= 60 && currentRate <= 100)
        return `Your heart rate of <b>${currentRate}BPM</b> is within a healthy range`
    else {
        return `Your heart rate of <b>${currentRate}BPM</b> is outside of the healthy range`
    }
}

heartratemessage.innerHTML = getMessage(currentRate);

//Chart.js chart settings
const heartChart = new Chart(
    document.getElementById('heartchart'),
    {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'BMI',
                fill: false,
                backgroundColor: 'rgb(47, 168, 58)',
                borderColor: 'rgb(47, 168, 58)',
                data: heartRates,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            elements: {
                line: {
                    borderJoinStyle: 'round',
                    tension: 0.3,
                },
                point: {
                    radius: 0
                }
            },
            plugins: {
                legend: {
                    display: false,
                },
            },
        }
    }
);

//Add event listener to form to allow dummy data to be submitted
const form = document.getElementById('heartRateForm');

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = document.getElementById('heartRate');
    const newHeartRate = input.value;
    input.value = '';
    heartRates.push(newHeartRate);
    dates.push(dateOnly);
    updateChart(heartChart, dateOnly, newHeartRate);
    addModalData(hrModaltable, dateOnly, newHeartRate);
    currentRate = newHeartRate;
    heartratemessage.innerHTML = getMessage(currentRate);
});

//Update chart when new data is submitted without reloading page
function updateChart(chart) {
    chart.update();
}

//Add submitted data to modal table
function addModalData(table, label, data) {
    const modalRow = table.insertRow(modalRowCounter);
    const cell = modalRow.insertCell(0);
    cell.innerHTML = label;
    const cell2 = modalRow.insertCell(1);
    cell2.innerHTML = data;
    modalRowCounter++;
}