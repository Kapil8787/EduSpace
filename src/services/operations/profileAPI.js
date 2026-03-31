import { setProgress } from "../../slices/loadingBarSlice.js";
import { apiConnector } from "../apiConnector";
import { profileEndpoints } from "../apis";
import { toast } from "react-hot-toast";
import {settingsEndpoints} from "../apis"
import { logout } from "./authAPI.js";



//getEnrolledCourses
export async function getUserCourses(token,dispatch){
    // const toastId = toast.loading("Loading...");
    dispatch(setProgress);
    let result = []
    try {
      console.log("BEFORE Calling BACKEND API FOR ENROLLED COURSES");
      const response = await apiConnector(
        "GET",
        profileEndpoints.GET_USER_ENROLLED_COURSES_API,
        null,
        {
          Authorisation: `Bearer ${token}`,
        }
      )
      console.log("AFTER Calling BACKEND API FOR ENROLLED COURSES");
    //   console.log(
    //     "GET_USER_ENROLLED_COURSES_API API RESPONSE............",
    //     response
    //   )
  
      if (!response.data.success) {
        throw new Error(response.data.message)
      }
      result = response.data.data;
    } catch (error) {
      console.log("GET_USER_ENROLLED_COURSES_API API ERROR............", error)
      toast.error("Could Not Get Enrolled Courses")
    }
    dispatch(setProgress(100));
    // toast.dismiss(toastId)
    return result
}


//updateProfilePicture
export async function updatePfp(token,pfp){
  const toastId = toast.loading("Uploading...");
  try {
    const formData = new FormData();
    console.log("pfp",pfp)
    formData.append('pfp',pfp);
    const response = await apiConnector("PUT", settingsEndpoints.UPDATE_DISPLAY_PICTURE_API,formData,{
      Authorisation: `Bearer ${token}`,
    });
    console.log("UPDATE_DISPLAY_PICTURE_API API RESPONSE............", response)
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    toast.success("Profile Picture Updated Successfully");
    const imageUrl = response.data.data.image;
    localStorage.setItem("user",JSON.stringify({...JSON.parse(localStorage.getItem("user")),image:imageUrl}));
    console.log(JSON.parse(localStorage.getItem("user")).image);
  } catch (error) {
    console.log("UPDATE_DISPLAY_PICTURE_API API ERROR............", error)
    toast.error(error.response.data.message);
  }
  toast.dismiss(toastId);
}





//updateAdditionalDetails
export async function updateAdditionalDetails(token,additionalDetails){
  console.log("additionalDetails",additionalDetails);
  const {firstName,lastName,dateOfBirth,gender,contactNumber,about}=additionalDetails;
  console.log("additionalDetails",additionalDetails);
  const toastId = toast.loading("Updating...");
  try {
    const response = await apiConnector("PUT", settingsEndpoints.UPDATE_PROFILE_API,{firstName,lastName,dateOfBirth,gender,contactNumber,about},{
      Authorisation: `Bearer ${token}`,
    });
    console.log("UPDATE_ADDITIONAL_DETAILS_API API RESPONSE............", response)
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    toast.success("Additional Details Updated Successfully");
    const user = JSON.parse(localStorage.getItem("user"));
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.additionalDetails.dateOfBirth = dateOfBirth  || user.additionalDetails.dateOfBirth;
    user.additionalDetails.contactNumber = contactNumber || user.additionalDetails.contactNumber;
    user.additionalDetails.about = about || user.additionalDetails.about;
    user.additionalDetails.gender=gender
    localStorage.setItem("user",JSON.stringify(user));

  } catch (error) {
    console.log("UPDATE_ADDITIONAL_DETAILS_API API ERROR............", error)
    toast.error(error.response.data.message)
  }
  toast.dismiss(toastId);
}






