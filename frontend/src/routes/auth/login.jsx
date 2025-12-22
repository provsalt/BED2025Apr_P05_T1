import {useAlert} from "@/provider/AlertProvider.jsx";
import {useNavigate, Link} from "react-router";
import {useContext} from "react";
import {useForm} from "react-hook-form";
import {UserContext} from "@/provider/UserContext.js";
import {Mail, Lock, ArrowLeft} from "lucide-react";

export const Login = () => {
  const { register: registerLogin, handleSubmit: handleSubmitLogin, formState: { errors: loginErrors } } = useForm();
  const alert = useAlert();
  const navigate = useNavigate();
  const auth = useContext(UserContext);

  const onLogin = async data => {
    const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password
      })
    });
    if (res.ok) {
      alert.success({
        title: "Success",
        description: "Login successful. Redirecting...",
      });
      const resp = await res.json();
      
      const payload = JSON.parse(atob(resp.token.split('.')[1]));
      
      auth.setUser({
        id: resp.id,
        token: resp.token,
        isAuthenticated: true,
        role: payload.role,
        data: {
          name: resp.name || "",
          email: resp.email || "",
          language: resp.language || "",
          profile_picture_url: resp.profile_picture_url || "",
        }
      });
      
      if (payload.role === 'Admin') {
        setTimeout(() => navigate("/admin"), 1500);
      } else {
        setTimeout(() => navigate("/"), 1500);
      }
    } else {
      alert.error({
        title: "Error",
        description: "Invalid username or password",
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
            
            {/* Login Panel */}
            <div className="auth-panel-centered">
              <div className="auth-panel-content-inline">
                <form onSubmit={handleSubmitLogin(onLogin)} className="auth-form-inline">
                  <h1 className="auth-title-inline">Login</h1>
                  <p className="auth-subtitle-inline">Welcome back to ElderCare</p>
                  
                  <div className="auth-input-group-inline">
                    <label htmlFor="login-email">
                      <Mail size={20} />
                    </label>
                    <input 
                      id="login-email"
                      type="email" 
                      placeholder="Email" 
                      {...registerLogin("email", {required: true, maxLength: 255})} 
                    />
                  </div>
                  {loginErrors.email && <span className="auth-error-text-inline">Please enter a valid email.</span>}

                  <div className="auth-input-group-inline">
                    <label htmlFor="login-password">
                      <Lock size={20} />
                    </label>
                    <input 
                      id="login-password"
                      type="password" 
                      placeholder="Password" 
                      {...registerLogin("password", {required: true, min: 8, maxLength: 255})} 
                    />
                  </div>
                  {loginErrors.password && <span className="auth-error-text-inline">Please enter a valid password.</span>}

                  <button type="submit" className="auth-submit-btn-inline">Login</button>
                  
                  <p className="auth-toggle-text-inline">
                    New here? <Link to="/signup" className="auth-link-inline">Create an Account</Link>
                  </p>
                </form>
              </div>
            </div>

        </div>
      </div>
    </div>
  )
}