
const register = document.querySelector('#register');
const message = document.querySelector('#message');
const checking = document.getElementById("checking");
console.log(register);

register.addEventListener('submit', (e) => {
    if (checking.checked != true) {
        registerUser(e)
    } else {
        registerDr(e);
    }
})

function registerUser(e) {
    e.preventDefault();
    const name = document.getElementsByName("name-reg")[0].value;
    const email = document.getElementsByName("email-reg")[0].value;
    const password = document.getElementsByName("password-reg")[0].value;
    console.log(name + email + password);
    let cont = {
        name,
        email,
        password
    }
    message.innerText = "On progres......";
    $.post("/register", cont,
        function (data, status) {
            // console.log(data);
            message.innerText = data.msg;
            return false;
        });
}
function registerDr(e) {
    e.preventDefault();
    const name = document.getElementsByName("name-reg")[0].value;
    const email = document.getElementsByName("email-reg")[0].value;
    const password = document.getElementsByName("password-reg")[0].value;
    const qualification = document.getElementsByName("qualification")[0].value;
    const experience = document.getElementsByName("experience")[0].value;
    const address = document.getElementsByName("address")[0].value;
    // alert("1");
    // const file = document.getElementsByName("file")[0].value;
    // alert("2");
    console.log(name + email + password);
    let cont = {
        name,
        email,
        password,
        qualification,
        experience,
        address,
        // file : 'NA'
    }
    // alert("3");
    message.innerText = "On progres......";
    $.post("/drregister", cont,
        function (data, status) {
            // console.log(data);
            message.innerText = data.msg;
            return false;
        });
}


