//Current date
const today = new Date(Date.now());
today.setHours(0, 0, 0, 0);

//Takes a Date object and returns date minus time as UK style String
function getDateAsString(date) {
    return date.toLocaleString('en-GB').split(",")[0];
}

//Same as above but takes array of Dates, returns array of Strings
function getDateStrings(dates){
    let formattedDateStrings = new Array();
    dates.forEach(date => {
        formattedDateStrings.push(date.toLocaleDateString('en-GB').split(',')[0]);
    });
    return formattedDateStrings;
}

//Takes number of days before today and returns array with those Date objs plus todays
function getDatesBeforeIncToday(number){
    const datesBefore = new Array();
    for(let i = number-1; i>0; i--){
        const dateBefore = new Date();
        dateBefore.setHours(0,0,0,0);
        dateBefore.setDate(today.getDate()-i)
        datesBefore.push(dateBefore);
    }
    datesBefore.push(today);
    return datesBefore;
}

//Check if two Date objects have the same date
function checkDateEquality(date1, date2){

    //Time is not being checked, so is all set to 0
    date1.setHours(0, 0, 0, 0);
    date2.setHours(0, 0, 0, 0);
    if(date1.getTime()==date2.getTime())
        return true
    else
        return false;
}

function yearsBeforeToday(date) {
  let difference =(today.getTime() - date.getTime()) / 1000;
   difference /= (60 * 60 * 24);
  return Math.abs(Math.round(difference/365.25));
 }

//sorting function for dates
 function compare(date1, date2) {
   if ( date1.dateOfEntry < date2.dateOfEntry ){
     return -1;
   }
   if ( date1.dateOfEntry > date2.dateOfEntry ){
     return 1;
   }
   return 0;
 }

 function convertKGToLbs(value){
    return Math.round(value * 2.2046);
 }

  function convertLbsToKG(value){
     return Math.round(value / 2.2046);
  }

//From https://www.w3resource.com/javascript-exercises/javascript-date-exercise-18.php
function calculate_age(dob) {
    var diff_ms = Date.now() - dob.getTime();
    var age_dt = new Date(diff_ms);

    return Math.abs(age_dt.getUTCFullYear() - 1970);
}

