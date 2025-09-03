import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import {
  Button,
  Card,
  Layout,
  Page,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  DataTable,
  Select,
  Icon,
  ProgressBar,
  Box,
  Divider,
} from "@shopify/polaris";
import { 
  StarIcon, 
  ArrowUpIcon, 
  ArrowDownIcon
} from '@shopify/polaris-icons';
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  // Mock analytics data
  const analyticsData = {
    overview: {
      totalReviews: { current: 1456, previous: 1287, change: 13.1 },
      averageRating: { current: 4.3, previous: 4.1, change: 4.9 },
      reviewConversionRate: { current: 12.8, previous: 11.2, change: 14.3 },
      responseRate: { current: 34.5, previous: 28.9, change: 19.4 }
    },
    
    reviewTrends: {
      last7Days: [12, 15, 8, 22, 18, 25, 19],
      last30Days: [340, 380, 290, 420, 350, 480, 390, 310, 450, 380, 520, 440, 360, 490, 410, 330, 460, 390, 540, 420, 380, 510, 440, 370, 490, 420, 360, 480, 410, 330],
      ratingDistribution: {
        5: 678,
        4: 423,
        3: 201,
        2: 98,
        1: 56
      }
    },
    
    topProducts: [
      { name: "Premium T-Shirt", reviews: 89, avgRating: 4.8, trend: "up" },
      { name: "Summer Dress", reviews: 76, avgRating: 4.6, trend: "up" },
      { name: "Running Shoes", reviews: 64, avgRating: 4.2, trend: "down" },
      { name: "Winter Jacket", reviews: 58, avgRating: 4.5, trend: "up" },
      { name: "Casual Pants", reviews: 45, avgRating: 3.9, trend: "down" }
    ],
    
    needsAttention: [
      { name: "Blue Hoodie", reviews: 23, avgRating: 2.8, issue: "Low rating" },
      { name: "Black Jeans", reviews: 0, avgRating: 0, issue: "No reviews" },
      { name: "Red Sneakers", reviews: 8, avgRating: 3.1, issue: "Low rating" }
    ],
    
    customerInsights: {
      topReviewers: [
        { name: "Sarah J.", reviews: 15, avgRating: 4.7 },
        { name: "Mike D.", reviews: 12, avgRating: 4.2 },
        { name: "Emma W.", reviews: 11, avgRating: 4.8 }
      ],
      reviewsByCustomerType: {
        new: 45,
        returning: 55
      },
      averageWordsPerReview: 28,
      reviewsByTimeOfDay: {
        morning: 25,
        afternoon: 35,
        evening: 40
      }
    },
    
    emailCampaigns: {
      totalSent: 3450,
      openRate: 23.8,
      clickRate: 7.2,
      conversionRate: 4.1,
      recentCampaigns: [
        { template: "Default", sent: 1200, opens: 294, clicks: 89, reviews: 52 },
        { template: "Friendly", sent: 980, opens: 245, clicks: 78, reviews: 43 },
        { template: "Professional", sent: 1270, opens: 278, clicks: 85, reviews: 48 }
      ]
    },
    
    moderationStats: {
      totalProcessed: 1456,
      autoApproved: 1201,
      manuallyApproved: 167,
      rejected: 88,
      flaggedKeywords: [
        { word: "fake", count: 15 },
        { word: "spam", count: 12 },
        { word: "bot", count: 8 }
      ],
      averageProcessingTime: "2.3 hours"
    }
  };

  return { analytics: analyticsData };
};

