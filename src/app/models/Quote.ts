import mongoose from "mongoose";

const QuoteSchema = new mongoose.Schema(
  {
    month: String,
    day: String,
    year: Number,
    quote: String,
    url: String,
  },
  { timestamps: true }
);

QuoteSchema.index({ month: 1, day: 1, year: 1 }, { unique: true });
QuoteSchema.index({ month: 1, day: 1 });

export default mongoose.models.Quote || mongoose.model("Quote", QuoteSchema);
