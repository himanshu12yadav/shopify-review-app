import { useLoaderData, useFetcher } from "@remix-run/react";
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
  Icon,
  Divider,
  TextField,
  Modal,
} from "@shopify/polaris";
import { StarIcon, EditIcon, DeleteIcon } from '@shopify/polaris-icons';
import { authenticate } from "../shopify.server";

export const loader = async ({ request, params }) => {
  await authenticate.admin(request);
  
  const reviewId = params.id;
  
  // Mock review data - in real app, fetch from database by ID
  const reviewData = {
    "1": {
      id: "1",
      productTitle: "Premium T-Shirt",
      productId: "gid://shopify/Product/1",
      productImage: "https://via.placeholder.com/150",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      rating: 5,
      comment: "Great quality! The fabric feels premium and the fit is perfect. I've washed it multiple times and it still looks new. Highly recommend this product to anyone looking for a quality t-shirt. The shipping was fast and the packaging was excellent.",
      date: "2025-09-01",
      status: "published",
      verified: true,
      helpfulVotes: 12,
      unhelpfulVotes: 2,
      customerOrderId: "#1001",
      reviewHistory: [
        { action: "Created", date: "2025-09-01 10:30 AM", by: "Customer" },
        { action: "Auto-approved", date: "2025-09-01 10:31 AM", by: "System" },
        { action: "Published", date: "2025-09-01 10:31 AM", by: "System" }
      ]
    },
    "2": {
      id: "2",
      productTitle: "Summer Dress",
      productId: "gid://shopify/Product/2",
      productImage: "https://via.placeholder.com/150",
      customerName: "Jane Smith",
      customerEmail: "jane@example.com",
      rating: 4,
      comment: "Nice fit and comfortable fabric. The color is exactly as shown in the photos. Only minor complaint is that it wrinkles easily, but overall very satisfied with this purchase.",
      date: "2025-08-30",
      status: "published",
      verified: true,
      helpfulVotes: 8,
      unhelpfulVotes: 1,
      customerOrderId: "#1002",
      reviewHistory: [
        { action: "Created", date: "2025-08-30 2:15 PM", by: "Customer" },
        { action: "Pending review", date: "2025-08-30 2:15 PM", by: "System" },
        { action: "Approved", date: "2025-08-30 3:45 PM", by: "Admin" },
        { action: "Published", date: "2025-08-30 3:45 PM", by: "System" }
      ]
    },
    "3": {
      id: "3",
      productTitle: "Running Shoes",
      productId: "gid://shopify/Product/3",
      productImage: "https://via.placeholder.com/150",
      customerName: "Mike Johnson",
      customerEmail: "mike@example.com",
      rating: 5,
      comment: "Perfect for my morning runs! Great cushioning and support. I've been using them for 3 months now and they're holding up well. Would definitely buy again.",
      date: "2025-08-28",
      status: "pending",
      verified: true,
      helpfulVotes: 0,
      unhelpfulVotes: 0,
      customerOrderId: "#1003",
      reviewHistory: [
        { action: "Created", date: "2025-08-28 7:22 AM", by: "Customer" },
        { action: "Pending review", date: "2025-08-28 7:22 AM", by: "System" }
      ]
    }
  };

  const review = reviewData[reviewId];
  
  if (!review) {
    throw new Response("Review not found", { status: 404 });
  }

  return { review };
};

export const action = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");
  const reviewId = params.id;
  
  switch (action) {
    case "approve":
      return { success: true, message: "Review approved successfully" };
    case "reject":
      return { success: true, message: "Review rejected successfully" };
    case "delete":
      return { success: true, message: "Review deleted successfully" };
    case "update":
      const updatedComment = formData.get("comment");
      return { success: true, message: "Review updated successfully" };
    default:
      return { success: false, message: "Invalid action" };
  }
};

