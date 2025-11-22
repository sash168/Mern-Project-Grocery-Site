import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast';

const InputField = ({ type, placeholder, name, handleChange, address }) => (
  <input
    className='w-full px-3 py-2 border border-gray-400/30 rounded outline-none text-gray-600 focus:border-primary transition'
    type={type}
    placeholder={placeholder}
    onChange={handleChange}
    name={name}
    value={address[name]}
  />
);

const DropdownField = ({ name, options, handleChange, value, placeholder }) => (
  <select
    className='w-full px-3 py-2 border border-gray-400/30 rounded outline-none text-gray-600 focus:border-primary transition'
    name={name}
    value={value}
    onChange={handleChange}
  >
    <option value="">{placeholder || 'Select'}</option>
    {options.map(opt => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);

function AddAddress() {
  const [day, setDay] = useState('');
  const { axios, user, navigate } = useAppContext();
  const [address, setAddress] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    street: "",
    zipcode: "",
    addressInfo: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'day') {
      setDay(value);
      setAddress(prev => ({ ...prev, street: '' }));
    } else {
      setAddress(prev => ({ ...prev, [name]: value }));
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!address.name.trim()) return toast.error("Name is required");
    if (!day) return toast.error("Please select a delivery day");
    if (!address.street) return toast.error("Please select a location");
    if (!address.zipcode) return toast.error("Pin Code is required");
    if (!address.phone.trim()) return toast.error("Phone number is required");

    try {
      const { data } = await axios.post('/api/address/add', { address: { ...address, day } });

      if (data.success) {
        toast.success(data.message);
        navigate('/cart');
      } else toast.error(data.message);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    if (!user) navigate('/cart');
    setAddress(prev => ({
      ...prev,
      name: user.name || '',
      phone: user.phone || ''
    }));
  }, []);

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
    ],
    Tuesday: [
      { value: 'Zone A', label: 'Zone A' },
      { value: 'Zone B', label: 'Zone B' },
    ],
  };

  return (
    <div className='mt-16 pb-16 px-4 md:px-16'>
      <p className='text-2xl md:text-3xl text-gray-500'>
        Add Shipping <span className='font-semibold text-primary'>Address</span>
      </p>

      <div className='flex flex-col-reverse md:flex-row justify-between items-center mt-10 gap-8'>
        <div className='flex-1 max-w-md w-full'>
          <form onSubmit={onSubmitHandler} className='space-y-4 text-sm'>
            <InputField handleChange={handleChange} address={address} name='name' type='text' placeholder='Name *' />

            <DropdownField
              name='day'
              options={dayOptions}
              handleChange={handleChange}
              value={day}
              placeholder="Select Day *"
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

            <InputField
                handleChange={handleChange}
                address={address}
                name='addressInfo'
                type='text'
                placeholder='Apartment, Landmark, or any additional info (optional)'
                />


            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <InputField handleChange={handleChange} address={address} name='zipcode' type='number' placeholder='Pin Code *' />
              <InputField handleChange={handleChange} address={address} name='phone' type='text' placeholder='Phone Number *' />
            </div>

            <button className='w-full mt-6 bg-primary text-white py-3 hover:bg-dull-primary transition cursor-pointer uppercase'>
              Save Address
            </button>
          </form>
        </div>

        <div className='flex-1 max-w-md w-full'>
          <img className='w-full h-auto object-contain' src={assets.add_address_iamge} alt="Add address" />
        </div>
      </div>
    </div>
  );
}

export default AddAddress;
