import { connectToDatabase } from '@/app/lib/mongodb';
import Loan from '@/app/models/Loan';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/app/lib/jwt';
import mongoose from 'mongoose';

function getUserFromRequest(request: Request) {
  const cookie = request.headers.get('cookie');
  if (!cookie) return null;

  const tokenMatch = cookie.match(/token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;
  if (!token) return null;

  try {
    const user = verifyToken(token); // Verify token and get user data
    return user; // The 'user' should include the user id (e.g., user.id)
  } catch (error) {
    return null; // If token is invalid or expired, return null
  }
}

export async function GET(request: Request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  // Convert user.id (which is a string) into MongoDB ObjectId
  const userId = new mongoose.Types.ObjectId(user.id);

  await connectToDatabase();
  
  // Fetch loans associated with the user id
  const loans = await Loan.find({ user: userId });

  const today = new Date();
  const todayMonth = today.getMonth(); // 0-indexed
  const todayDate = today.getDate();

  const getMonthDateKey = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    return d.getMonth() * 100 + d.getDate();
  };

  const todayKey = todayMonth * 100 + todayDate;

  const sortedLoans = loans.sort((a, b) => {
    const aKey = getMonthDateKey(a.start_date);
    const bKey = getMonthDateKey(b.start_date);

    const aDiff = aKey >= todayKey ? aKey - todayKey : aKey + 1200 - todayKey;
    const bDiff = bKey >= todayKey ? bKey - todayKey : bKey + 1200 - todayKey;

    return aDiff - bDiff;
  });

  return NextResponse.json(sortedLoans);
}

export async function POST(request: Request) {
  const user = getUserFromRequest(request);
  
  // Ensure user is retrieved properly
  if (!user || !user.id) {
    return NextResponse.json({ success: false, message: 'Unauthorized or missing user data' }, { status: 401 });
  }

  // Convert user.id to ObjectId and ensure it's valid
  const userId = new mongoose.Types.ObjectId(user.id);
  const body = await request.json();
  
  // Check if body is valid
  if (!body || Object.keys(body).length === 0) {
    return NextResponse.json({ success: false, message: 'Invalid loan data' }, { status: 400 });
  }

  const loanData = {
    ...body,
    user: userId // Attach the valid user ID to the loan document
  };

  await connectToDatabase();

  try {
    // Create a new loan and attach the user id to the loan
    const newLoan = await Loan.create(loanData);
    
    // Return success response with the created loan
    return NextResponse.json({ success: true, loan: newLoan });
  } catch (error) {
    console.error('Error creating loan:', error);
    return NextResponse.json({ success: false, message: 'Server error', error: error }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const url = new URL(request.url);
  const loanId = url.pathname.split("/").pop();

  // Ensure loanId is defined and valid
  if (!loanId || !mongoose.Types.ObjectId.isValid(loanId)) {
    return NextResponse.json({ success: false, message: "Invalid loan ID" }, { status: 400 });
  }

  const body = await request.json();

  try {
    const updatedLoan = await Loan.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(loanId), user: user.id },
      { $set: body },
      { new: true }
    );

    if (!updatedLoan) {
      return NextResponse.json({ success: false, message: "Loan not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true, loan: updatedLoan });
  } catch (error) {
    console.error("Error updating loan:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

