"use client";
import { Form } from "@/components/ui/form";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  ScrollShadow,
} from "@nextui-org/react";
import React, { ReactElement, ReactNode, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import FormFields from "./FormFields";

type CardFormProps<T extends object> = {
  label: string;
  children?: ReactNode;
  form: UseFormReturn<T>;
  onSubmit: (values: any) => Promise<void>; // Use generic type T for values
};

function CardForm<T extends object>({
  children,
  label,
  form,
  onSubmit,
}: CardFormProps<T>) {
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(values: T) {
    // Use generic type T
    setIsPending(true);
    await onSubmit(values);
    setIsPending(false);
  }

  return (
    <Card className="h-full max-h-full mx-2 min-w-80 shadow-sm">
      <CardHeader>{label}</CardHeader>
      <CardBody className="pt-0 h-full">
        <ScrollShadow>
          <Form {...form}>
            <form id="card-form" onSubmit={form.handleSubmit(handleSubmit)}>
              {children}
            </form>
          </Form>
        </ScrollShadow>
      </CardBody>
      <CardFooter>
        <Button
          isLoading={isPending}
          color="primary"
          className="w-full"
          type="submit"
          form="card-form"
        >
          Submit
        </Button>
      </CardFooter>
    </Card>
  );
}

export default CardForm;
