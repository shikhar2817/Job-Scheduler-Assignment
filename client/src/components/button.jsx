export const Button = ({ children, ...props }) => {
    return <button className='col-span-1 m-1 rounded-md bg-gray-700 text-white p-1' {...props}>{children}</button>
}
