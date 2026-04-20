# Room Rent System EZ

**Room Rent System EZ** is a modern, easy-to-use web application designed to manage room rentals efficiently. This system eliminates the need for manual tracking with Excel sheets and automates rent management, payments, and room availability tracking.

## Features

* **User Management**: Register and manage tenants easily.
* **Room Management**: Add, edit, and track room details and availability.
* **Rent Tracking**: Track rent payments by date and status.
* **Payment Management**: Integrate online payments and manage pending/paid statuses.
* **Dashboard**: Visual overview of rooms, tenants, and payment statuses.
* **Filter by Rent Date**: Easily filter payments and rentals by rent date.
* **Notifications**: Alerts for pending or overdue payments.

## Benefits

* No need for Excel – all data is digital and centralized.
* Faster rent tracking and payment updates.
* Organized and accessible data for admins and landlords.
* Reduces human error and manual work.

## Tech Stack

* **Frontend**: React.js
* **Backend**: Node.js / Express
* **Database**: MongoDB
* **Payment Integration**: Online QR payment systems (like KHQR)

## Installation

1. Clone the repository:

   ```bash
   git clone <repository_url>
   ```
2. Install dependencies for both frontend and backend:

   ```bash
   npm install
   ```
3. Set up `.env` for database and payment credentials.
4. Run the backend server:

   ```bash
   npm run dev
   ```
5. Run the frontend:

   ```bash
   npm start
   ```
6. Open the app in your browser at `http://localhost:3000`.

## Usage

* Admin can add rooms and tenants.
* Tenants’ rent payments can be recorded and tracked.
* Dashboard displays all rent statuses in one place.
* Reports and history can be filtered by rent date.

## Future Enhancements

* SMS/Email notifications for pending rent.
* Analytics and revenue reports.
* Multi-user roles (admin, manager, tenant).
