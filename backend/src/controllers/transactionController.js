import Transaction from "../models/Transaction.js";

export const listTransactions = async (req, res) => {
  const filter = {};
  if (req.query.projectId) filter.projectId = req.query.projectId;
  const txs = await Transaction.find(filter).sort({ createdAt: -1 });
  res.json(txs);
};

export const saveTransaction = async (req, res) => {
  const doc = await Transaction.create(req.body);
  res.status(201).json(doc);
};
