import "@testing-library/jest-dom";

if (!process.env.REACT_APP_PATH_URL_API) {
  process.env.REACT_APP_PATH_URL_API = "http://127.0.0.1:8000/api";
}
