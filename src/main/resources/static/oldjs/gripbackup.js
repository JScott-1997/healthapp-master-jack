//update and get customer object
getCustData();
let customer = JSON.parse(sessionStorage.getItem('customer'));

let usesImperialUnits = customer.customerUnitsPreference == 'IMPERIAL';
let unitsString = usesImperialUnits ? 'lbs' : 'KG';
const unitSpans = document.getElementsByClassName('unit');

//Set the units to display in areas of page where required
Array.from(unitSpans).forEach(unit => unit.innerHTML = unitsString);

let targetGrip;

//Min and max values user has submitted, used to render chart to display a practical scale
let lowestValueFromData = 1000;
let highestValueFromData = 0;
let currentMinValue = 0;
let currentMaxValue = 0;

let chartData = getChartDataFromCustomer(customer, "gripStrength");

//Convert data and chart min/max to pounds if user has imperial units preference
if (usesImperialUnits) {
    chartData.forEach(entry => {
        entry.y = convertKGToLbs(entry.y);
    })
    lowestValueFromData = Math.round((lowestValueFromData * 2.2046))
    highestValueFromData = Math.round((highestValueFromData * 2.2046))
    targetGrip = Math.round((targetGrip * 2.2046))
}

//Change min max based on target set
getMinMaxValues();

let daysDisplayedOnChart = 7;

let currentGrip = 0;

//Setting messages for grip section
let target = document.getElementById('targetGrip');
let current = document.getElementById('currentGrip');
let gripMessage = document.getElementById('gripMessage');

if (!chartData.length == 0) {
    currentGrip = chartData[chartData.length - 1].y
    current.innerHTML = `${currentGrip}${unitsString}`;
    gripMessage.innerHTML = getGripMessage(targetGrip, currentGrip);
}
else {
    current.innerHTML = `No data.`;
    gripMessage.innerHTML = `-`;
}
if(targetGrip == null){
        target.innerHTML = `No target set.`;
}
else{
    target.innerHTML = `${targetGrip}${unitsString}`;
}

const gripModalTable = document.getElementById('gripModalData');
const nextIn = document.getElementById('btn_next');
const prevIn = document.getElementById('btn_prev');
const pageNoSpanIn = document.getElementById('page');

setupTable(chartData, nextIn, prevIn, pageNoSpanIn, gripModalTable, 10);

function getGripMessage(targetGrip, currentGrip) {
    const gripDifference = Math.abs(Math.round(targetGrip - currentGrip));
    if (targetGrip > currentGrip) {
        return `You are <b>${gripDifference}${unitsString}</b> below your target of <b>${targetGrip}${unitsString}</b>`
    }
    else if (targetGrip < currentGrip) {
        return `You are <b>${gripDifference}${unitsString}</b> above your target of <b>${targetGrip}${unitsString}</b>`
    }
    else {
        return `Well done, you're on target!`
    }
}

