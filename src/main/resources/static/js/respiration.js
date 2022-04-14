//For page displaying respirationrate chart and data.
//Author: Sean Laughlin

//update and get customer object
getCustData();
let customer = JSON.parse(sessionStorage.getItem('customer'));

//Get elements to be used to set up chart and modal by chartSetup.js setUpChartAndModal
const chartEl = document.getElementById('chart');
const chartType = "RespirationRate";
const modalTable = document.getElementById('modalData');
const modalNext = document.getElementById('btn_next');
const modalPrev = document.getElementById('btn_prev');
const modalPageNoSpan = document.getElementById('page');

//All forms that can be used to input the value on the page
const forms = new Array();
forms.push(document.getElementById('respirationRateRecordedForm'));
forms.push(document.getElementById('metricForm'));
//Includes boolean KgLbs set to false indicating chart does not use kg/lbs and uses own units. Units string is passed too, "BPM"
setUpChartAndModal(chartEl, chartType, customer, modalTable, modalNext, modalPrev, modalPageNoSpan, false, "Breaths P/M", forms);

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
    recordedContent.querySelector('#rcHeader').textContent = `Your Respiration Rate is ${respirationRate} Breaths Per Minute`;
    //Contains HTML tags, so innerHTML is used over textContent
    recordedContent.querySelector('#rcMessage').innerHTML = getMessage(respirationRate);
    //Set hidden input value with respiration rate so it can be found by addHeartRate on submit
    recordedContent.querySelector('#respirationRateValue').value = respirationRate;

    const form = recordedContent.querySelector('#respirationRateRecordedForm')
}

function showSubmittedContent(respirationRate, hasBeenAdded) {

    //Either could be displayed, so both set to display none
    recordedContent.style.display = "none";
    manualRespirationContent.style.display = "none";

    let message = submittedContent.querySelector('#submittedMessage');
    message.textContent = hasBeenAdded ? `Respiration of ${respirationRate}BPM submitted successfully!` : `You have already submitted a reading today, please try again tomorrow!`;
    submittedContent.style.display = "block";
}
function getMessage(currentRate) {
    if (currentRate >= 12 && currentRate <= 25)
        return `Your respiration rate of <b>${currentRate} Breaths P/M</b> is within a normal range`
    else {
        return `Your respiration rate of <b>${currentRate} Breaths P/M</b> is outside of the normal range`
    }
}


let countDown = null;

//Handles displaying countdown and recording of Respiration
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
