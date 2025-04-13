import { connectToDatabase } from '@/app/lib/mongodb';
import Loan from '@/app/models/Loan';
import { NextResponse } from 'next/server';

export async function GET() {
  await connectToDatabase();

  const loans = await Loan.find({});

  const today = new Date();
  const todayMonth = today.getMonth(); // 0-indexed
  const todayDate = today.getDate();

  // Convert a loan's start_date to a comparable MMDD format
  const getMonthDateKey = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    return d.getMonth() * 100 + d.getDate(); // e.g., April 13 => 313
  };

  const todayKey = todayMonth * 100 + todayDate;

  // Sort all loans based on MMDD value, keeping the next nearest first
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
  const body = await request.json();
  await connectToDatabase();

  const newLoan = await Loan.create(body);
  return NextResponse.json(newLoan);
}
