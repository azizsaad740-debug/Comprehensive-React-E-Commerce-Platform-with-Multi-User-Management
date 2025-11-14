import { LedgerEntity, LedgerTransaction, LedgerEntityType, TransactionType, TransactionItemType } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { getAllMockUsers } from './userUtils';
import { updateProductStock } from './productUtils'; // Import stock update utility

// --- Mock Data Stores ---

// 1. Suppliers and Other Entities (not linked to auth.users)
const initialExternalEntities: LedgerEntity[] = [
  { id: 'e1', name: 'Material Supplier Inc.', type: 'supplier', linkedId: uuidv4(), contact: 'supplier@example.com' },
  { id: 'e2', name: 'Shipping Partner Co.', type: 'supplier', linkedId: uuidv4(), contact: 'shipping@example.com' },
  { id: 'e3', name: 'Local Charity Fund', type: 'other', linkedId: uuidv4(), contact: 'charity@example.com' },
];

let currentExternalEntities: LedgerEntity[] = initialExternalEntities;

// 2. Transactions
const initialTransactions: LedgerTransaction[] = [
  // Transaction for Supplier 1 (We Gave Cash - Debt to us)
  { id: uuidv4(), entityId: 'e1', type: 'we_gave', itemType: 'cash', amount: 500.00, details: 'Advance payment for raw materials.', createdAt: new Date(Date.now() - 86400000 * 10) },
  // Transaction for Supplier 1 (We Received Product - Credit to us)
  { id: uuidv4(), entityId: 'e1', type: 'we_received', itemType: 'product', amount: 300.00, details: 'Received 100 units of cotton fabric.', productName: 'Cotton Fabric', productId: '1', quantity: 100, purchasePrice: 3.00, createdAt: new Date(Date.now() - 86400000 * 5) },
  // Transaction for Reseller u2 (We Gave Product - Debt to us)
  { id: uuidv4(), entityId: 'u2', type: 'we_gave', itemType: 'product', amount: 150.00, details: 'Sample products provided to reseller.', productName: 'Sample T-Shirts', productId: '1', quantity: 5, salePrice: 30.00, createdAt: new Date(Date.now() - 86400000 * 3) },
  // Transaction for Customer u3 (We Received Cash - Credit to us)
  { id: uuidv4(), entityId: 'u3', type: 'we_received', itemType: 'cash', amount: 42.39, details: 'Payment for order CP-2024-001236.', createdAt: new Date(Date.now() - 86400000 * 10) },
];

let currentTransactions: LedgerTransaction[] = initialTransactions;

// --- Utility Functions ---

/**
 * Retrieves all ledger entities, merging internal users (customers/resellers) 
 * with external entities (suppliers/others).
 */
export const getAllLedgerEntities = (): LedgerEntity[] => {
  const users = getAllMockUsers();
  
  // Map internal users to LedgerEntity format
  const internalEntities: LedgerEntity[] = users
    .filter(u => u.role === 'customer' || u.role === 'reseller')
    .map(u => ({
      id: u.id,
      name: u.name,
      type: u.role as LedgerEntityType, // Explicitly cast role to LedgerEntityType
      linkedId: u.id,
      contact: u.email,
    }));
    
  return [...internalEntities, ...currentExternalEntities];
};

export const getEntityById = (entityId: string): LedgerEntity | undefined => {
  return getAllLedgerEntities().find(e => e.id === entityId);
};

export const getTransactionById = (transactionId: string): LedgerTransaction | undefined => {
  return currentTransactions.find(t => t.id === transactionId);
};

