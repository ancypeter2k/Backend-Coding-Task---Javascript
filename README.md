# Assembly Inventory Management System

## Project Description

This is a backend service for managing an inventory of assembly parts. It supports both raw and assembled parts, allowing for nested assemblies (sub-assemblies within sub-assemblies). The system includes user authentication with role-based access control, prevents circular dependencies in assembled parts, and ensures data consistency through atomic database transactions.

## Features

- **User Authentication:** Register and log in users with different roles (`CREATOR`, `VIEWER`).
- **Role-Based Access Control (RBAC):** Restrict access to certain functionalities based on user roles.
- **Part Management:**
  - Create raw and assembled parts.
  - Support for nested assemblies (e.g., a "Car" assembly can contain a "Engine" assembly, which contains "Pistons" raw parts).
  - Add inventory quantities to both raw and assembled parts.
  - Automatic deduction of sub-part quantities when an assembled part's inventory is increased.
- **Circular Dependency Prevention:** Detects and prevents the creation of assembled parts that would lead to circular dependencies (e.g., Part A requires Part B, and Part B requires Part A).
- **Atomic Operations:** Utilizes database transactions to ensure data consistency during complex operations like adding inventory to assembled parts.
- **ES6 Module Support:** The codebase uses modern ES6 module syntax (`import/export`).

## Technologies Used

- **Node.js:** JavaScript runtime environment.
- **Express.js:** Web application framework for Node.js.
- **PostgreSQL:** Relational database.
- **Sequelize.js:** Object-Relational Mapper (ORM) for Node.js and PostgreSQL.
- **`bcryptjs`:** For hashing and comparing passwords.
- **`jsonwebtoken`:** For generating and verifying JWT tokens for authentication.
- **`dotenv`:** For loading environment variables from a `.env` file.
- **`nodemon`:** For automatically restarting the Node.js application during development.

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher recommended)
- PostgreSQL (database server)

### 1. Clone the Repository

```bash
git clone https://github.com/ancypeter2k/Backend-Coding-Task---Javascript.git
cd assembly-inventory
```

(Replace `<repository_url>` with the actual URL of your repository)

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

1.  **Create a PostgreSQL Database:**
    Open your PostgreSQL client (e.g., `psql`) and create a new database.

    ```sql
    CREATE DATABASE assembly_db;
    ```

2.  **Create a PostgreSQL User (if needed):**
    If you don't have a user with appropriate permissions, you can create one. For this project, we've used a user named `ancy`. If your PostgreSQL is set up to allow your OS user to connect without a password, you might not need to explicitly create a user with a password. Otherwise:
    ```sql
    CREATE USER ancy WITH PASSWORD 'your_secure_password';
    ALTER DATABASE assembly_db OWNER TO ancy;
    GRANT ALL PRIVILEGES ON DATABASE assembly_db TO ancy;
    ```
    (Replace `your_secure_password` with a strong password)

### 4. Environment Variables (`.env` file)

Create a `.env` file in the `assembly-inventory` directory with the following content:

```
PORT=5001
DB_NAME=assembly_db
DB_USER=ancy
DB_PASSWORD=your_secure_password  # Only if you set a password for the 'ancy' user
DB_HOST=localhost
JWT_SECRET=supersecretjwtkey
JWT_EXPIRES_IN=1h
```

(Adjust `DB_PASSWORD` and `JWT_SECRET` as necessary.)

### 5. Run the Application

```bash
npm run dev
```

The server should start and be accessible at `http://localhost:5001`. You should see `Database connected` and `Server running on port: http://localhost:5001` in your terminal.

## API Endpoints

You can use a tool like Postman, Insomnia, or `curl` to test the API endpoints.

### Authentication Endpoints (`/api/auth`)

#### 1. Register a User

- **URL:** `/api/auth/register`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
  ```json
  {
    "username": "your_username",
    "password": "your_password",
    "role": "CREATOR" // Or "VIEWER". Must be uppercase.
  }
  ```
- **Success Response:** `201 Created`
  ```json
  {
    "id": "uuid-of-user",
    "username": "your_username",
    "role": "CREATOR"
  }
  ```

#### 2. Log in a User

- **URL:** `/api/auth/login`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
  ```json
  {
    "username": "your_username",
    "password": "your_password"
  }
  ```
- **Success Response:** `200 OK`
  ```json
  {
    "token": "your-jwt-token"
  }
  ```
  **Save this token** as it's required for authenticated requests.

### Part Management Endpoints (`/api/part`)

All part management endpoints require authentication. Include `Authorization: Bearer YOUR_JWT_TOKEN` in the headers.

#### 1. Create a Part (RAW or ASSEMBLED)

