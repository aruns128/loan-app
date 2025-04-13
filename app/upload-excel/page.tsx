'use client';
import { useState } from 'react';
import * as XLSX from 'xlsx';

interface ExcelRow {
  [key: string]: string | number | boolean | null;
}

export default function UploadExcelPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [excelData, setExcelData] = useState<ExcelRow[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploaded(false); // reset if another file selected
      parseExcelFile(selectedFile);
    }
  };

  const excelSerialToDate = (serial: number): string => {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + serial * 86400000);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const parseExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryStr = e.target?.result;
      if (binaryStr) {
        const wb = XLSX.read(binaryStr, { type: 'binary' });
        const ws = wb.Sheets['Arunkumar'] || wb.Sheets[wb.SheetNames[0]];
        let data = XLSX.utils.sheet_to_json<ExcelRow>(ws, {
          header: 0,
          defval: '',
          blankrows: false,
        });

        data = data.map((row) => {
          const newRow: ExcelRow = { ...row };
          for (const key in newRow) {
            const value = newRow[key];
            if (typeof value === 'number' && value > 40000 && value < 60000) {
              newRow[key] = excelSerialToDate(value);
            }
          }
          return newRow;
        });

        setExcelData(data);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleFileUpload = async () => {
    if (!file || excelData.length === 0) return;
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
        setUploaded(true);
        setShowConfirmModal(true); // Trigger the modal after successful upload
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

  const handleSaveToDB = async () => {
    if (excelData.length === 0) return;
    setUploading(true);

    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        body: JSON.stringify(excelData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      res.ok
        ? alert('Data saved to the database successfully!')
        : alert('Failed to save data.');

      setShowConfirmModal(false);
    } catch (error) {
      console.error(error);
      alert('Error occurred while saving data.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="p-4 md:p-6 max-w-full md:max-w-7xl mx-auto relative">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 text-center md:text-left">
        📤 Upload and Preview Excel Data
      </h1>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <input
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileChange}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm w-full sm:w-auto"
        />
        <button
          onClick={handleFileUpload}
          disabled={uploading || uploaded}
          className="px-4 py-2 bg-green-600 text-white rounded-md disabled:bg-gray-400 w-full sm:w-auto"
        >
          {uploading ? 'Uploading...' : uploaded ? 'Uploaded' : 'Upload File'}
        </button>
      </div>

      {/* Preview Table */}
      {excelData.length > 0 && (
        <div className="relative">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-700">
            Preview Data
          </h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow relative z-0">
            <table className="min-w-full divide-y divide-gray-300 text-sm text-left bg-white">
              <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider text-xs sticky top-0 z-10">
                <tr>
                  <th className="px-4 md:px-6 py-3 bg-gray-100">No</th>
                  {Object.keys(excelData[0]).map((key) => (
                    <th key={key} className="px-4 md:px-6 py-3 whitespace-nowrap bg-gray-100">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {excelData.map((row, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-4 md:px-6 py-3">{index + 1}</td>
                    {Object.values(row).map((value, idx) => (
                      <td
                        key={idx}
                        className="px-4 md:px-6 py-3 whitespace-nowrap max-w-[250px] overflow-hidden text-ellipsis"
                      >
                        {String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center  bg-opacity-40 z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg md:text-xl font-semibold text-gray-800">Confirm Save</h3>
            <p className="text-gray-600">
              Are you sure you want to save the uploaded data to the database?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveToDB}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Yes, Save
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
