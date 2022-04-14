//For page displaying grip chart and data
//Author: Sean Laughlin

//update and get customer object
getCustData();
let customer = JSON.parse(sessionStorage.getItem('customer'));

//Get elements to be used to set up chart and modal by chartSetup.js setUpChartAndModal
const chartEl = document.getElementById('chart');
const chartType = "GripStrength";
const modalTable = document.getElementById('modalData');
const modalNext = document.getElementById('btn_next');
const modalPrev = document.getElementById('btn_prev');
const modalPageNoSpan = document.getElementById('page');
//Boolean to indicate whether this is kilogram/pounds measured, so that imperial or metric units are applied based on user preference
const kgLbs = true;
let usesImperialUnits = customer.customerUnitsPreference == 'IMPERIAL';
let units = usesImperialUnits ? 'lbs' : 'KG';

//All forms that can be used to input the value on the page
let forms = new Array();
forms.push(document.getElementById('metricForm'));

setUpChartAndModal(chartEl, chartType, customer, modalTable, modalNext, modalPrev, modalPageNoSpan, kgLbs, units, forms);

//Modal elements for data submission modal and target submission modal
const defaultContent = document.getElementById('defaultContent');
const submittedContent = document.getElementById('submittedContent');

const defaultTargetContent = document.getElementById('defaultTargetContent');
const submittedTargetContent = document.getElementById('submittedTargetContent');

function showSubmittedContent(entryValue, hasBeenAdded) {
    defaultContent.style.display = 'none';
    let message = submittedContent.querySelector('#submittedMessage');
    message.textContent = hasBeenAdded ? `${chartType} of ${entryValue}${units} submitted successfully!` : `You have already submitted a reading today, please try again tomorrow!`;
    submittedContent.style.display = 'block';
}

//Show default modal content for data record/submission modal
function revertDefault() {
    setTimeout(function () {
        submittedContent.style.display = 'none';
        defaultContent.style.display = 'block';
    }, 500);
}

function showSubmittedTargetContent(target) {
    defaultTargetContent.style.display = 'none';
    let message = submittedTargetContent.querySelector('#submittedTargetMessage');
    message.textContent = `${chartType} target of ${target}${units} submitted successfully!`;
    submittedTargetContent.style.display = 'block';

}

//Show default modal content for target modal
function revertTargetDefault() {
    setTimeout(function () {
        submittedTargetContent.style.display = 'none';
        defaultTargetContent.style.display = 'block';
    }, 500);
}