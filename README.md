# Job-Scheduler-Assignment

## How to setup project locally
- Step 1: Clone the repo

### Setting up Server/Backend
- Step 1: Open terminal
- Step 2: Move to client directory by running `cd server` command
- Step 3: Install required dependencies by running
```bash
go get -u github.com/gorilla/mux
go get -u github.com/gorilla/websocket
```
- Step 4: Run the server by running `go run main.go` command
- Note: Your server will be running on `http://localhost:8080/`


### Setting up Client/Frontend
- Step 1: Open terminal
- Step 2: Move to client directory by running `cd client` command
- Step 3: Install required dependencies by running `npm install` command
- Step 4: Run the client by running `npm start` command
- Note: Your server will be running on `http://localhost:3000/`
