//update and get customer object
getCustData();
let customer = JSON.parse(sessionStorage.getItem('customer'));

let usesImperialUnits = customer.customerUnitsPreference == 'IMPERIAL';
let unitsString = usesImperialUnits ? 'lbs' : 'KG';
const unitSpans = document.getElementsByClassName('unit');

//Set the units to display in areas of page where required
Array.from(unitSpans).forEach(unit => unit.innerHTML = unitsString);

let targetWeight;

//Min and max values user has submitted, used to render chart to display a practical scale
let lowestValueFromData = 1000;
let highestValueFromData = 0;
let currentMinValue = 0;
let currentMaxValue = 0;

let chartData = getChartDataFromCustomer(customer, "weight");

//Convert data and chart min/max to pounds if user has imperial units preference
if (usesImperialUnits) {
    chartData.forEach(entry => {
        entry.y = convertKGToLbs(entry.y);
    })
    lowestValueFromData = Math.round((lowestValueFromData * 2.2046))
    highestValueFromData = Math.round((highestValueFromData * 2.2046))
    targetWeight = Math.round((targetWeight * 2.2046))
}

//Change min max based on target set
getMinMaxValues();

let daysDisplayedOnChart = 7;

let currentWeight = 0;

//Setting messages for weight section
let target = document.getElementById('targetWeight');
let current = document.getElementById('currentWeight');
let weightMessage = document.getElementById('weightMessage');

if (!chartData.length == 0) {
    currentWeight = chartData[chartData.length - 1].y
    current.innerHTML = `${currentWeight}${unitsString}`;
    weightMessage.innerHTML = getWeightMessage(targetWeight, currentWeight);
}
else {
    current.innerHTML = `No data.`;
    weightMessage.innerHTML = `-`;
}
if(targetWeight == null){
        target.innerHTML = `No target set.`;
}
else{
    target.innerHTML = `${targetWeight}${unitsString}`;
}

const weightModalTable = document.getElementById('weightModalData');
const nextIn = document.getElementById('btn_next');
const prevIn = document.getElementById('btn_prev');
const pageNoSpanIn = document.getElementById('page');

setupTable(chartData, nextIn, prevIn, pageNoSpanIn, weightModalTable, 10);

function getWeightMessage(targetWeight, currentWeight) {
    const weightDifference = Math.abs(Math.round(targetWeight - currentWeight));
    if (targetWeight > currentWeight) {
        return `You are <b>${weightDifference}${unitsString}</b> below your target of <b>${targetWeight}${unitsString}</b>`
    }
    else if (targetWeight < currentWeight) {
        return `You are <b>${weightDifference}${unitsString}</b> above your target of <b>${targetWeight}${unitsString}</b>`
    }
    else {
        return `Well done, you're on target!`
    }
}

//Chart.js charts settings and config
let weightChart = new Chart(
    document.getElementById('weightchart'),
    {
        type: 'line',
        //Plugin to draw weight target line on chart
        plugins: [{
            afterDraw: chart => {
                const ctx = chart.ctx;
                ctx.save();
                const xAxis = chart.scales['x'];
                const yAxis = chart.scales['y'];
                let y = yAxis.getPixelForValue(targetWeight);
                ctx.beginPath();
                ctx.moveTo(xAxis.left, y);
                ctx.lineTo(xAxis.right, y);
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'blue';
                ctx.stroke();
                ctx.restore();
            }
        }],
        data: {
            datasets: [{
                fill: false,
                backgroundColor: 'rgb(47, 168, 58)',
                borderColor: 'rgb(47, 168, 58)',
                data: chartData,
                spanGaps: true
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            week: 'MMM d',
                            month: 'MMM'
                        }
                    },

                    //Default min 1 week
                    min: new Date(today - 6 * 24 * 60 * 60 * 1000).toISOString(),

                    //Max will be yesterday unless data exists for today
                    suggestedMax: new Date(today).toISOString(),
                    ticks: {
                        source: 'auto',
                    }
                },
                y: {
                    min: currentMinValue - 5,
                    max: currentMaxValue + 5
                },
            },
            responsive: true,
            maintainAspectRatio: true,
            elements: {
                line: {
                    borderJoinStyle: 'round',
                    tension: 0.3,
                }
            },
            plugins: {
                legend: {
                    display: false,
                },
            }
        }
    }
);

