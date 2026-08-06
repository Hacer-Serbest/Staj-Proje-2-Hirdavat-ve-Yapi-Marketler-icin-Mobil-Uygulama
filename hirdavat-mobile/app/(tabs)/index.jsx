import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';

import AppHeader from '../../components/common/AppHeader';
import Loader from '../../components/common/Loader';
import Screen from '../../components/common/Screen';
import {
  fetchCustomerBalancesReport,
  fetchDashboardSummary,
  fetchSalesReport,
  fetchTopProducts,
} from '../../api/dashboard';
import { formatCurrency } from '../../utils/formatCurrency';
import { colors, radius, spacing } from '../../utils/theme';

const screenWidth = Dimensions.get('window').width - spacing.lg * 2 - spacing.md * 2;

const chartConfig = {
  backgroundGradientFrom: colors.card,
  backgroundGradientTo: colors.card,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(25, 135, 84, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
  propsForDots: { r: '3' },
  propsForLabels: { fontSize: 10 },
};

const PIE_COLORS = ['#198754', '#20c997', '#ffc107', '#fd7e14', '#dc3545', '#6f42c1'];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [topProducts, setTopProducts] = useState(null);
  const [balances, setBalances] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
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
    }, []),
  );

  if (isLoading || !summary) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <AppHeader />
        <Loader fullscreen />
      </View>
    );
  }

  const salesLabels = salesReport.results.map((r, i) => {
    if (salesReport.results.length > 7 && i % 2 !== 0) return '';
    const d = new Date(r.period);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}.${month}`;
  });
  const salesData = salesReport.results.map((r) => Number(r.total_amount));

  const topProductsLabels = topProducts.results.map((_, i) => String(i + 1));
  const topProductsData = topProducts.results.map((p) => Number(p.total_quantity));

  const pieData = balances.debtors.slice(0, 6).map((d, i) => ({
    name: d.customer_name,
    population: Number(d.balance),
    color: PIE_COLORS[i % PIE_COLORS.length],
    legendFontColor: colors.textSecondary,
    legendFontSize: 11,
  }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader />
      <Screen>
        <View style={styles.grid}>
          <SummaryCard label="Bugünkü Satış" value={formatCurrency(summary.today.total_amount)} sub={`${summary.today.sale_count} satış`} valueColor={colors.accent} />
          <SummaryCard label="Bu Ay" value={formatCurrency(summary.month_total_amount)} />
          <SummaryCard label="Kritik Stok" value={`${summary.low_stock_count} ürün`} valueColor={summary.low_stock_count > 0 ? colors.warning : colors.text} />
          <SummaryCard label="Toplam Veresiye" value={formatCurrency(summary.total_customer_debt)} valueColor={colors.danger} />
        </View>

        <ChartCard title="Son 14 Gün Satış">
          {salesReport.results.length === 0 ? (
            <Text style={styles.emptyText}>Henüz satış verisi yok.</Text>
          ) : (
            <LineChart
              data={{ labels: salesLabels, datasets: [{ data: salesData }] }}
              width={screenWidth}
              height={240}
              chartConfig={chartConfig}
              bezier
              withInnerLines={false}
              style={styles.chart}
            />
          )}
        </ChartCard>

        <ChartCard title="En Çok Satan Ürünler">
          {topProducts.results.length === 0 ? (
            <Text style={styles.emptyText}>Henüz satış verisi yok.</Text>
          ) : (
            <>
              <View style={styles.legendWrap}>
                {topProducts.results.map((p, i) => (
                  <Text key={p.product_id ?? i} style={styles.legendItem} numberOfLines={1}>
                    <Text style={styles.legendIndex}>{i + 1}. </Text>
                    {p.product__name}
                  </Text>
                ))}
              </View>
              <BarChart
                data={{ labels: topProductsLabels, datasets: [{ data: topProductsData }] }}
                width={screenWidth}
                height={180}
                chartConfig={chartConfig}
                yAxisLabel=""
                yAxisSuffix=""
                fromZero
                style={styles.chart}
              />
            </>
          )}
        </ChartCard>

        <ChartCard title="Veresiye Dağılımı">
          {pieData.length === 0 ? (
            <Text style={styles.emptyText}>Borçlu müşteri yok.</Text>
          ) : (
            <PieChart
              data={pieData}
              width={screenWidth}
              height={180}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="8"
            />
          )}
        </ChartCard>
      </Screen>
    </View>
  );
}

function SummaryCard({ label, value, sub, valueColor }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={[styles.cardValue, valueColor && { color: valueColor }]}>{value}</Text>
      {sub ? <Text style={styles.cardSub}>{sub}</Text> : null}
    </View>
  );
}

function ChartCard({ title, children }) {
  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  card: {
    width: '47%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  cardLabel: { fontSize: 12, color: colors.textSecondary },
  cardValue: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 4 },
  cardSub: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  chartCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  chartTitle: { fontWeight: '700', marginBottom: spacing.sm },
  chart: { borderRadius: radius.sm },
  emptyText: { color: colors.textSecondary, fontSize: 13 },
  legendWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  legendItem: {
    fontSize: 11,
    color: colors.text,
    maxWidth: '47%',
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  legendIndex: { fontWeight: '800', color: colors.accent },
});
