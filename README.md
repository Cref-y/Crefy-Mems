# Crefy-Mems Campaign System Documentation

## 1. Overview of the Multi-Tenant Architecture

The Crefy-Mems platform has evolved from a single NFT minting application into a robust **multi-tenant campaign system**. This architecture allows multiple companies to register on the platform, each managing their own set of NFT campaigns.

**Key Architectural Features:**

*   **Multi-Tenancy:** Each company operates within its own isolated space, with distinct branding, campaigns, and (eventually) subdomains (e.g., `projectmocha.crefy.com`).
*   **Campaign-Centric Model:** The core of the platform revolves around "Campaigns." Each campaign is typically associated with a unique NFT smart contract and has its own set of rules, metadata, and minting lifecycle.
*   **Scalability:** Designed to support a growing number of companies and campaigns.
*   **Centralized Management (for Admins):** Platform administrators have oversight over all companies and campaigns.
*   **Company-Specific Management:** Company administrators can manage their own profile, branding, and campaigns.

This new architecture enables Crefy-Mems to serve as a versatile platform for businesses and organizations looking to leverage NFTs for marketing, engagement, proof of attendance, loyalty programs, and more.

## 2. Campaign Types and Use Cases

The platform supports various predefined campaign types, each tailored to specific use cases. Custom campaigns are also possible.

| Campaign Type           | Enum Value              | Description & Use Cases                                                                 |
| :---------------------- | :---------------------- | :-------------------------------------------------------------------------------------- |
| **University Tour**     | `UNIVERSITY_TOUR`       | Commemorative NFTs for attendees of university tours, workshops, or open days.          |
| **Crypto Conference**   | `CRYPTO_CONFERENCE`     | Proof-of-attendance (POAP) NFTs, speaker gifts, or exclusive access tokens for conferences. |
| **Anniversary**         | `ANNIVERSARY`           | Celebratory NFTs for company milestones, anniversaries, or special occasions.           |
| **Product Launch**      | `PRODUCT_LAUNCH`        | Early adopter NFTs, exclusive access to new products, or digital collectibles for launches. |
| **Community Reward**    | `COMMUNITY_REWARD`      | NFTs to reward active community members, contributors, or contest winners.              |
| **Loyalty Program**     | `LOYALTY_PROGRAM`       | Digital membership cards, tiered loyalty rewards, or exclusive perks via NFTs.          |
| **Limited Edition**     | `LIMITED_EDITION`       | Scarce digital collectibles, art drops, or exclusive merchandise-tied NFTs.             |
| **Custom**              | `CUSTOM`                | Flexible campaign type for unique use cases not covered by predefined templates.        |

These types help streamline campaign setup by providing relevant default configurations and categorizing campaigns for users.

## 3. API Documentation

The campaign system introduces new API endpoints for managing companies and campaigns. All API routes are located under `/app/api/`.

*(Note: The following examples use a mock database. In a production environment, actual database interactions would occur.)*

### 3.1. Company Management

#### `POST /api/companies`

*   **Description:** Creates a new company.
*   **Authentication:** Admin role required.
*   **Request Body:**
    ```json
    {
      "name": "Project Mocha",
      "slug": "projectmocha", // Optional, auto-generated if omitted
      "description": "Web3 solutions for universities.",
      "logo": "https://example.com/logo.png",
      "website": "https://projectmocha.com",
      "branding": {
        "primaryColor": "#8A2BE2",
        "bannerImage": "https://example.com/banner.png"
      },
      "adminAddress": "0xYourAdminWalletAddress",
      "contactEmail": "admin@projectmocha.com",
      "settings": {
        "allowPublicCampaigns": true,
        "maxCampaignsAllowed": 5
      }
    }
    ```
