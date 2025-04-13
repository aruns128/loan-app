import { connectToDatabase } from '@/app/lib/mongodb';
import Loan from '@/app/models/Loan';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json();
  await connectToDatabase();
  const updated = await Loan.findByIdAndUpdate(params.id, data, { new: true });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  await Loan.findByIdAndDelete(params.id);
  return NextResponse.json({ message: 'Deleted' });
}