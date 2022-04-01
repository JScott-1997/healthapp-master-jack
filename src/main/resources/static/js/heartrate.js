let customer = JSON.parse(sessionStorage.getItem('customer'));
const userAge = yearsBeforeToday(new Date(customer.dateOfBirth));
const maxHeartRate = 220 - userAge;

let heartRates = getHeartRates(customer.heartRateEntries);
let dates = getEntryDates(customer.heartRateEntries);
let chartLabels = getChartDates(dates);

const entryObjects = getEntryObjectsFromCustomer(customer);

function getEntryObjectsFromCustomer(customer){
    const heartRateEntries = customer.heartRateEntries;
    const entriesArr = new Array();
    heartRateEntries.forEach(entry =>{
        entriesArr.push(entry);
    })
    //Sort objects
    entriesArr.sort(compare);
    return entriesArr;
}

function getHeartRates(entries){
    const rates = new Array();
    entries.forEach(entry =>{
        rates.push(entry.entryHeartRate);
    })
    return rates;
}

function getEntryDates(entries){
    const dates = new Array();
    entries.forEach(entry =>{
        dates.push(new Date(entry.dateOfEntry));
    })
    return dates;
}

function getChartDates(dates){
    dates.forEach(date =>{

    })
}

//Default amount of data points on chart
let noOfPoints = 7;
let chartHRates = heartRates.slice(-noOfPoints);
let chartDates = dates.slice(-noOfPoints);

//Get page elements and data and send to setUpTable in paginateTable.js
const hrModalTable = document.getElementById('hrModalData');
let nextIn = document.getElementById('btn_next');
let prevIn = document.getElementById('btn_prev');
let pageNoSpanIn = document.getElementById('page');

//returns array of entries objects
let heartModalData = parseEntriesObjectArray(dates, heartRates);

//Set up modal data table with elements and to display 10 results each page
setupTable(heartModalData, nextIn, prevIn, pageNoSpanIn, hrModalTable, 10);


//Gets current date minus time as String
function getCurrentDate() {
    const date = new Date(Date.now()).toLocaleString();
    const dateSplit = date.split(",");
    const dateOnly = dateSplit[0].split("/");

    //Returns only day and month without year
    return dateOnly[0] + "/" + dateOnly[1];
}

const dateOnly = getCurrentDate();

//Setting messages for heart rate section
const maxRateMessage = document.getElementById('maxheartrate');
maxRateMessage.innerHTML = `${maxHeartRate}BPM`;

const heartRateMessage = document.getElementById('heartratemessage');
let currentRate = heartRates[heartRates.length - 1];

function getMessage(currentRate) {
    if (currentRate >= 60 && currentRate <= 100)
        return `Your heart rate of <b>${currentRate}BPM</b> is within a normal range`
    else {
        return `Your heart rate of <b>${currentRate}BPM</b> is outside of the normal range`
    }
}

heartRateMessage.innerHTML = getMessage(currentRate);

//Chart.js chart settings
let heartChart = new Chart(
    document.getElementById('heartchart'),
    {
        type: 'line',
        data: {
            labels: chartDates,
            datasets: [{
                fill: false,
                backgroundColor: 'rgb(47, 168, 58)',
                borderColor: 'rgb(47, 168, 58)',
                data: chartHRates,
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

//Update chart when new data is submitted without reloading page
function updateChart(chart, data, labels) {

    //Refresh data
    chart.data.datasets[0].data = data.slice(-noOfPoints);
    chart.data.labels = labels.slice(-noOfPoints);
    chart.update();
}

//Sets the number of data points to be displayed
function setChartPoints(points){
   noOfPoints = points;
   updateChart(heartChart, heartRates, dates);
}

//Adds new heart rate to array and updates page, modal content
function addHeartRate(event) {

    event.preventDefault();

    //Get input by class
    const input = event.target.querySelector('.data');
    const newHeartRate = parseInt(input.value);

    //Reset value
    input.value = '';

    heartRates.push(newHeartRate);
    dates.push(dateOnly);

    //Update chart and table in view data modal
    let hasBeenAdded = addKeyValueToTable(dateOnly, newHeartRate); //this function is inside paginateTable.js
   if(hasBeenAdded){
        updateChart(heartChart, heartRates, dates);
        currentRate = newHeartRate;
        heartRateMessage.innerHTML = getMessage(currentRate);
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