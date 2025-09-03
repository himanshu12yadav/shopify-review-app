import { Link, useLoaderData } from "@remix-run/react";
import {
  Badge,
  BlockStack,
  Button,
  Card,
  DataTable,
  EmptyState,
  Icon,
  InlineStack,
  Layout,
  Page,
  Text,
} from "@shopify/polaris";
import { StarIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  const mockReviews = [
    {
      id: "1",
      productTitle: "Premium T-Shirt",
      customerName: "John Doe",
      rating: 5,
      comment: "Great quality! Highly recommend.",
      date: "2025-09-01",
      status: "published",
    },
    {
      id: "2",
      productTitle: "Summer Dress",
      customerName: "Jane Smith",
      rating: 4,
      comment: "Nice fit and comfortable fabric.",
      date: "2025-08-30",
      status: "published",
    },
    {
      id: "3",
      productTitle: "Running Shoes",
      customerName: "Mike Johnson",
      rating: 5,
      comment: "Perfect for my morning runs!",
      date: "2025-08-28",
      status: "pending",
    },
  ];

  const stats = {
    totalReviews: 156,
    averageRating: 4.3,
    pendingReviews: 12,
    publishedReviews: 144,
  };

  return { reviews: mockReviews, stats };
};

export default function Index() {
  const { reviews, stats } = useLoaderData();

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Icon
        key={index}
        source={StarIcon}
        tone={index < rating ? "warning" : "subdued"}
      />
    ));
  };

  const reviewRows = reviews.map((review) => [
    review.productTitle,
    review.customerName,
    <InlineStack gap="100" align="center">
      <InlineStack gap="050">{renderStars(review.rating)}</InlineStack>
      <Text variant="bodySm">{review.rating}/5</Text>
    </InlineStack>,
    review.comment.length > 50
      ? review.comment.substring(0, 50) + "..."
      : review.comment,
    review.date,
    <Badge tone={review.status === "published" ? "success" : "attention"}>
      {review.status}
    </Badge>,
    <Link to={`/app/review/${review.id}`}>
      <Button size="slim" variant="tertiary">
        View
      </Button>
    </Link>,
  ]);

  return (
    <Page fullWidth title="Review Dashboard">
      <Layout>
        {/* Stats Section */}
        <Layout.Section>
          <InlineStack gap="400">
            <Card>
              <BlockStack gap="200">
                <Text variant="headingMd" as="h3">
                  Total Reviews
                </Text>
                <Text variant="heading2xl" as="p">
                  {stats.totalReviews}
                </Text>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="200">
                <Text variant="headingMd" as="h3">
                  Average Rating
                </Text>
                <InlineStack gap="200" align="center">
                  <Text variant="heading2xl" as="p">
                    {stats.averageRating}
                  </Text>
                  <InlineStack gap="050">
                    {renderStars(Math.round(stats.averageRating))}
                  </InlineStack>
                </InlineStack>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="200">
                <Text variant="headingMd" as="h3">
                  Pending Reviews
                </Text>
                <Text variant="heading2xl" as="p" tone="critical">
                  {stats.pendingReviews}
                </Text>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="200">
                <Text variant="headingMd" as="h3">
                  Published Reviews
                </Text>
                <Text variant="heading2xl" as="p" tone="success">
                  {stats.publishedReviews}
                </Text>
              </BlockStack>
            </Card>
          </InlineStack>
        </Layout.Section>

        {/* Recent Reviews Section */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <div style={{ position: 'relative' }}>
                <Text variant="headingLg" as="h2">
                  Recent Reviews
                </Text>
                <div style={{ position: 'absolute', top: 0, right: 0 }}>
                  <Link to="/app/reviews">
                    <Button variant="primary" size="slim">
                      Manage All Reviews
                    </Button>
                  </Link>
                </div>
              </div>

              {reviews.length > 0 ? (
                <DataTable
                  columnContentTypes={[
                    "text",
                    "text",
                    "text",
                    "text",
                    "text",
                    "text",
                    "text",
                  ]}
                  headings={[
                    "Product",
                    "Customer",
                    "Rating",
                    "Comment",
                    "Date",
                    "Status",
                    "Action",
                  ]}
                  rows={reviewRows}
                />
              ) : (
                <EmptyState
                  heading="No reviews yet"
                  action={{ content: "Learn more", url: "#" }}
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>When customers leave reviews, they'll appear here.</p>
                </EmptyState>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Quick Actions Section */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingLg" as="h2">
                Quick Actions
              </Text>
              <InlineStack gap="300">
                <Button variant="primary">Export Reviews</Button>
                <Link to="/app/settings">
                  <Button>Review Settings</Button>
                </Link>
                <Button>Email Templates</Button>
                <Link to="/app/analytics">
                  <Button>Analytics</Button>
                </Link>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
