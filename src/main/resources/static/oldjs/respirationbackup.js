//update and get customer object
getCustData();
let customer = JSON.parse(sessionStorage.getItem('customer'));

const userAge = yearsBeforeToday(new Date(customer.dateOfBirth));

//Min and max values from data, used to render chart to display a practical scale
let lowestValueFromData = 1000;
let highestValueFromData = 0;

let currentMinValue = 0;
let currentMaxValue = 0;

const chartData = getChartDataFromCustomer(customer, "respirationRate");

//getChartDataFromCustomer assigns values to lowest and highest value from data variables
currentMinValue = lowestValueFromData;
currentMaxValue = highestValueFromData;

let daysDisplayedOnChart = 7;

const respirationRateMessage = document.getElementById('respirationmessage');

if (chartData.length == 0) {
    respirationRateMessage.innerHTML = `No data available`;
}
else {
    respirationRateMessage.innerHTML = getMessage(chartData[chartData.length - 1].y);
}

//Get page elements and data and send to setUpTable in paginateTable.js
const respirationModalTable = document.getElementById('respirationModalData');
const nextIn = document.getElementById('btn_next');
const prevIn = document.getElementById('btn_prev');
const pageNoSpanIn = document.getElementById('page');

//Set up modal data table with elements and to display 10 results each page
setupTable(chartData, nextIn, prevIn, pageNoSpanIn, respirationModalTable, 10);

function getMessage(currentRate) {
    if (currentRate >= 12 && currentRate <= 25)
        return `Your respiration rate of <b>${currentRate} Breaths Per Minute</b> is within a normal range`
    else {
        return `Your respiration rate of <b>${currentRate} Breaths Per Minute</b> is outside of the normal range`
    }
}

let respirationChart = new Chart(
    document.getElementById('respirationchart'),
    {
        type: 'line',
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
                    max: new Date(today).toISOString(),
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
                }
            }
        }
    }
);

function addRespirationRate(event) {
    event.preventDefault();

    //Get input by class
    const input = event.target.querySelector('.data');
    const newRespirationRate = parseInt(input.value);

    //Reset value
    input.value = '';
    const newDateString = today.toLocaleDateString('en-GB');

    //Object has to be fully null to send to back end and be parsed by spring boot
    let newEntry = Object.create(null);
    newEntry.x = today.toISOString();
    newEntry.y = newRespirationRate;

    //Save to db
    let hasBeenAdded = addEntryToTable(newEntry);

    if (hasBeenAdded) {
        //Save to DB
        saveEntry(newEntry, "/customer/respiration_rate/save", "RespirationRate");

        //Update customer object
        getCustData()
        //Get lowest and highest data points again in case of change
        getLowestAndHighestValues(chartData);
        currentMinValue = lowestValueFromData;
        currentMaxValue = highestValueFromData;

        updateChart(respirationChart);
        respirationRateMessage.innerHTML = getMessage(newRespirationRate);
    }
    showSubmittedContent(newRespirationRate, hasBeenAdded);
}

let defaultContent = document.getElementById('defaultContent');
let preRecordContent = document.getElementById('preRecordInstructions');
let manualRespirationContent = document.getElementById('manualRespirationForm');
let recordingContent = document.getElementById('recordingContent');
let recordedContent = document.getElementById('recordedContent');
let submittedContent = document.getElementById('submittedContent');

//Display functions to change visible content of recording new entry modal
function showManualRespirationForm() {

    defaultContent.style.display = "none";
    manualRespirationContent.style.display = "block";

    //Add event listener to form to allow data to be submitted
    const form = document.getElementById('respirationForm');
    form.addEventListener('submit', addRespirationRate);
}

function showPreRecordInstructions() {
    defaultContent.style.display = "none";
    preRecordContent.style.display = "block";
}

function showRecordingContent() {

    //Either div may be displayed so both set to display none
    recordedContent.style.display = "none";
    preRecordContent.style.display = "none";

    recordingContent.style.display = "block";
}

function showRecordedContent(respirationRate) {
    recordingContent.style.display = "none";
    recordedContent.style.display = "block";

    //Reset countButton text incase user selects retry
    countButton.firstChild.textContent = "Record";
    //Display messages relating to results
    recordedContent.querySelector('#rcHeader').textContent = `Your respiration Rate is ${respirationRate} Beats Per Minute`;
    //Contains HTML tags, so innerHTML is used over textContent
    recordedContent.querySelector('#rcMessage').innerHTML = getMessage(respirationRate);
    //Set hidden input value with respiration rate so it can be found by addrespirationRate on submit
    recordedContent.querySelector('#respirationValue').value = respirationRate;
    console.log(respirationRate);
    const form = recordedContent.querySelector('#respirationRecordedForm')
    form.addEventListener('submit', addRespirationRate);
}

function showSubmittedContent(respirationRate, hasBeenAdded) {

    //Either could be displayed, so both set to display none
    recordedContent.style.display = "none";
    manualRespirationContent.style.display = "none";

    let message = submittedContent.querySelector('#submittedMessage');
    message.textContent = hasBeenAdded ? `Respiration rate of ${respirationRate} Breaths Per Minute submitted successfully!` : `You have already submitted a reading today, please try again tomorrow!`;
    submittedContent.style.display = "block";
}

let countDown = null;

//Handles displaying countdown and recording of respiration
function beginRecording() {
    let seconds = 30;
    let count = 0;
    let respirationRate = 0;

    showRecordingContent();

    let countButton = document.getElementById('countButton');
    let secondsCounter = document.getElementById('secondsCounter');

    //Begin counting when user presses button or spacebar first time, change button text to tap
    document.addEventListener('keyup', beginCounting);
    countButton.addEventListener('click', beginCounting);

    secondsCounter.innerHTML = seconds;

    //Countdown function, updates modal content to show countdown. Nested as only used during recording
    function beginCounting() {

        countButton.firstChild.textContent = "Tap";
        //Remove event listeners that call this function on space or button press
        document.removeEventListener('keyup', beginCounting);
        countButton.removeEventListener('click', beginCounting);

        //Event listeners on displayed button and spacebar (mobile/tablet and pc options)
        document.addEventListener('keyup', function (event) {
            if (event.code === 'Space') {
                //Aesthetic function to flash button red briefly
                countButton.classList.add('buttonFlash');
                setTimeout(function () {
                    countButton.classList.remove('buttonFlash');
                }, 500);
                count++;
            }
        });

        //Aesthetic function to flash button red briefly
        countButton.addEventListener('click', function () {
            countButton.classList.add('buttonFlash');
            setTimeout(function () {
                countButton.classList.remove('buttonFlash');
            }, 250);
            count++;
        });

        countDown = setInterval(function () {
            seconds--;
            secondsCounter.innerHTML = seconds;

            //When counter expires, display respiration rate and options to submit or retry
            if (seconds <= 0) {
                clearInterval(countDown);
                //Minus
                respirationRate = count * 2;
                message = getMessage(respirationRate);

                showRecordedContent(respirationRate);
            }
        }, 1000); //1 second delay
    }
}

//Resets respiration rate record modal to default content, waits 500ms so user doesn't see update while modal is closing
function revertDefault() {
    setTimeout(function () {

        //Any may be displayed, so all non default content divs are set to display none
        preRecordContent.style.display = "none";
        recordingContent.style.display = "none";
        recordedContent.style.display = "none";
        manualRespirationContent.style.display = "none";
        submittedContent.style.display = "none";
        defaultContent.style.display = "block";

        //Stops countdown function if modal is closed during recording
        clearInterval(countDown);

        countButton.firstChild.textContent = "Record";

    }, 500);
}