export const getTransactionsByEntityId = (entityId: string): LedgerTransaction[] => {
  return currentTransactions
    .filter(t => t.entityId === entityId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// Helper to reverse stock changes if a transaction is deleted or updated
const reverseStockChange = (transaction: LedgerTransaction) => {
  if (transaction.itemType === 'product' && transaction.productId && transaction.quantity) {
    const quantityChange = transaction.type === 'we_received' 
      ? -transaction.quantity // Reverse: We received product -> Stock decreases
      : transaction.quantity; // Reverse: We gave product -> Stock increases
      
    updateProductStock(transaction.productId, quantityChange);
  }
};

export const addLedgerTransaction = (data: Omit<LedgerTransaction, 'id' | 'createdAt'>): LedgerTransaction => {
  const newTransaction: LedgerTransaction = {
    ...data,
    id: uuidv4(),
    createdAt: new Date(),
  };
  
  // --- STOCK INTEGRATION ---
  if (newTransaction.itemType === 'product' && newTransaction.productId && newTransaction.quantity) {
    const quantityChange = newTransaction.type === 'we_received' 
      ? newTransaction.quantity // We received product -> Stock increases
      : -newTransaction.quantity; // We gave product -> Stock decreases
      
    updateProductStock(newTransaction.productId, quantityChange);
  }
  // -------------------------
  
  currentTransactions.unshift(newTransaction); // Add to the beginning
  return newTransaction;
};

export const updateLedgerTransaction = (updatedData: Partial<LedgerTransaction>): LedgerTransaction | undefined => {
  const index = currentTransactions.findIndex(t => t.id === updatedData.id);
  if (index !== -1) {
    const existingTransaction = currentTransactions[index];
    
    // 1. Reverse the stock change of the existing transaction
    reverseStockChange(existingTransaction);
    
    // 2. Update the transaction data
    const updatedTransaction: LedgerTransaction = {
      ...existingTransaction,
      ...updatedData,
      amount: Number(updatedData.amount || existingTransaction.amount),
      quantity: Number(updatedData.quantity || existingTransaction.quantity),
      purchasePrice: Number(updatedData.purchasePrice || existingTransaction.purchasePrice),
      salePrice: Number(updatedData.salePrice || existingTransaction.salePrice),
      createdAt: existingTransaction.createdAt, // Keep original creation date
    } as LedgerTransaction;
    
    currentTransactions[index] = updatedTransaction;
    
    // 3. Apply the new stock change
    if (updatedTransaction.itemType === 'product' && updatedTransaction.productId && updatedTransaction.quantity) {
      const quantityChange = updatedTransaction.type === 'we_received' 
        ? updatedTransaction.quantity 
        : -updatedTransaction.quantity;
        
      updateProductStock(updatedTransaction.productId, quantityChange);
    }
    
    return updatedTransaction;
  }
  return undefined;
};

export const deleteLedgerTransaction = (transactionId: string): boolean => {
  const index = currentTransactions.findIndex(t => t.id === transactionId);
  if (index !== -1) {
    const transactionToDelete = currentTransactions[index];
    
    // Reverse the stock change before deleting
    reverseStockChange(transactionToDelete);
    
    currentTransactions.splice(index, 1);
    return true;
  }
  return false;
};


/**
 * Calculates the current balance for a given entity.
 * Positive balance = Entity owes us (Debt to us, Credit to them).
 * Negative balance = We owe the Entity (Credit to us, Debt to them).
 * 
 * We Gave (We Debit) -> Increases Entity's debt to us (Positive balance)
 * We Received (We Credit) -> Decreases Entity's debt to us (Negative balance/Credit)
 */
export const calculateEntityBalance = (entityId: string): number => {
  const transactions = getTransactionsByEntityId(entityId);
  
  return transactions.reduce((balance, t) => {
    if (t.type === 'we_gave') {
      // We gave them cash/product, they owe us. (Debit)
      return balance + t.amount;
    } else {
      // We received cash/product, we owe them less. (Credit)
      return balance - t.amount;
    }
  }, 0);
};

/**
 * Calculates the overall financial summary for the ledger system.
 * Total Debt: Sum of positive balances (Entities owe us).
 * Total Credit: Sum of negative balances (We owe Entities).
 */
export const calculateOverallLedgerSummary = () => {
  const entities = getAllLedgerEntities();
  let totalDebt = 0; // Entities owe us (Positive balances)
  let totalCredit = 0; // We owe entities (Negative balances)
  
  entities.forEach(entity => {
    const balance = calculateEntityBalance(entity.id);
    if (balance > 0) {
      totalDebt += balance;
    } else if (balance < 0) {
      totalCredit += Math.abs(balance);
    }
  });
  
  return {
    totalDebt: Math.round(totalDebt * 100) / 100,
    totalCredit: Math.round(totalCredit * 100) / 100,
    netBalance: Math.round((totalDebt - totalCredit) * 100) / 100,
    totalEntities: entities.length,
  };
};

// --- CRUD for External Entities (Suppliers/Others) ---

export const addExternalEntity = (data: Omit<LedgerEntity, 'id' | 'linkedId'>): LedgerEntity => {
  const newEntity: LedgerEntity = {
    ...data,
    id: uuidv4(),
    linkedId: uuidv4(), // Unique ID for external entities
  };
  currentExternalEntities.push(newEntity);
  return newEntity;
};

export const updateExternalEntity = (updatedData: Partial<LedgerEntity>): LedgerEntity | undefined => {
  const index = currentExternalEntities.findIndex(e => e.id === updatedData.id);
  if (index !== -1) {
    currentExternalEntities[index] = { ...currentExternalEntities[index], ...updatedData } as LedgerEntity;
    return currentExternalEntities[index];
  }
  return undefined;
};

export const deleteExternalEntity = (entityId: string): boolean => {
  const initialLength = currentExternalEntities.length;
  currentExternalEntities = currentExternalEntities.filter(e => e.id !== entityId);
  return currentExternalEntities.length < initialLength;
};