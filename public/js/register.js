const register = document.querySelector('#btn-reg');
const message = document.querySelector('#message');
// const send = document.querySelector('#send');
console.log(register)
register.addEventListener('click', (e) => {
    e.preventDefault();
    const name = document.getElementsByName("name-reg")[0].value;
    const email = document.getElementsByName("email-reg")[0].value;
    const password = document.getElementsByName("password-reg")[0].value;
    console.log(name+email+password);
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
})


