import mongoose from 'mongoose';

const LoanSchema = new mongoose.Schema({
  borrower_name: String,
  address: String,
  roi_per_month: Number,
  period_month: Number,
  start_date: Date,
  interest_per_month: Number,
  principal: Number,
  months_elapsed: Number,
  total_year: Number,
  status: String, // Live or returned
  earned_amount: Number,
});

export default mongoose.models.Loan || mongoose.model('Loan', LoanSchema);