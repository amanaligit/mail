document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  alert("hello");
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', ()=> compose_email());
  // By default, load the inbox
  
  load_mailbox('inbox');
  document.querySelector('form').onsubmit = function() {
    console.log("sending mail");
    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: `${document.querySelector('#compose-recipients').value}`,
            subject: `${document.querySelector('#compose-subject').value}`,
            body: `${document.querySelector('#compose-body').value}`
        })
      })
      .then(response => response.json())
      .then(result => {
          // Print result
          console.log(result);
          compose_email();
      });
      return false;
  }
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#display-mail').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  
}

function compose_reply(mail) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#display-mail').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = mail.sender;
  if(mail.subject.substring(0, 3) === 'Re:')
  {
    document.querySelector('#compose-subject').value = mail.subject
  }
  else{
    document.querySelector('#compose-subject').value = `Re: ${mail.subject}`
  }
  document.querySelector('#compose-body').value = `On ${mail.timestamp}, ${mail.sender} said: ${mail.body} \n`;
  
}

function display(mail, mailbox)
{
  fetch(`/emails/${mail.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  });
  document.querySelector('#display-mail').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector("#sender").innerHTML = mail.sender;
  document.querySelector("#recipients").innerHTML = "";
  mail.recipients.forEach((recipient) => document.querySelector("#recipients").innerHTML += `${recipient}, `)
  document.querySelector("#subject").innerHTML = mail.subject;
  document.querySelector("#timestamp").innerHTML = mail.timestamp;
  document.querySelector("#body").innerHTML = mail.body;
  document.querySelector("#reply").onclick = () =>compose_reply(mail);
  if(mailbox === 'archive')
  {
    document.querySelector("#archive").innerHTML = 'Unarchive';
    document.querySelector("#archive").onclick = () => 
    {
      fetch(`/emails/${mail.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: false
        })
      });
    }
  }
  else if(mailbox === 'inbox'){
    document.querySelector("#archive").onclick = () => 
    {
      fetch(`/emails/${mail.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: true
        })
      });
    }
  }
  else
  {
    document.querySelector("#archive").style.display = 'none';
  }
  
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#display-mail').style.display = 'none';
 
  // Show the mailbox name
  document.querySelector('#title').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      // Print emails
      document.querySelector("#emails").innerHTML = "";
      emails.forEach(email => {
        var mail = document.createElement("tr");
        if(email.read===false)
        {
          mail.className= 'table-secondary';
        }
        
        var sender = document.createElement("td");
        sender.innerHTML = email.sender;
        mail.appendChild(sender);
        var subject = document.createElement("td");
        subject.innerHTML = email.subject;
        mail.appendChild(subject);
        var timestamp = document.createElement("td");
        timestamp.innerHTML = email.timestamp;
        mail.appendChild(timestamp);
        mail.onclick = () => display(email, mailbox);
        document.querySelector("#emails").appendChild(mail);
      });


      // ... do something else with emails ...
    });
}