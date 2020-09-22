// Variabler for de forskellige beskedtyper
const messageTypes = {LEFT: 'left', RIGHT: 'right', LOGIN: 'login'};

// Variabler for de elementer der håndterer chatten
const chatWindow = document.getElementById('chat'),
messagesList = document.getElementById('messagesList');
messageInput = document.getElementById('messageInput'),
sendBtn = document.getElementById('sendBtn');

// Variabler for de elementer der håndterer login
let username = '';
const usernameInput = document.getElementById('username-input'),
loginBtn = document.getElementById('loginBtn'),
loginWindow = document.getElementById('login');

// Array med besked information der vises til brugeren
const messages = [
]; // {author, date, content, type}

// Sætter socket variabel op der håndterer brugerhandlinger
let socket = io();

// Event der bliver kørt når emit 'message' bliver kaldt
socket.on('message', message => {

    // Logger beskeden der vises til brugere
    console.log(message);

    // Tjekker om beskedtypen er login
    if (message.type !== messageTypes.LOGIN){

        // Hvis beskedtypen ikke er login, tjekkes om author er brugeren selv
        // Beskeden bliver vist i højre side hvis dette er tilfældet
        if(message.author === username){
            message.type = messageTypes.RIGHT;
        }
        // Hvis ikke, vises beskeden i venstre side
        else{
            message.type = messageTypes.LEFT;
        }
    }

    // Tilføjer beskeden til beskedarray
    messages.push(message);

    // Kalder 'displayMessages' funktionen
    displayMessages();

    // Sørger for at chatvinduet scroller ned i bunden hvis der er for mange beskeder i chat vinduet
    chatWindow.scrollTop = chatWindow.scrollHeight;
});

// Funktion der skaber en HTML string
function createMessageHTML(message){
    
    // Hvis beskedtypen er LOGIN skabes en kort paragraf
    if (message.type === messageTypes.LOGIN){
        return `<p class="secondary-text text-center mb-2">${message.author} has joined the chat...</p>`;
    }

    // Hvis beskedtypen er LEFT eller RIGHT skabes flere HTML elementer der agerer som et besked element
    return `
    <div class="message ${message.type === messageTypes.LEFT ? 'message-left' : 'message-right'}">
        <div id="message-details" class="flex">
            <p class="message-author">
                ${message.type === messageTypes.RIGHT ? '' : message.author}
            </p>
            <p class="message-date">${message.date}</p>
        </div>
        <p class="message-content">${message.content}</p>
    </div>`;
}

// Funktion der sender beskeder til alle aktive brugere
function displayMessages(){
    const messagesHTML = messages
        .map(message => createMessageHTML(message))
        .join('');
    messagesList.innerHTML = messagesHTML;
}

// Event listener som køres når der bliver trykket på login knappen
loginBtn.addEventListener('click', e =>{

    // Undgår at siden opdaterer når der trykkes på knappen, da vi ikke vil sende en form
    e.preventDefault();

    // Hvis der ikke er nogen værdi i brugernavns feltet skriver vi bare en konsolbesked og der sker intet
    // (I en rigtig applikation ville jeg formidle dette på hjemmesiden)
    if (!usernameInput.value){
        return console.log('Must supply a username');
    }

    // Sørger for at brugernavns variablen er lig det indtastede navn
    username = usernameInput.value;

    // Opretter en login besked for alle aktive brugere
    sendMessage({
        author: username,
        type: messageTypes.LOGIN
    })

    // Sætter login vinduet til at være gemt
    loginWindow.classList.add('hidden');

    // Sætter chatvinduet til at blive vist
    chatWindow.classList.remove('hidden');

    // Sørger for at siden automatisk fokuserer på beskedfeltet
    messageInput.focus();
});

sendBtn.addEventListener('click', e => {

    // Undgår at siden opdaterer når der trykkes på knappen, da vi ikke vil sende en form
    e.preventDefault();

    // Hvis besked feltet ikke har nogen værdi når der trykkes på send knappen, skriver vi bare en konsolbesked og der sker intet
    // (I en rigtig applikation ville jeg formidle dette på hjemmesiden)
    if (!messageInput.value){
        return console.log('Must supply a message');
    }

    // Opretter en variabel til at vise dato
    const date = new Date();

    // Opretter besked objektet
    // Dato bruger strenginterpolation for at skabe en datostring. 
    
    /* date.getMonth() forklaring */
    // For at vise et 0 foran enkelttals måneder tilføjes 0 til strengen
    // Bagefter sørger vi for at den rette måned vises, da måneder igennem Date() funktionen er 0-indeks baserede, så vi tilføjer 1
    // Til sidst sørger vi for at 0'et fra tidligere fjernes når vi rammer månederne 10-12. 
    // Dette gøres igennem slice() funktionen som tager de 2 sidste karakterer i en string hvis den bliver kaldt med -2
    const message = {
        author: username, 
        date: `${date.getDate()}-${('0' + (date.getMonth() + 1)).toString().slice(-2)}-${date.getFullYear()}`,
        content: messageInput.value,
    }

    // sendMessage funktionen bliver kaldt med den oprettede besked
    sendMessage(message);

    // Værdien af tekstboksen bliver sat til at være en tom streng
    messageInput.value = '';
});

// Laver et event kald med eventet 'message'
function sendMessage (message){
    socket.emit('message', message);
}