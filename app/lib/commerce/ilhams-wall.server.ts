export type IlhamsWallReview = {
  id: string;
  customerName: string;
  date: string;
  note: string;
  photo?: {
    altText?: string | null;
    height?: number | null;
    url: string;
    width?: number | null;
  } | null;
  productTitle: string;
  productUrl: string;
  styleSeed: number;
};

export type IlhamsWallPage = {
  endCursor?: string | null;
  hasNextPage: boolean;
  reviews: IlhamsWallReview[];
  unavailableReason?: string;
};

export type EligibleReviewItem = {
  label: string;
  lineItemId: string;
  orderId: string;
  orderName: string;
  productTitle: string;
  targetValue: string;
};

export type EligibleReviewState = {
  customerDisplayName?: string | null;
  isLoggedIn: boolean;
  items: EligibleReviewItem[];
};

type WallEnv = {
  PRIVATE_SHOPIFY_ADMIN_API_TOKEN?: string;
  PUBLIC_STORE_DOMAIN?: string;
};

type CustomerAccountLike = {
  i18n: {language: string};
  isLoggedIn(): Promise<boolean>;
  query(
    query: string,
    options?: {variables?: Record<string, unknown>},
  ): Promise<any>;
};

type AdminGraphqlResponse<T> = {
  data?: T;
  errors?: Array<{message?: string}>;
};

type MetaobjectNode = {
  fields?: Array<{
    key?: string | null;
    reference?: {
      __typename?: string;
      image?: {
        altText?: string | null;
        height?: number | null;
        url?: string | null;
        width?: number | null;
      } | null;
    } | null;
    value?: string | null;
  }> | null;
  handle?: string | null;
  id?: string | null;
  updatedAt?: string | null;
};

type CustomerOrder = {
  fulfillmentStatus?: string | null;
  fulfillments?: {
    nodes?: Array<{
      latestShipmentStatus?: string | null;
      status?: string | null;
    }> | null;
  } | null;
  id?: string | null;
  lineItems?: {
    nodes?: Array<{
      id?: string | null;
      title?: string | null;
      variantTitle?: string | null;
    }> | null;
  } | null;
  name?: string | null;
  processedAt?: string | null;
};

type AdminOrderLine = {
  orderName: string;
  productHandle?: string | null;
  productTitle: string;
  productUrl: string;
};

const METAOBJECT_TYPE = 'ilham_wall_review';
const WALL_REVIEW_LIMIT = 18;
const MAX_NOTE_LENGTH = 120;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export async function readIlhamsWallReviews({
  after,
  env,
  first = WALL_REVIEW_LIMIT,
}: {
  after?: string | null;
  env: WallEnv;
  first?: number;
}): Promise<IlhamsWallPage> {
  const response = await adminGraphqlRequest<{
    metaobjects?: {
      nodes?: MetaobjectNode[] | null;
      pageInfo?: {endCursor?: string | null; hasNextPage?: boolean | null};
    } | null;
  }>({
    env,
    query: ILHAMS_WALL_REVIEWS_QUERY,
    variables: {
      after: after || null,
      first: Math.min(Math.max(first, 1), 30),
      type: METAOBJECT_TYPE,
    },
    warnLabel: 'read ilhams wall reviews',
  });

  if (!response) {
    return {
      hasNextPage: false,
      reviews: [],
      unavailableReason:
        'The wall is being prepared. Approved customer notes will appear here soon.',
    };
  }

  if (response.errors?.length) {
    console.error('[ilhams-wall] Could not read approved wall reviews:', {
      errors: response.errors,
    });
    return {
      hasNextPage: false,
      reviews: [],
      unavailableReason:
        'The wall is being prepared. Approved customer notes will appear here soon.',
    };
  }

  const nodes = response.data?.metaobjects?.nodes ?? [];
  const approvedReviews = nodes
    .map(normalizeReviewMetaobject)
    .filter((review): review is IlhamsWallReview => Boolean(review));

  return {
    endCursor: response.data?.metaobjects?.pageInfo?.endCursor,
    hasNextPage: Boolean(response.data?.metaobjects?.pageInfo?.hasNextPage),
    reviews: approvedReviews,
  };
}

