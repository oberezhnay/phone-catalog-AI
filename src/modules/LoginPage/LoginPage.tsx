import { FormEvent, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ApiError } from '../../api/http';
import styles from './LoginPage.module.scss';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: string })?.from || '/';

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to log in';

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className={styles.wrapper}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h1 className={styles.title}>Log in</h1>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={styles.submit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </button>

          <p className={styles.switch}>
            Don&apos;t have an account?{' '}
            <NavLink to="/register">Register</NavLink>
          </p>
        </form>
      </div>
    </div>
  );
};
