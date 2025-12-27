import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext'
import { toast } from 'sonner';

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
    address: "",
    phone: user?.phone || ""
  });


  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "street") {
      setAddress(prev => ({
        ...prev,
        street: value
      }));

      // Auto-set day from selected street
      setDay(streetToDay[value]);
    } else {
      setAddress(prev => ({ ...prev, [name]: value }));
    }
  };


  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!address.name.trim()) return toast.error("Name is required");
    if (!address.address.trim()) return toast.error("Address is required");
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

  const streetToDay = {
    Pandrakhali: "Sunday",
    Pandia: "Sunday",
    Nuagaon: "Sunday",
    Adhaibara: "Sunday",
    Gotopur: "Sunday",
    Jhadabai: "Sunday",
    Gaganapur: "Sunday",

    "Task 1": "Monday",
    "Task 2": "Monday",

    "Zone A": "Tuesday",
    "Zone B": "Tuesday",
  };

  const streetOptions = [
    // Sunday
    { value: "Pandrakhali", label: "Pandrakhali" },
    { value: "Pandia", label: "Pandia" },
    { value: "Nuagaon", label: "Nuagaon" },
    { value: "Adhaibara", label: "Adhaibara" },
    { value: "Gotopur", label: "Gotopur" },
    { value: "Jhadabai", label: "Jhadabai" },
    { value: "Gaganapur", label: "Gaganapur" },


    { value: "Task 1", label: "Task 1" },
    { value: "Task 2", label: "Task 2" },
    { value: "Zone A", label: "Zone A" },
    { value: "Zone B", label: "Zone B" }
  ];



  return (
    <div className='mt-16 pb-16 px-4 md:px-16'>
      <p className='text-2xl md:text-3xl text-gray-500'>
        Add Shipping <span className='font-semibold text-primary'>Address</span>
      </p>

      <div className='flex flex-col-reverse md:flex-row justify-between items-center mt-10 gap-8'>
        <div className='flex-1 max-w-md w-full'>
          <form onSubmit={onSubmitHandler} className='space-y-4 text-sm'>
            <InputField
              handleChange={handleChange}
              address={address}
              name="name"
              type="text"
              placeholder="Name *"
            />

            <InputField
              handleChange={handleChange}
              address={address}
              name="address"
              type="text"
              placeholder="Full Address *"
            />

            <InputField
              handleChange={handleChange}
              address={address}
              name="phone"
              type="text"
              placeholder="Phone Number *"
            />

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
