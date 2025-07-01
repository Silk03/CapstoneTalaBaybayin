import React, { useState } from 'react';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';

export default function AuthContainer() {
  const [isLogin, setIsLogin] = useState(true);

  const switchToSignup = () => setIsLogin(false);
  const switchToLogin = () => setIsLogin(true);

  return isLogin ? (
    <LoginScreen onSwitchToSignup={switchToSignup} />
  ) : (
    <SignupScreen onSwitchToLogin={switchToLogin} />
  );
}
