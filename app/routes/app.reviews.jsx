import { useLoaderData, useFetcher, useSearchParams } from "@remix-run/react";
import { useState, useCallback } from "react";
import {
  Button,
  Card,
  Layout,
  Page,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  IndexTable,
  TextField,
  Select,
  Filters,
  ChoiceList,
  Icon,
  Modal,
  TextContainer,
  useIndexResourceState,
  Pagination,
} from "@shopify/polaris";
import { StarIcon, DeleteIcon, EditIcon } from '@shopify/polaris-icons';
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  const mockReviews = [
    {
      id: "1",
      productTitle: "Premium T-Shirt",
      productId: "gid://shopify/Product/1",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      rating: 5,
      comment: "Great quality! The fabric feels premium and the fit is perfect. I've washed it multiple times and it still looks new. Highly recommend this product to anyone looking for a quality t-shirt.",
      date: "2025-09-01",
      status: "published"
    },
    {
      id: "2", 
      productTitle: "Summer Dress",
      productId: "gid://shopify/Product/2",
      customerName: "Jane Smith",
      customerEmail: "jane@example.com",
      rating: 4,
      comment: "Nice fit and comfortable fabric. The color is exactly as shown in the photos. Only minor complaint is that it wrinkles easily.",
      date: "2025-08-30",
      status: "published"
    },
    {
      id: "3",
      productTitle: "Running Shoes",
      productId: "gid://shopify/Product/3",
      customerName: "Mike Johnson",
      customerEmail: "mike@example.com",
      rating: 5,
      comment: "Perfect for my morning runs! Great cushioning and support. I've been using them for 3 months now and they're holding up well.",
      date: "2025-08-28",
      status: "pending"
    },
    {
      id: "4",
      productTitle: "Winter Jacket",
      productId: "gid://shopify/Product/4",
      customerName: "Sarah Wilson",
      customerEmail: "sarah@example.com",
      rating: 3,
      comment: "The jacket is warm but the sizing runs small. I had to return it for a larger size.",
      date: "2025-08-25",
      status: "pending"
    },
    {
      id: "5",
      productTitle: "Premium T-Shirt",
      productId: "gid://shopify/Product/1",
      customerName: "David Brown",
      customerEmail: "david@example.com", 
      rating: 5,
      comment: "Excellent quality and fast shipping!",
      date: "2025-08-22",
      status: "published"
    },
    {
      id: "6",
      productTitle: "Casual Pants",
      productId: "gid://shopify/Product/5",
      customerName: "Emma Davis",
      customerEmail: "emma@example.com",
      rating: 2,
      comment: "The material feels cheap and the stitching came undone after one wash. Very disappointed.",
      date: "2025-08-20",
      status: "rejected"
    }
  ];

  return { reviews: mockReviews };
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");
  const reviewId = formData.get("reviewId");
  
  switch (action) {
    case "approve":
      // Update review status to published
      return { success: true, message: "Review approved successfully" };
    case "reject":
      // Update review status to rejected
      return { success: true, message: "Review rejected successfully" };
    case "delete":
      // Delete review
      return { success: true, message: "Review deleted successfully" };
    default:
      return { success: false, message: "Invalid action" };
  }
};

