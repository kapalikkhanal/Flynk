import React from 'react';
import { FaEdit, FaRegPlayCircle } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";

const NewsCard = ({ newsItem, onEdit, onDelete }) => {
  const playAudio = (audioBase64) => {
    const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
    audio.play();
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 min-w-full">
      <div className='w-full flex flex-row justify-evenly shadow-2xl rounded-lg'>
        {/* Image  */}
        <div className='flex justify-center items-center w-full'>
          <img
            src={newsItem.imageUrl}
            alt="News"
            className="w-48 h-48 object-cover rounded-md mb-4"
          />
        </div>

        {/* Content and Title  */}
        <div className='w-full flex flex-col px-2'>
          <h2 className="text-lg font-semibold mb-2 text-black">{newsItem.title}</h2>
          <p className="text-sm text-gray-600 mb-1">{newsItem.content}</p>
          <p className="text-sm text-gray-500 font-bold">{newsItem.date}</p>
        </div>

        {/* Icons  */}
        <div className="flex items-center flex-col justify-center w-20 mx-6 px-4">
          <div
            className="text-white flex flex-col justify-center items-center px-4 py-1 rounded  cursor-pointer"
            onClick={() => playAudio(newsItem.titleAudio)}
          >
            <FaRegPlayCircle className='text-green-800 h-7 w-7' />
            <p className='text-black text-sm text-center'>Title</p>
          </div>
          <div
            className="text-white flex flex-col justify-center items-center px-4 py-1 rounded cursor-pointer"
            onClick={() => playAudio(newsItem.contentAudio)}
          >
            <FaRegPlayCircle className='text-green-800 h-7 w-7' />
            <p className='text-black text-sm text-center'>Content</p>
          </div>

          <button
            className="text-white px-4 py-1 rounded cursor-pointer"
            onClick={() => onEdit(newsItem.id)}
          >
            <FaEdit className='text-blue-800 h-7 w-7 mt-1' />
          </button>
          <button
            className="text-white px-4 py-1 rounded cursor-pointer"
            onClick={() => onDelete(newsItem.id)}
          >
            <MdDeleteOutline className='text-red-600 h-8 w-8 mr-1 mt-1.5' />
          </button>
        </div>

      </div>
    </div>
  );
};

export default NewsCard;
