import React, { useState } from 'react';
import { useRouter } from 'next/router';

const NewsForm = () => {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sourceImageUrl, setSourceImageUrl] = useState('https://flynk.onrender.com/fallback.png');
  const [id, setId] = useState(generateId());
  const [urls, setUrls] = useState('');
  const [date, setDate] = useState('');
  const [timeInMinutes, setTimeInMinutes] = useState('');
  const [convertedTime, setConvertedTime] = useState('3');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [nepaliWordCount, setNepaliWordCount] = useState(0);

  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);
    const newsData = {
      title,
      imageUrl,
      id,
      sourceImageUrl: sourceImageUrl.split(',').map(url => url.trim()),
      urls: urls.split(',').map(url => url.trim()),
      date: convertedTime,
      content,
    };

    try {
      const response = await fetch('https://flynk.onrender.com/api/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newsData),
      });

      if (response.ok) {
        alert('News data sent successfully!');
        router.push('/');
        setTitle('');
        setImageUrl('');
        setSourceImageUrl('');
        setUrls('');
        setDate('');
        setContent('');
        setId(generateId());
      } else {
        alert('Failed to send news data.');
      }
    } catch (error) {
      console.error('Error sending news data:', error);
      alert('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  function generateId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let id = '-';
    id += 'O5Y';
    for (let i = 0; i < 17; i++) {
      id += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return id;
  }

  const shuffleId = () => {
    setId(generateId());
  };

  const handleTimeChange = (e) => {
    const minutes = parseInt(e.target.value, 10);
    setTimeInMinutes(minutes);

    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      setConvertedTime(`${hours}h ${remainingMinutes}m`);
    } else {
      setConvertedTime(`${minutes}m`);
    }
  };

  const countCharacters = (text) => {
    return text.length;
  };


  const handleContentChange = (e) => {
    const text = e.target.value;
    setContent(text);
    const count = countCharacters(text);
    setNepaliWordCount(count);
  };


  return (
    <div className='h-full w-full flex justify-center items-center p-6'>
      <div className="relative flex flex-col w-[500px] md:2/3 pb-4 px-4 bg-gray-500 text-black border border-gray-500 rounded-lg shadow-lg">
        <h2 className="text-xl text-gray-200 pt-2 text-center font-bold mb-4">Admin Panel</h2>

        {/* Title */}
        <label className="block mb-4 mt-4">
          <input
            type="text"
            value={title}
            placeholder="Title"
            onChange={(e) => setTitle(e.target.value)}
            className="bg-[#222630] px-4 py-1.5 outline-none w-full text-white rounded-lg border-2 transition-colors duration-100 border-solid focus:border-[#596A95] border-[#2B3040]"
          />
        </label>

        {/* Content */}
        <label className="block mb-4">
          <textarea
            value={content}
            placeholder="Content"
            onChange={handleContentChange}
            className="bg-[#222630] px-4 py-1.5 outline-none w-full text-white rounded-lg border-2 transition-colors duration-100 border-solid focus:border-[#596A95] border-[#2B3040]"
            rows="4"
          />
          <p className={`text-right text-sm ${nepaliWordCount > 300 ? 'text-red-500' : 'text-gray-300'}`}>
            {nepaliWordCount} / 300
          </p>
        </label>

        {/* Image URL */}
        <label className="block mb-4">
          <input
            type="text"
            value={imageUrl}
            placeholder="Image URL"
            onChange={(e) => setImageUrl(e.target.value)}
            className="bg-[#222630] px-4 py-1.5 outline-none w-full text-white rounded-lg border-2 transition-colors duration-100 border-solid focus:border-[#596A95] border-[#2B3040]"
          />
        </label>

        {/* URLs */}
        <label className="block mb-4">
          <input
            type="text"
            value={urls}
            placeholder="News URLs (comma-separated)"
            onChange={(e) => setUrls(e.target.value)}
            className="bg-[#222630] px-4 py-1.5 outline-none w-full text-white rounded-lg border-2 transition-colors duration-100 border-solid focus:border-[#596A95] border-[#2B3040]"
          />
        </label>

        {/* Image URLs */}
        <label className="block mb-4">
          <input
            type="text"
            value={sourceImageUrl}
            placeholder="Source Image URLs (comma-separated)"
            onChange={(e) => setSourceImageUrl(e.target.value)}
            className="bg-[#222630] px-4 py-1.5 outline-none w-full text-white rounded-lg border-2 transition-colors duration-100 border-solid focus:border-[#596A95] border-[#2B3040]"
          />
        </label>

        {/* ID Input with Shuffle Button */}
        <label className="block mb-4 relative">
          <input
            type="text"
            value={id}
            placeholder="ID"
            onChange={(e) => setId(e.target.value)}
            className="bg-[#252727] px-4 py-1.5 outline-none w-full text-white rounded-lg border-2 transition-colors duration-100 border-solid focus:border-[#596A95] border-[#2B3040] disabled:opacity-50"
            disabled
          />
          <button
            onClick={shuffleId}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white focus:outline-none focus:none"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='w-9 h-9 hover:animate-spin'>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM5.46056 11.0833C5.83331 7.79988 8.62404 5.25 12.0096 5.25C14.148 5.25 16.0489 6.26793 17.2521 7.84246C17.5036 8.17158 17.4406 8.64227 17.1115 8.89376C16.7824 9.14526 16.3117 9.08233 16.0602 8.7532C15.1289 7.53445 13.6613 6.75 12.0096 6.75C9.45213 6.75 7.33639 8.63219 6.9733 11.0833H7.33652C7.63996 11.0833 7.9135 11.2662 8.02953 11.5466C8.14556 11.8269 8.0812 12.1496 7.86649 12.364L6.69823 13.5307C6.40542 13.8231 5.9311 13.8231 5.63829 13.5307L4.47003 12.364C4.25532 12.1496 4.19097 11.8269 4.30699 11.5466C4.42302 11.2662 4.69656 11.0833 5 11.0833H5.46056ZM18.3617 10.4693C18.0689 10.1769 17.5946 10.1769 17.3018 10.4693L16.1335 11.636C15.9188 11.8504 15.8545 12.1731 15.9705 12.4534C16.0865 12.7338 16.3601 12.9167 16.6635 12.9167H17.0267C16.6636 15.3678 14.5479 17.25 11.9905 17.25C10.3464 17.25 8.88484 16.4729 7.9529 15.2638C7.70002 14.9358 7.22908 14.8748 6.90101 15.1277C6.57295 15.3806 6.512 15.8515 6.76487 16.1796C7.96886 17.7416 9.86205 18.75 11.9905 18.75C15.376 18.75 18.1667 16.2001 18.5395 12.9167H19C19.3035 12.9167 19.577 12.7338 19.693 12.4534C19.8091 12.1731 19.7447 11.8504 19.53 11.636L18.3617 10.4693Z" fill="#858585"></path>
            </svg>
          </button>
        </label>

        {/* Date */}
        <label className="block mb-4">
          <input
            type="text"
            value={timeInMinutes}
            onChange={handleTimeChange}
            placeholder="Enter time in minutes"
            className="bg-[#222630] px-4 py-1.5 outline-none w-full text-white rounded-lg border-2 transition-colors duration-100 border-solid focus:border-[#596A95] border-[#2B3040]"
          />
          {convertedTime && (
            <p className="text-black mb-4">
              Time: <strong>{convertedTime}</strong>
            </p>
          )}
        </label>

        <div className='w-full items-center flex flex-row justify-evenly mt-8'>
          <button
            onClick={() => { router.push('/dashboard') }}
            className="px-4 py-2 w-32 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 w-32 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {!loading ?
              <h1 className='text-white font-normal text-base'>Send</h1>
              :
              <div className='w-full h-6 flex justify-center items-center'>
                <div className="spinner">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsForm;