export async function loadEligibleReviewItems({
  customerAccount,
}: {
  customerAccount: CustomerAccountLike;
}): Promise<EligibleReviewState> {
  const isLoggedIn = await customerAccount.isLoggedIn();
  if (!isLoggedIn) {
    return {isLoggedIn: false, items: []};
  }

  const result = await customerAccount
    .query(ILHAMS_WALL_ELIGIBILITY_QUERY, {
      variables: {
        first: 20,
        language: customerAccount.i18n.language,
      },
    })
    .catch((error: Error) => {
      console.error('[ilhams-wall] Customer eligibility lookup failed:', error);
      return null;
    });

  const customer = result?.data?.customer;
  const customerDisplayName = formatCustomerDisplayName(
    customer?.firstName,
    customer?.lastName,
  );
  const items = ((customer?.orders?.nodes ?? []) as CustomerOrder[])
    .filter(isEligibleOrder)
    .flatMap((order) => normalizeEligibleItems(order));

  return {
    customerDisplayName,
    isLoggedIn: true,
    items,
  };
}

export async function submitIlhamsWallReview({
  customerAccount,
  env,
  formData,
}: {
  customerAccount: CustomerAccountLike;
  env: WallEnv;
  formData: FormData;
}) {
  const eligibility = await loadEligibleReviewItems({customerAccount});
  if (!eligibility.isLoggedIn) {
    return {
      message: 'Please sign in before sharing a wall note.',
      status: 401,
      submitted: false,
    };
  }

  const note = sanitizeNote(formData.get('note'));
  if (!note) {
    return {
      message: 'Please write a short note for the wall.',
      status: 400,
      submitted: false,
    };
  }

  if (String(formData.get('consent') ?? '') !== 'yes') {
    return {
      message: 'Please allow ilham to show your note/photo before submitting.',
      status: 400,
      submitted: false,
    };
  }

  const target = parseReviewTarget(formData.get('reviewTarget'));
  if (!target) {
    return {
      message: 'Please choose a delivered order piece.',
      status: 400,
      submitted: false,
    };
  }

  const eligibleItem = eligibility.items.find(
    (item) =>
      item.orderId === target.orderId && item.lineItemId === target.lineItemId,
  );
  if (!eligibleItem) {
    return {
      message: 'This piece is not available for a verified wall review yet.',
      status: 403,
      submitted: false,
    };
  }

  if (!hasAdminConfig(env)) {
    return {
      message:
        'Review storage is not available just now. Please try again later.',
      status: 503,
      submitted: false,
    };
  }

  const adminLine = await readAdminOrderLineItem({
    env,
    fallback: eligibleItem,
    lineItemId: eligibleItem.lineItemId,
    orderId: eligibleItem.orderId,
  });
  if (!adminLine) {
    return {
      message:
        'Could not verify this piece just now. Please try again later.',
      status: 503,
      submitted: false,
    };
  }

  const photo = normalizePhoto(formData.get('photo'));
  const photoFileId = photo
    ? await uploadReviewPhoto({
        alt: `Customer photo for ${adminLine.productTitle}`,
        env,
        file: photo,
      })
    : null;

  const created = await createPendingReview({
    env,
    review: {
      customerDisplayName:
        eligibility.customerDisplayName || 'ilham customer',
      lineItemId: eligibleItem.lineItemId,
      note,
      orderId: eligibleItem.orderId,
      orderName: adminLine.orderName || eligibleItem.orderName,
      photoFileId,
      productHandle: adminLine.productHandle,
      productTitle: adminLine.productTitle,
      productUrl: adminLine.productUrl,
      styleSeed: getStyleSeed(`${eligibleItem.orderId}:${eligibleItem.lineItemId}`),
    },
  });

  if (!created) {
    return {
      message: 'Could not save this wall note just now. Please try again later.',
      status: 503,
      submitted: false,
    };
  }

  return {
    message:
      'Your note is waiting for atelier approval. Thank you for sharing it.',
    status: 200,
    submitted: true,
  };
}

function normalizeReviewMetaobject(
  node: MetaobjectNode,
): IlhamsWallReview | null {
  const fields = new Map(
    (node.fields ?? [])
      .filter((field) => field.key)
      .map((field) => [field.key as string, field]),
  );
  const status = fields.get('status')?.value?.trim().toLowerCase();
  if (status !== 'approved') return null;

  const note = sanitizeNote(fields.get('note')?.value);
  const productTitle = fields.get('product_title')?.value?.trim();
  if (!note || !productTitle) return null;

  const photoReference = fields.get('photo')?.reference;
  const photoImage = photoReference?.image;

  return {
    id: node.id ?? node.handle ?? `${productTitle}-${note}`,
    customerName:
      fields.get('customer_display_name')?.value?.trim() || 'ilham customer',
    date: fields.get('reviewed_at')?.value || node.updatedAt || '',
    note,
    photo: photoImage?.url
      ? {
          altText: photoImage.altText,
          height: photoImage.height,
          url: photoImage.url,
          width: photoImage.width,
        }
      : null,
    productTitle,
    productUrl:
      fields.get('product_url')?.value?.trim() ||
      getFallbackProductUrl(productTitle),
    styleSeed: normalizeStyleSeed(fields.get('style_seed')?.value),
  };
}

