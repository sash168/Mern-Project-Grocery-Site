import React from 'react';
import { useAppContext } from '../context/AppContext';
import { toast } from 'sonner';

const Login = () => {
  const { setShowUserLogin, axios, navigate, setUser } = useAppContext();
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [state, setState] = React.useState("login");
  const [highlightRegister, setHighlightRegister] = React.useState(false);


  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      const { data } = await axios.post(`api/user/${state}`, {
        name,
        phone,
        password,
      });

      if (data.success) {
        navigate('/');
        setShowUserLogin(false);
        setUser(data.user);
      } else {
        toast.error(data.message);
        if (data?.message?.toLowerCase().includes("not registered")) {
          setState("register");
          setHighlightRegister(true);
        }
      }
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
        onClick={(e) => e.stopPropagation()}
        onSubmit={onSubmitHandler}
        className="flex flex-col gap-4 w-full max-w-[24rem] bg-white p-6 sm:p-8 rounded-xl shadow-xl border border-gray-200 text-gray-700"
      >
        <p className="text-2xl font-semibold text-center">
          <span className="text-primary">User</span> {state === "login" ? "Login" : "Sign Up"}
        </p>

        {state === "register" && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 rounded-md p-2 outline-primary"
              placeholder="Enter your name"
              required
            />
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={10}
            className="border border-gray-300 rounded-md p-2 outline-primary"
            placeholder="Enter phone number"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded-md p-2 outline-primary"
            placeholder="Enter password"
            required
          />
        </div>

        <p className="text-sm text-center">
          {state === "register" ? (
            <>
              Already have an account?{" "}
              <span
                onClick={() => setState("login")}
                className="text-primary font-medium cursor-pointer"
              >
                Login here
              </span>
            </>
          ) : (
            <>
              Create an account?{" "}
              <span
                onClick={() => setState("register")} className="text-primary font-medium cursor-pointer"
              >
                Sign up
              </span>
            </>
          )}
        </p>

        <button
          type="submit"
          className="bg-primary hover:bg-dull-primary transition-all text-white font-medium w-full py-2 rounded-md mt-2"
        >
          {state === "register" ? "Create Account" : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
