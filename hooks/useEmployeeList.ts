"use client";
import React from "react";
import { getEmpFullName } from "@/lib/utils/nameFormatter";

export type Employee = {
    id: number;
    name: string;
    picture: string;
    department: string;
};

export type UseEmployeeListProps = {
    fetchDelay?: number; // Optional delay before fetching more items
};

export function useEmployeeList({ fetchDelay = 0 }: UseEmployeeListProps = {}) {
    const [items, setItems] = React.useState<Employee[]>([]);
    const [hasMore, setHasMore] = React.useState(true);
    const [isLoading, setIsLoading] = React.useState(false);
    const [page, setPage] = React.useState(1); // Start at page 1
    const limit = 10; // Number of items per page

  

    React.useEffect(() => {
        const loadEmployees = async (currentPage: number) => {
            const controller = new AbortController();
            const { signal } = controller;

            try {
                setIsLoading(true);

                if (currentPage > 1) {
                    // Delay to simulate network latency if not the first page
                    await new Promise((resolve) => setTimeout(resolve, fetchDelay));
                }

                const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/employees?page=${currentPage}&limit=${limit}`;
                const res = await fetch(url, { signal });

                if (!res.ok) {
                    throw new Error("Network response was not ok");
                }

                const json = await res.json();

                const users = json.data.map((emp: any) => ({
                    id: emp.id,
                    name: getEmpFullName(emp),
                    picture: emp.picture,
                    department: emp.ref_departments.name,
                }));

                // Combine new users with existing ones and remove duplicates based on id
                setItems((prevItems) => {
                    const combined = [...prevItems, ...users];
                    return Array.from(new Map(combined.map(item => [item.id, item])).values()); // This will ensure that only unique items remain
                });

                // Update hasMore based on pagination
                setHasMore(json.meta.currentPage < json.meta.totalPages); // Check if there are more pages
            } catch (error: any) {
                if (error.name === "AbortError") {
                    console.log("Fetch aborted");
                } else {
                    console.error("Error:", error);
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadEmployees(page)
    }, [fetchDelay, page]);

    const onLoadMore = () => {
        if (hasMore) {
            setPage((prevPage) => prevPage + 1);
        }
    };

    return {
        items,
        hasMore,
        isLoading,
        onLoadMore,
    };
}
