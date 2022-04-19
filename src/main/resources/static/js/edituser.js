const dataDeleteForm = document.getElementById('dataDeleteForm');

function getSubmitPath(id){
    dataDeleteForm.action = `/admin/customer/${id}/delete`;
}