export default function ReviewDetail() {
  const { review } = useLoaderData();
  const fetcher = useFetcher();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedComment, setEditedComment] = useState(review.comment);
  const [deleteModalActive, setDeleteModalActive] = useState(false);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Icon
        key={index}
        source={StarIcon}
        tone={index < rating ? "warning" : "subdued"}
      />
    ));
  };

  const handleAction = (action, data = {}) => {
    const formData = new FormData();
    formData.append('action', action);
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    fetcher.submit(formData, { method: "post" });
  };

  const handleSaveEdit = () => {
    handleAction('update', { comment: editedComment });
    setIsEditing(false);
  };

  return (
    <Page 
      title={`Review by ${review.customerName}`}
      backAction={{content: 'Back to Dashboard', url: '/app'}}
      secondaryActions={[
        {
          content: 'Edit Review',
          icon: EditIcon,
          onAction: () => setIsEditing(true)
        },
        {
          content: 'Delete Review',
          icon: DeleteIcon,
          destructive: true,
          onAction: () => setDeleteModalActive(true)
        }
      ]}
    >
      <Layout>
        {/* Review Overview */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack justify="space-between" align="start">
                <BlockStack gap="200">
                  <Text variant="headingLg" as="h2">Review Details</Text>
                  <InlineStack gap="200" align="center">
                    <Badge tone={
                      review.status === 'published' ? 'success' : 
                      review.status === 'pending' ? 'attention' : 'critical'
                    }>
                      {review.status}
                    </Badge>
                    {review.verified && <Badge tone="info">Verified Purchase</Badge>}
                  </InlineStack>
                </BlockStack>
                
                {review.status === 'pending' && (
                  <InlineStack gap="200">
                    <Button 
                      variant="primary"
                      onClick={() => handleAction('approve')}
                      loading={fetcher.state === 'submitting'}
                    >
                      Approve Review
                    </Button>
                    <Button 
                      tone="critical"
                      onClick={() => handleAction('reject')}
                      loading={fetcher.state === 'submitting'}
                    >
                      Reject Review
                    </Button>
                  </InlineStack>
                )}
              </InlineStack>

              <Divider />

              {/* Product Information */}
              <BlockStack gap="300">
                <Text variant="headingMd" as="h3">Product</Text>
                <InlineStack gap="400" align="start">
                  <img 
                    src={review.productImage} 
                    alt={review.productTitle}
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                  <BlockStack gap="100">
                    <Text variant="bodyLg" fontWeight="bold">{review.productTitle}</Text>
                    <Text variant="bodySm" tone="subdued">Product ID: {review.productId}</Text>
                  </BlockStack>
                </InlineStack>
              </BlockStack>

              <Divider />

              {/* Customer Information */}
              <BlockStack gap="300">
                <Text variant="headingMd" as="h3">Customer</Text>
                <BlockStack gap="200">
                  <InlineStack justify="space-between">
                    <Text variant="bodyMd">Name:</Text>
                    <Text variant="bodyMd" fontWeight="bold">{review.customerName}</Text>
                  </InlineStack>
                  <InlineStack justify="space-between">
                    <Text variant="bodyMd">Email:</Text>
                    <Text variant="bodyMd">{review.customerEmail}</Text>
                  </InlineStack>
                  <InlineStack justify="space-between">
                    <Text variant="bodyMd">Order:</Text>
                    <Text variant="bodyMd">{review.customerOrderId}</Text>
                  </InlineStack>
                </BlockStack>
              </BlockStack>

              <Divider />

              {/* Review Content */}
              <BlockStack gap="300">
                <Text variant="headingMd" as="h3">Review</Text>
                <InlineStack gap="200" align="center">
                  <Text variant="bodyMd">Rating:</Text>
                  <InlineStack gap="100" align="center">
                    <InlineStack gap="050">
                      {renderStars(review.rating)}
                    </InlineStack>
                    <Text variant="bodyMd" fontWeight="bold">{review.rating}/5 stars</Text>
                  </InlineStack>
                </InlineStack>
                
                <InlineStack justify="space-between">
                  <Text variant="bodyMd">Date:</Text>
                  <Text variant="bodyMd">{review.date}</Text>
                </InlineStack>
                
                <BlockStack gap="200">
                  <Text variant="bodyMd" fontWeight="bold">Comment:</Text>
                  {isEditing ? (
                    <BlockStack gap="200">
                      <TextField
                        value={editedComment}
                        onChange={setEditedComment}
                        multiline={4}
                        autoComplete="off"
                      />
                      <InlineStack gap="200">
                        <Button variant="primary" onClick={handleSaveEdit}>Save</Button>
                        <Button onClick={() => {
                          setIsEditing(false);
                          setEditedComment(review.comment);
                        }}>Cancel</Button>
                      </InlineStack>
                    </BlockStack>
                  ) : (
                    <Card background="bg-surface-secondary">
                      <Text variant="bodyMd">{review.comment}</Text>
                    </Card>
                  )}
                </BlockStack>
              </BlockStack>

              {/* Review Engagement */}
              {review.status === 'published' && (
                <>
                  <Divider />
                  <BlockStack gap="200">
                    <Text variant="headingMd" as="h3">Customer Engagement</Text>
                    <InlineStack gap="400">
                      <Text variant="bodyMd">👍 {review.helpfulVotes} found this helpful</Text>
                      <Text variant="bodyMd">👎 {review.unhelpfulVotes} found this unhelpful</Text>
                    </InlineStack>
                  </BlockStack>
                </>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Review History */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingLg" as="h2">Review History</Text>
              <BlockStack gap="300">
                {review.reviewHistory.map((entry, index) => (
                  <InlineStack key={index} justify="space-between" align="center">
                    <BlockStack gap="100">
                      <Text variant="bodyMd" fontWeight="bold">{entry.action}</Text>
                      <Text variant="bodySm" tone="subdued">by {entry.by}</Text>
                    </BlockStack>
                    <Text variant="bodySm">{entry.date}</Text>
                  </InlineStack>
                ))}
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalActive}
        onClose={() => setDeleteModalActive(false)}
        title="Delete Review"
        primaryAction={{
          content: 'Delete Review',
          destructive: true,
          onAction: () => {
            handleAction('delete');
            setDeleteModalActive(false);
          }
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setDeleteModalActive(false)
          }
        ]}
      >
        <Modal.Section>
          <Text variant="bodyMd">
            Are you sure you want to delete this review by {review.customerName}? This action cannot be undone.
          </Text>
        </Modal.Section>
      </Modal>
    </Page>
  );
}