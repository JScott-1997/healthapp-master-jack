//For page displaying heartrate chart and data.
//Author: Sean Laughlin

//update and get customer object
getCustData();
let customer = JSON.parse(sessionStorage.getItem('customer'));

//Get and display users max heart rate (220 - age)
const customerAge = calculate_age(new Date(customer.dateOfBirth));;
const maxHeartRate = 220 - customerAge;
document.getElementById('maxheartrate').innerHTML = maxHeartRate + 'BPM';

//Get elements to be used to set up chart and modal by chartSetup.js setUpChartAndModal
const chartEl = document.getElementById('chart');
const chartType = "HeartRate";
const modalTable = document.getElementById('modalData');
const modalNext = document.getElementById('btn_next');
const modalPrev = document.getElementById('btn_prev');
const modalPageNoSpan = document.getElementById('page');

//All forms that can be used to input the value on the page
const forms = new Array();
forms.push(document.getElementById('heartRateRecordedForm'));
forms.push(document.getElementById('metricForm'));

//Includes boolean KgLbs set to false indicating chart does not use kg/lbs and uses own units. Units string is passed too, "BPM"
setUpChartAndModal(chartEl, chartType, customer, modalTable, modalNext, modalPrev, modalPageNoSpan, false, "BPM", forms);

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
}

function showSubmittedContent(heartRate, hasBeenAdded) {

    //Either could be displayed, so both set to display none
    recordedContent.style.display = "none";
    manualPulseContent.style.display = "none";

    let message = submittedContent.querySelector('#submittedMessage');
    message.textContent = hasBeenAdded ? `Heart rate of ${heartRate}BPM submitted successfully!` : `You have already submitted a reading today, please try again tomorrow!`;
    submittedContent.style.display = "block";
}
function getMessage(currentRate) {
    if (currentRate >= 60 && currentRate <= 100)
        return `Your heart rate of <b>${currentRate}BPM</b> is within a normal range`
    else {
        return `Your heart rate of <b>${currentRate}BPM</b> is outside of the normal range`
    }
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
