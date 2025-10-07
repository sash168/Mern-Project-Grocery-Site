import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast';

const InputField = ({ type, placeholder, name, handleChange, address }) => (
    <input
        className='w-full px-3 py-2 border border-gray-500/30 rounded outline-none text-gray-500 focus:border-primary transition'
        type={type}
        placeholder={placeholder}
        onChange={handleChange}
        name={name}
        value={address[name]}
        required
    />
)

function AddAddress() {
    const [address, setAddress] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        country: '',
        zipcode: '',
        phone:''
    })

    const { axios, user, navigate } = useAppContext();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }))
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('/api/address/add', { address })
            if (data.success) {
                toast.success(data.message);
                navigate('/cart')
            } else {
                toast.error(data.message);            
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    useEffect(() => {
        if (!user) navigate('/cart')
    }, [])

    return (
        <div className='mt-16 pb-16 px-4 md:px-16'>
            <p className='text-2xl md:text-3xl text-gray-500'>
                Add Shipping <span className='font-semibold text-primary'>Address</span>
            </p>
            <div className='flex flex-col-reverse md:flex-row justify-between items-center mt-10 gap-8'>
                {/* Form */}
                <div className='flex-1 max-w-md w-full'>
                    <form onSubmit={onSubmitHandler} className='space-y-4 text-sm'>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <InputField handleChange={handleChange} address={address} name='firstName' type='text' placeholder='First Name' />
                            <InputField handleChange={handleChange} address={address} name='lastName' type='text' placeholder='Last Name' />
                        </div>
                        <InputField handleChange={handleChange} address={address} name='email' type='email' placeholder='Email Address' />
                        <InputField handleChange={handleChange} address={address} name='street' type='text' placeholder='Street' />
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <InputField handleChange={handleChange} address={address} name='city' type='text' placeholder='City' />
                            <InputField handleChange={handleChange} address={address} name='state' type='text' placeholder='State' />  
                        </div>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <InputField handleChange={handleChange} address={address} name='zipcode' type='number' placeholder='Zip Code' />
                            <InputField handleChange={handleChange} address={address} name='country' type='text' placeholder='Country' />  
                        </div>
                        <InputField handleChange={handleChange} address={address} name='phone' type='text' placeholder='Phone Number' />

                        <button className='w-full mt-6 bg-primary text-white py-3 hover:bg-dull-primary transition cursor-pointer uppercase'>
                            Save Address
                        </button>
                    </form> 
                </div>

                {/* Image */}
                <div className='flex-1 max-w-md w-full'>
                    <img className='w-full h-auto object-contain' src={assets.add_address_iamge} alt="Add address" />
                </div>
            </div>
        </div>
    )
}

export default AddAddress
