// src/components/EditNewsModal.js
import React, { useState, useEffect } from 'react';

const EditNewsModal = ({ newsItem, onClose, onSubmit }) => {
    const [title, setTitle] = useState(newsItem.title);
    const [content, setContent] = useState(newsItem.content);
    const [imageUrl, setImageUrl] = useState(newsItem.imageUrl);
    const [urls, setUrls] = useState(newsItem.urls);
    const [sourceImageUrl, setSourceImageUrl] = useState(newsItem.sourceImageUrl);
    const [id, setId] = useState(newsItem.id);
    const [timeInMinutes, setTimeInMinutes] = useState(newsItem.timeInMinutes);
    const [convertedTime, setConvertedTime] = useState(newsItem.date);
    const [loading, setLoading] = useState(false);

    const handleContentChange = (e) => {
        setContent(e.target.value);
        // Add logic if needed for word count or other validations
    };

    const handleTimeChange = (e) => {
        setTimeInMinutes(e.target.value);
        setConvertedTime(`${Math.floor(e.target.value / 60)}h ${e.target.value % 60}m`);
    };

    const shuffleId = () => {
        // Logic to shuffle or generate a new ID if needed
        setId((prev) => prev + Math.floor(Math.random() * 10));
    };

    const handleSubmit = () => {
        setLoading(true);
        const updatedNewsItem = {
            id,
            title,
            content,
            imageUrl,
            urls,
            sourceImageUrl,
            timeInMinutes,
        };
        onSubmit(updatedNewsItem);
        setLoading(false);
    };

    return (
        <div className='h-full w-full flex justify-center items-center p-6 fixed inset-0 bg-black bg-opacity-50'>
            <div className="relative flex flex-col w-[500px] md:w-2/3 pb-4 px-4 bg-gray-500 text-black border border-gray-500 rounded-lg shadow-lg">
                <h2 className="text-xl text-gray-200 pt-2 text-center font-bold mb-4">Edit News</h2>
                <label className="block mb-4 mt-4">
                    <input
                        type="text"
                        value={title}
                        placeholder="Title"
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-[#222630] px-4 py-1.5 outline-none w-full text-white rounded-lg border-2 transition-colors duration-100 border-solid focus:border-[#596A95] border-[#2B3040]"
                    />
                </label>
                <label className="block mb-4">
                    <textarea
                        value={content}
                        placeholder="Content"
                        onChange={handleContentChange}
                        className="bg-[#222630] px-4 py-1.5 outline-none w-full text-white rounded-lg border-2 transition-colors duration-100 border-solid focus:border-[#596A95] border-[#2B3040]"
                        rows="4"
                    />
                </label>
                <label className="block mb-4">
                    <input
                        type="text"
                        value={imageUrl}
                        placeholder="Image URL"
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="bg-[#222630] px-4 py-1.5 outline-none w-full text-white rounded-lg border-2 transition-colors duration-100 border-solid focus:border-[#596A95] border-[#2B3040]"
                    />
                </label>
                <label className="block mb-4">
                    <input
                        type="text"
                        value={urls}
                        placeholder="News URLs (comma-separated)"
                        onChange={(e) => setUrls(e.target.value)}
                        className="bg-[#222630] px-4 py-1.5 outline-none w-full text-white rounded-lg border-2 transition-colors duration-100 border-solid focus:border-[#596A95] border-[#2B3040]"
                    />
                </label>
                <label className="block mb-4">
                    <input
                        type="text"
                        value={sourceImageUrl}
                        placeholder="Source Image URLs (comma-separated)"
                        onChange={(e) => setSourceImageUrl(e.target.value)}
                        className="bg-[#222630] px-4 py-1.5 outline-none w-full text-white rounded-lg border-2 transition-colors duration-100 border-solid focus:border-[#596A95] border-[#2B3040]"
                    />
                </label>
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
                        Shuffle ID
                    </button>
                </label>
                <label className="block mb-2">
                    <input
                        type="text"
                        value={timeInMinutes}
                        onChange={handleTimeChange}
                        placeholder="Enter time in minutes"
                        className="bg-[#222630] px-4 py-1.5 outline-none w-full text-white rounded-lg border-2 transition-colors duration-100 border-solid focus:border-[#596A95] border-[#2B3040]"
                    />
                    {convertedTime && (
                        <p className="text-black text-sm p-1 mb-4">
                            <strong>{convertedTime}</strong>
                        </p>
                    )}
                </label>

                <div className='w-full items-center flex flex-row justify-evenly'>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 w-32 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 w-32 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                        {!loading ? (
                            <h1 className='text-white font-normal text-base'>Send</h1>
                        ) : (
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
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditNewsModal;
