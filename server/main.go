package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

type Job struct {
	Name     string        `json:"name"`
	Duration time.Duration `json:"duration"`
	Status   string        `json:"status"`
}

var (
	jobs          = []*Job{}
	jobsMutex     = sync.Mutex{}
	wsClients     = make(map[*websocket.Conn]bool)
	wsUpgrader    = websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}
	newJobChannel = make(chan *Job)
)

func main() {
	router := mux.NewRouter().StrictSlash(true)
	router.Use(corsMiddleware)

	router.HandleFunc("/health", getHealth).Methods("GET")
	router.HandleFunc("/jobs", getJobs).Methods("GET")
	router.HandleFunc("/jobs", postJob).Methods("POST", "OPTIONS")
	router.HandleFunc("/ws", wsHandler)

	go jobScheduler()

	log.Println("Starting server on :8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}

// CORS Middleware to allow cross-origin requests
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "*")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// GET /health - Check if server is healthy
func getHealth(w http.ResponseWriter, r *http.Request) {
	log.Fatalln("GET /health")
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte("Server is healthy"))
}

// GET /jobs - Get list of jobs
func getJobs(w http.ResponseWriter, r *http.Request) {
	log.Println("GET /jobs")
	jobsMutex.Lock()
	defer jobsMutex.Unlock()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(jobs)
}

// POST /jobs - Submit a new job
func postJob(w http.ResponseWriter, r *http.Request) {
	log.Println("POST /jobs")
	var job Job
	if err := json.NewDecoder(r.Body).Decode(&job); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}
	job.Status = "pending"
	job.Duration *= time.Second

	jobsMutex.Lock()
	jobs = append(jobs, &job)
	jobsMutex.Unlock()

	newJobChannel <- &job
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(job)
}

// WebSocket Handler
func wsHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("WebSocket")
	conn, err := wsUpgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket error:", err)
		return
	}
	defer conn.Close()
	wsClients[conn] = true

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			log.Println("WebSocket disconnect:", err)
			delete(wsClients, conn)
			break
		}
	}
}

// Send job updates to WebSocket clients
func broadcastJobUpdate() {
	log.Println("Broadcast Job Updates")
	jobsMutex.Lock()
	defer jobsMutex.Unlock()

	for client := range wsClients {
		if err := client.WriteJSON(jobs); err != nil {
			log.Println("WebSocket error:", err)
			client.Close()
			delete(wsClients, client)
		}
	}
}

// Job Scheduler implementing SJF
func jobScheduler() {
	log.Println("Job Scheduler")
	for {
		select {
		case job := <-newJobChannel:
			jobsMutex.Lock()
			jobs = append(jobs, job)
			jobsMutex.Unlock()

			go func(j *Job) {
				time.Sleep(j.Duration)
				jobsMutex.Lock()
				j.Status = "completed"
				jobsMutex.Unlock()
				broadcastJobUpdate()
			}(job)
			broadcastJobUpdate()
		}
	}
}
