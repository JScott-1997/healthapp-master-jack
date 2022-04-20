/*
Sends data from units preference selector on customer/settings.html to custdata.js saveUnits method
Also creates path for delete form and applies it to form element based on the delete option that the user selected
*/

const unitsPrefSelect = document.getElementById('UnitsPref');
unitsPrefSelect.addEventListener('change', saveUnits);

const dataDeleteForm = document.getElementById('dataDeleteForm');

function getSubmitPath(id){
    dataDeleteForm.action = `/customer/${id}/delete`;
}