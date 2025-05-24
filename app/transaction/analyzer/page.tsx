import { TransactionAnalyzer } from '@/features/transaction-analyzer/components/transaction-analyzer';
import { PageTitle } from '@/components/shared/page-title';

export default function TransactionAnalyzerPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageTitle subtitle="Analyze Ethereum transactions for gas usage, events, failures, and more">
        Transaction Analyzer
      </PageTitle>
      <TransactionAnalyzer />
    </div>
  );
}