function normalizeEligibleItems(order: CustomerOrder): EligibleReviewItem[] {
  const orderId = order.id;
  const orderName = order.name ?? 'Order';
  if (!orderId) return [];

  return (order.lineItems?.nodes ?? [])
    .filter((lineItem) => lineItem.id && lineItem.title)
    .map((lineItem) => {
      const productTitle = [
        lineItem.title,
        lineItem.variantTitle && lineItem.variantTitle !== 'Default Title'
          ? lineItem.variantTitle
          : '',
      ]
        .filter(Boolean)
        .join(' / ');

      return {
        label: `${productTitle} - ${orderName}`,
        lineItemId: lineItem.id as string,
        orderId,
        orderName,
        productTitle,
        targetValue: JSON.stringify({
          lineItemId: lineItem.id,
          orderId,
        }),
      };
    });
}

function isEligibleOrder(order: CustomerOrder) {
  const statuses = [
    order.fulfillmentStatus,
    ...(order.fulfillments?.nodes ?? []).flatMap((fulfillment) => [
      fulfillment.status,
      fulfillment.latestShipmentStatus,
    ]),
  ]
    .filter(Boolean)
    .map((status) => String(status).toUpperCase());

  return statuses.some((status) =>
    ['DELIVERED', 'FULFILLED', 'SUCCESS'].includes(status),
  );
}

async function readAdminOrderLineItem({
  env,
  fallback,
  lineItemId,
  orderId,
}: {
  env: WallEnv;
  fallback: EligibleReviewItem;
  lineItemId: string;
  orderId: string;
}) {
  const response = await adminGraphqlRequest<{
    order?: {
      lineItems?: {
        nodes?: Array<{
          id?: string | null;
          product?: {
            handle?: string | null;
            title?: string | null;
          } | null;
          title?: string | null;
        }> | null;
      } | null;
      name?: string | null;
    } | null;
  }>({
    env,
    query: ILHAMS_WALL_ADMIN_ORDER_QUERY,
    variables: {orderId},
    warnLabel: 'read ilhams wall order line',
  });

  if (!response?.data?.order) return null;

  const nodes = response.data.order.lineItems?.nodes ?? [];
  const line =
    nodes.find((item) => item.id === lineItemId) ??
    nodes.find((item) => item.title === fallback.productTitle);
  const productHandle = line?.product?.handle;
  const productTitle = line?.product?.title || line?.title || fallback.productTitle;

  return {
    orderName: response.data.order.name || fallback.orderName,
    productHandle,
    productTitle,
    productUrl: productHandle
      ? `/products/${productHandle}`
      : getFallbackProductUrl(productTitle),
  } satisfies AdminOrderLine;
}

