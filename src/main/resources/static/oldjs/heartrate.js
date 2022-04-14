//update and get customer object
getCustData();
let customer = JSON.parse(sessionStorage.getItem('customer'));

const userAge = yearsBeforeToday(new Date(customer.dateOfBirth));
const maxHeartRate = 220 - userAge;

//Min and max values from data, used to render chart to display a practical scale
let lowestValueFromData = 1000;
let highestValueFromData = 0;

let currentMinValue = 0;
let currentMaxValue = 0;

const chartData = getChartDataFromCustomer(customer, "heartRate");

//getChartDataFromCustomer assigns values to lowest and highest value from data variables
currentMinValue = lowestValueFromData;
currentMaxValue = highestValueFromData;

let daysDisplayedOnChart = 7;

const maxRateMessage = document.getElementById('maxheartrate');
const heartRateMessage = document.getElementById('heartratemessage');

if (chartData.length == 0) {
    maxRateMessage.innerHTML = `No data available`;
    heartRateMessage.innerHTML = `No data available`;
}
else {
    maxRateMessage.innerHTML = `${maxHeartRate}BPM`;
    heartRateMessage.innerHTML = getMessage(chartData[chartData.length - 1].y);
}




//Get page elements and data and send to setUpTable in paginateTable.js
const hrModalTable = document.getElementById('hrModalData');
const nextIn = document.getElementById('btn_next');
const prevIn = document.getElementById('btn_prev');
const pageNoSpanIn = document.getElementById('page');

//Set up modal data table with elements and to display 10 results each page
setupTable(chartData, nextIn, prevIn, pageNoSpanIn, hrModalTable, 10);

function getMessage(currentRate) {
    if (currentRate >= 60 && currentRate <= 100)
        return `Your heart rate of <b>${currentRate}BPM</b> is within a normal range`
    else {
        return `Your heart rate of <b>${currentRate}BPM</b> is outside of the normal range`
    }
}

let heartChart = new Chart(
    document.getElementById('heartchart'),
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

function addHeartRate(event) {
    event.preventDefault();

    //Get input by class
    const input = event.target.querySelector('.data');
    const newHeartRate = parseInt(input.value);

    //Reset value
    input.value = '';
    const newDateString = today.toLocaleDateString('en-GB');

    //Object has to be fully null to send to back end and be parsed by spring boot
    let newEntry = Object.create(null);
    newEntry.x = today.toISOString();
    newEntry.y = newHeartRate;

    //Save to db
    let hasBeenAdded = addEntryToTable(newEntry);

    if (hasBeenAdded) {
        //Save to DB
        saveEntry(newEntry, "/customer/heart_rate/save", "HeartRate");

        //Update customer object
        getCustData()
        //Get lowest and highest data points again in case of change
        getLowestAndHighestValues(chartData);
        currentMinValue = lowestValueFromData;
        currentMaxValue = highestValueFromData;

        updateChart(heartChart);
        heartRateMessage.innerHTML = getMessage(newHeartRate);
    }
    showSubmittedContent(newHeartRate, hasBeenAdded);
}

let defaultContent = document.getElementById('defaultContent');
let preRecordContent = document.getElementById('preRecordInstructions');
let manualPulseContent = document.getElementById('manualPulseForm');
let recordingContent = document.getElementById('recordingContent');
let recordedContent = document.getElementById('recordedContent');
let submittedContent = document.getElementById('submittedContent');

//Display functions to change visible content of recording new entry modal
function showManualPulseForm() {

    defaultContent.style.display = "none";
    manualPulseContent.style.display = "block";

    //Add event listener to form to allow data to be submitted
    const form = document.getElementById('heartRateForm');
    form.addEventListener('submit', addHeartRate);
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

function showRecordedContent(heartRate) {
    recordingContent.style.display = "none";
    recordedContent.style.display = "block";

    //Reset countButton text incase user selects retry
    countButton.firstChild.textContent = "Record";
    //Display messages relating to results
    recordedContent.querySelector('#rcHeader').textContent = `Your Heart Rate is ${heartRate} Beats Per Minute`;
    //Contains HTML tags, so innerHTML is used over textContent
    recordedContent.querySelector('#rcMessage').innerHTML = getMessage(heartRate);
    //Set hidden input value with heart rate so it can be found by addHeartRate on submit
    recordedContent.querySelector('#heartRateValue').value = heartRate;

    const form = recordedContent.querySelector('#heartRateRecordedForm')
    form.addEventListener('submit', addHeartRate);
}

function showSubmittedContent(heartRate, hasBeenAdded) {

    //Either could be displayed, so both set to display none
    recordedContent.style.display = "none";
    manualPulseContent.style.display = "none";

    let message = submittedContent.querySelector('#submittedMessage');
    message.textContent = hasBeenAdded ? `Heart rate of ${heartRate}BPM submitted successfully!` : `You have already submitted a reading today, please try again tomorrow!`;
    submittedContent.style.display = "block";
}

let countDown = null;

//Handles displaying countdown and recording of pulse
function beginRecording() {
    let seconds = 30;
    let count = 0;
    let heartRate = 0;

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

            //When counter expires, display heart rate and options to submit or retry
            if (seconds <= 0) {
                clearInterval(countDown);
                //Minus
                heartRate = count * 2;
                message = getMessage(heartRate);

                showRecordedContent(heartRate);
            }
        }, 1000); //1 second delay
    }
}

//Resets heart rate record modal to default content, waits 500ms so user doesn't see update while modal is closing
function revertDefault() {
    setTimeout(function () {

        //Any may be displayed, so all non default content divs are set to display none
        preRecordContent.style.display = "none";
        recordingContent.style.display = "none";
        recordedContent.style.display = "none";
        manualPulseContent.style.display = "none";
        submittedContent.style.display = "none";
        defaultContent.style.display = "block";

        //Stops countdown function if modal is closed during recording
        clearInterval(countDown);

        countButton.firstChild.textContent = "Record";

    }, 500);
}