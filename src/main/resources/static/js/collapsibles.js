//From https://www.w3schools.com/howto/howto_js_collapsible.asp
//Edited by Sean Laughlin

let coll = document.getElementsByClassName("collapsible");
console.log(coll)
for (let i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    const content = this.nextElementSibling;
    if (content.style.maxHeight){
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
}