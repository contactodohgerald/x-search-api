import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        type: String,
        require: true,
    },
    trans_ref: {
        type: String,
        trim: true,
    },
    amount: {
        type: Number,
        trim: true,
        default: 0
    },
    currency: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        require: true,
    },
    status: {
        type: String,
        default: 'pending',
    },  
    payment_method: {
        type: String,
        trim: true,
        require: true,
    }, 
    is_deleted: {
        type: String,
        default: 'no',
    }
},{
    timestamps: true
});

  
const Transactions = mongoose.model("Transactions", TransactionSchema);
export default Transactions;
  