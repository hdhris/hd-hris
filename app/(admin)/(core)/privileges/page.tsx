import { useQuery } from "@/services/queries";
import React from "react";

export default function page() {
  const {} = useQuery('/api/admin/privilege');
  return (
    <div>

    </div>
  );
}
