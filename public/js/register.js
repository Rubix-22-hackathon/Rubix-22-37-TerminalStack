const form = document.querySelector('#register');
const message = document.querySelector('#message');
// const send = document.querySelector('#send');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementsByName("name").value;
    const email = document.getElementsByName("email").value;
    const password = document.getElementsByName("password").value;
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


