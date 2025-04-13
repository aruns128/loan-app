import { connectToDatabase } from '@/app/lib/mongodb';
import Loan from '@/app/models/Loan';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/app/lib/jwt';

function getUserFromRequest(request: Request) {
  const cookie = request.headers.get('cookie');
  if (!cookie) return null;

  const tokenMatch = cookie.match(/token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;
  if (!token) return null;

  try {
    const user = verifyToken(token);
    return user;
  } catch (error) {
    return null;
  }
}


export async function GET(request: Request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  await connectToDatabase();
  const loans = await Loan.find({});

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
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  await connectToDatabase();

  const newLoan = await Loan.create(body);
  return NextResponse.json(newLoan);
}
