import React, { useState } from 'react'
import { assets } from '../assets/assets'

const InputField = ({ type, placeholder, name, handlerChange, address }) => (
    <input className='w-full px-2 py-2.5 border border-gray-500/30 rounded outline-none text-gray-500 focus:border-primary transition'
        type={type}
        placeholder={placeholder}
        name={name}
        value={address[name]}
        required
    />
)

function AddAddress() {
    const [address, setAddress] = useState({
        firstname: '',
        lastname: '',
        email: '',
        street: '',
        city: '',
        state: '',
        country: '',
        zipcode: '',
        phone:''
    })

    const handlerChange = (e) => {
        const { name, value } = e.target;
        setAddress((prevAddress) => ({
            ...prevAddress, [name]: value
        }))
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();
    }
  return (
    <div className='mt-16 pb-16'>
          <p className='text-2xl md:text-3xl text-gray-500'>Add Shipping <span className='font-semibold text-primary'>Address</span></p>
          <div className='flex flex-col-reverse md:flex-row justify-between mt-10'>
              <div className='flex-1 max-w-md'>
                  <form onSubmit={onSubmitHandler} className='space-y-3 mt-6 text-sm'>
                      <div className='grid grid-cols-2 gap-4'>
                          <InputField handlerChange={handlerChange} address={address} name='firstname' type='text' placeholder='First Name' />
                          <InputField handlerChange={handlerChange} address={address} name='lastname' type='text' placeholder='Last Name' />
                      </div>

                      <InputField handlerChange={handlerChange} address={address} name='email' type='text' placeholder='Email Address' />
                      <InputField handlerChange={handlerChange} address={address} name='street' type='text' placeholder='Street' />

                      <div className='grid grid-cols-2 gap-4'>
                          <InputField handlerChange={handlerChange} address={address} name='city' type='text' placeholder='City' />
                          <InputField handlerChange={handlerChange} address={address} name='state' type='text' placeholder='State' />  
                      </div>

                      <div className='grid grid-cols-2 gap-4'>
                          <InputField handlerChange={handlerChange} address={address} name='zipcode' type='number' placeholder='Zip Code' />
                          <InputField handlerChange={handlerChange} address={address} name='country' type='text' placeholder='Country' />  
                      </div>

                      <InputField handlerChange={handlerChange} address={address} name='phone' type='text' placeholder='Phone Number' />

                      <button className='w-full mt-6 bg-primary text-white py-3 hover:bg-dull-primary transition cursor-pointer uppercase'> Save Address</button>

                  </form> 
              </div>
              <img src={ assets.add_address_iamge } alt="Add address" />
          </div>
          
    </div>
  )
}

export default AddAddress