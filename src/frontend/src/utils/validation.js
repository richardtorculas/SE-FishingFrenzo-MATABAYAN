export const validateEmail = (email) => {
  const regex = /^\S+@\S+\.\S+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  const strength = {
    score: 0,
    feedback: []
  };

  if (password.length >= 8) strength.score++;
  if (password.length >= 12) strength.score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength.score++;
  if (/\d/.test(password)) strength.score++;
  if (/[^a-zA-Z0-9]/.test(password)) strength.score++;

  if (password.length < 8) strength.feedback.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) strength.feedback.push('One uppercase letter');
  if (!/[a-z]/.test(password)) strength.feedback.push('One lowercase letter');
  if (!/\d/.test(password)) strength.feedback.push('One number');

  return strength;
};
