import {Link, useNavigate} from "react-router";
import {useForm} from "react-hook-form";
import {useAlert} from "@/provider/AlertProvider.jsx";
import {useContext} from "react";
import {UserContext} from "@/provider/UserContext.js";
import {Mail, Lock, User, Calendar, ArrowLeft} from "lucide-react";


export const Signup = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const alert = useAlert();
  const navigate = useNavigate();
  const auth = useContext(UserContext);

  const onSubmit = async data => {
    const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
        date_of_birth: data.date_of_birth,
        gender: data.gender
      })
    });
    if (res.ok) {
      alert.success({
        title: "Success",
        description: "Account created successfully! Please login.",
      });
      setTimeout(() => navigate("/login"), 1500);
    } else {
      const errorData = await res.json();
      alert.error({
        title: "Error",
        description: errorData.message || "An error occurred while creating the account.",
        variant: "destructive"
      });
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="auth-center-bg relative flex-1 flex items-center justify-center" style={{minHeight: 'calc(100vh - 80px)'}}>
        <button 
          onClick={() => navigate("/")} 
          className="auth-back-button-inline"
          aria-label="Go back to home"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="auth-centered-container">
          <div className="auth-panel-centered">
            <div className="auth-panel-content-inline">
              <form onSubmit={handleSubmit(onSubmit)} className="auth-form-inline">
                <h1 className="auth-title-inline">Sign Up</h1>
                <p className="auth-subtitle-inline">Start your journey today</p>
                
                <div className="auth-input-group-inline">
                  <label htmlFor="signup-name">
                    <User size={20} />
                  </label>
                  <input 
                    id="signup-name"
                    type="text" 
                    placeholder="Full Name" 
                    {...register("name", {required: true, maxLength: 255})} 
                  />
                </div>
                {errors.name && <span className="auth-error-text-inline">Please enter your name.</span>}

                <div className="auth-input-group-inline">
                  <label htmlFor="signup-email">
                    <Mail size={20} />
                  </label>
                  <input 
                    id="signup-email"
                    type="email" 
                    placeholder="Email" 
                    {...register("email", {required: true, maxLength: 255})} 
                  />
                </div>
                {errors.email && <span className="auth-error-text-inline">Please enter a valid email.</span>}

                <div className="auth-input-group-inline">
                  <label htmlFor="signup-password">
                    <Lock size={20} />
                  </label>
                  <input 
                    id="signup-password"
                    type="password" 
                    placeholder="Password" 
                    {...register("password", {required: true, minLength: 8, maxLength: 255})} 
                  />
                </div>
                {errors.password && <span className="auth-error-text-inline">Password must be at least 8 characters.</span>}

                <div className="auth-input-group-inline">
                  <label htmlFor="signup-dob">
                    <Calendar size={20} />
                  </label>
                  <input 
                    id="signup-dob"
                    type="date" 
                    placeholder="Date of Birth" 
                    {...register("date_of_birth", {required: true})} 
                  />
                </div>
                {errors.date_of_birth && <span className="auth-error-text-inline">Please enter your date of birth.</span>}

                <div className="auth-input-group-inline">
                  <label htmlFor="signup-gender">
                    <User size={20} />
                  </label>
                  <select id="signup-gender" {...register("gender", {required: true})}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {errors.gender && <span className="auth-error-text-inline">Please select your gender.</span>}

                <button type="submit" className="auth-submit-btn-inline">Sign Up</button>
                
                <p className="auth-toggle-text-inline">
                  Already have an account? <Link to="/login" className="auth-link-inline">Sign In</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
