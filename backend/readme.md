# Follow these steps to run the project:

1. cd to the project directory

2. Setup the Docker Services:
    ```bash
    docker-compose up -d
    ```

3. Access the project at http://localhost:3001

4. Open Postman and test the API endpoints.

5. Open Prisma Studio to manage the database.
    ```bash
    docker exec -it nodejs-app npx prisma studio --port 5555
    ```

6. Access the BullMQ Dashboard at http://localhost:3001/bullboard

### Running Tests

1. Navigate to the project directory:
    ```bash
    cd test-task
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Setup the Docker Services:
    ```bash
    docker-compose up -d redis mysql
    ```

4. Copy Env File (Create .env file):
    ```bash
    cp .env.sample .env
    ```

5. Run the Prisma Setup:
    ```bash
    # Generate Prisma Client based on the schema
    npm run prisma:generate

    # Apply migrations
    npm run prisma:migrate
    ```

6. Run the Tests:
    ```bash
    npm run test
    ```

### Common Issues

1. Prisma: Make sure you have the latest version of Prisma installed/prisma cli is installed. And run `npm run prisma:migrate` to apply migrations.

2. Docker: Make sure you have Docker installed and running. With Docker installed, you can run `docker-compose up -d` to start the services. And Check if Reddis and MySQL are running.
