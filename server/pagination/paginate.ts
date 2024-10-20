import prisma from "@/prisma/prisma"; // Using the Prisma singleton

// A reusable function to handle pagination and return data along with pagination metadata
export async function getPaginatedData<T>(
    model: any,  // Prisma model (e.g., prisma.ref_leave_types)
    page: number = 1,  // Current page, defaults to 1
    perPage: number = 5,  // Items per page, defaults to 5
    whereCondition: any = {},  // Filtering condition, defaults to an empty object
    orderBy: any = { id: "asc" }  // Default ordering
): Promise<{
    data: T[],
    totalItems: number,
    totalPages: number,
    currentPage: number,
    perPage: number
}> {
    const skip = (page - 1) * perPage;  // Calculate the offset

    // Count total records based on the condition
    const totalItems = await model.count({
        where: whereCondition
    });

    // Fetch paginated data based on the condition and pagination parameters
    const data = await model.findMany({
        where: whereCondition,
        orderBy,
        take: perPage,
        skip
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / perPage);

    return {
        data,
        totalItems,
        totalPages,
        currentPage: page,
        perPage
    };
}
