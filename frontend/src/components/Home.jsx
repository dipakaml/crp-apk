import React from 'react';
import logo from "../assets/logo.webp";
import { Link } from 'react-router-dom';
import { FaFacebookSquare } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import axios from 'axios';
import { useEffect } from 'react';
const Home = () => {
   
    useEffect(() => {
          const fetchCourses = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/v1/course/courses");
    console.log(response.data); // Optional: log the fetched data
  } catch (error) {
    console.log("error in fetchCourses", error);
  }
};
  fetchCourses();
}, []);

  



    
  return (
    <div className="bg-gradient-to-r from-black to-blue-900 mx-auto">
      <div className='h-screen text-white container mx-auto'>
        {/* Header */}
        <header className='flex items-center justify-between p-6'>
          <div className='flex items-center space-x-2'>
            <img src={logo} alt="Logo" className='w-10 h-10 rounded-full' />
            <h1 className='text-2xl text-orange-500 font-bold'>CourseHeaven</h1>
          </div>
          <div className="space-x-4">
            <Link to={"/login"} className="bg-transparent text-white py-2 px-4 border border-white rounded">Login</Link>
            <Link to={"/signup"} className="bg-transparent text-white py-2 px-4 border border-white rounded">Signup</Link>
          </div>
        </header>

        {/* Main section */}
        <section className="text-center">
          <h1 className="text-4xl font-semibold text-orange-500 py-8">CourseHeaven</h1>
          <p className="text-gray-500">Sharpen your skills with courses crafted by experts.</p>
          <div className="space-x-4 mt-8">
            <button className="bg-green-500 py-3 px-6 text-white rounded font-semibold hover:bg-white duration-300 hover:text-black">Explore courses</button>
            <button className="bg-white py-3 px-6 text-black rounded font-semibold hover:bg-green-500 duration-300 hover:text-white">Courses videos</button>
          </div>
        </section>

        <section>Section 2</section>

        {/* Footer */}
        <hr />
        <footer className="my-8">
          <div className="grid grid-cols-1 md:grid-cols-3">

          <div className="flex flex-col items-center md:items-center">
              <div className='flex items-center space-x-2'>
              <img src={logo} alt="Logo" className='w-10 h-10 rounded-full' />
              <h1 className='text-2xl text-orange-500 font-bold'>CourseHeaven
                
              </h1>
            </div>
            <div className="mt-3  ml-2 md:ml-8">
              <p className="mb-2">follow us</p>
              <div className="flex space-x-4">
                <a href=""><FaFacebookSquare  className="text-2xl hover:text-blue-400"/></a>
                <a href=""><FaInstagram className="text-2xl hover:text-pink-500" /></a>
                <a href=""><FaTwitter className="text-2xl hover:text-blue-600" /></a>
              </div>
            </div>
          </div>
            <div className="items-center flex flex-col">
                <h3 className="text-lg font-semibold mb-4">connects</h3>
                <ul className="space-y-2 text-gray-400">
                    <li className="hover:text-white cursor-pointer duration-300" >youtube- learn coding</li>
                    <li className="hover:text-white cursor-pointer duration-300">telegram- learn coding</li>
                    <li className="hover:text-white cursor-pointer duration-300">Github- learn coding</li>
                </ul>
            </div>
            <div className="items-center flex flex-col">
                <h3 className="text-lg font-semibold mb-4">copyrights &#169; 2024</h3>
                <ul className="space-y-2 text-gray-400">
                    <li className="hover:text-white cursor-pointer duration-300" >Terms & Conditions</li>
                    <li className="hover:text-white cursor-pointer duration-300">Privacy Policy</li>
                    <li className="hover:text-white cursor-pointer duration-300">Refund & Cancallations</li>
                </ul>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
