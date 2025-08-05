import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

const ForgotPassword = ({ forgotPassword, isAuthenticated }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    forgotPassword(email);
  };
  if (isAuthenticated) {
    return <Navigate to='/dashboard' />;
  }

  return (
    <div>
      <h1>Forgot Password</h1>
      <form onSubmit={handleSubmit}>
        <input
          type='email'
          placeholder='Enter your email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type='submit'>Send Reset Link</button>
      </form>
    </div>
  );
};

ForgotPassword.propTypes = {
  forgotPassword: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps, { forgotPassword })(ForgotPassword);
