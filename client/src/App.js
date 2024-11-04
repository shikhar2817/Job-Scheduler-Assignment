import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
    const [jobs, setJobs] = useState([]);
    const [name, setName] = useState("");
    const [duration, setDuration] = useState("");

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await axios.get("http://localhost:8080/jobs");
                setJobs(response.data);
                console.log({ jobs: response.data });
            } catch (error) {
                console.log("Error while getting jobs", error);
            }
        };
        fetchJobs();

        const ws = new WebSocket("ws://localhost:8080/ws");
        ws.onmessage = (event) => {
            const updatedJobs = JSON.parse(event.data);

            setJobs((prevJobs) => {
                const jobMap = new Map(prevJobs.map(job => [job.name, job]));

                updatedJobs.forEach((job) => {
                    jobMap.set(job.name, job);
                });

                return Array.from(jobMap.values());
            });
        };

        return () => ws.close();
    }, []);

    const submitJob = async () => {
        try {
            await axios.post("http://localhost:8080/jobs", { name, duration: Number(duration) });
            setName("");
            setDuration("");
        } catch (error) {
            console.log("Error while submitting form", error);
        }

    };

    return (
        <div className="App">
            <h1>Job Scheduler</h1>
            <form onSubmit={(e) => { e.preventDefault(); submitJob(); }}>
                <input type="text" placeholder="Job Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <input type="number" placeholder="Duration (seconds)" value={duration} onChange={(e) => setDuration(e.target.value)} required />
                <button type="submit">Add Job</button>
            </form>
            <ul>
                {jobs.map((job, index) => (
                    <li key={index}>
                        <strong>{job.name}</strong> - Duration: {job.duration / 1000000000}s - Status: {job.status}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default App;
