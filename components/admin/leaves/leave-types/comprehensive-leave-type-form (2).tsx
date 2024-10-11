"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

const leaveTypeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must not exceed 50 characters"),
  description: z.string().max(200, "Description must not exceed 200 characters").optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"),
  accrualRate: z.number().min(0, "Accrual rate must be non-negative"),
  accrualFrequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  maxAccrual: z.number().min(0, "Maximum accrual must be non-negative"),
  carryOver: z.number().min(0, "Carry over must be non-negative"),
  paidLeave: z.boolean(),
  payRate: z.number().min(0, "Pay rate must be non-negative").optional(),
  payRateFrequency: z.enum(["hourly", "daily", "weekly", "monthly", "annually"]).optional(),
  affectsOvertime: z.boolean(),
  requiresApproval: z.boolean(),
  minDuration: z.number().min(0, "Minimum duration must be non-negative"),
  maxDuration: z.number().min(0, "Maximum duration must be non-negative"),
  noticeRequired: z.number().min(0, "Notice required must be non-negative"),
  applicableToEmployeeTypes: z.array(z.string()).min(1, "Select at least one employee type"),
  proRatedForPartTime: z.boolean(),
  allowNegativeBalance: z.boolean(),
  attachmentRequired: z.boolean(),
}).refine((data) => {
  if (data.paidLeave && (data.payRate === undefined || data.payRate === null)) {
    return false;
  }
  return true;
}, {
  message: "Pay rate is required for paid leave",
  path: ["payRate"],
}).refine((data) => {
  if (data.paidLeave && !data.payRateFrequency) {
    return false;
  }
  return true;
}, {
  message: "Pay rate frequency is required for paid leave",
  path: ["payRateFrequency"],
});

type LeaveTypeForm = z.infer<typeof leaveTypeSchema>

const employeeTypes = [
  { id: "fullTime", label: "Full-time" },
  { id: "partTime", label: "Part-time" },
  { id: "contract", label: "Contract" },
  { id: "temporary", label: "Temporary" },
  { id: "intern", label: "Intern" },
] as const;

export default function ComprehensiveLeaveTypeForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<LeaveTypeForm>({
    resolver: zodResolver(leaveTypeSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#000000",
      accrualRate: 0,
      accrualFrequency: "monthly",
      maxAccrual: 0,
      carryOver: 0,
      paidLeave: true,
      payRate: 0,
      payRateFrequency: "hourly",
      affectsOvertime: false,
      requiresApproval: true,
      minDuration: 0,
      maxDuration: 0,
      noticeRequired: 0,
      applicableToEmployeeTypes: ["fullTime"],
      proRatedForPartTime: false,
      allowNegativeBalance: false,
      attachmentRequired: false,
    },
  })

  const onSubmit = async (data: LeaveTypeForm) => {
    setIsSubmitting(true)
    try {
      // Simulating an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("Form data submitted:", data)
      toast({
        title: "Success",
        description: "Leave type has been added successfully.",
      })
      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while adding the leave type.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const watchPaidLeave = form.watch("paidLeave")

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Comprehensive Leave Type Form</CardTitle>
        <CardDescription>Create a new type of leave with detailed payroll information.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Vacation, Sick Leave" {...field} />
                    </FormControl>
                    <FormDescription>The name of the leave type.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input type="color" {...field} className="w-12 h-12 p-1 rounded-md" />
                        <Input {...field} placeholder="#000000" className="flex-grow" />
                      </div>
                    </FormControl>
                    <FormDescription>Choose a color to represent this leave type.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Brief description of the leave type" {...field} />
                  </FormControl>
                  <FormDescription>Provide additional details about this leave type.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="accrualRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accrual Rate</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                    <FormDescription>Rate at which leave is accrued.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="accrualFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accrual Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>How often leave is accrued.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maxAccrual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Accrual</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                    <FormDescription>Maximum amount of leave that can be accrued.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="carryOver"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carry Over</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                    <FormDescription>Amount of leave that can be carried over to the next year.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="paidLeave"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Paid Leave</FormLabel>
                      <FormDescription>
                        Is this a paid leave type?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="affectsOvertime"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Affects Overtime</FormLabel>
                      <FormDescription>
                        Does this leave type affect overtime calculations?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requiresApproval"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Requires Approval</FormLabel>
                      <FormDescription>
                        Does this leave type require approval?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            {watchPaidLeave && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="payRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pay Rate</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Pay rate for this leave type.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="payRateFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pay Rate Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Frequency of the pay rate.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="minDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Duration (hours)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                    <FormDescription>Minimum duration of leave that can be taken.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxDuration"
                render={({ field }) => (
                  
                  <FormItem>
                    <FormLabel>Maximum Duration (hours)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                    <FormDescription>Maximum duration of leave that can be taken.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="noticeRequired"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notice Required (days)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormDescription>Notice required before taking leave.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="applicableToEmployeeTypes"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Applicable to Employee Types</FormLabel>
                    <FormDescription>
                      Select the employee types this leave applies to.
                    </FormDescription>
                  </div>
                  {employeeTypes.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="applicableToEmployeeTypes"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, item.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.id
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {item.label}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="proRatedForPartTime"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Pro-rated for Part-time</FormLabel>
                      <FormDescription>
                        Is this leave pro-rated for part-time employees?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="allowNegativeBalance"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Allow Negative Balance</FormLabel>
                      <FormDescription>
                        Can employees take this leave with a negative balance?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="attachmentRequired"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Attachment Required</FormLabel>
                      <FormDescription>
                        Is an attachment (e.g., medical certificate) required?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button type="submit" onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Leave Type"}
        </Button>
      </CardFooter>
    </Card>
  )
}