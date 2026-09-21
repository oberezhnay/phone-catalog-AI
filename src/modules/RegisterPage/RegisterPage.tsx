import { FormEvent, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ApiError } from '../../api/http';
import styles from '../LoginPage/LoginPage.module.scss';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await register(email, password, name);
      navigate('/', { replace: true });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to register';

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className={styles.wrapper}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h1 className={styles.title}>Register</h1>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              className={styles.input}
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

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
              minLength={6}
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Register'}
          </button>

          <p className={styles.switch}>
            Already have an account? <NavLink to="/login">Log in</NavLink>
          </p>
        </form>
      </div>
    </div>
  );
};
