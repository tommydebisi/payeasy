"use client";

import { useState } from "react";
import TransactionCard, { type Transaction } from "./TransactionCard";
import { Search, Filter, Loader2 } from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  newBadgeHashes?: string[];
}

/**
 * A container component for displaying a filtered and paginated list of transactions.
 * Features search and filter UI components for enhanced usability.
 */
export default function TransactionList({
  transactions,
  hasMore,
  isLoadingMore,
  onLoadMore,
  newBadgeHashes = [],
}: TransactionListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Basic filtering for demo purposes
  const filteredTransactions = transactions.filter(tx =>
    tx.txHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.amount.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showPaginationStatus = searchQuery.trim().length === 0;

  return (
    <div className="space-y-6">
      {/* List Control Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-10 bg-white/5 border border-white/5 p-4 rounded-2xl backdrop-blur-md">
        <div className="relative w-full md:w-96 group">
          <label htmlFor="tx-search" className="sr-only">Search transactions</label>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-500 group-focus-within:text-brand-400 transition-colors" />
          <input
            id="tx-search"
            type="text"
            placeholder="Search by amount, hash, or type..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            className="w-full bg-dark-900/50 border border-white/10 rounded-xl py-3 pl-11 pr-5 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 placeholder:text-dark-600 transition-all font-medium"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none btn-secondary !py-2.5 !px-4 !text-xs !bg-dark-900/40 !border-white/10 hover:!border-white/20">
            <Filter className="h-3.5 w-3.5" />
            Types
          </button>
          <button className="flex-1 md:flex-none btn-secondary !py-2.5 !px-4 !text-xs !bg-dark-900/40 !border-white/10 hover:!border-white/20">
            Latest First
          </button>
        </div>
      </div>

      {/* Grid Display */}
      {filteredTransactions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredTransactions.map((tx) => (
            <TransactionCard
              key={tx.id}
              transaction={tx}
              isNew={newBadgeHashes.includes(tx.txHash)}
            />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center glass-card border-dashed">
          <div className="mx-auto h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-dark-600" />
          </div>
          <h3 className="text-dark-200 font-bold">No transactions found</h3>
          <p className="text-dark-500 text-sm mt-1">Try adjusting your search criteria</p>
        </div>
      )}

      {showPaginationStatus && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-white/5">
          <p className="text-[11px] text-dark-500 uppercase tracking-widest font-black">
            Showing <span className="text-brand-400 px-1">{transactions.length}</span> Transactions
          </p>

          {hasMore ? (
            <button
              type="button"
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="btn-secondary !py-3 !px-7 !rounded-xl !text-xs disabled:opacity-60"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load more"
              )}
            </button>
          ) : (
            <p className="text-xs text-dark-400 font-semibold uppercase tracking-widest">
              All transactions loaded
            </p>
          )}
        </div>
      )}
    </div>
  );
}
