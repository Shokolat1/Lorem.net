let socket = io();

let btnChat = document.getElementById('btnChat')
let chat = document.getElementById('chatX')
let txtEnviar = document.getElementById('txtEnviar')
let uCh = document.getElementById('uCh')
let tipo = ''
let un = ''

// Al entrar al chat
socket.on('Inicio', ()=>{
    socket.emit('tipoUsInic')
})
socket.on('traigoTipoInic', data =>{
    let tipoINICIO = data
    // console.log('Hola '+tipoINICIO)
    if(tipoINICIO.startsWith('a')){
        socket.emit('dameUsers')
    }
})

// Cuando se manden los usuarios
socket.on('users', data =>{
    data.forEach((user) => {
        user.self = user.type.startsWith('a');
    });
    
    this.data = data.sort((a, b) => {
        if (a.self) return -1;
        if (b.self) return 1;
        if (a.username < b.username) return -1;
        return a.username > b.username ? 1 : 0;
    })

    if(uCh){
        data.forEach(user =>{
            uCh.innerHTML +=
            `<div class="alert alert-dismissible alert-primary usX">
                <div>
                    <strong><h5>Usuario: ${user.username} (${user.type})</h5></strong>
                </div>
                <div>
                </div>
            </div>`
        })
    }
})

// Mandar Mensajes
btnChat.addEventListener('click', (e)=>{
    e.preventDefault()
    if(!txtEnviar.value){
        return
    }

    socket.emit('tipoUs')
    socket.on('traigoTipo', data =>{
        tipo = data
    })
    
    socket.emit('chatMsg', txtEnviar.value)
  
})

socket.on('chatMsg', ({msg, uN}) =>{
    console.log(msg)
    if(!tipo.startsWith('a')){
        chat.innerHTML += 
        `<div class="d-flex align-items-baseline mb-4">
            <div class="position-relative avatar">
                <img src="../images/userImg.png" class="img-fluid rounded-circle" alt="">
            </div>
            <div class="pe-2">
                <div class="card card-text d-inline-block p-2 px-3 m-1" id="msgNorm">
                    ${uN}: ${msg}
                </div>
            </div>
        </div>`
        txtEnviar.value = ''
    }else{
        chat.innerHTML += 
        `<div class="d-flex align-items-baseline mb-4">
            <div class="position-relative avatar">
                <img src="../images/loremsio.png"class="img-fluid rounded-circle" alt="">
            </div>
            <div class="pe-2">
                <div class="card card-text d-inline-block p-2 px-3 m-1">
                    ${uN}: ${msg}
                </div>
            </div>
        </div>`
        txtEnviar.value = ''
    }
})