function addWeight(event) {
    event.preventDefault();

    //Get input by class
    const input = event.target.querySelector('#weight');

    //Convert to kg if user uses imperial units. data is stored in kg in db. Weight read in is used to update chart data etc as its in users choice of units
    const weightReadIn = parseInt(input.value);
    const newWeight = usesImperialUnits ? convertLbsToKG(weightReadIn) : weightReadIn;

    //Reset value of input
    input.value = '';
    const newDateString = today.toLocaleDateString('en-GB');

    //Object has to be fully null to send to back end and be parsed by spring boot
    let newEntry = Object.create(null);
    newEntry.x = today.toISOString();
    newEntry.y = weightReadIn;
    //Add to modal table
    let hasBeenAdded = addEntryToTable(newEntry);

    if (hasBeenAdded) {
        currentWeight = newEntry.y;

        //Change weight to KG in object and save to DB. rounded as stored as int
        const formattedForDBEntry = {
            x: today.toISOString(),
            y: Math.round(newWeight)
        }
        saveEntry(formattedForDBEntry, "/customer/weight/save", "Weight");

        //Update customer object
        getCustData();

        //Get lowest and highest data points again in case of change
        getLowestAndHighestValues(chartData);

        //Get chart min and max values (depends on target as well as lowest and highest values)
        getMinMaxValues();

        updateChart(weightChart);
        weightMessage.innerHTML = getWeightMessage(targetWeight, weightReadIn);
        current.innerHTML = `${weightReadIn}${unitsString}`
    }
    showSubmittedContent(weightReadIn, hasBeenAdded);
}

function setWeightTarget(event) {
    event.preventDefault();

    //Get input by class
    const input = event.target.querySelector('#targetWeightData');

    //Convert to kg if user uses imperial units. data is stored in kg in db. Weight read in is used to update chart data etc as its in users choice of units
    const weightTargetReadIn = parseInt(input.value);
    const newWeightTarget = usesImperialUnits ? convertLbsToKG(weightTargetReadIn) : weightTargetReadIn;

    //Reset value of input
    input.value = '';
    const weightTargetObj = {
        weightTarget: newWeightTarget
    }
    targetWeight = weightTargetReadIn;
    target.innerHTML = `${targetWeight}${unitsString}`;

    //change min and max values for chart and update chart
    getMinMaxValues();

    //Update messages on page
    target.innerHTML = `${targetWeight}${unitsString}`;
    weightMessage.innerHTML = getWeightMessage(targetWeight, currentWeight);
    showSubmittedTargetContent(weightTargetReadIn);

    updateChart(weightChart);
}

//Modal elements and data listeners for data submission modal and target submission modal
const form = document.getElementById('weightForm');
form.addEventListener('submit', addWeight);
const targetForm = document.getElementById('targetWeightForm');
targetForm.addEventListener('submit', setWeightTarget);

//Modal elements for data submission modal and target submission modal
const defaultContent = document.getElementById('defaultContent');
const submittedContent = document.getElementById('submittedContent');

const defaultTargetContent = document.getElementById('defaultTargetContent');
const submittedTargetContent = document.getElementById('submittedTargetContent');

function showSubmittedContent(weight, hasBeenAdded) {
    defaultContent.style.display = 'none';
    let message = submittedContent.querySelector('#submittedMessage');
    message.textContent = hasBeenAdded ? `Weight of ${weight}${unitsString} submitted successfully!` : `You have already submitted a reading today, please try again tomorrow!`;
    submittedContent.style.display = 'block';

}

function revertDefault() {
    setTimeout(function () {
        submittedContent.style.display = 'none';
        defaultContent.style.display = 'block';
    }, 500);
}

function showSubmittedTargetContent(weightTarget) {
    defaultTargetContent.style.display = 'none';
    let message = submittedTargetContent.querySelector('#submittedTargetMessage');
    message.textContent = `Weight target of ${weightTarget}${unitsString} submitted successfully!`;
    submittedTargetContent.style.display = 'block';

}

function revertTargetDefault() {
    setTimeout(function () {
        submittedTargetContent.style.display = 'none';
        defaultTargetContent.style.display = 'block';
    }, 500);
}

function getMinMaxValues() {
    if (targetWeight <= lowestValueFromData) {
        currentMinValue = targetWeight;
    }
    else {
        currentMinValue = lowestValueFromData;
    }
    if (targetWeight >= highestValueFromData) {
        currentMaxValue = targetWeight;
    }
    else {
        currentMaxValue = highestValueFromData;
    }
}



