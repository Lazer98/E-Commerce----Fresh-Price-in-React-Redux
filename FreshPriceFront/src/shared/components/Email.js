import React, { useRef ,useState} from 'react';
import emailjs from '@emailjs/browser';


export default function Email() {
    const form = useRef();
    const [submitted, setSubmitted] = useState(false);

    const sendEmail = (e) => {
      e.preventDefault();
  
      emailjs.sendForm('service_xitqe73', 'template_iefbr4w', form.current, 'tGaoW0J3dCM6nmJF-')
        .then((result) => {
            console.log(result.text);
            setSubmitted(true);
        }, (error) => {
            console.log(error.text);
        });
    };
  if (submitted){
    return (
        <div> 
        <h2>Thank you!</h2>
        <div>We'll be in touch soon.</div>
        </div>
    );
  } 
  else { 
    return (
        
      <form ref={form} onSubmit={sendEmail}>
        <label>Name</label>
        <input type="text" name="user_name" />
        <label>Email</label>
        <input type="email" name="user_email" />
        <input type="submit" value="Send" />
      </form>
    );
  };
}