
import { CouponsClient } from "@/components/admin/coupons-client";

// This page now relies entirely on the AdminDataProvider for its data.
// The data is fetched in the layout and passed down.
export default function CouponsPage() {
  return <CouponsClient />;
}
