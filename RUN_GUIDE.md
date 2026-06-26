# Beginner's Guide: Running the Expense Tracker in VS Code

Welcome! This guide is written specifically for beginners. It explains exactly how to run both the Django backend and the Angular frontend in Visual Studio Code (VS Code), even if you have zero prior experience with Python, Django, or Angular.

---

## 📋 Prerequisites & Installation

Before running the project, you need the following tools installed on your computer. If you don't have them, here is how to get them:

1. **Python**: Installed automatically during setup.
2. **Node.js & npm**: Already installed on your computer.
3. **VS Code**: Installed on your computer.
4. **PostgreSQL**: You need a running PostgreSQL database server.
   - **Download**: [PostgreSQL Installer for Windows](https://www.postgresql.org/download/windows/)
   - **Password**: During installation, you will set a password for the `postgres` user. Remember this password!

---

## 🐘 Step 1: Create your PostgreSQL Database

Before running Django, you must create a database named `expense_tracker` in PostgreSQL:

1. Open **pgAdmin 4** (the database manager installed with PostgreSQL) or open a command prompt and run `psql -U postgres`.
2. Connect using the password you set during installation.
3. Right-click on **Databases** and select **Create** -> **Database...**
4. Enter the name: `expense_tracker` and click **Save**.

### Configure Your Credentials
Open the file **`.env`** in the root directory of this project in VS Code, and update the values to match your database settings:
```env
DB_NAME=expense_tracker
DB_USER=postgres
DB_PASSWORD=YOUR_PASSWORD_HERE   <-- Change this to your password
DB_HOST=localhost
DB_PORT=5432
```

---

## 🐍 Step 2: Running the Django Backend

Django acts as the backend server. It handles registrations, logins, and stores all transactions.

1. **Open the project folder in VS Code**:
   - Go to VS Code: `File` -> `Open Folder...`
   - Select `d:\c data\Expense-tracker`.

2. **Open a Terminal**:
   - In VS Code, go to the top menu: `Terminal` -> `New Terminal`.
   - You should see a command prompt at the bottom of the screen.

3. **Run Database Migrations**:
   - Copy and paste this command into the terminal and press **Enter**:
     ```powershell
     python manage.py migrate
     ```
   - This command connects to PostgreSQL and creates all the tables (users, login tokens, transactions).

4. **Start the Backend Server**:
   - Run this command in the terminal and press **Enter**:
     ```powershell
     python manage.py runserver
     ```
   - You should see text saying `Starting development server at http://127.0.0.1:8000/`.
   - **Important**: Do not close this terminal! The backend must stay running.

---

## 🅰️ Step 3: Running the Angular Frontend

Angular acts as the user interface (the buttons, inputs, statistics, and theme toggle).

1. **Open a Second Terminal in VS Code**:
   - In VS Code, look at the terminal panel. On the right side of the terminal tab, click the **`+`** icon (or dropdown next to it) to open a new, clean command prompt.
   - You now have two terminals: one running Django, and one for Angular.

2. **Navigate to the frontend directory**:
   - Copy and paste this command in the *second* terminal and press **Enter**:
     ```powershell
     cd frontend
     ```

3. **Start the Frontend Development Server**:
   - Run this command in the terminal and press **Enter**:
     ```powershell
     npm start
     ```
   - This compiles the Angular application and starts the server.
   - Once it finishes loading, it will output: `Local: http://localhost:4200`.

---

## 🌐 Step 4: Open in Your Browser

1. Open your web browser (Chrome, Edge, Firefox).
2. Go to: **`http://localhost:4200`**
3. You will see the gorgeous, glassmorphic **Create Account / Sign In** page!
4. **Register** a new username and password. The application will log you in automatically, and you can start adding transactions immediately!

---

## 🛠️ Troubleshooting

- **Database Connection Refused Error**:
  - Make sure your PostgreSQL server is running.
  - Double check that the username, password, and port in the `.env` file match pgAdmin.
  - Verify that you created a database named exactly `expense_tracker`.
- **Python command not found**:
  - If VS Code says `python` is not recognized, restart VS Code to reload the PATH variables.
- **Port 8000 already in use**:
  - If another application is using port 8000, you can run Django on a different port:
    `python manage.py runserver 8080` (then update `apiUrl` in `frontend/src/app/services/auth.service.ts` and `transaction.service.ts` to point to port 8080).
