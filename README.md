# backend : Contains all the backend-related files.
* **config/** : Holds configuration files for database, AWS, and JWT.
* **controllers/** : Manages the logic for processing incoming requests.
* **middlewares/** : Middleware functions, including JWT authentication and error handling.
* **models/** : Defines the schema for the database.
* **routes/** : Contains the API routes and groups them logically.
* **services/** : Implements the business logic, which the controllers will call.
* **utils/** : Contains utility functions such as S3 operations and input validation.
* **app.js** : Sets up the Express application.
* **server.js** : Starts the server.
# frontend : Contains the React frontend application.
* **public/** : Static files, with the main `index.html`.
* **src/** : Source code for the React app.
  * **components/** : Holds reusable UI components, grouped by functionality.
  * **services/** : Contains the API service to communicate with the backend.
  * **App.js** : The root component of the React app.
  * **index.js** : Entry point for the React application.
  * **styles/** : Optional directory for styling the application.
