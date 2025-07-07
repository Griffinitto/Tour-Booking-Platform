import React from 'react';
import LoginForm from '../components/LoginForm';

const Login: React.FC = () => {
  return (
    <div className="page-container">
      <div className="login-container">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;