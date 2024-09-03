import React from 'react'
import Image from 'next/image'

function Navbar() {
    return (
        <div className='bg-[#134053] h-20 w-full'>
            <div className='flex flex-row justify-center items-center h-full'>
                <div className='flex flex-col h-full justify-center items-center'>
                    <Image src='/logo.png' width={50} height={50} alt='Logo'/>
                    <h1 className='text-sm font-extrabold'>THE HEADLINES</h1>
                </div>

            </div>
        </div>
    )
}

export default Navbar