*   **Success Response (201 Created):**
    ```json
    {
      "id": "cuid_generated_id",
      "name": "Project Mocha",
      "slug": "projectmocha",
      // ...other fields as defined in Company type
      "createdAt": "2025-05-30T10:00:00.000Z",
      "updatedAt": "2025-05-30T10:00:00.000Z"
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Invalid input data.
    *   `401 Unauthorized`: User not authenticated or not an admin.
    *   `409 Conflict`: Company slug already exists.

#### `GET /api/companies`

*   **Description:** Lists all companies. Supports pagination and search.
*   **Authentication:** Admin role required.
*   **Query Parameters:**
    *   `page` (number, optional, default: 1): Page number for pagination.
    *   `limit` (number, optional, default: 10): Number of items per page.
    *   `search` (string, optional): Search term to filter companies by name or description.
*   **Success Response (200 OK):**
    ```json
    {
      "companies": [
        // Array of Company objects
      ],
      "pagination": {
        "total": 15,
        "page": 1,
        "limit": 10,
        "totalPages": 2
      }
    }
    ```

#### `GET /api/companies/[slug]`

*   **Description:** Retrieves a specific company by its slug, along with its campaigns.
*   **Authentication:**
    *   Public: If company allows public campaigns, limited public data is returned.
    *   Authorized: Full data for company admin or platform admin.
*   **Success Response (200 OK):**
    *   If authorized:
        ```json
        {
          "company": { /* Full Company object */ },
          "campaigns": [ /* Array of Campaign objects for this company */ ]
        }
        ```
    *   If public and allowed:
        ```json
        {
          "company": { /* Limited public Company object */ },
          "campaigns": [ /* Array of public, active Campaign objects */ ]
        }
        ```
*   **Error Responses:**
    *   `403 Forbidden`: Company not publicly accessible.
    *   `404 Not Found`: Company not found.

#### `PUT /api/companies/[slug]`

*   **Description:** Updates an existing company.
*   **Authentication:** Company admin or platform admin required.
*   **Request Body:** Partial `Company` object with fields to update.
    ```json
    {
      "description": "Updated description for Project Mocha.",
      "settings": {
        "analyticsEnabled": true
      }
    }
    ```
*   **Success Response (200 OK):** Updated `Company` object.
*   **Error Responses:**
    *   `400 Bad Request`: Invalid input data.
    *   `401 Unauthorized`: Insufficient permissions.
    *   `404 Not Found`: Company not found.

#### `DELETE /api/companies/[slug]`

*   **Description:** Deletes a company and all its associated campaigns.
*   **Authentication:** Platform admin role required.
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Company deleted successfully"
    }
    ```
*   **Error Responses:**
    *   `401 Unauthorized`: Insufficient permissions.
    *   `404 Not Found`: Company not found.

### 3.2. Campaign Management

#### `POST /api/campaigns`

*   **Description:** Creates a new campaign for a specified company.
*   **Authentication:** Company admin (for their company) or platform admin.
*   **Request Body:**
    ```json
    {
      "companyId": "cuid_company_id",
      "name": "University Tour Fall 2025",
      "slug": "uni-tour-fall-25", // Optional
      "description": "Exclusive NFTs for Fall 2025 university tour attendees.",
      "type": "UNIVERSITY_TOUR",
      "status": "DRAFT", // Or "ACTIVE", "SCHEDULED"
      "startDate": "2025-09-01T00:00:00.000Z",
      "endDate": "2025-12-15T23:59:59.000Z",
      "contractAddress": "0xNewContractAddress...",
      "contractNetwork": "11155111", // Sepolia
      "contractAbi": { /* ... ABI JSON ... */ },
      "nftConfig": {
        "name": "Fall Tour NFT",
        "symbol": "FALL25",
        "description": "A unique collectible from the Fall 2025 tour.",
        "metadataFormat": "ERC721",
        "attributes": [{ "traitType": "Season", "value": "Fall 2025" }],
        "revealType": "INSTANT",
        "transferable": true,
        "redeemable": false,
        "image": "https://example.com/nft-image.png"
      },
      "accessControl": {
        "accessType": "PUBLIC",
        "requiresEmail": true
      },
      "mintLimit": 1000,
      "mintLimitPerWallet": 1,
      "featuredImage": "https://example.com/campaign-feature.png",
      "templateId": "template-university-tour" // Optional
    }
    ```
*   **Success Response (201 Created):** Full `Campaign` object.
*   **Error Responses:**
    *   `400 Bad Request`: Invalid input data.
    *   `401 Unauthorized`: Insufficient permissions.
    *   `403 Forbidden`: Company campaign limit reached.
    *   `404 Not Found`: Company not found.
    *   `409 Conflict`: Campaign slug already exists for this company.

#### `GET /api/campaigns`

*   **Description:** Lists campaigns. Supports filtering by company, type, status, and search.
*   **Authentication:**
    *   Public: Returns public, active campaigns.
    *   Authorized (Company Admin/Platform Admin): Returns campaigns based on permissions.
*   **Query Parameters:**
    *   `page`, `limit`, `search` (similar to `/api/companies`)
    *   `companyId` (string, optional): Filter by company ID.
    *   `type` (CampaignType enum string, optional): Filter by campaign type.
    *   `status` (CampaignStatus enum string, optional): Filter by campaign status.
