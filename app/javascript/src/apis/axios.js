import axios from "axios";
import { Toastr } from "neetoui";

axios.defaults.baseURL = "/";

export const setAuthHeaders = (setLoading = () => null) => {
  axios.defaults.headers = {
    Accept: "applicaion/json",
    "Content-Type": "application/json",
    "X-CSRF-TOKEN": document.querySelector('[name="csrf-token"]').getAttribute('content'),
  };
  const token = JSON.parse(localStorage.getItem("authToken"));
  const email = JSON.parse(localStorage.getItem("authEmail"));
  if (token && email) {
    axios.defaults.headers["X-Auth-Email"] = email;
    axios.defaults.headers["X-Auth-Token"] = token;
  }
  setLoading(false);
};

export const resetAuthTokens = () => {
  delete axios.defaults.headers["X-Auth-Email"];
  delete axios.defaults.headers["X-Auth-Token"];
};

const handleSuccessResponse = response => {
  if (response) {
    response.success = response.status === 200;
    if (response.data.notice) {
      // Toastr.success(response.data.notice);
    }
  }
  return response;
};

const handleErrorResponse = (error, authDispatch) => {
  if (error.response?.status === 401) {
    authDispatch({ type: "LOGOUT" });
    Toastr.error(error.response?.data?.error);
  } else {
    Toastr.error(error.response?.data?.error || error.message);
  }
  return Promise.reject(error);
};

export const registerIntercepts = authDispatch => {
  axios.interceptors.response.use(handleSuccessResponse, error =>
    handleErrorResponse(error, authDispatch)
  );
};
