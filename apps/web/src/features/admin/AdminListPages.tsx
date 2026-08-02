import { useCallback } from "react";
import { api } from "../../lib/api";
import { AdminTablePage } from "./AdminTablePage";

export function AdminOrdersPage() {
  const load = useCallback(() => api.getAdminOrders(), []);
  return (
    <AdminTablePage
      title="Orders"
      load={load}
      columns={[
        { key: "id", label: "ID" },
        { key: "customerName", label: "Customer" },
        { key: "email", label: "Email" },
        { key: "total", label: "Total" },
        { key: "status", label: "Status" },
        { key: "itemCount", label: "Items" },
        { key: "createdAt", label: "Created" },
      ]}
    />
  );
}

export function AdminDonationsPage() {
  const load = useCallback(() => api.getAdminDonations(), []);
  return (
    <AdminTablePage
      title="Donations"
      load={load}
      columns={[
        { key: "donorName", label: "Donor" },
        { key: "type", label: "Type" },
        { key: "amount", label: "Amount" },
        { key: "receiptNumber", label: "Receipt" },
        { key: "status", label: "Status" },
        { key: "createdAt", label: "Created" },
      ]}
    />
  );
}

export function AdminAdoptionsPage() {
  const load = useCallback(() => api.getAdminAdoptions(), []);
  return (
    <AdminTablePage
      title="Adoptions"
      load={load}
      columns={[
        { key: "cowName", label: "Cow" },
        { key: "adopterName", label: "Adopter" },
        { key: "plan", label: "Plan" },
        { key: "amount", label: "Amount" },
        { key: "certificateId", label: "Certificate" },
        { key: "status", label: "Status" },
        { key: "createdAt", label: "Created" },
      ]}
    />
  );
}

export function AdminSubscriptionsPage() {
  const load = useCallback(() => api.getAdminSubscriptions(), []);
  return (
    <AdminTablePage
      title="Subscriptions"
      load={load}
      columns={[
        { key: "planName", label: "Plan" },
        { key: "customerName", label: "Customer" },
        { key: "email", label: "Email" },
        { key: "amountMonthly", label: "Monthly" },
        { key: "status", label: "Status" },
        { key: "nextDeliveryAt", label: "Next delivery" },
        { key: "createdAt", label: "Created" },
      ]}
    />
  );
}

export function AdminUsersPage() {
  const load = useCallback(() => api.getAdminUsers(), []);
  return (
    <AdminTablePage
      title="Users"
      load={load}
      columns={[
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "roles", label: "Roles" },
        { key: "isActive", label: "Active" },
      ]}
    />
  );
}

export function AdminPaymentsPage() {
  const load = useCallback(() => api.getAdminPayments(), []);
  return (
    <AdminTablePage
      title="Payments"
      load={load}
      columns={[
        { key: "purpose", label: "Purpose" },
        { key: "customerName", label: "Customer" },
        { key: "email", label: "Email" },
        { key: "amount", label: "Amount" },
        { key: "status", label: "Status" },
        { key: "razorpayPaymentId", label: "Razorpay ID" },
        { key: "entityType", label: "Entity" },
        { key: "createdAt", label: "Created" },
      ]}
    />
  );
}
