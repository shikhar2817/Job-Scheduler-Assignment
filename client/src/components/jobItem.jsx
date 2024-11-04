import { Badge } from "./badge";

export const JobItem = ({ job }) => {
    return <div className='flex justify-between bg-gray-200 shadow-xl m-2 p-2 rounded-md'>
        <div className="w-full  truncate text-ellipsis overflow-hidden">
            <span className='text-lg'>{job.name}</span>
            <span className='text-gray-500 text-sm ml-2'>{job.duration / 1000000000} sec</span>
        </div>
        <Badge status={job.status}>{job.status.toUpperCase()}</Badge>
    </div>;
}
