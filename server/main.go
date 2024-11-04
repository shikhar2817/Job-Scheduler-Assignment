package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func main() {
	router := mux.NewRouter()
	router.HandleFunc("/health", getHealth).Methods("GET")

	log.Println("Starting server on :8000")
	log.Fatal(http.ListenAndServe(":8000", router))
}

func getHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte("Server is healthy"))
}
