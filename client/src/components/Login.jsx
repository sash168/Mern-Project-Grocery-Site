import React from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Login = () => {
  const { setShowUserLogin, axios, navigate, setUser } = useAppContext();
  const [state, setState] = React.useState('login');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      const { data } = await axios.post(`api/user/${state}`, { name, email, password });

      if (data.success) {
        navigate('/');
        setShowUserLogin(false);
        setUser(data.user);
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div
      onClick={() => setShowUserLogin(false)}
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 px-4"
    >
      <form
        onSubmit={onSubmitHandler}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col gap-4 w-full max-w-[22rem] sm:max-w-sm bg-white p-6 sm:p-8 rounded-lg shadow-xl border border-gray-200 text-sm text-gray-600"
      >
        <p className="text-xl sm:text-2xl font-medium text-center">
          <span className="text-primary">User</span>{' '}
          {state === 'login' ? 'Login' : 'Sign Up'}
        </p>

        {state === 'register' && (
          <div className="w-full">
            <p className="text-gray-700 text-sm">Name</p>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder="Enter your name"
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary text-sm sm:text-base"
              type="text"
              required
            />
          </div>
        )}

        <div className="w-full">
          <p className="text-gray-700 text-sm">Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="Enter your email"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary text-sm sm:text-base"
            type="email"
            required
          />
        </div>

        <div className="w-full">
          <p className="text-gray-700 text-sm">Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="Enter your password"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary text-sm sm:text-base"
            type="password"
            required
          />
        </div>

        <p className="text-gray-600 text-sm sm:text-base">
          {state === 'register' ? (
            <>
              Already have an account?{' '}
              <span
                onClick={() => setState('login')}
                className="text-dull-primary font-medium cursor-pointer"
              >
                Login here
              </span>
            </>
          ) : (
            <>
              Create an account?{' '}
              <span
                onClick={() => setState('register')}
                className="text-dull-primary font-medium cursor-pointer"
              >
                Sign up
              </span>
            </>
          )}
        </p>

        <button className="bg-primary hover:bg-dull-primary transition-all text-white w-full py-2 rounded-md mt-2 text-sm sm:text-base">
          {state === 'register' ? 'Create Account' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
