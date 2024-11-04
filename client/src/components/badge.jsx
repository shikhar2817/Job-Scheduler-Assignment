export const Badge = ({ children, status, ...props }) => {
    switch (status) {
        case 'pending':
            return <span class="bg-red-300 text-red-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded-full" {...props}>{children}</span>;

        case 'running':
            return <span class="bg-orange-300 text-orange-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded-full" {...props}>{children}</span>;
        case 'completed':
            return <span class="bg-green-300 text-green-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded-full" {...props}>{children}</span>;
        default:
            return <span class="bg-blue-300 text-blue-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded-full" {...props}>{children}</span>;
    }
}