- **URL:** `/api/part`
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_JWT_TOKEN` (Requires `CREATOR` role)
- **Body (JSON) - Raw Part Example:**
  ```json
  {
    "name": "Bolt M8",
    "type": "RAW"
  }
  ```
- **Body (JSON) - Assembled Part Example:**
  ```json
  {
    "name": "Gearbox Assembly",
    "type": "ASSEMBLED",
    "parts": [
      {
        "id": "id-of-bolt-m8", // Must be an existing RAW part ID
        "quantity": 4
      },
      {
        "id": "id-of-shaft", // Must be an existing RAW part ID
        "quantity": 2
      }
    ]
  }
  ```
  _Note: For `ASSEMBLED` parts, the `id` values in the `parts` array must correspond to existing parts in the database._
- **Success Response:** `201 Created` with the created part object.

#### 2. Add Inventory to a Part

- **URL:** `/api/part/:partId` (e.g., `/api/part/bolt-m8-1758321250372`)
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_JWT_TOKEN` (Requires `CREATOR` role)
- **Body (JSON):**
  ```json
  {
    "quantity": 100
  }
  ```
  _Note: If adding to an `ASSEMBLED` part, this operation will automatically deduct the required sub-parts from their respective inventories._
- **Success Response:** `200 OK` with the updated part object.

#### 3. Get All Parts

- **URL:** `/api/part`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer YOUR_JWT_TOKEN` (Requires `CREATOR` or `VIEWER` role)
- **Success Response:** `200 OK` with an array of all parts.

## Code Structure and Design

The project is structured into standard MERN (MongoDB, Express, React, Node.js) backend components:

- **`config/`:** Database connection setup.
- **`controllers/`:** Handles incoming requests and orchestrates responses.
- **`middlewares/`:** Contains authentication and role-based access control middleware.
- **`models/`:** Defines Sequelize models for `User` and `Part`.
- **`routes/`:** Defines API routes.
- **`services/`:** Contains business logic, including complex operations like circular dependency checks and inventory management for assembled parts.
- **`server.js`:** The entry point of the application.

### OOP Pillars Implementation

The codebase leverages Object-Oriented Programming (OOP) principles to achieve a modular, maintainable, and scalable design:

- **Encapsulation:** This is evident in the clear separation of concerns within classes. For instance:
    *   **Controllers** (e.g., `AuthController`, `PartController`) encapsulate the logic for handling specific API requests, keeping request parsing, validation, and response formatting self-contained.
    *   **Services** (e.g., `PartService`) encapsulate complex business logic, such as inventory management, circular dependency checks, and transaction handling, abstracting these details from the controllers.
    *   **Models** (e.g., `User`, `Part`) encapsulate data structure and database interaction logic (like `validatePassword` in the `User` model, or `beforeCreate` hooks).

- **Inheritance:** The Sequelize models `User` and `Part` demonstrate inheritance. They extend Sequelize's `Model` class, inheriting its properties and methods for database interaction (e.g., `create`, `findOne`, `findByPk`, `save`). This allows for consistent database operations while defining specific attributes and behaviors for each entity.

- **Polymorphism:** While not strictly adhering to interface-based polymorphism as seen in some statically typed languages, the codebase exhibits behavioral polymorphism. For example:
    *   The `addToInventory` method in `PartService` handles different `Part` types (`RAW` vs. `ASSEMBLED`) differently. Depending on the `part.type`, it performs distinct logic (directly adding quantity for `RAW` parts versus recursively deducting sub-parts for `ASSEMBLED` parts). This allows a single method call to behave differently based on the object's type.
    *   Express.js middleware also demonstrates polymorphism, where different middleware functions (`authMiddleware`, `roleMiddleware`) can be chained and execute different logic based on the request context, even though they all conform to the `(req, res, next)` signature.

- **Abstraction:** Abstraction is achieved by hiding complex implementation details behind simpler interfaces. Key examples include:
    *   **Service Layer:** The `PartService` class provides high-level methods like `createPart` or `addToInventory` that abstract away the underlying database operations, transaction management, and complex validation (like circular dependency checks). Controllers interact with these service methods without needing to know their intricate internal workings.
    *   **Sequelize ORM:** Sequelize itself is a powerful abstraction layer over raw SQL queries. Developers interact with JavaScript objects and methods (e.g., `Part.create()`, `User.findOne()`) instead of writing direct database queries, simplifying data access and manipulation.

These OOP principles contribute to a well-organized and understandable codebase, making it easier to extend, test, and maintain.

## Enhancements and Optimizations

- **Optimized Database Queries:** Recursive functions (`checkCircularDependency`, `checkAndDeductSubParts`) now use batch fetching (`findAll` with `Op.in`) to reduce the number of individual database queries, improving performance for deeply nested assemblies.
- **Automated Part ID Generation:** Part IDs are automatically generated using a `beforeCreate` hook in the `Part` model, centralizing the logic and ensuring consistency.
- **Clear Error Handling:** Improved error messages for better debugging and user feedback.
