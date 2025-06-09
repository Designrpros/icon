
# `icon` Frontend Application

This is the frontend web application for the `icon` project, built with [Next.js](https://nextjs.org).

## 🚀 Project Overview

The `icon` frontend provides a user-friendly interface to discover and browse events. It features:

  * **Event Listings:** A searchable and filterable list of upcoming events.
  * **Event Calendar:** A calendar view to explore events by date.
  * **Event Map:** A map showing event venues and their upcoming events.

### Data Source

This frontend application **does not perform any web scraping directly**. Instead, it fetches all event data from a separate, self-hosted **`icon-backend` API service**. This backend service handles the heavy lifting of web scraping (using Playwright) and serves the latest event data via a public API endpoint.

## 💻 Getting Started (Local Development)

To run the `icon` frontend locally, you need to ensure your `icon-backend` API service is running and accessible from your development machine.

### Prerequisites

  * The **`icon-backend` service** must be running on your Ubuntu server (or wherever you've deployed it) and accessible via its public IP/DDNS and port (e.g., `http://51.175.105.40:3001`).
      * **Verify:** You should be able to open `http://your_backend_ip:3001/api/events` in your browser and see JSON data.

### Setup Steps

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/Designrpros/icon.git
    cd icon
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    # or yarn install
    ```

3.  **Configure Environment Variables for Local Development:**
    Create a file named `.env.local` in the root of this project (the same directory as `package.json`).

    ```bash
    # .env.local
    # This URL must point to your running icon-backend API server
    BACKEND_API_URL="http://your_backend_public_ip_or_ddns:3001"
    # Example: BACKEND_API_URL="http://51.175.105.40:3001"

    # Your Mapbox Public Access Token (for the Map page)
    NEXT_PUBLIC_MAPBOX_TOKEN="pk.eyJ1IjoidmVncyIsImEiOiJjbWJuZjB1b24xbmVyMmxxd2NkbmJ0dXdwIn0.4G_VuOrpMRkiimtUr4s27Q"
    ```

    Replace `your_backend_public_ip_or_ddns` with the actual public IP address or DDNS domain name of your `icon-backend` server.

4.  **Run the Development Server:**

    ```bash
    npm run dev
    # or yarn dev
    ```

5.  Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser to see the result. The page will auto-update as you edit the files.

## 🌐 Deployment (Vercel)

This Next.js application is designed to be deployed on the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

### Environment Variables for Vercel Deployment

For the deployed application to function correctly, you **must set the `BACKEND_API_URL` environment variable directly in your Vercel Project Settings**.

  * **Variable Name:** `BACKEND_API_URL`
  * **Variable Value:** `http://your_backend_public_ip_or_ddns:3001` (e.g., `http://51.175.105.40:3001`)
  * **Environments:** Ensure this variable is set for **Production**, **Preview**, and **Development** environments.

This ensures your Vercel-hosted frontend can reach your self-hosted `icon-backend` API.

## ✨ Learn More

To learn more about Next.js and Vercel, take a look at the following resources:

  * [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
  * [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
  * [Deploy on Vercel Documentation](https://nextjs.org/docs/app/building-your-application/deploying) - for more details on deploying Next.js apps.