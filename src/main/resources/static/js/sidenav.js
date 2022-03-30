const sideNav = document.getElementById('sideNav');
const burger = document.getElementById('burger');

function openSideNav() {
    burger.setAttribute('onclick', 'closeSideNav()')
    sideNav.style.visibility = 'visible';
    burger.textContent = "X";
}

function closeSideNav() {
    burger.setAttribute('onclick', 'openSideNav()')
    sideNav.style.visibility = 'hidden'
    burger.textContent = "☰";
}