*   **Success Response (200 OK):**
    ```json
    {
      "campaigns": [
        // Array of Campaign objects
      ],
      "pagination": { /* ... */ }
    }
    ```

#### `GET /api/campaigns/templates`

*   **Description:** Lists available campaign templates.
*   **Authentication:** Authenticated user.
*   **Success Response (200 OK):**
    ```json
    {
      "templates": [
        // Array of CampaignTemplate objects
      ]
    }
    ```

#### Individual Campaign Routes (`/api/campaigns/[campaignId]`)

*   *(Note: These were not explicitly implemented in the provided code but are standard for CRUD operations. The following describes their typical behavior.)*
*   **`GET /api/campaigns/[campaignId]`:** Retrieves a specific campaign.
*   **`PUT /api/campaigns/[campaignId]`:** Updates a specific campaign.
*   **`DELETE /api/campaigns/[campaignId]`:** Deletes a specific campaign.
    *   Authentication for these routes would typically require the campaign owner (company admin) or platform admin.

### 3.3. Access Control & Participation APIs

*   **`/api/campaigns/[campaignId]/participation?address=[userAddress]` (GET):**
    *   Fetches a user's participation details for a campaign (mint count, email verification status).
*   **`/api/campaigns/[campaignId]/participation/verify-email` (POST):**
    *   Body: `{ "address": "0xUserAddress", "email": "user@example.com" }`
    *   Initiates or confirms email verification for a user in a campaign.
*   **`/api/campaigns/[campaignId]/verify-code` (POST):**
    *   Body: `{ "address": "0xUserAddress", "code": "ACCESS_CODE_123" }`
    *   Verifies an access code for a user in a campaign.

## 4. Company Setup and Configuration

Companies are the top-level entities in the platform.

**Setup Process:**

1.  **Creation (Admin Task):** A platform administrator creates a new company via the `POST /api/companies` endpoint.
    *   Essential information includes company name, admin wallet address, and initial settings.
    *   A unique `slug` is generated (e.g., `project-mocha`) for URL identification.
2.  **Configuration (Company Admin):** Once created, the company admin can update their company's details via `PUT /api/companies/[slug]`.
    *   **Branding:**
        *   `primaryColor`, `secondaryColor`, `accentColor`: Customize UI theme.
        *   `fontFamily`: Set a custom font.
        *   `bannerImage`, `logoImage`: Upload visual assets.
        *   `customCSS`: Advanced styling options.
    *   **Settings:**
        *   `allowPublicCampaigns`: Controls if the company's page and active campaigns are visible to the public.
        *   `requireEmailVerification` (global default): Default email verification setting for new campaigns.
        *   `maxCampaignsAllowed`: Limit on the number of campaigns.
        *   `customDomain` (future): Potential for mapping `yourcompany.com` instead of `yourcompany.crefy.com`.
        *   `analyticsEnabled`: Toggle analytics tracking.
        *   `defaultMintLimit`: Default mint limit per wallet for new campaigns.

## 5. Campaign Creation and Management

Company admins can create and manage multiple NFT campaigns.

**Creation Process:**

1.  **Initiation:** Campaigns are created via `POST /api/campaigns`.
2.  **Company Association:** Each campaign must be linked to a `companyId`.
3.  **Basic Details:** Name, description, type (`CampaignType`), start/end dates.
4.  **Contract Information:**
    *   `contractAddress`: The address of the deployed NFT smart contract for this campaign.
    *   `contractNetwork`: Chain ID (e.g., "1" for Ethereum Mainnet, "11155111" for Sepolia).
    *   `contractAbi`: The ABI of the smart contract.
5.  **NFT Configuration (`nftConfig`):**
    *   Details about the NFT itself: name, symbol, description, metadata format.
    *   `attributes`: Array of `NFTAttribute` objects (e.g., `{"traitType": "Event", "value": "Conference 2025"}`).
    *   Media: `image`, `animation`, `externalUrl`.
    *   `revealType`: `INSTANT` or `DELAYED` (with `revealDate`).
    *   `transferable`: Boolean, if the NFT can be traded.
    *   `redeemable`: Boolean, if the NFT has redemption utility.
6.  **Access Control (`accessControl`):**
    *   `accessType`: `PUBLIC`, `PRIVATE`, or `ALLOWLIST`.
    *   `allowlist`: Array of wallet addresses for `ALLOWLIST` type.
    *   `requiresEmail`: Boolean, if email verification is needed to mint.
    *   `requiresCode`: Boolean, if an access code is needed.
    *   `codes`: Array of `CampaignCode` objects if `requiresCode` is true.
