// import { NextRequest, NextResponse } from 'next/server';
// import prisma from '@/lib/prisma';
//
// export async function GET() {
//   try {
//     const employees = await prisma.employee.findMany();
//     return NextResponse.json(employees);
//   } catch (error) {
//     return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
//   }
// }
//
// export async function POST(request: NextRequest) {
//   try {
//     const data = await request.json();
//     const employee = await prisma.employee.create({ data });
//     return NextResponse.json(employee, { status: 201 });
//   } catch (error) {
//     return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
//   }
// }
//
// export async function PUT(request: NextRequest) {
//   try {
//     const { id, ...data } = await request.json();
//     const employee = await prisma.employee.update({
//       // where: { id: Number(id) },
//       data,
//     });
//     return NextResponse.json(employee);
//   } catch (error) {
//     return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
//   }
// }
//
// export async function DELETE(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get('id');
//     await prisma.employee.delete({
//       where: { id: Number(id) },
//     });
//     return NextResponse.json({ message: 'Employee deleted successfully' });
//   } catch (error) {
//     return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
//   }
// }