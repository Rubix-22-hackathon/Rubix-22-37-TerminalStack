const register = document.querySelector('#register');
const message = document.querySelector('#message');
const checking = document.getElementById("checking");

function registerUser() {

}
register.addEventListener('submit', (e) => {
    if (checking.checked != true) {
        registerUser(e)
    } else {
        registerDr(e);
    }
})

function registerUser(e) {
    e.preventDefault();
    const name = document.getElementsByName("name").value;
    const email = document.getElementsByName("email").value;
    const password = document.getElementsByName("password").value;
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
    const name = document.getElementsByName("name").value;
    const email = document.getElementsByName("email").value;
    const password = document.getElementsByName("password").value;
    const qualification = document.getElementsByName("qualification").value;
    const experience = document.getElementsByName("experience").value;
    const address = document.getElementsByName("address").value;
    const address = document.getElementsByName("address").value;
    const file = document.getElementsByName("file").value;
    console.log(name + email + password);
    let cont = {
        name,
        email,
        password,
        qualification,
        experience,
        address,
        file
    }
    message.innerText = "On progres......";
    $.post("/register", cont,
        function (data, status) {
            // console.log(data);
            message.innerText = data.msg;
            return false;
        });
}


