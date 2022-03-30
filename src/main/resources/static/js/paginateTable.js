//Source: https://stackoverflow.com/questions/25434813/simple-pagination-in-javascript, http://jsfiddle.net/Lzp0dw83/
//Modified by Sean Laughlin

let data;
let next;
let prev;
let pageNoSpan;
let table;

let current_page = 1;
let records_per_page;

function addKeyValueToTable(key, value) {
    if(data.hasOwnProperty(key)){
        return false;
    }
    data[key] = value;
    //Refreshes table entries
    changePage(1);
    return true;
}

function getKeyValuePair(arr1, arr2) {
    let newArray = {};

    arr1.forEach((element, index) => {
        newArray[element] = arr2[index];
    });
    return newArray;
}

function setupTable(dataIn, nextBtn, prevBtn, pageNoEl, tableEl, recordsPerPage) {
    data = dataIn;
    next = nextBtn;
    prev = prevBtn;
    pageNoSpan = pageNoEl;
    table = tableEl;
    records_per_page = recordsPerPage;
}

function getKeyValuePair(array1, array2) {
    let newArray = {};

    array1.forEach((element, index) => {
        newArray[element] = array2[index];
    });
    return newArray;
}


function prevPage() {
    if (current_page > 1) {
        current_page--;
        changePage(current_page);
    }
}

function nextPage() {
    if (current_page < numPages()) {
        current_page++;
        changePage(current_page);
    }
}

function changePage(page) {

    if (page < 1) page = 1;
    if (page > numPages()) page = numPages();

    table.innerHTML = "";

    let j = 0;
    for (var i = (page - 1) * records_per_page; i < (page * records_per_page); i++) {

        //Error occurs on last page if number of results is less than page size. Until solution is found, this try catch prevents issues
        try {
            let [key, value] = Object.entries(data)[i];
            let row = table.insertRow(j);
            let cell1 = row.insertCell(0);
            let cell2 = row.insertCell(1);
            cell1.innerHTML = key;
            cell2.innerHTML = value;
            j++;
        }
        catch (error) {

        }
    }
    let numberOfPages = numPages();
    pageNoSpan.innerHTML = `${page}/${numberOfPages}`;

    if (page == 1) {
        prev.style.visibility = "hidden";
    } else {
        prev.style.visibility = "visible";
    }

    if (page == numPages()) {
        btn_next.style.visibility = "hidden";
    } else {
        btn_next.style.visibility = "visible";
    }
}

function numPages() {
    return Math.ceil((Object.keys(data).length / records_per_page));
}

window.onload = function () {
    changePage(1);
};