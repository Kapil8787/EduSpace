import { toast } from "react-hot-toast"

import { setLoading, setToken } from "../../slices/authSlice"
import { resetCart } from "../../slices/cartSlice"
import { setUser } from "../../slices/profileSlice"
import { endpoints } from "../apis"
import {apiConnector} from "../apiConnector"
import {setProgress} from "../../slices/loadingBarSlice"

const {
  SENDOTP_API,
  SIGNUP_API,
  LOGIN_API,
  RESETPASSTOKEN_API,
  RESETPASSWORD_API,
} = endpoints

const OTP_REQUEST_TIMEOUT_MS = Number(process.env.REACT_APP_OTP_TIMEOUT_MS || 70000)

export function sendOtp(email, navigate) {
  return async (dispatch) => {
    // const toastId = toast.loading("Loading...")
    dispatch(setLoading(true))
    try {
      let response
      let attempt = 0

      while (attempt < 2) {
        try {
          response = await apiConnector(
            "POST",
            SENDOTP_API,
            {
              email,
              checkUserPresent: true,
            },
            null,
            null,
            null,
            { timeout: OTP_REQUEST_TIMEOUT_MS }
          )
          break
        } catch (requestError) {
          attempt += 1
          const isTimeoutError = requestError?.code === "ECONNABORTED"

          if (attempt < 2 && isTimeoutError) {
            console.log("SENDOTP timeout on first attempt, retrying once...")
            continue
          }

          throw requestError
        }
      }

      dispatch(setProgress(100));
      console.log("SENDOTP API RESPONSE............", response)

      console.log(response.data.success)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      toast.success("OTP Sent Successfully")
      navigate("/verify-email")
      return true
    } catch (error) {
      console.log("SENDOTP API ERROR............", error)
      if (error?.code === "ECONNABORTED") {
        toast.error("Request timed out after retry. Please try again in a moment.")
      } else {
        toast.error(error?.response?.data?.message || "Unable to send OTP. Please try again.")
      }
      dispatch(setProgress(100));
      return false
    } finally {
      dispatch(setLoading(false))
    }
    // toast.dismiss(toastId)
  }
}

export function signUp(
  accountType,
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
  otp,
  instituteName,
  linkedin,
  experience,
  navigate
) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("POST", SIGNUP_API, {
        accountType,
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        otp,
        instituteName,
        linkedin,
        experience,
      })

      console.log("SIGNUP API RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }
      dispatch(setProgress(100));
      toast.success("Signup Successful")
      navigate("/login")
    } catch (error) {
      dispatch(setProgress(100));
      console.log("SIGNUP API ERROR............", error)
      toast.error(error?.response?.data?.message || "Signup Failed")
      navigate("/signup")
    }
    dispatch(setLoading(false))
    toast.dismiss(toastId)
  }
}

export function login(email, password, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("POST", LOGIN_API, {
        email,
        password,
      })

      console.log("LOGIN API RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }
      dispatch(setProgress(100))
      toast.success("Login Successful")
      dispatch(setToken(response.data.token))
      const userImage = response.data?.user?.image
        ? response.data.user.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.user.firstName} ${response.data.user.lastName}`
      dispatch(setUser({ ...response.data.user, image: userImage }))
      localStorage.setItem("user", JSON.stringify(response.data.user))
      localStorage.setItem("token", JSON.stringify(response.data.token))
      navigate("/dashboard/my-profile")
    } catch (error) {
      dispatch(setProgress(100))
      console.log("LOGIN API ERROR............", error)
      const status = error?.response?.status;
      const message = error?.response?.data?.message || "Login Failed";
      toast.error(message)

      // clear stale auth state on any login fail
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      dispatch(setToken(null));

      if (status === 403 && message === "Account pending approval") {
        navigate("/pending-approval");
      } else {
        // rejected/inactive/unregistered go to signup
        navigate("/signup");
      }
    }
    dispatch(setLoading(false))
    toast.dismiss(toastId)
  }
}

export function getPasswordResetToken(email, setEmailSent) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("POST", RESETPASSTOKEN_API, {
        email,
      })

      console.log("RESETPASSTOKEN RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      toast.success("Reset Email Sent")
      setEmailSent(true)
    } catch (error) {
      console.log("RESETPASSTOKEN ERROR............", error)
      toast.error("Failed To Send Reset Email")
    }
    toast.dismiss(toastId)
    dispatch(setLoading(false))
  }
}

export function resetPassword(password, confirmPassword, token,setresetComplete) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("POST", RESETPASSWORD_API, {
        password,
        confirmPassword,
        token,
      })

      console.log("RESETPASSWORD RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      toast.success("Password Reset Successfully")
      setresetComplete(true)
    } catch (error) {
      console.log("RESETPASSWORD ERROR............", error)
      toast.error("Failed To Reset Password")
    }
    toast.dismiss(toastId)
    dispatch(setLoading(false))
  }
}

export function logout(navigate) {
  return (dispatch) => {
    dispatch(setToken(null))
    dispatch(setUser(null))
    dispatch(resetCart())
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    toast.success("Logged Out")
    navigate("/")
  }
}


export function forgotPassword(email,setEmailSent) {
  return async (dispatch) => {
    // const toastId = toast.loading("Loading...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("POST", RESETPASSTOKEN_API, {
        email,
      })

      console.log("FORGOTPASSWORD RESPONSE............", response)

      if (!response.data.success) {
        toast.error(response.data.message)
        throw new Error(response.data.message)
      }

      toast.success("Reset Email Sent");
      setEmailSent(true)
    } catch (error) {
      console.log("FORGOTPASSWORD ERROR............", error)
    }
    // toast.dismiss(toastId)
    dispatch(setLoading(false))
  }
}