//updatePassword
export async function updatePassword(token,password){
  const { oldPassword, newPassword, confirmPassword:confirmNewPassword }=password;
  console.log("password",password);
  const toastId = toast.loading("Updating...");
  try {
   const response = await apiConnector("POST", settingsEndpoints.CHANGE_PASSWORD_API,{oldPassword, newPassword, confirmNewPassword},{
      Authorisation: `Bearer ${token}`,
    });
    console.log("UPDATE_PASSWORD_API API RESPONSE............", response)
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    toast.success("Password Updated Successfully");
  }
  catch (error) {
    console.log("UPDATE_PASSWORD_API API ERROR............", error)
    toast.error(error.response.data.message)
  }
  toast.dismiss(toastId);
}



//deleteAccount
export async function deleteAccount(token,dispatch,navigate){
  const toastId = toast.loading("Deleting...");
  try {
    const response = await apiConnector("DELETE", settingsEndpoints.DELETE_PROFILE_API,null,{
      Authorisation: `Bearer ${token}`,
    });
    console.log("DELETE_ACCOUNT_API API RESPONSE............", response)
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    toast.success("Account Deleted Successfully");
    dispatch(logout(navigate))
  }
  catch (error) {
    console.log("DELETE_ACCOUNT_API API ERROR............", error)
    toast.error(error.response.data.message)
  }
  toast.dismiss(toastId);
}

//get instructor dashboard
export async function getInstructorDashboard(token,dispatch){
  // const toastId = toast.loading("Loading...");
  dispatch(setProgress);
  let result = []
  try {
    console.log("BEFORE Calling BACKEND API FOR INSTRUCTOR DASHBOARD");
    const response = await apiConnector(
      "GET",
      profileEndpoints.GET_ALL_INSTRUCTOR_DASHBOARD_DETAILS_API,
      null,
      {
        Authorisation: `Bearer ${token}`,
      }
    )
    console.log("AFTER Calling BACKEND API FOR INSTRUCTOR DASHBOARD");
    // console.log(
    //   "GET_INSTRUCTOR_DASHBOARD_API API RESPONSE............",
    //   response
    // )

    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    result = response.data.data;
  } catch (error) {
    console.log("GET_INSTRUCTOR_DASHBOARD_API API ERROR............", error)
    toast.error("Could Not Get Instructor Dashboard")
  }
  dispatch(setProgress(100));
  // toast.dismiss(toastId)
  return result
}

//get pending instructors for admin
export async function getPendingInstructors(token){
  const toastId = toast.loading("Fetching pending instructors...");
  try {
    const response = await apiConnector("GET", profileEndpoints.GET_PENDING_INSTRUCTORS_API, null, {
      Authorisation: `Bearer ${token}`,
    })
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data;
  } catch (error) {
    console.log("GET_PENDING_INSTRUCTORS_API ERROR", error)
    toast.error(error?.response?.data?.message || "Could not fetch pending instructors")
    return [];
  } finally {
    toast.dismiss(toastId)
  }
}

export async function approveInstructor(token, instructorId){
  const toastId = toast.loading("Approving instructor...");
  try {
    const response = await apiConnector("POST", profileEndpoints.APPROVE_INSTRUCTOR_API, { instructorId }, {
      Authorisation: `Bearer ${token}`,
    })
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    toast.success("Instructor approved successfully")
    return true;
  } catch (error) {
    console.log("APPROVE_INSTRUCTOR_API ERROR", error)
    toast.error(error?.response?.data?.message || "Unable to approve instructor")
    return false;
  } finally {
    toast.dismiss(toastId)
  }
}

export async function rejectInstructor(token, instructorId, reason=""){
  const toastId = toast.loading("Rejecting instructor...");
  try {
    const response = await apiConnector("POST", profileEndpoints.REJECT_INSTRUCTOR_API, { instructorId, reason }, {
      Authorisation: `Bearer ${token}`,
    })
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    toast.success("Instructor rejected successfully")
    return true;
  } catch (error) {
    console.log("REJECT_INSTRUCTOR_API ERROR", error)
    const errorMessage = error?.response?.data?.message || error?.message || "Unable to reject instructor"
    toast.error(errorMessage)
    return false;
  } finally {
    toast.dismiss(toastId)
  }
}