//Chart.js charts settings and config
let gripChart = new Chart(
    document.getElementById('gripchart'),
    {
        type: 'line',
        //Plugin to draw grip target line on chart
        plugins: [{
            afterDraw: chart => {
                const ctx = chart.ctx;
                ctx.save();
                const xAxis = chart.scales['x'];
                const yAxis = chart.scales['y'];
                let y = yAxis.getPixelForValue(targetGrip);
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

function addGrip(event) {
    event.preventDefault();

    //Get input by class
    const input = event.target.querySelector('#grip');

    //Convert to kg if user uses imperial units. data is stored in kg in db. Grip read in is used to update chart data etc as its in users choice of units
    const gripReadIn = parseInt(input.value);
    const newGrip = usesImperialUnits ? convertLbsToKG(gripReadIn) : gripReadIn;

    //Reset value of input
    input.value = '';
    const newDateString = today.toLocaleDateString('en-GB');

    //Object has to be fully null to send to back end and be parsed by spring boot
    let newEntry = Object.create(null);
    newEntry.x = today.toISOString();
    newEntry.y = gripReadIn;
    //Add to modal table
    let hasBeenAdded = addEntryToTable(newEntry);

    if (hasBeenAdded) {
        currentGrip = newEntry.y;

        //Change grip to KG in object and save to DB. rounded as stored as int
        const formattedForDBEntry = {
            x: today.toISOString(),
            y: Math.round(newGrip)
        }
        saveEntry(formattedForDBEntry, "/customer/grip_strength/save", "GripStrength");

        //Update customer object
        getCustData();

        //Get lowest and highest data points again in case of change
        getLowestAndHighestValues(chartData);

        //Get chart min and max values (depends on target as well as lowest and highest values)
        getMinMaxValues();

        updateChart(gripChart);
        gripMessage.innerHTML = getGripMessage(targetGrip, gripReadIn);
        current.innerHTML = `${gripReadIn}${unitsString}`
    }
    showSubmittedContent(gripReadIn, hasBeenAdded);
}

function setGripTarget(event) {
    event.preventDefault();

    //Get input by class
    const input = event.target.querySelector('#targetGripData');

    //Convert to kg if user uses imperial units. data is stored in kg in db. Grip read in is used to update chart data etc as its in users choice of units
    const gripTargetReadIn = parseInt(input.value);
    const newGripTarget = usesImperialUnits ? convertLbsToKG(gripTargetReadIn) : gripTargetReadIn;

    //Reset value of input
    input.value = '';
    const gripTargetObj = {
        gripTarget: newGripTarget
    }
    targetGrip = gripTargetReadIn;
    target.innerHTML = `${targetGrip}${unitsString}`;

    //change min and max values for chart and update chart
    getMinMaxValues();

    //Update messages on page
    target.innerHTML = `${targetGrip}${unitsString}`;
    gripMessage.innerHTML = getGripMessage(targetGrip, currentGrip);
    showSubmittedTargetContent(gripTargetReadIn);

    updateChart(gripChart);
}

//Modal elements and data listeners for data submission modal and target submission modal
const form = document.getElementById('gripForm');
form.addEventListener('submit', addGrip);
const targetForm = document.getElementById('targetGripForm');
targetForm.addEventListener('submit', setGripTarget);

//Modal elements for data submission modal and target submission modal
const defaultContent = document.getElementById('defaultContent');
const submittedContent = document.getElementById('submittedContent');

const defaultTargetContent = document.getElementById('defaultTargetContent');
const submittedTargetContent = document.getElementById('submittedTargetContent');

function showSubmittedContent(grip, hasBeenAdded) {
    defaultContent.style.display = 'none';
    let message = submittedContent.querySelector('#submittedMessage');
    message.textContent = hasBeenAdded ? `Grip of ${grip}${unitsString} submitted successfully!` : `You have already submitted a reading today, please try again tomorrow!`;
    submittedContent.style.display = 'block';

}

function revertDefault() {
    setTimeout(function () {
        submittedContent.style.display = 'none';
        defaultContent.style.display = 'block';
    }, 500);
}

function showSubmittedTargetContent(gripTarget) {
    defaultTargetContent.style.display = 'none';
    let message = submittedTargetContent.querySelector('#submittedTargetMessage');
    message.textContent = `Grip target of ${gripTarget}${unitsString} submitted successfully!`;
    submittedTargetContent.style.display = 'block';

}

function revertTargetDefault() {
    setTimeout(function () {
        submittedTargetContent.style.display = 'none';
        defaultTargetContent.style.display = 'block';
    }, 500);
}

function getMinMaxValues() {
    if (targetGrip <= lowestValueFromData) {
        currentMinValue = targetGrip;
    }
    else {
        currentMinValue = lowestValueFromData;
    }
    if (targetGrip >= highestValueFromData) {
        currentMaxValue = targetGrip;
    }
    else {
        currentMaxValue = highestValueFromData;
    }
}



