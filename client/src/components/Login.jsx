import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";

const Login = () => {
    const {
        setShowUserLogin,
        setUser,
        axios,
        navigate,
        redirectPath,
        setRedirectPath,
    } = useAppContext();

    const [state, setState] = useState("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const onSubmitHandler = async (event) => {
        try {
            event.preventDefault();
            
            if (state === "forgot-password") {
                setLoading(true);
                const { data } = await axios.post("/api/user/forgot-password", { email });
                if (data.success) {
                    toast.success(data.message || "OTP sent to your email!");
                    setState("verify-otp");
                }
                setLoading(false);
                return;
            }

            if (state === "verify-otp") {
                setLoading(true);
                const { data } = await axios.post("/api/user/verify-otp", { email, otp });
                if (data.success) {
                    toast.success(data.message || "OTP verified correctly!");
                    setState("reset-password");
                }
                setLoading(false);
                return;
            }

            if (state === "reset-password") {
                setLoading(true);
                const { data } = await axios.post("/api/user/reset-password", { email, otp, newPassword });
                if (data.success) {
                    toast.success(data.message || "Password reset successful! Please login.");
                    setState("login");
                    setPassword("");
                    setNewPassword("");
                    setOtp("");
                }
                setLoading(false);
                return;
            }

            setLoading(true);
            const payload =
                state === "login"
                    ? { email, password }
                    : { name, email, password };

            const { data } = await axios.post(`/api/user/${state}`, payload);

            if (data.success) {
                toast.success(
                    state === "login"
                        ? "Login successful"
                        : "Registration successful"
                );

                setUser(data.user);
                setShowUserLogin(false);

                setEmail("");
                setPassword("");
                setName("");
                navigate(redirectPath || "/");
                setRedirectPath("/");
            }
        } catch (error) {
            if (error.response && error.response.data) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            onClick={() => setShowUserLogin(false)}
            className="fixed top-0 bottom-0 left-0 right-0 z-30 flex items-center text-sm text-gray-600 bg-black/50"
        >
            <form
                onSubmit={onSubmitHandler}
                onClick={(e) => e.stopPropagation()}
                className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] rounded-lg shadow-xl border border-gray-200 bg-white"
            >
                <p className="text-2xl font-medium m-auto">
                    {state === "forgot-password" || state === "verify-otp" || state === "reset-password" ? (
                        <>
                            <span className="text-primary">Reset</span> Password
                        </>
                    ) : (
                        <>
                           <span className="text-primary">User</span>{" "}
                           {state === "login" ? "Login" : "Sign Up"}
                        </>
                    )}
                </p>
                {state === "forgot-password" && (
                    <p className="text-sm text-gray-500 text-center mb-2">
                        Enter your email address and we'll send you an OTP to reset your password.
                    </p>
                )}
                {state === "verify-otp" && (
                    <p className="text-sm text-gray-500 text-center mb-2">
                        Enter the 6-digit OTP sent to {email}.
                    </p>
                )}
                {state === "reset-password" && (
                    <p className="text-sm text-gray-500 text-center mb-2">
                        Enter your new password.
                    </p>
                )}
                {state === "register" && (
                    <div className="w-full">
                        <p>Name</p>
                        <input
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            placeholder="type here"
                            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                            type="text"
                            required
                        />
                    </div>
                )}
                {(state === "login" || state === "register" || state === "forgot-password") && (
                    <div className="w-full ">
                        <p>Email</p>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            placeholder="type here"
                            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                            type="email"
                            required
                        />
                    </div>
                )}
                {state === "verify-otp" && (
                    <div className="w-full ">
                        <p>OTP</p>
                        <input
                            onChange={(e) => setOtp(e.target.value)}
                            value={otp}
                            placeholder="123456"
                            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary text-center tracking-widest"
                            type="text"
                            maxLength={6}
                            required
                        />
                    </div>
                )}
                {state === "reset-password" && (
                    <div className="w-full ">
                        <p>New Password</p>
                        <input
                            onChange={(e) => setNewPassword(e.target.value)}
                            value={newPassword}
                            placeholder="type new password"
                            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                            type="password"
                            required
                        />
                    </div>
                )}
                {(state === "login" || state === "register") && (
                    <div className="w-full ">
                        <p>Password</p>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            placeholder="type here"
                            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                            type="password"
                            required
                        />
                    </div>
                )}
                
                {state === "login" && (
                    <div className="w-full text-right -mt-2">
                        <span 
                            onClick={() => setState("forgot-password")}
                            className="text-primary text-sm cursor-pointer hover:underline"
                        >
                            Forgot Password?
                        </span>
                    </div>
                )}

                {state === "register" ? (
                    <p>
                        Already have account?{" "}
                        <span
                            onClick={() => setState("login")}
                            className="text-primary cursor-pointer"
                        >
                            click here
                        </span>
                    </p>
                ) : state === "login" ? (
                    <p>
                        Create an account?{" "}
                        <span
                            onClick={() => setState("register")}
                            className="text-primary cursor-pointer"
                        >
                            click here
                        </span>
                    </p>
                ) : null}
                
                {(state === "forgot-password" || state === "verify-otp" || state === "reset-password") && (
                     <p>
                     Remembered your password?{" "}
                     <span
                         onClick={() => setState("login")}
                         className="text-primary cursor-pointer"
                     >
                         Login here
                     </span>
                 </p>
                )}
                <button
                    disabled={loading}
                    className={`bg-primary text-white w-full py-2 rounded-md cursor-pointer transition-all flex justify-center items-center ${
                        loading
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-primary-dull"
                    }`}
                >
                    {loading
                        ? state === "login"
                            ? "Logging in..."
                            : state === "forgot-password"
                            ? "Sending OTP..."
                            : state === "verify-otp"
                            ? "Verifying OTP..."
                            : state === "reset-password"
                            ? "Resetting..."
                            : "Creating..."
                        : state === "login"
                        ? "Login"
                        : state === "forgot-password"
                        ? "Send OTP"
                        : state === "verify-otp"
                        ? "Verify OTP"
                        : state === "reset-password"
                        ? "Confirm New Password"
                        : "Create Account"}
                </button>
            </form>
        </div>
    );
};

export default Login;