7.  **Minting Limits:**
    *   `mintLimit`: Total number of NFTs that can be minted in the campaign.
    *   `mintLimitPerWallet`: Maximum number of NFTs a single wallet can mint.
8.  **Visuals:** `featuredImage`, `bannerImage`, `galleryImages`.
9.  **Templates (`templateId`):** Optionally, a `templateId` (e.g., `template-university-tour`) can be provided to pre-fill many campaign settings based on a chosen template.

**Management:**

*   **Status (`CampaignStatus`):** Campaigns progress through statuses:
    *   `DRAFT`: Initial state, not visible or mintable.
    *   `SCHEDULED`: Set to go live at `startDate`.
    *   `ACTIVE`: Live and mintable (if within dates and limits).
    *   `PAUSED`: Temporarily suspended by the admin.
    *   `COMPLETED`: Campaign duration ended or mint limit reached.
    *   `CANCELLED`: Terminated prematurely.
*   **Updates:** Campaign details can be updated via `PUT /api/campaigns/[campaignId]`.
*   **Monitoring:** Admins can track `totalMinted` against `mintLimit`.

## 6. Access Control and Redemption Features

### Access Control

The platform offers granular control over who can participate in campaigns:

*   **`accessType`:**
    *   `PUBLIC`: Open to anyone with a compatible wallet.
    *   `PRIVATE`: Not listed publicly; access might be through direct links or specific conditions (potentially combined with other controls).
    *   `ALLOWLIST`: Only wallets specified in the `allowlist` array can mint.
*   **Email Verification (`requiresEmail`):**
    *   If true, users must verify their email address before minting.
    *   The UI prompts for email, sends a (mock) verification code, and the user enters the code.
    *   API: `POST /api/campaigns/[campaignId]/participation/verify-email`.
*   **Access Codes (`requiresCode`):**
    *   If true, users need a valid access code to mint.
    *   `codes` array in `CampaignAccessControl` stores codes with `maxUses`.
    *   The UI prompts for an access code.
    *   API: `POST /api/campaigns/[campaignId]/verify-code`.

These controls can be combined (e.g., an allowlisted campaign that also requires email verification).

### Redemption Features

*   **`redeemable` (boolean in `NFTConfiguration`):** If true, the NFT minted from the campaign has a redemption utility.
*   **UI Flow:**
    1.  After successfully minting a redeemable NFT, the user is presented with an option to "Redeem NFT" (e.g., in the NFT details dialog).
    2.  A redemption dialog appears, potentially asking for additional information (e.g., shipping address, preferences via a textarea).
    3.  Upon submission, a (mock) redemption request is made.
*   **Backend Logic (Conceptual):**
    *   The platform would need to record redemption status for each token.
    *   An interface for campaign organizers to view and manage redemption requests would be necessary.
    *   Integration with external systems might be needed depending on the nature of the redemption (e.g., shipping, digital access).

## 7. UI/UX Improvements and Navigation

The UI has been significantly revamped to support the new campaign system:

*   **Homepage (`app/page.tsx`):**
    *   **Hero Section:** Modernized with clear calls to action ("Connect to Start", "Explore Campaigns").
    *   **Platform Stats:** Displays key metrics like total campaigns, companies, NFTs minted, and active users.
    *   **Campaign Discovery:**
        *   Search bar and type filters for campaigns.
        *   Sections for "Featured Campaigns," "Company Spotlight," and "Trending Now."
        *   Uses `CampaignCard` and `CompanyCard` components for visually appealing listings.
    *   **User Dashboard (if connected):** Links to the user's NFT collection and management tools (retains parts of the original minting UI for individual use if desired).
    *   **CTA for Campaign Creation:** Encourages users/companies to create their own campaigns.
*   **App Navigation (`components/app-navigation.tsx`):**
    *   Persistent floating header with logo, site name, and navigation links (Home, Gallery, About - though Gallery/About pages are conceptual at this stage).
    *   Displays connected wallet status (ENS name/address, avatar).
    *   Includes a theme toggle.
    *   Responsive mobile menu with a slide-out drawer.
*   **Company Page (`app/company/[slug]/page.tsx`):**
    *   Dynamically displays information for a specific company based on its `slug`.
    *   Company banner, logo, name, description, and website.
    *   Lists campaigns associated with the company, with filtering options (search, type, status).
    *   Uses `CampaignCard` to display each campaign.
    *   Applies company-specific branding (colors) if configured.
