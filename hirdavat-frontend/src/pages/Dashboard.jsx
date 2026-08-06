import { useEffect, useState } from 'react';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

import Loader from '../components/common/Loader';
import TopBar from '../components/common/TopBar';
import { fetchCustomerBalancesReport, fetchDashboardSummary, fetchSalesReport, fetchTopProducts } from '../api/dashboard';
import { formatCurrency } from '../utils/formatCurrency';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [topProducts, setTopProducts] = useState(null);
  const [balances, setBalances] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchDashboardSummary(),
      fetchSalesReport({ period: 'daily', days: 14 }),
      fetchTopProducts({ limit: 5, days: 30 }),
      fetchCustomerBalancesReport(),
    ])
      .then(([summaryData, salesData, topProductsData, balancesData]) => {
        setSummary(summaryData);
        setSalesReport(salesData);
        setTopProducts(topProductsData);
        setBalances(balancesData);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Loader fullscreen />;

  const salesChartData = {
    labels: salesReport.results.map((r) => new Date(r.period).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })),
    datasets: [
      {
        label: 'Günlük Satış (TL)',
        data: salesReport.results.map((r) => r.total_amount),
        borderColor: '#198754',
        backgroundColor: 'rgba(25, 135, 84, 0.15)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const topProductsChartData = {
    labels: topProducts.results.map((p) => p.product__name),
    datasets: [
      {
        label: 'Satılan Miktar',
        data: topProducts.results.map((p) => p.total_quantity),
        backgroundColor: '#198754',
      },
    ],
  };

  const debtorsChartData = {
    labels: balances.debtors.slice(0, 6).map((d) => d.customer_name),
    datasets: [
      {
        data: balances.debtors.slice(0, 6).map((d) => d.balance),
        backgroundColor: ['#198754', '#20c997', '#ffc107', '#fd7e14', '#dc3545', '#6f42c1'],
      },
    ],
  };

  return (
    <div className="hirdavat-app-content">
      <TopBar title="Panel" />

      <div className="row g-2 mb-3">
        <div className="col-6">
          <div className="border rounded p-3">
            <div className="small text-secondary">Bugünkü Satış</div>
            <div className="fs-5 fw-bold text-success">{formatCurrency(summary.today.total_amount)}</div>
            <small className="text-secondary">{summary.today.sale_count} satış</small>
          </div>
        </div>
        <div className="col-6">
          <div className="border rounded p-3">
            <div className="small text-secondary">Bu Ay</div>
            <div className="fs-5 fw-bold">{formatCurrency(summary.month_total_amount)}</div>
          </div>
        </div>
        <div className="col-6">
          <div className="border rounded p-3">
            <div className="small text-secondary">Kritik Stok</div>
            <div className={`fs-5 fw-bold ${summary.low_stock_count > 0 ? 'text-warning' : ''}`}>
              {summary.low_stock_count} ürün
            </div>
          </div>
        </div>
        <div className="col-6">
          <div className="border rounded p-3">
            <div className="small text-secondary">Toplam Veresiye</div>
            <div className="fs-5 fw-bold text-danger">{formatCurrency(summary.total_customer_debt)}</div>
          </div>
        </div>
      </div>

      <div className="border rounded p-3 mb-3">
        <h2 className="h6 fw-bold">Son 14 Gün Satış</h2>
        {salesReport.results.length === 0 ? (
          <p className="text-secondary small mb-0">Henüz satış verisi yok.</p>
        ) : (
          <Line data={salesChartData} options={{ plugins: { legend: { display: false } } }} height={180} />
        )}
      </div>

      <div className="border rounded p-3 mb-3">
        <h2 className="h6 fw-bold">En Çok Satan Ürünler</h2>
        {topProducts.results.length === 0 ? (
          <p className="text-secondary small mb-0">Henüz satış verisi yok.</p>
        ) : (
          <Bar data={topProductsChartData} options={{ indexAxis: 'y', plugins: { legend: { display: false } } }} height={180} />
        )}
      </div>

      <div className="border rounded p-3 mb-3">
        <h2 className="h6 fw-bold">Veresiye Dağılımı</h2>
        {balances.debtors.length === 0 ? (
          <p className="text-secondary small mb-0">Borçlu müşteri yok.</p>
        ) : (
          <Pie data={debtorsChartData} height={200} />
        )}
      </div>
    </div>
  );
}