export default function Reviews() {
  const { reviews } = useLoaderData();
  const fetcher = useFetcher();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [queryValue, setQueryValue] = useState('');
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedRating, setSelectedRating] = useState([]);
  const [sortValue, setSortValue] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState(null);
  const [modalActive, setModalActive] = useState(false);
  
  const itemsPerPage = 10;

  const handleQueryValueChange = useCallback((value) => setQueryValue(value), []);
  const handleQueryValueRemove = useCallback(() => setQueryValue(''), []);
  const handleClearAll = useCallback(() => {
    setQueryValue('');
    setSelectedStatus([]);
    setSelectedRating([]);
  }, []);

  const handleStatusChange = useCallback((value) => setSelectedStatus(value), []);
  const handleRatingChange = useCallback((value) => setSelectedRating(value), []);
  const handleSortChange = useCallback((value) => setSortValue(value), []);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Icon
        key={index}
        source={StarIcon}
        tone={index < rating ? "warning" : "subdued"}
      />
    ));
  };

  const filteredReviews = reviews
    .filter((review) => {
      const matchesQuery = queryValue === '' || 
        review.productTitle.toLowerCase().includes(queryValue.toLowerCase()) ||
        review.customerName.toLowerCase().includes(queryValue.toLowerCase()) ||
        review.comment.toLowerCase().includes(queryValue.toLowerCase());
      
      const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(review.status);
      const matchesRating = selectedRating.length === 0 || selectedRating.includes(review.rating.toString());
      
      return matchesQuery && matchesStatus && matchesRating;
    })
    .sort((a, b) => {
      switch (sortValue) {
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'rating-desc':
          return b.rating - a.rating;
        case 'rating-asc':
          return a.rating - b.rating;
        case 'product':
          return a.productTitle.localeCompare(b.productTitle);
        default:
          return 0;
      }
    });

  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(paginatedReviews);

  const handleBulkAction = (action) => {
    selectedResources.forEach(reviewId => {
      fetcher.submit(
        { action, reviewId },
        { method: "post" }
      );
    });
  };

  const handleSingleAction = (action, reviewId) => {
    fetcher.submit(
      { action, reviewId },
      { method: "post" }
    );
  };

  const promotedBulkActions = [
    {
      content: 'Approve selected',
      onAction: () => handleBulkAction('approve'),
    },
    {
      content: 'Reject selected',
      onAction: () => handleBulkAction('reject'),
    },
  ];

  const bulkActions = [
    {
      content: 'Delete selected',
      destructive: true,
      onAction: () => handleBulkAction('delete'),
    },
  ];

  const resourceName = {
    singular: 'review',
    plural: 'reviews',
  };

  const rowMarkup = paginatedReviews.map(
    ({ id, productTitle, customerName, rating, comment, date, status, customerEmail }, index) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold">
            {productTitle}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <BlockStack gap="100">
            <Text variant="bodyMd">{customerName}</Text>
            <Text variant="bodySm" tone="subdued">{customerEmail}</Text>
          </BlockStack>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <InlineStack gap="100" align="center">
            <InlineStack gap="050">
              {renderStars(rating)}
            </InlineStack>
            <Text variant="bodySm">{rating}/5</Text>
          </InlineStack>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text variant="bodyMd">
            {comment.length > 80 ? comment.substring(0, 80) + "..." : comment}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text variant="bodyMd">{date}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Badge tone={
            status === 'published' ? 'success' : 
            status === 'pending' ? 'attention' : 'critical'
          }>
            {status}
          </Badge>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <InlineStack gap="100">
            <Button 
              size="slim" 
              variant="tertiary"
              onClick={() => {
                setSelectedReview({ id, productTitle, customerName, rating, comment, date, status, customerEmail });
                setModalActive(true);
              }}
            >
              <Icon source={EditIcon} />
            </Button>
            {status === 'pending' && (
              <>
                <Button 
                  size="slim" 
                  variant="primary"
                  onClick={() => handleSingleAction('approve', id)}
                >
                  Approve
                </Button>
                <Button 
                  size="slim" 
                  tone="critical"
                  onClick={() => handleSingleAction('reject', id)}
                >
                  Reject
                </Button>
              </>
            )}
            <Button 
              size="slim" 
              tone="critical"
              variant="tertiary"
              onClick={() => handleSingleAction('delete', id)}
            >
              <Icon source={DeleteIcon} />
            </Button>
          </InlineStack>
        </IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  const filters = [
    {
      key: 'status',
      label: 'Status',
      filter: (
        <ChoiceList
          title="Review status"
          titleHidden
          choices={[
            { label: 'Published', value: 'published' },
            { label: 'Pending', value: 'pending' },
            { label: 'Rejected', value: 'rejected' },
          ]}
          selected={selectedStatus}
          onChange={handleStatusChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: 'rating',
      label: 'Rating',
      filter: (
        <ChoiceList
          title="Review rating"
          titleHidden
          choices={[
            { label: '5 stars', value: '5' },
            { label: '4 stars', value: '4' },
            { label: '3 stars', value: '3' },
            { label: '2 stars', value: '2' },
            { label: '1 star', value: '1' },
          ]}
          selected={selectedRating}
          onChange={handleRatingChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
  ];

  const appliedFilters = [];
  if (selectedStatus.length > 0) {
    appliedFilters.push({
      key: 'status',
      label: `Status: ${selectedStatus.join(', ')}`,
      onRemove: () => setSelectedStatus([]),
    });
  }
  if (selectedRating.length > 0) {
    appliedFilters.push({
      key: 'rating',
      label: `Rating: ${selectedRating.join(', ')} stars`,
      onRemove: () => setSelectedRating([]),
    });
  }

  return (
    <Page fullWidth title="Manage Reviews" backAction={{content: 'Dashboard', url: '/app'}}>
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack justify="space-between" align="center">
                <Text variant="headingLg" as="h2">All Reviews ({filteredReviews.length})</Text>
                <InlineStack gap="200">
                  <Select
                    label="Sort by"
                    labelInline
                    options={[
                      { label: 'Date (newest first)', value: 'date-desc' },
                      { label: 'Date (oldest first)', value: 'date-asc' },
                      { label: 'Rating (highest first)', value: 'rating-desc' },
                      { label: 'Rating (lowest first)', value: 'rating-asc' },
                      { label: 'Product name', value: 'product' },
                    ]}
                    value={sortValue}
                    onChange={handleSortChange}
                  />
                  <Button variant="primary">Export Reviews</Button>
                </InlineStack>
              </InlineStack>

              <Filters
                queryValue={queryValue}
                filters={filters}
                appliedFilters={appliedFilters}
                onQueryChange={handleQueryValueChange}
                onQueryClear={handleQueryValueRemove}
                onClearAll={handleClearAll}
                queryPlaceholder="Search reviews, products, or customers"
              />

              <IndexTable
                resourceName={resourceName}
                itemCount={paginatedReviews.length}
                selectedItemsCount={
                  allResourcesSelected ? 'All' : selectedResources.length
                }
                onSelectionChange={handleSelectionChange}
                promotedBulkActions={promotedBulkActions}
                bulkActions={bulkActions}
                headings={[
                  { title: 'Product' },
                  { title: 'Customer' },
                  { title: 'Rating' },
                  { title: 'Comment' },
                  { title: 'Date' },
                  { title: 'Status' },
                  { title: 'Actions' },
                ]}
              >
                {rowMarkup}
              </IndexTable>

              {totalPages > 1 && (
                <InlineStack justify="center">
                  <Pagination
                    hasPrevious={currentPage > 1}
                    onPrevious={() => setCurrentPage(currentPage - 1)}
                    hasNext={currentPage < totalPages}
                    onNext={() => setCurrentPage(currentPage + 1)}
                    label={`Page ${currentPage} of ${totalPages}`}
                  />
                </InlineStack>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>

      {selectedReview && (
        <Modal
          open={modalActive}
          onClose={() => {
            setModalActive(false);
            setSelectedReview(null);
          }}
          title="Review Details"
          primaryAction={{
            content: 'Close',
            onAction: () => {
              setModalActive(false);
              setSelectedReview(null);
            },
          }}
        >
          <Modal.Section>
            <BlockStack gap="400">
              <BlockStack gap="200">
                <Text variant="headingMd" as="h3">Product: {selectedReview.productTitle}</Text>
                <Text variant="bodyMd">Customer: {selectedReview.customerName} ({selectedReview.customerEmail})</Text>
                <Text variant="bodyMd">Date: {selectedReview.date}</Text>
                <InlineStack gap="100" align="center">
                  <Text variant="bodyMd">Rating:</Text>
                  <InlineStack gap="050">
                    {renderStars(selectedReview.rating)}
                  </InlineStack>
                  <Text variant="bodyMd">({selectedReview.rating}/5)</Text>
                </InlineStack>
                <Badge tone={
                  selectedReview.status === 'published' ? 'success' : 
                  selectedReview.status === 'pending' ? 'attention' : 'critical'
                }>
                  {selectedReview.status}
                </Badge>
              </BlockStack>
              
              <BlockStack gap="200">
                <Text variant="headingMd" as="h3">Comment</Text>
                <TextContainer>
                  <Text variant="bodyMd">{selectedReview.comment}</Text>
                </TextContainer>
              </BlockStack>

              {selectedReview.status === 'pending' && (
                <InlineStack gap="200">
                  <Button 
                    variant="primary"
                    onClick={() => {
                      handleSingleAction('approve', selectedReview.id);
                      setModalActive(false);
                      setSelectedReview(null);
                    }}
                  >
                    Approve Review
                  </Button>
                  <Button 
                    tone="critical"
                    onClick={() => {
                      handleSingleAction('reject', selectedReview.id);
                      setModalActive(false);
                      setSelectedReview(null);
                    }}
                  >
                    Reject Review
                  </Button>
                </InlineStack>
              )}
            </BlockStack>
          </Modal.Section>
        </Modal>
      )}
    </Page>
  );
}