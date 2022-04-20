const unitsPrefSelect = document.getElementById('UnitsPref');
unitsPrefSelect.addEventListener('change', saveUnits);

const dataDeleteForm = document.getElementById('dataDeleteForm');

function getSubmitPath(id){
    dataDeleteForm.action = `/customer/${id}/delete`;
}