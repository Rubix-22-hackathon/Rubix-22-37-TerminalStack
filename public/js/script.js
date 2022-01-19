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
// var modalDR = document.getElementById('id03');
// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modalL) {
        modalL.style.display = "none";
    }
    else if (event.target == modalR) {
        modalR.style.display = "none";
    }
    // else if (event.target == modalDR) {
    //     // modalDR.style.display = "none";
    // }
}

function reg(){
    modalR.style.display='block';
    modalL.style.display='none';
    // modalDR.style.display='none';
}
function regDr(){
    modalR.style.display='none';
    modalL.style.display='none';
    // modalDR.style.display='block';
}
function log(){
    modalR.style.display='none';
    modalL.style.display='block';
    // modalDR.style.display='none';
}
var drdetails = document.getElementsByClassName("drdetails");

// drdetails[1].style.display = "none";
function check(n){
    if (n.checked)
    {
        for(var i=0 ;i<drdetails.length;i++)
        {
            drdetails[i].style.display="inline-block";
        }
    }
    
    else if (!n.checked)
    {
        
        for(var i=0 ;i<drdetails.length;i++)
        {
            console.log(i + "done");
            drdetails[i].style.display="none";
        }
    }
}



// DR list hover
for(let i=1; ; i++){
    let cardID = document.getElementById(`card-${i}`);
    if(cardID == null)
    break;
    $(`#card-${i}`).hover(function(){
        if($(this).hasClass("active")){
            $(`#card-${i} .button`).slideUp(function(){
                $(`#card-${i}`).removeClass("active");
            })
        }
        else{
            $(`#card-${i}`).addClass("active");
            $(`#card-${i} .button`).stop().slideDown();
        }
    })
}


// Search Medicine
let search = document.getElementById("myInput");
search.addEventListener("input", function(){
    let inputVal = search.value;    
    let noteCards = document.getElementsByClassName('MedDataJson');
    Array.from(noteCards).forEach(function(element){
        let cardText = element.getElementsByTagName("td")[2].innerHTML;
        if(cardText.includes(inputVal)){
            element.style.display = "block";
        }
        else{
            element.style.display = "none";
        }
    })
})

