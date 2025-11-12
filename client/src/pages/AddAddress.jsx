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
    />
)

const DropdownField = ({ name, options, handleChange, value, placeholder }) => (
    <select
        className='w-full px-3 py-2 border border-gray-500/30 rounded outline-none text-gray-500 focus:border-primary transition'
        name={name}
        value={value}
        onChange={handleChange}
    >
        <option value="">{placeholder || 'Select'}</option>
        {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
    </select>
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
        phone: ''
    })

    // Local only for dropdown control (not saved in DB)
    const [day, setDay] = useState('');

    const { axios, user, navigate } = useAppContext();

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'day') {
            setDay(value);
            setAddress(prev => ({ ...prev, street: '' })); // reset street when day changes
        } else {
            setAddress(prev => ({ ...prev, [name]: value }));
        }
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        // ✅ Frontend validation before hitting backend
        if (!address.firstName.trim()) return toast.error("First name is required");
        if (!address.lastName.trim()) return toast.error("Last name is required");
        if (!day) return toast.error("Please select a delivery day");
        if (!address.street) return toast.error("Please select a delivery location");
        if (!address.zipcode) return toast.error("Zipcode is required");
        if (!address.phone.trim()) return toast.error("Phone number is required");

        try {
            const { data } = await axios.post('/api/address/add', { address: { ...address, day } });

            if (data.success) {
            toast.success(data.message);
            navigate('/cart');
            } else {
            toast.error(data.message || "Failed to add address");
            }
        } catch (error) {
            console.error("Address save error:", error);
            const msg = error.response?.data?.message || "Something went wrong. Please check your details.";
            toast.error(msg);
        }
    };


    useEffect(() => {
        if (!user) navigate('/cart')
    }, [])

    const dayOptions = [
        { value: 'Sunday', label: '1 - Sunday' },
        { value: 'Monday', label: '2 - Monday' },
        { value: 'Tuesday', label: '3 - Tuesday' },
        { value: 'Wednesday', label: '4 - Wednesday' },
        { value: 'Thursday', label: '5 - Thursday' },
    ];


    const subDayOptions = {
        Sunday: [
            { value: 'Bhimpur', label: 'Bhimpur' },
            { value: 'Aska', label: 'Aska' },
            { value: 'Brahmapur', label: 'Brahmapur' },
            { value: 'Purushotampur', label: 'Purushotampur' },
        ],
        Monday: [
            { value: 'Task 1', label: 'Task 1' },
            { value: 'Task 2', label: 'Task 2' },
            { value: 'Task 3', label: 'Task 3' },
        ],
        Tuesday: [
            { value: 'Zone A', label: 'Zone A' },
            { value: 'Zone B', label: 'Zone B' },
            { value: 'Zone C', label: 'Zone C' },
        ],
        Wednesday: [
            { value: 'North Area', label: 'North Area' },
            { value: 'South Area', label: 'South Area' },
            { value: 'East Area', label: 'East Area' },
        ],
        Thursday: [
            { value: 'Custom Option 1', label: 'Custom Option 1' },
            { value: 'Custom Option 2', label: 'Custom Option 2' },
            { value: 'Custom Option 3', label: 'Custom Option 3' },
        ],
        };

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
                            <InputField handleChange={handleChange} address={address} name='firstName' type='text' placeholder='First Name *' />
                            <InputField handleChange={handleChange} address={address} name='lastName' type='text' placeholder='Last Name *' />
                        </div>
                        <InputField handleChange={handleChange} address={address} name='email' type='email' placeholder='Email Address' />

                        {/* Replace Street input with dropdowns */}
                        <DropdownField
                            name='day'
                            options={dayOptions}
                            handleChange={handleChange}
                            value={day}
                            placeholder="Select Day"
                        />

                        {day && (
                            <DropdownField
                                name='street'
                                options={subDayOptions[day] || []}
                                handleChange={handleChange}
                                value={address.street}
                                placeholder="Select Location"
                            />
                        )}

                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <InputField handleChange={handleChange} address={address} name='city' type='text' placeholder='City' />
                            <InputField handleChange={handleChange} address={address} name='state' type='text' placeholder='State' />  
                        </div>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <InputField handleChange={handleChange} address={address} name='zipcode' type='number' placeholder='Zip Code *' />
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
