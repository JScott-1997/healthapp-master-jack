
//Label for chart (prototype use only, to be replaced by record submission dates)
const dates = ["01/03/2022", "02/03/2022", "03/03/2022", "04/03/2022", "05/03/2022", "06/03/2022"
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

//User data for charts
const userHeight = 1.76;
const userAge = 40;
const userBMI = [];
const weightData = [75, 75, 73, 74, 71, 69];
const calorieData = [1500, 2300, 2000, 2150, 1700, 2500];
const calorieTarget = 2000;
let targetWeight = 65;
let currentWeight = weightData[weightData.length - 1];

//Fills modal with submission data
const weightModaltable = document.getElementById('weightModalData');

weightData.forEach(function () {
    const modalRow1 = weightModaltable.insertRow(modalRowCounter);
    const cell1 = modalRow1.insertCell(0);
    cell1.innerHTML = dates[modalRowCounter - 1];
    const cell2 = modalRow1.insertCell(1);
    cell2.innerHTML = weightData[modalRowCounter - 1];
    modalRowCounter++;
})

//Calculates BMI and fills array with data to 2 decimal places
function getBMI(item, index, arr) {
    userBMI.push((arr[index] / (userHeight * userHeight)).toFixed(2));
}
weightData.forEach(getBMI);

//Then get current BMI
const currentBMI = userBMI[userBMI.length - 1];

//Setting messages for weight section
let target = document.getElementById('targetWeight');
target.innerHTML = `${targetWeight}KG`;
let current = document.getElementById('currentWeight');
current.innerHTML = `${currentWeight}KG`;
let weightMessage = document.getElementById('weightMessage');

weightMessage.innerHTML = getWeightMessage(targetWeight, currentWeight);

function getWeightMessage(targetWeight, currentWeight) {
    const weightDifference = Math.abs(targetWeight - currentWeight);
    if (targetWeight > currentWeight) {
        return `You are <b>${weightDifference}KG</b> below your target`
    }
    else if (targetWeight < currentWeight) {
        return `You are <b>${weightDifference}KG</b> above your target`
    }
    else {
        return `Well done, you're on target!`
    }
}

//Chart.js charts settings and config
const weightChart = new Chart(
    document.getElementById('weightchart'),
    {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Weight (KG)',
                backgroundColor: 'rgb(47, 168, 58)',
                borderColor: 'rgb(47, 168, 58)',
                data: weightData,
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
                // point: {
                //     radius: 1
                // }
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
const form = document.getElementById('weightForm');

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const buttonPressed = document.activeElement.id;

    //Check if user is recording new weight or setting new target
    if (buttonPressed === 'record') {
        const input = document.getElementById('weight');
        const newWeight = input.value;
        currentWeight = newWeight;
        input.value = '';
        dates.push(dateOnly);
        weightData.push(newWeight);
        current.innerHTML = `${newWeight}KG`;
        weightMessage.innerHTML = getWeightMessage(targetWeight, currentWeight);

        updateChart(weightChart, dateOnly, currentWeight);
        addModalData(weightModaltable, dateOnly, currentWeight);
    }
    else if (buttonPressed === 'set') {
        const input = document.getElementById('target');
        targetWeight = input.value;
        input.value = '';
        weightMessage.innerHTML = getWeightMessage(targetWeight, currentWeight);
        target.innerHTML = `${targetWeight}KG`;
    }
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