export default function Analytics() {
  const { analytics } = useLoaderData();
  const [timeRange, setTimeRange] = useState('30d');

  const formatChange = (change) => {
    const isPositive = change > 0;
    return (
      <InlineStack gap="100" align="center">
        <Icon 
          source={isPositive ? ArrowUpIcon : ArrowDownIcon} 
          tone={isPositive ? "success" : "critical"}
        />
        <Text 
          variant="bodySm" 
          tone={isPositive ? "success" : "critical"}
        >
          {isPositive ? '+' : ''}{change.toFixed(1)}%
        </Text>
      </InlineStack>
    );
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Icon
        key={index}
        source={StarIcon}
        tone={index < Math.round(rating) ? "warning" : "subdued"}
      />
    ));
  };

  const topProductRows = analytics.topProducts.map(product => [
    product.name,
    product.reviews.toString(),
    <InlineStack gap="100" align="center">
      <InlineStack gap="050">
        {renderStars(product.avgRating)}
      </InlineStack>
      <Text variant="bodySm">{product.avgRating}</Text>
    </InlineStack>,
    <Icon 
      source={product.trend === 'up' ? ArrowUpIcon : ArrowDownIcon}
      tone={product.trend === 'up' ? "success" : "critical"}
    />
  ]);

  const needsAttentionRows = analytics.needsAttention.map(product => [
    product.name,
    product.reviews.toString(),
    product.avgRating > 0 ? product.avgRating.toString() : "N/A",
    <Badge tone="critical">{product.issue}</Badge>
  ]);

  const campaignRows = analytics.emailCampaigns.recentCampaigns.map(campaign => [
    campaign.template,
    campaign.sent.toLocaleString(),
    `${((campaign.opens / campaign.sent) * 100).toFixed(1)}%`,
    `${((campaign.clicks / campaign.sent) * 100).toFixed(1)}%`,
    `${((campaign.reviews / campaign.sent) * 100).toFixed(1)}%`
  ]);

  return (
    <Page 
      fullWidth 
      title="Review Analytics" 
      backAction={{content: 'Dashboard', url: '/app'}}
      secondaryActions={[
        {
          content: 'Export Report',
          onAction: () => console.log('Export report')
        }
      ]}
    >
      <Layout>
        {/* Time Range Selector */}
        <Layout.Section>
          <InlineStack justify="end">
            <Select
              label="Time Range"
              labelInline
              options={[
                { label: 'Last 7 days', value: '7d' },
                { label: 'Last 30 days', value: '30d' },
                { label: 'Last 90 days', value: '90d' },
                { label: 'Last year', value: '1y' },
              ]}
              value={timeRange}
              onChange={setTimeRange}
            />
          </InlineStack>
        </Layout.Section>

        {/* Overview Metrics */}
        <Layout.Section>
          <InlineStack gap="400">
            <Card>
              <BlockStack gap="200">
                <InlineStack justify="space-between" align="start">
                  <BlockStack gap="100">
                    <Text variant="headingMd" as="h3">Total Reviews</Text>
                    <Text variant="heading2xl" as="p">{analytics.overview.totalReviews.current.toLocaleString()}</Text>
                  </BlockStack>
                  {formatChange(analytics.overview.totalReviews.change)}
                </InlineStack>
                <Text variant="bodySm" tone="subdued">
                  vs {analytics.overview.totalReviews.previous.toLocaleString()} last period
                </Text>
              </BlockStack>
            </Card>
            
            <Card>
              <BlockStack gap="200">
                <InlineStack justify="space-between" align="start">
                  <BlockStack gap="100">
                    <Text variant="headingMd" as="h3">Average Rating</Text>
                    <InlineStack gap="200" align="center">
                      <Text variant="heading2xl" as="p">{analytics.overview.averageRating.current}</Text>
                      <InlineStack gap="050">
                        {renderStars(analytics.overview.averageRating.current)}
                      </InlineStack>
                    </InlineStack>
                  </BlockStack>
                  {formatChange(analytics.overview.averageRating.change)}
                </InlineStack>
                <Text variant="bodySm" tone="subdued">
                  vs {analytics.overview.averageRating.previous} last period
                </Text>
              </BlockStack>
            </Card>
            
            <Card>
              <BlockStack gap="200">
                <InlineStack justify="space-between" align="start">
                  <BlockStack gap="100">
                    <Text variant="headingMd" as="h3">Conversion Rate</Text>
                    <Text variant="heading2xl" as="p">{analytics.overview.reviewConversionRate.current}%</Text>
                  </BlockStack>
                  {formatChange(analytics.overview.reviewConversionRate.change)}
                </InlineStack>
                <Text variant="bodySm" tone="subdued">
                  Reviews per 100 orders
                </Text>
              </BlockStack>
            </Card>
            
            <Card>
              <BlockStack gap="200">
                <InlineStack justify="space-between" align="start">
                  <BlockStack gap="100">
                    <Text variant="headingMd" as="h3">Email Response Rate</Text>
                    <Text variant="heading2xl" as="p">{analytics.overview.responseRate.current}%</Text>
                  </BlockStack>
                  {formatChange(analytics.overview.responseRate.change)}
                </InlineStack>
                <Text variant="bodySm" tone="subdued">
                  Email to review conversion
                </Text>
              </BlockStack>
            </Card>
          </InlineStack>
        </Layout.Section>

        {/* Rating Distribution */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingLg" as="h2">Rating Distribution</Text>
              <BlockStack gap="300">
                {Object.entries(analytics.reviewTrends.ratingDistribution)
                  .reverse()
                  .map(([rating, count]) => {
                    const total = Object.values(analytics.reviewTrends.ratingDistribution).reduce((a, b) => a + b, 0);
                    const percentage = (count / total) * 100;
                    return (
                      <InlineStack key={rating} gap="400" align="center">
                        <InlineStack gap="100" align="center">
                          <Text variant="bodyMd">{rating}</Text>
                          <Icon source={StarIcon} tone="warning" />
                        </InlineStack>
                        <Box minWidth="200px">
                          <ProgressBar progress={percentage} size="small" />
                        </Box>
                        <Text variant="bodyMd">{count} ({percentage.toFixed(1)}%)</Text>
                      </InlineStack>
                    );
                  })}
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Product Performance */}
        <Layout.Section>
          <InlineStack gap="400" align="start">
            <Card>
              <BlockStack gap="400">
                <Text variant="headingLg" as="h2">Top Performing Products</Text>
                <DataTable
                  columnContentTypes={['text', 'numeric', 'text', 'text']}
                  headings={['Product', 'Reviews', 'Avg Rating', 'Trend']}
                  rows={topProductRows}
                />
              </BlockStack>
            </Card>
            
            <Card>
              <BlockStack gap="400">
                <Text variant="headingLg" as="h2">Products Needing Attention</Text>
                <DataTable
                  columnContentTypes={['text', 'numeric', 'text', 'text']}
                  headings={['Product', 'Reviews', 'Avg Rating', 'Issue']}
                  rows={needsAttentionRows}
                />
              </BlockStack>
            </Card>
          </InlineStack>
        </Layout.Section>

        {/* Customer Insights */}
        <Layout.Section>
          <InlineStack gap="400" align="start">
            <Card>
              <BlockStack gap="400">
                <Text variant="headingLg" as="h2">Customer Insights</Text>
                <BlockStack gap="300">
                  <InlineStack justify="space-between">
                    <Text variant="bodyMd">Average words per review:</Text>
                    <Text variant="bodyMd" fontWeight="bold">{analytics.customerInsights.averageWordsPerReview}</Text>
                  </InlineStack>
                  
                  <Divider />
                  
                  <Text variant="headingMd" as="h3">Reviews by Customer Type</Text>
                  <InlineStack gap="400">
                    <BlockStack gap="100">
                      <Text variant="bodyMd">New Customers</Text>
                      <Text variant="heading2xl" as="p">{analytics.customerInsights.reviewsByCustomerType.new}%</Text>
                    </BlockStack>
                    <BlockStack gap="100">
                      <Text variant="bodyMd">Returning Customers</Text>
                      <Text variant="heading2xl" as="p">{analytics.customerInsights.reviewsByCustomerType.returning}%</Text>
                    </BlockStack>
                  </InlineStack>
                  
                  <Divider />
                  
                  <Text variant="headingMd" as="h3">Peak Review Times</Text>
                  <BlockStack gap="200">
                    <InlineStack justify="space-between">
                      <Text variant="bodyMd">Morning (6AM-12PM):</Text>
                      <Text variant="bodyMd">{analytics.customerInsights.reviewsByTimeOfDay.morning}%</Text>
                    </InlineStack>
                    <InlineStack justify="space-between">
                      <Text variant="bodyMd">Afternoon (12PM-6PM):</Text>
                      <Text variant="bodyMd">{analytics.customerInsights.reviewsByTimeOfDay.afternoon}%</Text>
                    </InlineStack>
                    <InlineStack justify="space-between">
                      <Text variant="bodyMd">Evening (6PM-12AM):</Text>
                      <Text variant="bodyMd">{analytics.customerInsights.reviewsByTimeOfDay.evening}%</Text>
                    </InlineStack>
                  </BlockStack>
                </BlockStack>
              </BlockStack>
            </Card>
            
            <Card>
              <BlockStack gap="400">
                <Text variant="headingLg" as="h2">Top Reviewers</Text>
                <BlockStack gap="300">
                  {analytics.customerInsights.topReviewers.map((reviewer) => (
                    <InlineStack key={reviewer.name} justify="space-between" align="center">
                      <BlockStack gap="100">
                        <Text variant="bodyMd" fontWeight="bold">{reviewer.name}</Text>
                        <Text variant="bodySm" tone="subdued">{reviewer.reviews} reviews</Text>
                      </BlockStack>
                      <InlineStack gap="100" align="center">
                        <InlineStack gap="050">
                          {renderStars(reviewer.avgRating)}
                        </InlineStack>
                        <Text variant="bodySm">{reviewer.avgRating}</Text>
                      </InlineStack>
                    </InlineStack>
                  ))}
                </BlockStack>
              </BlockStack>
            </Card>
          </InlineStack>
        </Layout.Section>

        {/* Email Campaign Performance */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingLg" as="h2">Email Campaign Performance</Text>
              
              <InlineStack gap="400">
                <BlockStack gap="100">
                  <Text variant="headingMd" as="h3">Total Sent</Text>
                  <Text variant="heading2xl" as="p">{analytics.emailCampaigns.totalSent.toLocaleString()}</Text>
                </BlockStack>
                <BlockStack gap="100">
                  <Text variant="headingMd" as="h3">Open Rate</Text>
                  <Text variant="heading2xl" as="p">{analytics.emailCampaigns.openRate}%</Text>
                </BlockStack>
                <BlockStack gap="100">
                  <Text variant="headingMd" as="h3">Click Rate</Text>
                  <Text variant="heading2xl" as="p">{analytics.emailCampaigns.clickRate}%</Text>
                </BlockStack>
                <BlockStack gap="100">
                  <Text variant="headingMd" as="h3">Conversion Rate</Text>
                  <Text variant="heading2xl" as="p">{analytics.emailCampaigns.conversionRate}%</Text>
                </BlockStack>
              </InlineStack>
              
              <Text variant="headingMd" as="h3">Campaign Performance by Template</Text>
              <DataTable
                columnContentTypes={['text', 'numeric', 'numeric', 'numeric', 'numeric']}
                headings={['Template', 'Sent', 'Open Rate', 'Click Rate', 'Review Rate']}
                rows={campaignRows}
              />
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Moderation Statistics */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingLg" as="h2">Moderation Statistics</Text>
              
              <InlineStack gap="400">
                <BlockStack gap="100">
                  <Text variant="headingMd" as="h3">Total Processed</Text>
                  <Text variant="heading2xl" as="p">{analytics.moderationStats.totalProcessed.toLocaleString()}</Text>
                </BlockStack>
                <BlockStack gap="100">
                  <Text variant="headingMd" as="h3">Auto-Approved</Text>
                  <Text variant="heading2xl" as="p" tone="success">{analytics.moderationStats.autoApproved.toLocaleString()}</Text>
                </BlockStack>
                <BlockStack gap="100">
                  <Text variant="headingMd" as="h3">Manual Review</Text>
                  <Text variant="heading2xl" as="p" tone="attention">{analytics.moderationStats.manuallyApproved.toLocaleString()}</Text>
                </BlockStack>
                <BlockStack gap="100">
                  <Text variant="headingMd" as="h3">Rejected</Text>
                  <Text variant="heading2xl" as="p" tone="critical">{analytics.moderationStats.rejected.toLocaleString()}</Text>
                </BlockStack>
              </InlineStack>
              
              <Text variant="bodySm" tone="subdued">
                Average processing time: {analytics.moderationStats.averageProcessingTime}
              </Text>
              
              <Text variant="headingMd" as="h3">Most Flagged Keywords</Text>
              <BlockStack gap="200">
                {analytics.moderationStats.flaggedKeywords.map(keyword => (
                  <InlineStack key={keyword.word} justify="space-between">
                    <Text variant="bodyMd">"{keyword.word}"</Text>
                    <Badge>{keyword.count} times</Badge>
                  </InlineStack>
                ))}
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}