// app/api/employeemanagement/employees/delete.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { handleError } from "./utils";

export async function softDeleteEmployee(id: number) {
  return await prisma.trans_employees.update({
    where: { id },
    data: { deleted_at: new Date() },
  });
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Employee ID is required" },
      { status: 400 }
    );
  }

  try {
    await softDeleteEmployee(parseInt(id));
    return NextResponse.json({ message: "Employee deleted successfully" });
  } catch (error) {
    return handleError(error, "delete");
  }
}