# Environment Configuration

## Backend (`quests/backend/.env`)

1. Copy `quests/backend/.env.example` to `quests/backend/.env`.
2. Fill in the values for your deployment:
   - `DJANGO_SECRET_KEY`, `DJANGO_DEBUG`, `DJANGO_ALLOWED_HOSTS`, `DJANGO_STATIC_URL`, `DJANGO_MEDIA_URL`
   - Database connection parameters (`POSTGRES_*`)
   - CORS flags (`CORS_ALLOWED_ORIGINS`, `CORS_ALLOW_CREDENTIALS`, `CORS_ALLOW_ALL_ORIGINS`)
   - Reservation throttling knobs (`ORDER_RATE_LIMIT_MAX_ATTEMPTS`, `ORDER_RATE_LIMIT_WINDOW_MINUTES`)
   - Automation knobs (`AUTO_SCHEDULE_*`, `AUTO_SCHEDULE_CLEANUP_*`, `AUTO_SCHEDULE_KEEP_DAYS`)
   - Celery connection and execution settings (`CELERY_*`)
3. Django loads the file automatically via `python-dotenv`, so `python manage.py ...` will pick up the values with no extra flags.

## Frontend (`quests/frontend/.env`)

1. Copy `quests/frontend/.env.example` to `quests/frontend/.env`.
2. Set `REACT_APP_PATH_URL_API` to the full URL of the backend API (for example `http://localhost:8000/api`).
3. Create React App reads this file at build time (`npm start`, `npm test`, `npm run build`). Restart dev servers after making changes.

## Testing Notes

- Frontend unit tests set a sensible default API URL via `src/setupTests.js`, so Jest continues to work without extra configuration.
- Backend tests rely on the same `.env` file as the runtime environment. Use a dedicated override if you need different credentials (e.g. `pytest --ds=quests.settings` while pointing to a test database).

## Docker workflow

1. Ensure Docker Desktop (or another OCI-compatible runtime) is running.
2. Prepare `quests/backend/.env` as described above. The compose file overrides host-specific values (`POSTGRES_HOST=db`, `CELERY_BROKER_URL=redis://redis:6379/0`, etc.), so you can keep `localhost` defaults in the file.
3. From the repository root (`quests/`), run `docker compose up --build`. This starts PostgreSQL, Redis, Django (`backend`), a Celery worker, Celery beat, and the static React frontend.
4. Visit `http://localhost:8000/admin` (backend) and `http://localhost:3000` (frontend). Uploaded media is stored in the host `images/` folder; database data is persisted via the `postgres_data` volume.
5. To rebuild the React app with a different API URL, set `REACT_APP_PATH_URL_API` before running `docker compose build frontend` (for example `REACT_APP_PATH_URL_API=http://localhost:8000/api docker compose build frontend`).
