import * as XLSX from 'xlsx';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import Loan from '@/app/models/Loan';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as Blob;

  if (!file) {
    return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
  }

  try {
    // Read the file using xlsx
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheet = workbook.Sheets['Arunkumar'];
    const json = XLSX.utils.sheet_to_json(sheet);

    const formatted = json.map((item: any) => {
      let startDate = item['Start Date'];
      let formattedDate = null;

      // If the 'Start Date' is a number (Excel serial date)
      if (typeof startDate === 'number') {
        // Excel's date system starts on 1900-01-01, so we need to add the serial number to this base date
        // Subtract 25569 (the number of days between 1900-01-01 and 1970-01-01) to get the correct JavaScript Date.
        formattedDate = new Date((startDate - 25569) * 86400 * 1000); // Convert to JavaScript date
      } else if (typeof startDate === 'string') {
        // If the date is in string format (like DD-MM-YYYY), we manually parse it
        const parts = startDate.split('-');
        if (parts.length === 3) {
          const [day, month, year] = parts;
          // Create the date object (month is zero-indexed in JS Date)
          formattedDate = new Date(`${year}-${month}-${day}`);
        }
      }

      return {
        borrower_name: item['Borrower Name'],
        address: item['Address'],
        roi_per_month: item['ROI per month (%)'],
        period_month: item['Period Month'],
        start_date: formattedDate,  // Set formatted date
        interest_per_month: item['Interest/Month (₹)'] || 0,
        principal: item['Principal (₹)'] || 0,
        months_elapsed: item['Months Elapsed'],
        total_year: item['Total Year'],
        status: item['Status'],
        earned_amount: item['Earned amount'] || 0
      };
    });

    await connectToDatabase();
    await Loan.insertMany(formatted);

    return NextResponse.json({ message: 'File uploaded and data inserted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error occurred during file processing' }, { status: 500 });
  }
}
