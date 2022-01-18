let menu = document.querySelector('#menu-btn');
let navbar = document.querySelector('.navbar');

menu.onclick = () =>{
    menu.classList.toggle('fa-times');
    navbar.classList.toggle('active');
}

window.onscroll = () =>{
    menu.classList.remove('fa-times');
    navbar.classList.remove('active');
}


// Get the modal
var modalL = document.getElementById('id01');
var modalR = document.getElementById('id02');
// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modalL) {
        modalL.style.display = "none";
    }
    else if (event.target == modalR) {
        modalR.style.display = "none";
    }
}

function reg(){
    modalR.style.display='block';
    modalL.style.display='none';
}
function log(){
    modalR.style.display='none';
    modalL.style.display='block';
}