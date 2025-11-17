const API_BASE_URL = process.env.REACT_APP_PATH_URL_API;

if (!API_BASE_URL) {
  throw new Error(
    "REACT_APP_PATH_URL_API is not defined. Please configure it in quests/frontend/.env"
  );
}

export { API_BASE_URL };
