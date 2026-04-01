const API_PREFIX = "/api/v1";

const normalizeBaseUrl = (rawBaseUrl) => {
  if (!rawBaseUrl) {
    return API_PREFIX;
  }

  const trimmedBaseUrl = rawBaseUrl.trim().replace(/\/+$/, "");

  if (trimmedBaseUrl.endsWith(API_PREFIX)) {
    return trimmedBaseUrl;
  }

  return `${trimmedBaseUrl}${API_PREFIX}`;
};

const BASE_URL = normalizeBaseUrl(process.env.REACT_APP_BASE_URL);
const buildApiUrl = (path) => `${BASE_URL}${path}`;

// AUTH ENDPOINTS
export const endpoints = {
  SENDOTP_API: buildApiUrl("/auth/sendotp"),
  SIGNUP_API: buildApiUrl("/auth/signup"),
  LOGIN_API: buildApiUrl("/auth/login"),
  RESETPASSTOKEN_API: buildApiUrl("/auth/reset-password-token"),
  RESETPASSWORD_API: buildApiUrl("/auth/reset-password"),
};

// PROFILE ENDPOINTS
export const profileEndpoints = {
  GET_USER_DETAILS_API: buildApiUrl("/profile/getUserDetails"),
  GET_USER_ENROLLED_COURSES_API: buildApiUrl("/profile/getEnrolledCourses"),
  GET_ALL_INSTRUCTOR_DASHBOARD_DETAILS_API: buildApiUrl(
    "/profile/getInstructorDashboardDetails"
  ),
  GET_PENDING_INSTRUCTORS_API: buildApiUrl("/profile/pending-instructors"),
  APPROVE_INSTRUCTOR_API: buildApiUrl("/profile/approve-instructor"),
  REJECT_INSTRUCTOR_API: buildApiUrl("/profile/reject-instructor"),
};

// STUDENTS ENDPOINTS
export const studentEndpoints = {
  COURSE_PAYMENT_API: buildApiUrl("/payment/capturePayment"),
  COURSE_VERIFY_API: buildApiUrl("/payment/verifyPayment"),
  SEND_PAYMENT_SUCCESS_EMAIL_API: buildApiUrl("/payment/sendPaymentSuccessEmail"),
};

// COURSE ENDPOINTS
export const courseEndpoints = {
  GET_ALL_COURSE_API: buildApiUrl("/course/getAllCourses"),
  COURSE_DETAILS_API: buildApiUrl("/course/getCourseDetails"),
  EDIT_COURSE_API: buildApiUrl("/course/editCourse"),
  COURSE_CATEGORIES_API: buildApiUrl("/course/showAllCategories"),
  CREATE_COURSE_API: buildApiUrl("/course/createCourse"),
  CREATE_SECTION_API: buildApiUrl("/course/addSection"),
  CREATE_SUBSECTION_API: buildApiUrl("/course/addSubSection"),
  UPDATE_SECTION_API: buildApiUrl("/course/updateSection"),
  UPDATE_SUBSECTION_API: buildApiUrl("/course/updateSubSection"),
  GET_ALL_INSTRUCTOR_COURSES_API: buildApiUrl("/course/getInstructorCourses"),
  DELETE_SECTION_API: buildApiUrl("/course/deleteSection"),
  DELETE_SUBSECTION_API: buildApiUrl("/course/deleteSubSection"),
  DELETE_COURSE_API: buildApiUrl("/course/deleteCourse"),
  GET_FULL_COURSE_DETAILS_AUTHENTICATED: buildApiUrl(
    "/course/getFullCourseDetails"
  ),
  LECTURE_COMPLETION_API: buildApiUrl("/course/updateCourseProgress"),
  CREATE_RATING_API: buildApiUrl("/course/createRating"),
  ADD_COURSE_TO_CATEGORY_API: buildApiUrl("/course/addCourseToCategory"),
  SEARCH_COURSES_API: buildApiUrl("/course/searchCourse"),
  CREATE_CATEGORY_API: buildApiUrl("/course/createCategory"),
};

// RATINGS AND REVIEWS
export const ratingsEndpoints = {
  REVIEWS_DETAILS_API: buildApiUrl("/course/getReviews"),
};

// CATAGORIES API
export const categories = {
  CATEGORIES_API: buildApiUrl("/course/showAllCategories"),
};

// CATALOG PAGE DATA
export const catalogData = {
  CATALOGPAGEDATA_API: buildApiUrl("/course/getCategoryPageDetails"),
};
// CONTACT-US API
export const contactusEndpoint = {
  CONTACT_US_API: buildApiUrl("/contact/contactUs"),
};

// SETTINGS PAGE API
export const settingsEndpoints = {
  UPDATE_DISPLAY_PICTURE_API: buildApiUrl("/profile/updateDisplayPicture"),
  UPDATE_PROFILE_API: buildApiUrl("/profile/updateProfile"),
  CHANGE_PASSWORD_API: buildApiUrl("/auth/changepassword"),
  DELETE_PROFILE_API: buildApiUrl("/profile/deleteProfile"),
};
