import { useLoaderData, useFetcher, useActionData } from "@remix-run/react";
import { useState, useCallback } from "react";
import {
  Button,
  Card,
  Layout,
  Page,
  Text,
  BlockStack,
  InlineStack,
  TextField,
  Select,
  Checkbox,
  RadioButton,
  RangeSlider,
  Divider,
  Banner,
  ChoiceList,
  FormLayout,
  LegacyCard,
  SettingToggle,
  TextContainer,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  // Mock current settings - in real app, fetch from database
  const currentSettings = {
    // Review Collection Settings
    reviewsEnabled: true,
    autoApprove: false,
    allowAnonymous: true,
    minCharacters: 10,
    maxCharacters: 500,
    requireRating: true,
    requireComment: true,
    
    // Display Settings
    showRatings: true,
    displayOrder: 'newest',
    reviewsPerPage: 5,
    showReviewerName: true,
    showReviewDates: true,
    enableHelpfulVoting: true,
    
    // Moderation Settings
    profanityFilter: true,
    keywordFilter: ['spam', 'fake'],
    autoReject: false,
    reviewDelay: 0,
    
    // Email Settings
    sendReviewRequests: true,
    emailTiming: 7,
    reviewRequestTemplate: 'default',
    responseNotifications: true,
    
    // Integration Settings
    googleReviews: false,
    schemaMarkup: true,
    showWidgets: false,
  };

  return { settings: currentSettings };
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  
  // Extract all form data
  const settings = Object.fromEntries(formData);
  
  // In real app, save to database
  console.log("Saving settings:", settings);
  
  return { success: true, message: "Settings saved successfully!" };
};

