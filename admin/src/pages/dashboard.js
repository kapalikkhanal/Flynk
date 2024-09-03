// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import NewsCard from './components/newsCard';
import EditNewsModal from './components/modal';
import Navbar from './components/navBar';
import { useRouter } from 'next/router';
import { IoMdAdd } from "react-icons/io";

const Dashboard = () => {
    const [news, setNews] = useState([]);
    const [selectedNewsItem, setSelectedNewsItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetch('https://flynk.onrender.com/api/post')
            .then((response) => response.json())
            .then((data) => setNews(data))
            .catch((error) => console.error('Error fetching data:', error));
    }, []);

    const handleEdit = (newsItem) => {
        setSelectedNewsItem(newsItem);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        fetch(`https://flynk.onrender.com/api/post/${id}`, {
            method: 'DELETE',
        })
            .then(() => {
                const updatedNews = news.filter((item) => item.id !== id);
                setNews(updatedNews);
                alert(`Deleted news item with id: ${id}`);
            })
            .catch((error) => console.error('Error deleting data:', error));
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedNewsItem(null);
    };

    const handleUpdate = (updatedNewsItem) => {
        fetch(`https://flynk.onrender.com/api/post/${updatedNewsItem.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedNewsItem),
        })
            .then((response) => response.json())
            .then((updatedItem) => {
                const updatedNews = news.map((item) =>
                    item.id === updatedItem.id ? updatedItem : item
                );
                setNews(updatedNews);
                handleModalClose();
            })
            .catch((error) => console.error('Error updating data:', error));
    };

    return (
        <div className="container bg-white min-h-full min-w-full">
            <Navbar />
            <h1 className="text-2xl text-center p-2 font-bold mb-2 text-black">News Dashboard</h1>
            <div className='w-full flex justify-center items-center mb-4'>
                <div
                    className='w-24 bg-teal-900 py-2 rounded-3xl flex flex-row justify-center items-center cursor-pointer'
                    onClick={() => { router.push('/') }}
                >
                    <IoMdAdd className='text-white' />
                    <div className='text-white text-center font-bold'>&nbsp;Add</div>
                </div>
            </div>
            <div className="">
                {news.map((newsItem) => (
                    <NewsCard
                        key={newsItem.id}
                        newsItem={newsItem}
                        onEdit={() => handleEdit(newsItem)}
                        onDelete={() => handleDelete(newsItem.id)}
                    />
                ))}
            </div>
            {isModalOpen && selectedNewsItem && (
                <EditNewsModal
                    newsItem={selectedNewsItem}
                    onClose={handleModalClose}
                    onSubmit={handleUpdate}
                />
            )}
        </div>
    );
};

export default Dashboard;
