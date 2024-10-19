"use client";
import { Form } from "@/components/ui/form";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  cn,
  ScrollShadow,
} from "@nextui-org/react";
import React, { ReactElement, ReactNode, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import FormFields from "./FormFields";

type CardFormProps<T extends object> = {
  label: string;
  children?: ReactNode;
  form: UseFormReturn<T>;
  className?: string;
  classNames?: {
    header?: string;
    body?: {
      wrapper?: string;
      form?: string;
    }
    footer?: string;
  }
  startButton?: {
    name: string;
    onClick: ()=> void;
  }
  onSubmit: (values: any) => Promise<void>; // Use generic type T for values
};

function CardForm<T extends object>({
  children,
  label,
  form,
  onSubmit,
  className,
  classNames,
  startButton,
}: CardFormProps<T>) {
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(values: T) {
    // Use generic type T
    setIsPending(true);
    await onSubmit(values);
    setIsPending(false);
  }

  return (
    <Card
      className={cn("h-full max-h-full mx-2 w-full min-w-80 shadow-sm", className)}
    >
      <CardHeader className={classNames?.header}>{label}</CardHeader>
      <CardBody className={cn('pt-0 h-full', classNames?.body?.wrapper)}>
        <ScrollShadow>
          <Form {...form}>
            <form id="card-form" onSubmit={form.handleSubmit(handleSubmit)} className={classNames?.body?.form}>
              {children}
            </form>
          </Form>
        </ScrollShadow>
      </CardBody>
      <CardFooter className={cn("flex gap-2", classNames?.footer)}>
        {startButton && <Button variant="light" onClick={startButton.onClick}>
          {startButton.name}
          </Button>}
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
