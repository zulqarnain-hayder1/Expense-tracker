# Expense Tracker

A full-stack personal finance management app built with **Django REST Framework** and **Angular 17**, featuring JWT authentication, category based expense tracking, and interactive chart visualizations.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 17, Chart.js, SCSS |
| Backend | Django 5, Django REST Framework |
| Auth | JWT (SimpleJWT) |
| Database | SQLite (dev) / PostgreSQL (prod) |

---

## Features

- 🔐 JWT-based login & auth guard
- ➕ Add income & expense transactions
- 🏷️ Category tagging & filtering
- 📅 Month-by-month breakdown
- 📊 Doughnut chart — expenses by category
- 💰 Live balance, income & expense summary cards
---


## Project Structure

expense-tracker/

├── backend/          # Django project settings

├── expenses/         # Django app (models, views, serializers)

├── frontend/         # Angular 17 SPA

└── manage.py



---

## Getting Started

### Backend

```bash
cd expense-tracker
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
ng serve
```

App runs at → `http://localhost:4200`  
API runs at → `http://localhost:8000`

---

## Default API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login/` | Get JWT tokens |
| GET/POST | `/api/transactions/` | List or create transactions |
| GET | `/api/transactions/summary/` | Monthly summary + chart data |
| GET/POST | `/api/categories/` | Manage categories |

---

## Author

**Zulqarnain Hayder**  
Software Engineering Student @CUI
