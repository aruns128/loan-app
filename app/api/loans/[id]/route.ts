import { connectToDatabase } from '@/app/lib/mongodb';
import Loan from '@/app/models/Loan';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { verifyToken } from '@/app/lib/jwt';

function getUserFromRequest(request: Request) {
  const cookie = request.headers.get("cookie");
  if (!cookie) return null;
  const match = cookie.match(/token=([^;]+)/);
  const token = match ? match[1] : null;
  if (!token) return null;

  try {
    return verifyToken(token);
  } catch (err) {
    return null;
  }
}

export async function DELETE(req: Request) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  await connectToDatabase();

  const url = new URL(req.url);
  const loanId = url.pathname.split("/").pop();
  const userId = new mongoose.Types.ObjectId(user.id);

  const deleted = await Loan.findOneAndDelete({ _id: loanId, user: userId });

  if (!deleted) {
    return NextResponse.json({ success: false, message: 'Loan not found or unauthorized' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: 'Loan deleted successfully' });
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
