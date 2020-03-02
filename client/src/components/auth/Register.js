import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
// import axios from 'axios';

const Register = () => {
{/*  formdata is the object state with field values, preset with the default values  */}
    const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  });
 {/*  destructure the above object for easier pull  */}
  const { name, email, password, password2 } = formData;
{/* in setForm Data change the initial state,
  make a copy from setform data
   and change only the name attribute (email, password etc),
 with[e.target.name](taking the value of the name attribute) using as a key for every field change */}
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
{/* change action in the form with onSubmit, make sure the passwords match */}

  const onSubmit = async e =>{
    e.preventDefault();
    if(password !== password2){
      console.log('Passwords do not match');
    } else {

      console.log(formData);
      console.log('SUCCESS!!');
    };
  };


  return (
    <Fragment>
      <h1 className="large text-primary">Sign Up</h1>
      <p className="lead"><i className="fas fa-user"></i> Create Your Account</p>
      <form className="form" onSubmit={e => onSubmit(e)}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Name"
            name="name"
            value={name}
            onChange={e => onChange(e)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email Address"
            name="email"
            value={email}
            onChange={e => onChange(e)}
            required
          />
          <small className="form-text"
            >This site uses Gravatar so if you want a profile image, use a
            Gravatar email</small>
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            name="password"
            minLength="6"
            value={password}
            onChange={e => onChange(e)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Confirm Password"
            name="password2"
            minLength="6"
            value={password2}
            onChange={e => onChange(e)}
            required
          />
        </div>
        <input type="submit" className="btn btn-primary" value="Register" />
      </form>
      <p className="my-1">
        Already have an account? <Link to="/login">Login Here</Link>
      </p>
    </Fragment>
  );
};

export default Register;