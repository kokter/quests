# Переменные окружения

## Backend (`quests/backend/.env`)

### Django и статические файлы
- `DJANGO_SECRET_KEY` — криптографический ключ Django; требуется для подписи сессий и CSRF-токенов.
- `DJANGO_DEBUG` — включает/выключает режим отладки (в проде ставим `0`, иначе будут подробные stack trace).
- `DJANGO_ALLOWED_HOSTS` — список доменов/адресов, с которых разрешены запросы к серверу.
- `DJANGO_STATIC_URL` — базовый URL для статических файлов (используется при раздаче собранного фронта).
- `DJANGO_MEDIA_URL` — URL-префикс для пользовательских медиа (должен совпадать с тем, что прокидывается nginx/docker в `images/`).

### Подключение к базе PostgreSQL
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` — имя БД и учётка, под которой Django и Celery подключаются к Postgres.
- `POSTGRES_HOST`, `POSTGRES_PORT` — адрес и порт Postgres (локально `localhost:5432`, в Docker — `db:5432`).

### CORS/CSRF
- `CORS_ALLOWED_ORIGINS` — список фронтенд-URL, которым можно читать API через браузер.
- `CORS_ALLOW_CREDENTIALS` — если `1`, браузер может слать cookies/Authorization заголовки.
- `CORS_ALLOW_ALL_ORIGINS` — глобально открывает CORS (используется только на dev).
- `CSRF_TRUSTED_ORIGINS` — домены, для которых Django принимает CSRF cookie (актуально для админки и DRF форм).

### Лимиты заявок
- `ORDER_RATE_LIMIT_MAX_ATTEMPTS` — сколько попыток бронирования разрешено с одного IP за окно (используется в `order/viewsets/order.py`).
- `ORDER_RATE_LIMIT_WINDOW_MINUTES` — длительность окна в минутах.

### Автогенерация и очистка расписаний (Celery Beat)
- `AUTO_SCHEDULE_ENABLED` — включает задачу `auto-generate-schedule`.
- `AUTO_SCHEDULE_DAY_OF_WEEK`, `AUTO_SCHEDULE_HOUR`, `AUTO_SCHEDULE_MINUTE` — crontab настройки для генерации (например, `sun 04:00` заполняет будущие недели).
- `AUTO_SCHEDULE_WEEKS_AHEAD` — сколько недель вперёд создавать расписания (используется и CLI-командой, и задачей).
- `AUTO_SCHEDULE_CLEANUP_ENABLED` — включает задачу очистки старых слотов.
- `AUTO_SCHEDULE_CLEANUP_DAY_OF_WEEK`, `AUTO_SCHEDULE_CLEANUP_HOUR`, `AUTO_SCHEDULE_CLEANUP_MINUTE` — crontab для очистки.
- `AUTO_SCHEDULE_KEEP_DAYS` — сколько дней истории хранить до удаления.

### Celery
- `CELERY_BROKER_URL` — адрес брокера сообщений (локально `redis://localhost:6379/0`, в docker `redis://redis:6379/0`).
- `CELERY_RESULT_BACKEND` — куда складывать результаты задач (если пусто, Celery использует брокер).
- `CELERY_DEFAULT_QUEUE` — имя очереди по умолчанию для всех задач.
- `CELERY_TASK_TIME_LIMIT` — максимальная длительность выполнения задачи в секундах.

## Frontend (`quests/frontend/.env`)
- `REACT_APP_PATH_URL_API` — базовый URL REST API. Значение прокидывается в `src/config.js` и используется всеми `fetch` вызовами (лендинг, модалки, заказы). CRA читает переменную только на этапе сборки/старта dev-сервера, поэтому после изменения обязательно перезапускайте `npm start` или `npm run build`.
