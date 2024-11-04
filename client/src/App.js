import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Input, JobItem } from './components';

const App = () => {
    const [jobs, setJobs] = useState([]);
    const [name, setName] = useState("");
    const [duration, setDuration] = useState("");

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await axios.get("http://localhost:8080/jobs");
                console.log({ jobs: response.data });
                const updatedJobs = response.data;
                setJobs((prevJobs) => {
                    const jobMap = new Map(prevJobs.map(job => [job.name, job]));
                    updatedJobs.forEach((job) => {
                        jobMap.set(job.name, job);
                    });
                    return Array.from(jobMap.values());
                });


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
        <div className='bg-gray-400 h-screen w-screen p-10'>
            <h1 className='text-center text-5xl font-bold mb-3'>Job Scheduler</h1>
            <form className='grid md:grid-flow-col grid-flow-row max-w-xl ml-auto mr-auto' onSubmit={(e) => { e.preventDefault(); submitJob(); }}>
                <Input type="text" placeholder="Job Name" maxLength={30} value={name} onChange={(e) => setName(e.target.value)} required />
                <Input type="number" placeholder="Duration (seconds)" value={duration} onChange={(e) => setDuration(e.target.value)} required />
                <Button type="submit">Add Job</Button>
            </form>
            <div className='max-w-2xl ml-auto mr-auto mt-3'>
                {jobs.length} Jobs
            </div>
            <ul className='max-w-2xl ml-auto mr-auto mt-3 h-[70%] overflow-scroll'>
                {jobs.map((job, index) => <JobItem key={index} job={job} />)}
            </ul>
        </div>
    );
};

export default App;
