// app/api/employeemanagement/privileges/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const privilegeSchema = z.object({
  name: z.string().min(1).max(45),
  accessibility: z.any(),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date())
});

function handleError(error: unknown, operation: string) {
  console.error(`Error during ${operation} operation:`, error);
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 400 });
  }
  return NextResponse.json({ error: `Failed to ${operation} privilege` }, { status: 500 });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  try {
    let result;
    if (id) {
      result = await prisma.sys_privileges.findFirstOrThrow({
        where: { id: parseInt(id) },
        include: { acl_user_access_control: true }
      });
    } else {
      result = await prisma.sys_privileges.findMany({
        include: { acl_user_access_control: true },
        orderBy: [
          { updated_at: 'desc' },
          { created_at: 'desc' }
        ]
      });
    }
    return NextResponse.json(result);
  } catch (error) {
    return handleError(error, 'fetch');
  }
}