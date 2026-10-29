[![License](https://img.shields.io/badge/license-GPL%20v3-yellow?color=goldenrod)](https://github.com/immorrtalz/Link/blob/main/LICENSE)

Simple link shortener

---

This project:
- uses SQLite as a database for storing shortened links
- requires a server
- has an ability to have database backups (every 12 hours and on every startup), automatically deleting old ones

.env setup:
```
ENABLE_BACKUPS=true|false
ENABLE_LOGGING=true|false

FULL_HOST=http://localhost:4214
SELF_HOSTNAME=localhost:4214
PORT=4214

DB_PATH=./db/links.db
DB_TABLE_NAME=links

DB_BACKUP_DIR_PATH=./db/backups
DB_MAX_BACKUPS=4

LINK_ID_LENGTH=8
```