*   **Campaign Minting Page (`app/company/[slug]/campaign/[campaignSlug]/page.tsx`):**
    *   Detailed view for an individual campaign.
    *   Campaign header: type, status, name, dates, mint limits.
    *   Campaign media: banner/featured image, gallery.
    *   Tabs for "Details," "NFT Info," and "Contract."
        *   **Details:** Minting progress, start/end dates, mint limits, redeemable status.
        *   **NFT Info:** NFT name, symbol, description, attributes (using `AttributeTag`), preview image, transferability.
        *   **Contract:** Contract address (with copy), network, Etherscan link.
    *   **Minting Interface:**
        *   Handles wallet connection, network switching.
        *   Implements access control checks (email verification, code verification, allowlist - UI components `EmailVerification`, `AccessCodeVerification`).
        *   Quantity selector for minting.
        *   Displays user's mint count and remaining mints for the campaign.
        *   Shows minting progress, success/error states, transaction hash.
        *   Dialogs for "View Minted NFT" and "Redeem NFT" (if applicable).
    *   Includes a "Share Campaign" button.
    *   Displays a card with information about the host company.
*   **Loading States & Skeletons:** Implemented across pages for better UX during data fetching.
*   **Responsive Design:** All new pages and components are designed to be mobile-friendly.

## 8. Integration with Existing Minting System

The new campaign system builds upon and extends the existing NFT minting capabilities:

*   **Core Minting Logic:** The underlying hooks (`useMintNFT`, `useAddressInfo`, `useContractInfo`) and Web3 setup (`wagmiConfig`) are still relevant. However, they now need to be adapted to handle dynamic contract addresses and ABIs based on the selected campaign.
    *   The `CONTRACT_CONFIG` in `config/contract.ts` which previously pointed to a single, globally defined contract, will now serve as a fallback or example. Actual minting operations on campaign pages will use the `contractAddress` and `contractAbi` stored within the `Campaign` object.
*   **NFTMinter Component:** The `NFTMinter` component, previously central to the app, can still be used for:
    1.  A user's personal/default minting dashboard if they are not interacting with a specific campaign.
    2.  As a basis for the minting logic within the new campaign-specific minting UI, but adapted to take campaign-specific contract details as props.
*   **WalletConnection Component:** Remains crucial and is used across the new UI for connecting wallets.
*   **NFTGallery Component:** Can be enhanced to show NFTs minted across various campaigns the user participated in, potentially with filtering by campaign.
*   **API Routes:** Existing API routes like `/api/nft/token-uri` are still useful but will need to accept `contractAddress` dynamically.

**Key Integration Points:**

1.  **Dynamic Contract Interaction:** Minting functions and contract read operations on campaign pages must use the `contractAddress` and `contractAbi` from the specific `Campaign` object being viewed, rather than a single global contract.
2.  **User Participation Tracking:** The system now needs to track user mints *per campaign*.
3.  **UI Adaptation:** The minting UI on the campaign page is a specialized version, tailored to the specific campaign's rules and NFT details.

## 9. Future Roadmap and Extension Points

The current implementation provides a strong foundation. Future enhancements could include:

*   **Advanced Analytics Dashboard:** Detailed analytics for companies on campaign performance, mint trends, user demographics.
*   **Subdomain Management:** Fully automated setup for `company.crefy.com` subdomains.
*   **Custom Domain Mapping:** Allow companies to use their own domains.
*   **More Campaign Templates:** Expand the library of predefined templates.
*   **NFT Staking/Utility:** Allow companies to define utility for NFTs beyond redemption (e.g., access, voting).
*   **Secondary Market Integration:** Links or information about listing minted NFTs on marketplaces.
*   **Batch Minting/Airdrops:** Tools for companies to airdrop NFTs or allow batch minting.
*   **Enhanced Smart Contract Factory:** A system for companies to deploy new NFT contracts directly from the platform using predefined, audited templates.
*   **Payment Gateway Integration:** For campaigns that might charge for minting (beyond gas fees).
*   **Team Collaboration:** Allow multiple users from a company to manage campaigns.
*   **API for Developers:** Public API for third-party integrations.
*   **Deeper Social Media Integration:** For promoting campaigns.
*   **Gamification:** Leaderboards, badges for participation.

This campaign system transforms Crefy-Mems into a powerful and flexible platform for a wide range of NFT-based initiatives.
