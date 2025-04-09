# Auth Autor React Vite

This project is a React application powered by Vite, integrated with Laravel for backend authentication and authorization using Spatie's Permission package.

## Prerequisites

- PHP >= 8.0
- Composer
- Node.js >= 14.x
- NPM or Yarn

## Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:SophaHum/auth-author-lara-react-inertia.git
   cd auth-author-lara-react-inertia
   ```

2. Install backend dependencies:
   ```bash
   composer install
   ```

3. Install frontend dependencies:
   ```bash
   npm install
   ```

4. Copy the `.env.example` file to `.env` and configure your environment variables:
   ```bash
   cp .env.example .env
   ```

5. Set up SQLite as the database:
   - In the `.env` file, set the database connection to SQLite:
     ```
     DB_CONNECTION=sqlite
     ```
   - Create the SQLite database file:
     ```bash
     touch database/database.sqlite
     ```

6. Generate the application key:
   ```bash
   php artisan key:generate
   ```

7. Run database migrations and seeders:
   ```bash
   php artisan migrate --seed
   ```

8. Start the development server:
   - For the backend:
     ```bash
     php artisan serve
     ```
   - For the frontend:
     ```bash
     npm run dev
     ```

## Features

- Role-based access control using Spatie's Permission package.
- Predefined roles: Admin, Manager, Editor, and User.
- Predefined permissions for managing users, products, and categories.

## Seeder Details

- **PermissionTableSeeder**: Seeds all permissions.
- **CreateAdminUserSeeder**: Creates an admin user with all permissions.
- **UserRoleSeeder**: Creates Manager, Editor, and User roles with sample users.

### Example

- **php artisan db:seed**

## Usage

- Access the application at `http://localhost:3000` (frontend) and `http://localhost:8000` (backend).
- Use the following credentials to log in as an admin:
  - Email: `admin@gmail.com`
  - Password: `12345678`

## License

This project is open-source and available under the [MIT License](LICENSE).