async function createPendingReview({
  env,
  review,
}: {
  env: WallEnv;
  review: {
    customerDisplayName: string;
    lineItemId: string;
    note: string;
    orderId: string;
    orderName: string;
    photoFileId?: string | null;
    productHandle?: string | null;
    productTitle: string;
    productUrl: string;
    styleSeed: number;
  };
}) {
  const fields = [
    {key: 'status', value: 'pending'},
    {key: 'note', value: review.note},
    {key: 'customer_display_name', value: review.customerDisplayName},
    {key: 'reviewed_at', value: new Date().toISOString()},
    {key: 'product_title', value: review.productTitle},
    {key: 'product_url', value: review.productUrl},
    {key: 'product_handle', value: review.productHandle ?? ''},
    {key: 'order_id', value: review.orderId},
    {key: 'order_name', value: review.orderName},
    {key: 'line_item_id', value: review.lineItemId},
    {key: 'style_seed', value: String(review.styleSeed)},
    ...(review.photoFileId ? [{key: 'photo', value: review.photoFileId}] : []),
  ];

  const response = await adminGraphqlRequest<{
    metaobjectCreate?: {
      metaobject?: {id?: string | null} | null;
      userErrors?: Array<{field?: string[] | null; message?: string | null}> | null;
    } | null;
  }>({
    env,
    query: ILHAMS_WALL_CREATE_REVIEW_MUTATION,
    variables: {
      metaobject: {
        fields,
        handle: `wall-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        type: METAOBJECT_TYPE,
      },
    },
    warnLabel: 'create ilhams wall review',
  });

  const userErrors = response?.data?.metaobjectCreate?.userErrors ?? [];
  if (userErrors.length || response?.errors?.length) {
    console.error('[ilhams-wall] Shopify rejected wall review:', {
      errors: response?.errors,
      userErrors,
    });
    return false;
  }

  return Boolean(response?.data?.metaobjectCreate?.metaobject?.id);
}

async function uploadReviewPhoto({
  alt,
  env,
  file,
}: {
  alt: string;
  env: WallEnv;
  file: File;
}) {
  const staged = await adminGraphqlRequest<{
    stagedUploadsCreate?: {
      stagedTargets?: Array<{
        parameters?: Array<{name?: string | null; value?: string | null}> | null;
        resourceUrl?: string | null;
        url?: string | null;
      }> | null;
      userErrors?: Array<{field?: string[] | null; message?: string | null}> | null;
    } | null;
  }>({
    env,
    query: ILHAMS_WALL_STAGED_UPLOAD_MUTATION,
    variables: {
      input: [
        {
          filename: getSafeFileName(file),
          httpMethod: 'POST',
          mimeType: file.type || 'image/webp',
          resource: 'FILE',
        },
      ],
    },
    warnLabel: 'stage ilhams wall photo',
  });

  const target = staged?.data?.stagedUploadsCreate?.stagedTargets?.[0];
  if (!target?.url || !target.resourceUrl) {
    console.error('[ilhams-wall] Shopify did not return a staged upload target:', {
      userErrors: staged?.data?.stagedUploadsCreate?.userErrors,
    });
    return null;
  }

  const uploadForm = new FormData();
  for (const parameter of target.parameters ?? []) {
    if (parameter.name && parameter.value) {
      uploadForm.append(parameter.name, parameter.value);
    }
  }
  uploadForm.append('file', file, getSafeFileName(file));

  const uploadResponse = await fetch(target.url, {
    body: uploadForm,
    method: 'POST',
  });
  if (!uploadResponse.ok) {
    console.error('[ilhams-wall] Shopify staged photo upload failed:', {
      status: uploadResponse.status,
    });
    return null;
  }

  const created = await adminGraphqlRequest<{
    fileCreate?: {
      files?: Array<{id?: string | null} | null> | null;
      userErrors?: Array<{field?: string[] | null; message?: string | null}> | null;
    } | null;
  }>({
    env,
    query: ILHAMS_WALL_FILE_CREATE_MUTATION,
    variables: {
      files: [
        {
          alt,
          contentType: 'IMAGE',
          originalSource: target.resourceUrl,
        },
      ],
    },
    warnLabel: 'create ilhams wall photo file',
  });

  const userErrors = created?.data?.fileCreate?.userErrors ?? [];
  if (userErrors.length || created?.errors?.length) {
    console.error('[ilhams-wall] Shopify rejected wall photo file:', {
      errors: created?.errors,
      userErrors,
    });
    return null;
  }

  return created?.data?.fileCreate?.files?.find(Boolean)?.id ?? null;
}

async function adminGraphqlRequest<T>({
  env,
  query,
  variables,
  warnLabel,
}: {
  env: WallEnv;
  query: string;
  variables: Record<string, unknown>;
  warnLabel: string;
}): Promise<AdminGraphqlResponse<T> | null> {
  const shopDomain = normalizeShopDomain(env.PUBLIC_STORE_DOMAIN);
  const token = env.PRIVATE_SHOPIFY_ADMIN_API_TOKEN;
  if (!shopDomain || !token) return null;

  try {
    const response = await fetch(
      `https://${shopDomain}/admin/api/2026-04/graphql.json`,
      {
        body: JSON.stringify({query, variables}),
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': token,
        },
        method: 'POST',
      },
    );
    const payload = (await response.json().catch(() => ({}))) as
      | AdminGraphqlResponse<T>
      | {errors?: Array<{message?: string}>};

    if (!response.ok) {
      console.error(`[ilhams-wall] Shopify Admin request failed: ${warnLabel}`, {
        errors: payload.errors,
        status: response.status,
      });
      return null;
    }

    return payload as AdminGraphqlResponse<T>;
  } catch (error) {
    console.error(`[ilhams-wall] Shopify Admin request crashed: ${warnLabel}`, error);
    return null;
  }
}

function parseReviewTarget(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') return null;
  try {
    const parsed = JSON.parse(value) as {
      lineItemId?: unknown;
      orderId?: unknown;
    };
    if (
      typeof parsed.orderId !== 'string' ||
      typeof parsed.lineItemId !== 'string'
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function normalizePhoto(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size <= 0) return null;
  if (!/^image\/(jpeg|png|webp)$/i.test(value.type)) {
    throw new Error('Please upload a JPG, PNG, or WebP image.');
  }
  if (value.size > MAX_PHOTO_BYTES) {
    throw new Error('Please keep the photo under 5MB.');
  }
  return value;
}

function sanitizeNote(value: unknown) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_NOTE_LENGTH);
}

function normalizeStyleSeed(value?: string | null) {
  const seed = Number(value);
  if (Number.isFinite(seed)) return seed;
  return getStyleSeed(value || 'ilham-wall');
}

function getStyleSeed(value: string) {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) % 9973;
  }
  return hash;
}

