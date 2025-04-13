'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { FaEdit, FaTrash } from 'react-icons/fa';
import AddEditModal from '@/components/AddEditModal';
import Navbar from '@/components/Navbar';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function HomePage() {
  const { data: loans, isLoading } = useSWR('/api/loans', fetcher);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility
  const [selectedLoan, setSelectedLoan] = useState<any>(null); // State to hold selected loan data (for edit)

  if (isLoading) return <div className="p-6 text-lg">Loading...</div>;

  const filteredLoans = loans.filter((loan: any) => {
    const matchesQuery = loan.borrower_name.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter ? loan.status === statusFilter : true;
    return matchesQuery && matchesStatus;
  });

  // Handle file change (upload)
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload-excel', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        alert('File uploaded successfully!');
      } else {
        alert('Failed to upload file.');
      }
    } catch (error) {
      console.error(error);
      alert('Error occurred during file upload.');
    } finally {
      setUploading(false);
    }
  };

  const openModal = (loan: any = null) => {
    setSelectedLoan(loan);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLoan(null);
  };

  return (
    <Navbar>
    <main className="p-6 max-w-full mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">📋 Loan List - Arunkumar</h1>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">

        {/* File Upload */}
        <div className="space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="mb-4 md:mb-0 px-4 py-2 border border-gray-300 rounded-md shadow-sm w-full md:w-1/2"
          />
          <button
            onClick={handleFileUpload}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
          >
            {uploading ? 'Uploading...' : 'Upload Excel'}
          </button>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-1/2">
          <input
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search borrower"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-1/2">
          <select
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setStatusFilter(e.target.value)}
            value={statusFilter}
          >
            <option value="">All Statuses</option>
            <option value="Live">Live</option>
            <option value="Returned">Returned</option>
          </select>
        </div>
        {/* Button to open the Add/Edit Loan Modal */}
        <div className="w-full md:w-1/2">
          <button
            onClick={() => openModal()} // Open modal for adding a new loan
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Loan
          </button>
        </div>

      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm text-left bg-white">
          <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-3">Borrower</th>
              <th className="px-6 py-3">Address</th>
              <th className="px-6 py-3">Principal</th>
              <th className="px-6 py-3">ROI per Month%</th>
              <th className="px-6 py-3">Start Date</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Earned Amount</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredLoans.map((loan: any) => (
              <tr key={loan._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-gray-800">{loan.borrower_name}</td>
                <td className="px-6 py-4 font-medium text-gray-800">{loan.address}</td>
                <td className="px-6 py-4 text-gray-700">₹{loan.principal}</td>
                <td className="px-6 py-4 text-gray-700">{loan.roi_per_month}%</td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(loan.start_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${loan.status === 'Live'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-200 text-gray-700'
                      }`}
                  >
                    {loan.status}
                  </span>
                </td>

                {/* Only show earned_amount if loan is returned */}
               
                  <td className="px-6 py-4 text-gray-700">₹{loan.earned_amount}</td>

                <td className="px-6 py-4 text-right space-x-2">
                  {/* Icons for mobile view */}
                  <div className="sm:hidden flex space-x-2">
                    <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                      <FaEdit />
                    </button>
                    <button className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700">
                      <FaTrash />
                    </button>
                  </div>

                  {/* Text buttons for desktop view */}
                  <div className="hidden md:flex space-x-2">
                    <button className="px-3 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded" onClick={(_event:any)=>openModal(loan)}>
                      Edit
                    </button>
                    <button className="px-3 py-1 text-sm text-white bg-red-600 hover:bg-red-700 rounded">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredLoans.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <AddEditModal
          initialData={selectedLoan} // Pass loan data to the modal (for editing)
          closeModal={closeModal} // Close the modal
        />
      )}
    </main>
    </Navbar>
  );
}
