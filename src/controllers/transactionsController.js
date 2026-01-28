// import { sql } from "../config/db.js";

// export async function getTransactionsByUserId(req, res) {
//   try {
//     const { userId } = req.params;

//     const transactions = await sql`
//         SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC
//       `;

//     res.status(200).json(transactions);
//   } catch (error) {
//     console.log("Error getting the transactions", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

// export async function createTransaction(req, res) {
//   try {
//     const { title, amount, category, user_id } = req.body;

//     if (!title || !user_id || !category || amount === undefined) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const transaction = await sql`
//       INSERT INTO transactions(user_id,title,amount,category)
//       VALUES (${user_id},${title},${amount},${category})
//       RETURNING *
//     `;

//     console.log(transaction);
//     res.status(201).json(transaction[0]);
//   } catch (error) {
//     console.log("Error creating the transaction", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

// export async function deleteTransaction(req, res) {
//   try {
//     const { id } = req.params;

//     if (isNaN(parseInt(id))) {
//       return res.status(400).json({ message: "Invalid transaction ID" });
//     }

//     const result = await sql`
//       DELETE FROM transactions WHERE id = ${id} RETURNING *
//     `;

//     if (result.length === 0) {
//       return res.status(404).json({ message: "Transaction not found" });
//     }

//     res.status(200).json({ message: "Transaction deleted successfully" });
//   } catch (error) {
//     console.log("Error deleting the transaction", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

// export async function getSummaryByUserId(req, res) {
//   try {
//     const { userId } = req.params;

//     const balanceResult = await sql`
//       SELECT COALESCE(SUM(amount), 0) as balance FROM transactions WHERE user_id = ${userId}
//     `;

//     const incomeResult = await sql`
//       SELECT COALESCE(SUM(amount), 0) as income FROM transactions
//       WHERE user_id = ${userId} AND amount > 0
//     `;

//     const expensesResult = await sql`
//       SELECT COALESCE(SUM(amount), 0) as expenses FROM transactions
//       WHERE user_id = ${userId} AND amount < 0
//     `;

//     res.status(200).json({
//       balance: balanceResult[0].balance,
//       income: incomeResult[0].income,
//       expenses: expensesResult[0].expenses,
//     });
//   } catch (error) {
//     console.log("Error gettin the summary", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }


import { sql } from "../config/db.js";

/* ===========================
   GET TRANSACTIONS
=========================== */
export async function getTransactionsByUserId(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    const transactions = await sql`
      SELECT * 
      FROM transactions 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    return res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error("Error getting transactions:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch transactions",
    });
  }
}

/* ===========================
   CREATE TRANSACTION
=========================== */
export async function createTransaction(req, res) {
  try {
    const { title, amount, category, user_id } = req.body;

    if (!title || !category || !user_id || amount === undefined) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    const [transaction] = await sql`
      INSERT INTO transactions (user_id, title, amount, category)
      VALUES (${user_id}, ${title}, ${amount}, ${category})
      RETURNING *
    `;

    return res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create transaction",
    });
  }
}

/* ===========================
   DELETE TRANSACTION
=========================== */
export async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid transaction ID",
      });
    }

    const result = await sql`
      DELETE FROM transactions 
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Transaction not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete transaction",
    });
  }
}

/* ===========================
   GET SUMMARY
=========================== */
export async function getSummaryByUserId(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    const [balanceResult] = await sql`
      SELECT COALESCE(SUM(amount), 0) AS balance
      FROM transactions
      WHERE user_id = ${userId}
    `;

    const [incomeResult] = await sql`
      SELECT COALESCE(SUM(amount), 0) AS income
      FROM transactions
      WHERE user_id = ${userId} AND amount > 0
    `;

    const [expenseResult] = await sql`
      SELECT COALESCE(SUM(amount), 0) AS expenses
      FROM transactions
      WHERE user_id = ${userId} AND amount < 0
    `;

    return res.status(200).json({
      success: true,
      data: {
        balance: Number(balanceResult.balance),
        income: Number(incomeResult.income),
        expenses: Number(expenseResult.expenses),
      },
    });
  } catch (error) {
    console.error("Error fetching summary:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch summary",
    });
  }
}