function formatCustomerDisplayName(
  firstName?: string | null,
  lastName?: string | null,
) {
  const first = firstName?.trim();
  if (!first) return null;
  const lastInitial = lastName?.trim()?.[0];
  return lastInitial ? `${first} ${lastInitial}.` : first;
}

function getFallbackProductUrl(title: string) {
  return `/search?q=${encodeURIComponent(title)}`;
}

function getSafeFileName(file: File) {
  const extension = getFileExtension(file.type);
  return `ilham-wall-${Date.now()}.${extension}`;
}

function getFileExtension(mimeType?: string) {
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/jpeg') return 'jpg';
  return 'webp';
}

function hasAdminConfig(env: WallEnv) {
  return Boolean(normalizeShopDomain(env.PUBLIC_STORE_DOMAIN) && env.PRIVATE_SHOPIFY_ADMIN_API_TOKEN);
}

function normalizeShopDomain(domain?: string | null) {
  return (
    domain
      ?.trim()
      .replace(/^https?:\/\//i, '')
      .replace(/\/.*$/, '') || null
  );
}

const ILHAMS_WALL_ELIGIBILITY_QUERY = `
  query IlhamsWallEligibility($first: Int, $language: LanguageCode)
    @inContext(language: $language) {
    customer {
      firstName
      lastName
      orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          name
          fulfillmentStatus
          processedAt
          fulfillments(first: 5, sortKey: CREATED_AT) {
            nodes {
              status
              latestShipmentStatus
            }
          }
          lineItems(first: 50) {
            nodes {
              id
              title
              variantTitle
            }
          }
        }
      }
    }
  }
` as const;

const ILHAMS_WALL_REVIEWS_QUERY = `
  query IlhamsWallReviews($after: String, $first: Int!, $type: String!) {
    metaobjects(type: $type, first: $first, after: $after, sortKey: "updated_at", reverse: true) {
      nodes {
        id
        handle
        updatedAt
        fields {
          key
          value
          reference {
            __typename
            ... on MediaImage {
              image {
                altText
                height
                url
                width
              }
            }
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
` as const;

const ILHAMS_WALL_ADMIN_ORDER_QUERY = `
  query IlhamsWallAdminOrder($orderId: ID!) {
    order: node(id: $orderId) {
      ... on Order {
        id
        name
        lineItems(first: 100) {
          nodes {
            id
            title
            product {
              handle
              title
            }
          }
        }
      }
    }
  }
` as const;

const ILHAMS_WALL_CREATE_REVIEW_MUTATION = `
  mutation CreateIlhamsWallReview($metaobject: MetaobjectCreateInput!) {
    metaobjectCreate(metaobject: $metaobject) {
      metaobject {
        id
        handle
      }
      userErrors {
        field
        message
      }
    }
  }
` as const;

const ILHAMS_WALL_STAGED_UPLOAD_MUTATION = `
  mutation IlhamsWallStagedUpload($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        url
        resourceUrl
        parameters {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
` as const;

const ILHAMS_WALL_FILE_CREATE_MUTATION = `
  mutation IlhamsWallFileCreate($files: [FileCreateInput!]!) {
    fileCreate(files: $files) {
      files {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
` as const;