export default function Settings() {
  const { settings } = useLoaderData();
  const fetcher = useFetcher();
  const actionData = useActionData();
  
  // Review Collection Settings
  const [reviewsEnabled, setReviewsEnabled] = useState(settings.reviewsEnabled);
  const [autoApprove, setAutoApprove] = useState(settings.autoApprove);
  const [allowAnonymous, setAllowAnonymous] = useState(settings.allowAnonymous);
  const [minCharacters, setMinCharacters] = useState(settings.minCharacters);
  const [maxCharacters, setMaxCharacters] = useState(settings.maxCharacters);
  const [requireRating, setRequireRating] = useState(settings.requireRating);
  const [requireComment, setRequireComment] = useState(settings.requireComment);
  
  // Display Settings
  const [showRatings, setShowRatings] = useState(settings.showRatings);
  const [displayOrder, setDisplayOrder] = useState(settings.displayOrder);
  const [reviewsPerPage, setReviewsPerPage] = useState(settings.reviewsPerPage);
  const [showReviewerName, setShowReviewerName] = useState(settings.showReviewerName);
  const [showReviewDates, setShowReviewDates] = useState(settings.showReviewDates);
  const [enableHelpfulVoting, setEnableHelpfulVoting] = useState(settings.enableHelpfulVoting);
  
  // Moderation Settings
  const [profanityFilter, setProfanityFilter] = useState(settings.profanityFilter);
  const [keywordFilter, setKeywordFilter] = useState(settings.keywordFilter.join(', '));
  const [autoReject, setAutoReject] = useState(settings.autoReject);
  const [reviewDelay, setReviewDelay] = useState(settings.reviewDelay);
  
  // Email Settings
  const [sendReviewRequests, setSendReviewRequests] = useState(settings.sendReviewRequests);
  const [emailTiming, setEmailTiming] = useState(settings.emailTiming);
  const [reviewRequestTemplate, setReviewRequestTemplate] = useState(settings.reviewRequestTemplate);
  const [responseNotifications, setResponseNotifications] = useState(settings.responseNotifications);
  
  // Integration Settings
  const [googleReviews, setGoogleReviews] = useState(settings.googleReviews);
  const [schemaMarkup, setSchemaMarkup] = useState(settings.schemaMarkup);
  const [showWidgets, setShowWidgets] = useState(settings.showWidgets);

  const handleSave = () => {
    const formData = new FormData();
    
    // Add all settings to form data
    formData.append('reviewsEnabled', reviewsEnabled);
    formData.append('autoApprove', autoApprove);
    formData.append('allowAnonymous', allowAnonymous);
    formData.append('minCharacters', minCharacters);
    formData.append('maxCharacters', maxCharacters);
    formData.append('requireRating', requireRating);
    formData.append('requireComment', requireComment);
    formData.append('showRatings', showRatings);
    formData.append('displayOrder', displayOrder);
    formData.append('reviewsPerPage', reviewsPerPage);
    formData.append('showReviewerName', showReviewerName);
    formData.append('showReviewDates', showReviewDates);
    formData.append('enableHelpfulVoting', enableHelpfulVoting);
    formData.append('profanityFilter', profanityFilter);
    formData.append('keywordFilter', keywordFilter);
    formData.append('autoReject', autoReject);
    formData.append('reviewDelay', reviewDelay);
    formData.append('sendReviewRequests', sendReviewRequests);
    formData.append('emailTiming', emailTiming);
    formData.append('reviewRequestTemplate', reviewRequestTemplate);
    formData.append('responseNotifications', responseNotifications);
    formData.append('googleReviews', googleReviews);
    formData.append('schemaMarkup', schemaMarkup);
    formData.append('showWidgets', showWidgets);
    
    fetcher.submit(formData, { method: "post" });
  };

  return (
    <Page 
      fullWidth 
      title="Review Settings" 
      backAction={{content: 'Dashboard', url: '/app'}}
      primaryAction={{
        content: 'Save Settings',
        onAction: handleSave,
        loading: fetcher.state === 'submitting'
      }}
    >
      <Layout>
        {actionData?.success && (
          <Layout.Section>
            <Banner status="success" onDismiss={() => {}}>
              <p>{actionData.message}</p>
            </Banner>
          </Layout.Section>
        )}

        {/* Review Collection Settings */}
        <Layout.Section>
          <LegacyCard sectioned title="Review Collection Settings">
            <BlockStack gap="400">
              <SettingToggle
                action={{
                  content: reviewsEnabled ? 'Disable' : 'Enable',
                  onAction: () => setReviewsEnabled(!reviewsEnabled),
                }}
                enabled={reviewsEnabled}
              >
                <TextContainer>
                  <Text variant="headingMd" as="h3">Enable Reviews</Text>
                  <Text variant="bodyMd" tone="subdued">
                    Allow customers to leave reviews on your products
                  </Text>
                </TextContainer>
              </SettingToggle>

              <Divider />

              <FormLayout>
                <SettingToggle
                  action={{
                    content: autoApprove ? 'Require approval' : 'Auto-approve',
                    onAction: () => setAutoApprove(!autoApprove),
                  }}
                  enabled={autoApprove}
                >
                  <TextContainer>
                    <Text variant="headingMd" as="h3">Auto-approve Reviews</Text>
                    <Text variant="bodyMd" tone="subdued">
                      Automatically publish reviews without manual approval
                    </Text>
                  </TextContainer>
                </SettingToggle>

                <Checkbox
                  label="Allow anonymous reviews"
                  helpText="Let customers leave reviews without requiring login"
                  checked={allowAnonymous}
                  onChange={setAllowAnonymous}
                />

                <InlineStack gap="400">
                  <TextField
                    label="Minimum characters"
                    type="number"
                    value={minCharacters.toString()}
                    onChange={(value) => setMinCharacters(parseInt(value))}
                    helpText="Minimum review comment length"
                  />
                  <TextField
                    label="Maximum characters"
                    type="number"
                    value={maxCharacters.toString()}
                    onChange={(value) => setMaxCharacters(parseInt(value))}
                    helpText="Maximum review comment length"
                  />
                </InlineStack>

                <InlineStack gap="400">
                  <Checkbox
                    label="Require star rating"
                    checked={requireRating}
                    onChange={setRequireRating}
                  />
                  <Checkbox
                    label="Require written comment"
                    checked={requireComment}
                    onChange={setRequireComment}
                  />
                </InlineStack>
              </FormLayout>
            </BlockStack>
          </LegacyCard>
        </Layout.Section>

        {/* Display Settings */}
        <Layout.Section>
          <LegacyCard sectioned title="Display Settings">
            <FormLayout>
              <Checkbox
                label="Show star ratings on product pages"
                checked={showRatings}
                onChange={setShowRatings}
              />

              <Select
                label="Default review display order"
                options={[
                  { label: 'Newest first', value: 'newest' },
                  { label: 'Oldest first', value: 'oldest' },
                  { label: 'Highest rated first', value: 'highest' },
                  { label: 'Lowest rated first', value: 'lowest' },
                  { label: 'Most helpful first', value: 'helpful' },
                ]}
                value={displayOrder}
                onChange={setDisplayOrder}
              />

              <TextField
                label="Reviews per page"
                type="number"
                value={reviewsPerPage.toString()}
                onChange={(value) => setReviewsPerPage(parseInt(value))}
                helpText="Number of reviews to show per page"
              />

              <InlineStack gap="400">
                <Checkbox
                  label="Show reviewer names"
                  checked={showReviewerName}
                  onChange={setShowReviewerName}
                />
                <Checkbox
                  label="Show review dates"
                  checked={showReviewDates}
                  onChange={setShowReviewDates}
                />
                <Checkbox
                  label="Enable helpful/unhelpful voting"
                  checked={enableHelpfulVoting}
                  onChange={setEnableHelpfulVoting}
                />
              </InlineStack>
            </FormLayout>
          </LegacyCard>
        </Layout.Section>

        {/* Moderation Settings */}
        <Layout.Section>
          <LegacyCard sectioned title="Moderation Settings">
            <FormLayout>
              <Checkbox
                label="Enable profanity filter"
                helpText="Automatically flag reviews with inappropriate language"
                checked={profanityFilter}
                onChange={setProfanityFilter}
              />

              <TextField
                label="Keyword filter"
                value={keywordFilter}
                onChange={setKeywordFilter}
                helpText="Comma-separated list of words to flag (e.g., spam, fake, bot)"
                placeholder="spam, fake, bot"
              />

              <Checkbox
                label="Auto-reject flagged reviews"
                helpText="Automatically reject reviews that match filters instead of flagging for review"
                checked={autoReject}
                onChange={setAutoReject}
              />

              <Select
                label="Review publication delay"
                options={[
                  { label: 'Publish immediately', value: '0' },
                  { label: '1 hour delay', value: '1' },
                  { label: '24 hour delay', value: '24' },
                  { label: '48 hour delay', value: '48' },
                  { label: '1 week delay', value: '168' },
                ]}
                value={reviewDelay.toString()}
                onChange={(value) => setReviewDelay(parseInt(value))}
                helpText="Delay before publishing approved reviews"
              />
            </FormLayout>
          </LegacyCard>
        </Layout.Section>

        {/* Email Settings */}
        <Layout.Section>
          <LegacyCard sectioned title="Email Settings">
            <FormLayout>
              <SettingToggle
                action={{
                  content: sendReviewRequests ? 'Disable' : 'Enable',
                  onAction: () => setSendReviewRequests(!sendReviewRequests),
                }}
                enabled={sendReviewRequests}
              >
                <TextContainer>
                  <Text variant="headingMd" as="h3">Send Review Request Emails</Text>
                  <Text variant="bodyMd" tone="subdued">
                    Automatically email customers asking for reviews after purchase
                  </Text>
                </TextContainer>
              </SettingToggle>

              <TextField
                label="Email timing (days after purchase)"
                type="number"
                value={emailTiming.toString()}
                onChange={(value) => setEmailTiming(parseInt(value))}
                helpText="How many days after purchase to send review request"
              />

              <Select
                label="Review request template"
                options={[
                  { label: 'Default template', value: 'default' },
                  { label: 'Friendly template', value: 'friendly' },
                  { label: 'Professional template', value: 'professional' },
                  { label: 'Custom template', value: 'custom' },
                ]}
                value={reviewRequestTemplate}
                onChange={setReviewRequestTemplate}
              />

              <Checkbox
                label="Send notifications when customers respond"
                helpText="Email notifications when customers reply to review requests"
                checked={responseNotifications}
                onChange={setResponseNotifications}
              />
            </FormLayout>
          </LegacyCard>
        </Layout.Section>

        {/* Integration Settings */}
        <Layout.Section>
          <LegacyCard sectioned title="Integration Settings">
            <FormLayout>
              <Checkbox
                label="Enable Google Reviews integration"
                helpText="Sync reviews with Google My Business"
                checked={googleReviews}
                onChange={setGoogleReviews}
              />

              <Checkbox
                label="Enable structured data markup"
                helpText="Add schema.org markup for better SEO"
                checked={schemaMarkup}
                onChange={setSchemaMarkup}
              />

              <Checkbox
                label="Show review widgets on other pages"
                helpText="Display review summaries on homepage, collection pages, etc."
                checked={showWidgets}
                onChange={setShowWidgets}
              />
            </FormLayout>
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
}