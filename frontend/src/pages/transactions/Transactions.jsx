import React, { useEffect, useState } from "react";
import { listTransactions } from "../../services/api.js";

const Transactions = () => {
  const [txs, setTxs] = useState([]);

  useEffect(() => {
    listTransactions().then(setTxs).catch(console.error);
  }, []);

  return (
    <div className="space-y-3">
      <h3 className="text-xl font-semibold">Transaction history</h3>
      <div className="overflow-auto border border-slate-800 rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900 text-slate-300">
            <tr>
              <th className="px-3 py-2 text-left">Project</th>
              <th className="px-3 py-2 text-left">Milestone</th>
              <th className="px-3 py-2 text-left">Amount</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Tx</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((tx) => (
              <tr key={tx._id} className="border-t border-slate-800">
                <td className="px-3 py-2">{tx.projectId}</td>
                <td className="px-3 py-2">{tx.milestoneId}</td>
                <td className="px-3 py-2">{tx.amount}</td>
                <td className="px-3 py-2">{tx.status}</td>
                <td className="px-3 py-2 text-primary">
                  {tx.txHash ? tx.txHash.slice(0, 8) : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;
