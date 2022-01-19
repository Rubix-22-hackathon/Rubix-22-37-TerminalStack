// Js for Frontend
const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

// var peer = new Peer(undefined, {
//     path: '/peerjs',
//     host: '/',
//     port: '443'
// });


var peer = new Peer();

let myVideoStream;

navigator.mediaDevices.getUserMedia({ //It takes object
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);


    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video');
        console.log('User video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);

        })
    })

    socket.on('user-connected', (userID) => {
        console.log('User Connected');
        setTimeout(function () {
            connectToNewUser(userID, stream);
        }, 5000)
    })

    let text = $('input')

    // when press enter send message
    $('html').keydown(function (e) {
        if (e.which == 13 && text.val().length !== 0) {
            console.log(text.val());
            socket.emit('message', text.val());
            text.val('')
        }
    });


    socket.on('createMessage', message => {
        console.log("This is comming from from server " + message);
        $("ul").append(`<li class="message"><b>user</b><br>${message}</li>`);
        scrollToBottom();
    })
})

peer.on('open', id => {
    console.log("Your own id = " + id);
    let ROOM_ID = document.getElementById("r-id").innerText;
    console.log(ROOM_ID);
    socket.emit('join-room', ROOM_ID, id);
})



const connectToNewUser = (userID, stream) => {
    console.log('New User connected = ' + userID);
    const call = peer.call(userID, stream)
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        console.log('New user video');
        addVideoStream(video, userVideoStream);
    })

}

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}


const scrollToBottom = () => {
    let d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const playStop = () => {
    // console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    } else {
        setStopVideo()
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
      <i class="fas fa-microphone"></i>
      <span>Mute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
      <i class="unmute fas fa-microphone-slash"></i>
      <span>Unmute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
    const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}