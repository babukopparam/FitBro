import React from "react";

export default function Profile() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <div className="bg-white rounded-2xl p-8 shadow-xl max-w-xl mx-auto">
        <div className="mb-6 text-center">
          <img src="https://placehold.co/100x100" alt="Profile" className="rounded-full mx-auto mb-2" />
          <div className="font-semibold text-lg">Rahul Sharma</div>
          <div className="text-gray-600">Member ID: M-1234</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600">Mobile</label>
            <div className="font-semibold">+91 98765 43210</div>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Email</label>
            <div className="font-semibold">rahul@email.com</div>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Age</label>
            <div className="font-semibold">32</div>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Sex</label>
            <div className="font-semibold">Male</div>
          </div>
        </div>
        <div className="mt-8">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-2xl w-full">Edit Profile</button>
        </div>
      </div>
    </div>
  );
}
